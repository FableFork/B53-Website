"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import { useScroll, AnimatePresence, motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import TransitionLink from "@/components/TransitionLink";
import * as THREE from "three";
import type { MutableRefObject } from "react";
import type { MotionValue } from "framer-motion";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CAPABILITIES = [
  { id: "realtime",  title: "Real-Time Interactive Experiences",     sub: "Worlds that respond. Environments built to be explored, not just watched." },
  { id: "3dviz",     title: "3D Visualization & Animation",          sub: "Objects, products, and spaces rendered with intention. Every frame considered." },
  { id: "motion",    title: "Motion Design",                         sub: "Ideas in motion. From concept to sequence, designed to move people." },
  { id: "cinematic", title: "Cinematic Direction",                   sub: "Lighting, composition, atmosphere. The craft behind every frame." },
  { id: "arch",      title: "Architectural & Spatial Visualization", sub: "Spaces brought to life before they're built. Atmosphere included." },
];
const N = CAPABILITIES.length;

// ─── Volume shader ────────────────────────────────────────────────────────────

const volumeVert = /* glsl */ `
  varying vec3 vLocalPos;
  void main() {
    vLocalPos   = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const volumeFrag = /* glsl */ `
  uniform vec3  uColor;
  uniform vec3  uLocalCamPos;
  uniform vec3  uLightDir;   // normalised, local space

  varying vec3  vLocalPos;

  float density(vec3 p) {
    float edgeDist = min(min(1.0 - abs(p.x), 1.0 - abs(p.y)), 1.0 - abs(p.z));
    float shell    = smoothstep(0.55, 0.0, edgeDist) * 1.6;
    float core     = smoothstep(0.85, 0.0, length(p)) * 0.45;
    return shell + core;
  }

  void main() {
    vec3  rayDir  = normalize(vLocalPos - uLocalCamPos);
    vec3  p       = vLocalPos;

    const int   STEPS    = 96;
    const float stepSize = 3.6 / float(STEPS);

    vec3  accCol   = vec3(0.0);
    float accAlpha = 0.0;
    vec3  toCam    = normalize(uLocalCamPos);

    for (int i = 0; i < STEPS; i++) {
      p -= rayDir * stepSize;
      if (any(greaterThan(abs(p), vec3(1.002)))) break;

      float t = float(i) / float(STEPS); // 0=back face, 1=front/camera side

      // Depth gradient: gradual falloff (linear instead of quadratic)
      float depthBright = mix(0.05, 1.0, t);

      // Directional light: top-right face brightest
      float light = clamp(dot(normalize(p + 0.001), uLightDir) * 2.8 + 0.1, 0.0, 3.0);

      // Darken backside so title text is legible
      float facing = dot(normalize(p + 0.001), toCam) * 0.4 + 0.6;
      float backDark = pow(facing, 1.2);

      float d      = density(p);
      float sAlpha = 1.0 - exp(-d * stepSize * 12.0);
      float emit   = depthBright * light * backDark;

      accCol   += (1.0 - accAlpha) * uColor * emit * sAlpha;
      accAlpha += (1.0 - accAlpha) * sAlpha * (0.1 + emit * 0.9);

      if (accAlpha > 0.97) break;
    }

    gl_FragColor = vec4(accCol, accAlpha);
  }
`;

// ─── Torus particle shaders ───────────────────────────────────────────────────

const torusVert = /* glsl */ `
  attribute float aSize;
  varying   float vAlpha;
  void main() {
    vec4 mvPos    = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize  = aSize * (240.0 / -mvPos.z);
    float dist    = length(mvPos.xyz);
    vAlpha        = smoothstep(8.0, 2.5, dist);
    gl_Position   = projectionMatrix * mvPos;
  }
`;

const torusFrag = /* glsl */ `
  uniform float uOpacity;
  uniform vec3  uColor;
  varying float vAlpha;
  void main() {
    vec2  uv = gl_PointCoord - 0.5;
    float d  = length(uv);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.15, d);
    gl_FragColor = vec4(uColor, soft * vAlpha * uOpacity);
  }
`;

// ─── Edge shader ──────────────────────────────────────────────────────────────

const edgeVert = /* glsl */ `
  varying float vDist;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vDist         = length(worldPos.xyz - cameraPosition);
    gl_Position   = projectionMatrix * viewMatrix * worldPos;
  }
`;

const edgeFrag = /* glsl */ `
  uniform vec3 uColor;
  varying float vDist;
  void main() {
    // Near camera = bright, far = black
    float brightness = 1.0 - clamp((vDist - 3.2) / 3.5, 0.0, 1.0);
    brightness = pow(brightness, 1.6);
    if (brightness < 0.02) discard;
    gl_FragColor = vec4(uColor * brightness, brightness);
  }
`;

// ─── Vertex × base positions (slightly outward) ───────────────────────────────

const VERT_BASES: THREE.Vector3[] = [
  [-1,-1,-1],[1,-1,-1],[-1,1,-1],[1,1,-1],
  [-1,-1,1],[1,-1,1],[-1,1,1],[1,1,1],
].map(([x,y,z]) => new THREE.Vector3(x!,y!,z!).multiplyScalar(1.06));

const DRIFT_PHASES = VERT_BASES.map(() => ({
  px: Math.random() * Math.PI * 2,
  py: Math.random() * Math.PI * 2,
  pz: Math.random() * Math.PI * 2,
}));

// ─── TorusRing ────────────────────────────────────────────────────────────────

const TORUS_COUNT = 3600;
const TORUS_R     = 2.75;  // major radius — outside the cube
const TORUS_r     = 0.52;  // tube radius

// Sizes chosen so gl_PointSize ≈ 4–14px at camera z=5 (multiplier 600 / 5 = 120)
// small: 0.04–0.09 → 5–11px,  large (8%): 0.10–0.18 → 12–22px
const { torusBase, torusPhases, torusSizes } = (() => {
  const base   = new Float32Array(TORUS_COUNT * 3);
  const phases = new Float32Array(TORUS_COUNT * 3);
  const sizes  = new Float32Array(TORUS_COUNT);
  for (let i = 0; i < TORUS_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.random() * Math.PI * 2;
    const rdist = (0.3 + Math.sqrt(Math.random()) * 0.7) * TORUS_r;
    base[i*3]   = (TORUS_R + rdist * Math.cos(phi)) * Math.cos(theta);
    base[i*3+1] = (TORUS_R + rdist * Math.cos(phi)) * Math.sin(theta);
    base[i*3+2] = rdist * Math.sin(phi);
    phases[i*3]   = Math.random() * Math.PI * 2;
    phases[i*3+1] = Math.random() * Math.PI * 2;
    phases[i*3+2] = Math.random() * Math.PI * 2;
    sizes[i] = Math.random() < 0.08
      ? 0.10 + Math.random() * 0.08   // large
      : 0.04 + Math.random() * 0.05;  // small
  }
  return { torusBase: base, torusPhases: phases, torusSizes: sizes };
})();

function TorusRing() {
  const geoRef = useRef<THREE.BufferGeometry>(null!);
  const matRef = useRef<THREE.ShaderMaterial>(null!);

  const initialPositions = useMemo(() => torusBase.slice(), []);

  // #fa3d00 = vec3(0.980, 0.239, 0.0)
  const uniforms = useMemo(() => ({
    uOpacity: { value: 0.45 },
    uColor:   { value: new THREE.Vector3(0.980, 0.239, 0.0) },
  }), []);

  useFrame(({ clock }) => {
    const t   = clock.getElapsedTime();
    const geo = geoRef.current;
    if (!geo) return;
    const pos = geo.attributes.position.array as Float32Array;
    const amp = 0.13;
    for (let i = 0; i < TORUS_COUNT; i++) {
      const bx = torusBase[i*3], by = torusBase[i*3+1], bz = torusBase[i*3+2];
      const px = torusPhases[i*3], py = torusPhases[i*3+1], pz = torusPhases[i*3+2];
      pos[i*3]   = bx + Math.sin(t * 0.38 + px) * amp;
      pos[i*3+1] = by + Math.sin(t * 0.31 + py) * amp;
      pos[i*3+2] = bz + Math.cos(t * 0.42 + pz) * amp;
    }
    geo.attributes.position.needsUpdate = true;
  });

  return (
    <group rotation={[Math.PI * 0.35, Math.PI * 0.1, 0.05]}>
      <points>
        <bufferGeometry ref={geoRef}>
          <bufferAttribute attach="attributes-position" args={[initialPositions, 3]} />
          <bufferAttribute attach="attributes-aSize"    args={[torusSizes, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={matRef}
          vertexShader={torusVert}
          fragmentShader={torusFrag}
          uniforms={uniforms}
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
}

// Fixed world-space light direction — never rotates with the cube
const WORLD_LIGHT = new THREE.Vector3(1.0, 1.2, 0.6).normalize();

// ─── GlowCube ─────────────────────────────────────────────────────────────────

interface CubeProps {
  scrollRef:   MutableRefObject<MotionValue<number>>;
  markerRefs:  MutableRefObject<Array<HTMLSpanElement | null>>;
  techTextRef: MutableRefObject<HTMLSpanElement | null>;
}

function GlowCube({ scrollRef, markerRefs, techTextRef }: CubeProps) {
  const groupRef = useRef<THREE.Group>(null);

  const volMat = useRef(new THREE.ShaderMaterial({
    vertexShader:   volumeVert,
    fragmentShader: volumeFrag,
    uniforms: {
      uColor:       { value: new THREE.Color(0.98, 0.239, 0.0) },
      uLocalCamPos: { value: new THREE.Vector3() },
      uLightDir:    { value: new THREE.Vector3(1.0, 1.2, 0.6).normalize() },
    },
    transparent: true,
    depthWrite:  false,
    side:        THREE.BackSide,
  }));

  const edgeMat = useRef(new THREE.ShaderMaterial({
    vertexShader:   edgeVert,
    fragmentShader: edgeFrag,
    uniforms: { uColor: { value: new THREE.Color(0.98, 0.239, 0.0) } },
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  }));

  // Pre-build edge geometry once
  const edgeGeo = useMemo(() => {
    const box = new THREE.BoxGeometry(2, 2, 2);
    return new THREE.EdgesGeometry(box);
  }, []);

  const _ndc      = new THREE.Vector3();
  const _drifted  = new THREE.Vector3();

  useFrame(({ camera, size, clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Scroll-driven rotation: 90° per capability
    const progress   = scrollRef.current.get();
    const targetRotY = progress * N * (Math.PI / 2);
    groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * 0.08;

    // Update raymarcher local camera + world-space light (stays fixed while cube rotates)
    groupRef.current.updateMatrixWorld();
    const inv = groupRef.current.matrixWorld.clone().invert();
    volMat.current.uniforms.uLocalCamPos.value.copy(camera.position).applyMatrix4(inv);
    volMat.current.uniforms.uLightDir.value.copy(WORLD_LIGHT).transformDirection(inv);

    // Project drifted vertex markers → screen DOM
    VERT_BASES.forEach((base, i) => {
      const ph = DRIFT_PHASES[i];
      _drifted.set(
        base.x + Math.sin(t * 0.38 + ph.px) * 0.07,
        base.y + Math.cos(t * 0.29 + ph.py) * 0.06,
        base.z + Math.sin(t * 0.33 + ph.pz) * 0.07,
      );
      _ndc.copy(_drifted).applyMatrix4(groupRef.current!.matrixWorld).project(camera);
      const el = markerRefs.current[i];
      if (!el) return;
      if (_ndc.z > 1) { el.style.opacity = "0"; return; }
      const sx = (_ndc.x *  0.5 + 0.5) * size.width;
      const sy = (_ndc.y * -0.5 + 0.5) * size.height;
      el.style.opacity   = "1";
      el.style.transform = `translate(calc(${sx}px - 50%), calc(${sy}px - 50%))`;
    });

    // Update tech text
    const deg = ((groupRef.current.rotation.y * 180 / Math.PI) % 360 + 360) % 360;
    if (techTextRef.current) {
      techTextRef.current.textContent =
        `ROT_Y ${deg.toFixed(1).padStart(5, "0")}°  |  POS 0.00, 0.00, 0.00  |  SCALE 1.01  |  CAM Z 5.00`;
    }
  });

  return (
    <group ref={groupRef} scale={1.01}>
      {/* Volumetric fog */}
      <mesh material={volMat.current}>
        <boxGeometry args={[2, 2, 2]} />
      </mesh>
      {/* Edge lines */}
      <lineSegments material={edgeMat.current} geometry={edgeGeo} />
    </group>
  );
}

// ─── SeeTheWorkButton ─────────────────────────────────────────────────────────

function SeeTheWorkButton() {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);

  return (
    <TransitionLink href="/work" className="mt-4 block" onClick={() => setClicked(true)}>
      <motion.div
        className="relative overflow-hidden rounded-full border border-white/30 flex items-center justify-center cursor-pointer"
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => { setHovered(false); if (!clicked) setClicked(false); }}
        style={{ pointerEvents: "auto", width: "clamp(18rem, 38vw, 34rem)", height: "3rem" }}
      >
        {/* Fill bar — sweeps left to right */}
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: hovered || clicked ? 1 : 0 }}
          transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
          style={{
            originX: 0,
            background: clicked ? "#fa3d00" : "#f0f0f0",
          }}
        />
        <span
          className="relative z-10 font-geist tracking-[0.2em] uppercase select-none"
          style={{
            fontSize: "0.65rem",
            color: "#f0f0f0",
            mixBlendMode: "difference",
          }}
        >
          SEE THE WORK
        </span>
      </motion.div>
    </TransitionLink>
  );
}

// ─── Ruler ────────────────────────────────────────────────────────────────────

function Ruler() {
  const TICKS = 9, W = 200, SP = W / (TICKS - 1), CI = Math.floor(TICKS / 2);
  return (
    <div className="absolute" style={{ bottom: "1.5rem", left: "50%", transform: "translateX(-50%)", width: W, pointerEvents: "none" }}>
      <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.2)" }} />
      {Array.from({ length: TICKS }).map((_, i) => (
        <div key={i} style={{ position: "absolute", top: 0, left: i * SP, width: 1, height: i === CI ? 8 : 4, background: "rgba(255,255,255,0.2)", transform: "translateX(-50%)" }} />
      ))}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Capabilities() {
  const sectionRef  = useRef<HTMLElement>(null);
  const markerRefs  = useRef<Array<HTMLSpanElement | null>>(Array(8).fill(null));
  const techTextRef = useRef<HTMLSpanElement | null>(null);
  const [capIndex, setCapIndex]       = useState(0);
  const [titleVisible, setTitleVisible] = useState(true);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const scrollRef = useRef(scrollYProgress);
  useEffect(() => { scrollRef.current = scrollYProgress; }, [scrollYProgress]);

  useEffect(() => {
    return scrollYProgress.on("change", v => {
      const idx = Math.min(Math.floor(v * N), N - 1);
      setCapIndex(prev => {
        if (prev !== idx) {
          setTitleVisible(false);
          setTimeout(() => setTitleVisible(true), 500);
        }
        return idx;
      });
    });
  }, [scrollYProgress]);

  const cap = CAPABILITIES[capIndex];

  return (
    <section
      ref={sectionRef}
      style={{ height: `${N * 100}vh` }}
      className="relative bg-[#0a0a0a]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* Dotted grid — bounded by corner ticks (top-20 / bottom-16 / left-10 / right-10) */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "5rem",       /* matches top-20 */
            bottom: "4rem",    /* matches bottom-16 */
            left: "2.5rem",    /* matches left-10 */
            right: "2.5rem",   /* matches right-10 */
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        <Canvas
          className="absolute inset-0"
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ antialias: true }}
          dpr={[1, 1.5]}
          frameloop="always"
        >
          <TorusRing />
          <GlowCube scrollRef={scrollRef} markerRefs={markerRefs} techTextRef={techTextRef} />
        </Canvas>

        <div className="absolute inset-0 pointer-events-none">

          {/* Technical data — top center, hidden on mobile */}
          <div className="absolute top-20 left-0 right-0 hidden sm:flex justify-center">
            <span
              ref={techTextRef}
              className="font-mono text-white/25 select-none tracking-widest"
              style={{ fontSize: "0.6rem", letterSpacing: "0.15em" }}
            >
              ROT_Y 000.0°  |  POS 0.00, 0.00, 0.00  |  SCALE 1.01  |  CAM Z 5.00
            </span>
          </div>

          {/* Corner markers */}
          <span className="absolute top-20 left-10 font-mono text-white/25 text-lg select-none">+</span>
          <span className="absolute top-20 right-10 font-mono text-white/25 text-lg select-none">+</span>
          <span className="absolute bottom-16 left-10 font-mono text-white/25 text-lg select-none">+</span>
          <span className="absolute bottom-16 right-10 font-mono text-white/25 text-lg select-none">+</span>

          {/* Vertex × markers — DOM updated in useFrame */}
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              ref={el => { markerRefs.current[i] = el; }}
              className="absolute top-0 left-0 font-niagara text-[#f0f0f0] select-none leading-none"
              style={{ fontSize: "1.1rem", WebkitTextStroke: "1.5px #f0f0f0", opacity: 0, willChange: "transform, opacity" }}
            >
              ×
            </span>
          ))}

          {/* Capability text — centred */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-8">
            <AnimatePresence mode="wait">
              {titleVisible && (
                <motion.div
                  key={cap.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center gap-3"
                >
                  <span
                    className="font-niagara text-[#f0f0f0] uppercase leading-tight"
                    style={{ fontSize: "clamp(2.4rem, 4.2vw, 3.84rem)" }}
                  >
                    {cap.title}
                  </span>
                  <span
                    className="font-geist max-w-md leading-relaxed"
                    style={{ fontSize: "clamp(0.8rem, 1.3vw, 1.05rem)", color: "#888880" }}
                  >
                    {cap.sub}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Button stays fixed — outside AnimatePresence */}
            <SeeTheWorkButton />
          </div>

          <Ruler />
        </div>

        {/* Top gradient — blends into page bg */}
        <div
          className="absolute top-0 left-0 right-0 pointer-events-none z-10"
          style={{ height: "18%", background: "linear-gradient(to bottom, #0a0a0a 0%, transparent 100%)" }}
        />
        {/* Bottom gradient — blends into page bg */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
          style={{ height: "18%", background: "linear-gradient(to top, #0a0a0a 0%, transparent 100%)" }}
        />
      </div>
    </section>
  );
}
