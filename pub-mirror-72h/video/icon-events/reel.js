/* ICON Events — reel tendance, 15 s, 9:16, sans son, calé sur 120 BPM (un temps = 0,5 s).
   Photos plein écran qui s'enchaînent sur le rythme, gros textes modernes, zooms, flashs. Ambiance claire :
   blanc, rose poudré, champagne. */
'use strict';
const RL_DUREE = 15;
// palette du logo ICON Events : chocolat profond, crème, or champagne
const ROSE = '#d0ab81', ROSE2 = '#b8915f', CHAMP = '#f4ece2', NOIR = '#2e1109';
const logoImg = new Image(); logoImg.src = '../assets/logo-icon.png';
const PHR = {}, LISTE = ['yacht22', 'yacht21', 'babyshower', 'cadeaux'];

// plans photo : [photo, début, fin, centre vertical]
const SEQ = [
  ['yacht22', 0, 1.5, .45], ['babyshower', 1.5, 1.875, .5], ['yacht21', 1.875, 2.25, .45], ['cadeaux', 2.25, 2.625, .55], ['yacht22', 2.625, 3.0, .4],
  ['babyshower', 4.0, 5.25, .5], ['cadeaux', 5.25, 6.5, .55],
  ['yacht22', 6.5, 7.75, .42], ['yacht21', 7.75, 9.0, .45],
  ['yacht21', 12.5, 12.75, .45], ['babyshower', 12.75, 13.0, .5], ['cadeaux', 13.0, 13.25, .55], ['yacht22', 13.25, 13.5, .42],
];

function photo(c, t) {
  const p = SEQ.find(s => t >= s[1] && t < s[2]); if (!p) return false;
  const im = PHR[p[0]]; if (!im) return false;
  const u = seg(t, p[1], p[2]);
  const z = 1.06 + .1 * u + .06 * Math.exp(-(t - p[1]) * 10); // petit coup de zoom à chaque coupe
  const s = Math.max(W / im.width, H / im.height) * z;
  const w = im.width * s, h = im.height * s;
  c.drawImage(im, 540 - w / 2, clamp(960 - h * p[3], H - h, 0), w, h);
  return true;
}
function fondClair(c, t, col1 = '#f8f2ea', col2 = '#e9d8c3') {
  const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, col1); g.addColorStop(1, col2);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // bandes diagonales qui défilent
  c.save(); c.globalAlpha = .22; c.fillStyle = '#fffaf3';
  for (let i = -6; i < 10; i++) { const x = i * 180 + (t * 220) % 180; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + 70, 0); c.lineTo(x - 500, H); c.lineTo(x - 570, H); c.closePath(); c.fill(); }
  c.restore();
}
// texte qui claque (blanc, gras, ombre), ou sur pastille
function claque(c, t, s, a, b, y, o = {}) {
  if (t < a || t > b) return;
  const k = eBack(seg(t, a, a + .14)), out = seg(t, b - .06, b), size = o.size || 110;
  c.save(); c.globalAlpha = 1 - out; c.translate(540, y); c.rotate(o.rot || 0); const sc = lerp(1.6, 1, clamp(k)); c.scale(sc, sc);
  c.font = `800 ${size}px Montserrat, 'Noto Color Emoji'`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.letterSpacing = (o.ls || 0) + 'px';
  if (o.pastille) {
    const w = c.measureText(s).width + 60, h = size * 1.35;
    c.fillStyle = o.pastille; c.beginPath(); c.roundRect(-w / 2, -h / 2, w, h, 18); c.fill();
    c.fillStyle = o.col || NOIR; c.fillText(s, 0, 4);
  } else {
    c.shadowColor = o.ombre || 'rgba(0,0,0,.45)'; c.shadowBlur = 24; c.shadowOffsetY = 4;
    c.fillStyle = o.col || CHAMP; c.fillText(s, 0, 0);
  }
  c.restore();
}
function petitTxt(c, t, s, a, b, y, o = {}) {
  if (t < a || t > b) return;
  const al = clamp(Math.min((t - a) / .15, (b - t) / .1));
  c.save(); c.globalAlpha = al; c.font = `700 ${o.size || 32}px Montserrat`; c.letterSpacing = (o.ls || 5) + 'px'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.shadowColor = o.ombre === false ? 'transparent' : 'rgba(0,0,0,.5)'; c.shadowBlur = 14; c.fillStyle = o.col || '#fff'; c.fillText(s, 540, y); c.restore();
}
function logoRond(c, x, y, r, k) {
  if (!logoImg.complete || !logoImg.naturalWidth) return;
  c.save(); c.translate(x, y); c.scale(k, k); c.shadowColor = 'rgba(46,17,9,.35)'; c.shadowBlur = 40; c.shadowOffsetY = 12;
  c.drawImage(logoImg, -r, -r, 2 * r, 2 * r); c.restore();
}

function rlDraw(t) {
  const c = ctx; c.setTransform(DPR, 0, 0, DPR, 0, 0);
  c.fillStyle = '#fff'; c.fillRect(0, 0, W, H);
  const choc = Math.max(...[0, 1.5, 3, 4, 6.5, 9, 11, 12.5].map(m => pulse(t, m, .01, .25))) * 10;
  c.save(); c.translate(noise(t * 40) * choc, noise(t * 37 + 3) * choc);
  const enPhoto = photo(c, t);
  if (!enPhoto) {
    if (t >= 9 && t < 11) fondClair(c, t, '#f6ede2', '#dcc3a2');
    else fondClair(c, t);
  }
  if (enPhoto) { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(0,0,0,.25)'); g.addColorStop(.45, 'rgba(0,0,0,0)'); g.addColorStop(.75, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
  c.restore();

  // 1. accroche
  claque(c, t, 'PLANNING', .0, 1.48, 700, { size: 120 });
  claque(c, t, 'AN EVENT', .25, 1.48, 830, { size: 120 });
  claque(c, t, 'IN DUBAI? 🇦🇪', .5, 1.48, 960, { size: 110, pastille: NOIR, col: CHAMP });
  claque(c, t, "DON'T KNOW", 1.5, 2.98, 760, { size: 112 });
  claque(c, t, 'WHICH AGENCY', 1.75, 2.98, 890, { size: 104 });
  claque(c, t, 'TO TRUST? 🤔', 2.0, 2.98, 1020, { size: 104, pastille: CHAMP, col: NOIR });
  // 2. on s'en occupe
  claque(c, t, 'WE GOT YOU.', 3.0, 3.98, 520, { size: 104, col: NOIR, ombre: 'transparent' });
  if (t >= 3.15 && t < 4.0) logoRond(c, 540, 1000, 260, eBack(seg(t, 3.15, 3.45)));
  // 3. les concepts
  claque(c, t, 'ICON', 4.0, 6.48, 300, { size: 150, ls: 6 });
  claque(c, t, 'EVENTS', 4.15, 6.48, 440, { size: 110, pastille: NOIR, col: CHAMP, ls: 6 });
  petitTxt(c, t, 'BABY SHOWERS · ENGAGEMENTS', 4.4, 6.48, 1480, { size: 34 });
  petitTxt(c, t, 'BRIDAL SHOWERS · PRIVATE PARTIES', 4.6, 6.48, 1540, { size: 34 });
  claque(c, t, 'ICON', 6.5, 8.98, 300, { size: 150, ls: 6 });
  claque(c, t, 'BIRTHDAY 🎂', 6.65, 8.98, 440, { size: 104, pastille: ROSE, col: NOIR, ls: 4 });
  petitTxt(c, t, 'YACHT PARTIES · 18TH · 21ST', 6.9, 8.98, 1480, { size: 34 });
  petitTxt(c, t, 'SURPRISES · MILESTONES', 7.1, 8.98, 1540, { size: 34 });
  claque(c, t, 'ICON', 9.0, 10.98, 640, { size: 170, col: NOIR, ombre: 'transparent', ls: 8 });
  claque(c, t, 'SHOW ✨', 9.15, 10.98, 800, { size: 130, pastille: NOIR, col: CHAMP, ls: 6 });
  ['BRAND LAUNCHES', 'POP-UPS', 'CORPORATE', 'VIP NIGHTS'].forEach((m, i) => claque(c, t, m, 9.5 + i * .25, 10.98, 1000 + i * 95, { size: 58, col: NOIR, ombre: 'transparent' }));
  // 4. 7/7
  claque(c, t, '7/7', 11.0, 12.48, 760, { size: 320, col: NOIR, ombre: 'transparent' });
  claque(c, t, "WE'RE HERE EVERY DAY", 11.3, 12.48, 1000, { size: 60, pastille: ROSE, col: NOIR });
  claque(c, t, 'FULLY BESPOKE ✨', 11.6, 12.48, 1120, { size: 60, pastille: NOIR, col: CHAMP });
  // 5. fin
  claque(c, t, 'YOUR EVENT.', 12.5, 13.48, 780, { size: 110 });
  claque(c, t, 'OUR SIGNATURE.', 12.75, 13.48, 910, { size: 100, pastille: NOIR, col: CHAMP });
  if (t >= 13.5) {
    fondClair(c, t);
    logoRond(c, 540, 640, 230, eBack(seg(t, 13.5, 13.8)));
    petitTxt(c, t, 'NOT JUST AN EVENT. AN EXPERIENCE.', 13.7, 15, 960, { size: 32, col: NOIR, ombre: false, ls: 4 });
    claque(c, t, 'DM US TO BOOK 💌', 13.9, 15.1, 1120, { size: 72, pastille: NOIR, col: CHAMP });
    petitTxt(c, t, '@ICONEVENTSOFFICIEL · DUBAI', 14.1, 15, 1260, { size: 32, col: NOIR, ombre: false, ls: 3 });
  }
  // flashs sur les coupes
  for (const m of [1.5, 3.0, 4.0, 6.5, 9.0, 11.0, 12.5, 13.5]) { const f = pulse(t, m, .005, .12); if (f) { c.fillStyle = `rgba(244,236,226,${f * .9})`; c.fillRect(0, 0, W, H); } }
}

window.DUREE = RL_DUREE;
window.draw = rlDraw;
window.pret = (async () => {
  await window.pret; await document.fonts.load('800 40px Montserrat', 'A');
  await Promise.all(LISTE.map(n => new Promise(r => { const im = new Image(); im.onload = () => { PHR[n] = im; r(); }; im.onerror = r; im.src = '../out/icon/' + n + '.jpg'; })));
  if (!logoImg.complete) await new Promise(r => { logoImg.onload = r; logoImg.onerror = r; });
  rlDraw(0); return true;
})();
