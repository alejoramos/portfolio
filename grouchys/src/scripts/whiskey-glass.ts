/**
 * The reservation whiskey glass.
 *
 * Ported from the handoff's `whiskey-glass.js` with the same visual recipe:
 * a lathed rocks glass, amber liquid painted with a vertical gradient, two ice
 * cubes, a warm key from camera-left, an amber bounce behind, a cool rim from
 * the right, and a small canvas-generated equirect environment through PMREM —
 * that environment is what makes the crystal read as crystal.
 *
 * Everything around it is defensive:
 *   · three.js is imported dynamically, so no other page pays for it;
 *   · it only loads when the block is on screen, on a large screen, with
 *     motion allowed and WebGL available;
 *   · it renders only while visible and while the tab is in the foreground;
 *   · it disposes geometries, materials, textures and the renderer on teardown;
 *   · any failure leaves the static CSS glass in place. There is no state in
 *     which this produces a black rectangle.
 */

type ThreeModule = typeof import('three');

/** Camera-facing profile of the glass: thick base, slight flare at the rim. */
const PROFILE: [number, number][] = [
  [0.0, 0.0],
  [0.86, 0.0],
  [0.98, 0.06],
  [1.0, 0.22],
  [1.0, 1.62],
  [1.02, 1.9],
  [1.03, 2.02],
  [0.9, 2.03],
  [0.88, 1.9],
  [0.86, 1.62],
  [0.84, 0.62],
  [0.0, 0.55],
];

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl'))
    );
  } catch {
    return false;
  }
}

export function mountWhiskeyGlass(): void {
  const host = document.querySelector<HTMLElement>('[data-whiskey-glass]');
  const mount = host?.querySelector<HTMLElement>('[data-glass-mount]');
  if (!host || !mount) return;

  const reduced = document.documentElement.hasAttribute('data-reduced-motion');
  // 768px, not 1024: a laptop window that is not maximised was falling through
  // to the static glass, which never moves — and the caption beside it promises
  // that it reacts to the cursor.
  const bigEnough = window.matchMedia('(min-width: 768px)').matches;

  // Reduced motion, small screens and machines without WebGL keep the static
  // glass. It is the same silhouette, and it costs nothing.
  if (reduced || !bigEnough || !hasWebGL()) return;

  let started = false;
  let teardown: (() => void) | null = null;

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting) || started) return;
      started = true;
      observer.disconnect();

      import('three')
        .then((THREE) => {
          teardown = build(THREE, host, mount);
        })
        .catch(() => {
          /* offline, blocked, or unsupported — the static glass stands in */
        });
    },
    { rootMargin: '240px' },
  );

  observer.observe(host);

  window.addEventListener(
    'pagehide',
    () => {
      observer.disconnect();
      teardown?.();
      teardown = null;
    },
    { once: true },
  );
}

function build(THREE: ThreeModule, host: HTMLElement, mount: HTMLElement): () => void {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setClearAlpha(0);
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  // Raised a little above the rim: a product-shot angle, so the elliptical
  // surface of the whiskey reads as a surface rather than a flat edge.
  camera.position.set(0, 2.45, 8.2);
  camera.lookAt(0, 1.06, 0);

  // ---- environment: near-black with two tight warm sources ----------------
  const envCanvas = document.createElement('canvas');
  envCanvas.width = 256;
  envCanvas.height = 128;
  const ec = envCanvas.getContext('2d')!;
  ec.fillStyle = '#030202';
  ec.fillRect(0, 0, 256, 128);
  const band = ec.createLinearGradient(0, 44, 0, 92);
  band.addColorStop(0, 'rgba(104,58,20,0.42)');
  band.addColorStop(1, 'rgba(3,2,2,0)');
  ec.fillStyle = band;
  ec.fillRect(0, 44, 256, 48);
  ec.fillStyle = 'rgba(255,222,168,0.98)';
  ec.beginPath();
  ec.ellipse(44, 44, 11, 7, 0, 0, Math.PI * 2);
  ec.fill();
  ec.fillStyle = 'rgba(255,186,96,0.55)';
  ec.beginPath();
  ec.ellipse(198, 60, 8, 6, 0, 0, Math.PI * 2);
  ec.fill();

  const envTex = new THREE.CanvasTexture(envCanvas);
  envTex.mapping = THREE.EquirectangularReflectionMapping;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromEquirectangular(envTex);
  scene.environment = envRT.texture;
  pmrem.dispose();
  envTex.dispose();

  const group = new THREE.Group();
  scene.add(group);

  // ---- crystal -------------------------------------------------------------
  // Deliberately not transmission-based: against a transparent canvas there is
  // no backdrop to refract and transmission collapses to a milky silhouette.
  // Low-opacity dark glass plus clearcoat gives the same read, predictably.
  const glassGeo = new THREE.LatheGeometry(
    PROFILE.map((p) => new THREE.Vector2(p[0], p[1])),
    96,
  );
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x090707,
    metalness: 0,
    roughness: 0.05,
    transparent: true,
    opacity: 0.26,
    envMapIntensity: 2.6,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  group.add(new THREE.Mesh(glassGeo, glassMat));

  // ---- rim ------------------------------------------------------------------
  // A hairline of lit crystal around the lip. Without it the silhouette dies
  // against a black background and the whole thing reads as a dark blob.
  const rimGeo = new THREE.TorusGeometry(1.0, 0.022, 12, 96);
  const rimMat = new THREE.MeshPhysicalMaterial({
    color: 0xf6e4c4,
    metalness: 0,
    roughness: 0.08,
    transparent: true,
    opacity: 0.5,
    envMapIntensity: 3.4,
    clearcoat: 1,
  });
  const rimRing = new THREE.Mesh(rimGeo, rimMat);
  rimRing.rotation.x = Math.PI / 2;
  rimRing.position.y = 2.025;
  group.add(rimRing);

  // ---- whiskey ---------------------------------------------------------------
  // Transmissive, per the handoff: amber that light passes *through*, tinted by
  // attenuation over distance. A painted cylinder (what this used to be) reads
  // as a flat orange card because nothing varies across its curve.
  const liquidGeo = new THREE.CylinderGeometry(0.8, 0.792, 0.86, 96, 1, false);
  const liquidMat = new THREE.MeshPhysicalMaterial({
    color: 0xc9761f,
    metalness: 0,
    roughness: 0.06,
    transmission: 0.92,
    thickness: 1.5,
    ior: 1.36,
    attenuationColor: new THREE.Color(0x7a3308),
    attenuationDistance: 0.9,
    clearcoat: 0.5,
    clearcoatRoughness: 0.12,
    envMapIntensity: 1.4,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const liquid = new THREE.Mesh(liquidGeo, liquidMat);
  liquid.position.y = 1.0;
  group.add(liquid);

  // The meniscus — a bright hairline where whiskey meets air and the surface
  // curves up the glass wall. A filled disc here reads as a plastic lid; it is
  // this thin lit ring that actually says "liquid".
  const surfaceGeo = new THREE.TorusGeometry(0.788, 0.016, 10, 96);
  const surfaceMat = new THREE.MeshPhysicalMaterial({
    color: 0xffc070,
    metalness: 0,
    roughness: 0.05,
    emissive: new THREE.Color(0x3a1604),
    emissiveIntensity: 0.6,
    envMapIntensity: 3.4,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity: 0.85,
  });
  const surface = new THREE.Mesh(surfaceGeo, surfaceMat);
  surface.rotation.x = Math.PI / 2;
  surface.position.y = 1.43;
  group.add(surface);

  // ---- ice -------------------------------------------------------------------
  // Bevelled, mostly submerged, and genuinely transmissive — flat grey boxes
  // read as paper, which is exactly how the previous version looked.
  const iceGeo = new THREE.BoxGeometry(0.54, 0.54, 0.54, 3, 3, 3);
  // knock the corners off so the edges catch light like real ice
  {
    const pos = iceGeo.attributes.position as import('three').BufferAttribute;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const l = v.length();
      v.multiplyScalar((l * 0.82 + 0.09) / l);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    iceGeo.computeVertexNormals();
  }
  const iceMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.04,
    transmission: 0.95,
    thickness: 0.4,
    ior: 1.31,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 2.2,
    transparent: true,
  });
  // Both cubes sit fully under the surface (top of the whiskey is y 1.43).
  // A cube breaking the surface renders as a dark shard against the black
  // backdrop, which is what the first pass looked like.
  const ice1 = new THREE.Mesh(iceGeo, iceMat);
  ice1.position.set(-0.24, 1.05, 0.06);
  ice1.rotation.set(0.4, 0.7, 0.25);
  const ice2 = new THREE.Mesh(iceGeo, iceMat);
  ice2.position.set(0.26, 0.9, -0.14);
  ice2.rotation.set(-0.3, 0.2, 0.5);
  ice2.scale.setScalar(0.84);
  group.add(ice1, ice2);

  // ---- light ---------------------------------------------------------------
  const key = new THREE.SpotLight(0xffd9a3, 72, 16, 0.72, 0.92, 2);
  key.position.set(-3.6, 6.2, 3.4);
  key.target.position.set(0, 1.0, 0);
  const amber = new THREE.PointLight(0xc9762c, 16, 10, 2);
  amber.position.set(1.1, 1.0, -1.6);
  const rim = new THREE.DirectionalLight(0xf4f0e8, 1.5);
  rim.position.set(4.8, 1.6, -1.2);
  const bounce = new THREE.PointLight(0x8a5a24, 5, 8, 2);
  bounce.position.set(-1.6, 0.2, 2.2);
  const ambient = new THREE.AmbientLight(0x120e0b, 0.6);
  scene.add(key, key.target, amber, rim, bounce, ambient);

  // ---- size ----------------------------------------------------------------
  const resize = () => {
    const w = mount.clientWidth || 330;
    const h = mount.clientHeight || 430;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();

  const ro = new ResizeObserver(resize);
  ro.observe(mount);

  // ---- interaction ---------------------------------------------------------
  let px = 0;
  let py = 0;
  let tx = 0;
  let ty = 0;

  const onPointerMove = (e: PointerEvent) => {
    const r = mount.getBoundingClientRect();
    tx = ((e.clientX - (r.left + r.width / 2)) / window.innerWidth) * 0.9;
    ty = ((e.clientY - (r.top + r.height / 2)) / window.innerHeight) * 0.45;
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  // A gentle scroll response: the glass tips a few degrees across the section.
  let scrollTilt = 0;
  let scrollTicking = false;
  const readScroll = () => {
    scrollTicking = false;
    const r = host.getBoundingClientRect();
    const progress = 1 - (r.top + r.height / 2) / window.innerHeight;
    scrollTilt = Math.max(-1, Math.min(1, progress)) * 0.09;
  };
  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(readScroll);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  readScroll();

  // ---- render only when it is worth rendering ------------------------------
  let onScreen = false;
  let running = false;

  const io = new IntersectionObserver((entries) => {
    onScreen = entries[0]?.isIntersecting ?? false;
    sync();
  });
  io.observe(host);

  const onVisibility = () => sync();
  document.addEventListener('visibilitychange', onVisibility);

  const clock = new THREE.Clock();

  const frame = () => {
    const t = clock.getElapsedTime();
    px += (tx - px) * 0.045;
    py += (ty - py) * 0.045;
    group.rotation.y = t * 0.11 + px * 0.7;
    group.rotation.x = -py * 0.24 + scrollTilt;
    group.position.y = Math.sin(t * 0.5) * 0.035;
    renderer.render(scene, camera);
  };

  function sync() {
    const should = onScreen && !document.hidden;
    if (should === running) return;
    running = should;
    renderer.setAnimationLoop(should ? frame : null);
    if (should) clock.getDelta(); // drop the paused interval
  }

  // Reveal once the first frame is on the canvas, so the swap never flashes.
  frame();
  requestAnimationFrame(() => host.setAttribute('data-gl-ready', ''));
  onScreen = true;
  sync();

  return () => {
    renderer.setAnimationLoop(null);
    io.disconnect();
    ro.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('visibilitychange', onVisibility);

    [glassGeo, liquidGeo, surfaceGeo, rimGeo, iceGeo].forEach((g) => g.dispose());
    [glassMat, liquidMat, surfaceMat, rimMat, iceMat].forEach((m) => m.dispose());
    envRT.dispose();
    scene.environment = null;
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
    host.removeAttribute('data-gl-ready');
  };
}
