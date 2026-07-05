// SILO-OS · paso 1: efectos CRT + panel (tecla F).
// Estado = atributos data-fx-* en <html>; el CSS hace el resto.
// Se persiste en localStorage para que tu configuración sobreviva recargas.

import { getTheme, toggleTheme, initTheme } from './theme.js';

const FX = [
  ['scan',     'SCANLINES'],
  ['glow',     'PHOSPHOR GLOW'],
  ['rollbar',  'INTERFERENCE BAR'],
  ['flicker',  'FLICKER'],
  ['grain',    'GRAIN'],
  ['vignette', 'VIGNETTE'],
];
const STORE_KEY = 'silo-os.fx';
const root = document.documentElement;

function load() {
  try { return JSON.parse(localStorage.getItem(STORE_KEY)) ?? {}; }
  catch { return {}; }
}
function save(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

const state = load();
for (const [key] of FX) {
  state[key] ??= true;                       // todo encendido por defecto
  root.dataset['fx' + cap(key)] = state[key] ? 'on' : 'off';
}

function cap(s) { return s[0].toUpperCase() + s.slice(1); }

function toggle(key) {
  state[key] = !state[key];
  root.dataset['fx' + cap(key)] = state[key] ? 'on' : 'off';
  save(state);
  renderList();
}

/* ---------- DOM: capas + panel ---------- */

function buildOverlay() {
  const crt = document.createElement('div');
  crt.id = 'crt';
  crt.setAttribute('aria-hidden', 'true');
  crt.innerHTML = `
    <div class="fx fx-scanlines"></div>
    <div class="fx fx-grain"></div>
    <div class="fx fx-rollbar"></div>
    <div class="fx fx-vignette"></div>`;
  document.body.appendChild(crt);
}

let panel, list;

function buildPanel() {
  panel = document.createElement('div');
  panel.id = 'fx-panel';
  // data-scheme para que el panel tome colores de los tokens vigentes
  panel.dataset.scheme = 'green';
  panel.innerHTML = `
    <div class="fxp-title"><span>VISUAL FX</span><button data-close aria-label="cerrar">X</button></div>
    <ul></ul>
    <div class="fxp-hint">F: OPEN/CLOSE · CLICK: TOGGLE</div>`;
  list = panel.querySelector('ul');
  panel.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if ('close' in btn.dataset) return panel.classList.remove('open');
    if ('theme' in btn.dataset) return toggleTheme();
    if (btn.dataset.fx) toggle(btn.dataset.fx);
  });
  document.addEventListener('silo:theme', renderList);
  document.body.appendChild(panel);

  const opener = document.createElement('button');
  opener.id = 'fx-open';
  opener.textContent = 'FX';
  opener.addEventListener('click', () => panel.classList.toggle('open'));
  document.body.appendChild(opener);

  renderList();
}

function renderList() {
  list.innerHTML = `
    <li><button data-theme-toggle data-theme>
      <span>TECH</span>
      <span class="state">[${getTheme().toUpperCase()}]</span>
    </button></li>` + FX.map(([key, label]) => `
    <li><button data-fx="${key}">
      <span>${label}</span>
      <span class="state">[${state[key] ? 'ON' : 'OFF'}]</span>
    </button></li>`).join('');
}

export function initFx() {
  initTheme();
  buildOverlay();
  buildPanel();
  window.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') panel.classList.toggle('open');
  });
}

/* ---------- autotest (?fxtest) ----------
   Verificación real en navegador: alterna cada efecto y comprueba que
   (a) el atributo cambió y (b) la capa CSS respondió (display o animación). */
export function runSelfTest() {
  const results = [];
  const crt = document.getElementById('crt');
  const layerFor = {
    scan: '.fx-scanlines', rollbar: '.fx-rollbar',
    grain: '.fx-grain', vignette: '.fx-vignette',
  };
  for (const [key] of FX) {
    const before = state[key];
    toggle(key);
    const attr = root.dataset['fx' + cap(key)];
    let cssResponds = true;
    if (layerFor[key]) {
      const el = crt.querySelector(layerFor[key]);
      const disp = getComputedStyle(el).display;
      cssResponds = state[key] ? disp !== 'none' : disp === 'none';
    } else {
      const target = document.getElementById('screen');
      const cs = getComputedStyle(target);
      cssResponds = key === 'glow'
        ? (state[key] ? cs.textShadow !== 'none' : cs.textShadow === 'none')
        // comprobar la animación PROPIA del flicker (el shell puede tener
        // su animación de corte en el mismo elemento)
        : (state[key]
            ? cs.animationName.includes('crt-flicker')
            : !cs.animationName.includes('crt-flicker'));
    }
    const ok = (attr === (state[key] ? 'on' : 'off')) && cssResponds;
    results.push(`${key}:${ok ? 'PASS' : 'FAIL'}`);
    if (state[key] !== before) toggle(key); // restaurar
  }
  // tema: al alternar RETRO↔VAULT debe cambiar el color de fondo tokenizado
  const probe = document.querySelector('[data-scheme]');
  const bgBefore = getComputedStyle(probe).backgroundColor;
  toggleTheme();
  const bgAfter = getComputedStyle(probe).backgroundColor;
  toggleTheme(); // restaurar
  results.push(`theme:${bgBefore !== bgAfter ? 'PASS' : 'FAIL'}`);

  const summary = `FXTEST ${results.every(r => r.endsWith('PASS')) ? 'PASS' : 'FAIL'} · ${results.join(' ')}`;
  document.title = summary;
  return summary;
}
