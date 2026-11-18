/* NEXORA AI — publicité 9:16, 30 s, dessinée par code.
   draw(t) dessine l'image à l'instant t (secondes). Tout est déterministe.
   ?st=0 : sans sous-titres incrustés.
   Les instants des bruitages (tools/musique.py) reprennent ceux de ce fichier. */
'use strict';

const W = 1080, H = 1920, DUREE = 30;
window.DUREE = DUREE;
const params = new URLSearchParams(location.search);
const DPR = parseFloat(params.get('dpr') || '1');
const ST = params.get('st') !== '0';
const cv = document.getElementById('c');
cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
cv.style.width = W + 'px'; cv.style.height = H + 'px';
const ctx = cv.getContext('2d');

// ---------- outils ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eOut = k => 1 - Math.pow(1 - k, 3);
const eIn = k => k * k * k;
const eIO = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const eExpo = k => k >= 1 ? 1 : 1 - Math.pow(2, -10 * k);
const eBack = k => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function noise(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const fondu = (t, a, b, d = .35) => clamp(Math.min((t - a) / d, (b - t) / d));

const C = {
  noir: '#020306', bleu: '#2F8CFF', bleuClair: '#8CCBFF', bleuVif: '#4FA8FF', bleuNuit: '#06122B',
  argent: '#C9D1DC', blanc: '#F4F7FB', gris: '#8A94A6', grisFonce: '#3A4150',
  carte: 'rgba(16,20,28,.88)', bord: 'rgba(205,218,238,.16)'
};
const bleuA = a => `rgba(47,140,255,${a})`;
const blancA = a => `rgba(244,247,251,${a})`;
const F = (w, s, fam = 'Montserrat') => `${w} ${s}px ${fam}`;

// ---------- dessin de base ----------
function lueur(c, x, y, r, rgb, a) {
  if (a <= 0) return;
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(.45, `rgba(${rgb},${a * .35})`); g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
}
function argentGrad(c, y, s) {
  const g = c.createLinearGradient(0, y - s * .55, 0, y + s * .45);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(.38, '#E3E8EE'); g.addColorStop(.56, '#9AA4B2'); g.addColorStop(.74, '#EEF1F5'); g.addColorStop(1, '#B9C2CE');
  return g;
}
// texte : o = {size, w, fam, col, a, ls, align, grad:'argent'|'bleu', glow, max}
function txt(c, s, x, y, o) {
  c.save();
  c.globalAlpha *= o.a == null ? 1 : o.a;
  c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
  let size = o.size;
  c.font = F(o.w || 400, size, o.fam); c.letterSpacing = (o.ls || 0) + 'px';
  if (o.max) { const m = c.measureText(s).width; if (m > o.max) { size *= o.max / m; c.font = F(o.w || 400, size, o.fam); c.letterSpacing = (o.ls || 0) * o.max / m + 'px'; } }
  if (o.grad === 'argent') c.fillStyle = argentGrad(c, y, size);
  else if (o.grad === 'bleu') { const g = c.createLinearGradient(0, y - size / 2, 0, y + size / 2); g.addColorStop(0, '#CFE8FF'); g.addColorStop(.6, C.bleuVif); g.addColorStop(1, '#2A6FD6'); c.fillStyle = g; }
  else c.fillStyle = o.col || C.blanc;
  if (o.glow) { c.shadowColor = o.glowCol || bleuA(.55); c.shadowBlur = o.glow; }
  const dx = c.textAlign === 'center' ? (o.ls || 0) / 2 : 0;
  c.fillText(s, x + dx, y);
  c.restore();
  return size;
}
function mesure(c, s, size, w, ls = 0, fam) { c.save(); c.font = F(w, size, fam); c.letterSpacing = ls + 'px'; const m = c.measureText(s).width; c.restore(); return m; }
function carte(c, x, y, w, h, r, o = {}) {
  c.save();
  c.beginPath(); c.roundRect(x, y, w, h, r);
  const g = c.createLinearGradient(x, y, x, y + h);
  g.addColorStop(0, o.haut || 'rgba(26,31,42,.94)'); g.addColorStop(1, o.bas || 'rgba(12,15,22,.94)');
  c.fillStyle = g; c.fill();
  c.lineWidth = o.lw || 1.5; c.strokeStyle = o.bord || C.bord; c.stroke();
  // reflet en haut de la carte
  c.beginPath(); c.roundRect(x + 1, y + 1, w - 2, h - 2, r);
  const r2 = c.createLinearGradient(x, y, x, y + Math.min(60, h));
  r2.addColorStop(0, 'rgba(255,255,255,.07)'); r2.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = r2; c.fill();
  c.restore();
}

// ---------- icônes (traits fins) ----------
function icone(c, type, x, y, s, col = C.blanc, lw = 2.2) {
  c.save(); c.translate(x, y); c.scale(s / 48, s / 48);
  c.strokeStyle = col; c.fillStyle = col; c.lineWidth = lw * 48 / s; c.lineJoin = 'round'; c.lineCap = 'round';
  c.beginPath();
  if (type === 'mail') { c.roundRect(-20, -14, 40, 28, 4); c.moveTo(-18, -11); c.lineTo(0, 3); c.lineTo(18, -11); c.stroke(); }
  else if (type === 'agenda') { c.roundRect(-19, -15, 38, 34, 5); c.moveTo(-19, -5); c.lineTo(19, -5); c.moveTo(-9, -20); c.lineTo(-9, -10); c.moveTo(9, -20); c.lineTo(9, -10); c.stroke();
    for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { c.beginPath(); c.arc(-10 + i * 10, 3 + j * 9, 2, 0, 7); c.fill(); } }
  else if (type === 'crm') { c.arc(0, -8, 8, 0, 7); c.moveTo(-16, 18); c.bezierCurveTo(-16, 4, 16, 4, 16, 18); c.stroke(); c.beginPath(); c.arc(17, -12, 4, 0, 7); c.moveTo(13, -2); c.lineTo(21, -2); c.stroke(); }
  else if (type === 'chat') { c.moveTo(-18, -14); c.lineTo(18, -14); c.quadraticCurveTo(22, -14, 22, -10); c.lineTo(22, 6); c.quadraticCurveTo(22, 10, 18, 10); c.lineTo(-4, 10); c.lineTo(-12, 18); c.lineTo(-12, 10); c.lineTo(-18, 10); c.quadraticCurveTo(-22, 10, -22, 6); c.lineTo(-22, -10); c.quadraticCurveTo(-22, -14, -18, -14); c.stroke();
    for (let i = -1; i <= 1; i++) { c.beginPath(); c.arc(i * 9, -2, 2.2, 0, 7); c.fill(); } }
  else if (type === 'doc') { c.moveTo(-14, -20); c.lineTo(6, -20); c.lineTo(15, -11); c.lineTo(15, 20); c.lineTo(-14, 20); c.closePath(); c.moveTo(6, -20); c.lineTo(6, -11); c.lineTo(15, -11);
    c.moveTo(-7, -2); c.lineTo(8, -2); c.moveTo(-7, 6); c.lineTo(8, 6); c.moveTo(-7, 14); c.lineTo(2, 14); c.stroke(); }
  else if (type === 'facture') { c.moveTo(-14, -20); c.lineTo(14, -20); c.lineTo(14, 20); c.lineTo(9, 16); c.lineTo(4, 20); c.lineTo(-1, 16); c.lineTo(-6, 20); c.lineTo(-10, 16); c.lineTo(-14, 20); c.closePath();
    c.moveTo(-7, -10); c.lineTo(7, -10); c.moveTo(-7, -2); c.lineTo(7, -2); c.moveTo(-7, 6); c.lineTo(2, 6); c.stroke(); }
  else if (type === 'ia') { // étoile à quatre branches
    const e = (r1, r2) => { c.moveTo(0, -r1); c.quadraticCurveTo(r2, -r2, r1, 0); c.quadraticCurveTo(r2, r2, 0, r1); c.quadraticCurveTo(-r2, r2, -r1, 0); c.quadraticCurveTo(-r2, -r2, 0, -r1); };
    e(20, 4); c.stroke(); c.beginPath(); c.save(); c.translate(15, -15); e(7, 1.5); c.restore(); c.fill(); }
  else if (type === 'eclair') { c.moveTo(4, -21); c.lineTo(-12, 3); c.lineTo(0, 3); c.lineTo(-4, 21); c.lineTo(12, -3); c.lineTo(0, -3); c.closePath(); c.stroke(); }
  else if (type === 'cloche') { c.moveTo(-14, 10); c.lineTo(-14, -2); c.bezierCurveTo(-14, -14, 14, -14, 14, -2); c.lineTo(14, 10); c.lineTo(18, 14); c.lineTo(-18, 14); c.closePath(); c.moveTo(-5, 18); c.quadraticCurveTo(0, 23, 5, 18); c.stroke(); }
  else if (type === 'rapport') { c.moveTo(-18, 18); c.lineTo(18, 18); c.stroke(); c.beginPath(); c.roundRect(-14, 0, 7, 14, 1.5); c.roundRect(-3, -9, 7, 23, 1.5); c.roundRect(8, -18, 7, 32, 1.5); c.stroke(); }
  else if (type === 'signe') { c.moveTo(-14, -20); c.lineTo(14, -20); c.lineTo(14, 20); c.lineTo(-14, 20); c.closePath(); c.moveTo(-8, -10); c.lineTo(8, -10); c.moveTo(-8, -3); c.lineTo(4, -3); c.stroke();
    c.beginPath(); c.moveTo(-8, 12); c.bezierCurveTo(-4, 2, -2, 16, 2, 9); c.bezierCurveTo(4, 6, 6, 12, 9, 10); c.stroke(); }
  else if (type === 'outil') { c.arc(0, 0, 8, 0, 7); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; c.moveTo(Math.cos(a) * 13, Math.sin(a) * 13); c.lineTo(Math.cos(a) * 19, Math.sin(a) * 19); } c.stroke(); }
  else if (type === 'check') { c.moveTo(-12, 1); c.lineTo(-3, 10); c.lineTo(13, -9); c.stroke(); }
  c.restore();
}

// ---------- fond commun : poussière lumineuse ----------
const POUSSIERE = (() => { const r = rng(5); return Array.from({ length: 150 }, () => ({ x: r() * W, y: r() * H, z: .3 + r() * .7, p: r() * 7, s: .6 + r() * 1.8 })); })();
function poussiere(c, t, a = 1, vy = -14) {
  if (a <= 0) return;
  c.save(); c.globalCompositeOperation = 'lighter';
  for (const p of POUSSIERE) {
    const y = ((p.y + vy * t * p.z) % H + H) % H, x = p.x + Math.sin(t * .3 + p.p) * 12 * p.z;
    const al = a * (.18 + .35 * p.z) * (.6 + .4 * Math.sin(t * 1.3 + p.p * 3));
    c.fillStyle = p.p > 5 ? `rgba(140,203,255,${al})` : `rgba(220,228,240,${al * .8})`;
    c.beginPath(); c.arc(x, y, p.s * p.z, 0, 7); c.fill();
  }
  c.restore();
}
function fondNoir(c, t, bleu = .12, cy = 960) {
  c.fillStyle = C.noir; c.fillRect(0, 0, W, H);
  lueur(c, 540, cy, 1100, '20,60,140', bleu);
  lueur(c, 540, -200, 900, '120,140,170', .06);
}

// ---------- caméra : le point monde (cx, cy) vient en (sx, sy) à l'écran ----------
function camera(c, s, cx, cy, rot = 0, sx = 540, sy = 960) {
  c.translate(sx, sy); c.rotate(rot); c.scale(s, s); c.translate(-cx, -cy);
}
// interpolation entre images clés [t, ...valeurs]
function cles(t, K, ease = eIO) {
  if (t <= K[0][0]) return K[0].slice(1);
  for (let i = 0; i < K.length - 1; i++) {
    const a = K[i], b = K[i + 1];
    if (t <= b[0]) { const k = ease(seg(t, a[0], b[0])); return a.slice(1).map((v, j) => lerp(v, b[j + 1], k)); }
  }
  return K[K.length - 1].slice(1);
}

// =====================================================================
// SCÈNE 1 — 0 à 5 s : le temps perdu (notifications en rafale)
// =====================================================================
const NOTIFS = [.15, .45, .72, .98, 1.22, 1.45, 1.66, 1.86, 2.05, 2.23, 2.40, 2.56, 2.71, 2.85, 2.98, 3.10, 3.21, 3.31, 3.40, 3.49, 3.57, 3.65];
const CONTENU = [
  ['mail', 'Nouveau message client', 'Re : demande de devis urgente'],
  ['agenda', 'Rendez-vous à confirmer', 'Jeudi 14:00 · M. Durand'],
  ['facture', 'Facture à envoyer', 'Dossier client en attente'],
  ['chat', 'Messages non lus', '« Vous êtes disponibles ? »'],
  ['mail', 'Relance à faire', 'Proposition envoyée lundi'],
  ['crm', 'Nouveau prospect', 'À saisir dans le CRM'],
  ['agenda', "Conflit d'agenda", 'Deux rendez-vous à 10:30'],
  ['doc', 'Devis à préparer', 'Demande reçue hier'],
  ['mail', 'Boîte de réception', 'Réponses en attente'],
  ['chat', 'Client en attente', 'Réponse attendue'],
  ['facture', 'Paiement à relancer', 'Échéance dépassée'],
  ['doc', 'Contrat à signer', 'En attente de retour'],
];
const CARTES = (() => {
  const r = rng(11);
  return NOTIFS.map((t0, i) => {
    let y; do { y = 330 + r() * 1180; } while (y > 760 && y < 1160 && i < 9); // les premières évitent le titre
    return { t0, i, x: 300 + r() * 480, y, rot: (r() - .5) * .16, s: .78 + r() * .3, dx: (r() - .5) * 30, c: CONTENU[i % CONTENU.length] };
  });
})();
function notification(c, n, t, aspir) {
  const k = eBack(seg(t, n.t0, n.t0 + .28)), a0 = seg(t, n.t0, n.t0 + .12);
  if (a0 <= 0) return;
  const age = t - n.t0;
  let x = n.x + n.dx * age, y = n.y - 10 * age + (1 - k) * 40, s = n.s * (.92 + .08 * k), rot = n.rot;
  // les anciennes cartes s'assombrissent : la rafale se lit, le titre reste devant
  let a = a0 * (1 - .5 * seg(age, .9, 2.2));
  if (aspir > 0) { // aspirées vers le centre
    const e = eIn(clamp(aspir * (1.15 - n.i * .012)));
    x = lerp(x, 540, e); y = lerp(y, 960, e); s *= 1 - .95 * e; rot += e * 2.2 * (n.i % 2 ? 1 : -1); a *= 1 - .4 * e;
  }
  c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s); c.globalAlpha = a;
  carte(c, -280, -56, 560, 112, 28);
  c.beginPath(); c.arc(-218, 0, 32, 0, 7); c.fillStyle = 'rgba(47,140,255,.16)'; c.fill(); c.strokeStyle = 'rgba(120,180,255,.35)'; c.lineWidth = 1.5; c.stroke();
  icone(c, n.c[0], -218, 0, 34, C.bleuClair, 2.4);
  txt(c, n.c[1], -168, -16, { size: 25, w: 600, align: 'left', col: C.blanc });
  txt(c, n.c[2], -168, 18, { size: 21, w: 400, align: 'left', col: C.gris });
  txt(c, 'maintenant', 258, -18, { size: 17, w: 400, align: 'right', col: '#6B7486' });
  c.beginPath(); c.arc(250, 16, 6, 0, 7); c.fillStyle = C.bleu; c.fill();
  c.restore();
}
function scene1(c, t) {
  fondNoir(c, t, .07 + .05 * seg(t, 0, 4));
  const aspir = seg(t, 4.05, 4.95);
  // légère secousse qui monte avec la rafale
  const sh = 3 * seg(t, 2.2, 3.7) * (1 - aspir);
  c.save(); c.translate(noise(t * 30) * sh, noise(t * 30 + 9) * sh);
  const zoom = 1 + .05 * seg(t, 0, 4.1);
  c.translate(540, 960); c.scale(zoom, zoom); c.translate(-540, -960);
  poussiere(c, t, .5);
  // traînées d'aspiration
  if (aspir > 0) {
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const n of CARTES) { const e = eIn(aspir); const x = lerp(n.x, 540, e * .7), y = lerp(n.y, 960, e * .7);
      const g = c.createLinearGradient(x, y, 540, 960); g.addColorStop(0, bleuA(0)); g.addColorStop(1, bleuA(.5 * Math.sin(Math.PI * aspir)));
      c.strokeStyle = g; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(540, 960); c.stroke(); }
    c.restore();
  }
  for (const n of CARTES) notification(c, n, t, aspir);
  c.restore();
  // titre d'accroche, devant, sur un voile sombre
  const aT = fondu(t, .3, 4.45, .3);
  if (aT > 0) {
    const g = c.createRadialGradient(540, 925, 0, 540, 925, 620);
    g.addColorStop(0, `rgba(2,3,6,${.88 * aT})`); g.addColorStop(.6, `rgba(2,3,6,${.6 * aT})`); g.addColorStop(1, 'rgba(2,3,6,0)');
    c.fillStyle = g; c.fillRect(0, 500, W, 900);
    const ls = 2 + 14 * eIn(seg(t, 4.1, 4.45));
    const l1 = seg(t, .3, .7), l2 = seg(t, .7, 1.1);
    txt(c, 'Votre entreprise perd', 540, 880 + 18 * (1 - eOut(l1)), { size: 72, w: 600, grad: 'argent', a: eOut(l1) * aT, ls, max: 920 });
    txt(c, 'du temps chaque jour.', 540, 972 + 18 * (1 - eOut(l2)), { size: 72, w: 600, grad: 'argent', a: eOut(l2) * aT, ls, max: 920 });
    // trait de lumière sous le titre
    const lw = 360 * eOut(seg(t, 1.0, 1.6));
    const gl = c.createLinearGradient(540 - lw, 0, 540 + lw, 0); gl.addColorStop(0, bleuA(0)); gl.addColorStop(.5, bleuA(.9 * aT)); gl.addColorStop(1, bleuA(0));
    c.fillStyle = gl; c.fillRect(540 - lw, 1040, lw * 2, 2);
  }
  // le point de lumière qui naît de l'aspiration
  const p = seg(t, 4.55, 5.0);
  if (p > 0) {
    c.save(); c.globalCompositeOperation = 'lighter';
    lueur(c, 540, 960, 60 + 500 * eIn(p), '80,160,255', .9 * p);
    lueur(c, 540, 960, 30 + 120 * eIn(p), '235,245,255', p);
    c.restore();
  }
}

// =====================================================================
// SCÈNE 2 — 5 à 10 s : les applications se connectent
// =====================================================================
const APPS = [['mail', 'Emails'], ['agenda', 'Agenda'], ['crm', 'CRM'], ['chat', 'Messagerie'], ['doc', 'Documents'], ['facture', 'Facturation']];
const CX2 = 540, CY2 = 960, R2 = 290;
const nodePos = k => { const a = -Math.PI / 2 + k * Math.PI / 3; return [CX2 + Math.cos(a) * R2, CY2 + Math.sin(a) * R2]; };
const MOTS = [[5.55, 'AUTOMATISEZ.'], [6.75, 'OPTIMISEZ.'], [7.95, 'ÉVOLUEZ.']];
function trait(c, x1, y1, x2, y2, k, a, w = 2.2) {
  if (k <= 0) return;
  const x = lerp(x1, x2, k), y = lerp(y1, y2, k);
  c.save(); c.globalCompositeOperation = 'lighter';
  c.strokeStyle = bleuA(.22 * a); c.lineWidth = w * 4; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x, y); c.stroke();
  const g = c.createLinearGradient(x1, y1, x2, y2); g.addColorStop(0, `rgba(120,190,255,${.85 * a})`); g.addColorStop(1, `rgba(47,140,255,${.85 * a})`);
  c.strokeStyle = g; c.lineWidth = w; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x, y); c.stroke();
  if (k < 1) lueur(c, x, y, 26, '170,215,255', .9 * a);
  c.restore();
}
function impulsion(c, x1, y1, x2, y2, k, a) {
  if (k <= 0 || k >= 1) return;
  const x = lerp(x1, x2, k), y = lerp(y1, y2, k);
  c.save(); c.globalCompositeOperation = 'lighter';
  lueur(c, x, y, 22, '160,210,255', a);
  c.fillStyle = `rgba(255,255,255,${a})`; c.beginPath(); c.arc(x, y, 3.2, 0, 7); c.fill();
  c.restore();
}
function noyau(c, t, cx, cy, s, a) {
  c.save(); c.translate(cx, cy); c.scale(s, s); c.globalAlpha = a;
  c.globalCompositeOperation = 'lighter';
  lueur(c, 0, 0, 230, '47,140,255', .45);
  lueur(c, 0, 0, 90, '200,230,255', .7);
  c.globalCompositeOperation = 'source-over';
  // anneaux qui tournent
  c.lineCap = 'round';
  for (const [r, n, v, lw, col] of [[78, 3, .6, 3, 'rgba(230,240,255,.9)'], [104, 5, -.35, 1.6, 'rgba(140,200,255,.7)'], [128, 1, .2, 1, 'rgba(200,215,235,.35)']]) {
    c.strokeStyle = col; c.lineWidth = lw;
    for (let i = 0; i < n; i++) { const a0 = t * v + i * Math.PI * 2 / n; c.beginPath(); c.arc(0, 0, r, a0, a0 + (n === 1 ? Math.PI * 2 : Math.PI * 2 / n * .62)); c.stroke(); }
  }
  const g = c.createRadialGradient(-12, -14, 4, 0, 0, 54);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(.35, '#BFE0FF'); g.addColorStop(1, '#1E5FC0');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, 50, 0, 7); c.fill();
  icone(c, 'ia', 0, 0, 44, 'rgba(6,18,43,.9)', 2.6);
  c.restore();
}
function noeudApp(c, k, t, t0) {
  const [x, y] = nodePos(k), e = eBack(seg(t, t0, t0 + .45)), a = seg(t, t0, t0 + .2);
  if (a <= 0) return;
  c.save(); c.translate(x, y); c.scale(e, e); c.globalAlpha = a;
  const actif = .5 + .5 * Math.sin(t * 2.2 + k);
  c.save(); c.globalCompositeOperation = 'lighter'; lueur(c, 0, 0, 120, '47,140,255', .12 + .08 * actif); c.restore();
  carte(c, -58, -58, 116, 116, 30, { bord: 'rgba(180,205,240,.32)' });
  icone(c, APPS[k][0], 0, 0, 52, C.blanc, 2.3);
  c.restore();
  txt(c, APPS[k][1], x, y + 88, { size: 23, w: 500, col: C.argent, a: a * .9, ls: 1 });
}
function scene2(c, t) {
  fondNoir(c, t, .16, CY2);
  // plongée finale dans le noyau
  const plonge = eIn(seg(t, 9.35, 10.0));
  const [s, rot] = cles(t, [[5.0, .88, -.02], [9.35, 1.02, .02]], k => k);
  c.save(); camera(c, s * (1 + 9 * plonge), CX2, CY2, rot, 540, CY2);
  poussiere(c, t, .8);
  // liens rayons (applis → noyau) puis anneau (appli → appli)
  const fil = (x1, y1, x2, y2, t0, d) => trait(c, x1, y1, x2, y2, eOut(seg(t, t0, t0 + d)), 1);
  for (let k = 0; k < 6; k++) { const [x, y] = nodePos(k); fil(x, y, CX2, CY2, 5.75 + k * .2, .45); }
  for (let k = 0; k < 6; k++) { const [x1, y1] = nodePos(k), [x2, y2] = nodePos((k + 1) % 6); fil(x1, y1, x2, y2, 6.95 + k * .16, .4); }
  // données qui circulent
  for (let k = 0; k < 6; k++) {
    const [x, y] = nodePos(k);
    for (let j = 0; j < 2; j++) { const ph = ((t - 6.6 - k * .13 - j * .5) / 1.0); if (ph > 0) impulsion(c, x, y, CX2, CY2, ph % 1, .9); }
    const [x2, y2] = nodePos((k + 1) % 6), ph2 = (t - 7.6 - k * .1) / .9;
    if (ph2 > 0) impulsion(c, x, y, x2, y2, ph2 % 1, .8);
  }
  noyau(c, t, CX2, CY2, eBack(seg(t, 5.0, 5.6)) * (1 + .04 * Math.sin(t * 3)), 1);
  for (let k = 0; k < 6; k++) noeudApp(c, k, t, 5.15 + k * .1);
  c.restore();
  // les trois mots, en haut
  const aMots = 1 - seg(t, 9.2, 9.5);
  MOTS.forEach(([t0, m], i) => {
    const k = seg(t, t0, t0 + .5); if (k <= 0) return;
    const y = 300 + i * 92, dernier = MOTS.filter(m => t >= m[0]).length - 1;
    const plein = i === dernier || t > 8.6;
    c.save();
    const lw = mesure(c, m, 70, 300, 16);
    c.beginPath(); c.rect(540 - lw / 2 - 20, y - 60, (lw + 40) * eOut(k), 120); c.clip();
    txt(c, m, 540, y, { size: 70, w: 300, grad: 'argent', ls: 16, a: aMots * (plein ? 1 : .42) });
    c.restore();
    // éclat qui balaie le mot à son arrivée
    const b = seg(t, t0, t0 + .6);
    if (b > 0 && b < 1) { c.save(); c.globalCompositeOperation = 'lighter'; lueur(c, 540 - lw / 2 + lw * b, y, 90, '150,205,255', .5 * Math.sin(Math.PI * b) * aMots); c.restore(); }
  });
  // éclair blanc-bleu à l'entrée dans le noyau
  const fl = Math.max(pulse(t, 5.0, .01, .45) * .8, eIn(seg(t, 9.7, 10.0)));
  if (fl > 0) { c.fillStyle = `rgba(210,232,255,${fl})`; c.fillRect(0, 0, W, H); }
}
function pulse(t, t0, up = .08, down = .5) { if (t < t0 - up || t > t0 + down) return 0; return t < t0 ? eOut(seg(t, t0 - up, t0)) : 1 - eOut(seg(t, t0, t0 + down)); }

// =====================================================================
// SCÈNE 3 — 10 à 17 s : quatre écrans qui travaillent seuls
// =====================================================================
const PW = 460, PH = 420;
const PANNEAUX = [[300, 645], [780, 645], [300, 1075], [780, 1075]];
const ENTETES = [['ia', 'Assistant IA', 'en ligne'], ['agenda', 'Rendez-vous', 'synchronisé'], ['crm', 'CRM · Prospects', 'à jour'], ['mail', 'Suivi automatique', 'actif']];
function bulle(c, s, x, y, droite, k, w = 330) {
  if (k <= 0) return 0;
  c.save(); c.globalAlpha *= eOut(k); c.translate(0, 14 * (1 - eOut(k)));
  c.font = F(500, 19); const lignes = coupe(c, s, w - 36);
  const h = 22 + lignes.length * 26, bw = Math.min(w, Math.max(...lignes.map(l => c.measureText(l).width)) + 36);
  const bx = droite ? x - bw : x;
  c.beginPath(); c.roundRect(bx, y, bw, h, 18);
  if (droite) { const g = c.createLinearGradient(bx, y, bx + bw, y + h); g.addColorStop(0, '#3A95FF'); g.addColorStop(1, '#1F63D1'); c.fillStyle = g; }
  else c.fillStyle = 'rgba(60,68,84,.85)';
  c.fill();
  lignes.forEach((l, i) => txt(c, l, bx + 18, y + 24 + i * 26, { size: 19, w: 500, align: 'left', col: C.blanc }));
  c.restore();
  return h;
}
function coupe(c, s, max) {
  const mots = s.split(' '), out = []; let l = '';
  for (const m of mots) { const e = l ? l + ' ' + m : m; if (c.measureText(e).width > max && l) { out.push(l); l = m; } else l = e; }
  if (l) out.push(l); return out;
}
function panneauIA(c, t) {
  bulle(c, 'Bonjour, avez-vous un créneau jeudi ?', 24, 82, false, seg(t, 10.25, 10.5));
  // l'IA écrit
  const ec = fondu(t, 10.55, 10.95, .08);
  if (ec > 0) { c.save(); c.globalAlpha *= ec; c.beginPath(); c.roundRect(356, 168, 80, 40, 18); c.fillStyle = 'rgba(47,140,255,.35)'; c.fill();
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(378 + i * 18, 188, 5, 0, 7); c.fillStyle = blancA(.4 + .6 * Math.max(0, Math.sin(t * 12 - i))); c.fill(); } c.restore(); }
  bulle(c, 'Oui, jeudi à 14 h. Je vous réserve ce créneau ?', 436, 168, true, seg(t, 10.95, 11.2));
  bulle(c, 'Parfait, merci !', 24, 268, false, seg(t, 11.35, 11.6));
  // champ de saisie
  c.save(); c.beginPath(); c.roundRect(24, 346, 412, 50, 25); c.strokeStyle = C.bord; c.lineWidth = 1.5; c.stroke();
  txt(c, 'Réponse automatique · 24 h/24', 48, 371, { size: 17, w: 400, align: 'left', col: '#6B7486' }); c.restore();
}
function panneauAgenda(c, t) {
  const J = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'], x0 = 70, y0 = 98, cw = 74, rh = 38;
  J.forEach((j, i) => txt(c, j, x0 + cw * i + cw / 2, 86, { size: 17, w: 600, col: i === 3 ? C.bleuClair : C.gris }));
  for (let r = 0; r < 7; r++) txt(c, `${9 + r}h`, 46, y0 + 20 + r * rh, { size: 15, w: 400, col: '#6B7486' });
  c.save(); c.strokeStyle = 'rgba(205,218,238,.07)'; c.lineWidth = 1;
  for (let r = 0; r <= 7; r++) { c.beginPath(); c.moveTo(x0, y0 + r * rh); c.lineTo(x0 + cw * 5, y0 + r * rh); c.stroke(); }
  c.restore();
  const bloc = (j, r, h, col, k, label) => { if (k <= 0) return; c.save(); c.globalAlpha *= eOut(k);
    const x = x0 + cw * j + 4, y = y0 + r * rh + 3, w = (cw - 8), hh = (h * rh - 6) * eOut(k);
    c.beginPath(); c.roundRect(x, y, w, hh, 8); c.fillStyle = col; c.fill(); if (label) txt(c, label, x + w / 2, y + hh / 2, { size: 14, w: 600, col: C.blanc }); c.restore(); };
  for (const [j, r, h] of [[0, 0, 2], [1, 3, 1], [2, 1, 2], [4, 4, 2], [0, 5, 1]]) bloc(j, r, h, 'rgba(90,100,120,.45)', 1);
  bloc(3, 5, 1, '#2F8CFF', seg(t, 12.3, 12.55), '14:00');
  bloc(1, 0, 1, 'rgba(47,140,255,.55)', seg(t, 12.9, 13.1));
  bloc(4, 1, 1, 'rgba(47,140,255,.55)', seg(t, 13.05, 13.25));
  // halo sur le nouveau rendez-vous
  const h = pulse(t, 12.45, .05, .8); if (h > 0) { c.save(); c.globalCompositeOperation = 'lighter'; lueur(c, x0 + cw * 3.5, y0 + 5.5 * rh, 120, '47,140,255', .6 * h); c.restore(); }
  // confirmation
  const k = seg(t, 12.7, 12.95);
  if (k > 0) { c.save(); c.globalAlpha *= eOut(k); c.translate(0, 20 * (1 - eOut(k)));
    carte(c, 40, 362, 380, 44, 22, { haut: 'rgba(30,60,110,.95)', bas: 'rgba(20,45,90,.95)', bord: 'rgba(120,180,255,.5)' });
    icone(c, 'check', 66, 384, 22, C.bleuClair, 3);
    txt(c, 'Rendez-vous confirmé · Jeu. 14:00', 86, 384, { size: 17, w: 600, align: 'left', col: C.blanc }); c.restore(); }
}
function panneauCRM(c, t) {
  txt(c, 'Contact', 30, 88, { size: 15, w: 600, align: 'left', col: '#6B7486', ls: 1 });
  txt(c, 'Source', 214, 88, { size: 15, w: 600, align: 'left', col: '#6B7486', ls: 1 });
  txt(c, 'Statut', 340, 88, { size: 15, w: 600, align: 'left', col: '#6B7486', ls: 1 });
  const L = [['Sophie L.', 'Site web', 'Nouveau', 13.7], ['Atelier Moreau', 'Email', 'Qualifié', 13.95], ['Karim B.', 'Formulaire', 'Nouveau', 14.2], ['Julie R.', 'Instagram', 'RDV pris', 14.45], ['Cabinet Roy', 'Appel', 'Qualifié', 99]];
  L.forEach(([n, s, st, t0], i) => {
    const k = seg(t, t0, t0 + .3), y = 130 + i * 56;
    if (t0 > 50) { // ligne déjà là
      c.save(); c.globalAlpha *= .45; ligne(n, s, st, y); c.restore(); return;
    }
    if (k <= 0) return;
    c.save(); c.globalAlpha *= eOut(k); c.translate(40 * (1 - eOut(k)), 0);
    const neuf = pulse(t, t0 + .2, .05, .7);
    if (neuf > 0) { c.beginPath(); c.roundRect(14, y - 24, 432, 48, 12); c.fillStyle = bleuA(.18 * neuf); c.fill(); }
    ligne(n, s, st, y); c.restore();
  });
  function ligne(n, s, st, y) {
    c.beginPath(); c.arc(42, y, 15, 0, 7); c.fillStyle = 'rgba(140,160,190,.25)'; c.fill();
    txt(c, n[0], 42, y + 1, { size: 15, w: 700, col: C.argent });
    txt(c, n, 66, y, { size: 18, w: 600, align: 'left', col: C.blanc, max: 128 });
    txt(c, s, 214, y, { size: 17, w: 400, align: 'left', col: C.gris });
    c.beginPath(); c.roundRect(336, y - 15, 100, 30, 15); c.fillStyle = st === 'Nouveau' ? bleuA(.25) : st === 'RDV pris' ? 'rgba(120,200,255,.2)' : 'rgba(200,215,235,.12)'; c.fill();
    txt(c, st, 386, y + 1, { size: 15, w: 600, col: st === 'Nouveau' ? C.bleuClair : C.argent });
  }
  c.save(); c.strokeStyle = 'rgba(205,218,238,.07)'; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(20, 158 + i * 56); c.lineTo(440, 158 + i * 56); c.stroke(); } c.restore();
  const k = seg(t, 14.45, 14.7);
  if (k > 0) txt(c, '+ 4 prospects enregistrés automatiquement', 230, 396, { size: 16, w: 500, col: C.bleuClair, a: eOut(k) });
}
function panneauSuivi(c, t) {
  // email en préparation
  carte(c, 24, 74, 412, 170, 18, { haut: 'rgba(30,36,48,.95)', bas: 'rgba(22,27,37,.95)' });
  txt(c, 'À : Sophie L.', 44, 102, { size: 16, w: 500, align: 'left', col: C.gris });
  txt(c, 'Objet : Merci pour votre demande', 44, 130, { size: 17, w: 600, align: 'left', col: C.blanc });
  const ecr = seg(t, 15.1, 15.55);
  [[300, 162], [340, 186], [210, 210]].forEach(([w, y], i) => { const k = clamp(ecr * 3 - i); if (k <= 0) return;
    c.beginPath(); c.roundRect(44, y - 5, w * k, 10, 5); c.fillStyle = 'rgba(200,215,235,.18)'; c.fill(); });
  // bouton envoyer → envoyé
  const env = seg(t, 15.6, 15.75);
  c.save(); c.beginPath(); c.roundRect(296, 196, 120, 36, 18);
  c.fillStyle = env > 0 ? '#2F8CFF' : 'rgba(47,140,255,.35)'; c.fill();
  if (env > 0) { icone(c, 'check', 322, 214, 18, C.blanc, 3); txt(c, 'Envoyé', 370, 215, { size: 16, w: 700, col: C.blanc }); }
  else txt(c, 'Envoyer', 356, 215, { size: 16, w: 700, col: C.blanc });
  c.restore();
  // séquence de relances
  const E = [['J+0', 'Remerciement', 'Envoyé', 15.6], ['J+3', 'Relance douce', 'Programmé', 15.85], ['J+7', 'Proposition de rendez-vous', 'Programmé', 16.05]];
  c.save(); c.strokeStyle = bleuA(.5); c.lineWidth = 2; c.beginPath(); c.moveTo(48, 282); c.lineTo(48, 282 + 100 * seg(t, 15.6, 16.2)); c.stroke(); c.restore();
  E.forEach(([j, l, s, t0], i) => {
    const k = seg(t, t0, t0 + .25); if (k <= 0) return; const y = 282 + i * 50;
    c.save(); c.globalAlpha *= eOut(k);
    c.beginPath(); c.arc(48, y, 8, 0, 7); c.fillStyle = i === 0 ? C.bleu : '#1B2433'; c.fill(); c.strokeStyle = C.bleu; c.lineWidth = 2; c.stroke();
    txt(c, j, 70, y, { size: 16, w: 700, align: 'left', col: C.bleuClair });
    txt(c, l, 118, y, { size: 17, w: 500, align: 'left', col: C.blanc });
    txt(c, s, 436, y, { size: 15, w: 500, align: 'right', col: i === 0 ? C.bleuClair : C.gris });
    c.restore();
  });
}
const CONTENUS = [panneauIA, panneauAgenda, panneauCRM, panneauSuivi];
function panneau(c, i, t, a) {
  const [x, y] = PANNEAUX[i];
  c.save(); c.translate(x - PW / 2, y - PH / 2); c.globalAlpha = a;
  carte(c, 0, 0, PW, PH, 30, { bord: 'rgba(190,210,240,.22)' });
  const [ic, titre, etat] = ENTETES[i];
  c.beginPath(); c.arc(42, 40, 20, 0, 7); c.fillStyle = bleuA(.18); c.fill();
  icone(c, ic, 42, 40, 24, C.bleuClair, 2.4);
  txt(c, titre, 74, 40, { size: 21, w: 600, align: 'left', col: C.blanc });
  const live = .55 + .45 * Math.sin(t * 5 + i);
  c.beginPath(); c.arc(PW - 104, 40, 5, 0, 7); c.fillStyle = `rgba(79,168,255,${live})`; c.fill();
  txt(c, etat, PW - 92, 40, { size: 16, w: 500, align: 'left', col: C.gris });
  c.save(); c.strokeStyle = 'rgba(205,218,238,.08)'; c.beginPath(); c.moveTo(20, 66); c.lineTo(PW - 20, 66); c.stroke(); c.restore();
  CONTENUS[i](c, t);
  c.restore();
}
function scene3(c, t) {
  fondNoir(c, t, .13, 860);
  const P = PANNEAUX;
  const [cx, cy, s] = cles(t, [
    [10.0, P[0][0], P[0][1], 2.9], [10.35, P[0][0], P[0][1], 1.85], [11.6, P[0][0], P[0][1], 1.9],
    [11.9, P[1][0], P[1][1], 1.85], [13.3, P[1][0], P[1][1], 1.9],
    [13.6, P[2][0], P[2][1], 1.85], [15.0, P[2][0], P[2][1], 1.9],
    [15.3, P[3][0], P[3][1], 1.85], [16.2, P[3][0], P[3][1], 1.9],
    [16.7, 540, 860, 1.0], [17.0, 540, 860, .96]]);
  const actif = t < 11.75 ? 0 : t < 13.45 ? 1 : t < 15.15 ? 2 : 3;
  const vue = seg(t, 16.15, 16.6); // vue d'ensemble : tous les écrans en pleine lumière
  c.save(); camera(c, s, cx, cy, 0, 540, 860);
  poussiere(c, t, .5);
  // liaisons lumineuses entre les écrans (rappel de la scène 2)
  for (const [a, b] of [[0, 1], [1, 3], [3, 2], [2, 0]]) {
    const [x1, y1] = P[a], [x2, y2] = P[b];
    c.save(); c.globalAlpha = .5; trait(c, x1, y1, x2, y2, 1, .5, 1.5); c.restore();
    const ph = (t * .8 + a * .25) % 1; impulsion(c, x1, y1, x2, y2, ph, .7);
  }
  for (let i = 0; i < 4; i++) panneau(c, i, t, i === actif ? 1 : lerp(.2, 1, vue));
  c.restore();
  // voile sombre en haut, pour que les titres se lisent devant les écrans
  const vo = c.createLinearGradient(0, 160, 0, 440); vo.addColorStop(0, 'rgba(2,3,6,.92)'); vo.addColorStop(.7, 'rgba(2,3,6,.8)'); vo.addColorStop(1, 'rgba(2,3,6,0)');
  c.fillStyle = vo; c.fillRect(0, 0, W, 440);
  // titres de la scène
  const aT = 1 - seg(t, 16.75, 16.95);
  const k1 = seg(t, 10.3, 10.75), k2 = seg(t, 13.7, 14.15);
  txt(c, 'Moins de tâches répétitives.', 540, 258 + 14 * (1 - eOut(k1)), { size: 50, w: 500, grad: 'argent', a: eOut(k1) * aT * (k2 > 0 ? lerp(1, .6, k2) : 1), max: 900 });
  txt(c, 'Plus de temps pour votre croissance.', 540, 330 + 14 * (1 - eOut(k2)), { size: 50, w: 600, grad: 'bleu', a: eOut(k2) * aT, max: 900, glow: 18 });
  // entrée : sortie du flash
  const fl = 1 - eOut(seg(t, 10.0, 10.4));
  if (fl > 0) { c.fillStyle = `rgba(210,232,255,${fl})`; c.fillRect(0, 0, W, H); }
}

// =====================================================================
// SCÈNE 4 — 17 à 24 s : les workflows s'exécutent seuls
// =====================================================================
const FLUX = [
  ['Prospection', [['crm', 'Nouveau lead'], ['ia', 'Qualification IA'], ['rapport', 'Ajout au CRM'], ['mail', 'Email de suivi']]],
  ['Relation client', [['chat', 'Demande client'], ['ia', 'Réponse IA'], ['outil', 'Votre outil'], ['cloche', 'Rappel RDV']]],
  ['Gestion', [['signe', 'Devis signé'], ['facture', 'Facture'], ['eclair', 'Relance auto'], ['rapport', 'Tableau de bord']]],
];
const NX = [180, 400, 620, 840], NY = [690, 905, 1120];
const SLOT = 20.75;
function scene4(c, t) {
  fondNoir(c, t, .14, 900);
  const fin = eIn(seg(t, 23.25, 23.85)); // tout se replie en une ligne de lumière
  const [s, rot, cx, cy] = cles(t, [[17.0, 1.12, -.035, 540, 900], [18.6, 1.0, 0, 540, 900], [20.2, 1.03, 0, 540, 905], [21.1, 1.12, 0, 620, 905], [22.0, 1.0, 0, 540, 900], [23.2, .97, 0, 540, 900]]);
  c.save();
  c.translate(540, 900); c.scale(1, 1 - fin * .995); c.translate(-540, -900);
  camera(c, s, cx, cy, rot, 540, 900);
  poussiere(c, t, .6);
  const aF = seg(t, 17.05, 17.4);
  c.globalAlpha = aF;
  carte(c, 60, 520, 960, 760, 36, { bord: 'rgba(190,210,240,.2)', haut: 'rgba(18,22,31,.9)', bas: 'rgba(9,12,18,.92)' });
  txt(c, 'Workflows', 104, 578, { size: 26, w: 600, align: 'left', col: C.blanc });
  const live = .55 + .45 * Math.sin(t * 5);
  c.beginPath(); c.roundRect(796, 558, 184, 40, 20); c.fillStyle = bleuA(.16); c.fill();
  c.beginPath(); c.arc(822, 578, 6, 0, 7); c.fillStyle = `rgba(79,168,255,${live})`; c.fill();
  txt(c, '3 actifs', 840, 579, { size: 19, w: 600, align: 'left', col: C.bleuClair });
  c.save(); c.strokeStyle = 'rgba(205,218,238,.08)'; c.beginPath(); c.moveTo(90, 615); c.lineTo(990, 615); c.stroke(); c.restore();
  FLUX.forEach(([nom, noeuds], r) => {
    const y = NY[r], t0 = 17.45 + r * .5;
    txt(c, nom.toUpperCase(), 104, y - 78, { size: 15, w: 600, align: 'left', col: '#6B7486', ls: 3, a: seg(t, t0 - .1, t0 + .2) });
    const per = 2.4, ph0 = 18.9 + r * .55;
    // liaisons et impulsions
    for (let k = 0; k < 3; k++) {
      const vide = r === 1 && (k === 1 || k === 2) && t < SLOT;
      const kk = eOut(seg(t, t0 + k * .1 + .1, t0 + k * .1 + .4));
      if (vide) { c.save(); c.setLineDash([6, 8]); c.strokeStyle = 'rgba(205,218,238,.22)'; c.lineWidth = 2; c.beginPath(); c.moveTo(NX[k] + 44, y); c.lineTo(lerp(NX[k] + 44, NX[k + 1] - 44, kk), y); c.stroke(); c.restore(); continue; }
      trait(c, NX[k] + 44, y, NX[k + 1] - 44, y, kk, .9, 2);
      if (t > ph0) { const p = ((t - ph0) / per) % 1, q = (p * 4 - k - .5); if (q > 0 && q < 1) impulsion(c, NX[k] + 44, y, NX[k + 1] - 44, y, q, 1); }
    }
    noeuds.forEach(([ic, lab], k) => {
      const tn = t0 + k * .1, e = eBack(seg(t, tn, tn + .35)), a = seg(t, tn, tn + .15);
      if (a <= 0) return;
      const slot = r === 1 && k === 2;
      const x = NX[k];
      let allume = 0; if (t > ph0) { const p = ((t - ph0) / per) % 1; allume = pulse(p * 4, k, .25, .6); }
      if (slot && t < SLOT) { // emplacement vide en pointillés
        c.save(); c.globalAlpha *= a; c.setLineDash([7, 7]); c.strokeStyle = 'rgba(140,203,255,.55)'; c.lineWidth = 2;
        c.beginPath(); c.roundRect(x - 44, y - 44, 88, 88, 24); c.stroke(); c.restore();
        txt(c, '+', x, y - 2, { size: 40, w: 300, col: C.bleuClair, a: a * (.5 + .3 * Math.sin(t * 4)) });
        txt(c, 'Sur mesure', x, y + 72, { size: 18, w: 500, col: C.bleuClair, a: a * .8 });
        return;
      }
      let dx = 0, sc = e;
      if (slot) { const kk = seg(t, SLOT - .45, SLOT); dx = (1 - eOut(kk)) * 520; sc = 1 + .12 * pulse(t, SLOT, .02, .4); }
      c.save(); c.translate(x + dx, y); c.scale(sc, sc); c.globalAlpha *= a;
      c.save(); c.globalCompositeOperation = 'lighter'; lueur(c, 0, 0, 110, '47,140,255', .1 + .45 * allume + (slot ? .5 * pulse(t, SLOT, .02, .9) : 0)); c.restore();
      carte(c, -44, -44, 88, 88, 24, { bord: allume > .3 || slot ? 'rgba(120,180,255,.7)' : 'rgba(190,210,240,.28)' });
      icone(c, ic, 0, 0, 40, allume > .3 ? C.bleuClair : C.blanc, 2.3);
      c.restore();
      txt(c, lab, x + dx, y + 72, { size: 18, w: 500, col: C.argent, a: a * .95, max: 200 });
    });
    // coche de fin de parcours
    if (t > ph0 + per * .95) {
      const p = ((t - ph0) / per) % 1, k = pulse(p, .02, .02, .5);
      c.save(); c.globalAlpha *= clamp(k * 1.4);
      c.beginPath(); c.arc(NX[3] + 40, y - 40, 15, 0, 7); c.fillStyle = C.bleu; c.fill();
      icone(c, 'check', NX[3] + 40, y - 40, 16, C.blanc, 3.2); c.restore();
    }
  });
  c.restore();
  // ligne de lumière du repli
  if (fin > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, bleuA(0)); g.addColorStop(.5, `rgba(200,230,255,${fin})`); g.addColorStop(1, bleuA(0));
    c.fillStyle = g; c.fillRect(0, 899, W, 3); lueur(c, 540, 900, 300, '47,140,255', .4 * fin); c.restore(); }
  // titre
  const aT = 1 - seg(t, 23.0, 23.3);
  const k1 = seg(t, 17.25, 17.7), k2 = seg(t, 17.65, 18.15);
  txt(c, 'DES SOLUTIONS IA', 540, 300 + 12 * (1 - eOut(k1)), { size: 64, w: 300, grad: 'argent', ls: 12, a: eOut(k1) * aT, max: 900 });
  txt(c, 'SUR MESURE', 540, 398 + 12 * (1 - eOut(k2)), { size: 86, w: 600, grad: 'argent', ls: 20, a: eOut(k2) * aT, max: 900, glow: 30 });
  const fl = pulse(t, 17.0, .01, .35) * .55;
  if (fl > 0) { c.fillStyle = `rgba(210,232,255,${fl})`; c.fillRect(0, 0, W, H); }
}

// =====================================================================
// SCÈNE 5 — 24 à 30 s : la signature NEXORA AI
// =====================================================================
const LY = 640, WY = 890;
let calque = null;
function embleme(c, t, x, y, s) {
  const k = seg(t, 24.05, 24.85);
  c.save(); c.translate(x, y); c.scale(s, s);
  c.save(); c.globalCompositeOperation = 'lighter'; lueur(c, 0, 0, 260, '47,140,255', .32 * eOut(k)); c.restore();
  // anneau
  c.lineCap = 'round';
  c.strokeStyle = 'rgba(205,215,230,.55)'; c.lineWidth = 2.5;
  c.beginPath(); c.arc(0, 0, 118, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * eIO(k)); c.stroke();
  // le N, tracé en trois traits reliés comme un réseau
  const P = [[-48, 58], [-48, -58], [48, 58], [48, -58]];
  const L = eIO(seg(t, 24.2, 25.0)) * 3;
  const g = c.createLinearGradient(0, -70, 0, 70); g.addColorStop(0, '#FFFFFF'); g.addColorStop(.45, '#D9DFE7'); g.addColorStop(.6, '#8F99A8'); g.addColorStop(1, '#E7EBF0');
  c.strokeStyle = g; c.lineWidth = 15; c.beginPath(); c.moveTo(...P[0]);
  for (let i = 0; i < 3; i++) { const kk = clamp(L - i); if (kk <= 0) break; c.lineTo(lerp(P[i][0], P[i + 1][0], kk), lerp(P[i][1], P[i + 1][1], kk)); }
  c.stroke();
  // nœuds aux sommets
  P.forEach(([px, py], i) => {
    const a = seg(L, i - .2, i + .1); if (a <= 0) return;
    const bleu = i === 0 || i === 3;
    if (bleu) { c.save(); c.globalCompositeOperation = 'lighter'; lueur(c, px, py, 46, '60,150,255', .8 * a); c.restore(); }
    c.beginPath(); c.arc(px, py, 11 * eBack(a), 0, 7); c.fillStyle = bleu ? '#5BB0FF' : '#FFFFFF'; c.fill();
    c.strokeStyle = '#020306'; c.lineWidth = 3; c.stroke();
  });
  c.restore();
}
function motLogo(c, t) {
  // le nom est dessiné sur un calque, pour que le reflet ne touche que les lettres
  const d = DPR;
  if (!calque) { calque = document.createElement('canvas'); calque.width = Math.round(W * d); calque.height = Math.round(240 * d); }
  const q = calque.getContext('2d');
  q.setTransform(1, 0, 0, 1, 0, 0); q.clearRect(0, 0, calque.width, calque.height); q.setTransform(d, 0, 0, d, 0, 0);
  q.textBaseline = 'middle'; q.textAlign = 'left';
  const s1 = 104, s2 = 104, ls1 = 22, ls2 = 10;
  const w1 = mesure(q, 'NEXORA', s1, 600, ls1), w2 = mesure(q, 'AI', s2, 300, ls2), gap = 30;
  const x0 = 540 - (w1 + gap + w2 - ls2) / 2, y = 120;
  q.font = F(600, s1); q.letterSpacing = ls1 + 'px'; q.fillStyle = argentGrad(q, y, s1); q.fillText('NEXORA', x0, y);
  q.font = F(300, s2); q.letterSpacing = ls2 + 'px';
  const gb = q.createLinearGradient(0, y - s2 / 2, 0, y + s2 / 2); gb.addColorStop(0, '#D6ECFF'); gb.addColorStop(.55, '#4FA8FF'); gb.addColorStop(1, '#2A6FD6');
  q.fillStyle = gb; q.fillText('AI', x0 + w1 + gap, y);
  // reflet argenté qui traverse une seule fois
  const r = seg(t, 25.35, 26.35);
  if (r > 0 && r < 1) {
    q.globalCompositeOperation = 'source-atop';
    const bx = lerp(x0 - 200, x0 + w1 + gap + w2 + 200, eIO(r));
    const g = q.createLinearGradient(bx - 110, 0, bx + 110, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(.5, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    q.fillStyle = g; q.fillRect(0, 0, W, 240); q.globalCompositeOperation = 'source-over';
  }
  // révélation de gauche à droite
  const k = eOut(seg(t, 24.45, 25.25));
  c.save();
  c.beginPath(); c.rect(0, WY - 120, lerp(x0 - 40, x0 + w1 + gap + w2 + 40, k), 240); c.clip();
  c.globalAlpha = seg(t, 24.45, 24.8);
  c.save(); c.shadowColor = 'rgba(47,140,255,.35)'; c.shadowBlur = 40;
  c.drawImage(calque, 0, 0, calque.width, calque.height, 0, WY - 120, W, 240); c.restore();
  c.restore();
  // filet de lumière sous le nom
  const lw = 300 * eOut(seg(t, 24.9, 25.6));
  const gl = c.createLinearGradient(540 - lw, 0, 540 + lw, 0); gl.addColorStop(0, bleuA(0)); gl.addColorStop(.5, bleuA(.85)); gl.addColorStop(1, bleuA(0));
  c.fillStyle = gl; c.fillRect(540 - lw, WY + 82, lw * 2, 2);
}
function scene5(c, t) {
  c.fillStyle = C.noir; c.fillRect(0, 0, W, H);
  // halo bleu qui respire doucement derrière la signature
  const h = seg(t, 24.0, 25.0);
  c.save(); c.globalCompositeOperation = 'lighter';
  lueur(c, 540, 780, 900, '25,80,190', (.2 + .03 * Math.sin(t * 1.6)) * h);
  c.restore();
  poussiere(c, t, .35 * h, -8);
  // ligne de lumière héritée de la scène 4, qui s'ouvre puis s'efface
  const o = seg(t, 24.0, 24.6);
  if (o < 1) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, bleuA(0)); g.addColorStop(.5, `rgba(220,238,255,${1 - o})`); g.addColorStop(1, bleuA(0));
    c.fillStyle = g; c.fillRect(0, lerp(900, LY, eOut(o)) - 1.5, W, 3); c.restore(); }
  embleme(c, t, 540, LY, 1 + .015 * eOut(seg(t, 24, 30)));
  motLogo(c, t);
  // promesse
  const k1 = seg(t, 25.7, 26.3);
  txt(c, "L'intelligence qui fait avancer", 540, 1030 + 10 * (1 - eOut(k1)), { size: 40, w: 300, col: C.blanc, a: eOut(k1) * .92, ls: 1 });
  txt(c, 'votre entreprise.', 540, 1084 + 10 * (1 - eOut(k1)), { size: 40, w: 300, col: C.blanc, a: eOut(k1) * .92, ls: 1 });
  // appel à l'action
  const k2 = seg(t, 27.55, 28.0);
  if (k2 > 0) {
    c.save(); c.globalAlpha = eOut(k2); c.translate(0, 16 * (1 - eOut(k2)));
    const bw = 720, bh = 92, bx = 540 - bw / 2, by = 1210;
    c.save(); c.globalCompositeOperation = 'lighter'; lueur(c, 540, by + bh / 2, 380, '47,140,255', .22 + .06 * Math.sin(t * 3)); c.restore();
    c.beginPath(); c.roundRect(bx, by, bw, bh, bh / 2);
    const g = c.createLinearGradient(bx, by, bx, by + bh); g.addColorStop(0, '#3B97FF'); g.addColorStop(1, '#1D5FCC'); c.fillStyle = g; c.fill();
    c.lineWidth = 2; c.strokeStyle = 'rgba(210,232,255,.7)'; c.stroke();
    // reflet qui passe sur le bouton
    const r = seg(t, 28.0, 28.7);
    if (r > 0 && r < 1) { c.save(); c.clip(); const rx = lerp(bx - 100, bx + bw + 100, r); const gr = c.createLinearGradient(rx - 80, 0, rx + 80, 0);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(bx, by, bw, bh); c.restore(); }
    txt(c, 'Réservez votre diagnostic gratuit', 520, by + bh / 2 + 1, { size: 33, w: 600, col: C.blanc, max: 580 });
    c.strokeStyle = C.blanc; c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath();
    c.moveTo(bx + bw - 62, by + bh / 2); c.lineTo(bx + bw - 38, by + bh / 2); c.moveTo(bx + bw - 48, by + bh / 2 - 10); c.lineTo(bx + bw - 38, by + bh / 2); c.lineTo(bx + bw - 48, by + bh / 2 + 10); c.stroke();
    c.restore();
  }
}

// =====================================================================
// sous-titres, grain, vignette
// =====================================================================
function sousTitres(c, t) {
  const L = window.SOUS_TITRES || [];
  // bande sombre douce derrière les sous-titres, quand une ligne est affichée
  const on = L.some(([a, bb]) => t > a - .1 && t < bb + .3);
  if (on) { const g = c.createLinearGradient(0, 1300, 0, 1530); g.addColorStop(0, 'rgba(2,3,6,0)'); g.addColorStop(.35, 'rgba(2,3,6,.62)'); g.addColorStop(.65, 'rgba(2,3,6,.62)'); g.addColorStop(1, 'rgba(2,3,6,0)'); c.fillStyle = g; c.fillRect(0, 1300, W, 230); }
  for (const [a, b, s] of L) {
    const tf = b + .25; // le carton reste un peu après la fin du mot
    if (t < a - .05 || t > tf) continue;
    const al = Math.min(seg(t, a - .05, a + .1), 1 - seg(t, tf - .12, tf));
    c.save(); c.font = F(600, 44); c.letterSpacing = '0.5px';
    const lignes = coupe(c, s, 860);
    // mot en cours en blanc plein, mots à venir plus discrets
    const prog = seg(t, a, b) * s.length;
    let n = 0;
    lignes.forEach((l, i) => {
      const y = 1415 + (i - (lignes.length - 1) / 2) * 58;
      const mots = l.split(' '); let x = 540 - c.measureText(l).width / 2;
      c.textAlign = 'left'; c.textBaseline = 'middle';
      for (const m of mots) {
        const dit = n <= prog;
        c.globalAlpha = al * (dit ? 1 : .5);
        c.shadowColor = 'rgba(0,0,0,.85)'; c.shadowBlur = 16;
        c.fillStyle = dit ? C.blanc : '#C9D1DC'; c.fillText(m, x, y);
        x += c.measureText(m + ' ').width; n += m.length + 1;
      }
    });
    c.restore();
  }
}
const grain = document.createElement('canvas'); grain.width = grain.height = 256;
{ const g = grain.getContext('2d'), im = g.createImageData(256, 256), r = rng(99);
  for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() - .5) * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  g.putImageData(im, 0, 0); }
let motif = null;
function finition(c, t) {
  // vignette
  const g = c.createRadialGradient(540, 900, 500, 540, 960, 1250);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // grain très léger
  if (!motif) motif = c.createPattern(grain, 'repeat');
  c.save(); c.globalAlpha = .035; c.globalCompositeOperation = 'overlay';
  const f = Math.floor(t * 30), r = rng(f + 1);
  c.translate(-r() * 256, -r() * 256); c.fillStyle = motif; c.fillRect(0, 0, W + 512, H + 512); c.restore();
}

function rendu(c, t) {
  if (t < 5) scene1(c, t);
  else if (t < 10) scene2(c, t);
  else if (t < 17) scene3(c, t);
  else if (t < 24) scene4(c, t);
  else scene5(c, t);
  if (ST) sousTitres(c, t);
  finition(c, t);
}
window.draw = t => { ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; rendu(ctx, t); };
window.pret = document.fonts.load('600 40px Montserrat').then(() => Promise.all([300, 400, 500, 700].map(w => document.fonts.load(`${w} 40px Montserrat`)))).then(() => { window.draw(0); return true; });
