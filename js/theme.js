// SILO-OS · paso 2: tecnología RETRO (fósforo departamental) vs
// VAULT (azul moderno de la bóveda/Judicial). Tecla T alterna.
// El tema vive en <html data-theme>; los esquemas por app en data-scheme.

const STORE_KEY = 'silo-os.theme';
const root = document.documentElement;

export function getTheme() {
  return root.dataset.theme === 'vault' ? 'vault' : 'retro';
}

export function setTheme(theme) {
  root.dataset.theme = theme === 'vault' ? 'vault' : 'retro';
  localStorage.setItem(STORE_KEY, root.dataset.theme);
  document.dispatchEvent(new CustomEvent('silo:theme', { detail: getTheme() }));
}

export function toggleTheme() {
  setTheme(getTheme() === 'retro' ? 'vault' : 'retro');
}

export function initTheme() {
  // prioridad: ?theme=... (para captura/demo) > guardado > el del HTML
  const forced = new URLSearchParams(location.search).get('theme');
  if (forced === 'vault' || forced === 'retro') {
    root.dataset.theme = forced;
  } else {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved) root.dataset.theme = saved;
  }
  window.addEventListener('keydown', (e) => {
    if (e.key === 't' || e.key === 'T') toggleTheme();
  });
}
