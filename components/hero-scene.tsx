"use client";

import { Component, type ErrorInfo, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Group, Points as ThreePoints } from "three";
import { SCENES, type SceneId } from "@/lib/scenes/registry";

class SceneErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("The 3D kitchen scene could not be rendered.", error, info);
  }

  render() {
    return this.state.hasError ? <div className="scene-fallback" aria-hidden="true" /> : this.props.children;
  }
}

interface SceneVisualsProps {
  sceneId: SceneId;
  ambientMode?: boolean;
}

function SceneObjects({ sceneId, ambientMode }: SceneVisualsProps) {
  const group = useRef<Group>(null);
  const pointsRef = useRef<ThreePoints>(null);
  const config = SCENES[sceneId] ?? SCENES.kitchen;

  // Generate dynamic particles themed by scene
  const { positions, originalY } = useMemo(() => {
    const count = ambientMode ? Math.floor(config.particleCount * 0.6) : config.particleCount;
    const pos = new Float32Array(count * 3);
    const orig = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const x = (Math.random() - 0.5) * 12;
      const y = (Math.random() - 0.5) * 8;
      const z = (Math.random() - 0.5) * 4;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      orig[i] = y;
    }
    return { positions: pos, originalY: orig };
  }, [config.particleCount, ambientMode]);

  // Gentle particle drift and cursor parallax
  useFrame((state, delta) => {
    if (group.current) {
      const targetRotY = state.pointer.x * (ambientMode ? 0.05 : 0.18);
      const targetRotX = -state.pointer.y * (ambientMode ? 0.03 : 0.12);
      group.current.rotation.y += (targetRotY - group.current.rotation.y) * delta * 2;
      group.current.rotation.x += (targetRotX - group.current.rotation.x) * delta * 2;

      // Slow gentle autonomous oscillation
      const time = state.clock.getElapsedTime();
      group.current.position.y = Math.sin(time * 0.5) * (ambientMode ? 0.05 : 0.12);
    }

    if (pointsRef.current) {
      const posAttr = pointsRef.current.geometry.attributes.position;
      const arr = posAttr.array as Float32Array;
      const speed = ambientMode ? 0.3 : 0.8;
      const time = state.clock.getElapsedTime() * speed;

      for (let i = 0; i < originalY.length; i += 1) {
        // Floating/drifting upwards or pulsating based on scene
        if (sceneId === "grill" || sceneId === "spice") {
          // rising embers / steam
          arr[i * 3 + 1] = ((originalY[i] + time * 0.4 + 4) % 8) - 4;
          arr[i * 3] += Math.sin(time + i) * 0.002;
        } else if (sceneId === "ocean") {
          // bubbling swirl
          arr[i * 3 + 1] = ((originalY[i] + time * 0.3 + 4) % 8) - 4;
          arr[i * 3] += Math.cos(time * 0.6 + i) * 0.003;
        } else {
          // gentle float
          arr[i * 3 + 1] = originalY[i] + Math.sin(time + i * 0.1) * 0.15;
        }
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <>
      <ambientLight intensity={ambientMode ? 1.2 : 1.8} />
      <directionalLight
        position={[5, 6, 4]}
        intensity={ambientMode ? 1.8 : 3.2}
        color={config.lightColor}
      />
      <pointLight
        position={[-4, -2, 2]}
        intensity={ambientMode ? 8 : 16}
        color={config.secondaryLight}
        distance={14}
      />

      <group ref={group} scale={ambientMode ? 0.82 : 1}>
        {/* Motif Renderers based on sceneId */}
        {sceneId === "spice" && (
          <>
            {/* Pilau Saffron Rings & Cardamom geometric solids */}
            <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.5}>
              <mesh position={[1.5, 0.3, 0]}>
                <torusGeometry args={[1.5, 0.28, 24, 72]} />
                <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.25} />
              </mesh>
              <mesh position={[1.5, 0.3, -0.1]} scale={0.78}>
                <torusGeometry args={[1.5, 0.1, 16, 60]} />
                <meshStandardMaterial color="#fbbf24" roughness={0.4} />
              </mesh>
            </Float>

            {/* Floating Cardamom Pod shape */}
            <Float speed={1.8} rotationIntensity={0.45} floatIntensity={0.8}>
              <mesh position={[-1.4, 1.2, 0.3]} rotation={[0.4, 0.8, 0.2]}>
                <octahedronGeometry args={[0.75, 0]} />
                <meshStandardMaterial color="#b45309" roughness={0.5} />
              </mesh>
            </Float>

            {/* Golden Clove & Saffron Sphere */}
            <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.6}>
              <mesh position={[-1.2, -1.1, 0.5]}>
                <sphereGeometry args={[0.55, 32, 32]} />
                <meshStandardMaterial color="#d97706" roughness={0.2} metalness={0.2} />
              </mesh>
            </Float>
          </>
        )}

        {sceneId === "grill" && (
          <>
            {/* Glowing Embers & Charred geometry */}
            <Float speed={1.5} rotationIntensity={0.35} floatIntensity={0.6}>
              <mesh position={[1.4, 0.2, 0]}>
                <dodecahedronGeometry args={[1.2, 0]} />
                <meshStandardMaterial color="#ea580c" roughness={0.4} emissive="#c2410c" emissiveIntensity={0.3} />
              </mesh>
            </Float>

            <Float speed={2.0} rotationIntensity={0.6} floatIntensity={0.9}>
              <mesh position={[-1.3, 1.3, 0.4]} rotation={[0.5, 0.3, 0.7]}>
                <octahedronGeometry args={[0.8, 0]} />
                <meshStandardMaterial color="#f97316" roughness={0.3} emissive="#f97316" emissiveIntensity={0.25} />
              </mesh>
            </Float>

            <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.5}>
              <mesh position={[-1.1, -1.0, 0.6]}>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial color="#7c2d12" roughness={0.6} metalness={0.1} />
              </mesh>
            </Float>
          </>
        )}

        {sceneId === "ocean" && (
          <>
            {/* Flowing Wave Torus Knot & Aquatic Bubbles */}
            <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.7}>
              <mesh position={[1.4, 0.2, 0]}>
                <torusKnotGeometry args={[1.1, 0.25, 64, 16]} />
                <meshStandardMaterial color="#06b6d4" roughness={0.15} metalness={0.35} />
              </mesh>
            </Float>

            <Float speed={1.6} rotationIntensity={0.2} floatIntensity={0.8}>
              <mesh position={[-1.4, 1.1, 0.3]}>
                <sphereGeometry args={[0.7, 32, 32]} />
                <meshStandardMaterial color="#22d3ee" roughness={0.1} transparent opacity={0.85} />
              </mesh>
            </Float>

            <Float speed={1.4} rotationIntensity={0.3} floatIntensity={0.6}>
              <mesh position={[-1.2, -1.1, 0.5]}>
                <sphereGeometry args={[0.45, 24, 24]} />
                <meshStandardMaterial color="#67e8f9" roughness={0.2} />
              </mesh>
            </Float>
          </>
        )}

        {sceneId === "dessert" && (
          <>
            {/* Sweet Swirl Rings, Cream Spheres, Sprinkles */}
            <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.6}>
              <mesh position={[1.5, 0.3, 0]}>
                <torusGeometry args={[1.4, 0.3, 24, 64]} />
                <meshStandardMaterial color="#ec4899" roughness={0.25} />
              </mesh>
            </Float>

            <Float speed={1.7} rotationIntensity={0.4} floatIntensity={0.8}>
              <mesh position={[-1.3, 1.1, 0.3]}>
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshStandardMaterial color="#f472b6" roughness={0.3} />
              </mesh>
            </Float>

            <Float speed={1.4} rotationIntensity={0.5} floatIntensity={0.5}>
              <mesh position={[-1.1, -1.0, 0.5]}>
                <sphereGeometry args={[0.55, 32, 32]} />
                <meshStandardMaterial color="#fbcfe8" roughness={0.35} />
              </mesh>
            </Float>
          </>
        )}

        {sceneId === "breakfast" && (
          <>
            {/* Golden Yolk Sphere & Warm Amber Halo */}
            <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
              <mesh position={[1.5, 0.25, 0]}>
                <sphereGeometry args={[1.1, 32, 32]} />
                <meshStandardMaterial color="#eab308" roughness={0.2} metalness={0.1} />
              </mesh>
            </Float>

            <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.7}>
              <mesh position={[-1.3, 1.2, 0.3]}>
                <torusGeometry args={[1.1, 0.22, 20, 60]} />
                <meshStandardMaterial color="#facc15" roughness={0.3} />
              </mesh>
            </Float>

            <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
              <mesh position={[-1.2, -1.1, 0.5]}>
                <sphereGeometry args={[0.6, 28, 28]} />
                <meshStandardMaterial color="#fef08a" roughness={0.3} />
              </mesh>
            </Float>
          </>
        )}

        {(sceneId === "kitchen" || sceneId === "greens") && (
          <>
            {/* Classic Ivy Botanic Rings & Herb Geometries */}
            <Float speed={1.2} rotationIntensity={0.16} floatIntensity={0.45}>
              <mesh position={[1.65, 0.25, 0]}>
                <torusGeometry args={[1.45, 0.33, 24, 80]} />
                <meshStandardMaterial color={config.accent} roughness={0.28} metalness={0.1} />
              </mesh>
              <mesh position={[1.65, 0.25, -0.1]} scale={0.86}>
                <torusGeometry args={[1.45, 0.11, 18, 72]} />
                <meshStandardMaterial color="#e9ddbd" roughness={0.34} />
              </mesh>
            </Float>

            <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.7}>
              <mesh position={[-1.35, 1.1, 0.35]} rotation={[0.2, 0.5, 0.4]}>
                <icosahedronGeometry args={[0.82, 1]} />
                <meshStandardMaterial color="#65a30d" roughness={0.48} />
              </mesh>
            </Float>

            <Float speed={1.3} rotationIntensity={0.5} floatIntensity={0.5}>
              <mesh position={[-1.25, -1.05, 0.6]} rotation={[0.35, 0.1, -0.45]}>
                <sphereGeometry args={[0.56, 32, 32]} />
                <meshStandardMaterial color="#ca8a04" roughness={0.35} />
              </mesh>
            </Float>
          </>
        )}

        {/* Accent satellite sparkles */}
        <Float speed={2.0} rotationIntensity={0.7} floatIntensity={0.9}>
          <mesh position={[0.05, 2.15, -0.6]}>
            <sphereGeometry args={[0.18, 20, 20]} />
            <meshStandardMaterial color={config.particleColor} emissive={config.accent} emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[3.4, -1.6, -0.3]}>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshStandardMaterial color={config.accent} />
          </mesh>
          <mesh position={[-3.3, -0.2, -0.5]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color={config.particleColor} />
          </mesh>
        </Float>
      </group>

      {/* Dynamic 3D Particle Cloud */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
            count={positions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={config.particleColor}
          size={ambientMode ? 0.02 : 0.032}
          transparent
          opacity={ambientMode ? 0.35 : 0.65}
          sizeAttenuation
        />
      </points>
    </>
  );
}

export function HeroScene({
  sceneId = "kitchen",
  ambientMode = false,
}: {
  sceneId?: SceneId;
  ambientMode?: boolean;
}) {
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

    function checkSupport() {
      try {
        const canvas = document.createElement("canvas");
        setWebglAvailable(
          !motionPreference.matches && Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")),
        );
      } catch {
        setWebglAvailable(false);
      }
    }

    checkSupport();
    motionPreference.addEventListener("change", checkSupport);
    return () => motionPreference.removeEventListener("change", checkSupport);
  }, []);

  // Update dynamic CSS theme variables when sceneId changes
  useEffect(() => {
    const scene = SCENES[sceneId] ?? SCENES.kitchen;
    const root = document.documentElement;
    root.style.setProperty("--accent", scene.accent);
    root.style.setProperty("--accent-soft", scene.accentSoft);
    root.style.setProperty("--accent-glow", scene.accentGlow);
    root.style.setProperty("--bg-dark", scene.bgDark);
  }, [sceneId]);

  if (webglAvailable !== true) {
    return <div className="scene-fallback" aria-hidden="true" />;
  }

  return (
    <div className={`hero-scene ${ambientMode ? "ambient" : ""}`} aria-hidden="true">
      <SceneErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, ambientMode ? 9.5 : 8], fov: 40 }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
          fallback={<div className="scene-fallback" />}
        >
          <SceneObjects sceneId={sceneId} ambientMode={ambientMode} />
        </Canvas>
      </SceneErrorBoundary>
    </div>
  );
}

export default HeroScene;

