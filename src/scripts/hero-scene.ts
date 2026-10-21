import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** 재질 프리셋 (순서는 hero-materials.ts와 같음) */
function createMaterials() {
  return [
    new THREE.MeshPhysicalMaterial({
      color: 0xb8b0d8, metalness: 0.75, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08,
      iridescence: 1, iridescenceIOR: 2.2, iridescenceThicknessRange: [250, 1100],
    }),
    new THREE.MeshPhysicalMaterial({
      color: 0xdde8ff, metalness: 0, roughness: 0.04, transmission: 1, thickness: 1.6, ior: 1.6, dispersion: 6,
      clearcoat: 1, attenuationColor: new THREE.Color(0x8fb0ff), attenuationDistance: 2.5,
    }),
    new THREE.MeshPhysicalMaterial({ color: 0xc9c4d6, metalness: 1, roughness: 0.22, clearcoat: 0.6 }),
  ];
}

/** 표면이 천천히 일렁이도록 버텍스를 사인파로 흔듦 */
function addWobble(mat: THREE.MeshPhysicalMaterial, uniforms: { uTime: { value: number }; uAmp: { value: number } }) {
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;\nuniform float uAmp;')
      .replace(
        '#include <begin_vertex>',
        `vec3 transformed = position + normal * uAmp *
          sin(position.x * 2.6 + uTime) * sin(position.y * 2.2 + uTime * 1.3) * sin(position.z * 2.0 + uTime * 0.8);`,
      );
  };
}

/** 페르소나가 준비되기 전 임시 오브젝트. 나중에 GLTFLoader로 모델을 불러와 이 그룹에 넣으면 됨 */
function createCore(materials: THREE.MeshPhysicalMaterial[]) {
  const group = new THREE.Group();
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.25, 48), materials[0]);
  const cage = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.9, 1)),
    new THREE.LineBasicMaterial({ color: 0x575558, transparent: true, opacity: 0.55 }),
  );
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.4, 0.004, 8, 200),
    new THREE.MeshBasicMaterial({ color: 0x2895f7, transparent: true, opacity: 0.7 }),
  );
  ring.rotation.x = Math.PI / 2.3;
  group.add(core, cage, ring);
  return { group, core, cage, ring };
}

function createDust() {
  const n = 600;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 4 + Math.random() * 8;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    pos.set([r * Math.sin(p) * Math.cos(t), r * Math.sin(p) * Math.sin(t), r * Math.cos(p)], i * 3);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xf0ebe5, size: 0.018, transparent: true, opacity: 0.6 }));
}

export function mountHero(root: HTMLElement) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null; // WebGL 미지원 → CSS 대체 이미지 유지
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  root.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  // 프리즘 재질은 뒤가 비쳐야 해서 배경 패널을 둠
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.ShaderMaterial({
      uniforms: {},
      vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
      fragmentShader: `varying vec2 vUv; void main(){
        float d = distance(vUv, vec2(0.5));
        vec3 c = mix(vec3(0.17,0.16,0.27), vec3(0.082,0.082,0.11), smoothstep(0.0, 0.32, d));
        gl_FragColor = vec4(c, 1.0); }`,
    }),
  );
  back.position.z = -6;
  scene.add(back);

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 8.5);

  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 4, 5);
  const rim = new THREE.DirectionalLight(0x6f8bff, 3);
  rim.position.set(-5, -2, -3);
  scene.add(key, rim);

  const uniforms = { uTime: { value: 0 }, uAmp: { value: reduced ? 0 : 0.09 } };
  const mats = createMaterials();
  mats.forEach((m) => addWobble(m, uniforms));
  const { group, core, cage, ring } = createCore(mats);
  const dust = createDust();
  scene.add(group, dust);

  // 레이아웃: 데스크톱은 오른쪽, 모바일은 가운데 위
  const layout = () => {
    const w = root.clientWidth, h = root.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const mobile = w < 760;
    group.position.set(mobile ? 0 : 1.6, mobile ? 0.55 : 0.15, 0);
    group.scale.setScalar(mobile ? 0.8 : 1);
  };
  layout();
  new ResizeObserver(layout).observe(root);

  // 포인터 따라 기울이기
  const pointer = { x: 0, y: 0 };
  const tilt = { x: 0, y: 0 };
  root.addEventListener('pointermove', (e) => {
    const r = root.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
  });
  root.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; });

  // 스크롤하면 오브젝트가 물러나고 문구가 흐려짐
  const scroll = { p: 0 };
  ScrollTrigger.create({
    trigger: root, start: 'top top', end: 'bottom top', scrub: true,
    onUpdate: (self) => { scroll.p = self.progress; },
  });
  const copy = root.querySelector('[data-hero-copy]');
  if (copy) gsap.to(copy, { y: -60, opacity: 0, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: '60% top', scrub: true } });

  // 진입 연출: 인트로가 끝나면 (또는 바로) 등장
  group.scale.multiplyScalar(0.001);
  const appear = () => {
    const s = root.clientWidth < 760 ? 0.8 : 1;
    gsap.to(group.scale, { x: s, y: s, z: s, duration: reduced ? 0 : 1.6, ease: 'expo.out' });
  };
  if (document.documentElement.classList.contains('intro-on')) window.addEventListener('intro:done', appear, { once: true });
  else appear();

  // 보일 때만 렌더
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(root);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!visible || document.hidden) return;
    const t = reduced ? 0 : clock.getElapsedTime();
    uniforms.uTime.value = t * 0.9;
    tilt.x += (pointer.y * 0.35 - tilt.x) * 0.05;
    tilt.y += (pointer.x * 0.5 - tilt.y) * 0.05;
    core.rotation.set(tilt.x + t * 0.08, tilt.y + t * 0.12, 0);
    cage.rotation.set(-t * 0.05 + tilt.x * 0.5, t * 0.07 + tilt.y * 0.5, 0);
    ring.rotation.z = t * 0.15;
    dust.rotation.y = t * 0.01 + tilt.y * 0.1;
    group.rotation.z = -scroll.p * 0.6;
    camera.position.z = 8.5 + scroll.p * 4;
    renderer.render(scene, camera);
  });

  return {
    setMaterial(i: number) {
      const next = mats[i];
      if (!next || core.material === next) return;
      // 순간적으로 쪼그라들었다가 바뀜
      gsap.timeline()
        .to(uniforms.uAmp, { value: reduced ? 0 : 0.35, duration: 0.25, ease: 'power2.in' })
        .call(() => { core.material = next; })
        .to(uniforms.uAmp, { value: reduced ? 0 : 0.09, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
    },
  };
}
