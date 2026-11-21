/* ICON Events (Dubai) — vidéo de présentation en anglais, 23 s, 9:16, sans son.
   Accroche → révélation du logo → 3 concepts (ICON EVENTS, ICON BIRTHDAY, ICON SHOW) → services 7/7 → contact.
   Motion design luxe : chocolat, or, crème, silhouette de Dubaï, icônes dorées qui se dessinent. */
'use strict';
const IC_DUREE = 23;
const CH = '#2a140d', CH2 = '#140906', GOLD = '#c9a45c', GOLD2 = '#f0d9a2', CREAM = '#f3e6d3';

function fond(c, t) {
  const g = c.createRadialGradient(540, 760, 60, 540, 960, 1350); g.addColorStop(0, '#3a1d12'); g.addColorStop(.6, CH); g.addColorStop(1, CH2);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // poussières dorées
  const r = rng(3);
  for (let i = 0; i < 46; i++) { const x = r() * W, y = (r() * H - t * (8 + r() * 18)) % H, a = .15 + .35 * (.5 + .5 * Math.sin(t * 2 + i));
    c.fillStyle = `rgba(240,217,162,${a})`; c.beginPath(); c.arc(x, y < 0 ? y + H : y, .8 + r() * 2.2, 0, 7); c.fill(); }
}
// silhouette de Dubaï (dont la tour la plus haute) en filet doré
function skyline(c, a) {
  if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.strokeStyle = 'rgba(201,164,92,.55)'; c.lineWidth = 2.5; c.fillStyle = 'rgba(20,9,6,.6)';
  const b = 1780, pts = [[0, b], [0, b - 90], [60, b - 90], [60, b - 150], [120, b - 150], [120, b - 110], [170, b - 110], [170, b - 210], [210, b - 230], [250, b - 210], [250, b - 120],
    [330, b - 120], [330, b - 260], [370, b - 280], [370, b - 150], [430, b - 150], [430, b - 330], [470, b - 330],
    [490, b - 420], [505, b - 520], [518, b - 640], [530, b - 820], [540, b - 980], [550, b - 820], [562, b - 640], [575, b - 520], [590, b - 420],
    [610, b - 330], [650, b - 330], [650, b - 190], [720, b - 190], [720, b - 300], [760, b - 360], [800, b - 300], [800, b - 140], [880, b - 140],
    [880, b - 240], [930, b - 240], [930, b - 120], [1000, b - 120], [1000, b - 180], [1080, b - 180], [1080, b]];
  c.beginPath(); pts.forEach(([x, y], i) => { const yy = b - (b - y) * .5; i ? c.lineTo(x, yy) : c.moveTo(x, yy); }); c.closePath(); c.fill(); c.stroke();
  const g = c.createLinearGradient(0, b - 40, 0, H); g.addColorStop(0, 'rgba(20,9,6,.8)'); g.addColorStop(1, CH2); c.fillStyle = g; c.fillRect(0, b, W, H - b);
  c.restore();
}
function txt(c, s, x, y, o) {
  c.save(); c.globalAlpha = o.a == null ? 1 : o.a; c.textAlign = o.align || 'center'; c.textBaseline = 'middle';
  c.font = `${o.style || ''} ${o.w || 400} ${o.size}px ${o.serif ? '"Playfair Display"' : 'Montserrat'}`; c.letterSpacing = (o.ls || 0) + 'px';
  if (o.grad) { const g = c.createLinearGradient(0, y - o.size / 2, 0, y + o.size / 2); g.addColorStop(0, '#fff3d6'); g.addColorStop(.55, GOLD2); g.addColorStop(1, '#b88a3e'); c.fillStyle = g; }
  else c.fillStyle = o.col || CREAM;
  if (o.glow) { c.shadowColor = 'rgba(240,217,162,.45)'; c.shadowBlur = o.glow; }
  c.fillText(s, x + (o.align ? 0 : (o.ls || 0) / 2), y); c.restore();
}
const app = (t, a, b, d = .35) => clamp(Math.min((t - a) / d, (b - t) / .25));
const mont = (t, a, d = .45) => eOut(seg(t, a, a + d));

// le logo, reconstitué : disque chocolat, cercle doré, ICON et — EVENTS —
function logoIcon(c, x, y, r, k, t) {
  c.save(); c.translate(x, y);
  c.globalAlpha = clamp(k * 1.5);
  const g = c.createRadialGradient(-r * .3, -r * .3, r * .1, 0, 0, r); g.addColorStop(0, '#4a2417'); g.addColorStop(1, '#1c0b06');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill();
  c.strokeStyle = GOLD; c.lineWidth = r * .03; c.beginPath(); c.arc(0, 0, r * .965, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * eIO(clamp(k))); c.stroke();
  c.globalAlpha = clamp((k - .35) * 2);
  c.font = `500 ${r * .48}px "Playfair Display"`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.letterSpacing = `${r * .02 + (1 - clamp(k)) * 40}px`;
  c.fillStyle = CREAM; c.fillText('ICON', r * .01, -r * .04);
  c.globalAlpha = clamp((k - .6) * 2.5); c.letterSpacing = `${r * .05}px`; c.font = `500 ${r * .095}px Montserrat`; c.fillStyle = GOLD2;
  c.fillText('EVENTS', r * .025, r * .24);
  c.strokeStyle = GOLD2; c.lineWidth = 2; c.beginPath(); c.moveTo(-r * .55, r * .24); c.lineTo(-r * .27, r * .24); c.moveTo(r * .27, r * .24); c.lineTo(r * .55, r * .24); c.stroke();
  // reflet qui passe
  const sx = lerp(-r * 1.6, r * 1.6, seg(t, 3.4, 4.6));
  c.globalAlpha = 1; c.save(); c.beginPath(); c.arc(0, 0, r, 0, 7); c.clip(); c.globalCompositeOperation = 'lighter';
  const sg = c.createLinearGradient(sx - r * .4, -r, sx + r * .4, r); sg.addColorStop(0, 'rgba(255,230,180,0)'); sg.addColorStop(.5, 'rgba(255,230,180,.22)'); sg.addColorStop(1, 'rgba(255,230,180,0)');
  c.fillStyle = sg; c.fillRect(-r, -r, 2 * r, 2 * r); c.restore();
  c.restore();
}

// icônes dorées dessinées progressivement (k de 0 à 1)
function trace(c, k, f) { c.save(); c.setLineDash([1400, 1400]); c.lineDashOffset = 1400 * (1 - clamp(k)); c.strokeStyle = GOLD2; c.lineWidth = 4; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); f(c); c.stroke(); c.restore(); }
const ICONES = {
  poussette: c => { c.arc(-30, 40, 16, 0, 7); c.moveTo(46, 40); c.arc(30, 40, 16, 0, 7); c.moveTo(-50, -10); c.lineTo(50, -10); c.arc(0, -10, 50, 0, Math.PI); c.moveTo(0, -10); c.lineTo(0, -60); c.arc(0, -10, 50, -Math.PI / 2, 0); c.moveTo(50, -10); c.lineTo(70, -40); },
  bagues: c => { c.arc(-20, 15, 34, 0, 7); c.moveTo(58, 15); c.arc(24, 15, 34, 0, 7); c.moveTo(-28, -22); c.lineTo(-20, -36); c.lineTo(-12, -22); },
  coupes: c => { c.moveTo(-50, -50); c.lineTo(-20, -50); c.lineTo(-28, 0); c.lineTo(-42, 0); c.closePath(); c.moveTo(-35, 0); c.lineTo(-35, 45); c.moveTo(-50, 45); c.lineTo(-20, 45);
    c.moveTo(20, -50); c.lineTo(50, -50); c.lineTo(42, 0); c.lineTo(28, 0); c.closePath(); c.moveTo(35, 0); c.lineTo(35, 45); c.moveTo(20, 45); c.lineTo(50, 45); c.moveTo(-10, -70); c.lineTo(0, -60); c.lineTo(10, -70); },
  ballon: c => { c.ellipse(0, -20, 38, 48, 0, 0, 7); c.moveTo(-6, 28); c.lineTo(6, 28); c.lineTo(0, 34); c.closePath(); c.moveTo(0, 34); c.bezierCurveTo(-14, 52, 14, 62, 0, 80); },
  gateau: c => { c.rect(-50, 0, 100, 40); c.rect(-36, -30, 72, 30); c.moveTo(0, -30); c.lineTo(0, -54); c.moveTo(0, -60); c.quadraticCurveTo(8, -68, 0, -76); c.quadraticCurveTo(-8, -68, 0, -60); c.moveTo(-50, 14); c.quadraticCurveTo(-25, 24, 0, 14); c.quadraticCurveTo(25, 24, 50, 14); },
  cadeau: c => { c.rect(-44, -14, 88, 60); c.rect(-50, -32, 100, 18); c.moveTo(0, -32); c.lineTo(0, 46); c.moveTo(0, -32); c.bezierCurveTo(-30, -62, -40, -30, 0, -32); c.bezierCurveTo(30, -62, 40, -30, 0, -32); },
  projecteur: c => { c.moveTo(-60, 60); c.lineTo(-10, -50); c.lineTo(10, -50); c.lineTo(60, 60); c.moveTo(-20, -50); c.lineTo(20, -50); c.lineTo(14, -70); c.lineTo(-14, -70); c.closePath(); c.moveTo(-60, 60); c.quadraticCurveTo(0, 80, 60, 60); },
  micro: c => { c.roundRect(-18, -60, 36, 60, 18); c.moveTo(-34, -20); c.quadraticCurveTo(-34, 24, 0, 24); c.quadraticCurveTo(34, 24, 34, -20); c.moveTo(0, 24); c.lineTo(0, 54); c.moveTo(-24, 54); c.lineTo(24, 54); },
  etoile: c => { for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? 26 : 62; i ? c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : c.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); } },
};
function rangeeIcones(c, t, t0, noms, y) {
  noms.forEach((n, i) => { const x = 540 + (i - (noms.length - 1) / 2) * 300, k = seg(t, t0 + i * .25, t0 + i * .25 + .8);
    if (k <= 0) return; c.save(); c.translate(x, y); c.globalAlpha = .9; trace(c, k, ICONES[n]); c.restore(); });
}

// une carte « concept »
function concept(c, t, a, b, num, titre, ligne1, ligne2, icones) {
  if (t < a - .3 || t > b + .3) return;
  const al = app(t, a, b, .3);
  c.save(); c.globalAlpha = al;
  txt(c, num, 540, 470, { size: 30, w: 600, ls: 14, col: GOLD, a: mont(t, a) });
  // titre qui s'ouvre en lettres espacées
  const k = mont(t, a + .1, .6);
  txt(c, titre, 540, 600, { size: 100, w: 500, serif: true, ls: lerp(30, 8, k), grad: true, a: k, glow: 30 });
  c.strokeStyle = GOLD; c.lineWidth = 2.5; const lw = 380 * mont(t, a + .4, .6); c.beginPath(); c.moveTo(540 - lw / 2, 690); c.lineTo(540 + lw / 2, 690); c.stroke();
  rangeeIcones(c, t, a + .5, icones, 930);
  txt(c, ligne1, 540, 1160, { size: 44, w: 500, a: mont(t, a + .9) });
  txt(c, ligne2, 540, 1230, { size: 30, w: 400, ls: 4, col: GOLD2, a: mont(t, a + 1.2) });
  c.restore();
}

function icDraw(t) {
  const c = ctx; c.setTransform(DPR, 0, 0, DPR, 0, 0);
  fond(c, t);
  skyline(c, t > 2.2 && t < 21 ? clamp((t - 2.4) / .8) * .9 : t >= 21 ? .9 : 0);

  // 1. l'accroche
  if (t < 2.6) {
    const a1 = app(t, .1, 2.5);
    txt(c, 'Planning an event', 540, 760, { size: 78, serif: true, style: 'italic', w: 500, a: a1 * mont(t, .1) });
    txt(c, 'in Dubai?', 540, 860, { size: 78, serif: true, style: 'italic', w: 500, grad: true, a: a1 * mont(t, .45), glow: 24 });
    txt(c, "Don't know which agency", 540, 1010, { size: 50, w: 600, a: a1 * mont(t, 1.0) });
    txt(c, 'to trust?', 540, 1075, { size: 50, w: 600, col: GOLD2, a: a1 * mont(t, 1.25) });
  }
  // 2. le logo
  if (t >= 2.4 && t < 5.1) {
    const al = app(t, 2.4, 5.1);
    c.save(); c.globalAlpha = al; logoIcon(c, 540, 820, 250 * lerp(.85, 1, mont(t, 2.5, .8)), seg(t, 2.5, 3.8), t); c.restore();
    txt(c, 'Not just an event.', 540, 1180, { size: 50, serif: true, style: 'italic', w: 500, a: al * mont(t, 3.6) });
    txt(c, 'An experience.', 540, 1255, { size: 50, serif: true, style: 'italic', w: 500, grad: true, a: al * mont(t, 4.0), glow: 20 });
  }
  // 3. les trois concepts
  concept(c, t, 5.3, 9.0, '01', 'ICON EVENTS', 'Baby showers · Engagements', 'BRIDAL SHOWERS · PRIVATE CELEBRATIONS', ['poussette', 'bagues', 'coupes']);
  concept(c, t, 9.2, 12.9, '02', 'ICON BIRTHDAY', 'Birthdays they will never forget', 'KIDS · 18TH · 21ST · MILESTONES · SURPRISES', ['ballon', 'gateau', 'cadeau']);
  concept(c, t, 13.1, 16.8, '03', 'ICON SHOW', 'For brands & businesses', 'LAUNCHES · POP-UPS · CORPORATE · VIP NIGHTS', ['projecteur', 'micro', 'etoile']);
  // 4. le service
  if (t > 16.9 && t < 20.3) {
    const al = app(t, 17.0, 20.3);
    const k = eBack(seg(t, 17.0, 17.4));
    c.save(); c.globalAlpha = al; c.translate(540, 640); c.scale(k, k);
    txt(c, '7/7', 0, 0, { size: 230, w: 800, grad: true, glow: 40 }); c.restore();
    txt(c, 'WE ARE HERE FOR YOU, EVERY DAY', 540, 790, { size: 30, w: 600, ls: 6, col: GOLD2, a: al * mont(t, 17.4) });
    ['Concept & design', 'Décor, florals & balloons', 'Full planning & coordination', 'Fully bespoke, any budget'].forEach((s, i) => {
      const a = al * mont(t, 17.7 + i * .3);
      c.save(); c.globalAlpha = a; c.fillStyle = GOLD; c.beginPath(); c.arc(250, 930 + i * 90, 7, 0, 7); c.fill(); c.restore();
      txt(c, s, 285, 930 + i * 90, { size: 42, w: 500, align: 'left', a });
    });
  }
  // 5. contact
  if (t > 20.1) {
    const k = seg(t, 20.2, 21.2);
    logoIcon(c, 540, 640, 200, clamp(k * 1.4), t + 17);
    txt(c, 'Curating unforgettable moments.', 540, 930, { size: 50, serif: true, style: 'italic', w: 500, a: mont(t, 20.8) });
    txt(c, 'LUXURY EVENTS & BESPOKE CELEBRATIONS', 540, 1010, { size: 26, w: 600, ls: 5, col: GOLD2, a: mont(t, 21.1) });
    const kb = eBack(seg(t, 21.4, 21.75)), beat = 1 + .03 * Math.max(0, Math.sin((t - 21.7) * Math.PI * 3));
    c.save(); c.translate(540, 1170); c.scale(kb * beat, kb * beat);
    const bg = c.createLinearGradient(0, -56, 0, 56); bg.addColorStop(0, '#f2d892'); bg.addColorStop(1, '#b8893c');
    c.fillStyle = bg; c.beginPath(); c.roundRect(-330, -56, 660, 112, 56); c.fill();
    c.fillStyle = CH; c.font = '800 38px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('DM US TO BOOK ✨', 0, 3); c.restore();
    txt(c, '@iconeventsofficiel · Dubai, UAE', 540, 1290, { size: 32, w: 600, a: mont(t, 21.7) });
  }
  // éclats dorés entre les parties
  for (const m of [2.5, 5.2, 9.1, 13.0, 16.9, 20.2]) { const f = pulse(t, m, .04, .3); if (f) { c.fillStyle = `rgba(255,232,190,${f * .35})`; c.fillRect(0, 0, W, H); } }
  const v = c.createRadialGradient(540, 960, 600, 540, 960, 1300); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.45)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
}

window.DUREE = IC_DUREE;
window.draw = icDraw;
window.pret = (async () => { await window.pret; await document.fonts.load('italic 500 40px "Playfair Display"', 'A'); icDraw(0); return true; })();
