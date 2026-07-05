// App 3 · Visor de planos 3D — "PLAN AS PER CIVIL DATA"
// Referencias: fotos 233733/233754/233903/234221/234234 + BIBLIA-VISUAL §2.B.
// El silo wireframe rota lento y la cámara transiciona entre 3 vistas;
// callouts DOM con línea guía + telemetría + ventana de código.

import * as THREE from '../../vendor/three/three.module.min.js';
import { buildSilo, VIEWS } from '../silo-model.js';

const TELEMETRY =
  `BUFFER: <b>6192 KB</b>` +
  `<span>PWR ON CT: <b>554</b></span>` +
  `<span>PWR ON HRS: <b>1103</b></span>` +
  `<span>CYCLES: <b>889</b></span>` +
  `<span>TEMP: <b>96.7°F</b></span>` +
  `<span>SERIAL: <b>012.X3</b></span>`;

const CODE_LINES = [
  'plan.load(civil_data)  // sect 1-20',
  'render --wireframe --lod 2',
  'span> level[14].integrity = 0.97',
  'tunnel::seal(SBM-AIP) ok',
  'dome.spec = "7.1"',
];

export default {
  id: 'blueprint',
  name: 'BLUEPRINT',
  scheme: 'green',
  duration: 34000,
  mount(host) {
    host.innerHTML = `
      <div class="bp">
        <div class="titlebar"><span>PLAN AS PER CIVIL DATA</span><span class="bp-page">3 / 20</span></div>
        <div class="telemetry">${TELEMETRY}</div>
        <div class="bp-stage">
          <div class="bp-view"></div>
          <div class="bp-toolbar">
            ${['▸','■','□','◇','▤','⊕','⤢'].map(s => `<span>${s}</span>`).join('')}
          </div>
          <div class="bp-callout bp-callout-a">
            <div class="line"></div>
            <div class="box">
              <div class="k">SECTION - 8</div>
              <div>PROPERTIES</div>
              <div class="dim">II - 367 - 010273</div>
            </div>
          </div>
          <div class="bp-callout bp-callout-b">
            <div class="line"></div>
            <div class="box amber">
              <div class="k">CLASSIFIED</div>
              <div>LEVEL 8 DOCUMENT</div>
              <div class="dim">TUNNEL PROPERTIES</div>
            </div>
          </div>
          <div class="bp-code"><pre></pre></div>
          <div class="bp-viewlabel"></div>
        </div>
        <div class="statusline"><span class="bp-run">RUN</span> · LOADING CIVIL DATA …</div>
      </div>`;

    const viewEl = host.querySelector('.bp-view');
    const pre = host.querySelector('pre');
    const viewLabel = host.querySelector('.bp-viewlabel');

    // --- Three.js ---
    const ink = getComputedStyle(host).getPropertyValue('--ink').trim();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.domElement.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;filter:drop-shadow(0 0 5px rgba(var(--glow),.5))';
    viewEl.appendChild(renderer.domElement);

    const silo = buildSilo(ink);
    scene.add(silo);

    // estado de cámara interpolado entre vistas
    let viewIdx = 0;
    const cam = {
      pos: new THREE.Vector3(...VIEWS[0].pos),
      target: new THREE.Vector3(...VIEWS[0].target),
    };
    const want = {
      pos: cam.pos.clone(),
      target: cam.target.clone(),
    };
    function applyView(i) {
      viewIdx = i;
      want.pos.set(...VIEWS[i].pos);
      want.target.set(...VIEWS[i].target);
      host.querySelector('.bp-page').textContent = `${i + 3} / 20`;
      viewLabel.textContent = VIEWS[i].label;
    }
    applyView(0);

    const resize = () => {
      const w = viewEl.clientWidth, h = viewEl.clientHeight;
      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', resize);
    resize();

    let raf = 0;
    let last = performance.now();
    const loop = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      silo.rotation.y += 0.12 * dt;                 // rotación lenta continua
      cam.pos.lerp(want.pos, 1 - Math.pow(0.02, dt));   // easing suave
      cam.target.lerp(want.target, 1 - Math.pow(0.02, dt));
      camera.position.copy(cam.pos);
      camera.lookAt(cam.target);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    // --- código que se escribe + ciclo de vistas ---
    const timers = [];
    CODE_LINES.forEach((l, i) =>
      timers.push(setTimeout(() => { pre.textContent += l + '\n'; }, 600 + i * 700)));

    // cambia de vista cada ~11s (la app dura 34s → recorre las 3)
    timers.push(setInterval(() => applyView((viewIdx + 1) % VIEWS.length), 11000));

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(t => { clearTimeout(t); clearInterval(t); });
      window.removeEventListener('resize', resize);
      silo.userData.dispose();
      renderer.dispose();
      renderer.forceContextLoss?.();
    };
  },
};
