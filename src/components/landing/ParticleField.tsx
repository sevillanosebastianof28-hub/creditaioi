import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 200 }) {
  const mesh = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      // Emerald color variations
      colors[i * 3] = 0.06 + Math.random() * 0.1; // R
      colors[i * 3 + 1] = 0.6 + Math.random() * 0.2; // G
      colors[i * 3 + 2] = 0.4 + Math.random() * 0.2; // B
      
      sizes[i] = Math.random() * 2 + 0.5;
    }
    
    return { positions, colors, sizes };
  }, [count]);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particles.colors.length / 3}
          array={particles.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

function FloatingRing({ position, scale, rotationSpeed }: { 
  position: [number, number, number]; 
  scale: number;
  rotationSpeed: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * rotationSpeed;
      meshRef.current.rotation.z = state.clock.elapsedTime * rotationSpeed * 0.5;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <torusGeometry args={[1, 0.02, 16, 100]} />
      <meshBasicMaterial color="#10b981" transparent opacity={0.3} />
    </mesh>
  );
}

export function ParticleField() {
  return (
    <div className="absolute inset-0 -z-5 opacity-40">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
        <Particles count={150} />
        <FloatingRing position={[-3, 2, -2]} scale={1.5} rotationSpeed={0.3} />
        <FloatingRing position={[4, -1, -3]} scale={2} rotationSpeed={0.2} />
        <FloatingRing position={[0, 3, -4]} scale={1} rotationSpeed={0.4} />
      </Canvas>
    </div>
  );
}
