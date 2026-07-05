// SILO-OS · paso 3: shell + attract mode.
// Máquina de estados: monta una "app" a la vez en #screen y avanza sola
// (attract loop). Teclas: 1-4 saltan a la app, ESPACIO pausa/reanuda.

const screen = document.getElementById('screen');

let apps = [];            // [{ id, name, scheme, duration, mount, unmount? }]
let current = -1;
let timer = null;
let paused = false;
let cleanup = null;       // función de limpieza que devuelve mount()

function clearTimer() {
  if (timer) { clearTimeout(timer); timer = null; }
}

function scheduleNext() {
  clearTimer();
  if (paused) return;
  timer = setTimeout(() => go((current + 1) % apps.length), apps[current].duration);
}

async function go(index) {
  clearTimer();
  if (typeof cleanup === 'function') { cleanup(); cleanup = null; }

  current = index;
  const app = apps[current];

  // corte seco con micro-flicker, como los cambios de pantalla de la serie
  screen.classList.add('cut');
  screen.innerHTML = '';

  const host = document.createElement('section');
  host.className = 'app';
  host.dataset.scheme = app.scheme;
  host.dataset.app = app.id;
  screen.appendChild(host);

  cleanup = await app.mount(host) ?? null;

  // timeout y no rAF: en headless (captura de video) rAF puede no disparar
  setTimeout(() => screen.classList.remove('cut'), 150);
  updateHud();
  scheduleNext();
}

function togglePause() {
  paused = !paused;
  if (paused) clearTimer(); else scheduleNext();
  updateHud();
}

/* HUD mínimo: qué app corre y si el ciclo está en AUTO o HOLD */
let hud;
function buildHud() {
  hud = document.createElement('div');
  hud.id = 'shell-hud';
  hud.dataset.scheme = 'green';
  document.body.appendChild(hud);
}
function updateHud() {
  const app = apps[current];
  hud.textContent = `${current + 1}/${apps.length} ${app.name} · ${paused ? 'HOLD' : 'AUTO'}`;
}

export function initShell(appList) {
  apps = appList;
  buildHud();

  window.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= String(apps.length)) {
      go(Number(e.key) - 1);
    } else if (e.key === ' ') {
      e.preventDefault();
      togglePause();
    }
  });

  // ?app=<id> arranca en esa app; &hold congela el ciclo (dev y captura)
  const params = new URLSearchParams(location.search);
  const startAt = Math.max(0, apps.findIndex(a => a.id === params.get('app')));
  if (params.has('hold')) paused = true;

  go(startAt);

  // API para pruebas y para la captura de video (paso 9)
  return {
    go,
    togglePause,
    get current() { return apps[current]?.id; },
    get paused() { return paused; },
  };
}

/* ---------- autotest (?shelltest) ----------
   Monta cada app por teclado simulado y verifica que el DOM cambió. */
export async function runShellTest(shell) {
  const results = [];
  for (let i = 0; i < apps.length; i++) {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: String(i + 1) }));
    await new Promise(r => setTimeout(r, 120));
    const mounted = screen.querySelector(`[data-app="${apps[i].id}"]`);
    results.push(`${apps[i].id}:${mounted ? 'PASS' : 'FAIL'}`);
  }
  const wasPaused = shell.paused;
  window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
  await new Promise(r => setTimeout(r, 50));
  results.push(`pause:${shell.paused !== wasPaused ? 'PASS' : 'FAIL'}`);
  window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' })); // restaurar

  const summary = `SHELLTEST ${results.every(r => r.endsWith('PASS')) ? 'PASS' : 'FAIL'} · ${results.join(' ')}`;
  document.title = summary;
  return summary;
}
