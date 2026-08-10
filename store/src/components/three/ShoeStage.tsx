import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshReflectorMaterial, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from '../../lib/gsap';

/**
 * WebGL showcase for the footwear section.
 *
 * The catalogue ships flat product renders rather than GLTF models, so this is
 * not a rotatable mesh — it is a lit, reflected billboard. What WebGL buys here
 * is real: a mirrored floor that responds to the light rig, and a shader wipe
 * between colourways with a chromatic split along the boundary. Neither is
 * reproducible in CSS, and both read as a premium product moment.
 *
 * Drop a `.glb` into the product data's `model3d` field and this component is
 * the only place that needs to change.
 */

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform sampler2D uFrom;
  uniform sampler2D uTo;
  uniform float uProgress;
  uniform float uTime;
  varying vec2 vUv;

  // Cheap value noise, enough to break the wipe edge into something organic.
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  void main() {
    float n = noise(vUv * 6.0 + uTime * 0.05) * 0.16;
    // Diagonal sweep so the transition has direction rather than just fading.
    float axis = vUv.x * 0.7 + vUv.y * 0.3 + n;
    float edge = smoothstep(uProgress - 0.18, uProgress + 0.18, axis);

    // Split the channels slightly across the boundary for a lens-like fringe.
    float fringe = (1.0 - abs(edge - 0.5) * 2.0) * 0.012;

    vec4 from = texture2D(uFrom, vUv + vec2(fringe, 0.0));
    vec4 to = texture2D(uTo, vUv - vec2(fringe, 0.0));

    vec4 color = mix(to, from, edge);

    // Lift the transition line so the swap has a visible energy front.
    float band = smoothstep(0.42, 0.5, 1.0 - abs(edge - 0.5) * 2.0);
    color.rgb += band * 0.22 * color.a;

    if (color.a < 0.01) discard;
    gl_FragColor = color;
  }
`;

interface ShoePlaneProps {
  images: string[];
  index: number;
  aspect: number;
}

function ShoePlane({ images, index, aspect }: ShoePlaneProps) {
  const textures = useTexture(images);
  const mesh = useRef<THREE.Mesh>(null);
  const previous = useRef(index);

  useEffect(() => {
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      t.needsUpdate = true;
    });
  }, [textures]);

  /*
   * uProgress runs 0 -> 1 for each swap: at 0 the shader resolves to uFrom (the
   * outgoing colourway), at 1 to uTo (the incoming one). It rests at 1 so the
   * settled state is always the current selection.
   */
  const uniforms = useMemo(
    () => ({
      uFrom: { value: textures[index] },
      uTo: { value: textures[index] },
      uProgress: { value: 1 },
      uTime: { value: 0 },
    }),
    // Built once; texture swaps are handled imperatively below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (previous.current === index) return;
    uniforms.uFrom.value = textures[previous.current];
    uniforms.uTo.value = textures[index];
    uniforms.uProgress.value = 0;
    previous.current = index;
    gsap.to(uniforms.uProgress, { value: 1, duration: 0.9, ease: 'power2.inOut' });
  }, [index, textures, uniforms]);

  useFrame((state, delta) => {
    uniforms.uTime.value += delta;
    if (!mesh.current) return;
    const { pointer } = state;
    // Gentle parallax so the billboard reads as an object in space.
    mesh.current.rotation.y += (pointer.x * 0.22 - mesh.current.rotation.y) * 0.05;
    mesh.current.rotation.x += (-pointer.y * 0.12 - mesh.current.rotation.x) * 0.05;
    mesh.current.position.y = 0.62 + Math.sin(state.clock.elapsedTime * 0.9) * 0.045;
  });

  const height = 2.1;

  return (
    <mesh ref={mesh} position={[0, 0.62, 0]}>
      <planeGeometry args={[height * aspect, height]} />
      <shaderMaterial
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        uniforms={uniforms}
        transparent
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function Floor({ accent }: { accent: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.72, 0]}>
      <planeGeometry args={[24, 24]} />
      <MeshReflectorMaterial
        blur={[320, 90]}
        resolution={512}
        mixBlur={1}
        mixStrength={38}
        roughness={0.92}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.3}
        color={accent}
        metalness={0.55}
        mirror={0.55}
      />
    </mesh>
  );
}

function Rig() {
  const { camera } = useThree();
  useFrame((state) => {
    camera.position.x += (state.pointer.x * 0.35 - camera.position.x) * 0.04;
    camera.position.y += (0.75 + state.pointer.y * 0.18 - camera.position.y) * 0.04;
    camera.lookAt(0, 0.45, 0);
  });
  return null;
}

interface ShoeStageProps {
  images: string[];
  index: number;
  aspect: number;
  accent: string;
  /** Paused while off screen so an idle scene costs nothing. */
  active: boolean;
}

export default function ShoeStage({ images, index, aspect, accent, active }: ShoeStageProps) {
  return (
    <Canvas
      /* Capped DPR — a reflective floor at 3x on a phone is not worth the frames. */
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.75, 4.1], fov: 42 }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 5, 4]} intensity={2.1} />
      <directionalLight position={[-4, 2, -3]} intensity={1.1} color={accent} />
      <spotLight position={[0, 6, 2]} angle={0.5} penumbra={0.9} intensity={2.4} />

      <ShoePlane images={images} index={index} aspect={aspect} />
      <Floor accent={accent} />
      <Rig />
    </Canvas>
  );
}
