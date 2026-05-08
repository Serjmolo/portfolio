---
name: Portfolio site — Three.js setup and eye animation
description: Three.js vendored locally (v0.160.0 UMD). eye.js has known dimension and ordering bugs fixed 2026-05-08.
type: project
---

Three.js (and any external CDN script) is blocked by Chrome's Opaque Response Blocking (ORB) when the page is opened as a `file://` URL. This caused `window.THREE` to be undefined, silently aborting `initEye()` in `js/eye.js`.

Fix applied: downloaded `three@0.160.0/build/three.min.js` locally to `js/three.min.js` and updated the `<script>` tag in `index.html` to use `src="js/three.min.js"`.

**Why:** Three.js v0.168.0 (the originally referenced version) does not ship `three.min.js` (the UMD/global build) — it was removed after r160. Only `three.module.min.js` (ES module) is available at that version. v0.160.0 is the last version with the UMD global build.

**How to apply:** If any other CDN scripts are added, they must also be vendored locally to `js/` to work on `file://`. If the site is eventually served via a local dev server or deployed to GitHub Pages, CDN links will work again.

---

## Eye animation — bugs fixed 2026-05-08

### 1. Silent WebGL failure
`new THREE.WebGLRenderer()` was wrapped in `try { } catch (e) { return; }` with no logging. Any WebGL error (hardware accel disabled, sandboxed environment, driver issue) killed the animation silently. Fixed by adding `console.error('[eye.js] WebGL context creation failed:', e)` inside the catch so the real error surfaces in DevTools.

### 2. Degenerate canvas dimensions
`hero.offsetWidth/offsetHeight` were used but `offsetWidth/Height` can be 0 if queried before the browser has completed layout (rare but possible on slow paints or unusual environments). Changed to `hero.clientWidth/clientHeight` (more reliable for element content area) with the same `|| window.innerWidth/innerHeight` fallback, plus a second guard: `if (!W || !H) { W = window.innerWidth; H = window.innerHeight; }`. This prevents `FW = NaN/Infinity` which makes the OrthographicCamera frustum degenerate.

### 3. Canvas pixel buffer not pre-sized
`new THREE.WebGLRenderer({ canvas })` was called before `renderer.setSize()`, meaning the WebGL context was created on a 300×150 default canvas buffer. Fixed by setting `canvas.width = Math.round(W * dpr)` and `canvas.height = Math.round(H * dpr)` before passing the canvas to the renderer constructor.

### 4. setPixelRatio / setSize ordering
`renderer.setSize(W, H)` was called before `renderer.setPixelRatio(dpr)`. THREE.js uses the stored pixelRatio inside setSize to compute the canvas buffer dimensions. With the wrong order the canvas was sized at 1× then resized again at dpr×. Fixed by calling `setPixelRatio(dpr)` first, then `setSize(W, H)`.

**How to apply:** Any future WebGL/GPU-dependent initialization in this project should: (1) guard dimensions, (2) pre-size canvas, (3) wrap constructor in logged try/catch, (4) call setPixelRatio before setSize.
