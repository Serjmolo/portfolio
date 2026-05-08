(function () {
  function initEye() {
    const canvas = document.getElementById('eye-canvas');
    const hero   = document.querySelector('.hero');
    if (!canvas || !window.THREE) return;

    const THREE = window.THREE;

    let W = window.innerWidth;
    let H = window.innerHeight;
    const FH = 10;
    let FW = FH * (W / H);

    const scene  = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -FW / 2, FW / 2, FH / 2, -FH / 2, 0.1, 100
    );
    camera.position.z = 10;

    const dpr = Math.min(window.devicePixelRatio, 2);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(dpr);
      renderer.setSize(W, H, false);
    } catch (e) {
      console.error('[eye.js] WebGL init failed:', e);
      return;
    }
    // ── Dimensions ──────────────────────────────────────────────────────
    function dims() {
      const ew = FW * 0.62;
      const eh = ew * 0.30;
      const ir = eh * 0.92;
      const pr = ir * 0.38;
      return { ew, eh, ir, pr };
    }

    // ── Soft-dot sprite ─────────────────────────────────────────────────
    function makeSprite() {
      const c   = document.createElement('canvas');
      c.width   = c.height = 64;
      const ctx = c.getContext('2d');
      const g   = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0,    'rgba(255,255,255,1)');
      g.addColorStop(0.38, 'rgba(255,255,255,0.85)');
      g.addColorStop(1,    'rgb(228, 228, 228)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    }

    // ── Helpers ─────────────────────────────────────────────────────────
    function inEye(x, y, ew, eh) {
      const t = (x + ew / 2) / ew;
      if (t < 0 || t > 1) return false;
      return Math.abs(y) < eh * Math.sin(t * Math.PI) * 0.97;
    }

    function randCircle(r) {
      for (;;) {
        const x = (Math.random() * 2 - 1) * r;
        const y = (Math.random() * 2 - 1) * r;
        if (x * x + y * y <= r * r) return [x, y];
      }
    }

    function randSclera(ew, eh, minR) {
      for (let i = 0; i < 300; i++) {
        const x = (Math.random() * 2 - 1) * ew / 2;
        const y = (Math.random() * 2 - 1) * eh;
        if (inEye(x, y, ew, eh) && x * x + y * y > minR * minR) return [x, y];
      }
      return [0, 0];
    }

    function elidPt(t, ew, eh, upper) {
      return [
        -ew / 2 + t * ew,
        (upper ? 1 : -1) * eh * Math.sin(t * Math.PI)
      ];
    }

    function clamp(v) { return Math.max(0, Math.min(1, v)); }
    function rand(s)  { return (Math.random() - 0.5) * s; }
    function spread(s){ return (Math.random() - 0.5) * s; }

    // ── Particle counts ─────────────────────────────────────────────────
    const NI = 2800; // iris
    const NP =  700; // pupil
    const NS =  380; // sclera
    const NE =  380; // eyelid
    const N  = NI + NP + NS + NE;

    const pos     = new Float32Array(N * 3);
    const col     = new Float32Array(N * 3); // current (animated) color
    const origCol = new Float32Array(N * 3); // base color to return to
    const hx      = new Float32Array(N);
    const hy      = new Float32Array(N);
    const polR    = new Float32Array(N);
    const polT    = new Float32Array(N);
    const vx      = new Float32Array(N);
    const vy      = new Float32Array(N);
    const colorT  = new Float32Array(N); // 0=base color, 1=green (#25DD00)
    const zone    = new Uint8Array(N);   // 0=iris 1=pupil 2=sclera 3=eyelid

    // #25DD00 normalised
    const GR = 37  / 255; // 0.145
    const GG = 221 / 255; // 0.867
    const GB = 0;

    function fill() {
      const d = dims();
      let i = 0;

      // Iris — rich purple, gradient light-center → dark-edge
      for (let k = 0; k < NI; k++, i++) {
        const [x, y] = randCircle(d.ir);
        const r      = Math.sqrt(x * x + y * y);
        polR[i] = r;
        polT[i] = Math.atan2(y, x);
        hx[i]   = x;
        hy[i]   = y;
        zone[i] = 0;
        const t  = r / d.ir;
        origCol[i*3]   = clamp(0.486*(1-t) + 0.200*t + rand(0.055));
        origCol[i*3+1] = clamp(0.322*(1-t) + 0.094*t + rand(0.030));
        origCol[i*3+2] = clamp(0.980*(1-t) + 0.784*t + rand(0.060));
        pos[i*3]   = x + spread(FW * 0.9);
        pos[i*3+1] = y + spread(FH * 0.9);
        pos[i*3+2] = 0.1;
      }

      // Pupil — near-black
      for (let k = 0; k < NP; k++, i++) {
        const [x, y] = randCircle(d.pr);
        polR[i] = Math.sqrt(x * x + y * y);
        polT[i] = Math.atan2(y, x);
        hx[i]   = x;
        hy[i]   = y;
        zone[i] = 1;
        const v  = 0.018 + Math.random() * 0.028;
        origCol[i*3] = origCol[i*3+1] = origCol[i*3+2] = v;
        pos[i*3]   = x + spread(FW * 0.5);
        pos[i*3+1] = y + spread(FH * 0.5);
        pos[i*3+2] = 0.2;
      }

      // Sclera — mid-gray, clearly visible on white background
      for (let k = 0; k < NS; k++, i++) {
        const [x, y] = randSclera(d.ew, d.eh, d.ir * 1.03);
        hx[i]   = x;
        hy[i]   = y;
        zone[i] = 2;
        const v  = 0.62 + Math.random() * 0.10;
        origCol[i*3]   = v - 0.02;
        origCol[i*3+1] = v - 0.03;
        origCol[i*3+2] = v + 0.06; // faint blue tint
        pos[i*3]   = x + spread(FW * 0.3);
        pos[i*3+1] = y + spread(FH * 0.3);
        pos[i*3+2] = 0;
      }

      // Eyelid — dark charcoal
      for (let k = 0; k < NE; k++, i++) {
        const upper  = k < NE / 2;
        const [x, y] = elidPt(Math.random(), d.ew, d.eh, upper);
        hx[i]   = x;
        hy[i]   = y;
        zone[i] = 3;
        const v  = 0.06 + Math.random() * 0.07;
        origCol[i*3] = origCol[i*3+1] = origCol[i*3+2] = v;
        pos[i*3]   = x;
        pos[i*3+1] = y + (upper ? 1 : -1) * FH * (0.1 + Math.random() * 0.25);
        pos[i*3+2] = 0.5;
      }

      // Initialise current color = original
      col.set(origCol);
      colorT.fill(0);
    }

    fill();

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

    // With an orthographic camera, Three.js skips perspective size-attenuation
    // (isPerspectiveMatrix → false), leaving gl_PointSize = material.size in raw
    // physical pixels. Convert world-unit size (0.059 frustum units) to px manually.
    const PSIZ = 0.059; // desired size in frustum units
    function particlePx() { return PSIZ * (H * dpr / FH); }

    const mat = new THREE.PointsMaterial({
      size:            particlePx(),
      map:             makeSprite(),
      vertexColors:    true,
      transparent:     true,
      alphaTest:       0.001,
      depthWrite:      false,
      sizeAttenuation: false, // we supply physical-px size directly
    });

    scene.add(new THREE.Points(geo, mat));

    // ── State ────────────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    let hovered   = false;
    let irisRot   = 0;
    let dilation  = 1;
    let targetDil = 1;

    // ── Events ───────────────────────────────────────────────────────────
    hero.addEventListener('mousemove', (e) => {
      const r = hero.getBoundingClientRect();
      mouse.x =  ((e.clientX - r.left) / r.width  - 0.5) * FW;
      mouse.y = -((e.clientY - r.top)  / r.height - 0.5) * FH;
    });
    hero.addEventListener('mouseenter', () => { hovered = true;  targetDil = 2.1; });
    hero.addEventListener('mouseleave', () => {
      hovered   = false;
      targetDil = 1;
      mouse.x   = 0;
      mouse.y   = 0;
    });

    window.addEventListener('resize', () => {
      W  = window.innerWidth;
      H  = window.innerHeight;
      FW = FH * (W / H);
      renderer.setSize(W, H, false);
      camera.left  = -FW / 2;
      camera.right =  FW / 2;
      camera.updateProjectionMatrix();
      mat.size = particlePx();
      fill();
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate    = true;
    });

    // ── Animation loop ───────────────────────────────────────────────────
    const STIFF      = 0.034;
    const DAMP       = 0.82;
    const REP_R      = 1.7;
    const REP_F      = 0.30;
    const COLOR_UP   = 0.18;  // speed toward green when repelled
    const COLOR_DOWN = 0.045; // speed back to original

    function tick() {
      requestAnimationFrame(tick);

      irisRot  += hovered ? 0.009 : 0.0022;
      dilation += (targetDil - dilation) * 0.055;

      const mX = mouse.x;
      const mY = mouse.y;
      let colorDirty = false;

      for (let i = 0; i < N; i++) {
        const z = zone[i];
        let thx, thy;

        if (z === 0) {
          const a = polT[i] + irisRot;
          thx = polR[i] * Math.cos(a);
          thy = polR[i] * Math.sin(a);
        } else if (z === 1) {
          const a = polT[i];
          const r = polR[i] * dilation;
          thx = r * Math.cos(a);
          thy = r * Math.sin(a);
        } else {
          thx = hx[i];
          thy = hy[i];
        }

        // Spring
        vx[i] = (vx[i] + (thx - pos[i*3])   * STIFF) * DAMP;
        vy[i] = (vy[i] + (thy - pos[i*3+1]) * STIFF) * DAMP;

        // Mouse repulsion + color activation
        const dx = pos[i*3]   - mX;
        const dy = pos[i*3+1] - mY;
        const d2 = dx*dx + dy*dy;
        let repelled = false;

        if (d2 < REP_R * REP_R && d2 > 1e-4) {
          const d = Math.sqrt(d2);
          const f = (REP_R - d) / REP_R * REP_F;
          vx[i] += (dx / d) * f;
          vy[i] += (dy / d) * f;
          repelled = true;
        }

        pos[i*3]   += vx[i];
        pos[i*3+1] += vy[i];

        // Color blend toward #25DD00 when repelled, back when not
        const prevT = colorT[i];
        colorT[i] = repelled
          ? Math.min(1, colorT[i] + COLOR_UP)
          : Math.max(0, colorT[i] - COLOR_DOWN);

        if (colorT[i] !== prevT) {
          const t = colorT[i];
          col[i*3]   = origCol[i*3]   * (1-t) + GR * t;
          col[i*3+1] = origCol[i*3+1] * (1-t) + GG * t;
          col[i*3+2] = origCol[i*3+2] * (1-t) + GB * t;
          colorDirty = true;
        }
      }

      geo.attributes.position.needsUpdate = true;
      if (colorDirty) geo.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    }

    tick();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEye);
  } else {
    initEye();
  }
})();
