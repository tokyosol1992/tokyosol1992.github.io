(() => {
  const PAGES = JSON.parse(document.getElementById('pages').textContent);
  const ORDER = ['/', '/category/portfolio', '/category/tips', '/category/ai', '/category/tools', '/category/notes', '/about', '/work', '/archive',
    '/work/sample-case-study', '/archive/hello-archive', '/archive/sample-tip', '/archive/sample-ai-prompt', '/archive/sample-tool'];
  const MODES = [
    { label: 'visual', stats: [['signal', 98], ['exposure', 64], ['noise', 7]] },
    { label: 'thermal', stats: [['heat index', 72], ['contrast', 88], ['noise', 18]] },
    { label: 'edge scan', stats: [['edge density', 91], ['mesh sync', 83], ['noise', 3]] },
  ];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const site = $('#site'), sheets = $('#sheets');
  let path = '/';
  let hero = null;

  function fillImages(root) {
    for (const img of $$('img[data-persona]', root)) img.src = PERSONA;
  }

  /* ── 글자 스크램블 (src/scripts/scramble.ts와 같은 규칙) ── */
  const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/<>';
  const randomLike = (ch) => {
    const c = ch.charCodeAt(0);
    if (c >= 0xac00 && c < 0xac00 + 11172) return String.fromCharCode(0xac00 + Math.floor(Math.random() * 11172));
    if (/[a-z]/.test(ch)) return LATIN[Math.floor(Math.random() * LATIN.length)].toLowerCase();
    if (/[A-Z0-9]/.test(ch)) return LATIN[Math.floor(Math.random() * LATIN.length)];
    return ch;
  };
  const running = new WeakSet();
  function scramble(el, ms) {
    if (!el || running.has(el) || reduced()) return;
    running.add(el);
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push({ node: walker.currentNode, text: walker.currentNode.data });
    const total = nodes.reduce((n, t) => n + t.text.length, 0) || 1;
    const duration = ms || Math.min(700, Math.max(320, total * 28));
    let i = 0;
    const settle = nodes.map((t) => [...t.text].map(() => ((i++ / total) * 0.75 + Math.random() * 0.25) * duration));
    const fixed = el.dataset.scramble === 'fixed';
    if (fixed) el.style.width = `${el.getBoundingClientRect().width}px`;
    const start = performance.now();
    let last = 0;
    const frame = (now) => {
      const t = now - start;
      if (t >= duration) {
        nodes.forEach(({ node, text }) => { node.data = text; });
        if (fixed) el.style.width = '';
        running.delete(el);
        return;
      }
      if (now - last >= 45) {
        last = now;
        nodes.forEach(({ node, text }, n) => { node.data = [...text].map((ch, c) => (t >= settle[n][c] ? ch : randomLike(ch))).join(''); });
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
  document.addEventListener('pointerover', (e) => {
    if (!fine.matches) return;
    const trigger = e.target.closest('a, button');
    if (!trigger || trigger.contains(e.relatedTarget)) return;
    scramble(trigger.matches('[data-scramble]') ? trigger : trigger.querySelector('[data-scramble]'));
  });

  /* ── 서울 시계 ── */
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const tick = () => { for (const el of $$('[data-clock]')) el.textContent = `SEOUL ${fmt.format(new Date())}`; };
  tick(); setInterval(tick, 1000);

  /* ── 리스트 필터·검색 (Library.astro와 같은 동작) ── */
  function initLibrary(scope) {
    for (const root of $$('[data-library]', scope)) {
      const rows = $$('li[data-kind]', root), buttons = $$('[data-kind-btn]', root);
      const input = $('[data-search-input]', root), count = $('[data-count]', root), none = $('[data-no-result]', root);
      let kind = '';
      const apply = () => {
        const q = (input?.value ?? '').trim().toLowerCase();
        let shown = 0;
        for (const row of rows) {
          const ok = (!kind || row.dataset.kind === kind) && (!q || row.dataset.search.includes(q));
          row.hidden = !ok; if (ok) shown++;
        }
        if (count) count.textContent = String(shown);
        if (none) none.hidden = shown > 0 || rows.length === 0;
      };
      buttons.forEach((b) => b.addEventListener('click', () => {
        kind = b.dataset.kindBtn ?? '';
        buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        apply();
      }));
      input?.addEventListener('input', apply);
    }
  }

  function markMenu(header, p, animate) {
    for (const a of $$('.menu a', header)) {
      const on = p.startsWith(a.getAttribute('href'));
      if (on && !a.hasAttribute('aria-current')) { a.setAttribute('aria-current', 'page'); if (animate) scramble(a, 420); }
      else if (!on) a.removeAttribute('aria-current');
    }
  }

  /* ── 한 페이지 그리기 ── */
  function swap(p) {
    hero?.destroy(); hero = null;
    path = PAGES[p] ? p : '/';
    const main = $('main', site);
    main.outerHTML = PAGES[path];
    const next = $('main', site);
    fillImages(next);
    initLibrary(next);
    const h = $('[data-hero]', next);
    if (h) hero = mountHero(h);
    window.scrollTo(0, 0);
    return next;
  }

  /* ── 페이지 전환 C · 레티클 포커스 (src/scripts/page-transition.ts) ── */
  const OUT = 360, HOLD = 120, IN = 440, ARRIVE = 520, ARRIVE_AT = 0.4, DIM = 0.82;
  const EASE_OUT = 'cubic-bezier(.16, 1, .3, 1)';
  const layer = $('[data-pt]'), dim = $('[data-pt-dim]'), ret = $('[data-pt-ret]'), tag = $('[data-pt-tag]');
  const frame = () => ({ x: 12, y: 12, w: innerWidth - 24, h: innerHeight - 24 });
  const box = (b) => ({ left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, height: `${b.h}px` });
  const pad = (n) => String(Math.max(0, Math.round(n))).padStart(4, '0');
  let busy = false;

  function targetOf(el) {
    const r = el?.getBoundingClientRect();
    if (r && r.width && r.bottom > 0 && r.top < innerHeight) return { x: r.left - 10, y: r.top - 8, w: r.width + 20, h: r.height + 16 };
    return { x: innerWidth / 2 - 70, y: innerHeight / 2 - 30, w: 140, h: 60 };
  }
  function arrive(main) {
    scramble($('h1', main), ARRIVE);
    $$('.page-head > :not(h1), .toolbar, .count, .list > li, .entry header > :not(h1), .entry .cover, .prose, .spec, .about-section, .subject', main)
      .slice(0, 10).forEach((el, i) => el.animate(
        [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
        { duration: 420, delay: i * 45, easing: EASE_OUT, fill: 'backwards' }));
  }
  async function go(to, source) {
    if (busy || to === path) return;
    busy = true;
    try {
      if (reduced()) {
        await $('main', site).animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, fill: 'forwards' }).finished;
        swap(to); markMenu($('header.site', site), path, false);
        $('main', site).animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 });
        return;
      }
      const target = targetOf(source);
      const header = $('header.site', site);
      dim.style.top = `${header.getBoundingClientRect().bottom}px`;
      tag.textContent = `lock x${pad(target.x)} y${pad(target.y)} → ${to}`;
      tag.style.opacity = '';
      layer.classList.add('on');
      $('.hud-frame').style.visibility = 'hidden';
      await Promise.all([
        ret.animate([box(frame()), box(target)], { duration: OUT, easing: EASE_OUT, fill: 'forwards' }).finished,
        dim.animate([{ opacity: 0 }, { opacity: DIM }], { duration: OUT, easing: 'ease-in', fill: 'forwards' }).finished,
        tag.animate([{ opacity: 0 }, { opacity: 1 }], { duration: OUT * 0.3, delay: OUT * 0.7, fill: 'both' }).finished,
      ]);
      await ret.animate([{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }], { duration: HOLD, easing: 'steps(1, end)' }).finished;
      const main = swap(to);
      markMenu(header, path, true);
      tag.getAnimations().forEach((a) => a.cancel()); tag.style.opacity = '0';
      setTimeout(() => arrive(main), IN * ARRIVE_AT);
      await Promise.all([
        ret.animate([box(target), box(frame())], { duration: IN, easing: EASE_OUT, fill: 'forwards' }).finished,
        dim.animate([{ opacity: DIM }, { opacity: 0 }], { duration: IN, easing: EASE_OUT, fill: 'forwards' }).finished,
        main.animate([{ filter: 'blur(8px)', transform: 'scale(1.015)' }, { filter: 'blur(0)', transform: 'none' }], { duration: IN, easing: EASE_OUT }).finished,
      ]);
      [ret, dim, tag].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
      layer.classList.remove('on');
      $('.hud-frame').style.visibility = '';
    } finally { busy = false; }
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="/"]');
    if (!a) return;
    e.preventDefault();
    if (document.body.dataset.view === 'all') {
      const sheet = document.getElementById(`sheet-${a.getAttribute('href')}`);
      sheet?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' });
      return;
    }
    go(a.getAttribute('href'), a);
  });

  /* ── 히어로: 페르소나 셰이더 (src/scripts/hero-scene.ts를 WebGL로 옮김) ── */
  const VERT = 'attribute vec2 p; varying vec2 vUv; void main(){ vUv = p * 0.5 + 0.5; gl_Position = vec4(p, 0.0, 1.0); }';
  const FRAG = `precision highp float;
  uniform sampler2D uTex; uniform sampler2D uDepth; uniform vec2 uTexel; uniform float uTime; uniform float uMode; uniform float uPrev;
  uniform float uSweep; uniform vec2 uMouse; uniform vec3 uBg; varying vec2 vUv;
  float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }
  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
  vec3 thermal(float t) {
    vec3 c = mix(vec3(0.02, 0.02, 0.08), vec3(0.25, 0.05, 0.55), smoothstep(0.0, 0.25, t));
    c = mix(c, vec3(0.85, 0.1, 0.45), smoothstep(0.2, 0.45, t));
    c = mix(c, vec3(1.0, 0.55, 0.05), smoothstep(0.4, 0.7, t));
    return mix(c, vec3(1.0, 0.97, 0.8), smoothstep(0.7, 1.0, t));
  }
  vec4 tex(vec2 uv) { return texture2D(uTex, vec2(uv.x, 1.0 - uv.y)); }
  float sobel(vec2 uv) {
    float tl = lum(tex(uv + uTexel * vec2(-1., 1.)).rgb), t = lum(tex(uv + uTexel * vec2(0., 1.)).rgb), tr = lum(tex(uv + uTexel * vec2(1., 1.)).rgb);
    float l = lum(tex(uv + uTexel * vec2(-1., 0.)).rgb), r = lum(tex(uv + uTexel * vec2(1., 0.)).rgb);
    float bl = lum(tex(uv + uTexel * vec2(-1., -1.)).rgb), b = lum(tex(uv + uTexel * vec2(0., -1.)).rgb), br = lum(tex(uv + uTexel * vec2(1., -1.)).rgb);
    return length(vec2(-tl - 2.*l - bl + tr + 2.*r + br, -tl - 2.*t - tr + bl + 2.*b + br));
  }
  vec3 bloom(vec2 uv) {
    vec3 acc = vec3(0.0);
    for (int i = 0; i < 12; i++) { float fi = float(i); float a = fi * 2.39996;
      vec3 s = tex(uv + vec2(cos(a), sin(a)) * (0.004 + 0.0022 * fi)).rgb; acc += s * smoothstep(0.38, 0.6, lum(s)); }
    return acc / 12.0;
  }
  vec4 shade(float m, vec2 uv, float glitch) {
    vec3 base = tex(uv).rgb;
    if (m < 0.5) { vec3 c = base;
      if (glitch != 0.0) { c.r = tex(uv + vec2(glitch * 2.0, 0.)).r; c.b = tex(uv - vec2(glitch * 2.0, 0.)).b; }
      return vec4(c + bloom(uv) * 0.7, 1.0); }
    if (m < 1.5) return vec4(thermal(pow(lum(base), 0.8)) * (0.95 + 0.05 * sin(uv.y * 600.0 + uTime * 4.0)), 1.0);
    if (m < 2.5) { float e = smoothstep(0.08, 0.45, sobel(uv)); vec2 g = fract(uv * vec2(70.0, 84.0));
      return vec4(vec3(0.157, 0.584, 0.969) * (e + step(0.92, g.x) * step(0.92, g.y) * 0.25) + base * 0.08, 1.0); }
    return vec4(0.0);
  }
  vec3 overlay(vec3 s, vec3 d) { return mix(2.0 * s * d, 1.0 - 2.0 * (1.0 - s) * (1.0 - d), step(0.5, d)); }
  void main() {
    float depth = texture2D(uDepth, vec2(vUv.x, 1.0 - vUv.y)).r;
    vec2 uv = vUv - (depth - 0.5) * 0.045 * uMouse;
    float bands = 260.0; float seg = fract(uv.y * bands + uTime * 0.4); uv.y -= (seg - 0.5) / bands * 0.45;
    float tick = floor(uTime * 6.0); float rowSize = 0.008 + 0.03 * hash(vec2(tick, 3.1)); float row = floor(uv.y / rowSize);
    float glitch = (hash(vec2(row + 7.0, tick)) - 0.5) * 0.005 * step(0.975, hash(vec2(row, tick)));
    uv.x += glitch;
    float sweeping = step(0.001, uSweep) * step(uSweep, 0.999); float line = 1.0 - uSweep;
    float near = 1.0 - smoothstep(0.0, 0.04, abs(uv.y - line));
    uv.x += (hash(vec2(floor(uv.y * 120.0), floor(uTime * 20.0))) - 0.5) * 0.04 * near * sweeping;
    vec4 col = uv.y > line ? shade(uMode, uv, glitch) : shade(uPrev, uv, glitch);
    col.rgb += vec3(0.157, 0.584, 0.969) * near * 1.4 * sweeping; col.a = max(col.a, near * sweeping);
    float grain = hash(floor(vUv * vec2(1100.0, 1330.0)) + fract(floor(uTime * 12.0) * 0.137) * 100.0);
    col.rgb = mix(col.rgb, overlay(vec3(grain), col.rgb), 0.18);
    col.rgb = max(col.rgb, uBg);
    vec2 q = (vUv - vec2(0.5, 0.6) - uMouse * vec2(0.04, 0.03)) / vec2(0.55, 0.62);
    float edge = (1.0 - smoothstep(0.6, 1.0, length(q))) * smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.92, vUv.y);
    float a = col.a * edge;
    gl_FragColor = vec4(col.rgb * a, a);
  }`;

  function loadImage(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }

  function mountHero(root) {
    const boxEl = document.createElement('div');
    boxEl.className = 'persona-box';
    boxEl.innerHTML = '<canvas></canvas><div class="face" aria-hidden="true"><i></i><i></i><i></i><i></i><span class="mono">subj: solgil.exe<br><em>id match 98.2% · ok</em></span></div>';
    const canvas = $('canvas', boxEl), face = $('.face', boxEl);
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return null;
    let alive = true, raf = 0;
    const uni = { mode: 0, prev: 3, sweep: reduced() ? 1 : 0 };
    const mouse = { x: 0, y: 0 }, pointer = { x: 0, y: 0 };
    let lastMove = -10;
    const t0 = performance.now();
    const now = () => (performance.now() - t0) / 1000;
    const onMove = (e) => { if (e.pointerType !== 'mouse') return; pointer.x = (e.clientX / innerWidth) * 2 - 1; pointer.y = -((e.clientY / innerHeight) * 2 - 1); lastMove = now(); };
    window.addEventListener('pointermove', onMove);

    const tween = (from, to, ms, set) => {
      const start = performance.now();
      const step = (n) => { if (!alive) return; const k = Math.min(1, (n - start) / ms); const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; set(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    const buttons = $$('[data-mode]', root), stats = $$('[data-stats] > div', root);
    const select = (i) => {
      buttons.forEach((b, j) => b.setAttribute('aria-pressed', String(i === j)));
      MODES[i].stats.forEach(([label, v], j) => { if (stats[j]) { $('span', stats[j]).textContent = label; $('b', stats[j]).textContent = `${v}%`; } });
      if (uni.mode === i) return;
      uni.prev = uni.mode; uni.mode = i;
      if (reduced()) { uni.sweep = 1; return; }
      uni.sweep = 0; tween(0, 1, 900, (v) => { uni.sweep = v; });
    };
    buttons.forEach((b, i) => b.addEventListener('click', () => select(i)));
    const onKey = (e) => { if (e.target.closest('input, textarea')) return; const n = Number(e.key); if (n >= 1 && n <= 3) select(n - 1); };
    window.addEventListener('keydown', onKey);

    Promise.all([loadImage(PERSONA), loadImage(DEPTH)]).then(([img, dep]) => {
      if (!alive) return;
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
      const prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(prog); gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const texture = (unit, image) => {
        const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      };
      texture(0, img); texture(1, dep);
      const U = (n) => gl.getUniformLocation(prog, n);
      gl.uniform1i(U('uTex'), 0); gl.uniform1i(U('uDepth'), 1);
      gl.uniform2f(U('uTexel'), 1 / img.width, 1 / img.height);
      gl.uniform3f(U('uBg'), 11 / 255, 11 / 255, 13 / 255);
      const uTime = U('uTime'), uMode = U('uMode'), uPrev = U('uPrev'), uSweep = U('uSweep'), uMouse = U('uMouse');
      root.querySelector('.fallback')?.remove();
      root.prepend(boxEl);
      if (!reduced()) tween(0, 1, 1600, (v) => { uni.sweep = v; });
      face.animate([{ opacity: 0, transform: 'scale(1.4)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: reduced() ? 0 : 1200, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
      const draw = () => {
        if (!alive) return;
        raf = requestAnimationFrame(draw);
        const dpr = Math.min(devicePixelRatio || 1, 2);
        const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
        const t = reduced() ? 0 : now();
        if (!reduced()) {
          const idle = t - lastMove > 3;
          mouse.x += ((idle ? Math.sin(t * 0.35) * 0.45 : pointer.x) - mouse.x) * 0.05;
          mouse.y += ((idle ? Math.cos(t * 0.27) * 0.3 : pointer.y) - mouse.y) * 0.05;
        }
        gl.uniform1f(uTime, t); gl.uniform1f(uMode, uni.mode); gl.uniform1f(uPrev, uni.prev); gl.uniform1f(uSweep, uni.sweep);
        gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        // 레티클은 얼굴(깊이 ≈ 0.85)이 시차로 움직인 만큼 같이 이동
        face.style.translate = `${0.35 * 0.045 * mouse.x * boxEl.clientWidth}px ${-0.35 * 0.045 * mouse.y * boxEl.clientHeight}px`;
      };
      draw();
    }).catch(() => {});

    return {
      destroy() {
        alive = false; cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', onMove); window.removeEventListener('keydown', onKey);
        gl.getExtension('WEBGL_lose_context')?.loseContext();
      },
    };
  }

  /* ── 보기 전환: 한 페이지씩(전환 C) / 전체 펼치기(Figma로 옮길 때) ── */
  function buildSheets() {
    if (sheets.childElementCount) return;
    const headerHTML = $('header.site', site).outerHTML, footerHTML = $('footer.site', site).outerHTML;
    sheets.innerHTML = ORDER.map((p) => `<section class="sheet" id="sheet-${p}">
      <p class="sheet-label mono">page · ${p}</p>
      <div class="sheet-frame">${headerHTML}${PAGES[p]}${footerHTML}</div></section>`).join('');
    for (const s of $$('.sheet', sheets)) {
      const p = s.id.slice(6);
      markMenu($('header.site', s), p, false);
      for (const a of $$('[aria-current]', s)) if (!$('.menu', s).contains(a)) a.removeAttribute('aria-current');
    }
    fillImages(sheets);
    initLibrary(sheets);
    // 정지 화면: 히어로는 사진 그대로, 레티클만 얹음
    for (const h of $$('[data-hero]', sheets)) {
      const f = $('.fallback', h);
      const wrap = document.createElement('div');
      wrap.className = 'persona-box still';
      wrap.innerHTML = '<div class="face" aria-hidden="true"><i></i><i></i><i></i><i></i><span class="mono">subj: solgil.exe<br><em>id match 98.2% · ok</em></span></div>';
      f.replaceWith(wrap); wrap.prepend(f); f.classList.remove('fallback');
    }
  }
  function setView(v) {
    document.body.dataset.view = v;
    for (const b of $$('[data-view-btn]')) b.setAttribute('aria-pressed', String(b.dataset.viewBtn === v));
    if (v === 'all') { buildSheets(); hero?.destroy(); hero = null; }
    else if (!hero && $('[data-hero]', site)) { swap(path); }
    try { localStorage.setItem('solgil-view', v); } catch (e) {}
  }
  $$('[data-view-btn]').forEach((b) => b.addEventListener('click', () => setView(b.dataset.viewBtn)));

  fillImages(site);
  swap('/');
  markMenu($('header.site', site), '/', false);
  let saved = 'one';
  try { saved = localStorage.getItem('solgil-view') || 'one'; } catch (e) {}
  if (location.hash === '#figma') saved = 'all';
  if (saved === 'all') setView('all');
})();
