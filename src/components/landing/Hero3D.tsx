import { Canvas } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, OrbitControls } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

function AnimatedSphere({ position, color, speed, distort, scale }: { 
  position: [number, number, number]; 
  color: string; 
  speed: number;
  distort: number;
  scale: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={scale} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

function CreditCard({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = rotation[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} rotation={rotation}>
        <boxGeometry args={[2.5, 1.5, 0.05]} />
        <meshStandardMaterial
          color="#10b981"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#10b981" />
      
      {/* Main large sphere */}
      <AnimatedSphere 
        position={[2, 0, 0]} 
        color="#10b981" 
        speed={1.5} 
        distort={0.4} 
        scale={1.8}
      />
      
      {/* Smaller accent spheres */}
      <AnimatedSphere 
        position={[-2.5, 1.5, -1]} 
        color="#059669" 
        speed={2} 
        distort={0.3} 
        scale={0.6}
      />
      <AnimatedSphere 
        position={[-1.5, -1.5, 0.5]} 
        color="#34d399" 
        speed={1.8} 
        distort={0.5} 
        scale={0.4}
      />
      <AnimatedSphere 
        position={[3.5, 1.8, -0.5]} 
        color="#6ee7b7" 
        speed={2.2} 
        distort={0.25} 
        scale={0.35}
      />
      
      {/* Credit cards floating */}
      <CreditCard position={[-2, 0, 1]} rotation={[0.2, 0.5, 0.1]} />
      <CreditCard position={[0.5, -1.2, 0.5]} rotation={[-0.1, -0.3, -0.05]} />
      
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
    </>
  );
}

export function Hero3D() {
  return (
    <div className="absolute inset-0 -z-10 opacity-60">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
