"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { motion } from "framer-motion";
import TransitionLink from "@/components/TransitionLink";
import { usePathname } from "next/navigation";
import * as THREE from "three";

// ─── Inverted noise shader ────────────────────────────────────────────────────

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`;

const frag = /* glsl */ `
  uniform float uTime;
  varying vec2  vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(234.34,435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); f = f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
  float fbm(vec2 p) {
    float v=0.; float a=.5; mat2 r=mat2(.8,.6,-.6,.8);
    for(int i=0;i<6;i++){v+=a*noise(p);p=r*p*2.1+vec2(100.);a*=.5;} return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 q = vec2(fbm(uv*1.2+uTime*.025), fbm(uv*1.2+vec2(5.2,1.3)+uTime*.025));
    vec2 r = vec2(fbm(uv*1.2+2.8*q+vec2(1.7,9.2)+uTime*.02),
                  fbm(uv*1.2+2.8*q+vec2(8.3,2.8)+uTime*.02));
    float n = fbm(uv*1.2+2.8*r);
    float c = pow(smoothstep(.40,.62,n),.85);

    float frame=floor(uTime*24.);
    float g1=hash(vUv*480.+frame*.1723);
    float g2=hash(vUv*240.+frame*.3141+7.3);
    c = clamp(c+(g1*.65+g2*.35-.5)*.38,0.,1.);

    gl_FragColor = vec4(vec3(c), 1.0);
  }
`;

function NoiseBackground() {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();
  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });
  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={matRef} vertexShader={vert} fragmentShader={frag}
        uniforms={{ uTime: { value: 0 } }} />
    </mesh>
  );
}

// ─── Menu item ────────────────────────────────────────────────────────────────

function MenuItem({ href, label, onClose, isActive }: { href: string; label: string; onClose: () => void; isActive: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative overflow-hidden cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        className="absolute inset-0 bg-[#fa3d00] pointer-events-none"
        style={{ mixBlendMode: "difference" }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      />
      <TransitionLink href={href} onClick={onClose}>
        <span
          className="block font-niagara uppercase leading-none py-1 select-none"
          style={{
            fontSize: "clamp(3.5rem, 11vw, 10rem)",
            color: "#f0f0f0",
            mixBlendMode: "difference",
            textDecoration: isActive ? "line-through" : "none",
          }}
        >
          {label}
        </span>
      </TransitionLink>
    </div>
  );
}

// ─── Overlay ─────────────────────────────────────────────────────────────────

const LINKS = [
  { href: "/",        label: "Home"    },
  { href: "/work",    label: "Work"    },
  { href: "/contact", label: "Contact" },
];

export default function MenuOverlay({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {/* Noise background — clip-path lives here only, pointer-events-none so it never intercepts touches */}
      <motion.div
        className="fixed inset-0 z-50 pointer-events-none"
        initial={{ clipPath: "inset(0 0 100% 0)" }}
        animate={{ clipPath: "inset(0 0 0% 0)"   }}
        exit={{    clipPath: "inset(0 0 100% 0)" }}
        transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
      >
        <Canvas camera={{ position: [0,0,1] }} gl={{ antialias: false }} dpr={1}
          style={{ width: "100%", height: "100%" }}>
          <NoiseBackground />
        </Canvas>
      </motion.div>

      {/* Interactive layer — no clip-path, so touch coords are always accurate */}
      <motion.div
        className="fixed inset-0 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Links */}
        <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-20">
          {LINKS.map(l => (
            <MenuItem key={l.href} {...l} onClose={onClose} isActive={pathname === l.href} />
          ))}
        </div>

        {/* Close button — rendered after links so it sits on top */}
        <button
          onClick={onClose}
          className="absolute top-4 right-6 md:right-10 font-niagara leading-none select-none z-10"
          style={{
            fontSize: "clamp(3rem, 7vw, 6rem)",
            color: "#fa3d00",
            WebkitTextStroke: "2px #fa3d00",
          }}
          aria-label="Close menu"
        >
          ×
        </button>
      </motion.div>
    </>
  );
}
