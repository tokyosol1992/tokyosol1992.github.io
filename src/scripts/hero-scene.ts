import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const BLUE = 0x2895f7;
const BLANK = 3; // 모드 셰이더에서 "아무것도 안 그림"

/** 사진 속 얼굴 영역 (uv, 아래가 0). 사진을 바꾸면 여기만 맞추면 됨 */
const FACE = { x: 0.5, y: 0.74, w: 0.36, h: 0.32 };

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

/**
 * 페르소나 셰이더 (레퍼런스: chronothreads.webflow.io 히어로의 효과 스택)
 * 깊이맵 시차(마우스) → 가는 가로 블라인드 → 가끔 줄 단위 글리치+색 분리 → 블룸 → 그레인 → 마우스를 따라가는 비네트
 * 모드: 0 visual / 1 thermal / 2 edge scan, 위→아래 스윕으로 전환
 */
const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform sampler2D uDepth;
  uniform vec2 uTexel;
  uniform float uTime;
  uniform float uMode;
  uniform float uPrev;
  uniform float uSweep;
  uniform float uFade;
  uniform vec2 uMouse;   // -1..1, 오른쪽·위가 +
  uniform vec3 uBg;
  varying vec2 vUv;

  float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  vec3 thermal(float t) {
    vec3 c = mix(vec3(0.02, 0.02, 0.08), vec3(0.25, 0.05, 0.55), smoothstep(0.0, 0.25, t));
    c = mix(c, vec3(0.85, 0.1, 0.45), smoothstep(0.2, 0.45, t));
    c = mix(c, vec3(1.0, 0.55, 0.05), smoothstep(0.4, 0.7, t));
    return mix(c, vec3(1.0, 0.97, 0.8), smoothstep(0.7, 1.0, t));
  }

  float sobel(vec2 uv) {
    float tl = lum(texture2D(uTex, uv + uTexel * vec2(-1., 1.)).rgb);
    float t  = lum(texture2D(uTex, uv + uTexel * vec2(0., 1.)).rgb);
    float tr = lum(texture2D(uTex, uv + uTexel * vec2(1., 1.)).rgb);
    float l  = lum(texture2D(uTex, uv + uTexel * vec2(-1., 0.)).rgb);
    float r  = lum(texture2D(uTex, uv + uTexel * vec2(1., 0.)).rgb);
    float bl = lum(texture2D(uTex, uv + uTexel * vec2(-1., -1.)).rgb);
    float b  = lum(texture2D(uTex, uv + uTexel * vec2(0., -1.)).rgb);
    float br = lum(texture2D(uTex, uv + uTexel * vec2(1., -1.)).rgb);
    float gx = -tl - 2.*l - bl + tr + 2.*r + br;
    float gy = -tl - 2.*t - tr + bl + 2.*b + br;
    return length(vec2(gx, gy));
  }

  // 밝은 부분만 번지게 (나선형 12탭)
  vec3 bloom(vec2 uv) {
    vec3 acc = vec3(0.0);
    for (int i = 0; i < 12; i++) {
      float fi = float(i);
      float a = fi * 2.39996;
      vec2 o = vec2(cos(a), sin(a)) * (0.004 + 0.0022 * fi);
      vec3 s = texture2D(uTex, uv + o).rgb;
      acc += s * smoothstep(0.38, 0.6, lum(s));
    }
    return acc / 12.0;
  }

  // glitch: 줄 단위로 밀린 양. 그 줄에서만 R/B를 반대로 벌려 색 분리
  vec4 shade(float m, vec2 uv, float glitch) {
    vec3 base = texture2D(uTex, uv).rgb;
    if (m < 0.5) {
      vec3 c = base;
      if (glitch != 0.0) {
        c.r = texture2D(uTex, uv + vec2(glitch * 2.0, 0.)).r;
        c.b = texture2D(uTex, uv - vec2(glitch * 2.0, 0.)).b;
      }
      c += bloom(uv) * 0.7;
      return vec4(c, 1.0);
    }
    if (m < 1.5) {
      float t = pow(lum(base), 0.8);
      return vec4(thermal(t) * (0.95 + 0.05 * sin(uv.y * 600.0 + uTime * 4.0)), 1.0);
    }
    if (m < 2.5) {
      float e = smoothstep(0.08, 0.45, sobel(uv));
      vec2 g = fract(uv * vec2(70.0, 84.0));
      float dots = step(0.92, g.x) * step(0.92, g.y) * 0.25;
      vec3 c = vec3(0.157, 0.584, 0.969) * (e + dots) + base * 0.08;
      return vec4(c, 1.0);
    }
    return vec4(0.0);
  }

  vec3 overlay(vec3 src, vec3 dst) {
    return mix(2.0 * src * dst, 1.0 - 2.0 * (1.0 - src) * (1.0 - dst), step(0.5, dst));
  }

  void main() {
    // 1) 깊이맵 시차: 가까운 곳(얼굴)은 마우스 쪽으로, 먼 곳은 반대로
    float depth = texture2D(uDepth, vUv).r;
    vec2 uv = vUv - (depth - 0.5) * 0.045 * uMouse;

    // 2) 가는 가로 블라인드: 줄마다 세로 샘플을 살짝 눌러 결이 생김
    float bands = 260.0;
    float seg = fract(uv.y * bands + uTime * 0.4);
    uv.y -= (seg - 0.5) / bands * 0.2;

    // 3) 가끔 몇 줄이 옆으로 밀리는 글리치
    float tick = floor(uTime * 6.0);
    float rowSize = 0.008 + 0.03 * hash(vec2(tick, 3.1));
    float row = floor(uv.y / rowSize);
    float on = step(0.99, hash(vec2(row, tick)));
    float glitch = (hash(vec2(row + 7.0, tick)) - 0.5) * 0.003 * on;
    uv.x += glitch;

    // 모드 전환 스윕 (위에서 아래로)
    float sweeping = step(0.001, uSweep) * step(uSweep, 0.999);
    float line = 1.0 - uSweep;
    float near = 1.0 - smoothstep(0.0, 0.04, abs(uv.y - line));
    float srow = floor(uv.y * 120.0);
    uv.x += (hash(vec2(srow, floor(uTime * 20.0))) - 0.5) * 0.04 * near * sweeping;

    vec4 col = uv.y > line ? shade(uMode, uv, glitch) : shade(uPrev, uv, glitch);
    col.rgb += vec3(0.157, 0.584, 0.969) * near * 1.4 * sweeping;
    col.a = max(col.a, near * sweeping);

    // 4) 그레인 (오버레이 블렌드라 검은 배경엔 얹히지 않음)
    float grain = hash(floor(vUv * vec2(1100.0, 1330.0)) + fract(floor(uTime * 12.0) * 0.137) * 100.0);
    col.rgb = mix(col.rgb, overlay(vec3(grain), col.rgb), 0.18);

    // 사진 배경(어두운 부분)을 사이트 배경색으로 올려 경계를 없앰
    col.rgb = max(col.rgb, uBg);
    // 5) 비네트: 중심이 마우스를 조금 따라감
    vec2 q = (vUv - vec2(0.5, 0.6) - uMouse * vec2(0.04, 0.03)) / vec2(0.55, 0.62);
    float edge = 1.0 - smoothstep(0.6, 1.0, length(q));
    edge *= smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.92, vUv.y);
    gl_FragColor = vec4(col.rgb, col.a * edge * uFade);
    #include <colorspace_fragment>
  }
`;

/** 얼굴 레티클: 코너 브래킷 + 십자 */
function createReticle(w: number, h: number) {
  const s = Math.min(w, h) * 0.18;
  const x = w / 2, y = h / 2;
  const pts = [
    [-x, y - s, -x, y], [-x, y, -x + s, y],
    [x - s, y, x, y], [x, y, x, y - s],
    [-x, -y + s, -x, -y], [-x, -y, -x + s, -y],
    [x - s, -y, x, -y], [x, -y, x, -y + s],
    [-0.04, 0, 0.04, 0], [0, -0.04, 0, 0.04],
  ].flatMap(([a, b, c, d]) => [a, b, 0, c, d, 0]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.9 }));
}

/** 캔버스로 그리는 HUD 텍스트 판 */
function createLabel(width: number, height: number) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { canvas, ctx, tex };
}

function createDust() {
  const n = 500;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) pos.set([(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10, -2 - Math.random() * 4], i * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xf0ebe5, size: 0.016, transparent: true, opacity: 0.5 }));
}

export async function mountHero(root: HTMLElement, src: string, depthSrc: string) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null; // WebGL 미지원 → <Image> 대체 유지
  }
  const loader = new THREE.TextureLoader();
  const [texture, depthMap] = await Promise.all([
    loader.loadAsync(src).catch(() => null),
    loader.loadAsync(depthSrc).catch(() => null),
  ]);
  if (!texture || !depthMap) { renderer.dispose(); return null; }
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  const img = texture.image as HTMLImageElement;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = new THREE.Clock();
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  root.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 8.5);

  // 배경 그라데이션 패널: 바깥은 --bg(#0b0b0d)와 같은 값, 가운데만 살짝 밝은 무채색 글로우
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: `varying vec2 vUv; void main(){
        float d = distance(vUv, vec2(0.42, 0.47));
        vec3 c = mix(vec3(0.075,0.075,0.085), vec3(0.043,0.043,0.051), smoothstep(0.0, 0.14, d));
        gl_FragColor = vec4(c, 1.0); }`,
    }),
  );
  back.position.z = -8;
  const dust = createDust();
  scene.add(back, dust);

  // 페르소나
  const H = 5.1, W = H * (img.width / img.height);
  const uniforms = {
    uTex: { value: texture },
    uTexel: { value: new THREE.Vector2(1 / img.width, 1 / img.height) },
    uTime: { value: 0 },
    uMode: { value: 0 },
    uPrev: { value: BLANK },
    uSweep: { value: reduced ? 1 : 0 },
    uFade: { value: 1 },
    uDepth: { value: depthMap },
    uMouse: { value: new THREE.Vector2() },
    // 사진 배경을 사이트 배경(--bg)에 녹임
    uBg: { value: new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#0b0b0d') },
  };
  const persona = new THREE.Group();
  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(W, H),
    new THREE.ShaderMaterial({ uniforms, vertexShader: vertex, fragmentShader: fragment, transparent: true, depthWrite: false }),
  );
  persona.add(photo);

  // 얼굴 레티클 + 라벨
  const face = new THREE.Group();
  face.position.set((FACE.x - 0.5) * W, (FACE.y - 0.5) * H, 0.05);
  const reticle = createReticle(FACE.w * W, FACE.h * H);
  const label = createLabel(512, 96);
  label.ctx.font = '500 26px "JetBrains Mono", monospace';
  label.ctx.fillStyle = '#2895f7';
  label.ctx.fillText('SUBJ: SOLGIL.EXE', 0, 34);
  label.ctx.fillStyle = 'rgba(240,235,229,0.75)';
  label.ctx.fillText('ID MATCH 98.2% · OK', 0, 76);
  label.tex.needsUpdate = true;
  const labelMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.225),
    new THREE.MeshBasicMaterial({ map: label.tex, transparent: true, depthWrite: false }),
  );
  labelMesh.position.set((FACE.w * W) / 2 + 0.7, (FACE.h * H) / 2 - 0.1, 0);
  face.add(reticle, labelMesh);
  persona.add(face);
  scene.add(persona);

  // 레이아웃: 데스크톱은 오른쪽, 모바일은 가운데 위
  const faceBase = face.position.clone();
  const layout = () => {
    const w = root.clientWidth, h = root.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const visW = visH * camera.aspect;
    if (w < 760) {
      const s = Math.min(1, (visH * 0.62) / H);
      persona.scale.setScalar(s);
      persona.position.set(0, visH / 2 - (H * s) / 2 - 0.05, 0);
      labelMesh.visible = false;
    } else {
      persona.scale.setScalar(1);
      persona.position.set(Math.max(0.9, visW / 2 - W / 2 - visW * 0.04), -0.1, 0);
      labelMesh.visible = true;
    }
  };
  layout();
  const ro = new ResizeObserver(layout);
  ro.observe(root);

  // 마우스 시차: 화면 어디서 움직여도 따라감. 관성(momentum)을 둬서 천천히 따라옴
  // 터치 기기나 마우스를 안 움직일 땐 천천히 떠다님
  const pointer = { x: 0, y: 0 };
  const mouse = uniforms.uMouse.value;
  let lastMove = -10;
  const ac = new AbortController();
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    pointer.x = (e.clientX / innerWidth) * 2 - 1;
    pointer.y = -((e.clientY / innerHeight) * 2 - 1);
    lastMove = clock.getElapsedTime();
  }, { signal: ac.signal });

  // 스크롤: 카메라가 물러나고 페르소나가 흐려짐
  const scroll = { p: 0 };
  ScrollTrigger.create({
    trigger: root, start: 'top top', end: 'bottom top', scrub: true,
    onUpdate: (self) => { scroll.p = self.progress; },
  });
  const copy = root.querySelector('[data-hero-copy]');
  if (copy) gsap.to(copy, { y: -60, opacity: 0, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: '60% top', scrub: true } });

  // 등장: 빈 화면 → visual 로 스캔
  const hud = [reticle.material, labelMesh.material] as THREE.Material[];
  hud.forEach((m) => { m.opacity = reduced ? 1 : 0; });
  const appear = () => {
    if (reduced) return;
    gsap.timeline()
      .to(uniforms.uSweep, { value: 1, duration: 1.6, ease: 'power2.inOut' })
      .to(hud, { opacity: 1, duration: 0.5, stagger: 0.15 }, '-=0.4')
      .from(face.scale, { x: 1.4, y: 1.4, duration: 0.6, ease: 'expo.out' }, '<');
  };
  if (document.documentElement.classList.contains('intro-on')) window.addEventListener('intro:done', appear, { once: true, signal: ac.signal });
  else appear();

  // 보일 때만 렌더
  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(root);
  renderer.setAnimationLoop(() => {
    if (!visible || document.hidden) return;
    const t = reduced ? 0 : clock.getElapsedTime();
    uniforms.uTime.value = t;
    const idle = reduced || t - lastMove > 3;
    const tx = idle ? Math.sin(t * 0.35) * 0.45 : pointer.x;
    const ty = idle ? Math.cos(t * 0.27) * 0.3 : pointer.y;
    if (!reduced) {
      mouse.x += (tx - mouse.x) * 0.05;
      mouse.y += (ty - mouse.y) * 0.05;
    }
    persona.rotation.set(-mouse.y * 0.03, mouse.x * 0.05, 0);
    // 레티클은 얼굴(깊이 ≈ 0.85)이 시차로 움직인 만큼 같이 이동
    face.position.set(faceBase.x + 0.35 * 0.045 * mouse.x * W, faceBase.y + 0.35 * 0.045 * mouse.y * H, 0.05 + Math.sin(t * 2) * 0.02);
    reticle.scale.setScalar(1 + Math.sin(t * 2.4) * 0.015);
    dust.position.set(-mouse.x * 0.25, -mouse.y * 0.15, 0);
    uniforms.uFade.value = 1 - scroll.p * 0.85;
    camera.position.z = 8.5 + scroll.p * 3;
    renderer.render(scene, camera);
  });

  return {
    setMode(i: number) {
      if (uniforms.uMode.value === i) return;
      uniforms.uPrev.value = uniforms.uMode.value;
      uniforms.uMode.value = i;
      gsap.killTweensOf(uniforms.uSweep);
      uniforms.uSweep.value = reduced ? 1 : 0;
      if (!reduced) gsap.to(uniforms.uSweep, { value: 1, duration: 0.9, ease: 'power2.inOut' });
    },
    /** 페이지를 떠날 때 (ClientRouter) 렌더 루프·GPU 자원 정리 */
    destroy() {
      ac.abort();
      io.disconnect();
      ro.disconnect();
      renderer.setAnimationLoop(null);
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        (Array.isArray(m.material) ? m.material : m.material ? [m.material] : []).forEach((x) => x.dispose());
      });
      texture.dispose(); depthMap.dispose(); label.tex.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
