import { Suspense, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Stage, Center } from '@react-three/drei';
import { type ConformerData } from '../types';
import { getElementColor } from '../utils/chemistry';
import * as THREE from 'three';

interface Molecule3DProps {
  structure: ConformerData;
  autoRotate?: boolean;
}

const ATOM_DETAIL = 32;

export function Molecule3D({ structure, autoRotate = true }: Molecule3DProps) {
  return (
    <div className="w-full h-full bg-[#0B0E14] relative group">
      <Suspense fallback={
        <div className="flex items-center justify-center h-full text-slate-500">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full mb-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Compiling 3D Stage</p>
          </div>
        </div>
      }>
        <Canvas 
          shadows 
          dpr={[1, 2]} 
          camera={{ position: [0, 0, 15], fov: 50 }}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={['#0B0E14']} />
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <Stage adjustCamera intensity={0.5} environment="city" preset="rembrandt" contactShadow={false}>
            <Center top>
              <MoleculeContent structure={structure} />
            </Center>
          </Stage>

          <OrbitControls 
            enablePan={true} 
            enableZoom={true} 
            autoRotate={autoRotate} 
            autoRotateSpeed={0.5}
            makeDefault
          />
          
          <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
        </Canvas>
      </Suspense>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {Array.from(new Set(structure.atoms.map(a => a.element))).map(el => (
          <div key={el} className="flex items-center gap-1.5 text-[10px] font-bold text-white uppercase tracking-wider">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getElementColor(el) }} />
            {el}
          </div>
        ))}
      </div>

      <div className="absolute top-4 right-4 z-10">
        <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
          3D Interactive Model
        </div>
      </div>
    </div>
  );
}

function MoleculeContent({ structure }: { structure: ConformerData }) {
  // Group atoms by element for instanced rendering
  const atomsByElement = useMemo(() => {
    const groups: Record<string, typeof structure.atoms> = {};
    structure.atoms.forEach(atom => {
      if (!groups[atom.element]) groups[atom.element] = [];
      groups[atom.element].push(atom);
    });
    return groups;
  }, [structure]);

  return (
    <group>
      {/* Optimized Atoms using InstancedMesh per element */}
      {Object.entries(atomsByElement).map(([element, atoms]) => (
        <AtomInstances key={element} element={element} atoms={atoms} />
      ))}

      {/* Optimized Bonds using InstancedMesh */}
      <BondInstances structure={structure} />
    </group>
  );
}

function AtomInstances({ element, atoms }: { element: string, atoms: typeof structure.atoms }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const radius = getElementRadius(element);
  const color = getElementColor(element);

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    atoms.forEach((atom, i) => {
      dummy.position.set(atom.x, atom.y, atom.z);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [atoms]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, atoms.length]} castShadow receiveShadow>
      <sphereGeometry args={[radius, ATOM_DETAIL, ATOM_DETAIL]} />
      <meshStandardMaterial 
        color={color} 
        roughness={0.1} 
        metalness={0.4}
        emissive={color}
        emissiveIntensity={0.1}
      />
    </instancedMesh>
  );
}

function BondInstances({ structure }: { structure: ConformerData }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const validBonds = useMemo(() => {
    return structure.bonds.filter(bond => {
      const a1 = structure.atoms[bond.aid1 - 1];
      const a2 = structure.atoms[bond.aid2 - 1];
      return a1 && a2;
    });
  }, [structure]);

  useEffect(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const up = new THREE.Vector3(0, 1, 0);

    validBonds.forEach((bond, i) => {
      const a1 = structure.atoms[bond.aid1 - 1];
      const a2 = structure.atoms[bond.aid2 - 1];
      
      const v1 = new THREE.Vector3(a1.x, a1.y, a1.z);
      const v2 = new THREE.Vector3(a2.x, a2.y, a2.z);
      const direction = v2.clone().sub(v1);
      const length = direction.length();
      
      dummy.position.copy(v1).add(direction.clone().multiplyScalar(0.5));
      dummy.scale.set(1, length, 1);
      dummy.quaternion.setFromUnitVectors(up, direction.clone().normalize());
      dummy.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [validBonds, structure.atoms]);

  if (validBonds.length === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, validBonds.length]} castShadow>
      <cylinderGeometry args={[0.08, 0.08, 1, 12]} />
      <meshStandardMaterial color="#475569" roughness={0.6} metalness={0.1} />
    </instancedMesh>
  );
}

function getElementRadius(symbol: string): number {
  const radii: Record<string, number> = {
    H: 0.25,
    C: 0.45,
    N: 0.4,
    O: 0.4,
    S: 0.55,
    P: 0.55,
    Cl: 0.55,
    Br: 0.65,
    I: 0.75,
    F: 0.35,
    Na: 0.6,
    Mg: 0.6,
    K: 0.7,
    Ca: 0.7,
    Fe: 0.65,
    Cu: 0.6,
    Zn: 0.6
  };
  return radii[symbol] || 0.45;
}
