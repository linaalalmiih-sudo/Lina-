/* Teaser Black Friday Gloss By K : un interrupteur sur fond crème, on éteint, « BLACK FRIDAY · BIENTÔT » s'allume dans le noir,
   le tube Mirror 72H se dévoile, puis la date. 10 s, 9:16, en boucle (la fin rallume la lumière = première image). Sans son.
   ?date=… pour changer la date affichée. */
'use strict';
const BF_DUREE = 10;
const BF_DATE = new URLSearchParams(location.search).get('date') || 'VENDREDI 27.11';
const OFF = 0.85, ON = 9.55; // instants où l'on éteint puis rallume

function plaque(c, cx, cy, t, allume) {
  const s = 440;
  c.save(); c.translate(cx, cy);
  c.shadowColor = allume ? 'rgba(60,35,20,.35)' : 'rgba(0,0,0,.6)'; c.shadowBlur = 50; c.shadowOffsetY = 26;
  const g = c.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2); g.addColorStop(0, '#7a4a33'); g.addColorStop(.5, '#5a3322'); g.addColorStop(1, '#3d2116');
  c.fillStyle = g; c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 46); c.fill(); c.shadowColor = 'transparent';
  // relief
  const hl = c.createLinearGradient(0, -s / 2, 0, s / 2); hl.addColorStop(0, 'rgba(255,220,190,.22)'); hl.addColorStop(.3, 'rgba(255,220,190,0)'); hl.addColorStop(1, 'rgba(0,0,0,.25)');
  c.fillStyle = hl; c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, 46); c.fill();
  c.strokeStyle = 'rgba(255,230,200,.15)'; c.lineWidth = 3; c.beginPath(); c.roundRect(-s / 2 + 6, -s / 2 + 6, s - 12, s - 12, 40); c.stroke();
  // vis
  for (const x of [-140, 140]) { const vg = c.createRadialGradient(x - 4, -4, 1, x, 0, 14); vg.addColorStop(0, '#e9cfa0'); vg.addColorStop(1, '#8a6436');
    c.fillStyle = vg; c.beginPath(); c.arc(x, 0, 13, 0, 7); c.fill(); c.strokeStyle = '#5a3d1e'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - 8, -4); c.lineTo(x + 8, 4); c.stroke(); }
  // rosace et levier
  const rg = c.createRadialGradient(-12, -12, 4, 0, 0, 58); rg.addColorStop(0, '#f3dcae'); rg.addColorStop(.5, '#b8893c'); rg.addColorStop(1, '#6e4a1c');
  c.fillStyle = rg; c.beginPath(); c.arc(0, 0, 54, 0, 7); c.fill();
  c.fillStyle = '#3a2412'; c.beginPath(); c.arc(0, 0, 30, 0, 7); c.fill();
  // position du levier : -1 en haut (allumé), +1 en bas (éteint)
  let p = 1;
  if (t < OFF) p = -1; else if (t < OFF + .12) p = lerp(-1, 1, eOut(seg(t, OFF, OFF + .12)));
  if (t >= ON) p = lerp(1, -1, eOut(seg(t, ON, ON + .12)));
  const L = 120;
  c.save(); c.rotate(lerp(Math.PI - .12, .12, (p + 1) / 2)); // levier en haut quand allumé, en bas quand éteint
  const lg = c.createLinearGradient(-16, 0, 16, 0); lg.addColorStop(0, '#7a5426'); lg.addColorStop(.45, '#f6dfb0'); lg.addColorStop(1, '#8a6232');
  c.fillStyle = lg; c.beginPath(); c.moveTo(-14, 0); c.lineTo(-9, L); c.lineTo(9, L); c.lineTo(14, 0); c.closePath(); c.fill();
  c.beginPath(); c.arc(0, L, 15, 0, 7); c.fill();
  c.restore();
  c.restore();
}

function bfDraw(t) {
  const c = ctx;
  c.setTransform(DPR, 0, 0, DPR, 0, 0);
  const allume = t < OFF || t >= ON;
  if (allume) {
    const g = c.createRadialGradient(540, 820, 100, 540, 960, 1300); g.addColorStop(0, '#fbf7f0'); g.addColorStop(1, '#ece2d3');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.save(); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#2a1712'; c.font = 'italic 500 104px "Playfair Display"'; c.fillText('Pas si vite…', 540, 470);
    c.fillStyle = '#7a6556'; c.font = '500 34px Montserrat'; c.fillText('Éteins la lumière une dernière fois', 540, 565);
    c.restore();
    plaque(c, 540, 1000, t, true);
    if (logo.complete && logo.naturalWidth) c.drawImage(logo, 540 - 70, 1500, 140, 140);
    return;
  }
  // dans le noir
  const k = seg(t, OFF, OFF + .25);
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  const amb = c.createRadialGradient(540, 520, 40, 540, 700, 1100); amb.addColorStop(0, 'rgba(70,40,25,.55)'); amb.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = amb; c.fillRect(0, 0, W, H);
  c.save(); c.globalAlpha = .55 * (1 - eIO(seg(t, 2.0, 3.2))); plaque(c, 540, 1000, t, false); c.restore();
  // le tube se dévoile au contre-jour derrière l'interrupteur
  const rev = eIO(seg(t, 2.2, 3.6));
  if (rev > 0) {
    c.save(); c.globalAlpha = rev;
    const halo = c.createRadialGradient(540, 1000, 40, 540, 1000, 520); halo.addColorStop(0, 'rgba(216,180,106,.38)'); halo.addColorStop(1, 'rgba(216,180,106,0)');
    c.fillStyle = halo; c.fillRect(0, 400, W, 1200);
    c.restore();
    c.save(); c.globalAlpha = rev;
    tube(c, { x: 540, y: 1000 - 30 * (1 - rev), s: .68, shadow: false, face: null, sweep: seg(t, 3.0, 5.0) * 1.5 - .25 });
    c.restore();
  }
  // néon BLACK FRIDAY (scintillement à l'allumage)
  const fl = t < OFF + .35 ? 0 : t < OFF + .9 ? (Math.sin(t * 90) > 0 ? 1 : .25) * seg(t, OFF + .35, OFF + .9) : 1;
  if (fl > 0) {
    c.save(); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '800 118px Montserrat'; c.letterSpacing = '6px';
    for (const [b, a] of [[60, .55], [25, .8], [0, 1]]) { c.shadowColor = `rgba(255,236,205,${a})`; c.shadowBlur = b; c.fillStyle = `rgba(255,250,240,${fl})`; c.fillText('BLACK FRIDAY', 543, 360); }
    c.letterSpacing = '14px'; c.font = '700 34px Montserrat'; c.shadowBlur = 16; c.fillStyle = `rgba(243,223,174,${fl})`; c.fillText('BIENTÔT', 547, 450);
    c.restore();
  }
  // la date
  const d1 = eOut(seg(t, 4.6, 5.2)), d2 = eOut(seg(t, 5.4, 6.0));
  c.save(); c.textAlign = 'center'; c.textBaseline = 'middle';
  c.globalAlpha = d1; c.fillStyle = '#f4ead8'; c.font = 'italic 500 46px "Playfair Display"'; c.shadowColor = 'rgba(255,236,205,.6)'; c.shadowBlur = 18;
  c.fillText("Tout s'illumine le", 540, 1440);
  c.globalAlpha = d2; c.font = '800 70px Montserrat'; c.letterSpacing = '6px'; c.fillStyle = '#f3dfae'; c.shadowBlur = 30; c.fillText(BF_DATE, 543, 1530);
  c.globalAlpha = d2 * .8; c.letterSpacing = '10px'; c.font = '500 26px Montserrat'; c.fillStyle = '#d8c7ad'; c.shadowBlur = 0; c.fillText('GLOSS BY K', 545, 1625);
  c.restore();
  if (k < 1) { c.fillStyle = `rgba(255,255,255,${(1 - k) * .25})`; c.fillRect(0, 0, W, H); }
}

window.DUREE = BF_DUREE;
window.draw = bfDraw;
window.pret = (async () => { await window.pret; await document.fonts.load('italic 500 40px "Playfair Display"', 'A'); bfDraw(0); return true; })();
