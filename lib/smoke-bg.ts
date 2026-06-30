/* ============================================================
   Subtiler, goldener WebGL-Smoke-Hintergrund
   Framework-agnostisch (kein React) – portiert aus einem WebGL2/GLSL-Shader.
   Angepasst für helle Creme-Flächen: gibt transparente, goldene Schwaden aus
   (Alpha statt dunklem Grund). Läuft mit reduzierter Auflösung, pausiert bei
   verstecktem Tab und respektiert prefers-reduced-motion (nur ein Standbild).
   ============================================================ */

type RGB = [number, number, number];

const hexToRgb = (hex: string): RGB => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m
    ? [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255]
    : [0.5, 0.5, 0.5];
};

const VERT = `#version 300 es
precision highp float;
in vec4 position;
void main(){ gl_Position = position; }`;

// Fragment-Shader: weiche fbm-Schwaden, als premultiplizierte goldene Farbe mit
// Alpha = Dichte ausgegeben. Über Creme entsteht so ein zarter Gold-Schleier.
const FRAG = `#version 300 es
precision highp float;
out vec4 O;
uniform float time;
uniform vec2 resolution;
uniform vec3 u_color;

#define FC gl_FragCoord.xy
#define R resolution
#define T (time+660.)

float rnd(vec2 p){p=fract(p*vec2(12.9898,78.233));p+=dot(p,p+34.56);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(rnd(i),rnd(i+vec2(1,0)),u.x),mix(rnd(i+vec2(0,1)),rnd(i+1.),u.x),u.y);}
float fbm(vec2 p){float t=.0,a=1.;for(int i=0;i<5;i++){t+=a*noise(p);p*=mat2(1,-1.2,.2,1.2)*2.;a*=.5;}return t;}

void main(){
  vec2 uv=(FC-.5*R)/R.y;
  uv.x+=.25;
  uv*=vec2(2,1);

  float n=fbm(uv*.28-vec2(T*.01,0));
  n=noise(uv*3.+n*2.);

  float s=fbm(uv+vec2(0,T*.015)+n);
  // Dichte in weiche, zurückhaltende Schwaden übersetzen
  s=smoothstep(.45,1.3,s);
  // sanftes Einblenden
  s*=min(time*.22,1.);

  // premultiplizierte Ausgabe: goldene Farbe, Alpha = Dichte
  O=vec4(u_color*s, s);
}`;

interface SmokeOptions {
  color?: string;
  scale?: number; // Render-Auflösung relativ zum Viewport (Performance)
}

export function initSmokeBackground(
  canvas: HTMLCanvasElement,
  opts: SmokeOptions = {}
): void {
  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    premultipliedAlpha: true,
  });
  if (!gl) return; // Kein WebGL2 -> Hintergrund bleibt einfach leer

  const compile = (type: number, src: string): WebGLShader | null => {
    const sh = gl.createShader(type);
    if (!sh) return null;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error("Smoke shader:", gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  };

  const program = gl.createProgram();
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!program || !vs || !fs) return;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Smoke program:", gl.getProgramInfoLog(program));
    return;
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1]),
    gl.STATIC_DRAW
  );
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uResolution = gl.getUniformLocation(program, "resolution");
  const uTime = gl.getUniformLocation(program, "time");
  const uColor = gl.getUniformLocation(program, "u_color");

  const color = hexToRgb(opts.color ?? "#c9a24a");
  const scale = opts.scale ?? 0.5;

  const resize = () => {
    const w = Math.max(1, Math.floor(window.innerWidth * scale));
    const h = Math.max(1, Math.floor(window.innerHeight * scale));
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  };
  resize();
  window.addEventListener("resize", resize, { passive: true });

  const draw = (now: number) => {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uTime, now * 1e-3);
    gl.uniform3fv(uColor, color);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce) {
    // Reduzierte Bewegung: ein ruhiges Standbild, kein Animationsloop.
    draw(6000);
    return;
  }

  // Software-WebGL erkennen (z. B. SwiftShader / llvmpipe – aktiv, sobald die
  // Browser-Hardwarebeschleunigung deaktiviert ist). Dort kostet der Fullscreen-
  // Shader pro Frame sehr viel CPU -> deutlich staerkere Bildraten-Deckelung.
  const dbg = gl.getExtension("WEBGL_debug_renderer_info");
  const rendererName = dbg
    ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || "")
    : "";
  const softwareGL =
    /swiftshader|software|llvmpipe|basic render|microsoft/i.test(rendererName);

  // Bildrate deckeln: die goldenen Schwaden bewegen sich extrem langsam, daher
  // ist eine niedrigere Update-Rate optisch nicht unterscheidbar, spart aber
  // spuerbar CPU/GPU. Ohne HW-Beschleunigung noch staerker gedrosselt.
  const frameMs = softwareGL ? 1000 / 12 : 1000 / 30;
  let lastDraw = -1e9;

  // Waehrend aktiv gescrollt wird, den teuren Redraw aussetzen (das letzte
  // Standbild bleibt stehen). So konkurriert der Shader nicht mit dem Scroll
  // -> kein Ruckeln. Die Schwaden sind so traege, dass die Pause unsichtbar ist.
  let scrolling = false;
  let scrollTimer = 0;
  const pause = () => {
    scrolling = true;
    clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      scrolling = false;
    }, 180);
  };
  window.addEventListener("scroll", pause, { passive: true });
  // Element-Scroll mitfangen: das Preis-Karussell schreibt track.scrollLeft ->
  // scroll feuert nur am Element und bubbelt NICHT zu window. Capture-Phase.
  document.addEventListener("scroll", pause, { passive: true, capture: true });
  // Pointer-Drag (Galerie-Faecher & Karussell ziehen per GSAP-Transform bzw.
  // scrollLeft, ganz ohne window-scroll): waehrend des Ziehens pausieren. Nur bei
  // gedrueckter Taste -> bei reiner Mausbewegung animieren die traegen Schwaden
  // normal weiter. Die kurze Pause ist optisch nicht sichtbar.
  window.addEventListener("pointerdown", pause, { passive: true });
  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.buttons) pause();
    },
    { passive: true }
  );
  window.addEventListener("pointerup", pause, { passive: true });

  let raf = 0;
  let running = true;
  const loop = (now: number) => {
    if (!running) return;
    // FPS-Deckel + Pause: nur zeichnen, wenn faellig UND keine Interaktion
    // (Scroll oder Pointer-Drag) laeuft.
    if (!scrolling && now - lastDraw >= frameMs) {
      draw(now);
      lastDraw = now;
    }
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  // Im Hintergrund-Tab pausieren (spart Akku/GPU).
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(raf);
    } else if (!running) {
      running = true;
      raf = requestAnimationFrame(loop);
    }
  });
}
