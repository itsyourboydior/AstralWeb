(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))l(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const h of n.addedNodes)h.tagName==="LINK"&&h.rel==="modulepreload"&&l(h)}).observe(document,{childList:!0,subtree:!0});function t(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function l(a){if(a.ep)return;a.ep=!0;const n=t(a);fetch(a.href,n)}})();class fe{constructor(i){if(this.canvas=document.getElementById(i),!!this.canvas){if(this.gl=this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl"),!this.gl){console.error("WebGL not supported by browser.");return}this.time=0,this.resize(),this.initShaders(),this.initBuffers(),this.setupUniforms(),window.addEventListener("resize",()=>this.resize()),this.render()}}resize(){const i=window.innerWidth,t=window.innerHeight;this.canvas.width=i,this.canvas.height=t,this.gl.viewport(0,0,i,t)}initShaders(){const i=`
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `,t=`
            precision highp float;
            uniform vec2 u_resolution;
            uniform float u_time;

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
                // Pixelate coordinates slightly for retro-futuristic digital nebula rendering (3.0px grid)
                float pixelScale = 3.0;
                vec2 pixelPos = floor(gl_FragCoord.xy / pixelScale) * pixelScale;

                // Centered coordinates scaled by aspect ratio
                vec2 uv = pixelPos / u_resolution.xy;
                vec2 p = (pixelPos - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
                
                // Slow rotation
                float rotAngle = u_time * 0.012;
                mat2 rot = mat2(cos(rotAngle), -sin(rotAngle), sin(rotAngle), cos(rotAngle));
                p = rot * p;

                // Domain warping (slower movements)
                vec2 q = vec2(0.0);
                q.x = fbm(p * 2.0 + vec2(0.0, u_time * 0.03));
                q.y = fbm(p * 2.0 + vec2(1.0, u_time * 0.02));

                vec2 r = vec2(0.0);
                r.x = fbm(p * 1.5 + 4.0 * q + vec2(1.7, 9.2) + u_time * 0.02);
                r.y = fbm(p * 1.5 + 4.0 * q + vec2(8.3, 2.8) + u_time * 0.015);

                float f = fbm(p * 1.25 + 4.0 * r);

                // Darker cosmic color palette for premium legibility contrast
                vec3 baseBg = vec3(0.002, 0.001, 0.005); 
                vec3 color1 = vec3(0.22, 0.17, 0.40);   // Vibrant Blue-Purple Nebula (darker #7259be)
                vec3 color2 = vec3(0.06, 0.04, 0.18);   // Darker Indigo/Violet Plume
                vec3 color3 = vec3(0.46, 0.35, 0.76);   // Glowing Blue-Purple Core (exactly #755ac3)

                // Mixing colors
                vec3 color = mix(baseBg, color1, f);
                color = mix(color, color2, dot(q, q) * 0.65);
                color = mix(color, color3, r.y * 0.45);

                // Add contrast and glow highlights (vibrant blue-purple hotspots)
                color += vec3(0.30, 0.22, 0.55) * pow(f, 4.0);
                
                // --- Premium Halftone Dither Overlay ---
                // alternating circles and plus signs (+) based on local brightness
                float ditherScale = 16.0;
                vec2 ditherUV = gl_FragCoord.xy / ditherScale;
                vec2 cellCoord = floor(ditherUV);
                vec2 cellUV = fract(ditherUV) * 2.0 - 1.0; // [-1.0, 1.0]

                // Brightness luma calculation
                float luma = dot(color, vec3(0.299, 0.587, 0.114));
                float size = clamp(luma * 1.8, 0.0, 0.9); // scale dot size based on luma

                float shape = 0.0;
                bool isCircle = mod(cellCoord.x + cellCoord.y, 2.0) == 0.0;

                if (isCircle) {
                    // Circle shape
                    float d = length(cellUV);
                    shape = smoothstep(size, size - 0.12, d);
                } else {
                    // Plus sign (+) shape
                    float thickness = clamp(size * 0.32, 0.04, 0.22);
                    float armLength = size * 0.85;
                    float d = min(abs(cellUV.x), abs(cellUV.y));
                    float limit = max(abs(cellUV.x), abs(cellUV.y));
                    
                    float lineShape = smoothstep(thickness, thickness - 0.05, d);
                    float limitShape = smoothstep(armLength, armLength - 0.05, limit);
                    shape = lineShape * limitShape;
                }

                // Add dither colors (vibrant blue-purple to deep indigo shift)
                vec3 ditherColor = mix(vec3(0.45, 0.35, 0.75), vec3(0.12, 0.08, 0.24), fract(cellCoord.x * 0.04 + cellCoord.y * 0.04));
                
                // Composite the dither shape overlay onto the background
                color = mix(color, color + ditherColor * 0.22, shape);

                gl_FragColor = vec4(color, 1.0);
            }
        `;this.program=this.createProgram(i,t)}createShader(i,t){const l=this.gl.createShader(i);return this.gl.shaderSource(l,t),this.gl.compileShader(l),this.gl.getShaderParameter(l,this.gl.COMPILE_STATUS)?l:(console.error("Shader compilation error:",this.gl.getShaderInfoLog(l)),this.gl.deleteShader(l),null)}createProgram(i,t){const l=this.createShader(this.gl.VERTEX_SHADER,i),a=this.createShader(this.gl.FRAGMENT_SHADER,t),n=this.gl.createProgram();return this.gl.attachShader(n,l),this.gl.attachShader(n,a),this.gl.linkProgram(n),this.gl.getProgramParameter(n,this.gl.LINK_STATUS)?n:(console.error("Program link error:",this.gl.getProgramInfoLog(n)),null)}initBuffers(){const i=new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),t=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,t),this.gl.bufferData(this.gl.ARRAY_BUFFER,i,this.gl.STATIC_DRAW);const l=this.gl.getAttribLocation(this.program,"a_position");this.gl.enableVertexAttribArray(l),this.gl.vertexAttribPointer(l,2,this.gl.FLOAT,!1,0,0)}setupUniforms(){this.resolutionLoc=this.gl.getUniformLocation(this.program,"u_resolution"),this.timeLoc=this.gl.getUniformLocation(this.program,"u_time")}render(){if(document.hidden){requestAnimationFrame(()=>this.render());return}this.time+=.012,this.gl.clearColor(.03,.03,.06,1),this.gl.clear(this.gl.COLOR_BUFFER_BIT),this.gl.useProgram(this.program),this.gl.uniform2f(this.resolutionLoc,this.canvas.width,this.canvas.height),this.gl.uniform1f(this.timeLoc,this.time),this.gl.drawArrays(this.gl.TRIANGLES,0,6),requestAnimationFrame(()=>this.render())}}document.addEventListener("DOMContentLoaded",()=>{new fe("shader-canvas")});class pe{constructor(){this.track=document.querySelector(".carousel-track"),this.slides=Array.from(document.querySelectorAll(".carousel-slide")),this.prevBtn=document.querySelector(".carousel-arrow.prev"),this.nextBtn=document.querySelector(".carousel-arrow.next"),this.dots=Array.from(document.querySelectorAll(".carousel-dot")),this.infoContents=Array.from(document.querySelectorAll(".project-info-content")),!(!this.track||this.slides.length===0)&&(this.currentIndex=0,this.totalSlides=this.slides.length,this.autoplayInterval=null,this.touchStartX=0,this.touchEndX=0,this.init())}init(){this.prevBtn&&this.prevBtn.addEventListener("click",()=>{this.navigate(-1),this.resetAutoplay()}),this.nextBtn&&this.nextBtn.addEventListener("click",()=>{this.navigate(1),this.resetAutoplay()}),this.dots.forEach((t,l)=>{t.addEventListener("click",()=>{this.goTo(l),this.resetAutoplay()})}),this.slides.forEach(t=>{t.addEventListener("click",()=>{const l=parseInt(t.dataset.index);l!==this.currentIndex&&(this.goTo(l),this.resetAutoplay())})}),document.addEventListener("keydown",t=>{t.key==="ArrowLeft"?(this.navigate(-1),this.resetAutoplay()):t.key==="ArrowRight"&&(this.navigate(1),this.resetAutoplay())}),this.track.addEventListener("touchstart",t=>{this.touchStartX=t.changedTouches[0].screenX},{passive:!0}),this.track.addEventListener("touchend",t=>{this.touchEndX=t.changedTouches[0].screenX,this.handleSwipe()},{passive:!0}),this.startAutoplay();const i=document.querySelector(".portfolio-showcase");i&&(i.addEventListener("mouseenter",()=>this.pauseAutoplay()),i.addEventListener("mouseleave",()=>this.startAutoplay())),document.addEventListener("languagechange",()=>{this.updateTextPanel(this.currentIndex)}),this.update()}handleSwipe(){this.touchStartX-this.touchEndX>50?(this.navigate(1),this.resetAutoplay()):this.touchEndX-this.touchStartX>50&&(this.navigate(-1),this.resetAutoplay())}startAutoplay(){this.autoplayInterval=setInterval(()=>{this.navigate(1)},5e3)}pauseAutoplay(){this.autoplayInterval&&clearInterval(this.autoplayInterval)}resetAutoplay(){this.pauseAutoplay(),this.startAutoplay()}navigate(i){let t=this.currentIndex+i;t<0&&(t=this.totalSlides-1),t>=this.totalSlides&&(t=0),this.goTo(t)}goTo(i){i!==this.currentIndex&&(this.currentIndex=i,this.update())}update(){const i=window.innerWidth<=768;this.slides.forEach((t,l)=>{let a=l-this.currentIndex;a<-1&&(a+=this.totalSlides),a>1&&(a-=this.totalSlides);let n="",h=0,g=0,u="0px";i?a===0?(n="translateX(0) scale(1) rotateY(0deg)",h=1,g=3,u="0px",t.style.pointerEvents="auto"):a===1?(n="translateX(100%) scale(0.85) rotateY(0deg)",h=0,g=1,u="0px",t.style.pointerEvents="none"):a===-1?(n="translateX(-100%) scale(0.85) rotateY(0deg)",h=0,g=1,u="0px",t.style.pointerEvents="none"):(n="translateX(0) scale(0.5) rotateY(0deg)",h=0,g=0,t.style.pointerEvents="none"):a===0?(n="translateX(0) scale(1) rotateY(0deg)",h=1,g=3,u="0px",t.style.pointerEvents="auto"):a===1?(n="translateX(48%) scale(0.82) rotateY(-35deg)",h=.5,g=2,u="2px",t.style.pointerEvents="auto"):a===-1?(n="translateX(-48%) scale(0.82) rotateY(35deg)",h=.5,g=2,u="2px",t.style.pointerEvents="auto"):(n="translateX(0) scale(0.5) rotateY(0deg)",h=0,g=0,t.style.pointerEvents="none"),t.style.transform=n,t.style.opacity=h,t.style.zIndex=g,t.style.filter=u!=="0px"?`blur(${u})`:"none"}),this.dots.forEach((t,l)=>{l===this.currentIndex?t.classList.add("active"):t.classList.remove("active")}),this.updateTextPanel(this.currentIndex)}updateTextPanel(i){this.infoContents.forEach(t=>{parseInt(t.dataset.index)===i?t.classList.contains("active")?this.triggerWordReveal(t):(t.style.opacity="0",t.style.transform="translateY(15px)",setTimeout(()=>{t.classList.add("active"),t.style.opacity="1",t.style.transform="translateY(0)",this.triggerWordReveal(t)},50)):(t.classList.remove("active"),t.style.opacity="0",t.style.transform="translateY(15px)")})}triggerWordReveal(i){const t=i.querySelector(".word-reveal");if(!t)return;const l=document.documentElement.lang||"sq",n=(t.getAttribute(`data-${l}`)||t.textContent.trim()).split(/\s+/);t.innerHTML="",n.forEach((h,g)=>{const u=document.createElement("span");u.textContent=h+" ",u.style.animationDelay=`${g*.05}s`,t.appendChild(u)})}}window.addEventListener("resize",()=>{const p=window.portfolioCarousel;p&&p.update()});document.addEventListener("DOMContentLoaded",()=>{window.portfolioCarousel=new pe});class ve{constructor(i){this.el=i,this.chars="!<>-_\\/[]{}—=+*^?#________"}scramble(i){this.el.innerHTML=i;const t=[],l=u=>{if(u.nodeType===Node.TEXT_NODE)u.nodeValue.trim().length>0&&t.push(u);else for(let f of u.childNodes)l(f)};l(this.el);const a=t.map(u=>{const f=u.nodeValue;return{node:u,originalText:f,length:f.length}});let n=0;const h=40,g=()=>{let u=!0;a.forEach(f=>{let L="";const P=n/h;for(let A=0;A<f.length;A++){const O=A/f.length;if(P>O)L+=f.originalText[A];else if(P>O-.2){const R=Math.floor(Math.random()*this.chars.length);L+=this.chars[R],u=!1}else L+=" ",u=!1}f.node.nodeValue=L}),!u&&n<h?(n++,requestAnimationFrame(g)):a.forEach(f=>{f.node.nodeValue=f.originalText})};g()}}document.addEventListener("DOMContentLoaded",()=>{gsap.registerPlugin(ScrollTrigger);const p=document.getElementById("langToggle");let i="sq";const t=document.getElementById("scramble-headline"),l=t?new ve(t):null,a=e=>{if(i=e,document.documentElement.lang=e,document.querySelectorAll("[data-sq], [data-en]").forEach(o=>{const c=o.getAttribute(`data-${e}`);if(c)if(o.tagName==="INPUT"||o.tagName==="TEXTAREA"){const m=o.getAttribute(`data-placeholder-${e}`);m&&(o.placeholder=m)}else o.tagName==="OPTION"?o.textContent=c:c.includes("<span")?o.innerHTML=c:o.textContent=c}),l){const o={sq:'Ndërtojmë të ardhmen tuaj <span class="gradient">digjitale</span>',en:'Engineering your <span class="gradient">digital future</span>'};l.scramble(o[e])}p&&(p.innerText=e==="en"?"SQ":"EN");const r=new CustomEvent("languagechange",{detail:{lang:e}});document.dispatchEvent(r)};p&&p.addEventListener("click",()=>{a(i==="en"?"sq":"en")}),a("sq");const n=document.querySelector(".main-header");window.addEventListener("scroll",()=>{window.scrollY>50?n.classList.add("scrolled"):n.classList.remove("scrolled")});const h=document.querySelectorAll(".reveal"),g=new IntersectionObserver((e,s)=>{e.forEach(r=>{r.isIntersecting&&(r.target.classList.add("visible"),s.unobserve(r.target))})},{threshold:.15,rootMargin:"0px 0px -50px 0px"});h.forEach(e=>g.observe(e));const u=document.querySelectorAll("section"),f=document.querySelectorAll(".nav-link"),L=new IntersectionObserver(e=>{e.forEach(s=>{if(s.isIntersecting){let r=s.target.getAttribute("id");r==="stellar-container"&&(r="home"),f.forEach(o=>{o.getAttribute("href")===`#${r}`?o.classList.add("active"):o.classList.remove("active")})}})},{threshold:.35,rootMargin:"-20% 0px -40% 0px"});u.forEach(e=>L.observe(e));const P=document.querySelectorAll(".strip-number:not(.text-static)"),A=e=>1-Math.pow(1-e,3),O=e=>{const s=parseFloat(e.getAttribute("data-target")),r=2e3;let o=null;const c=m=>{o||(o=m);const d=m-o,w=Math.min(d/r,1);let S=A(w)*s;Number.isInteger(s)?e.textContent=Math.floor(S):e.textContent=S.toFixed(1),w<1?requestAnimationFrame(c):e.textContent=s};requestAnimationFrame(c)},R=new IntersectionObserver((e,s)=>{e.forEach(r=>{r.isIntersecting&&(O(r.target),s.unobserve(r.target))})},{threshold:.5});P.forEach(e=>R.observe(e)),document.querySelectorAll(".tilt-card").forEach(e=>{e.addEventListener("mousemove",s=>{const r=e.getBoundingClientRect(),o=s.clientX-r.left,c=s.clientY-r.top,m=r.width,d=r.height,w=(c/d-.5)*-15,y=(o/m-.5)*15;e.style.transform=`perspective(1000px) rotateX(${w}deg) rotateY(${y}deg) scale3d(1.02, 1.02, 1.02)`}),e.addEventListener("mouseleave",()=>{e.style.transform="perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)"})});const j=document.querySelectorAll(".faq-item");j.forEach(e=>{const s=e.querySelector(".faq-trigger"),r=e.querySelector(".faq-answer-wrapper");s.addEventListener("click",()=>{const o=e.classList.contains("active");j.forEach(c=>{c.classList.remove("active"),c.querySelector(".faq-answer-wrapper").style.maxHeight=null}),o||(e.classList.add("active"),r.style.maxHeight=r.scrollHeight+"px")})});const G=document.querySelector(".timeline"),le=document.querySelectorAll(".timeline-step"),K=document.querySelector(".timeline-progress"),Q=()=>{if(!G)return;const e=G.getBoundingClientRect(),s=window.innerHeight,r=e.top+window.scrollY,o=e.bottom+window.scrollY-150;let m=(window.scrollY+s*.5-r)/(o-r);m=Math.max(0,Math.min(1,m)),K&&(K.style.height=`${m*100}%`);const w=window.innerWidth<768?s*.85:s*.7;le.forEach(y=>{const S=y.getBoundingClientRect(),k=y.querySelector(".timeline-dot");S.top<w?(y.classList.add("active"),k&&k.classList.add("active")):(y.classList.remove("active"),k&&k.classList.remove("active"))})};window.addEventListener("scroll",Q),Q();const I=document.getElementById("hamburger-trigger"),M=document.getElementById("mobile-menu"),ce=document.querySelectorAll(".mobile-nav-link, .mobile-cta"),B=()=>{I.classList.contains("active")?(I.classList.remove("active"),M.classList.remove("active"),document.body.style.overflow=""):(I.classList.add("active"),M.classList.add("active"),document.body.style.overflow="hidden")};I.addEventListener("click",B),ce.forEach(e=>{e.addEventListener("click",()=>{I.classList.contains("active")&&B()})}),window.addEventListener("resize",()=>{window.innerWidth>768&&I.classList.contains("active")&&B()});const de=()=>{let e=document.querySelector(".success-alert");e||(e=document.createElement("div"),e.className="success-alert",e.innerHTML=`
                <i class="fa-solid fa-circle-check"></i>
                <div class="alert-content">
                    <p data-sq="Mesazhi u dërgua me sukses!" data-en="Message submitted successfully!">Mesazhi u dërgua me sukses!</p>
                </div>
            `,document.body.appendChild(e));const s=e.querySelector("p");s.textContent=s.getAttribute(`data-${i}`),setTimeout(()=>{e.classList.add("show")},100),setTimeout(()=>{e.classList.remove("show")},5e3)};if(new URLSearchParams(window.location.search).get("submitted")==="1"){de();const e=window.location.pathname;window.history.replaceState({},document.title,e)}const X=document.querySelector(".services-grid .service-card:nth-child(1)"),Y=document.querySelector(".services-grid .service-card:nth-child(2)"),F=document.getElementById("name-dior"),N=document.getElementById("name-akil");let J=null,Z=null;const ee="01Øµ§æß#[]{}",te=["[RANK#1]","[SPD:9.9]","[ALT:782]","[SEO:100%]","[WARP:ON]","[GMB:DOM]"];X&&F&&(X.addEventListener("mouseenter",()=>{J=setInterval(()=>{let e="";for(let s=0;s<10;s++)e+=ee[Math.floor(Math.random()*ee.length)];F.textContent=e},100)}),X.addEventListener("mouseleave",()=>{clearInterval(J),F.textContent="Dior Rruka"})),Y&&N&&(Y.addEventListener("mouseenter",()=>{Z=setInterval(()=>{const e=te[Math.floor(Math.random()*te.length)];N.textContent=e},180)}),Y.addEventListener("mouseleave",()=>{clearInterval(Z),N.textContent="Akil Rafuna"})),document.getElementById("stellar-container");const v=document.getElementById("hero-canvas"),T=document.querySelector(".interaction-deck");let x=null;v&&(x=v.getContext("2d"));const _=299,b=[];let z=!1,C=[];const ue=e=>{if(z){e();return}if(C.push(e),C.length>1)return;const s=new Image;s.src="extracted_images/ezgif-frame-001.jpg",s.onload=()=>{b[0]=s,q(0)},b[0]=s,setTimeout(()=>{let r=0;for(let o=1;o<=_;o++){if(o===1){r++;continue}const c=new Image,m=o.toString().padStart(3,"0");c.src=`extracted_images/ezgif-frame-${m}.jpg`,c.onload=()=>{r++,r===_&&(z=!0,C.forEach(d=>d()),C=[])},c.onerror=()=>{r++,r===_&&(z=!0,C.forEach(d=>d()),C=[])},b[o-1]=c}},120)};let E={frame:0,blur:2};const he=()=>{if(!v)return;const e=E.blur,s="contrast(1.15) brightness(0.95)";v.style.filter=e>0?`blur(${e}px) ${s}`:s,v.style.transform=`scale(${1+e/2*.04})`},q=e=>{if(!x||!v)return;const s=Math.max(0,Math.min(_-1,Math.round(e)));let r=b[s];if(!r||!r.complete){for(let o=0;o<b.length;o++)if(b[o]&&b[o].complete){r=b[o];break}}if(r&&r.complete){const o=v.width,c=v.height,m=r.width,d=r.height,w=Math.max(o/m,c/d),y=m*w,S=d*w,k=(o-y)/2,ge=(c-S)/2;x.clearRect(0,0,o,c),x.imageSmoothingEnabled=!0,x.mozImageSmoothingEnabled=!0,x.webkitImageSmoothingEnabled=!0,x.msImageSmoothingEnabled=!0,x.drawImage(r,k,ge,y,S),he()}},D=()=>{v&&(v.width=window.innerWidth,v.height=window.innerHeight,q(E.frame))};let U=!1,oe=0,re=0,V=0,H=0,$=0,W=0;const se=()=>{U=window.innerWidth<768||"ontouchstart"in window},me=()=>{D(),se()};se(),D(),window.addEventListener("resize",me,{passive:!0});const ie=e=>{if(U)return;const s=window.innerWidth/2,r=window.innerHeight/2;oe=(e.clientX-s)/s,re=(e.clientY-r)/r,H=oe*12,V=-re*12},ne=()=>{V=0,H=0},ae=()=>{U||T&&($+=(V-$)*.1,W+=(H-W)*.1,T.style.transform=`rotateX(${$}deg) rotateY(${W}deg)`),requestAnimationFrame(ae)};ae(),gsap.matchMedia().add({isDesktop:"(min-width: 768px)",isMobile:"(max-width: 767px)"},e=>{let{isDesktop:s,isMobile:r}=e.conditions,o=!1;const c=()=>{if(o||!document.getElementById("stellar-container"))return;o=!0,D(),r&&(E.blur=2),q(0);const d=gsap.timeline({scrollTrigger:{trigger:"#stellar-container",start:"top top",end:"+=3000px",pin:!0,scrub:1,invalidateOnRefresh:!0}});d.to(".hero-text-overlay",{opacity:0,y:-60,duration:10,ease:"power2.inOut"},0),d.to(E,{frame:149,snap:"frame",ease:"none",duration:50,onUpdate:()=>{q(E.frame)}},0),d.fromTo(".msg-1",{opacity:0,y:40},{opacity:1,y:0,duration:10,ease:"power2.out"},10),d.to(".msg-1",{opacity:0,y:-40,duration:10,ease:"power2.in"},20),d.fromTo(".msg-2",{opacity:0,y:40},{opacity:1,y:0,duration:10,ease:"power2.out"},30),d.to(".msg-2",{opacity:0,y:-40,duration:10,ease:"power2.in"},40),d.to(E,{frame:298,snap:"frame",ease:"none",duration:45,onUpdate:()=>{q(E.frame)}},50),d.to(".bg-canvas-container",{opacity:0,duration:15,ease:"power2.inOut"},80),d.fromTo(".interaction-deck-wrapper",{opacity:0,scale:.8},{opacity:1,scale:1,duration:5,ease:"power2.out"},45),s?(d.to(".card-akil",{x:-200,duration:45,ease:"power2.inOut"},50),d.to(".card-dior",{x:200,duration:45,ease:"power2.inOut"},50),d.to(".interaction-deck",{gap:"40px",duration:45,ease:"power2.inOut"},50)):(T&&(T.style.flexDirection="column"),d.fromTo(".card-akil",{opacity:0,y:40},{opacity:1,y:0,duration:45,ease:"power2.out"},50),d.fromTo(".card-dior",{opacity:0,y:40},{opacity:1,y:0,duration:45,ease:"power2.out"},50),d.to(".interaction-deck",{gap:"20px",duration:45,ease:"power2.inOut"},50)),d.fromTo([".card-akil h2",".card-akil p",".card-dior h2",".card-dior p"],{opacity:0,y:20},{opacity:1,y:0,stagger:.05,duration:45,ease:"power2.out"},50)};ue(()=>{c()});const m=setTimeout(()=>{c()},2e3);return s?(window.addEventListener("mousemove",ie),document.addEventListener("mouseleave",ne)):T&&(T.style.transform="none"),()=>{clearTimeout(m),s&&(window.removeEventListener("mousemove",ie),document.removeEventListener("mouseleave",ne))}}),document.querySelectorAll('a[href^="#"]').forEach(e=>{e.addEventListener("click",function(s){s.preventDefault();const r=this.getAttribute("href");if(M&&M.classList.contains("active")){M.classList.remove("active");const o=document.getElementById("hamburger-trigger");o&&o.classList.remove("active"),document.body.style.overflow=""}if(r==="#home")gsap.to(window,{scrollTo:0,duration:1.2,ease:"power2.inOut",onComplete:()=>{E.frame=0,q(0)}});else{const o=document.querySelector(r);if(o){const c=o.getBoundingClientRect().top+window.scrollY;gsap.to(window,{scrollTo:c,duration:1.2,ease:"power2.inOut"})}}})})});
