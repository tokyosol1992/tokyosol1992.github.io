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

/** 페르소나 셰이더: 0 visual / 1 thermal / 2 edge scan, 위→아래 스윕으로 전환 */
const fragment = /* glsl */ `
  uniform sampler2D uTex;
  uniform vec2 uTexel;
  uniform float uTime;
  uniform float uMode;
  uniform float uPrev;
  uniform float uSweep;
  uniform float uFade;
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

  vec4 shade(float m, vec2 uv) {
    vec3 base = texture2D(uTex, uv).rgb;
    if (m < 0.5) {
      // 아주 약한 RGB 분리 + 주사선
      float s = 0.0012;
      vec3 c = vec3(texture2D(uTex, uv + vec2(s, 0.)).r, base.g, texture2D(uTex, uv - vec2(s, 0.)).b);
      c *= 0.96 + 0.04 * sin(uv.y * 900.0);
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

  void main() {
    vec2 uv = vUv;
    float line = 1.0 - uSweep;                // 스윕 경계 (위에서 아래로)
    float near = 1.0 - smoothstep(0.0, 0.04, abs(uv.y - line));
    // 경계 근처 줄 단위 글리치
    float row = floor(uv.y * 120.0);
    uv.x += (hash(vec2(row, floor(uTime * 20.0))) - 0.5) * 0.04 * near * step(0.001, uSweep) * step(uSweep, 0.999);

    vec4 col = uv.y > line ? shade(uMode, uv) : shade(uPrev, uv);
    col.rgb += vec3(0.157, 0.584, 0.969) * near * 1.4 * step(0.001, uSweep) * step(uSweep, 0.999);
    col.a = max(col.a, near * step(0.001, uSweep) * step(uSweep, 0.999));

    // 천천히 내려가는 밝은 스캔 밴드 + 그레인
    float band = smoothstep(0.03, 0.0, abs(fract(vUv.y - uTime * 0.06) - 0.5) - 0.47);
    // 어두운 배경에는 얹지 않음 (사각형 경계가 비치지 않게)
    float body = smoothstep(0.04, 0.16, lum(texture2D(uTex, vUv).rgb));
    col.rgb += band * 0.035 * body;
    col.rgb += (hash(vUv * 800.0 + uTime) - 0.5) * 0.03 * body;

    // 사진 배경(어두운 부분)을 사이트 배경색으로 올려 경계를 없앰
    col.rgb = max(col.rgb, uBg);
    // 가장자리를 타원형으로 녹임
    vec2 q = (vUv - vec2(0.5, 0.6)) / vec2(0.55, 0.62);
    float edge = 1.0 - smoothstep(0.62, 1.0, length(q));
    edge *= smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.92, vUv.y);
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

/** 홀로그램 UI 패널: 와이어프레임 레이아웃 + 움직이는 커서 */
function createPanel() {
  const W = 640, H = 440;
  const { ctx, tex } = createLabel(W, H);
  const draw = (t: number) => {
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(40,149,247,0.9)';
    ctx.fillStyle = 'rgba(40,149,247,0.08)';
    ctx.lineWidth = 2;
    ctx.fillRect(4, 4, W - 8, H - 8);
    ctx.strokeRect(4, 4, W - 8, H - 8);
    // 헤더
    ctx.fillStyle = 'rgba(40,149,247,0.9)';
    ctx.font = '500 20px "JetBrains Mono", monospace';
    ctx.fillText('COMPONENT / Card.default', 24, 40);
    ctx.fillText(`v${(2 + (t % 10) / 10).toFixed(1)}`, W - 80, 40);
    ctx.beginPath(); ctx.moveTo(4, 58); ctx.lineTo(W - 4, 58); ctx.stroke();
    // 레이아웃 블록
    ctx.strokeStyle = 'rgba(40,149,247,0.75)';
    ctx.strokeRect(24, 80, 260, 160);
    ctx.beginPath(); ctx.moveTo(24, 80); ctx.lineTo(284, 240); ctx.moveTo(284, 80); ctx.lineTo(24, 240); ctx.stroke();
    ctx.fillStyle = 'rgba(40,149,247,0.55)';
    ctx.fillRect(310, 84, 300, 18);
    ctx.fillRect(310, 116, 220, 12);
    ctx.fillRect(310, 138, 260, 12);
    ctx.fillRect(310, 160, 180, 12);
    ctx.strokeRect(310, 196, 130, 44);
    ctx.fillText('Button', 334, 226);
    // 그리드 행
    for (let i = 0; i < 3; i++) {
      const y = 270 + i * 50;
      ctx.strokeRect(24, y, 586, 38);
      ctx.fillRect(40, y + 13, 120 + ((i * 70) % 160), 12);
    }
    // 커서 (8자로 움직임)
    const cx = 330 + Math.sin(t * 0.9) * 200, cy = 250 + Math.sin(t * 1.8) * 90;
    ctx.fillStyle = '#f0ebe5';
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + 26); ctx.lineTo(cx + 7, cy + 20); ctx.lineTo(cx + 18, cy + 20); ctx.closePath(); ctx.fill();
    tex.needsUpdate = true;
  };
  draw(0);
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.1), mat);
  return { mesh, draw };
}

function createDust() {
  const n = 500;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) pos.set([(Math.random() - 0.5) * 16, (Math.random() - 0.5) * 10, -2 - Math.random() * 4], i * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xf0ebe5, size: 0.016, transparent: true, opacity: 0.5 }));
}

export async function mountHero(root: HTMLElement, src: string) {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null; // WebGL 미지원 → <Image> 대체 유지
  }
  const texture = await new THREE.TextureLoader().loadAsync(src).catch(() => null);
  if (!texture) { renderer.dispose(); return null; }
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  const img = texture.image as HTMLImageElement;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  root.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 8.5);

  // 배경 그라데이션 패널
  const back = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: `varying vec2 vUv; void main(){
        float d = distance(vUv, vec2(0.42, 0.47));
        vec3 c = mix(vec3(0.12,0.12,0.19), vec3(0.082,0.082,0.11), smoothstep(0.0, 0.14, d));
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
    uBg: { value: new THREE.Color(0x15151c) },
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

  // 홀로그램 패널 (페르소나 왼쪽 앞에 떠 있음)
  const panel = createPanel();
  scene.add(panel.mesh);

  // 레이아웃: 데스크톱은 오른쪽, 모바일은 가운데 위
  let mobile = false;
  const panelBase = new THREE.Vector3();
  const layout = () => {
    const w = root.clientWidth, h = root.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const visW = visH * camera.aspect;
    mobile = w < 760;
    if (mobile) {
      const s = Math.min(1, (visH * 0.62) / H);
      persona.scale.setScalar(s);
      persona.position.set(0, visH / 2 - (H * s) / 2 - 0.05, 0);
      panelBase.set(visW * 0.22, visH * 0.02, 1.2);
      panel.mesh.scale.setScalar(0.55);
      labelMesh.visible = false;
    } else {
      persona.scale.setScalar(1);
      persona.position.set(Math.max(0.9, visW / 2 - W / 2 - visW * 0.04), -0.1, 0);
      panelBase.set(persona.position.x - W * 0.6, 0.35, 1.4);
      panel.mesh.scale.setScalar(1);
      labelMesh.visible = true;
    }
  };
  layout();
  new ResizeObserver(layout).observe(root);

  // 포인터 시차
  const pointer = { x: 0, y: 0 };
  const tilt = { x: 0, y: 0 };
  root.addEventListener('pointermove', (e) => {
    const r = root.getBoundingClientRect();
    pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
  });
  root.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; });

  // 스크롤: 카메라가 물러나고 페르소나가 흐려짐
  const scroll = { p: 0 };
  ScrollTrigger.create({
    trigger: root, start: 'top top', end: 'bottom top', scrub: true,
    onUpdate: (self) => { scroll.p = self.progress; },
  });
  const copy = root.querySelector('[data-hero-copy]');
  if (copy) gsap.to(copy, { y: -60, opacity: 0, ease: 'none', scrollTrigger: { trigger: root, start: 'top top', end: '60% top', scrub: true } });

  // 등장: 빈 화면 → visual 로 스캔
  const hud = [reticle.material, labelMesh.material, panel.mesh.material] as THREE.Material[];
  hud.forEach((m) => { m.opacity = reduced ? 1 : 0; });
  const appear = () => {
    if (reduced) return;
    gsap.timeline()
      .to(uniforms.uSweep, { value: 1, duration: 1.6, ease: 'power2.inOut' })
      .to(hud, { opacity: 1, duration: 0.5, stagger: 0.15 }, '-=0.4')
      .from(face.scale, { x: 1.4, y: 1.4, duration: 0.6, ease: 'expo.out' }, '<');
  };
  if (document.documentElement.classList.contains('intro-on')) window.addEventListener('intro:done', appear, { once: true });
  else appear();

  // 보일 때만 렌더
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(root);

  const clock = new THREE.Clock();
  let lastDraw = 0;
  renderer.setAnimationLoop(() => {
    if (!visible || document.hidden) return;
    const t = reduced ? 0 : clock.getElapsedTime();
    uniforms.uTime.value = t;
    tilt.x += (pointer.y * 0.08 - tilt.x) * 0.06;
    tilt.y += (pointer.x * 0.12 - tilt.y) * 0.06;
    persona.rotation.set(tilt.x, tilt.y, 0);
    face.position.z = 0.05 + Math.sin(t * 2) * 0.02;
    reticle.scale.setScalar(1 + Math.sin(t * 2.4) * 0.015);
    panel.mesh.position.set(
      panelBase.x - tilt.y * 3, panelBase.y + Math.sin(t * 1.1) * 0.06 + tilt.x * 2, panelBase.z,
    );
    panel.mesh.rotation.set(-0.08 + tilt.x * 1.5, (mobile ? -0.2 : 0.38) + tilt.y * 2, 0);
    if (t - lastDraw > 1 / 20) { panel.draw(t); lastDraw = t; }
    dust.position.x = -tilt.y * 1.5;
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
  };
}
