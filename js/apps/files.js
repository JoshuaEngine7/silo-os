// App 2 · Escáner de disco + navegador de archivos
// Referencias: fotos 233315/233343/233351 (CONNECT DEVICE → SCANNING → log)
// y 234827 (grid 3 columnas). Textos del corpus: BIBLIA-VISUAL §2.C-D.

const FILES = [
  ['SIL-UNIT-LIST',        '23.7MB',  'NOV 01, SILO YEAR 96'],
  ['DUTY_ALLOCATIONS',     '10.7MB',  'NOV 01, SILO YEAR 96'],
  ['SIL-ALLOCATIONS2',     '1.6MB',   'NOV 01, SILO YEAR 96'],
  ['CONSTRUCTION_REP1',    '1.5MB',   'NOV 01, SILO YEAR 96'],
  ['BUDGET_REP1',          '1.1MB',   'NOV 01, SILO YEAR 96'],
  ['SIL-ASSESSMENT',       '1.6MB',   'NOV 01, SILO YEAR 96'],
  ['SIL-REQUESTS',         '976KB',   'OCT 18, SILO YEAR 96'],
  ['SIL-IMPLEMENTATION',   '2.9MB',   'OCT 25, SILO YEAR 96'],
  ['SILO-CONT',            '1.8MB',   'OCT 25, SILO YEAR 96'],
  ['SILO-PROPOSAL_2',      '65.7MB',  'OCT 19, SILO YEAR 96'],
  ['SILO-DEVELOPMENT',     '3.2MB',   'OCT 19, SILO YEAR 96'],
  ['SIL-05-UPDATE',        '56KB',    'OCT 19, SILO YEAR 96'],
  ['HD_DIAGNOSTIC',        '4.6MB',   'OCT 12, SILO YEAR 96'],
  ['HD_REPAIR',            '544.7MB', 'OCT 12, SILO YEAR 96'],
  ['SIL-UTILITIES',        '85.5MB',  'OCT 12, SILO YEAR 96'],
  ['SIL-XPRTS',            '5.2MB',   'OCT 12, SILO YEAR 96'],
  ['SILO-BLUEPRINT',       '5.2MB',   'OCT 12, SILO YEAR 96'],
  ['SIL-05RECOVERY',       '7.5MB',   'OCT 06, SILO YEAR 96'],
  ['HARDWARE_DIAGNOSTIC',  '76KB',    'OCT 06, SILO YEAR 96'],
  ['HARDWARE_REPAIR',      '966KB',   'OCT 06, SILO YEAR 96'],
  ['SIL-05REBOOT',         '575.6MB', 'OCT 06, SILO YEAR 96'],
  ['FIELD_SERVICE',        '23KB',    'OCT 01, SILO YEAR 96'],
  ['FS_DIAGNOSTIC',        '23.7MB',  'OCT 01, SILO YEAR 96'],
  ['FS_REPAIR',            '1.7MB',   'OCT 01, SILO YEAR 96'],
  ['OPERATIONS LOG 65/69', '3.5MB',   'SEP 30, SILO YEAR 96'],
  ['OPERATIONS LOG 70/74', '395KB',   'OCT 01, SILO YEAR 96'],
  ['BASE_SYSTEM VOL_02',   '5.5MB',   'OCT 01, SILO YEAR 96'],
  ['SIL-PROPOSAL_DRAFT',   '68.3MB',  'SEP 30, SILO YEAR 96'],
  ['SIL-PROPOSAL_1',       '54.9MB',  'SEP 30, SILO YEAR 96'],
  ['PROJECT_DRAFT',        '2.5MB',   'SEP 30, SILO YEAR 96'],
  ['JANE CARMODY CLEANING','837.8MB', 'SEP 13, SILO YEAR 97'],
  ['STAIRWELL-REPAIRS',    '5.8MB',   'SEP 14, SILO YEAR 97'],
  ['GLASSHOUSE CLEANING',  '5.6MB',   'JUL 26, SILO YEAR 97'],
];

const SCAN_LOG = [
  ['0001', 'HARDDISK/CONNECTED', true],
  ['0002', 'HD_SCANNING: + NO VIRUS FOUND', true],
  ['0003', 'HD NAME = 18, CAPACITY = 79%', false],
  ['0004', 'COMMAND:', false],
];

// icono de disquete como SVG inline (usa currentColor → tokens)
const FLOPPY = `
  <svg class="icon" viewBox="0 0 22 26" fill="none" stroke="currentColor" stroke-width="1.4">
    <rect x="1" y="1" width="20" height="24"/>
    <rect x="6" y="1" width="10" height="8"/>
    <rect x="5" y="14" width="12" height="9"/>
  </svg>`;
const DISK = `
  <svg class="disk" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.3">
    <rect x="1" y="1" width="24" height="24"/>
    <circle cx="13" cy="13" r="7"/>
    <circle cx="13" cy="13" r="2"/>
  </svg>`;

const TABS =
  `<span>DEVICES: <b>P545.10.90T02</b></span>
   <span>SERIAL#: <b>UNREADABLE</b></span>
   <span>INTERFACE: <b>SCR 414</b></span>
   <span>TRANS MODE: <b>S414/7000</b></span>
   <span>STANDARD: <b>414/414P1-9</b></span>
   <span>LTD. D</span>`;

function footer(items) {
  return `
    <div class="files-search"><span class="x">X</span><span>SEARCH:</span></div>
    <div class="files-foot">
      ${DISK}
      <div class="cell">DEVICE NAME: <b>18</b></div>
      <div class="cell">TYPE: <b>DATA</b></div>
      <div class="cell">READ: <b>YES</b></div>
      <div class="cell">WRITE: <b>YES</b></div>
      <div class="cell grow">CAPACITY: <span class="capbar"><i></i></span> <b>79%</b></div>
      <div class="cell">SIZE: <b>---</b></div>
      <div class="cell">ITEMS: <b>${items}</b></div>
      <div class="btn">RUN</div>
      <div class="btn">ESC/END</div>
      <div class="cell">CONNECTED</div>
    </div>`;
}

export default {
  id: 'files',
  name: 'FILES',
  scheme: 'green',
  duration: 26000,
  mount(host) {
    host.innerHTML = `
      <div class="files">
        <div class="files-tabs">${TABS}</div>
        <div class="files-main dither"></div>
        ${footer('---')}
      </div>`;

    const main = host.querySelector('.files-main');
    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    // fase 1: CONNECT DEVICE
    later(() => {
      main.innerHTML = `
        <div class="files-dialog"><span class="x">X</span>
          <div class="label">CONNECT DEVICE</div>
        </div>`;
    }, 400);

    // fase 2: SCANNING con mini barra
    later(() => {
      main.innerHTML = `
        <div class="files-dialog"><span class="x">X</span>
          <div class="minibar"><i></i></div>
          <div class="label">SCANNING</div>
        </div>`;
      const bar = main.querySelector('.minibar i');
      const t0 = performance.now();
      const anim = setInterval(() => {
        const p = Math.min(1, (performance.now() - t0) / 4200);
        bar.style.right = `${(1 - p) * 100}%`;
        if (p >= 1) clearInterval(anim);
      }, 120);
      timers.push(anim);
    }, 2800);

    // fase 3: log numerado
    later(() => {
      main.innerHTML = `<div class="files-log"></div>`;
      const log = main.querySelector('.files-log');
      SCAN_LOG.forEach(([num, text, ok], i) => {
        later(() => {
          log.innerHTML +=
            `<div><span class="num">${num}</span><span class="${ok ? 'ok' : ''}">${text}</span></div>`;
        }, i * 800);
      });
    }, 7600);

    // fase 4: grid de archivos + selección que recorre
    later(() => {
      main.classList.remove('dither');
      main.innerHTML = `<div class="files-grid"></div>`;
      const grid = main.querySelector('.files-grid');
      host.querySelector('.files-foot .cell:nth-last-child(4) b').textContent = '55';

      FILES.forEach(([name, size, date], i) => {
        later(() => {
          grid.insertAdjacentHTML('beforeend', `
            <div class="file-card">
              ${FLOPPY}
              <span class="name">${name}</span>
              <span class="size">${size}</span>
              <span class="date">${date}</span>
            </div>`);
        }, i * 55);
      });

      // el "cursor" recorre archivos como si alguien revisara el disco
      later(() => {
        const cards = [...grid.querySelectorAll('.file-card')];
        let sel = 0;
        const walk = setInterval(() => {
          cards.forEach(c => c.classList.remove('sel'));
          cards[sel % cards.length]?.classList.add('sel');
          sel += 1 + Math.floor(Math.random() * 3);
        }, 900);
        timers.push(walk);
      }, FILES.length * 55 + 600);
    }, 11200);

    return () => timers.forEach(t => { clearTimeout(t); clearInterval(t); });
  },
};
