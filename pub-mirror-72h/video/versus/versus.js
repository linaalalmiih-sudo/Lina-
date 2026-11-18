/* « Elle vs Elle » : écran partagé, même fille, même brushing, même pluie. À gauche sans le Duo, à droite avec.
   Compteur 0H → 72H*, puis révélation du Duo Iconic et précommande. 35 s, 9:16, sans aucun son.
   Réutilise ../scene/scene.js (personnages, bulles) et ../bd/duo.js (jelly, rue, fin). */
'use strict';
const VS_DUREE = 35;

// [qui, texte, début, fin, côté] — côté : 'g' gauche, 'd' droite, 'c' centre
const VS_LIGNES = [
  ['voix', 'Même fille. Même brushing. Même pluie.', 0.3, 3.3, 'c'],
  ['fille', 'Brushing parfait\u00A0✨', 3.9, 6.8, 'g'],
  ['fille', 'Brushing parfait\u00A0✨', 4.3, 6.8, 'd'],
  ['fille', 'Oh non… il pleut.', 7.4, 11.6, 'g'],
  ['fille', 'Il pleut ? Et alors.', 9.2, 11.8, 'd'],
  ['fille', 'Pourquoi ça gonfle déjà ?!', 12.4, 16.6, 'g'],
  ['fille', 'Toujours lisse\u00A0😌', 14.2, 16.8, 'd'],
  ['fille', "J'ai tout essayé…", 17.4, 21.6, 'g'],
  ['fille', 'Pas un seul frisottis.', 19.2, 21.8, 'd'],
  ['fille', '72 heures plus tard… toujours parfaite.', 22.6, 26.6, 'd'],
  ['mirror', 'Son secret ? Le Duo Iconic.', 27.4, 30.8, 'c'],
  ['mirror', 'Le Duo Iconic. Seulement 50 coffrets.', 31.4, 34.6, 'c'], // affichée par l'écran de fin de ../bd/duo.js
];
window.VS_LIGNES = VS_LIGNES;
const vsParle = (t, i) => talk(t, VS_LIGNES[i][2], VS_LIGNES[i][3]);
function vsBulle(c, t, i, y, o = {}) {
  const [qui, txt, a, b, cote] = VS_LIGNES[i];
  if (qui === 'voix') return;
  const x = cote === 'g' ? 270 : cote === 'd' ? 810 : 540;
  const narrow = cote !== 'c';
  bubble(c, t, qui === 'fille' ? 'fille' : 'mirror', txt, a, b, y, Object.assign({ x, tail: x, maxW: narrow ? 420 : 820, size: narrow ? 40 : 50 }, o));
}

// les phases du compteur : [début, libellé, sous-titre, frisottis à gauche, pluie]
const PHASES = [
  [3.5, '0H', 'Brushing tout juste fait', 0, 0],
  [7.0, '1H', 'Il commence à pleuvoir', .3, .6],
  [12.0, '6H', 'Humidité 90 %', .7, 1],
  [17.0, '24H', 'Toujours la pluie', 1.0, 1],
  [22.0, '72H*', 'Trois jours plus tard', 1.15, .8],
];
function phase(t) { let p = PHASES[0], i = 0; PHASES.forEach((q, j) => { if (t >= q[0]) { p = q; i = j; } }); return [p, i]; }

function moitie(c, t, cote, frizz, pluie, expr, talkV, o = {}) {
  c.save(); c.beginPath(); c.rect(cote === 'g' ? 0 : 540, 0, 540, H); c.clip();
  c.translate(cote === 'g' ? -270 : 270, 0);
  rue(c, t + (cote === 'g' ? 0 : 3.3), pluie);
  woman(c, { t, x: 540, y: 1040, s: 1.05, frizz, expr, talk: talkV, coat: '#9c6b45', coatWet: pluie > .5, drips: pluie > .5 && frizz > .2,
    sweep: o.sweep, shine: o.shine || 0, tilt: o.tilt || 0, blink: o.blink || 0 });
  if (pluie) rain(c, t * 1.1 + (cote === 'g' ? 1 : 0), 40, cote === 'g' ? 7 : 8, .45 * pluie, 1900, 90);
  if (cote === 'd' && o.glow) {
    const r = rng(17); for (let i = 0; i < 8; i++) { const k = ((t * .6) + r()) % 1; sparkle(c, 340 + r() * 400, 600 + r() * 700, 10 + r() * 16, Math.sin(k * Math.PI) * o.glow, t); }
  }
  c.restore();
}

function compteur(c, t, p, i) {
  const k = eBack(seg(t, p[0], p[0] + .3));
  c.save(); c.translate(540, 250); c.scale(k, k);
  c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 24; c.fillStyle = C.choco;
  c.beginPath(); c.roundRect(-150, -88, 300, 176, 40); c.fill(); c.shadowColor = 'transparent';
  c.strokeStyle = C.or; c.lineWidth = 4; c.stroke();
  c.fillStyle = C.orClair; c.font = F(800, 92); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(p[1], 0, -8);
  c.fillStyle = C.creme; c.font = F(600, 24); c.fillText(p[2], 0, 58);
  c.restore();
  // barre de temps
  c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(140, 372, 800, 8);
  c.fillStyle = C.or; c.fillRect(140, 372, 800 * clamp((i + seg(t, p[0], (PHASES[i + 1] || [27])[0])) / PHASES.length), 8);
}

function vsScene(c, t) {
  if (t < 27) {
    const [p, i] = phase(t);
    const next = PHASES[i + 1], dur = (next ? next[0] : 27) - p[0];
    const fPrev = i ? PHASES[i - 1][3] : 0, fG = t < 3.5 ? 0 : lerp(fPrev, p[3], eIO(seg(t, p[0], p[0] + Math.min(2.5, dur))));
    const pluie = t < 3.5 ? 0 : lerp(i ? PHASES[i - 1][4] : 0, p[4], seg(t, p[0], p[0] + 1));
    const puff = pulse(t, 19.0, .06, .5);
    const exprG = t < 7.6 ? 'happy' : t < 12 ? 'shock' : t < 22 ? 'angry' : 'blase';
    c.save(); camera(c, t, 1.0, 540, 960, 3);
    const tg = (a, b) => VS_LIGNES.reduce((m, l, j) => (l[4] === a || l[4] === b) ? Math.max(m, vsParle(t, j)) : m, 0);
    moitie(c, t, 'g', fG + .35 * puff, pluie, exprG, tg('g'), { blink: pulse(t, 24.5, .05, .1) });
    moitie(c, t, 'd', 0, pluie, 'happy', tg('d'), { sweep: (t * .35) % 1, shine: 1, glow: seg(t, 12, 14), tilt: Math.sin(t * 2) * .02 });
    c.restore();
    // séparation et étiquettes
    c.fillStyle = C.or; c.fillRect(537, 0, 6, H);
    if (t > 3.4) {
      const a = clamp((t - 3.4) / .3);
      // étiquettes posées sur chaque moitié
      c.save(); c.globalAlpha = a;
      for (const [x, txt, bg, col] of [[270, 'SANS LE DUO', 'rgba(60,60,60,.85)', '#fff'], [810, 'AVEC LE DUO ✨', C.choco, C.orClair]]) {
        c.font = F(800, 30); const w = c.measureText(txt).width + 48; c.fillStyle = bg; c.beginPath(); c.roundRect(x - w / 2, 445, w, 54, 27); c.fill();
        c.fillStyle = col; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, x, 473);
      }
      c.restore();
      compteur(c, t, p, i);
    }
    // accroche
    if (t < 3.6) {
      c.fillStyle = `rgba(20,10,6,${.55 * (1 - seg(t, 3.2, 3.6))})`; c.fillRect(0, 0, W, H);
      ['MÊME FILLE.', 'MÊME BRUSHING.', 'MÊME PLUIE.'].forEach((m, j) => punch(c, t, m, .15 + j * .9, 3.55, 760 + j * 140, { size: 84, color: j === 2 ? '#ffe4a8' : '#fff' }));
    }
    if (t > 22.2) { c.save(); c.globalAlpha = clamp(Math.min((t - 22.2) / .3, (27 - t) / .2)); c.font = F(600, 22); c.textAlign = 'center';
      c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,.85)'; c.shadowBlur = 8; c.fillText('*Selon le type de cheveux, le coiffage et la météo.', 540, 1662); c.restore(); }
    for (let j = 1; j <= 9; j++) vsBulle(c, t, j, 1330 + (VS_LIGNES[j][4] === 'd' && j < 9 ? 120 : 0));
  } else if (t < 31) { // la révélation
    c.save(); camera(c, t, 1 + .04 * seg(t, 27, 31), 540, 900, 3);
    const open = eBack(seg(t, 27.15, 27.4));
    vanity(c, t, { x: 380, y: 860, s: .9, sweep: seg(t, 27, 27.8) * 1.4 - .2, face: tubeFace(t, { open, lx: .4, br: .6, talk: vsParle(t, 10), smile: .9, wink: t > 30.4 && t < 30.75 ? 1 : 0 }) }, { table: 1270 });
    jelly(c, 760, 1180, .95 * eBack(seg(t, 27.6, 28.0)), { t, look: -.6 });
    c.restore();
    punch(c, t, 'LE DUO ICONIC ✨', 27.1, 30.95, 200, { size: 66, color: '#ffe4a8' });
    const st = (y, a, n, l1, l2) => { if (t < a) return; const al = clamp((t - a) / .3) * clamp((30.95 - t) / .15);
      c.save(); c.globalAlpha = al; c.fillStyle = 'rgba(255,250,242,.94)'; c.beginPath(); c.roundRect(70, y - 52, 940, 104, 26); c.fill();
      c.fillStyle = C.choco; c.beginPath(); c.arc(130, y, 34, 0, 7); c.fill(); c.fillStyle = C.orClair; c.font = F(800, 38); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(n, 130, y + 2);
      c.textAlign = 'left'; c.fillStyle = C.choco; c.font = F(800, 32); c.fillText(l1, 186, y - 16); c.font = F(500, 26); c.fillStyle = '#5a3a22'; c.fillText(l2, 186, y + 22); c.restore(); };
    st(1460, 28.2, '1', 'GLAZE & GAZE', 'Après le shampoing · 3 min · puis rincer');
    st(1590, 28.8, '2', 'MIRROR 72H', 'Sur cheveux essorés · avant le coiffage');
    vsBulle(c, t, 10, 330, { tailUp: false, tail: 380 });
  } else { // fin : on réutilise l'écran de précommande de la version BD (décalé de 2 s)
    bdScene(c, t + 2);
  }
}

const vsOff = document.createElement('canvas'); vsOff.width = cv.width; vsOff.height = cv.height;
function vsDraw(t) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  vsScene(ctx, t);
  for (const m of [3.5, 27.0, 31.0]) { const fl = pulse(t, m, .01, .3); if (fl) { ctx.fillStyle = `rgba(255,240,205,${fl * .7})`; ctx.fillRect(0, 0, W, H); } }
}

window.DUREE = VS_DUREE;
window.draw = vsDraw;
window.pret = (async () => { await window.pret; vsDraw(0); return true; })();
