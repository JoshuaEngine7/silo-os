// SILO-OS · modelo procedural del silo (paso 7)
// Wireframe estilo "blueprint CAD" del corpus: cilindro enterrado con ~30
// niveles apilados, escalera espiral central, y elementos de detalle.
// Todo en líneas (LineSegments) para el look de fósforo de baja resolución.

import * as THREE from '../vendor/three/three.module.min.js';

const LEVELS = 30;
const R = 1.0;             // radio del silo
const H = 3.4;             // altura total
const levelH = H / LEVELS;

function ring(radius, y, seg = 48) {
  const pts = [];
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, y, Math.sin(a) * radius));
  }
  return pts;
}

function addLine(group, points, mat) {
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  group.add(new THREE.Line(geo, mat));
}

// Construye el silo completo y devuelve { group, dispose }.
export function buildSilo(color) {
  const group = new THREE.Group();
  const col = new THREE.Color(color);
  const mat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.9 });
  const matDim = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.35 });
  const disposables = [mat, matDim];

  const top = H / 2;
  const bot = -H / 2;

  // --- carcasa exterior: dos anillos por nivel + verticales ---
  for (let i = 0; i <= LEVELS; i++) {
    const y = top - i * levelH;
    addLine(group, ring(R, y), i % 5 === 0 ? mat : matDim);
  }
  // verticales de la pared
  const cols = 24;
  for (let i = 0; i < cols; i++) {
    const a = (i / cols) * Math.PI * 2;
    const x = Math.cos(a) * R, z = Math.sin(a) * R;
    addLine(group, [new THREE.Vector3(x, top, z), new THREE.Vector3(x, bot, z)], matDim);
  }

  // --- núcleo central + escalera espiral ---
  const coreR = 0.16;
  for (let i = 0; i <= LEVELS; i += 2) {
    const y = top - i * levelH;
    addLine(group, ring(coreR, y, 12), matDim);
  }
  // escalera: hélice continua que da una vuelta cada ~2 niveles
  const stairR = 0.28;
  const turns = LEVELS / 2;
  const stairPts = [];
  const stepsPerTurn = 24;
  const totalSteps = turns * stepsPerTurn;
  for (let s = 0; s <= totalSteps; s++) {
    const a = (s / stepsPerTurn) * Math.PI * 2;
    const y = top - (s / totalSteps) * H;
    stairPts.push(new THREE.Vector3(Math.cos(a) * stairR, y, Math.sin(a) * stairR));
  }
  addLine(group, stairPts, mat);
  // eje central
  addLine(group, [new THREE.Vector3(0, top, 0), new THREE.Vector3(0, bot, 0)], matDim);

  // --- plataformas de nivel (radios que conectan núcleo y pared) ---
  for (let i = 4; i < LEVELS; i += 4) {
    const y = top - i * levelH;
    const spokes = 8;
    for (let j = 0; j < spokes; j++) {
      const a = (j / spokes) * Math.PI * 2;
      addLine(group, [
        new THREE.Vector3(Math.cos(a) * coreR, y, Math.sin(a) * coreR),
        new THREE.Vector3(Math.cos(a) * R * 0.96, y, Math.sin(a) * R * 0.96),
      ], matDim);
    }
    addLine(group, ring(R * 0.55, y, 32), matDim);
  }

  // --- domo superior (la "cabeza" del silo bajo la superficie) ---
  const domePts = [];
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * Math.PI;      // media circunferencia
    domePts.push(new THREE.Vector3(Math.cos(a) * R, top + Math.sin(a) * R * 0.5, 0));
  }
  addLine(group, domePts, mat);
  const domePts2 = domePts.map(p => new THREE.Vector3(0, p.y, p.x));
  addLine(group, domePts2, mat);

  // --- túnel lateral en la base (guiño a la vista TUNNEL) ---
  const ty = bot + levelH * 3;
  const tunnelLen = 1.4;
  for (const dz of [-0.12, 0.12]) {
    addLine(group, [
      new THREE.Vector3(R * 0.9, ty + 0.12, dz),
      new THREE.Vector3(R + tunnelLen, ty + 0.12, dz),
    ], matDim);
    addLine(group, [
      new THREE.Vector3(R * 0.9, ty - 0.12, dz),
      new THREE.Vector3(R + tunnelLen, ty - 0.12, dz),
    ], matDim);
  }
  addLine(group, ring(0.12, ty, 16).map(p => new THREE.Vector3(R + tunnelLen, p.y - ty + ty, p.z)), mat);

  group.userData.dispose = () => {
    group.traverse(o => o.geometry?.dispose());
    disposables.forEach(m => m.dispose());
  };
  return group;
}

// vistas de cámara (posición + target) que recorre el visor
export const VIEWS = [
  { name: 'FULL TOWER',   pos: [3.4, 1.8, 3.8],  target: [0, 0, 0],    label: 'SILO FRONT VIEW BLUEPRINT - #S123480' },
  { name: 'LEVEL PLAN',   pos: [0.2, 4.2, 0.35], target: [0, 0.4, 0],  label: 'PLAN AS PER CIVIL DATA · LEVEL' },
  { name: 'TUNNEL DETAIL',pos: [2.2, -1.0, 2.4], target: [1.1, -1.2, 0],label: '\\\\DOME STRUCTURAL DOC SPEC 7.1 · TUNNEL' },
];
