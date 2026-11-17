/* Duo Iconic, version « grande marque de soin » : grands titres fins, sous-titres, fin précommande.
   Réutilise T, pill, fd, revelation de texte.js. Plans (glaze/montage_k.py) :
   A 0-2,5 lisseur · B 2,5-5 frisottis · C 5-7,5 problème · D 7,5-11,5 Glaze & Gaze · E 11,5-14,5 Mirror 72H
   F 14,5-17 test · G 17-21 mouvement · H 21-22,6 héros · I 22,6-25 précommande */
'use strict';
const VOIX_K = [
  [0.2, 2.3, 'Une heure de lisseur. Le brushing parfait.'],
  [2.7, 4.9, 'Et une goutte de pluie suffit… pour que tout gonfle.'],
  [5.2, 7.4, 'Sérums, masques, crèmes… tu as tout essayé.'],
  [7.8, 11.3, 'Étape 1 : Glaze & Gaze. La jelly qui glace tes cheveux.'],
  [11.7, 14.4, 'Étape 2 : Mirror 72H scelle ta coiffure. Elle ne bouge plus.'],
  [14.7, 16.9, 'Même eau. Mêmes cheveux. Une seule différence.'],
  [17.3, 20.8, 'Une brillance miroir… qui attire tous les regards.'],
  [21.1, 24.8, 'Le Duo Iconic. Seulement 50 coffrets. Réserve le tien.'],
];
window.VOIX_K = VOIX_K;

// grand titre fin, qui s'écarte doucement
function titre(c, t, s, a, b, y, o = {}) {
  if (t < a || t > b) return;
  const al = fd(t, a, b, .3), k = seg(t, a, b);
  T(c, s, 540, y, { size: o.size || 96, w: 300, ls: lerp(o.ls0 || 6, o.ls1 || 14, k), col: o.col || '#ffffff',
    a: al, blur: o.blur == null ? 30 : o.blur, sh: o.sh || 'rgba(0,0,0,.55)', grad: o.grad });
}

function overlayK(t) {
  const c = ctx;
  c.setTransform(DPR, 0, 0, DPR, 0, 0); c.clearRect(0, 0, W, H);

  titre(c, t, 'UNE HEURE.', .25, 2.45, 860);
  titre(c, t, 'UNE GOUTTE.', 2.65, 4.95, 860);
  titre(c, t, 'ET TOUT GONFLE.', 5.1, 7.45, 860, { size: 80 });

  // révélation Glaze & Gaze (mêmes animations que la première version, décalées de 1,5 s)
  if (t >= 7.35 && t < 11.65) { c.save(); c.globalAlpha = clamp(Math.min((t - 7.35) / .25, (11.65 - t) / .25)); revelation(c, t + 1.5); c.restore(); }

  if (t > 11.6 && t < 14.5) {
    titre(c, t, 'SCELLER.', 11.65, 14.45, 300, { size: 120 });
    T(c, 'ÉTAPE 2 · MIRROR 72H', 540, 410, { size: 32, w: 600, ls: 12, grad: true, a: fd(t, 11.8, 14.45), blur: 18 });
  }
  if (t > 14.5 && t < 17.05) {
    const a = fd(t, 14.5, 17.05, .3);
    T(c, "LE TEST À L'EAU", 540, 590, { size: 34, w: 600, ls: 14, col: CHOCO, blur: 0, a });
    c.save(); c.globalAlpha = a; c.strokeStyle = OR1; c.lineWidth = 2; c.strokeRect(40, 636, 1000, 648); c.restore();
  }
  titre(c, t, 'BRILLANCE MIROIR.', 17.15, 19.05, 330, { size: 70 });
  if (t > 19.1 && t < 21.0) {
    titre(c, t, '72H*', 19.15, 20.95, 340, { size: 170, grad: true, blur: 34 });
    T(c, '*Selon le type de cheveux, le coiffage et la météo.', 540, 1662, { size: 22, w: 400, col: 'rgba(255,255,255,.9)', a: fd(t, 19.15, 20.95), blur: 8 });
  }
  if (t > 21.0 && t < 22.75) {
    const a = fd(t, 21.05, 22.75, .3);
    T(c, 'LE DUO ICONIC', 540, 1440, { size: 70, w: 300, ls: lerp(14, 22, seg(t, 21, 22.7)), grad: true, a, blur: 30 });
    T(c, 'Glaze & Gaze + Mirror 72H', 540, 1535, { size: 46, w: 500, style: 'italic', fam: 'Playfair Display', col: '#fff6ea', a, blur: 20 });
  }
  if (t > 22.6) {
    const a0 = eOut(seg(t, 22.6, 23.0));
    const gr = c.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, `rgba(250,246,240,${.92 * a0})`); gr.addColorStop(1, 'rgba(250,246,240,0)');
    c.fillStyle = gr; c.fillRect(0, 0, W, 760);
    T(c, 'LE DUO ICONIC', 540, 220, { size: 56, w: 400, ls: 16, col: CHOCO, blur: 0, a: eOut(seg(t, 22.65, 23.05)) });
    T(c, 'Glaze & Gaze + Mirror 72H', 540, 305, { size: 48, w: 500, style: 'italic', fam: 'Playfair Display', col: OR3, blur: 0, a: eOut(seg(t, 22.8, 23.2)) });
    pill(c, 'PRÉCOMMANDE · 50 DUOS SEULEMENT', 540, 410, { size: 26, ls: 3, bg: CHOCO, col: OR2, a: eOut(seg(t, 23.0, 23.35)) });
    const k = eBack(seg(t, 23.3, 23.6)), beat = 1 + .03 * Math.max(0, Math.sin((t - 23.6) * Math.PI * 3));
    c.save(); c.translate(540, 1545); c.scale(k * beat, k * beat);
    const bg = c.createLinearGradient(0, -60, 0, 60); bg.addColorStop(0, '#f2d892'); bg.addColorStop(1, '#b8893c');
    c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 24; c.shadowOffsetY = 8;
    c.fillStyle = bg; c.beginPath(); c.roundRect(-400, -58, 800, 116, 58); c.fill(); c.shadowColor = 'transparent';
    c.fillStyle = CHOCO; c.font = '800 38px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('RÉSERVE LE TIEN 👇', 0, 3);
    c.restore();
    T(c, 'glossbyk.com', 540, 1645, { size: 40, w: 600, ls: 2, col: CHOCO, blur: 10, sh: 'rgba(255,255,255,.9)', a: eOut(seg(t, 23.5, 23.8)) });
  }
  if (STG) for (const [a, b, s] of VOIX_K) {
    if (t < a - .05 || t > b + .2 || a > 21) continue;
    const al = clamp(Math.min((t - a + .05) / .2, (b + .2 - t) / .2));
    c.save(); c.font = '500 38px Montserrat';
    const lines = wrap(c, s, 860), lh = 52, y0 = 1560 - (lines.length - 1) * lh;
    const w = Math.max(...lines.map(l => c.measureText(l).width)) + 52;
    c.globalAlpha = al * .45; c.fillStyle = '#140a05'; c.beginPath(); c.roundRect(540 - w / 2, y0 - 36, w, lines.length * lh + 20, 24); c.fill();
    c.globalAlpha = al; c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle';
    lines.forEach((l, i) => c.fillText(l, 540, y0 + i * lh));
    c.restore();
  }
}

window.draw = overlayK;
window.pret = (async () => { await window.pret; await document.fonts.load('300 40px Montserrat', 'A'); overlayK(0); return true; })();
