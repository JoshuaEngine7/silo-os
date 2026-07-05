// App 1 · BOOT — "LOADING UPPER LEVELS / LEVELS 1-20"
// Referencia: foto 20260606_233825 + BIBLIA-VISUAL §2.A
// Comportamiento: el log de código se escribe línea a línea, la barra
// segmentada se llena durante la duración de la app y el contador tictaquea.

// mezcla de C plausible + líneas de acceso, como en la foto
const LOG_LINES = [
  'Secure access code 11  consul-Pro -',
  '-bash: dxdiag',
  '#define __thiscall __cdecl  // running algorithm in C mode',
  'char __cdecl sub_1D300() {',
  '  void __running scripts DriveInServer data disconnecting scripts',
  '  (PRIMER_OBJECT drivend byte);',
  '}',
  'mount /lvl/upper --sect 1-20 --auth s0011',
  '14 33 18:31  dhe 14 [s0090a] 151.27.53.01  --  successful',
  '14 33 18:33  dhe 16 [s0011?] 143.23.53.01  --  successful',
  'watchdog: run 11 704 1',
  'LOADING UPPER LEVELS ...',
];

const SEGMENTS = 14;

export default {
  id: 'boot',
  name: 'BOOT',
  scheme: 'green',
  duration: 12000,
  mount(host) {
    host.innerHTML = `
      <div class="boot">
        <div class="boot-log"><pre></pre></div>
        <div class="boot-progress">
          <div class="seg-bar">${'<span></span>'.repeat(SEGMENTS)}</div>
          <div class="boot-progress-row">
            <div class="boot-loading">LOADING UPPER LEVELS <span class="dots">...</span></div>
            <div class="boot-counter">4 - 93 : 6012 | F</div>
          </div>
        </div>
        <div class="boot-levels">LEVELS 1 - 20</div>
      </div>`;

    const pre = host.querySelector('pre');
    const segs = [...host.querySelectorAll('.seg-bar span')];
    const counter = host.querySelector('.boot-counter');

    // log línea a línea
    let line = 0;
    const logTimer = setInterval(() => {
      if (line >= LOG_LINES.length) return clearInterval(logTimer);
      const text = LOG_LINES[line++];
      const cls = text.includes('successful') ? ' class="ok"' : '';
      pre.innerHTML += `<span${cls}>${text}</span>\n`;
    }, 620);

    // barra segmentada: llena ~todo el ciclo; el segmento activo brilla
    const fillEvery = this.duration / (SEGMENTS + 2);
    let filled = 0;
    const barTimer = setInterval(() => {
      if (filled >= SEGMENTS) return clearInterval(barTimer);
      segs.forEach((s, i) => {
        s.classList.toggle('fill', i < filled);
        s.classList.toggle('hot', i === filled);
      });
      filled++;
    }, fillEvery);

    // contador que tictaquea
    const cntTimer = setInterval(() => {
      const n = 6000 + Math.floor(Math.random() * 120);
      counter.textContent = `4 - 93 : ${n} | F`;
    }, 900);

    return () => { clearInterval(logTimer); clearInterval(barTimer); clearInterval(cntTimer); };
  },
};
