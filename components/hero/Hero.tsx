"use client";

import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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

// ─── Background — pure animated noise, no mouse interaction ─────────────────

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

// ─── Logo — same FBM distorts surface, localised to mouse position ───────────

const logoFrag = /* glsl */ `
  uniform sampler2D uLogo;
  uniform float     uTime;
  uniform vec2      uMouse;      // screen UV 0-1
  uniform float     uVelocity;   // smoothed 0-1
  uniform vec2      uLogoOffset; // logo rect bottom-left in screen UV
  uniform vec2      uLogoSize;   // logo rect size in screen UV
  varying vec2      vUv;
  ${NOISE_FNS}
  void main() {
    // Map fragment to screen UV so noise matches background scale
    vec2 screenUv = uLogoOffset + vUv * uLogoSize;

    // Distance from mouse → local distortion brush
    float d         = length(screenUv - uMouse);
    float proximity = exp(-d * 6.0);
    float strength  = proximity * uVelocity * 0.28 + 0.008;

    // Domain-warped FBM — same computation as background
    vec2 q = vec2(fbm(screenUv * 1.2 + uTime * 0.025),
                  fbm(screenUv * 1.2 + vec2(5.2,1.3) + uTime * 0.025));
    vec2 r = vec2(fbm(screenUv * 1.2 + 2.8*q + vec2(1.7,9.2) + uTime * 0.02),
                  fbm(screenUv * 1.2 + 2.8*q + vec2(8.3,2.8) + uTime * 0.02));
    vec2 warp = vec2(fbm(screenUv * 1.2 + 2.8*r),
                     fbm(screenUv * 1.2 + 2.8*r + vec2(3.1, 7.4))) - 0.5;

    // Sample logo texture with warp
    vec2 logoUv    = clamp(vUv + warp * strength, 0.0, 1.0);
    vec3 logoColor = texture2D(uLogo, logoUv).rgb;

    // Reconstruct background color at this screen position (mirrors bgFrag exactly)
    float n     = fbm(screenUv * 1.2 + 2.8 * r);
    float c     = pow(smoothstep(0.40, 0.62, n), 0.85);
    float frame = floor(uTime * 24.0);
    float g1    = hash(screenUv * 480.0 + frame * 0.1723);
    float g2    = hash(screenUv * 240.0 + frame * 0.3141 + 7.3);
    c = clamp(c + (g1 * 0.65 + g2 * 0.35 - 0.5) * 0.38, 0.0, 1.0);
    vec3 bgColor = vec3(c);

    // Difference blend
    gl_FragColor = vec4(abs(logoColor - bgColor), 1.0);
  }
`;

// ─── Background plane ────────────────────────────────────────────────────────

function NoisePlane() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });
  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={matRef} vertexShader={vert} fragmentShader={bgFrag}
        uniforms={{ uTime: { value: 0 } }} />
    </mesh>
  );
}

// ─── Logo plane ──────────────────────────────────────────────────────────────

const LOGO_CSS_W = 428; // 340 + 44*2
const LOGO_CSS_H = 198; // 142 + 28*2

function LogoPlane({
  texture, mouseRef, velocityRef,
}: {
  texture:     THREE.CanvasTexture;
  mouseRef:    React.MutableRefObject<{ x: number; y: number }>;
  velocityRef: React.MutableRefObject<number>;
}) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, size } = useThree();

  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const u  = matRef.current.uniforms;
    const sw = LOGO_CSS_W / size.width;
    const sh = LOGO_CSS_H / size.height;
    u.uTime.value = clock.getElapsedTime();
    u.uMouse.value.set(mouseRef.current.x, mouseRef.current.y);
    u.uVelocity.value = velocityRef.current;
    u.uLogoOffset.value.set(0.5 - sw * 0.5, 0.5 - sh * 0.5);
    u.uLogoSize.value.set(sw, sh);
  });

  const sw = LOGO_CSS_W / (size.width  || 1920);
  const sh = LOGO_CSS_H / (size.height || 1080);

  return (
    <mesh position={[0, 0, 0.01]} scale={[sw * viewport.width, sh * viewport.height, 1]} renderOrder={1}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={matRef} vertexShader={vert} fragmentShader={logoFrag}
        uniforms={{
          uLogo:       { value: texture },
          uTime:       { value: 0 },
          uMouse:      { value: new THREE.Vector2(0.5, 0.5) },
          uVelocity:   { value: 0 },
          uLogoOffset: { value: new THREE.Vector2(0.5 - sw*0.5, 0.5 - sh*0.5) },
          uLogoSize:   { value: new THREE.Vector2(sw, sh) },
        }}
      />
    </mesh>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  const mouseRef    = useRef({ x: 0.5, y: 0.5 });
  const velocityRef = useRef(0);
  const lastRef     = useRef({ x: 0.5, y: 0.5 });
  const [logoTex, setLogoTex] = useState<THREE.CanvasTexture | null>(null);

  // Build logo canvas texture once
  useEffect(() => {
    const S = 2, W = LOGO_CSS_W * S, H = LOGO_CSS_H * S;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fa3d00";
    ctx.fillRect(0, 0, W, H);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 44*S, 28*S, W - 44*S*2, H - 28*S*2);
      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      setLogoTex(tex);
    };
    img.src = "/Assets/Brand/B53_HorizontalLogo.svg";
  }, []);

  // Mouse tracking — smoothed velocity, no direction needed
  useEffect(() => {
    let raf: number;
    const onMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth;
      const y = 1 - e.clientY / window.innerHeight;
      const speed = Math.hypot(x - lastRef.current.x, y - lastRef.current.y);
      // EMA smoothing to prevent jitter
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
      <Canvas camera={{ position: [0, 0, 1] }} style={{ width: "100%", height: "100%" }}
        gl={{ antialias: false }} dpr={1}>
        <NoisePlane />
        {logoTex && <LogoPlane texture={logoTex} mouseRef={mouseRef} velocityRef={velocityRef} />}
      </Canvas>
    </section>
  );
}
