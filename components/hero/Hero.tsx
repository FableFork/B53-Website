"use client";

import { useRef, useEffect } from "react";
import * as THREE from "three";

// ─── Shared noise functions ───────────────────────────────────────────────────

const NOISE_FNS = /* glsl */ `
  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i),               hash(i + vec2(1.,0.)), f.x),
      mix(hash(i + vec2(0.,1.)), hash(i + vec2(1.,1.)), f.x), f.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0; float a = 0.5;
    mat2 r = mat2(0.8, 0.6, -0.6, 0.8);
    for (int i = 0; i < 6; i++) { v += a * noise(p); p = r * p * 2.1 + vec2(100.); a *= 0.5; }
    return v;
  }
`;

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const bgFrag = /* glsl */ `
  uniform float uTime;
  varying vec2  vUv;
  ${NOISE_FNS}
  void main() {
    vec2 uv = vUv;
    vec2 q = vec2(fbm(uv * 1.2 + uTime * 0.025), fbm(uv * 1.2 + vec2(5.2,1.3) + uTime * 0.025));
    vec2 r = vec2(fbm(uv * 1.2 + 2.8*q + vec2(1.7,9.2) + uTime * 0.02),
                  fbm(uv * 1.2 + 2.8*q + vec2(8.3,2.8) + uTime * 0.02));
    float n = fbm(uv * 1.2 + 2.8 * r);
    float c = pow(smoothstep(0.40, 0.62, n), 0.85);
    float frame = floor(uTime * 24.0);
    float g1 = hash(vUv * 480.0 + frame * 0.1723);
    float g2 = hash(vUv * 240.0 + frame * 0.3141 + 7.3);
    c = clamp(c + (g1 * 0.65 + g2 * 0.35 - 0.5) * 0.38, 0.0, 1.0);
    gl_FragColor = vec4(vec3(c), 1.0);
  }
`;

const logoFrag = /* glsl */ `
  uniform sampler2D uLogo;
  uniform float     uTime;
  uniform vec2      uMouse;
  uniform float     uVelocity;
  uniform vec2      uLogoOffset;
  uniform vec2      uLogoSize;
  varying vec2      vUv;
  ${NOISE_FNS}
  void main() {
    vec2 screenUv = uLogoOffset + vUv * uLogoSize;
    float d         = length(screenUv - uMouse);
    float proximity = exp(-d * 6.0);
    float strength  = proximity * uVelocity * 0.28 + 0.008;
    vec2 q = vec2(fbm(screenUv * 1.2 + uTime * 0.025),
                  fbm(screenUv * 1.2 + vec2(5.2,1.3) + uTime * 0.025));
    vec2 r = vec2(fbm(screenUv * 1.2 + 2.8*q + vec2(1.7,9.2) + uTime * 0.02),
                  fbm(screenUv * 1.2 + 2.8*q + vec2(8.3,2.8) + uTime * 0.02));
    vec2 warp = vec2(fbm(screenUv * 1.2 + 2.8*r),
                     fbm(screenUv * 1.2 + 2.8*r + vec2(3.1, 7.4))) - 0.5;
    vec2 logoUv    = clamp(vUv + warp * strength, 0.0, 1.0);
    vec3 logoColor = texture2D(uLogo, logoUv).rgb;
    float n     = fbm(screenUv * 1.2 + 2.8 * r);
    float c     = pow(smoothstep(0.40, 0.62, n), 0.85);
    float frame = floor(uTime * 24.0);
    float g1    = hash(screenUv * 480.0 + frame * 0.1723);
    float g2    = hash(screenUv * 240.0 + frame * 0.3141 + 7.3);
    c = clamp(c + (g1 * 0.65 + g2 * 0.35 - 0.5) * 0.38, 0.0, 1.0);
    vec3 bgColor = vec3(c);
    gl_FragColor = vec4(abs(logoColor - bgColor), 1.0);
  }
`;

// ─── Constants ────────────────────────────────────────────────────────────────

const LOGO_CSS_W = 428;
const LOGO_CSS_H = 198;

// Wall-clock time — unaffected by rAF throttling or R3F lifecycle
const HERO_START = typeof performance !== "undefined" ? performance.now() : 0;
const heroTime = () => (performance.now() - HERO_START) / 1000;

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const mouseRef    = useRef({ x: 0.5, y: 0.5 });
  const velocityRef = useRef(0);
  const lastRef     = useRef({ x: 0.5, y: 0.5 });

  // Raw Three.js scene — no R3F, so the render loop is entirely ours and
  // never paused by R3F's focus/visibility lifecycle management.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Orthographic camera: world space [-1, 1] × [-1, 1]
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 2);
    camera.position.z = 1;

    const scene    = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    renderer.setPixelRatio(1);

    // Background plane fills the full viewport
    const bgMat  = new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: bgFrag,
      uniforms: { uTime: { value: 0 } },
    });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat));

    // Logo material + mesh (added once texture loads)
    const logoMat = new THREE.ShaderMaterial({
      vertexShader: vert, fragmentShader: logoFrag,
      uniforms: {
        uLogo:       { value: null },
        uTime:       { value: 0 },
        uMouse:      { value: new THREE.Vector2(0.5, 0.5) },
        uVelocity:   { value: 0 },
        uLogoOffset: { value: new THREE.Vector2() },
        uLogoSize:   { value: new THREE.Vector2() },
      },
    });
    let logoMesh: THREE.Mesh | null = null;

    const S = 2, W = LOGO_CSS_W * S, H = LOGO_CSS_H * S;
    const logoCanvas = document.createElement("canvas");
    logoCanvas.width = W; logoCanvas.height = H;
    const ctx = logoCanvas.getContext("2d")!;
    ctx.fillStyle = "#fa3d00";
    ctx.fillRect(0, 0, W, H);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 44*S, 28*S, W - 44*S*2, H - 28*S*2);
      const tex = new THREE.CanvasTexture(logoCanvas);
      tex.needsUpdate = true;
      logoMat.uniforms.uLogo.value = tex;
      logoMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), logoMat);
      logoMesh.position.z = 0.01;
      scene.add(logoMesh);
    };
    img.src = "/Assets/Brand/B53_HorizontalLogo.svg";

    // Update renderer size + logo scale/uniforms
    const syncSize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      if (logoMesh) {
        const swUv = LOGO_CSS_W / w;
        const shUv = LOGO_CSS_H / h;
        logoMesh.scale.set(swUv * 2, shUv * 2, 1);
        logoMat.uniforms.uLogoOffset.value.set(0.5 - swUv * 0.5, 0.5 - shUv * 0.5);
        logoMat.uniforms.uLogoSize.value.set(swUv, shUv);
      }
    };

    syncSize();
    const ro = new ResizeObserver(syncSize);
    ro.observe(canvas);

    // Render loop — we own this entirely, no R3F involved
    let rafId: number;
    const tick = () => {
      const t = heroTime();
      bgMat.uniforms.uTime.value = t;

      if (logoMesh) {
        syncSize();
        logoMat.uniforms.uTime.value     = t;
        logoMat.uniforms.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
        logoMat.uniforms.uVelocity.value = velocityRef.current;
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      bgMat.dispose();
      logoMat.dispose();
      renderer.dispose();
    };
  }, []);

  // Mouse tracking + velocity decay
  useEffect(() => {
    let raf: number;
    const onMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = 1 - e.clientY / window.innerHeight;
      const speed = Math.hypot(x - lastRef.current.x, y - lastRef.current.y);
      velocityRef.current = velocityRef.current * 0.7 + Math.min(speed * 50, 1.0) * 0.3;
      lastRef.current  = { x, y };
      mouseRef.current = { x, y };
    };
    const decay = () => { velocityRef.current *= 0.96; raf = requestAnimationFrame(decay); };
    decay();
    window.addEventListener("mousemove", onMove);
    return () => { window.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a]">
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
    </section>
  );
}
