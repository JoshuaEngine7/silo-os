// SILO-OS · punto de entrada: efectos CRT + shell con las 4 apps del loop.

import { initFx, runSelfTest } from './fx.js';
import { initShell, runShellTest } from './shell.js';
import boot from './apps/boot.js';
import files from './apps/files.js';
import blueprint from './apps/blueprint.js';
import relics from './apps/relics.js';

initFx();
const shell = initShell([boot, files, blueprint, relics]);
window.siloShell = shell; // usado por las pruebas y la captura de video

// autotests en navegador real (leen su veredicto en document.title)
if (location.search.includes('fxtest')) setTimeout(runSelfTest, 400);
if (location.search.includes('shelltest')) setTimeout(() => runShellTest(shell), 500);
