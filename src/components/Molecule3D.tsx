import { Suspense, useMemo, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Stage, Center, Html, PerspectiveCamera, OrthographicCamera } from '@react-three/drei';
import { type ConformerData } from '../types';
import { getElementColor } from '../utils/chemistry';
import * as THREE from 'three';

interface Molecule3DProps {
  structure: ConformerData;
  autoRotate?: boolean;
  showBondLengths?: boolean;
  showBondAngles?: boolean;
  projection?: 'perspective' | 'orthographic';
}

export interface Molecule3DHandle {
  takeSnapshot: () => void;
  resetCamera: () => void;
}

const ATOM_DETAIL = 32;

export const Molecule3D = forwardRef<Molecule3DHandle, Molecule3DProps>(({ 
  structure, 
  autoRotate = true,
  showBondLengths = false,
  showBondAngles = false,
  projection = 'perspective'
}, ref) => {
  const controlsRef = useRef<any>(null);
  const snapshotRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (controlsRef.current) {
        controlsRef.current.reset();
      }
    },
    takeSnapshot: () => {
      if (snapshotRef.current) {
        snapshotRef.current.takeSnapshot();
      }
    }
  }));

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
          gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
        >
          <color attach="background" args={['#0B0E14']} />
          
          {projection === 'perspective' ? (
            <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={50} />
          ) : (
            <OrthographicCamera makeDefault position={[0, 0, 15]} zoom={40} />
          )}

          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          
          <Stage adjustCamera intensity={0.5} environment="city" preset="rembrandt">
            <Center top>
              <MoleculeContent 
                structure={structure} 
                showBondLengths={showBondLengths}
                showBondAngles={showBondAngles}
              />
            </Center>
          </Stage>

          <OrbitControls 
            ref={controlsRef}
            enablePan={true} 
            enableZoom={true} 
            autoRotate={autoRotate} 
            autoRotateSpeed={0.5}
            makeDefault
          />
          
          <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
          
          <SnapshotHandler ref={snapshotRef} />
        </Canvas>
      </Suspense>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 bg-black/40 backdrop-blur-md p-3 rounded-xl border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
        {Array.from(new Set(structure.atoms.map(a => a.element))).map(el => (
          <div key={el} className="flex items-center gap-1.5 text-[10px] font-bold text-white uppercase tracking-wider">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getElementColor(el) }} />
            <span>{el}</span>
          </div>
        ))}
      </div>

      <div className="absolute top-4 right-4 z-10">
        <div className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
          {projection} view
        </div>
      </div>
    </div>
  );
});

const SnapshotHandler = forwardRef((_props, ref) => {
  const { gl, scene, camera } = useThree();

  useImperativeHandle(ref, () => ({
    takeSnapshot: () => {
      gl.render(scene, camera);
      const link = document.createElement('a');
      link.setAttribute('download', 'chemviz-snapshot.png');
      link.setAttribute('href', gl.domElement.toDataURL('image/png').replace('image/png', 'image/octet-stream'));
      link.click();
    }
  }), [gl, scene, camera]);

  return null;
});

function MoleculeContent({ 
  structure, 
  showBondLengths,
  showBondAngles 
}: { 
  structure: ConformerData;
  showBondLengths: boolean;
  showBondAngles: boolean;
}) {
  const atomsByElement = useMemo(() => {
    const groups: Record<string, typeof structure.atoms> = {};
    structure.atoms.forEach(atom => {
      if (!groups[atom.element]) groups[atom.element] = [];
      groups[atom.element].push(atom);
    });
    return groups;
  }, [structure]);

  // Pre-calculate angles for triplets
  const angles = useMemo(() => {
    if (!showBondAngles) return [];
    const tripletAngles: { pos: [number, number, number], angle: string }[] = [];
    
    // For each atom, find all unique pairs of neighbors
    structure.atoms.forEach((atom, i) => {
      const aid = i + 1;
      const neighbors = structure.bonds
        .filter(b => b.aid1 === aid || b.aid2 === aid)
        .map(b => b.aid1 === aid ? b.aid2 : b.aid1);
      
      if (neighbors.length >= 2) {
        const center = new THREE.Vector3(atom.x, atom.y, atom.z);
        
        for (let j = 0; j < neighbors.length; j++) {
          for (let k = j + 1; k < neighbors.length; k++) {
            const n1Index = neighbors[j] - 1;
            const n2Index = neighbors[k] - 1;
            const n1 = structure.atoms[n1Index];
            const n2 = structure.atoms[n2Index];
            
            if (n1 && n2) {
              const v1 = new THREE.Vector3(n1.x, n1.y, n1.z).sub(center);
              const v2 = new THREE.Vector3(n2.x, n2.y, n2.z).sub(center);
              
              const angleRad = v1.angleTo(v2);
              const angleDeg = (angleRad * 180 / Math.PI).toFixed(1);
              
              // Position label slightly offset from center towards the middle of neighbors
              const labelPos = center.clone().add(v1.clone().add(v2).normalize().multiplyScalar(0.5));
              tripletAngles.push({
                pos: [labelPos.x, labelPos.y, labelPos.z],
                angle: `${angleDeg}°`
              });
            }
          }
        }
      }
    });
    
    return tripletAngles;
  }, [structure, showBondAngles]);

  return (
    <group>
      {Object.entries(atomsByElement).map(([element, atoms]) => (
        <AtomInstances key={element} element={element} atoms={atoms} />
      ))}

      <BondInstances structure={structure} showBondLengths={showBondLengths} />

      {showBondAngles && angles.map((a, i) => (
        <Html key={`angle-${i}`} position={a.pos} center pointerEvents="none">
          <div className="bg-emerald-500/80 backdrop-blur-sm text-white text-[8px] font-bold px-1 rounded-sm border border-emerald-400/50 whitespace-nowrap shadow-sm">
            {a.angle}
          </div>
        </Html>
      ))}
    </group>
  );
}

function AtomInstances({ element, atoms }: { element: string, atoms: ConformerData['atoms'] }) {
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

function BondInstances({ structure, showBondLengths }: { structure: ConformerData, showBondLengths: boolean }) {
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
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, validBonds.length]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 1, 12]} />
        <meshStandardMaterial color="#475569" roughness={0.6} metalness={0.1} />
      </instancedMesh>

      {showBondLengths && validBonds.map((bond, i) => {
        const a1 = structure.atoms[bond.aid1 - 1];
        const a2 = structure.atoms[bond.aid2 - 1];
        if (!a1 || !a2) return null;
        
        const v1 = new THREE.Vector3(a1.x, a1.y, a1.z);
        const v2 = new THREE.Vector3(a2.x, a2.y, a2.z);
        const mid = v1.clone().add(v2).multiplyScalar(0.5);
        const length = v1.distanceTo(v2).toFixed(2);
        
        return (
          <Html key={`len-${i}`} position={[mid.x, mid.y, mid.z]} center pointerEvents="none">
            <div className="bg-blue-500/80 backdrop-blur-sm text-white text-[8px] font-bold px-1 rounded-sm border border-blue-400/50 whitespace-nowrap shadow-sm">
              {length}Å
            </div>
          </Html>
        );
      })}
    </group>
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
