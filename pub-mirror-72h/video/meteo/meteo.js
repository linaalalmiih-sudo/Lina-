/* « Le bulletin météo capillaire » : alerte frisottis, présentatrice météo, carte de France, Mirror 72H = l'éclaircie.
   22 s, 9:16, sans aucun son (voix à poser avec ElevenLabs). Réutilise ../scene/scene.js et ../bd/duo.js. */
'use strict';
const MT_DUREE = 22;

// [qui, texte, début, fin]
const MT_LIGNES = [
  ['voix', 'ALERTE FRISOTTIS. Humidité : 90 %.', 0.2, 2.5],
  ['fille', 'Flash spécial : alerte frisottis rouge sur toute la France !', 3.0, 7.2],
  ['fille', "Encore ?! J'ai passé une heure à me coiffer…", 7.8, 11.0],
  ['fille', 'Mais bonne nouvelle : une éclaircie arrive !', 11.4, 13.9],
  ['mirror', "Moi, c'est Mirror 72H : je protège ton brushing de l'humidité jusqu'à 72h*.", 14.0, 16.9],
  ['fille', 'Gardez vos brushings… on se retrouve dans 72h ! 😉', 17.4, 21.6],
];
window.MT_LIGNES = MT_LIGNES;
const mtParle = (t, i) => talk(t, MT_LIGNES[i][2], MT_LIGNES[i][3]);
function mtBulle(c, t, i, y, o = {}) {
  const [qui, txt, a, b] = MT_LIGNES[i];
  bubble(c, t, qui === 'mirror' ? 'mirror' : 'fille', txt, a, b, y, o);
}

// carte de France simplifiée
const FRANCE = [[.35, 0], [.55, .05], [.68, .12], [.86, .2], [.96, .34], [.88, .5], [.92, .65], [.98, .8], [.86, .92], [.66, .88],
  [.55, .98], [.4, .92], [.3, .95], [.22, .85], [.26, .6], [.18, .45], [0, .36], [.05, .28], [.2, .3], [.28, .15]];
const VILLES = [['Lille', .55, .07], ['Paris', .53, .27], ['Strasbourg', .86, .3], ['Rennes', .24, .36], ['Lyon', .72, .6], ['Bordeaux', .3, .7], ['Marseille', .76, .87]];
const MAP = { x: 230, y: 340, w: 620, h: 620 };
const mp = (u, v) => [MAP.x + u * MAP.w, MAP.y + v * MAP.h];

function nuage(c, x, y, s, frizz, a) {
  c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
  c.fillStyle = '#6f7a88'; c.beginPath(); c.arc(-26, 6, 26, 0, 7); c.arc(4, -10, 32, 0, 7); c.arc(34, 6, 24, 0, 7); c.rect(-26, 6, 60, 26); c.fill();
  if (frizz) { c.strokeStyle = '#5a3b26'; c.lineWidth = 3; c.lineCap = 'round';
    for (let i = 0; i < 7; i++) { c.beginPath(); let px = -24 + i * 9, py = 34; c.moveTo(px, py);
      for (let k = 0; k < 5; k++) { px += Math.sin(k * 2 + i) * 6; py += 6; c.lineTo(px, py); } c.stroke(); } }
  c.restore();
}
function soleil(c, x, y, s, a) {
  c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s);
  c.strokeStyle = '#f6b93b'; c.lineWidth = 5; c.lineCap = 'round';
  for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4; c.beginPath(); c.moveTo(Math.cos(an) * 30, Math.sin(an) * 30); c.lineTo(Math.cos(an) * 42, Math.sin(an) * 42); c.stroke(); }
  const g = c.createRadialGradient(-6, -6, 2, 0, 0, 24); g.addColorStop(0, '#fff3b0'); g.addColorStop(1, '#f6b93b');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, 22, 0, 7); c.fill(); c.restore();
}
function etiquette(c, x, y, txt, col, a) {
  c.save(); c.globalAlpha = a; c.font = F(900, 24); const w = c.measureText(txt).width + 18;
  c.fillStyle = col; c.beginPath(); c.roundRect(x - w / 2, y - 17, w, 34, 10); c.fill();
  c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, x, y + 1); c.restore();
}

function studio(c, t, eclaircie, sansTitre) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0d2a52'); g.addColorStop(1, '#1e4f8f');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.save(); c.globalAlpha = .12; c.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(540, -100); c.lineTo(-200 + i * 300, H); c.lineTo(-120 + i * 300, H); c.closePath(); c.fill(); } c.restore();
  // écran avec la carte
  c.fillStyle = '#0a1a33'; c.beginPath(); c.roundRect(50, 270, 980, 760, 30); c.fill();
  c.strokeStyle = 'rgba(160,200,255,.5)'; c.lineWidth = 4; c.stroke();
  const mer = c.createLinearGradient(0, 280, 0, 1020); mer.addColorStop(0, '#2f6fb3'); mer.addColorStop(1, '#245a95');
  c.save(); c.beginPath(); c.roundRect(60, 280, 960, 740, 24); c.clip(); c.fillStyle = mer; c.fillRect(60, 280, 960, 740);
  const pts = catmull(FRANCE.map(([u, v]) => mp(u, v)), 6, true);
  c.fillStyle = eclaircie > .5 ? '#7fbf6a' : '#8fa37f'; poly(c, pts); c.fill(); c.strokeStyle = '#eef4e8'; c.lineWidth = 4; poly(c, pts); c.stroke();
  // pluie sur la carte tant qu'il n'y a pas d'éclaircie
  if (eclaircie < 1) { c.save(); c.globalAlpha = 1 - eclaircie; rain(c, t, 40, 5, .45, 900, 34); c.restore(); }
  VILLES.forEach(([nom, u, v], i) => {
    const [x, y] = mp(u, v);
    c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill();
    c.save(); c.font = F(700, 20); c.fillStyle = '#fff'; c.textAlign = 'center'; c.fillText(nom, x, y + 28); c.restore();
    const apparait = eBack(seg(t, 3.0 + i * .2, 3.3 + i * .2));
    const bascule = clamp((eclaircie - i * .1) / .3);
    nuage(c, x, y - 48, .9 * apparait * (1 - bascule), true, 1);
    if (apparait * (1 - bascule) > .5) etiquette(c, x + 52, y - 66, '90 %', '#c0392b', 1);
    if (bascule > 0) { soleil(c, x, y - 50, .95 * eBack(bascule), 1); etiquette(c, x + 54, y - 68, '72H', '#d4a017', bascule); }
  });
  c.restore();
  // logo de la chaîne et heure
  if (!sansTitre) {
  c.save(); c.fillStyle = '#c0392b'; c.beginPath(); c.roundRect(70, 200, 230, 54, 12); c.fill();
  c.fillStyle = '#fff'; c.font = F(900, 28); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('MÉTÉO CHEVEUX', 185, 228);
  c.fillStyle = 'rgba(255,255,255,.9)'; c.font = F(800, 28); c.textAlign = 'right'; c.fillText('07:30', 1000, 228); c.restore();
  }
}

// bandeau « flash spécial » et défilant
function bandeau(c, t, eclaircie) {
  const rouge = eclaircie < .5;
  c.fillStyle = rouge ? '#c0392b' : '#b8893c'; c.fillRect(0, 1555, 360, 56);
  c.fillStyle = '#fff'; c.font = F(900, 28); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(rouge ? 'FLASH SPÉCIAL' : 'BONNE NOUVELLE', 180, 1584);
  c.fillStyle = 'rgba(10,20,40,.9)'; c.fillRect(360, 1555, 720, 56);
  const msg = rouge ? 'ALERTE FRISOTTIS ROUGE · HUMIDITÉ 90 % · BRUSHINGS EN DANGER · ' : 'ÉCLAIRCIE : MIRROR 72H · ANTI-FRISOTTIS · ANTI-HUMIDITÉ JUSQU\'À 72H* · ';
  c.save(); c.beginPath(); c.rect(360, 1555, 720, 56); c.clip(); c.font = F(800, 26); c.fillStyle = '#fff'; c.textAlign = 'left';
  const w = c.measureText(msg).width, off = (t * 160) % w; for (let k = -1; k < 3; k++) c.fillText(msg, 380 - off + k * w, 1584); c.restore();
}

function presentatrice(c, t, i, expr) {
  woman(c, { t, x: 790, y: 1290, s: 1.05, frizz: 0, expr, talk: i == null ? 0 : mtParle(t, i), coat: '#b0273a', sweep: (t * .3) % 1, shine: 1, look: -.5, blink: pulse(t, 5.2, .05, .1) + pulse(t, 15.5, .05, .1) });
  // bras qui montre la carte
  c.strokeStyle = '#d39a7a'; c.lineWidth = 34; c.lineCap = 'round'; c.beginPath(); c.moveTo(600, 1360); c.lineTo(500, 1180); c.stroke();
  c.fillStyle = '#e3a988'; c.beginPath(); c.arc(496, 1170, 22, 0, 7); c.fill();
}

function mtScene(c, t) {
  if (t < 2.6) { // l'alerte
    const fl = .5 + .5 * Math.sin(t * 14);
    c.fillStyle = `rgb(${120 + 60 * fl},${18 + 10 * fl},${22})`; c.fillRect(0, 0, W, H);
    c.save(); c.globalAlpha = .18; c.strokeStyle = '#fff'; c.lineWidth = 40; for (let i = -4; i < 12; i++) { c.beginPath(); c.moveTo(i * 160, 0); c.lineTo(i * 160 + 600, H); c.stroke(); } c.restore();
    // notification
    const k = eOut(seg(t, .05, .4)); c.save(); c.translate(0, (1 - k) * -300);
    c.fillStyle = 'rgba(245,245,247,.97)'; c.beginPath(); c.roundRect(60, 180, 960, 190, 34); c.fill();
    c.fillStyle = '#c0392b'; c.beginPath(); c.roundRect(96, 214, 72, 72, 18); c.fill(); c.font = '44px "Noto Color Emoji"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('⚠️', 132, 252);
    c.textAlign = 'left'; c.fillStyle = '#111'; c.font = F(800, 30); c.fillText('MÉTÉO CHEVEUX', 192, 236); c.fillStyle = '#666'; c.font = F(500, 24); c.textAlign = 'right'; c.fillText('maintenant', 990, 236);
    c.textAlign = 'left'; c.fillStyle = '#111'; c.font = F(700, 32); c.fillText('⚠️ Alerte frisottis : humidité 90 % aujourd\'hui.', 96, 320); c.restore();
    c.save(); camera(c, t, 1, 540, 960, 10);
    punch(c, t, '🚨 ALERTE 🚨', .5, 2.6, 820, { size: 120, color: '#fff' });
    punch(c, t, 'FRISOTTIS', .8, 2.6, 980, { size: 150, color: '#ffe4a8' });
    punch(c, t, 'Humidité : 90 %', 1.3, 2.6, 1140, { size: 64, color: '#fff' });
    c.restore();
  } else if (t < 7.4) { // le bulletin
    c.save(); camera(c, t, 1 + .03 * seg(t, 2.6, 7.4), 540, 900, 2);
    studio(c, t, 0); presentatrice(c, t, 1, 'shock'); c.restore();
    bandeau(c, t, 0); mtBulle(c, t, 1, 1060, { x: 330, tail: 520, maxW: 540, size: 42 });
  } else if (t < 11.2) { // dans la rue : tout gonfle
    const P = 9.0;
    c.save(); camera(c, t, 1.02 + .05 * pulse(t, P, .05, .4), 540, 900, 5 + 16 * pulse(t, P, .03, .35));
    rue(c, t); woman(c, { t, x: 540, y: 1000, s: 1.5, frizz: eIn(seg(t, 7.4, P)) + .35 * pulse(t, P, .06, .5), expr: t < 8.2 ? 'neutral' : 'angry', talk: mtParle(t, 2), coat: '#9c6b45', coatWet: true, drips: true });
    rain(c, t, 60, 4, .5, 1900, 90); c.restore();
    punch(c, t, 'PRÉVISION : CHEVEUX EN NUAGE ☁️', 7.5, 11.1, 220, { size: 52, pill: '#2b3a55', border: '#9fb4d8', color: '#fff' });
    mtBulle(c, t, 2, 1420);
  } else if (t < 17) { // l'éclaircie
    const ecl = eIO(seg(t, 13.0, 14.4));
    c.save(); camera(c, t, 1.0, 540, 900, 2);
    studio(c, t, ecl);
    if (t > 11.9) { const k = eBack(seg(t, 11.9, 12.25));
      tube(c, { x: 540, y: 620, s: .42 * k, shadow: false, sweep: seg(t, 12, 13.2) * 1.4 - .2, face: tubeFace(t, { lx: .2, smile: .9, talk: mtParle(t, 4), wink: t > 16.3 && t < 16.7 ? 1 : 0 }) });
      const r = rng(9); for (let i = 0; i < 10; i++) { const a = r() * 7, d = 140 + r() * 160, kk = seg(t, 11.9 + r() * .3, 12.8 + r() * .3); sparkle(c, 540 + Math.cos(a) * d, 620 + Math.sin(a) * d, 14 + r() * 18, Math.sin(kk * Math.PI), kk * 2); } }
    presentatrice(c, t, t < 14 ? 3 : null, 'happy'); c.restore();
    bandeau(c, t, ecl);
    mtBulle(c, t, 3, 1060, { x: 330, tail: 520, maxW: 540, size: 42 });
    mtBulle(c, t, 4, 1080, { tailUp: true, tail: 540 });
  } else { // la conclusion
    c.save(); studio(c, t, 1, true);
    tube(c, { x: 540, y: 640, s: .42, shadow: false, sweep: ((t - 17) * .5) % 1.6 - .3, face: tubeFace(t, { smile: 1, lx: .2, wink: t > 21.2 ? 1 : 0 }) });
    presentatrice(c, t, 5, 'happy'); c.restore();
    bandeau(c, t, 1);
    punch(c, t, 'PRÉVISIONS : 72H* DE BEAU TEMPS', 17.1, 22, 175, { size: 44, pill: '#b8893c', border: '#fff3d0', color: '#2a1712' });
    punch(c, t, 'SUR TES CHEVEUX ☀️', 17.3, 22, 245, { size: 44, pill: '#b8893c', border: '#fff3d0', color: '#2a1712', rot: .02 });
    mtBulle(c, t, 5, 1060, { x: 330, tail: 520, maxW: 540, size: 42 });
    if (t > 18.0) { const a = eOut(seg(t, 18.0, 18.4)); c.save(); c.globalAlpha = a;
      c.fillStyle = 'rgba(255,250,240,.96)'; c.beginPath(); c.roundRect(140, 1440, 800, 96, 48); c.fill();
      c.fillStyle = '#2a1712'; c.font = F(800, 38); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Dispo sur www.glossbyk.com 👇', 540, 1490); c.restore(); }
    c.save(); c.globalAlpha = eOut(seg(t, 17.2, 17.5)); c.font = F(600, 21); c.textAlign = 'center'; c.fillStyle = '#fff';
    c.fillText('*Selon le type de cheveux, le coiffage et la météo.', 540, 1645); c.restore();
  }
}

function mtDraw(t) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  mtScene(ctx, t);
  for (const m of [2.6, 7.4, 11.2, 17.0]) { const fl = pulse(t, m, .01, .25); if (fl) { ctx.fillStyle = `rgba(255,255,255,${fl * .7})`; ctx.fillRect(0, 0, W, H); } }
}

window.DUREE = MT_DUREE;
window.draw = mtDraw;
window.pret = (async () => { await window.pret; mtDraw(0); return true; })();
