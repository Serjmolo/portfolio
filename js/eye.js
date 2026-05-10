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
      g.addColorStop(1,    'rgba(228,228,228,0)');
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
    const colorBias = new Float32Array(N * 3); // per-particle additive offset from base
    const dimStore  = new Float32Array(N).fill(1); // per-particle dim factor (pupil)

    // #25DD00 normalised
    const GR = 37  / 255;
    const GG = 221 / 255;
    const GB = 0;

    // #F4F3ED normalised — warm off-white base for all eye particles
    const CR = 244 / 255;
    const CG = 243 / 255;
    const CB = 237 / 255;

    // #292929 normalised — dark theme base
    const DR = 41 / 255;
    const DG = 41 / 255;
    const DB = 41 / 255;

    function baseColor() {
      return document.documentElement.getAttribute('data-theme') === 'dark'
        ? [DR, DG, DB] : [CR, CG, CB];
    }

    function fill() {
      const d = dims();
      const [br, bg, bb] = baseColor();
      let i = 0;

      // Iris — base color, slight center-bright gradient
      for (let k = 0; k < NI; k++, i++) {
        const [x, y] = randCircle(d.ir);
        const r      = Math.sqrt(x * x + y * y);
        polR[i] = r;
        polT[i] = Math.atan2(y, x);
        hx[i]   = x;
        hy[i]   = y;
        zone[i] = 0;
        const t  = r / d.ir;
        const bR = -t*0.06 + rand(0.018);
        const bG = -t*0.06 + rand(0.018);
        const bB = -t*0.06 + rand(0.018);
        colorBias[i*3]   = bR;
        colorBias[i*3+1] = bG;
        colorBias[i*3+2] = bB;
        origCol[i*3]   = clamp(br + bR);
        origCol[i*3+1] = clamp(bg + bG);
        origCol[i*3+2] = clamp(bb + bB);
        pos[i*3]   = x + spread(FW * 0.9);
        pos[i*3+1] = y + spread(FH * 0.9);
        pos[i*3+2] = 0.1;
      }

      // Pupil — slightly dimmer
      for (let k = 0; k < NP; k++, i++) {
        const [x, y] = randCircle(d.pr);
        polR[i] = Math.sqrt(x * x + y * y);
        polT[i] = Math.atan2(y, x);
        hx[i]   = x;
        hy[i]   = y;
        zone[i] = 1;
        const dim   = 0.88 + Math.random() * 0.04;
        dimStore[i] = dim;
        colorBias[i*3] = colorBias[i*3+1] = colorBias[i*3+2] = 0;
        origCol[i*3]   = br * dim;
        origCol[i*3+1] = bg * dim;
        origCol[i*3+2] = bb * dim;
        pos[i*3]   = x + spread(FW * 0.5);
        pos[i*3+1] = y + spread(FH * 0.5);
        pos[i*3+2] = 0.2;
      }

      // Sclera — base color
      for (let k = 0; k < NS; k++, i++) {
        const [x, y] = randSclera(d.ew, d.eh, d.ir * 1.03);
        hx[i]   = x;
        hy[i]   = y;
        zone[i] = 2;
        const bR = rand(0.015);
        const bG = rand(0.015);
        const bB = rand(0.015);
        colorBias[i*3]   = bR;
        colorBias[i*3+1] = bG;
        colorBias[i*3+2] = bB;
        origCol[i*3]   = clamp(br + bR);
        origCol[i*3+1] = clamp(bg + bG);
        origCol[i*3+2] = clamp(bb + bB);
        pos[i*3]   = x + spread(FW * 0.3);
        pos[i*3+1] = y + spread(FH * 0.3);
        pos[i*3+2] = 0;
      }

      // Eyelid — base color
      for (let k = 0; k < NE; k++, i++) {
        const upper  = k < NE / 2;
        const [x, y] = elidPt(Math.random(), d.ew, d.eh, upper);
        hx[i]   = x;
        hy[i]   = y;
        zone[i] = 3;
        colorBias[i*3] = colorBias[i*3+1] = colorBias[i*3+2] = 0;
        origCol[i*3]   = br;
        origCol[i*3+1] = bg;
        origCol[i*3+2] = bb;
        pos[i*3]   = x;
        pos[i*3+1] = y + (upper ? 1 : -1) * FH * (0.1 + Math.random() * 0.25);
        pos[i*3+2] = 0.5;
      }

      // Initialise current color = original
      col.set(origCol);
      colorT.fill(0);
    }

    function recolor() {
      const [br, bg, bb] = baseColor();
      for (let i = 0; i < N; i++) {
        if (zone[i] === 1) {
          const dim = dimStore[i];
          origCol[i*3]   = br * dim;
          origCol[i*3+1] = bg * dim;
          origCol[i*3+2] = bb * dim;
        } else {
          origCol[i*3]   = clamp(br + colorBias[i*3]);
          origCol[i*3+1] = clamp(bg + colorBias[i*3+1]);
          origCol[i*3+2] = clamp(bb + colorBias[i*3+2]);
        }
        const t = colorT[i];
        col[i*3]   = origCol[i*3]   * (1-t) + GR * t;
        col[i*3+1] = origCol[i*3+1] * (1-t) + GG * t;
        col[i*3+2] = origCol[i*3+2] * (1-t) + GB * t;
      }
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

    new MutationObserver(() => {
      recolor();
      geo.attributes.color.needsUpdate = true;
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // ── State ────────────────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    let hovered   = false;
    let irisRot   = 0;
    let dilation  = 1;
    let targetDil = 1;
    let time      = 0;

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
      time     += 0.025;
      const pulse = 1 + 0.035 * Math.sin(time * 1.1);

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
        } else if (z === 2) {
          thx = hx[i];
          thy = hy[i];
        } else {
          thx = hx[i] * pulse;
          thy = hy[i] * pulse;
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
