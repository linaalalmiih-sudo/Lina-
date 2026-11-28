/* « Trois clics » : parcours d'achat Gloss By K raconté avec des widgets et un téléphone animés, voix off calme.
   27 s, 9:16. Inspiré du format « interface animée + narration », aux couleurs de la marque (crème, chocolat, or). */
'use strict';
const PC_DUREE = 27;
const CH = '#2a1712', OR = '#b8893c', OR2 = '#e6c98d', CREME = '#f6efe6', GRIS = '#8a7b70';
const FONT = 'Inter, Montserrat, sans-serif';
const IMG = {};
function charge(n, src) { return new Promise(r => { const im = new Image(); im.onload = () => { IMG[n] = im; r(); }; im.onerror = r; im.src = src; }); }

// ---------- petits outils ----------
function carte(c, x, y, w, h, r, fill, ombre = .16) {
  c.save(); c.shadowColor = `rgba(60,35,20,${ombre})`; c.shadowBlur = 40; c.shadowOffsetY = 18;
  c.fillStyle = fill; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); c.restore();
}
function t_(c, s, x, y, size, o = {}) {
  c.save(); c.font = `${o.w || 500} ${size}px ${o.serif ? '"Playfair Display"' : FONT}`; c.fillStyle = o.col || CH;
  c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'alphabetic'; c.letterSpacing = (o.ls || 0) + 'px';
  if (o.a != null) c.globalAlpha = o.a; c.fillText(s, x, y); c.restore();
}
const ap = (t, a, d = .35) => eOut(seg(t, a, a + d));
function couvre(c, im, x, y, w, h, cy = .5, z = 1) {
  if (!im) return; const s = Math.max(w / im.width, h / im.height) * z, iw = im.width * s, ih = im.height * s;
  c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.drawImage(im, x + (w - iw) / 2, y + (h - ih) * cy, iw, ih); c.restore();
}

// gros titre en haut (comme une narration écrite), avec un mot en or
function titre(c, t, a, b, morceaux, y = 230) {
  if (t < a || t > b) return;
  c.save(); c.font = `600 66px ${FONT}`; c.letterSpacing = '-1px'; c.textBaseline = 'middle';
  const total = morceaux.reduce((s, [m]) => s + c.measureText(m).width, 0);
  let x = 540 - total / 2;
  morceaux.forEach(([m, or], i) => {
    const k = ap(t, a + i * .35, .4), out = 1 - seg(t, b - .2, b);
    c.globalAlpha = k * out; c.filter = `blur(${(1 - k) * 8}px)`; c.fillStyle = or ? OR : CH;
    c.fillText(m, x, y + (1 - k) * 14); x += c.measureText(m).width;
  });
  c.restore();
}

// ---------- widgets ----------
function horloge(c, x, y, s, h, m) {
  carte(c, x, y, s, s, s * .22, '#ffffff');
  const cx = x + s / 2, cy = y + s / 2, r = s * .4;
  c.save(); c.fillStyle = CH; c.font = `500 ${s * .085}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = 1; i <= 12; i++) { const a = i / 12 * Math.PI * 2 - Math.PI / 2; c.fillText(i, cx + Math.cos(a) * r * .85, cy + Math.sin(a) * r * .85); }
  const ah = (h % 12 + m / 60) / 12 * Math.PI * 2 - Math.PI / 2, am = m / 60 * Math.PI * 2 - Math.PI / 2;
  c.strokeStyle = CH; c.lineCap = 'round'; c.lineWidth = s * .03; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(ah) * r * .5, cy + Math.sin(ah) * r * .5); c.stroke();
  c.lineWidth = s * .02; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(am) * r * .75, cy + Math.sin(am) * r * .75); c.stroke();
  c.fillStyle = OR; c.beginPath(); c.arc(cx, cy, s * .025, 0, 7); c.fill(); c.restore();
}
function dateW(c, x, y, s) {
  carte(c, x, y, s, s, s * .22, CH);
  t_(c, 'SAMEDI', x + s * .14, y + s * .26, s * .1, { w: 700, col: OR2, ls: 2 });
  t_(c, '28', x + s * .12, y + s * .74, s * .44, { w: 600, col: CREME });
  t_(c, 'novembre', x + s * .14, y + s * .9, s * .09, { col: '#cbb8a6' });
}
function meteo(c, x, y, s, t, beau = 0) {
  const g = c.createLinearGradient(x, y, x, y + s); g.addColorStop(0, beau ? '#d9b27a' : '#4b5d73'); g.addColorStop(1, beau ? '#a8763c' : '#2f3c4f');
  carte(c, x, y, s, s, s * .22, g);
  t_(c, 'Paris', x + s * .12, y + s * .2, s * .1, { w: 600, col: '#fff' });
  t_(c, beau ? '72H*' : '14°', x + s * .1, y + s * .5, s * .3, { w: 300, col: '#fff' });
  c.save(); c.font = `${s * .16}px 'Noto Color Emoji'`; c.fillText(beau ? '✨' : '🌧️', x + s * .12, y + s * .74); c.restore();
  t_(c, beau ? 'Brushing intact' : 'Humidité 92 %', x + s * .12, y + s * .9, s * .085, { w: 600, col: '#fff' });
  if (!beau) { c.save(); c.beginPath(); c.roundRect(x, y, s, s, s * .22); c.clip(); c.globalAlpha = .5; c.translate(x, y); c.scale(s / W, s / H * 1.8); rain(c, t, 30, 5, .6, 900, 60); c.restore(); }
}
function messages(c, x, y, w, h, t, t0, fin) {
  carte(c, x, y, w, h, 46, CH);
  c.save(); c.font = '34px "Noto Color Emoji"'; c.fillText('👯‍♀️', x + 30, y + 62); c.restore();
  t_(c, 'Les filles', x + 82, y + 58, 30, { w: 600, col: CREME });
  t_(c, 'maintenant', x + w - 30, y + 58, 22, { col: '#a8968a', align: 'right' });
  const bulles = fin ? [['Tes cheveux 😍 comment ?!', 0], ['Mirror 72H ✨', .9]] : [['La soirée c\'est à 21h 🥂', 0], ['Il pleut 😭 mes cheveux…', .9]];
  bulles.forEach(([s, d], i) => { const k = eBack(seg(t, t0 + d, t0 + d + .3)); if (k <= 0) return;
    c.save(); c.globalAlpha = clamp(k); c.font = `500 28px ${FONT}, 'Noto Color Emoji'`; const tw = c.measureText(s).width + 44;
    const bx = i ? x + w - 30 - tw : x + 30, by = y + 96 + i * 74;
    c.translate(bx + tw / 2, by + 28); c.scale(.8 + .2 * k, .8 + .2 * k); c.translate(-(bx + tw / 2), -(by + 28));
    c.fillStyle = i ? OR : '#4a2c22'; c.beginPath(); c.roundRect(bx, by, tw, 56, 28); c.fill();
    c.fillStyle = i ? CH : CREME; c.textBaseline = 'middle'; c.fillText(s, bx + 22, by + 29); c.restore(); });
}

// ---------- téléphone ----------
const PW = 390, PH = 844;
function telephone(c, x, y, sc, ecran, t) {
  c.save(); c.translate(x, y); c.scale(sc, sc);
  c.shadowColor = 'rgba(40,20,10,.35)'; c.shadowBlur = 80; c.shadowOffsetY = 40;
  c.fillStyle = '#121010'; c.beginPath(); c.roundRect(-14, -14, PW + 28, PH + 28, 66); c.fill(); c.shadowColor = 'transparent';
  c.strokeStyle = '#3a3230'; c.lineWidth = 3; c.stroke();
  c.save(); c.beginPath(); c.roundRect(0, 0, PW, PH, 54); c.clip();
  ecran(c, t);
  // barre d'état
  c.fillStyle = 'rgba(0,0,0,0)'; t_(c, '19:02', 36, 34, 17, { w: 600, col: c.__barre || CH });
  c.fillStyle = '#000'; c.beginPath(); c.roundRect(PW / 2 - 62, 12, 124, 36, 18); c.fill();
  c.restore(); c.restore();
}
function clavier(c) {
  c.fillStyle = '#d7d2cc'; c.fillRect(0, PH - 300, PW, 300);
  const rangs = ['AZERTYUIOP', 'QSDFGHJKLM', 'WXCVBN'];
  rangs.forEach((r, j) => { const w = 33, g = 5, tot = r.length * (w + g) - g, x0 = (PW - tot) / 2;
    [...r].forEach((k, i) => { c.fillStyle = '#fff'; c.beginPath(); c.roundRect(x0 + i * (w + g), PH - 286 + j * 58, w, 46, 6); c.fill();
      t_(c, k, x0 + i * (w + g) + w / 2, PH - 254 + j * 58, 19, { align: 'center', col: '#222' }); }); });
  c.fillStyle = '#fff'; c.beginPath(); c.roundRect(96, PH - 112, 198, 46, 6); c.fill(); t_(c, 'espace', PW / 2, PH - 82, 16, { align: 'center', col: '#444' });
  c.fillStyle = OR; c.beginPath(); c.roundRect(300, PH - 112, 80, 46, 6); c.fill(); t_(c, 'OK', 340, PH - 82, 17, { align: 'center', col: '#fff', w: 600 });
}
function ecranRecherche(t0) {
  return (c, t) => {
    c.__barre = CH; c.fillStyle = '#f7f4f0'; c.fillRect(0, 0, PW, PH);
    t_(c, 'Rechercher', 24, 110, 32, { w: 700 });
    c.fillStyle = '#e9e4de'; c.beginPath(); c.roundRect(20, 128, PW - 40, 48, 14); c.fill();
    const q = 'cheveux qui gonflent', n = Math.floor(clamp((t - t0) / 1.4) * q.length);
    t_(c, q.slice(0, n) + ((t * 2 | 0) % 2 ? '|' : ''), 40, 160, 18, { col: '#333' });
    if (n >= q.length) {
      const k = ap(t, t0 + 1.5);
      c.save(); c.globalAlpha = k; c.fillStyle = '#fff'; c.beginPath(); c.roundRect(20, 196, PW - 40, 120, 18); c.fill();
      if (IMG.logo) c.drawImage(IMG.logo, 36, 214, 52, 52);
      t_(c, 'Gloss By K', 102, 234, 19, { w: 700 }); t_(c, 'glossbyk.com', 102, 258, 15, { col: GRIS });
      t_(c, 'Mirror 72H — le voile anti-météo', 36, 296, 15, { col: CH });
      c.restore();
      // appui sur le résultat
      const tap = pulse(t, t0 + 2.4, .05, .4); if (tap) { c.fillStyle = `rgba(184,137,60,${.35 * tap})`; c.beginPath(); c.arc(200, 256, 30 + 20 * tap, 0, 7); c.fill(); }
    }
    clavier(c);
  };
}
function ecranSite(t0) {
  return (c, t) => {
    c.__barre = '#fff'; const sc = eIO(seg(t, t0 + 2.4, t0 + 3.6)) * 440;
    c.fillStyle = CREME; c.fillRect(0, 0, PW, PH);
    c.save(); c.translate(0, -sc);
    couvre(c, IMG.satin, 0, 0, PW, 560, .45, 1.05 + .05 * seg(t, t0, t0 + 3));
    const g = c.createLinearGradient(0, 300, 0, 560); g.addColorStop(0, 'rgba(20,10,6,0)'); g.addColorStop(1, 'rgba(20,10,6,.75)'); c.fillStyle = g; c.fillRect(0, 300, PW, 260);
    t_(c, 'Vous avez fait vos cheveux.', PW / 2, 470, 22, { serif: true, col: '#fff', align: 'center' });
    t_(c, "La météo n'a pas son mot à dire.", PW / 2, 502, 22, { serif: true, col: OR2, align: 'center' });
    // section produit sous le héros
    t_(c, 'MIRROR 72H · LE VOILE ANTI-MÉTÉO', PW / 2, 610, 14, { w: 700, col: OR, align: 'center', ls: 2 });
    t_(c, 'Un voile invisible et léger.', PW / 2, 652, 24, { serif: true, align: 'center' });
    t_(c, 'À appliquer une fois avant le coiffage.', PW / 2, 684, 15, { col: GRIS, align: 'center' });
    couvre(c, IMG.modele, 30, 712, PW - 60, 330, .3);
    c.restore();
  };
}
function ecranProduit(t0) {
  return (c, t) => {
    c.__barre = CH; c.fillStyle = CREME; c.fillRect(0, 0, PW, PH);
    c.fillStyle = '#efe5d8'; c.fillRect(0, 0, PW, 430); couvre(c, IMG.satin, 40, 70, PW - 80, 350, .4, 1.1);
    t_(c, 'Mirror 72H', 26, 480, 30, { serif: true });
    t_(c, 'The Weather Veil · 100 ml', 26, 508, 15, { col: GRIS });
    t_(c, '50,00 €', PW - 26, 480, 24, { w: 700, align: 'right' });
    ['Anti-frisottis', "Anti-humidité jusqu'à 72h*", 'Protection thermique 230 °C', 'Sans rinçage · Vegan'].forEach((s, i) => {
      const k = ap(t, t0 + .3 + i * .35); c.save(); c.globalAlpha = k;
      c.fillStyle = OR; c.beginPath(); c.arc(36, 548 + i * 36, 9, 0, 7); c.fill(); t_(c, '✓', 36, 553 + i * 36, 13, { col: '#fff', align: 'center', w: 800 });
      t_(c, s, 56, 554 + i * 36, 17, { col: CH }); c.restore(); });
    const press = pulse(t, t0 + 2.6, .05, .3);
    c.save(); c.translate(PW / 2, 760); c.scale(1 - .05 * press, 1 - .05 * press);
    c.fillStyle = CH; c.beginPath(); c.roundRect(-170, -30, 340, 60, 30); c.fill();
    t_(c, 'Ajouter au panier', 0, 6, 19, { col: CREME, align: 'center', w: 600 }); c.restore();
    if (press) { c.fillStyle = `rgba(184,137,60,${.4 * press})`; c.beginPath(); c.arc(PW / 2 + 40, 760, 30 + 24 * press, 0, 7); c.fill(); }
    t_(c, '*Selon le type de cheveux, le coiffage et la météo.', PW / 2, 820, 11, { col: GRIS, align: 'center' });
  };
}
function ecranPaiement(t0) {
  const produit = ecranProduit(-99);
  return (c, t) => {
    produit(c, t);
    const k = eOut(seg(t, t0, t0 + .4));
    c.fillStyle = `rgba(0,0,0,${.35 * k})`; c.fillRect(0, 0, PW, PH);
    c.save(); c.translate(0, (1 - k) * 420);
    c.fillStyle = '#fff'; c.beginPath(); c.roundRect(0, PH - 400, PW, 420, 30); c.fill();
    if (IMG.logo) c.drawImage(IMG.logo, 24, PH - 372, 44, 44);
    t_(c, 'Gloss By K', 80, PH - 344, 19, { w: 700 });
    t_(c, 'Mirror 72H · 100 ml', 24, PH - 290, 16, { col: GRIS }); t_(c, '50,00 €', PW - 24, PH - 290, 16, { align: 'right', w: 600 });
    t_(c, 'Brosse dorée', 24, PH - 260, 16, { col: GRIS }); t_(c, 'Offerte', PW - 24, PH - 260, 16, { align: 'right', col: OR, w: 600 });
    c.fillStyle = '#eee'; c.fillRect(24, PH - 244, PW - 48, 1.5);
    t_(c, 'Total', 24, PH - 210, 20, { w: 700 }); t_(c, '50,00 €', PW - 24, PH - 210, 20, { align: 'right', w: 700 });
    const ok = seg(t, t0 + 1.2, t0 + 1.7);
    if (ok <= 0) {
      const press = pulse(t, t0 + 1.0, .05, .25);
      c.save(); c.translate(PW / 2, PH - 130); c.scale(1 - .05 * press, 1 - .05 * press); c.fillStyle = CH; c.beginPath(); c.roundRect(-170, -32, 340, 64, 32); c.fill();
      t_(c, 'Payer', 0, 7, 20, { col: CREME, align: 'center', w: 600 }); c.restore();
    } else {
      c.strokeStyle = OR; c.lineWidth = 5; c.beginPath(); c.arc(PW / 2, PH - 140, 34, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * eOut(ok)); c.stroke();
      if (ok > .5) { c.beginPath(); c.moveTo(PW / 2 - 15, PH - 140); c.lineTo(PW / 2 - 4, PH - 128); c.lineTo(PW / 2 + 17, PH - 152); c.stroke(); }
      t_(c, 'Commande confirmée', PW / 2, PH - 78, 17, { align: 'center', w: 600, a: ok });
    }
    c.restore();
  };
}

// ---------- la scène ----------
function pcDraw(t) {
  const c = ctx; c.setTransform(DPR, 0, 0, DPR, 0, 0);
  const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#f8f4ee'); g.addColorStop(1, '#e8dfd3'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  // légère inclinaison « 3D » de toute la scène et caméra qui dérive
  c.save(); c.translate(540, 1000); c.rotate(-.06); c.transform(1, 0, -.08, 1, 0, 0);
  let cam = { x: 0, y: 0, z: 1 };
  if (t < 3) cam = { x: lerp(60, 0, eOut(seg(t, 0, 1.4))), y: 0, z: lerp(.82, 1.0, eOut(seg(t, 0, 1.6))) };
  else if (t < 6.2) cam = { x: -40, y: 60, z: 1.08 };
  else if (t < 20.8) cam = { x: 0, y: 0, z: lerp(1.0, 1.06, seg(t, 6.2, 20.8)) };
  else if (t < 24) cam = { x: 0, y: 40, z: lerp(.92, .86, seg(t, 20.8, 24)) };
  c.scale(cam.z, cam.z); c.translate(-540 + cam.x, -1000 + cam.y);

  if (t < 6.2 || (t >= 20.8 && t < 24.2)) {
    const fin = t >= 20.8;
    horloge(c, 120, 720, 300, 19, fin ? 5 : 0 + t * 1.2);
    dateW(c, 460, 720, 250);
    meteo(c, 740, 720, 250, t, fin ? 1 : 0);
    if (t >= 3 || fin) messages(c, 120, 1060, 560, 260, t, fin ? 21.2 : 3.4, fin);
    // le téléphone posé, écran éteint puis allumé
    c.save(); c.globalAlpha = .95; telephone(c, 720, 1010, .62, (cc) => { cc.__barre = '#fff'; cc.fillStyle = fin ? CREME : '#151212'; cc.fillRect(0, 0, PW, PH);
      if (fin) { couvre(cc, IMG.modele, 0, 0, PW, PH, .3); } }, t); c.restore();
    if (fin) { carte(c, 120, 1360, 300, 120, 40, '#fff'); t_(c, 'Anti-frisottis', 150, 1415, 30, { w: 600 }); t_(c, '230 °C · sans rinçage', 150, 1455, 22, { col: GRIS }); }
  } else {
    // le téléphone en grand
    let ecran;
    if (t < 9.4) ecran = ecranRecherche(6.5);
    else if (t < 14.2) ecran = ecranSite(9.6);
    else if (t < 17.8) ecran = ecranProduit(14.3);
    else ecran = ecranPaiement(18.1);
    const entree = t < 6.7 ? eOut(seg(t, 6.2, 6.7)) : 1;
    telephone(c, 540 - PW * 1.55 / 2, 520 + (1 - entree) * 400, 1.55, ecran, t);
    // widgets flous en arrière-plan qui flottent
    c.save(); c.globalAlpha = .55; c.filter = 'blur(6px)'; horloge(c, -60, 560, 220, 19, 2); meteo(c, 860, 1400, 220, t); c.restore();
  }
  c.restore();

  // le logo à la fin
  if (t >= 24) {
    const k = seg(t, 24.0, 24.6);
    c.fillStyle = `rgba(246,239,230,${k})`; c.fillRect(0, 0, W, H);
    if (IMG.logoG) { const s = eBack(seg(t, 24.3, 24.8)); c.save(); c.translate(540, 860); c.scale(s, s); c.shadowColor = 'rgba(40,20,10,.3)'; c.shadowBlur = 40; c.drawImage(IMG.logoG, -200, -200, 400, 400); c.restore(); }
    t_(c, 'Le voile anti-météo.', 540, 1180, 44, { serif: true, align: 'center', a: ap(t, 24.8) });
    t_(c, 'glossbyk.com', 540, 1250, 32, { align: 'center', col: OR, w: 600, a: ap(t, 25.1), ls: 2 });
  }

  // narration écrite
  titre(c, t, .3, 2.95, [['Samedi, ', 0], ['19 h.', 1]]);
  titre(c, t, 3.2, 6.1, [['Tu as une soirée… ', 0], ['il pleut.', 1]]);
  titre(c, t, 6.5, 9.3, [['Tu tapes ', 0], ['« cheveux qui gonflent ».', 1]], 200);
  titre(c, t, 9.6, 14.1, [['Gloss By K ', 1], ["s'ouvre.", 0]], 200);
  titre(c, t, 14.3, 17.7, [['Anti-frisottis. ', 0], ['72h*.', 1]], 200);
  titre(c, t, 18.1, 20.7, [['Trois clics ', 1], ['suffisent.', 0]], 200);
  titre(c, t, 20.9, 23.9, [['La météo n\'a plus ', 0], ['le dernier mot.', 1]]);
  if (t > 20.9 && t < 23.9) t_(c, '*Selon le type de cheveux, le coiffage et la météo.', 540, 1820, 22, { align: 'center', col: GRIS, a: ap(t, 21) });
}

window.DUREE = PC_DUREE;
window.draw = pcDraw;
window.pret = (async () => {
  await window.pret;
  await Promise.all([charge('satin', '../assets/packshot-satin.jpg'), charge('modele', '../assets/modele-canape.jpg'), charge('logo', '../assets/logo.png'), charge('logoG', '../assets/logo-fr.png')]);
  await document.fonts.load(`600 40px Inter`, 'A'); await document.fonts.load('500 40px "Playfair Display"', 'A');
  pcDraw(0); return true;
})();
