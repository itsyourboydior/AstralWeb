class ShaderBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) {
            console.error('WebGL not supported by browser.');
            document.body.classList.add('no-webgl');
            return;
        }

        this.time = 0;
        this.resize();
        this.initShaders();
        this.initBuffers();
        this.setupUniforms();

        window.addEventListener('resize', () => this.resize());
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.render();
            } else {
                if (this._rafId) cancelAnimationFrame(this._rafId);
                this._rafId = null;
            }
        });
        
        // Handle WebGL context loss/restore
        this.canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            if (this._rafId) cancelAnimationFrame(this._rafId);
        }, false);

        this.canvas.addEventListener('webglcontextrestored', () => {
            this.initShaders();
            this.initBuffers();
            this.setupUniforms();
            this.render();
        }, false);

        this.render();
    }

    resize() {
        const clientWidth = this.canvas.clientWidth || window.innerWidth;
        const clientHeight = this.canvas.clientHeight || window.innerHeight;
        
        // Cap the device pixel ratio at 1.5 to save GPU cycles while keeping text dither crisp
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        
        let width = Math.round(clientWidth * dpr);
        let height = Math.round(clientHeight * dpr);
        
        // Cap absolute resolution to 1920px max dimension to prevent GPU lag on 4K screens
        const maxDimension = 1920;
        if (width > maxDimension || height > maxDimension) {
            const ratio = width / height;
            if (ratio > 1) {
                width = maxDimension;
                height = Math.round(maxDimension / ratio);
            } else {
                height = maxDimension;
                width = Math.round(maxDimension * ratio);
            }
        }
        
        this.canvas.width = width;
        this.canvas.height = height;
        this.gl.viewport(0, 0, width, height);
    }

    initShaders() {
        const vsSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        // Warm gold, orange, and soft brown morphing mesh gradient + pixel grain
        const fsSource = `
            #ifdef GL_FRAGMENT_PRECISION_HIGH
                precision highp float;
            #else
                precision mediump float;
            #endif
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform float u_motion_scale;

            float hash(vec2 p) {
                p = fract(p * vec2(123.34, 456.21));
                p += dot(p, p + 45.32);
                return fract(p.x * p.y);
            }

            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                           mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
            }

            #define OCTAVES 4
            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                for (int i = 0; i < OCTAVES; i++) {
                    value += amplitude * noise(p * frequency);
                    frequency *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }

            void main() {
                // Normalized coordinates
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

                // Morphing colored blobs coordinates (subtle speed)
                float t = u_time * 0.22;
                float m = u_motion_scale; // Motion scale (1.0 on desktop, 0.02 on mobile)
                
                // Blob 1: Golden yellow (floats around bottom right)
                vec2 c1 = vec2(0.7 + 0.08 * m * sin(t * 0.8), 0.3 + 0.06 * m * cos(t * 1.1));
                // Blob 2: Warm amber orange (floats around top left)
                vec2 c2 = vec2(0.3 + 0.06 * m * cos(t * 0.9), 0.7 + 0.08 * m * sin(t * 0.7));
                // Blob 3: Soft warm tan/brown (floats around center bottom)
                vec2 c3 = vec2(0.5 + 0.07 * m * sin(t * 1.2), 0.2 + 0.05 * m * cos(t * 0.8));
                // Blob 4: Warm bronze/sand (floats around center top)
                vec2 c4 = vec2(0.4 + 0.06 * m * cos(t * 0.7 + 1.0), 0.8 + 0.05 * m * sin(t * 1.3));

                // Calculate weights based on aspect-corrected distance
                // We divide pixel coordinates difference by min(u_resolution.x, u_resolution.y) to ensure perfect circles
                float d1 = length(gl_FragCoord.xy - c1 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
                float d2 = length(gl_FragCoord.xy - c2 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
                float d3 = length(gl_FragCoord.xy - c3 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
                float d4 = length(gl_FragCoord.xy - c4 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

                // Tighter exponential falloff for blobs to make them small, distinct floating lights
                float w1 = exp(-d1 * d1 * 26.0);
                float w2 = exp(-d2 * d2 * 30.0);
                float w3 = exp(-d3 * d3 * 34.0);
                float w4 = exp(-d4 * d4 * 22.0);

                // Define colors matching gold/amber/brown editorial mesh gradient
                vec3 baseBg = vec3(0.985, 0.975, 0.96); // Clean warm cream base
                
                vec3 colGold   = vec3(0.99, 0.83, 0.48);  // Rich golden yellow (#fcd47a)
                vec3 colAmber  = vec3(0.96, 0.62, 0.42);  // Soft amber orange (#f59e6a)
                vec3 colBrown  = vec3(0.79, 0.59, 0.41);  // Warm soft tan/brown (#c99769)
                vec3 colBronze = vec3(0.92, 0.83, 0.62);  // Warm bronze sand (#ebd49e)

                // Accumulate color with rich mixing ratios (fixed variables compile correctly now)
                vec3 color = baseBg;
                color = mix(color, colGold, w1 * 0.85);
                color = mix(color, colAmber, w2 * 0.75);
                color = mix(color, colBrown, w3 * 0.7);
                color = mix(color, colBronze, w4 * 0.6);

                // Apply a very subtle fbm warp to blend them more organically
                float f = fbm(p * 2.0 + vec2(t * 0.05));
                color += vec3(0.01) * f;

                // Add fine grain overlay for high-end editorial paper feel
                float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
                color += (grain - 0.5) * 0.022; // 2.2% grain intensity for subtle texture

                gl_FragColor = vec4(color, 1.0);
            }
        `;

        this.program = this.createProgram(vsSource, fsSource);
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation error:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    createProgram(vsSource, fsSource) {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fsSource);
        
        if (!vertexShader || !fragmentShader) return null;

        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program link error:', this.gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    initBuffers() {
        if (!this.program) return;
        const vertices = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
            -1,  1,
             1, -1,
             1,  1,
        ]);

        const buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);

        const positionAttr = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionAttr);
        this.gl.vertexAttribPointer(positionAttr, 2, this.gl.FLOAT, false, 0, 0);
    }

    setupUniforms() {
        if (!this.program) return;
        this.resolutionLoc = this.gl.getUniformLocation(this.program, 'u_resolution');
        this.timeLoc = this.gl.getUniformLocation(this.program, 'u_time');
        this.motionScaleLoc = this.gl.getUniformLocation(this.program, 'u_motion_scale');
    }

    render() {
        if (!this.program || document.hidden) return;

        // Animate consistently at 60fps
        this.time += 0.04;

        this.gl.clearColor(0.985, 0.975, 0.96, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.gl.useProgram(this.program);

        // Calculate motion scale dynamically: 1.0 on desktop, 0.02 (near zero) on mobile
        const motionScale = window.innerWidth <= 768 ? 0.02 : 1.0;

        this.gl.uniform2f(this.resolutionLoc, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.timeLoc, this.time);
        this.gl.uniform1f(this.motionScaleLoc, motionScale);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

        this._rafId = requestAnimationFrame(() => this.render());
    }
}

// Defensive instantiation to handle timing states
function initShaderBackground() {
    new ShaderBackground('shader-canvas');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShaderBackground);
} else {
    initShaderBackground();
}
