import React, { Suspense, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment, Center } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

interface Model3DViewerProps {
  modelUrl: string;
}

function Model({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url);
  const modelRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (modelRef.current) {
      // Gentle auto-rotation
      modelRef.current.rotation.y += 0.003;
    }
  });

  return (
    <Center>
      <primitive 
        ref={modelRef}
        object={gltf.scene} 
        scale={2}
        position={[0, 0, 0]}
      />
    </Center>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial color="#06b6d4" wireframe />
    </mesh>
  );
}

export const Model3DViewer: React.FC<Model3DViewerProps> = ({ modelUrl }) => {
  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden bg-white border-4 border-cyan-400/50 shadow-2xl">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: "#ffffff" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, -5, -5]} intensity={0.3} />
        <pointLight position={[0, 2, 0]} intensity={0.5} />
        
        <Suspense fallback={<LoadingFallback />}>
          <Model url={modelUrl} />
          <Environment preset="studio" />
        </Suspense>
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minDistance={1.5}
          maxDistance={5}
          autoRotate={false}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
};

export default Model3DViewer;
