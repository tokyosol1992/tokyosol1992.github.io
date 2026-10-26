"use client"

// Smoke Field — a WebGL2 fluid layer laid over a section. Smoke curls up from
// the lower part on its own and follows the pointer as it moves across the
// section. The canvas never takes pointer events, so whatever sits under it
// stays clickable; set it over other content with mix-blend-mode: screen.
//
// Stable-fluids solver after Pavel Dobryakov's WebGL-Fluid-Simulation (MIT):
// advect → curl/vorticity → divergence → pressure → subtract gradient.
// Renders nothing when WebGL2 or float render targets are missing, or when the
// viewer prefers reduced motion.

import * as React from "react"

export interface SmokeFieldProps {
  /** Smoke colour, #rrggbb. */
  color?: string
  /** Brightness of the pointer trail, 0–1. Defaults to 0.11. */
  intensity?: number
  /** Brightness of the idle puffs that rise on their own, 0–1. Defaults to 0.28. */
  idleIntensity?: number
  /** How fast smoke fades. Higher clears sooner. Defaults to 0.9. */
  dissipation?: number
  /** Swirl strength. Defaults to 22. */
  curl?: number
  /** Upward drift of the smoke. Defaults to 0.6. */
  rise?: number
  /** Puff size, as a fraction of the shorter side. Defaults to 0.22. */
  radius?: number
  /** Band (0 = bottom, 1 = top) where idle puffs start. Defaults to [0.08, 0.32]. */
  sourceBand?: [number, number]
  /** Seconds between idle puffs. Defaults to [0.5, 1.3]. */
  sourceEvery?: [number, number]
  /** Follow the pointer. Defaults to true. */
  interactive?: boolean
  /** Extra root class names. */
  className?: string
  style?: React.CSSProperties
}

/** #rrggbb → [r, g, b] in 0–1. */
function smokeRgb(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec((hex || "").trim())
  if (!m) return [0.16, 0.58, 0.97]
  const n = parseInt(m[1], 16)
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const VERT = `#version 300 es
precision highp float;
in vec2 aPosition;
out vec2 vUv, vL, vR, vT, vB;
uniform vec2 texelSize;
void main () {
  vUv = aPosition * 0.5 + 0.5;
  vL = vUv - vec2(texelSize.x, 0.0);
  vR = vUv + vec2(texelSize.x, 0.0);
  vT = vUv + vec2(0.0, texelSize.y);
  vB = vUv - vec2(0.0, texelSize.y);
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`

const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv, vL, vR, vT, vB;
out vec4 o;
`

const FRAG = {
  clear: `uniform sampler2D uTexture; uniform float value;
void main () { o = value * texture(uTexture, vUv); }`,
  splat: `uniform sampler2D uTarget; uniform float aspectRatio; uniform vec3 color; uniform vec2 point; uniform float radius;
void main () {
  vec2 p = vUv - point; p.x *= aspectRatio;
  vec3 s = exp(-dot(p, p) / radius) * color;
  o = vec4(texture(uTarget, vUv).xyz + s, 1.0);
}`,
  advection: `uniform sampler2D uVelocity, uSource; uniform vec2 texelSize; uniform float dt, dissipation;
void main () {
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
  o = texture(uSource, coord) / (1.0 + dissipation * dt);
}`,
  divergence: `uniform sampler2D uVelocity;
void main () {
  float L = texture(uVelocity, vL).x, R = texture(uVelocity, vR).x;
  float T = texture(uVelocity, vT).y, B = texture(uVelocity, vB).y;
  vec2 C = texture(uVelocity, vUv).xy;
  if (vL.x < 0.0) L = -C.x; if (vR.x > 1.0) R = -C.x;
  if (vT.y > 1.0) T = -C.y; if (vB.y < 0.0) B = -C.y;
  o = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
}`,
  curl: `uniform sampler2D uVelocity;
void main () {
  float L = texture(uVelocity, vL).y, R = texture(uVelocity, vR).y;
  float T = texture(uVelocity, vT).x, B = texture(uVelocity, vB).x;
  o = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
}`,
  // Vorticity confinement, plus buoyancy: dense smoke drifts upward.
  vorticity: `uniform sampler2D uVelocity, uCurl, uDye; uniform float curl, rise, dt;
void main () {
  float L = texture(uCurl, vL).x, R = texture(uCurl, vR).x;
  float T = texture(uCurl, vT).x, B = texture(uCurl, vB).x, C = texture(uCurl, vUv).x;
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C; force.y *= -1.0;
  vec2 vel = texture(uVelocity, vUv).xy + force * dt;
  vel.y += rise * length(texture(uDye, vUv).rgb) * 60.0 * dt;
  o = vec4(clamp(vel, -1000.0, 1000.0), 0.0, 1.0);
}`,
  pressure: `uniform sampler2D uPressure, uDivergence;
void main () {
  float L = texture(uPressure, vL).x, R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x, B = texture(uPressure, vB).x;
  o = vec4((L + R + B + T - texture(uDivergence, vUv).x) * 0.25, 0.0, 0.0, 1.0);
}`,
  gradient: `uniform sampler2D uPressure, uVelocity;
void main () {
  float L = texture(uPressure, vL).x, R = texture(uPressure, vR).x;
  float T = texture(uPressure, vT).x, B = texture(uPressure, vB).x;
  o = vec4(texture(uVelocity, vUv).xy - vec2(R - L, T - B), 0.0, 1.0);
}`,
  // Premultiplied: the brightest channel doubles as alpha.
  display: `uniform sampler2D uTexture;
void main () {
  vec3 c = texture(uTexture, vUv).rgb;
  float a = clamp(max(c.r, max(c.g, c.b)), 0.0, 1.0);
  o = vec4(min(c, vec3(a)), a);
}`,
}

type Prog = { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null> }
type Fbo = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number }
type DoubleFbo = { read: Fbo; write: Fbo; swap: () => void }

export default function SmokeField({
  color = "#2895f7",
  intensity = 0.11,
  idleIntensity = 0.28,
  dissipation = 0.9,
  curl = 22,
  rise = 0.6,
  radius = 0.22,
  sourceBand = [0.08, 0.32],
  sourceEvery = [0.5, 1.3],
  interactive = true,
  className = "",
  style,
}: SmokeFieldProps) {
  const canvasRef = React.useRef(null as HTMLCanvasElement | null)
  const opts = React.useRef({ color, intensity, idleIntensity, dissipation, curl, rise, radius, sourceBand, sourceEvery, interactive })
  opts.current = { color, intensity, idleIntensity, dissipation, curl, rise, radius, sourceBand, sourceEvery, interactive }

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const gl = canvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false })
    if (!gl || !gl.getExtension("EXT_color_buffer_float")) return

    // ── programs ──
    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const vs = shader(gl.VERTEX_SHADER, VERT)
    const make = (frag: string): Prog => {
      const p = gl.createProgram()!
      gl.attachShader(p, vs)
      gl.attachShader(p, shader(gl.FRAGMENT_SHADER, HEAD + frag))
      gl.bindAttribLocation(p, 0, "aPosition")
      gl.linkProgram(p)
      const u: Prog["u"] = {}
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS)
      for (let i = 0; i < n; i++) {
        const name = gl.getActiveUniform(p, i)!.name
        u[name] = gl.getUniformLocation(p, name)
      }
      return { p, u }
    }
    const P = {
      clear: make(FRAG.clear),
      splat: make(FRAG.splat),
      advection: make(FRAG.advection),
      divergence: make(FRAG.divergence),
      curl: make(FRAG.curl),
      vorticity: make(FRAG.vorticity),
      pressure: make(FRAG.pressure),
      gradient: make(FRAG.gradient),
      display: make(FRAG.display),
    }
    if (!gl.getProgramParameter(P.vorticity.p, gl.LINK_STATUS)) return

    // ── full-screen quad ──
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(0)

    const blit = (target: Fbo | null) => {
      if (target) {
        gl.viewport(0, 0, target.w, target.h)
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo)
      } else {
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      }
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
    }

    // ── render targets ──
    const fbo = (w: number, h: number, internal: number, format: number): Fbo => {
      gl.activeTexture(gl.TEXTURE0)
      const tex = gl.createTexture()!
      gl.bindTexture(gl.TEXTURE_2D, tex)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.HALF_FLOAT, null)
      const f = gl.createFramebuffer()!
      gl.bindFramebuffer(gl.FRAMEBUFFER, f)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
      gl.viewport(0, 0, w, h)
      gl.clear(gl.COLOR_BUFFER_BIT)
      return { tex, fbo: f, w, h }
    }
    const double = (w: number, h: number, internal: number, format: number): DoubleFbo => {
      const d = {
        read: fbo(w, h, internal, format),
        write: fbo(w, h, internal, format),
        swap: () => {
          const t = d.read
          d.read = d.write
          d.write = t
        },
      }
      return d
    }
    const bind = (unit: number, f: Fbo) => {
      gl.activeTexture(gl.TEXTURE0 + unit)
      gl.bindTexture(gl.TEXTURE_2D, f.tex)
      return unit
    }
    const res = (base: number) => {
      const a = gl.drawingBufferWidth / gl.drawingBufferHeight
      const min = Math.round(base)
      const max = Math.round(base * (a < 1 ? 1 / a : a))
      return a >= 1 ? [max, min] : [min, max]
    }

    let dye: DoubleFbo, vel: DoubleFbo, prs: DoubleFbo, div: Fbo, crl: Fbo
    const targets = () => {
      const [sw, sh] = res(128)
      const small = Math.min(canvas.clientWidth, canvas.clientHeight) < 600
      const [dw, dh] = res(small ? 384 : 640)
      dye = double(dw, dh, gl.RGBA16F, gl.RGBA)
      vel = double(sw, sh, gl.RG16F, gl.RG)
      prs = double(sw, sh, gl.R16F, gl.RED)
      div = fbo(sw, sh, gl.R16F, gl.RED)
      crl = fbo(sw, sh, gl.R16F, gl.RED)
    }

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width === w && canvas.height === h) return false
      canvas.width = w
      canvas.height = h
      return true
    }
    size()
    targets()

    // ── splats ──
    const splat = (x: number, y: number, dx: number, dy: number, rgb: number[], scale = 1) => {
      const aspect = canvas.width / canvas.height
      let r = (opts.current.radius * scale) / 100
      if (aspect > 1) r *= aspect
      gl.useProgram(P.splat.p)
      gl.uniform1i(P.splat.u.uTarget, bind(0, vel.read))
      gl.uniform1f(P.splat.u.aspectRatio, aspect)
      gl.uniform2f(P.splat.u.point, x, y)
      gl.uniform3f(P.splat.u.color, dx, dy, 0)
      gl.uniform1f(P.splat.u.radius, r)
      blit(vel.write)
      vel.swap()
      gl.uniform1i(P.splat.u.uTarget, bind(0, dye.read))
      gl.uniform3f(P.splat.u.color, rgb[0], rgb[1], rgb[2])
      blit(dye.write)
      dye.swap()
    }
    // Slight hue drift around the base colour keeps the smoke from reading flat.
    const tint = (k: number) => {
      const [r, g, b] = smokeRgb(opts.current.color)
      const j = 0.75 + Math.random() * 0.5
      return [r * k * j, g * k * (0.85 + Math.random() * 0.3), b * k]
    }
    const rand = (a: number, b: number) => a + Math.random() * (b - a)
    let nextPuff = 0
    const puff = (now: number) => {
      if (now < nextPuff) return
      const o = opts.current
      nextPuff = now + rand(o.sourceEvery[0], o.sourceEvery[1]) * 1000
      const x = rand(0.06, 0.94)
      const y = rand(o.sourceBand[0], o.sourceBand[1])
      splat(x, y, rand(-120, 120), rand(260, 620), tint(o.idleIntensity), rand(0.8, 1.4))
    }

    // ── step ──
    const step = (dt: number) => {
      const o = opts.current
      gl.disable(gl.BLEND)
      const vt = [1 / vel.read.w, 1 / vel.read.h]

      gl.useProgram(P.curl.p)
      gl.uniform2f(P.curl.u.texelSize, vt[0], vt[1])
      gl.uniform1i(P.curl.u.uVelocity, bind(0, vel.read))
      blit(crl)

      gl.useProgram(P.vorticity.p)
      gl.uniform2f(P.vorticity.u.texelSize, vt[0], vt[1])
      gl.uniform1i(P.vorticity.u.uVelocity, bind(0, vel.read))
      gl.uniform1i(P.vorticity.u.uCurl, bind(1, crl))
      gl.uniform1i(P.vorticity.u.uDye, bind(2, dye.read))
      gl.uniform1f(P.vorticity.u.curl, o.curl)
      gl.uniform1f(P.vorticity.u.rise, o.rise)
      gl.uniform1f(P.vorticity.u.dt, dt)
      blit(vel.write)
      vel.swap()

      gl.useProgram(P.divergence.p)
      gl.uniform2f(P.divergence.u.texelSize, vt[0], vt[1])
      gl.uniform1i(P.divergence.u.uVelocity, bind(0, vel.read))
      blit(div)

      gl.useProgram(P.clear.p)
      gl.uniform1i(P.clear.u.uTexture, bind(0, prs.read))
      gl.uniform1f(P.clear.u.value, 0.8)
      blit(prs.write)
      prs.swap()

      gl.useProgram(P.pressure.p)
      gl.uniform2f(P.pressure.u.texelSize, vt[0], vt[1])
      gl.uniform1i(P.pressure.u.uDivergence, bind(0, div))
      for (let i = 0; i < 20; i++) {
        gl.uniform1i(P.pressure.u.uPressure, bind(1, prs.read))
        blit(prs.write)
        prs.swap()
      }

      gl.useProgram(P.gradient.p)
      gl.uniform2f(P.gradient.u.texelSize, vt[0], vt[1])
      gl.uniform1i(P.gradient.u.uPressure, bind(0, prs.read))
      gl.uniform1i(P.gradient.u.uVelocity, bind(1, vel.read))
      blit(vel.write)
      vel.swap()

      gl.useProgram(P.advection.p)
      gl.uniform2f(P.advection.u.texelSize, vt[0], vt[1])
      gl.uniform1i(P.advection.u.uVelocity, bind(0, vel.read))
      gl.uniform1i(P.advection.u.uSource, bind(0, vel.read))
      gl.uniform1f(P.advection.u.dt, dt)
      gl.uniform1f(P.advection.u.dissipation, 0.2)
      blit(vel.write)
      vel.swap()

      gl.uniform1i(P.advection.u.uVelocity, bind(0, vel.read))
      gl.uniform1i(P.advection.u.uSource, bind(1, dye.read))
      gl.uniform1f(P.advection.u.dissipation, o.dissipation)
      blit(dye.write)
      dye.swap()
    }

    const render = () => {
      gl.useProgram(P.display.p)
      gl.uniform2f(P.display.u.texelSize, 1 / canvas.width, 1 / canvas.height)
      gl.uniform1i(P.display.u.uTexture, bind(0, dye.read))
      blit(null)
    }

    // ── pointer ──
    let px = -1
    let py = -1
    const onMove = (e: PointerEvent) => {
      if (!opts.current.interactive) return
      const b = canvas.getBoundingClientRect()
      const x = (e.clientX - b.left) / b.width
      const y = 1 - (e.clientY - b.top) / b.height
      if (x < 0 || x > 1 || y < 0 || y > 1) {
        px = -1
        return
      }
      if (px >= 0) {
        const dx = x - px
        const dy = y - py
        if (Math.abs(dx) + Math.abs(dy) > 0.0005) {
          const aspect = canvas.width / canvas.height
          splat(x, y, dx * 6000 * (aspect < 1 ? aspect : 1), dy * 6000 * (aspect > 1 ? 1 / aspect : 1), tint(opts.current.intensity))
        }
      }
      px = x
      py = y
    }
    const onLeave = () => {
      px = -1
    }

    // ── loop ──
    let raf = 0
    let last = performance.now()
    let visible = true
    const loop = (now: number) => {
      raf = 0
      if (!visible) return
      const dt = Math.min((now - last) / 1000, 1 / 60)
      last = now
      if (size()) targets()
      puff(now)
      step(dt)
      render()
      raf = requestAnimationFrame(loop)
    }
    const start = () => {
      if (raf || !visible) return
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver((entries) => {
      visible = entries[0] ? entries[0].isIntersecting : true
      if (visible) start()
    })
    io.observe(canvas)
    window.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("pointerleave", onLeave)
    start()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("pointerleave", onLeave)
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%", pointerEvents: "none", ...style }}
    />
  )
}
