/* Mirror 72H — version luxe, minimaliste. 25 s, 9:16, sans musique (la marque ajoute la sienne).
   Voix off à générer dans ElevenLabs à partir de SOUS_TITRES (mêmes instants que le fichier .srt).
   ?st=0 : sans sous-titres incrustés. */
'use strict';

const ST = new URLSearchParams(location.search).get('st') !== '0';
const OR = '#d8b46a', OR_CLAIR = '#f3dfae', OR_FONCE = '#9c7230', CREME = '#f4ead8';

// la voix off : [début, fin, texte affiché]
const SOUS_TITRES = [
  [0.6, 3.0, "Il y a des choses qu'on ne contrôle pas."],
  [3.5, 6.2, "La pluie. L'humidité. Le temps qui passe."],
  [6.6, 8.8, "Et puis, il y a ce que l'on décide."],
  [9.4, 12.8, "Un fini miroir… qui tient 72 heures."],
  [13.6, 17.6, "Anti-frisottis. Anti-humidité. Protection thermique jusqu'à 230 °C."],
  [18.2, 20.6, "Mirror 72H. Gloss By K."],
  [21.4, 24.2, "La météo n'a plus le dernier mot."],
];
window.SOUS_TITRES = SOUS_TITRES;

// grain de film
const grain = document.createElement('canvas'); grain.width = grain.height = 256;
{ const g = grain.getContext('2d'), im = g.createImageData(256, 256), r = rng(99);
  for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (r() - .5) * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  g.putImageData(im, 0, 0); }
let grainPat = null;

function noir(c) { c.fillStyle = '#000'; c.fillRect(-300, -300, W + 600, H + 600); }
function lueur(c, x, y, r, col, a) {
  const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0));
  c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
}
function texteLuxe(c, txt, x, y, o) {
  c.save(); c.globalAlpha = o.a == null ? 1 : o.a; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `${o.style || ''} ${o.w || 300} ${o.size}px ${o.fam || 'Montserrat'}`; c.letterSpacing = (o.ls || 0) + 'px';
  if (o.grad) { const g = c.createLinearGradient(0, y - o.size / 2, 0, y + o.size / 2); g.addColorStop(0, OR_CLAIR); g.addColorStop(.55, OR); g.addColorStop(1, OR_FONCE); c.fillStyle = g; }
  else c.fillStyle = o.col || CREME;
  if (o.glow) { c.shadowColor = 'rgba(216,180,106,.45)'; c.shadowBlur = o.glow; }
  c.fillText(txt, x + (o.ls || 0) / 2, y); c.letterSpacing = '0px'; c.restore();
}
const fondu = (t, a, b, d = .4) => clamp(Math.min((t - a) / d, (b - t) / d));

// ---------- la goutte de pluie (0 – 3,2 s) ----------
function plan1(c, t) {
  noir(c);
  c.save(); camera(c, t, 1 + .07 * seg(t, 0, 3.2), 540, 1100, 0);
  lueur(c, 540, 300, 900, 'rgba(120,130,150,A)', .16);
  const sol = 1150;
  // surface noire brillante
  const sg = c.createLinearGradient(0, sol, 0, H); sg.addColorStop(0, 'rgba(40,40,46,1)'); sg.addColorStop(.15, 'rgba(8,8,10,1)'); sg.addColorStop(1, '#000');
  c.fillStyle = sg; c.fillRect(-300, sol, W + 600, H);
  c.fillStyle = 'rgba(200,205,220,.22)'; c.fillRect(-300, sol, W + 600, 2);
  const tImpact = 1.6;
  if (t < tImpact) {
    const k = eIn(seg(t, .2, tImpact)), y = lerp(-80, sol - 34, k);
    const g = c.createRadialGradient(530, y - 10, 2, 540, y, 46);
    g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(.35, 'rgba(190,200,215,.55)'); g.addColorStop(1, 'rgba(120,130,150,.15)');
    c.fillStyle = g; c.beginPath(); c.moveTo(540, y - 62); c.bezierCurveTo(556, y - 30, 572, y - 6, 572, y + 12); c.arc(540, y + 12, 32, 0, Math.PI); c.bezierCurveTo(508, y - 6, 524, y - 30, 540, y - 62); c.fill();
    c.strokeStyle = 'rgba(243,223,174,.6)'; c.lineWidth = 2; c.stroke();
    // reflet
    c.globalAlpha = .25 * k; c.fillStyle = 'rgba(200,210,230,1)'; c.beginPath(); c.ellipse(540, 2 * sol - y + 10, 22, 40, 0, 0, 7); c.fill(); c.globalAlpha = 1;
  } else {
    const k = seg(t, tImpact, 3.2);
    for (let i = 0; i < 4; i++) {
      const kk = clamp(k * 1.25 - i * .14); if (kk <= 0) continue;
      c.strokeStyle = `rgba(243,223,174,${.7 * (1 - kk)})`; c.lineWidth = 3 - i * .5;
      c.beginPath(); c.ellipse(540, sol, 30 + eOut(kk) * 520, (30 + eOut(kk) * 520) * .09, 0, 0, 7); c.stroke();
    }
    const r = rng(3);
    for (let i = 0; i < 14; i++) {
      const a = Math.PI * (1.05 + r() * .9), v = 260 + r() * 380, tt = (t - tImpact) * .9;
      const x = 540 + Math.cos(a) * v * tt, y = sol + Math.sin(a) * v * tt * 1.4 + 900 * tt * tt;
      if (y < sol + 4) { c.fillStyle = `rgba(230,236,245,${.9 * (1 - k)})`; c.beginPath(); c.arc(x, y, 3 + r() * 5, 0, 7); c.fill(); }
    }
    lueur(c, 540, sol, 300, 'rgba(243,223,174,A)', .25 * (1 - k));
  }
  c.restore();
}

// ---------- cheveux en très gros plan ----------
// front : position x du passage de la lumière dorée (à gauche : lisse et miroir, à droite : frisottis)
function cheveux(c, t, front, spec) {
  noir(c);
  lueur(c, 860, 200, 1100, 'rgba(120,72,30,A)', .35);
  const r = rng(8), n = 96;
  const sweepY = lerp(-200, 2100, spec);
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1), x0 = -60 + u * 1200 + (r() - .5) * 16, w = 3 + r() * 4;
    const f = clamp((x0 - front) / 160 + .5);
    const col = ['#1c0e07', '#2a160b', '#3b2112', '#140904'][i % 4];
    const pts = [];
    for (let y = -120; y <= 2040; y += 18) {
      const s = y / 1920;
      let x = x0 + 150 * Math.sin(s * Math.PI * 1.15 + .5 + t * .08) + 30 * Math.sin(t * .3 + u * 3);
      x += f * (noise(s * 16 + i * 3.1) * 46 + noise(s * 45 + i) * 16);
      pts.push([x, y + f * noise(s * 9 + i) * 10]);
    }
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = col; c.lineWidth = w; poly(c, pts, false); c.stroke();
    // lumière : bande miroir nette sur les mèches lisses, éclats cassés sur les frisottis
    const g = c.createLinearGradient(0, sweepY - 220, 0, sweepY + 220);
    const a = (1 - f) * .9;
    g.addColorStop(0, 'rgba(243,223,174,0)'); g.addColorStop(.5, `rgba(250,232,190,${a})`); g.addColorStop(1, 'rgba(243,223,174,0)');
    c.strokeStyle = g; c.lineWidth = w * .55; poly(c, pts, false); c.stroke();
    if (f > .05) {
      c.strokeStyle = `rgba(216,180,106,${.35 * f})`; c.lineWidth = 1.5;
      for (let k = 0; k < pts.length - 3; k += 7 + (i % 5)) { if (r() < .5) { c.beginPath(); c.moveTo(pts[k][0], pts[k][1]); c.lineTo(pts[k + 2][0], pts[k + 2][1]); c.stroke(); } }
    }
    // lueur générale douce sur le côté éclairé
    if (f < .95) { c.strokeStyle = `rgba(160,100,50,${.25 * (1 - f)})`; c.lineWidth = w * 1.6; c.globalAlpha = .4; poly(c, pts, false); c.stroke(); c.globalAlpha = 1; }
  }
  // frisottis volants
  const fr = rng(21);
  c.strokeStyle = 'rgba(216,180,106,.45)'; c.lineWidth = 1.6;
  for (let i = 0; i < 160; i++) {
    const x = fr() * 1200 - 60, y = fr() * 1920; const f = clamp((x - front) / 160 + .5); if (f < .1) continue;
    c.globalAlpha = f; c.beginPath(); let px = x, py = y, ang = fr() * 7; c.moveTo(px, py);
    for (let k = 0; k < 6; k++) { ang += (fr() - .5) * 1.6 + Math.sin(t + i) * .05; px += Math.cos(ang) * 9; py += Math.sin(ang) * 9; c.lineTo(px, py); }
    c.stroke();
  }
  c.globalAlpha = 1;
  // ligne de lumière dorée qui transforme
  if (front > -200 && front < 1300) {
    const g = c.createLinearGradient(front - 120, 0, front + 120, 0);
    g.addColorStop(0, 'rgba(243,223,174,0)'); g.addColorStop(.5, 'rgba(255,240,200,.55)'); g.addColorStop(1, 'rgba(243,223,174,0)');
    c.fillStyle = g; c.fillRect(front - 120, 0, 240, H);
  }
}

function plan2(c, t) { // frisottis, 3,2 – 6,4
  c.save(); camera(c, t, 1.08 - .04 * seg(t, 3.2, 6.4), 540, 960, 0);
  cheveux(c, t, -2000, .5);
  // fines gouttes floues au premier plan
  rain(c, t * .35, 26, 7, .18, 1200, 120, -.05);
  c.restore();
}

// ---------- la goutte d'or (6,4 – 8,6) ----------
function plan3(c, t) {
  noir(c);
  c.save(); camera(c, t, 1 + .05 * seg(t, 6.4, 8.6), 540, 600, 0);
  lueur(c, 540, 420, 700, 'rgba(216,180,106,A)', .22);
  // le tube, bouchon vers le bas, entre par le haut : on voit le bas de l'étiquette et le bouchon noir
  const Y = -110 + 30 * eOut(seg(t, 6.4, 7.0));
  tube(c, { x: 540, y: Y, s: .95, shadow: false, face: null, sweep: seg(t, 6.4, 8.0) * 1.4 - .2 });
  const ty = Y + 452 * .95;
  const grow = eOut(seg(t, 6.9, 7.8));
  const fall = eIn(seg(t, 7.8, 8.6));
  const y = ty + 20 + grow * 24 + fall * 1500;
  const rx = 10 + grow * 22, ry = 12 + grow * 30 + fall * 10;
  const g = c.createRadialGradient(540 - rx * .3, y - ry * .3, 2, 540, y, ry * 1.2);
  g.addColorStop(0, '#fff6d6'); g.addColorStop(.35, '#f0cf78'); g.addColorStop(.8, '#b8862e'); g.addColorStop(1, '#7a5418');
  c.fillStyle = g; c.beginPath(); c.ellipse(540, y, rx, ry, 0, 0, 7); c.fill();
  if (fall < .02) { c.fillStyle = '#e2bb62'; c.fillRect(540 - rx * .5, ty, rx, y - ty); }
  const pr = rng(4); for (let i = 0; i < 20; i++) { c.fillStyle = `rgba(255,250,230,${.4 + .5 * pr()})`; c.beginPath(); c.arc(540 + (pr() - .5) * rx * 1.4, y + (pr() - .5) * ry * 1.4, .8 + pr() * 1.6, 0, 7); c.fill(); }
  c.restore();
}

// ---------- la transformation, 72H (8,6 – 13,4) ----------
function plan4(c, t) {
  c.save(); camera(c, t, 1.04 + .04 * seg(t, 8.6, 13.4), 540, 960, 0);
  const front = lerp(-250, 1400, eIO(seg(t, 8.65, 10.6)));
  cheveux(c, t, front, seg(t, 10.4, 13.2));
  c.restore();
  const flash = pulse(t, 8.62, .02, .45);
  if (flash) { c.fillStyle = `rgba(255,238,200,${flash * .8})`; c.fillRect(0, 0, W, H); }
  // 72H, très fin, comme une gravure
  const a = fondu(t, 10.6, 13.3, .5);
  if (a > 0) {
    c.fillStyle = `rgba(0,0,0,${.45 * a})`; c.fillRect(0, 0, W, H);
    texteLuxe(c, '72H', 540, 900, { size: 300, w: 300, ls: lerp(10, 34, seg(t, 10.6, 13.3)), grad: true, a, glow: 40 });
    texteLuxe(c, 'FINI MIROIR', 540, 1100, { size: 34, w: 400, ls: 16, a: a * .9 });
  }
}

// ---------- le tube révélé (13,4 – 18) ----------
function plan5(c, t) {
  noir(c);
  c.save(); camera(c, t, 1 + .06 * seg(t, 13.4, 18), 540, 980, 0);
  const lum = eOut(seg(t, 13.5, 15.0));
  // pluie qui tombe derrière et s'arrête au-dessus du tube
  c.save(); c.globalAlpha = .55 * lum; rain(c, t, 60, 11, .35, 1600, 70, -.04); c.restore();
  c.fillStyle = '#000'; c.beginPath(); c.ellipse(540, 980, 330, 620, 0, 0, 7); c.fill();
  lueur(c, 540, 380, 650, 'rgba(216,180,106,A)', .32 * lum);
  // cône de lumière
  const cone = c.createLinearGradient(0, 0, 0, 1460); cone.addColorStop(0, `rgba(243,223,174,${.18 * lum})`); cone.addColorStop(1, 'rgba(243,223,174,0)');
  c.fillStyle = cone; c.beginPath(); c.moveTo(470, -100); c.lineTo(610, -100); c.lineTo(860, 1460); c.lineTo(220, 1460); c.closePath(); c.fill();
  // sol miroir
  c.fillStyle = 'rgba(20,16,12,1)'; c.fillRect(-300, 1460, W + 600, 600);
  c.save(); c.beginPath(); c.rect(-300, 1460, W + 600, 600); c.clip(); c.globalAlpha = .28 * lum; c.translate(0, 2 * 1460); c.scale(1, -1);
  tube(c, { x: 540, y: 940, s: 1.14, shadow: false, face: null, sweep: seg(t, 13.8, 15.4) * 1.5 - .25 }); c.restore();
  const fg = c.createLinearGradient(0, 1460, 0, 1900); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(1, 'rgba(0,0,0,1)'); c.fillStyle = fg; c.fillRect(-300, 1460, W + 600, 460);
  c.save(); c.globalAlpha = .15 + .85 * lum;
  tube(c, { x: 540, y: 940, s: 1.14, shadow: false, face: null, sweep: seg(t, 13.8, 15.4) * 1.5 - .25 });
  c.restore();
  // gouttes qui glissent sur une bulle invisible
  const r = rng(30);
  for (let i = 0; i < 9; i++) { const ph = ((t - 13.4) * .8 + r()) % 1, an = Math.PI * (1.2 + r() * .6);
    const x = 540 + Math.cos(an) * (335 + ph * 40), y = 980 + Math.sin(an) * 625 + ph * ph * 300;
    c.fillStyle = `rgba(230,236,245,${.7 * (1 - ph) * lum})`; c.beginPath(); c.ellipse(x, y, 4, 7, 0, 0, 7); c.fill(); }
  c.strokeStyle = `rgba(243,223,174,${.12 * lum})`; c.lineWidth = 2; c.beginPath(); c.ellipse(540, 980, 335, 625, 0, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
  c.restore();
}

// ---------- détail de l'étiquette (18 – 21) ----------
function plan6(c, t) {
  noir(c);
  const k = eIO(seg(t, 18.0, 21.0));
  c.save();
  lueur(c, 540, 900, 900, 'rgba(216,180,106,A)', .16);
  tube(c, { x: 540, y: lerp(830, 700, k), s: 1.8, shadow: false, face: null, sweep: seg(t, 18.2, 20.2) * 1.5 - .25 });
  c.restore();
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(0,0,0,.7)'); g.addColorStop(.25, 'rgba(0,0,0,0)'); g.addColorStop(.75, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.8)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
}

// ---------- signature (21 – 25) ----------
function plan7(c, t) {
  noir(c);
  lueur(c, 540, 720, 700, 'rgba(216,180,106,A)', .14 * eOut(seg(t, 21.0, 22.0)));
  const a1 = eOut(seg(t, 21.1, 21.9));
  if (logo.complete && logo.naturalWidth) {
    c.save(); c.globalAlpha = a1; c.translate(540, 700); const s = lerp(.94, 1, a1); c.scale(s, s);
    c.drawImage(logo, -230, -230, 460, 460); c.restore();
    sparkle(c, 540 + 160, 600, 30, seg(t, 22.0, 22.4) * (1 - seg(t, 22.4, 23.0)), t * .5);
  }
  texteLuxe(c, 'MIRROR 72H', 540, 1040, { size: 50, w: 300, ls: 22, a: eOut(seg(t, 21.6, 22.3)), grad: true });
  c.save(); c.globalAlpha = eOut(seg(t, 21.6, 22.3)); c.strokeStyle = OR; c.lineWidth = 1.5; c.beginPath(); c.moveTo(470, 1100); c.lineTo(610, 1100); c.stroke(); c.restore();
  texteLuxe(c, "La météo n'a plus le dernier mot.", 540, 1180, { size: 48, w: 500, style: 'italic', fam: 'Playfair Display', a: eOut(seg(t, 21.5, 22.4)) });
  texteLuxe(c, 'GLOSSBYK.COM', 540, 1560, { size: 30, w: 400, ls: 12, col: OR, a: eOut(seg(t, 22.6, 23.2)) });
}

// ---------- sous-titres ----------
function sousTitres(c, t) {
  if (!ST) return;
  for (const [a, b, txt] of SOUS_TITRES) {
    if (t < a - .05 || t > b + .25) continue;
    if (a > 21) continue; // la dernière phrase est déjà écrite sur la signature
    const al = clamp(Math.min((t - a + .05) / .25, (b + .25 - t) / .25));
    c.save(); c.font = `400 40px Montserrat`; c.letterSpacing = '1px';
    const lines = wrap(c, txt, 860);
    lines.forEach((l, i) => {
      const y = 1560 + (i - (lines.length - 1)) * 54;
      c.globalAlpha = al; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.shadowColor = 'rgba(0,0,0,.9)'; c.shadowBlur = 14; c.fillStyle = CREME; c.fillText(l, 540, y);
    });
    c.restore();
  }
}

function planAt(c, t) {
  if (t < 3.2) plan1(c, t); else if (t < 6.4) plan2(c, t); else if (t < 8.6) plan3(c, t); else if (t < 13.4) plan4(c, t);
  else if (t < 18.0) plan5(c, t); else if (t < 21.0) plan6(c, t); else plan7(c, t);
}

function luxDraw(t) {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  planAt(ctx, t);
  // fondus au noir entre les plans
  const noirs = [[3.2, .35, .3], [6.4, .3, .25], [13.4, .35, .4], [21.0, .35, .35]];
  let n = 0; for (const [m, avant, apres] of noirs) { if (t > m - avant && t < m + apres) n = Math.max(n, t < m ? seg(t, m - avant, m) : 1 - seg(t, m, m + apres)); }
  n = Math.max(n, 1 - seg(t, 0, .35), seg(t, 24.6, 25));
  if (n > 0) { ctx.fillStyle = `rgba(0,0,0,${n})`; ctx.fillRect(0, 0, W, H); }
  // éclat de lumière à la coupe 18 s
  const fl = pulse(t, 18.0, .04, .3); if (fl) { ctx.fillStyle = `rgba(255,240,205,${fl * .5})`; ctx.fillRect(0, 0, W, H); }
  sousTitres(ctx, t);
  // vignette et grain
  const v = ctx.createRadialGradient(540, 960, 500, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  if (!grainPat) grainPat = ctx.createPattern(grain, 'repeat');
  ctx.save(); ctx.globalAlpha = .045; ctx.globalCompositeOperation = 'overlay';
  ctx.translate(Math.floor(hash(t * 30) * 256), Math.floor(hash(t * 30 + 7) * 256)); ctx.fillStyle = grainPat; ctx.fillRect(-256, -256, W + 512, H + 512);
  ctx.restore();
}

window.draw = luxDraw;
window.pret = (async () => {
  await window.pret;
  await Promise.all(['300 40px Montserrat', '400 40px Montserrat', 'italic 500 40px "Playfair Display"'].map(f => document.fonts.load(f, 'Aéà')));
  luxDraw(0);
  return true;
})();
