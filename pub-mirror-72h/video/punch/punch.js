/* « Le voile anti-météo » : 20 s, 9:16, uniquement de vraies images (vidéos de la marque et de son site),
   montage nerveux calé sur 120 BPM (un temps = 0,5 s) : coupes sur les temps, accélérations et ralentis,
   zooms qui claquent, flashs, textes qui tombent. Couleurs naturelles. Sans son.
   Les images viennent de out/punch/ (préparées par punch/prep.py). */
'use strict';
const PU_DUREE = 20, BEAT = .5;
const SRC = '../out/punch/';

// plans : [nom, début, fin, type, source(x) -> secondes dans la source]
const PLANS = [
  ['lisseur', 0.0, 2.0, 'video', x => x * 1.6],
  ['frisottis', 2.0, 3.5, 'video', x => .3 + x * 1.0],
  ['probleme', 3.5, 5.0, 'photo'],
  ['satin', 5.0, 6.5, 'photo'],
  ['gel', 6.5, 9.0, 'video', x => x < .6 ? x * 1.6 : .96 + (x - .6) * .45],
  ['peigne', 9.0, 11.0, 'video', x => x * .85],
  ['test', 11.0, 12.5, 'video', x => .2 + x * 1.2],
  ['nuit', 12.5, 14.5, 'video', x => x * .75],
  ['mouvement', 14.5, 16.0, 'video', x => x * .9],
  ['regard', 16.0, 17.5, 'video', x => .2 + x * 1.1],
  ['canape', 17.5, 20.0, 'photo'],
];
let INFOS = {};
const cache = new Map();
function charge(url) {
  if (cache.has(url)) return cache.get(url);
  const p = new Promise(res => { const im = new Image(); im.onload = () => im.decode().then(() => res(im), () => res(im)); im.onerror = () => res(null); im.src = url; });
  cache.set(url, p);
  if (cache.size > 160) cache.delete(cache.keys().next().value);
  return p;
}
function planA(t) { return PLANS.find(p => t >= p[1] && t < p[2]) || PLANS[PLANS.length - 1]; }
async function imagePlan(p, t) {
  if (p[3] === 'photo') return charge(SRC + p[0] + '.jpg');
  const n = INFOS[p[0]] || 1, s = p[4](t - p[1]);
  const i = clamp(Math.floor(s * 60) + 1, 1, n);
  return charge(SRC + p[0] + '/' + String(i).padStart(5, '0') + '.jpg');
}

// petit coup de zoom sur chaque temps
const coup = (t, a, b, f = .05) => { let z = 0; for (let k = a; k < b - .01; k += BEAT) z += f * Math.exp(-Math.max(0, t - k) * 9) * (t >= k ? 1 : 0); return z; };

// recadrages des photos (zoom de départ et d'arrivée, centre)
function cadrePhoto(c, im, t, p) {
  const u = seg(t, p[1], p[2]);
  let z = 1, cx = .5, cy = .5;
  if (p[0] === 'probleme') { // quatre gros plans successifs sur les quatre vignettes
    const k = Math.min(3, Math.floor((t - p[1]) / .375)), pos = [[.27, .26], [.73, .26], [.27, .74], [.73, .74]][k];
    z = 2.15 + .12 * seg(t, p[1] + k * .375, p[1] + (k + 1) * .375); cx = pos[0]; cy = pos[1];
  } else if (p[0] === 'satin') { z = lerp(1.45, 1.0, eOut(seg(t, 5.0, 5.35))) + .05 * u; cy = .52; }
  else if (p[0] === 'canape') { z = 1.05 + .05 * u; cy = .5; }
  const W0 = im.width, H0 = im.height, base = Math.max(W / W0, H / H0);
  const s = base * z, w = W0 * s, h = H0 * s;
  c.drawImage(im, W / 2 - cx * w, H / 2 - cy * h, w, h);
}

// textes
function tombe(c, t, txt, a, b, y, o = {}) {
  if (t < a || t > b) return;
  const k = eOut(seg(t, a, a + .12)), out = seg(t, b - .08, b);
  const size = o.size || 96;
  c.save(); c.globalAlpha = (1 - out) * clamp(k * 1.4);
  c.translate(540, y); const s = lerp(o.from || 1.45, 1, k); c.scale(s, s);
  c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = o.serif ? `italic 500 ${size}px "Playfair Display"` : `800 ${size}px Montserrat, 'Noto Color Emoji'`;
  c.letterSpacing = (o.ls || 2) + 'px';
  c.shadowColor = o.fonce ? 'rgba(255,255,255,.6)' : 'rgba(0,0,0,.55)'; c.shadowBlur = o.fonce ? 10 : 28;
  if (o.or) { const g = c.createLinearGradient(0, -size / 2, 0, size / 2); g.addColorStop(0, '#fff3cf'); g.addColorStop(1, '#d4a84f'); c.fillStyle = g; }
  else c.fillStyle = o.col || '#ffffff';
  c.fillText(txt, 0, 0);
  c.restore();
}
function petit(c, t, txt, a, b, y, o = {}) {
  if (t < a || t > b) return;
  const al = clamp(Math.min((t - a) / .15, (b - t) / .1));
  c.save(); c.globalAlpha = al; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `${o.w || 600} ${o.size || 30}px Montserrat`; c.letterSpacing = (o.ls || 8) + 'px';
  c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 16; c.fillStyle = o.col || '#f6ead6';
  c.fillText(txt, 540, y); c.restore();
}

function textes(c, t) {
  // l'accroche
  tombe(c, t, '1 HEURE', .1, 1.98, 760, { size: 150 });
  tombe(c, t, 'DE BRUSHING.', .6, 1.98, 900, { size: 92 });
  tombe(c, t, '2 MIN DEHORS.', 2.02, 3.48, 800, { size: 104 });
  tombe(c, t, 'RUINÉ. 💀', 2.55, 3.48, 940, { size: 92 });
  ['FRISOTTIS.', 'GONFLÉS.', 'TERNES.', 'STOP.'].forEach((m, i) => tombe(c, t, m, 3.52 + i * .375, 3.52 + (i + 1) * .375 - .01, 900, { size: i === 3 ? 170 : 120, col: i === 3 ? '#ffe2a6' : '#fff' }));
  // le produit
  petit(c, t, 'GLOSS BY K PRÉSENTE', 5.05, 6.45, 300, { size: 28, ls: 10 });
  tombe(c, t, 'Mirror 72H', 5.3, 6.45, 1560, { size: 120, serif: true, from: 1.2, or: true });
  petit(c, t, 'LE VOILE ANTI-MÉTÉO', 5.55, 6.45, 1660, { size: 30, ls: 12 });
  tombe(c, t, 'UN VOILE INVISIBLE.', 6.55, 7.9, 380, { size: 70 });
  tombe(c, t, 'AVANT LE COIFFAGE.', 7.95, 8.98, 380, { size: 70 });
  tombe(c, t, 'ANTI-FRISOTTIS.', 9.02, 10.0, 420, { size: 84 });
  tombe(c, t, 'SANS RINÇAGE.', 10.02, 10.98, 420, { size: 84 });
  // la preuve
  tombe(c, t, 'MÊME EAU.', 11.02, 12.48, 330, { size: 96 });
  tombe(c, t, 'DEUX FINS.', 11.55, 12.48, 450, { size: 96, col: '#ffe2a6' });
  // les promesses
  tombe(c, t, 'ANTI-HUMIDITÉ', 12.55, 14.45, 360, { size: 76 });
  tombe(c, t, "JUSQU'À 72H*", 13.0, 14.45, 480, { size: 104, or: true });
  tombe(c, t, 'PROTECTION', 14.55, 15.98, 360, { size: 80 });
  tombe(c, t, 'THERMIQUE 230°C', 14.8, 15.98, 470, { size: 80, or: true });
  tombe(c, t, 'BRUSHING', 16.05, 17.48, 360, { size: 84 });
  tombe(c, t, 'OU BOUCLES.', 16.4, 17.48, 470, { size: 84, or: true });
  petit(c, t, 'VEGAN · NON TESTÉ SUR LES ANIMAUX', 16.6, 17.45, 1560, { size: 26, ls: 4 });
  // la signature (la phrase du site)
  tombe(c, t, 'Vous avez fait vos cheveux.', 17.6, 20, 250, { size: 64, serif: true, from: 1.15, col: '#2a1712', fonce: true });
  tombe(c, t, "La météo n'a pas", 18.2, 20, 350, { size: 70, serif: true, from: 1.15, col: '#8a5a1e', fonce: true });
  tombe(c, t, 'son mot à dire.', 18.45, 20, 435, { size: 70, serif: true, from: 1.15, col: '#8a5a1e', fonce: true });
  petit(c, t, 'MIRROR 72H · GLOSSBYK.COM', 18.9, 20, 1560, { size: 34, ls: 6, w: 700 });
  if (t > 11.0 && t < 12.5) { // SANS / AVEC de chaque côté de la séparation
    const a = clamp(Math.min((t - 11.1) / .15, (12.45 - t) / .1));
    c.save(); c.globalAlpha = a; c.font = '700 34px Montserrat'; c.letterSpacing = '6px'; c.textAlign = 'center'; c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 14;
    c.fillStyle = '#fff'; c.fillText('SANS', 300, 1500); c.fillStyle = '#ffe2a6'; c.fillText('AVEC', 780, 1500);
    c.fillStyle = 'rgba(255,255,255,.75)'; c.fillRect(538, 1380, 4, 160); c.restore();
  }
  if (t > 12.6 && t < 14.45 || t > 17.6) petit(c, t, '*Selon le type de cheveux, le coiffage et la météo.', t > 17.6 ? 17.6 : 12.6, t > 17.6 ? 20 : 14.45, 1660, { size: 20, ls: 0, w: 500 });
}

async function puDraw(t) {
  const c = ctx;
  c.setTransform(DPR, 0, 0, DPR, 0, 0);
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  const p = planA(t), im = await imagePlan(p, t);
  c.save();
  // zoom sur les temps + secousse sur les coupes fortes
  const z = 1 + coup(t, p[1], p[2], p[0] === 'lisseur' || p[0] === 'frisottis' ? .07 : .035);
  const choc = Math.max(pulse(t, 2.0, .01, .35), pulse(t, 3.5, .01, .3), pulse(t, 4.625, .01, .3)) * 14;
  c.translate(540 + noise(t * 40) * choc, 960 + noise(t * 37 + 5) * choc); c.scale(z, z); c.translate(-540, -960);
  if (im) {
    if (p[3] === 'photo') cadrePhoto(c, im, t, p);
    else c.drawImage(im, 0, 0, W, H);
  }
  c.restore();
  // coup de zoom flou aux transitions « whip » (6,5 s et 12,5 s)
  for (const m of [6.5, 12.5, 9.0, 14.5, 16.0]) {
    const k = pulse(t, m, .06, .14);
    if (k > 0 && im) { c.save(); c.globalAlpha = .22 * k; for (let i = 1; i <= 4; i++) { const s = 1 + i * .045 * k; c.drawImage(cv, 0, 0, cv.width, cv.height, 540 - 540 * s, 960 - 960 * s, W * s, H * s); } c.restore(); }
  }
  // dégradés pour la lisibilité du texte (légers)
  const gh = c.createLinearGradient(0, 0, 0, 640); gh.addColorStop(0, `rgba(0,0,0,${t > 17.5 ? 0 : .32})`); gh.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gh; c.fillRect(0, 0, W, 640);
  const gb = c.createLinearGradient(0, 1380, 0, H); gb.addColorStop(0, 'rgba(0,0,0,0)'); gb.addColorStop(1, 'rgba(0,0,0,.4)'); c.fillStyle = gb; c.fillRect(0, 1380, W, 540);
  // reflet doré qui balaie le packshot et la fin
  for (const [a, b] of [[5.05, 6.2]]) if (t > a && t < b) {
    const k = eIO(seg(t, a, b)), x = lerp(-500, 1600, k);
    c.save(); c.globalCompositeOperation = 'lighter';
    const g = c.createLinearGradient(x - 220, 0, x + 220, 500); g.addColorStop(0, 'rgba(255,220,160,0)'); g.addColorStop(.5, 'rgba(255,226,175,.25)'); g.addColorStop(1, 'rgba(255,220,160,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
  }
  // flashs blancs sur les coupes qui claquent, noir avant le produit
  for (const m of [2.0, 3.5, 11.0, 17.5]) { const f = pulse(t, m, .005, .12); if (f) { c.fillStyle = `rgba(255,255,255,${f * .85})`; c.fillRect(0, 0, W, H); } }
  const nb = pulse(t, 5.0, .08, .14); if (nb) { c.fillStyle = `rgba(0,0,0,${nb})`; c.fillRect(0, 0, W, H); }
  textes(c, t);
}

window.DUREE = PU_DUREE;
window.draw = puDraw;
window.pret = (async () => {
  await window.pret;
  INFOS = await (await fetch(SRC + 'infos.json')).json();
  await document.fonts.load('italic 500 40px "Playfair Display"', 'A');
  await puDraw(0);
  return true;
})();
