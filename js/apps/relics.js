// App 4 · RELICS DATABASE (Sheriff)
// Referencias: fotos 150823, 153208, 153316 + BIBLIA-VISUAL §2.E.
// Secuencia: formulario → se teclea "YELLOW, PLASTI" → SEARCH →
// RESULTS PENDING (fondo rayado) → INSUFFICIENT DATA.

const SEAL = `
  <svg class="relics-seal" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="1.6">
    <circle cx="50" cy="50" r="46"/>
    <circle cx="50" cy="50" r="40" stroke-dasharray="3 3" stroke-width="1"/>
    <path d="M50 14 L61 32 L82 32 L71 50 L82 68 L61 68 L50 86 L39 68 L18 68 L29 50 L18 32 L39 32 Z"/>
    <circle cx="50" cy="50" r="12"/>
    <circle cx="50" cy="50" r="5"/>
  </svg>`;

// keypad real del corpus (QUICK ACCES KEYPD, sic)
const KEYS = [
  ['EMER', '', 'tall'], ['ACK', 'F1'], ['ENRT', 'F2'],
  ['SCN', 'F3'], ['AVAIL', 'F4'],
  ['OUTS', 'F5'], ['TRANS', 'F6'], ['LUNCH', 'F7'],
  ['VEH', 'F8'], ['PERS', 'F9'], ['PROP', 'F10'],
  ['TSTOP', 'F11'], ['ONV', 'F12'], ['SEND', '^'],
  ['DEL', ''], ['REL', ''], ['MAIN', ''],
];

const SIGNAL =
  '·············X··············0·············\n' +
  '····X·····0-X··················1········0·\n' +
  '·············································X';

const TYPED = 'YELLOW, PLASTIC';

export default {
  id: 'relics',
  name: 'RELICS DB',
  scheme: 'sheriff',
  duration: 26000,
  mount(host) {
    host.innerHTML = `
      <div class="relics">
        <div class="relics-menu">
          <span>SYSTEM</span><span>FILE</span><span>RECORDS</span>
          <span class="active">SEARCH</span><span>STATEMENTS</span>
          <span>WARRANTS</span><span>HELP</span>
        </div>
        <div class="relics-menubar"></div>

        <div class="relics-head">
          ${SEAL}
          <div class="relics-dept">
            <span class="box">SHERIFF DEPARTMENT</span>
            <span class="standby">STANDBY</span>
          </div>
          <div class="relics-sd1">SD1</div>
          <div class="relics-sub">PCT SYSTEMS [C] VARSYS</div>
          <div class="relics-signal">${SIGNAL}</div>
        </div>

        <div class="relics-body">
          <div>
            <div class="keypad-title">QUICK ACCES KEYPD</div>
            <div class="keypad">
              ${KEYS.map(([cap, fn, cls]) => `
                <div class="key ${cls ?? ''}">
                  <span>${cap}</span><span class="fn">${fn}</span>
                </div>`).join('')}
            </div>
          </div>

          <div class="relics-form">
            <div class="relics-lawline">
              <b>LAW ENFORCEMENT USE ONLY</b>
              <span><span class="lbl">SHERIFF DEPT:</span> JN/30569 <span class="lbl">X</span></span>
            </div>

            <div class="relics-row3">
              <div class="rfield"><span class="lbl">OBJECT NAME [IF KNOWN]</span><span class="val">-</span></div>
              <div class="rfield"><span class="lbl">OBJECT ID [IF KNOWN]</span><span class="val">R-</span></div>
              <div class="rfield"><span class="lbl">LOCATION FOUND</span><span class="val">-</span></div>
            </div>

            <div class="relics-desc">
              <span class="lbl" style="color:var(--chrome);font-size:12px">OBJECT DESCRIPTION</span>
              <span class="val"><span class="typed"></span><span class="cursor">█</span></span>
              <div class="insufficient">INSUFFICIENT DATA</div>
              <div class="kw"><span>KEYWORDS</span><span>[DESCR]</span></div>
            </div>

            <div class="relics-row2">
              <div class="rfield"><span class="lbl">DISTINGUISHING MARKS</span><span class="val">-</span></div>
              <div class="rfield"><span class="lbl">CODE</span><span class="val">-</span></div>
            </div>

            <div class="relics-auth">SEARCH AUTHORIZATION<br><b>LAW ENFORCEMENT: NICHOLS, JULIETTE, SHERIFF</b></div>

            <div class="relics-actions">
              <div class="btn">CLEAR ALL</div>
              <div class="btn">EDIT</div>
              <div class="btn" data-search>SEARCH</div>
            </div>
          </div>
        </div>

        <div class="relics-foot">
          <div class="relics-messages">MESSAGES:<br>INCOMING <b>(2)</b> &gt;<br>NONE <b>(1)</b></div>
          <div class="relics-ab">
            <div class="ab"><i>A1</i>SCHED<br>INTERROG.</div>
            <div class="ab"><i>A2</i>RAISE<br>QUERY</div>
            <div class="ab"><i>A3</i>ISSUE<br>WARRANT</div>
            <div class="ab"><i>B1</i>CONTEST<br>RELEASE</div>
            <div class="ab"><i>B2</i>ISSUE<br>APB</div>
            <div class="ab"><i>B3</i>FILE<br>RPORT</div>
          </div>
        </div>
        <div class="relics-bottombar"></div>
      </div>`;

    const timers = [];
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    const typed = host.querySelector('.typed');
    const cursor = host.querySelector('.cursor');
    const searchBtn = host.querySelector('[data-search]');
    const desc = host.querySelector('.relics-desc');
    const insufficient = host.querySelector('.insufficient');

    // 1) tecleo carácter a carácter (cadencia humana irregular).
    // el retardo se ACUMULA: si cada carácter usara su propio random
    // independiente, algunos llegarían fuera de orden (YELLOW P,LAIST).
    let t = 2000;
    TYPED.split('').forEach((ch) => {
      t += 160 + Math.random() * 120;
      const at = t;
      later(() => { typed.textContent += ch; }, at);
    });

    // 2) "pulsar" SEARCH
    later(() => searchBtn.classList.add('hot'), 6400);
    later(() => searchBtn.classList.remove('hot'), 6800);

    // 3) RESULTS PENDING sobre rayado diagonal
    later(() => {
      const pending = document.createElement('div');
      pending.className = 'relics-pending';
      pending.innerHTML = `
        <div class="dlg"><span class="x">X</span>
          <div class="label">RESULTS PENDING</div>
          <div class="bar"><i></i></div>
        </div>`;
      host.querySelector('.relics').appendChild(pending);
      const bar = pending.querySelector('.bar i');
      const t0 = performance.now();
      const anim = setInterval(() => {
        const p = Math.min(1, (performance.now() - t0) / 6000);
        bar.style.right = `${(1 - p) * 100}%`;
        if (p >= 1) clearInterval(anim);
      }, 150);
      timers.push(anim);
    }, 7400);

    // 4) veredicto: INSUFFICIENT DATA
    later(() => {
      host.querySelector('.relics-pending')?.remove();
      typed.textContent = '';
      cursor.hidden = true;
      insufficient.classList.add('on');
    }, 14200);

    return () => timers.forEach(t => { clearTimeout(t); clearInterval(t); });
  },
};
