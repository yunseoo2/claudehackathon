import { useState, useEffect, useRef, memo, ReactNode } from 'react';
import * as THREE from 'three';
import { Canvas, createPortal, useFrame, useThree, ThreeElements } from '@react-three/fiber';
import {
  useFBO,
  useGLTF,
  MeshTransmissionMaterial,
  Text
} from '@react-three/drei';
import { easing } from 'maath';

type Mode = 'lens' | 'bar' | 'cube';

type ModeProps = Record<string, unknown>;

interface FluidGlassProps {
  mode?: Mode;
  lensProps?: ModeProps;
  barProps?: ModeProps;
  cubeProps?: ModeProps;
}

export default function FluidGlass({ mode = 'lens', lensProps = {}, barProps = {}, cubeProps = {} }: FluidGlassProps) {
  const Wrapper = mode === 'bar' ? Bar : mode === 'cube' ? Cube : Lens;
  const modeProps = mode === 'bar' ? barProps : mode === 'cube' ? cubeProps : lensProps;

  return (
    <Canvas
      camera={{ position: [0, 0, 20], fov: 15 }}
      gl={{
        alpha: true,
        antialias: true,
        toneMapping: THREE.NoToneMapping
      }}
    >
      <Wrapper modeProps={modeProps}>
        <Typography />
        <Images />
      </Wrapper>
    </Canvas>
  );
}

type MeshProps = ThreeElements['mesh'];

interface ModeWrapperProps extends MeshProps {
  children?: ReactNode;
  glb: string;
  geometryKey: string;
  lockToBottom?: boolean;
  followPointer?: boolean;
  modeProps?: ModeProps;
}

interface ZoomMaterial extends THREE.Material {
  zoom: number;
}

interface ZoomMesh extends THREE.Mesh<THREE.BufferGeometry, ZoomMaterial> {}

type ZoomGroup = THREE.Group & { children: ZoomMesh[] };

const ModeWrapper = memo(function ModeWrapper({
  children,
  glb,
  geometryKey,
  lockToBottom = false,
  followPointer = true,
  modeProps = {},
  ...props
}: ModeWrapperProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const { nodes } = useGLTF(glb);
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState<THREE.Scene>(() => new THREE.Scene());
  const geoWidthRef = useRef<number>(1);

  useEffect(() => {
    const geo = (nodes[geometryKey] as THREE.Mesh)?.geometry;
    geo.computeBoundingBox();
    geoWidthRef.current = geo.boundingBox!.max.x - geo.boundingBox!.min.x || 1;
  }, [nodes, geometryKey]);

  useFrame((state, delta) => {
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
    const destY = lockToBottom ? -v.height / 2 + 0.2 : followPointer ? (pointer.y * v.height) / 2 : 0;
    easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

    if ((modeProps as { scale?: number }).scale == null) {
      const maxWorld = v.width * 0.9;
      const desired = maxWorld / geoWidthRef.current;
      ref.current.scale.setScalar(Math.min(0.15, desired));
    }

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
  });

  const { scale, ior, thickness, anisotropy, chromaticAberration, ...extraMat } = modeProps as {
    scale?: number;
    ior?: number;
    thickness?: number;
    anisotropy?: number;
    chromaticAberration?: number;
    [key: string]: unknown;
  };

  return (
    <>
      {createPortal(children, scene)}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent />
      </mesh>
      <mesh
        ref={ref}
        scale={scale ?? 0.15}
        rotation-x={Math.PI / 2}
        geometry={(nodes[geometryKey] as THREE.Mesh)?.geometry}
        {...props}
      >
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior ?? 1.15}
          thickness={thickness ?? 5}
          anisotropy={anisotropy ?? 0.01}
          chromaticAberration={chromaticAberration ?? 0.1}
          {...(typeof extraMat === 'object' && extraMat !== null ? extraMat : {})}
        />
      </mesh>
    </>
  );
});

function Lens({ modeProps, ...p }: { modeProps?: ModeProps } & MeshProps) {
  return <ModeWrapper glb="/assets/3d/lens.glb" geometryKey="Cylinder" followPointer modeProps={modeProps} {...p} />;
}

function Cube({ modeProps, ...p }: { modeProps?: ModeProps } & MeshProps) {
  return <ModeWrapper glb="/assets/3d/cube.glb" geometryKey="Cube" followPointer modeProps={modeProps} {...p} />;
}

function Bar({ modeProps = {}, ...p }: { modeProps?: ModeProps } & MeshProps) {
  const defaultMat = {
    transmission: 1,
    roughness: 0,
    thickness: 10,
    ior: 1.15,
    color: '#ffffff',
    attenuationColor: '#ffffff',
    attenuationDistance: 0.25
  };

  return (
    <ModeWrapper
      glb="/assets/3d/bar.glb"
      geometryKey="Cube"
      lockToBottom
      followPointer={false}
      modeProps={{ ...defaultMat, ...modeProps }}
      {...p}
    />
  );
}

function Images() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state: { clock: { getElapsedTime: () => number } }) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current && groupRef.current.children) {
      groupRef.current.children.forEach((child: THREE.Object3D, i: number) => {
        const offset = i * 0.8;
        const scale = 1 + Math.sin(time * 0.3 + offset) * 0.05;
        child.scale.setScalar(scale);
        child.position.y = Math.sin(time * 0.2 + offset) * 0.3 + (i % 2 === 0 ? 1 : -1);
        child.position.x = Math.cos(time * 0.15 + offset) * 0.4 + (i - 2) * 1.5;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Animated gradient blobs behind the text */}
      <mesh position={[-2, 1, -3]}>
        <circleGeometry args={[2.5, 64]} />
        <meshBasicMaterial color="#8b5cf6" transparent opacity={0.4} />
      </mesh>
      <mesh position={[2, -1, -3.5]}>
        <circleGeometry args={[2.8, 64]} />
        <meshBasicMaterial color="#06b6d4" transparent opacity={0.35} />
      </mesh>
      <mesh position={[-1.5, -1.5, -4]}>
        <circleGeometry args={[2.2, 64]} />
        <meshBasicMaterial color="#ec4899" transparent opacity={0.38} />
      </mesh>
      <mesh position={[1.5, 1.8, -3.2]}>
        <circleGeometry args={[2.6, 64]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.36} />
      </mesh>
      <mesh position={[0, 0, -4.5]}>
        <circleGeometry args={[3, 64]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.32} />
      </mesh>
    </group>
  );
}

function Typography() {
  return (
    <group>
      <Text
        position={[0, 0, 0]}
        fontSize={0.8}
        letterSpacing={-0.05}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        Continuum
      </Text>
      <Text
        position={[0, -0.7, 0]}
        fontSize={0.25}
        letterSpacing={-0.02}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={6}
        textAlign="center"
      >
        Organizational Memory with Resilience
      </Text>
    </group>
  );
}
