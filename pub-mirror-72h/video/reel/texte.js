/* Calque texte (fond transparent) posé sur le montage des vraies images.
   ?st=0 : sans sous-titres. Instants = ceux du montage (reel/montage.py). */
'use strict';
const STR = new URLSearchParams(location.search).get('st') !== '0';
const GOLD = '#d8b46a', GOLD_L = '#f3dfae', GOLD_D = '#9c7230', CREAM = '#f4ead8';

const VOIX_OFF = [
  [0.3, 2.6, "Il y a des choses qu'on ne contrôle pas."],
  [3.0, 6.3, 'Même humidité. Mêmes cheveux. Une seule différence.'],
  [6.8, 10.0, "Quelques gouttes. Sans rinçage. À l'amla et à la biotine."],
  [10.4, 12.9, "Protection thermique jusqu'à 230 °C."],
  [13.2, 17.8, 'Anti-frisottis. Anti-humidité. Un fini miroir… jusqu\'à 72 heures.'],
  [18.3, 20.7, 'Mirror 72H. Gloss By K.'],
  [21.4, 24.2, "La météo n'a plus le dernier mot."],
];
window.VOIX_OFF = VOIX_OFF;

function txt(c, s, x, y, o) {
  c.save(); c.globalAlpha = o.a == null ? 1 : o.a; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `${o.style || ''} ${o.w || 300} ${o.size}px ${o.fam || 'Montserrat'}`; c.letterSpacing = (o.ls || 0) + 'px';
  if (o.grad) { const g = c.createLinearGradient(0, y - o.size / 2, 0, y + o.size / 2); g.addColorStop(0, GOLD_L); g.addColorStop(.55, GOLD); g.addColorStop(1, GOLD_D); c.fillStyle = g; }
  else c.fillStyle = o.col || CREAM;
  c.shadowColor = 'rgba(0,0,0,.75)'; c.shadowBlur = o.blur || 18;
  c.fillText(s, x + (o.ls || 0) / 2, y); c.restore();
}

function overlay(t) {
  const c = ctx;
  c.setTransform(DPR, 0, 0, DPR, 0, 0); c.clearRect(0, 0, W, H);

  // avant / après : fin filet doré autour de l'image
  if (t > 2.8 && t < 6.85) {
    const a = clamp(Math.min((t - 2.8) / .4, (6.85 - t) / .25));
    c.save(); c.globalAlpha = a; c.strokeStyle = GOLD; c.lineWidth = 2; c.strokeRect(40, 636, 1000, 648); c.restore();
    txt(c, 'LE TEST', 540, 560, { size: 30, w: 400, ls: 14, col: GOLD, a });
  }
  // 72H sur le regard
  if (t > 15.3 && t < 18.05) {
    const a = clamp(Math.min((t - 15.3) / .5, (18.05 - t) / .3));
    txt(c, '72H', 540, 330, { size: 190, w: 300, ls: lerp(8, 22, seg(t, 15.3, 18)), grad: true, a, blur: 30 });
    txt(c, 'FINI MIROIR', 540, 470, { size: 30, w: 400, ls: 16, a: a * .95 });
  }
  // éclat sur le packshot
  if (t > 18.2 && t < 19.8) {
    const k = eIO(seg(t, 18.2, 19.8)), x = lerp(-300, 1400, k);
    c.save(); c.globalCompositeOperation = 'lighter';
    const g = c.createLinearGradient(x - 160, 0, x + 160, 400); g.addColorStop(0, 'rgba(255,230,190,0)'); g.addColorStop(.5, 'rgba(255,236,200,.22)'); g.addColorStop(1, 'rgba(255,230,190,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore();
  }
  // signature
  if (t > 21.0) {
    const a0 = eOut(seg(t, 21.0, 21.6));
    c.fillStyle = `rgba(8,4,2,${.5 * a0})`; c.fillRect(0, 0, W, H);
    const a1 = eOut(seg(t, 21.2, 22.0));
    if (logo.complete && logo.naturalWidth) {
      c.save(); c.globalAlpha = a1; c.translate(540, 600); const s = lerp(.94, 1, a1); c.scale(s, s);
      c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 40; c.drawImage(logo, -220, -220, 440, 440); c.restore();
    }
    const a2 = eOut(seg(t, 21.7, 22.4));
    txt(c, 'MIRROR 72H', 540, 930, { size: 50, w: 300, ls: 22, grad: true, a: a2 });
    c.save(); c.globalAlpha = a2; c.strokeStyle = GOLD; c.lineWidth = 1.5; c.beginPath(); c.moveTo(470, 990); c.lineTo(610, 990); c.stroke(); c.restore();
    txt(c, "La météo n'a plus le dernier mot.", 540, 1070, { size: 50, w: 500, style: 'italic', fam: 'Playfair Display', a: eOut(seg(t, 21.5, 22.4)) });
    txt(c, 'GLOSSBYK.COM', 540, 1560, { size: 32, w: 400, ls: 12, col: GOLD, a: eOut(seg(t, 22.6, 23.2)) });
  }
  // sous-titres
  if (STR) for (const [a, b, s] of VOIX_OFF) {
    if (t < a - .05 || t > b + .25 || a > 21) continue;
    const al = clamp(Math.min((t - a + .05) / .25, (b + .25 - t) / .25));
    c.save(); c.font = '500 40px Montserrat'; c.letterSpacing = '1px';
    const lines = wrap(c, s, 880);
    lines.forEach((l, i) => txt(c, l, 540, 1580 + (i - (lines.length - 1)) * 54, { size: 40, w: 500, ls: 1, a: al, blur: 16 }));
    c.restore();
  }
}

window.draw = overlay;
window.pret = (async () => {
  await window.pret;
  await Promise.all(['300 40px Montserrat', '400 40px Montserrat', '500 40px Montserrat', 'italic 500 40px "Playfair Display"'].map(f => document.fonts.load(f, 'Aéà')));
  overlay(0);
  return true;
})();
