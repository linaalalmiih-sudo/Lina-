/* Pub « Duo Iconic » : Glaze & Gaze + Mirror 72H (précommande). Calque texte posé sur glaze/montage.py.
   ?st=0 : sans sous-titres. Plans : A 0-3 lisseur, B 3-6 frisottis, C 6-9 « tout essayé », D 9-13 révélation Glaze & Gaze,
   E 13-16,5 Mirror 72H, F 16,5-19 test à l'eau, G 19-22 regard, H 22-25 précommande. */
'use strict';
const STG = new URLSearchParams(location.search).get('st') !== '0';
const OR1 = '#d8b46a', OR2 = '#f3dfae', OR3 = '#9c7230', CHOCO = '#2a1712', CREME_ = '#f6ecdc';

const VOIX_DUO = [
  [0.2, 2.8, 'Une heure de lisseur. Le brushing parfait.'],
  [3.2, 5.9, 'Et une goutte de pluie suffit… pour que tout gonfle.'],
  [6.2, 8.9, 'Sérums, masques, crèmes… tu as tout essayé.'],
  [9.2, 12.8, 'Étape 1 : Glaze & Gaze. La jelly qui glace tes cheveux.'],
  [13.2, 16.3, 'Étape 2 : Mirror 72H scelle ta coiffure. Elle ne bouge plus.'],
  [16.6, 18.9, 'Même eau. Mêmes cheveux. Une seule différence.'],
  [19.2, 21.8, 'Une brillance miroir… qui attire tous les regards.'],
  [22.2, 24.8, 'Le Duo Iconic. Seulement 50 coffrets. Réserve le tien.'],
];
window.VOIX_DUO = VOIX_DUO;

function T(c, s, x, y, o) {
  c.save(); c.globalAlpha = o.a == null ? 1 : o.a; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `${o.style || ''} ${o.w || 400} ${o.size}px ${o.fam || 'Montserrat'}`; c.letterSpacing = (o.ls || 0) + 'px';
  if (o.grad) { const g = c.createLinearGradient(0, y - o.size / 2, 0, y + o.size / 2); g.addColorStop(0, OR2); g.addColorStop(.55, OR1); g.addColorStop(1, OR3); c.fillStyle = g; }
  else c.fillStyle = o.col || CREME_;
  c.shadowColor = o.sh || 'rgba(0,0,0,.6)'; c.shadowBlur = o.blur == null ? 16 : o.blur;
  c.fillText(s, x + (o.ls || 0) / 2, y); c.restore();
}
function pill(c, s, x, y, o) {
  c.save(); c.globalAlpha = o.a == null ? 1 : o.a;
  c.font = `${o.w || 600} ${o.size}px Montserrat`; c.letterSpacing = (o.ls || 0) + 'px';
  const w = c.measureText(s).width + 64, h = o.size * 2;
  c.fillStyle = o.bg || CHOCO; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, h / 2); c.fill();
  if (o.border) { c.strokeStyle = o.border; c.lineWidth = 2; c.stroke(); }
  c.fillStyle = o.col || OR2; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s, x + (o.ls || 0) / 2, y + 2);
  c.restore();
}
const fd = (t, a, b, d = .35) => clamp(Math.min((t - a) / d, (b - t) / d));

// la révélation de la jelly (9 – 13 s) : fond clair, reflets de « glaçage », gouttes de jelly dorée
function revelation(c, t) {
  const k = t - 9;
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#fbf4ea'); g.addColorStop(.6, '#f1e1c8'); g.addColorStop(1, '#e6cba4');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // vagues brillantes (le « glaçage »)
  for (let i = 0; i < 4; i++) {
    const y0 = 1180 + i * 70;
    const gg = c.createLinearGradient(0, y0 - 80, 0, y0 + 160);
    gg.addColorStop(0, 'rgba(232,170,80,0)'); gg.addColorStop(.5, `rgba(${226 - i * 10},${160 - i * 8},${70 - i * 6},${.32 + i * .1})`); gg.addColorStop(1, 'rgba(200,130,50,.0)');
    c.fillStyle = gg; c.beginPath(); c.moveTo(-50, H + 50);
    for (let x = -50; x <= W + 50; x += 20) c.lineTo(x, y0 + Math.sin(x * .006 + k * 1.4 + i) * 40 + Math.sin(x * .013 - k * .9) * 16);
    c.lineTo(W + 50, H + 50); c.closePath(); c.fill();
  }
  // reflet qui glisse sur la jelly
  c.save(); c.globalCompositeOperation = 'lighter';
  const sx = lerp(-400, 1500, eIO(seg(t, 9.3, 12.5)));
  const sg = c.createLinearGradient(sx - 220, 1100, sx + 220, 1700); sg.addColorStop(0, 'rgba(255,240,210,0)'); sg.addColorStop(.5, 'rgba(255,244,220,.45)'); sg.addColorStop(1, 'rgba(255,240,210,0)');
  c.fillStyle = sg; c.fillRect(0, 1000, W, 920); c.restore();
  // gouttes de jelly
  const r = rng(77);
  for (let i = 0; i < 9; i++) {
    const x = 120 + r() * 840, y0 = 200 + r() * 700, sz = 14 + r() * 26, ph = r() * 6;
    const y = y0 + Math.sin(k * 1.1 + ph) * 18 - k * 14;
    const dg = c.createRadialGradient(x - sz * .3, y - sz * .35, 1, x, y, sz * 1.1);
    dg.addColorStop(0, 'rgba(255,250,235,.95)'); dg.addColorStop(.35, 'rgba(244,196,110,.75)'); dg.addColorStop(1, 'rgba(196,128,40,.55)');
    c.globalAlpha = .55 * fd(t, 9.1, 13, .6); c.fillStyle = dg; c.beginPath(); c.ellipse(x, y, sz, sz * 1.12, 0, 0, 7); c.fill(); c.globalAlpha = 1;
  }
  const a1 = fd(t, 9.15, 13.05, .4), a2 = fd(t, 9.5, 13.05, .5), a3 = fd(t, 10.2, 13.05, .5), a4 = fd(t, 10.8, 13.05, .5);
  pill(c, 'EN PRÉCOMMANDE', 540, 330, { size: 26, ls: 6, a: a1, bg: CHOCO, col: OR2 });
  T(c, 'ÉTAPE 1 · GLACER', 540, 560, { size: 34, w: 600, ls: 14, col: OR3, blur: 0, a: a1 });
  // le nom, avec un reflet doré qui passe dessus
  c.save(); c.globalAlpha = a2;
  c.font = 'italic 500 132px "Playfair Display"'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const ng = c.createLinearGradient(lerp(-200, 1300, seg(t, 9.6, 12.4)) - 160, 0, lerp(-200, 1300, seg(t, 9.6, 12.4)) + 160, 0);
  ng.addColorStop(0, CHOCO); ng.addColorStop(.5, '#b07a2e'); ng.addColorStop(1, CHOCO);
  c.fillStyle = ng; c.fillText('Glaze & Gaze', 540, 720 + (1 - eOut(seg(t, 9.5, 10.2))) * 30);
  c.restore();
  T(c, 'la jelly glaçage · parfum mangue', 540, 860, { size: 40, w: 500, col: CHOCO, blur: 0, a: a3 });
  T(c, 'Brillance miroir · frisottis maîtrisés · sans effet carton', 540, 930, { size: 28, w: 400, col: '#5a3a22', blur: 0, a: a3 });
  pill(c, 'APRÈS LE SHAMPOING · 3 MIN · PUIS RINCER', 540, 1040, { size: 26, ls: 3, a: a4, bg: 'rgba(255,255,255,.75)', col: CHOCO, border: OR3 });
}

function overlayDuo(t) {
  const c = ctx;
  c.setTransform(DPR, 0, 0, DPR, 0, 0); c.clearRect(0, 0, W, H);

  if (t >= 8.85 && t < 13.15) {
    c.save(); c.globalAlpha = clamp(Math.min((t - 8.85) / .3, (13.15 - t) / .3)); revelation(c, t); c.restore();
  }
  // C : tout essayé
  if (t > 6.1 && t < 9.0) {
    const a = fd(t, 6.1, 9.0);
    ['SÉRUMS', 'MASQUES', 'CRÈMES'].forEach((m, i) => {
      const ai = a * eOut(seg(t, 6.3 + i * .55, 6.6 + i * .55));
      T(c, m, 540, 360 + i * 110, { size: 64, w: 300, ls: 18, col: '#fff', a: ai, blur: 24, sh: 'rgba(0,0,0,.7)' });
    });
  }
  // E : étape 2
  if (t > 13.1 && t < 16.6) {
    const a = fd(t, 13.1, 16.6);
    T(c, 'ÉTAPE 2 · SCELLER', 540, 230, { size: 34, w: 600, ls: 14, grad: true, a, blur: 20 });
    T(c, 'Mirror 72H', 540, 320, { size: 84, w: 500, style: 'italic', fam: 'Playfair Display', col: CREME_, a, blur: 24 });
    T(c, 'sur cheveux essorés · tient jusqu\'à 72h*', 540, 400, { size: 30, w: 500, col: CREME_, a: a * eOut(seg(t, 13.6, 14.0)) });
    T(c, '*Selon le type de cheveux, le coiffage et la météo.', 540, 1660, { size: 22, w: 400, col: 'rgba(246,236,220,.85)', a, blur: 8 });
  }
  // F : test à l'eau
  if (t > 16.5 && t < 19.05) {
    const a = fd(t, 16.5, 19.05, .3);
    T(c, "LE TEST À L'EAU", 540, 590, { size: 34, w: 600, ls: 14, col: CHOCO, blur: 0, a });
    c.save(); c.globalAlpha = a; c.strokeStyle = OR1; c.lineWidth = 2; c.strokeRect(40, 636, 1000, 648); c.restore();
  }
  // G : la phrase de la marque
  if (t > 19.1 && t < 22.0) {
    const a = fd(t, 19.1, 22.0, .45);
    T(c, 'Glace tes cheveux.', 540, 260, { size: 70, w: 500, style: 'italic', fam: 'Playfair Display', col: CREME_, a, blur: 26 });
    T(c, 'Attire tous les regards.', 540, 350, { size: 70, w: 500, style: 'italic', fam: 'Playfair Display', grad: true, a: a * eOut(seg(t, 19.6, 20.1)), blur: 26 });
  }
  // H : précommande
  if (t > 22.0) {
    const a0 = eOut(seg(t, 22.0, 22.5));
    const gr = c.createLinearGradient(0, 0, 0, 760); gr.addColorStop(0, `rgba(250,246,240,${.92 * a0})`); gr.addColorStop(1, 'rgba(250,246,240,0)');
    c.fillStyle = gr; c.fillRect(0, 0, W, 760);
    T(c, 'LE DUO ICONIC', 540, 220, { size: 56, w: 400, ls: 16, col: CHOCO, blur: 0, a: eOut(seg(t, 22.1, 22.6)) });
    T(c, 'Glaze & Gaze + Mirror 72H', 540, 305, { size: 48, w: 500, style: 'italic', fam: 'Playfair Display', col: OR3, blur: 0, a: eOut(seg(t, 22.3, 22.8)) });
    pill(c, 'PRÉCOMMANDE · 50 DUOS SEULEMENT', 540, 410, { size: 26, ls: 3, bg: CHOCO, col: OR2, a: eOut(seg(t, 22.6, 23.0)) });
    const k = eBack(seg(t, 23.1, 23.45)), beat = 1 + .03 * Math.max(0, Math.sin((t - 23.4) * Math.PI * 3));
    c.save(); c.translate(540, 1545); c.scale(k * beat, k * beat);
    const bg = c.createLinearGradient(0, -60, 0, 60); bg.addColorStop(0, '#f2d892'); bg.addColorStop(1, '#b8893c');
    c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 24; c.shadowOffsetY = 8;
    c.fillStyle = bg; c.beginPath(); c.roundRect(-400, -58, 800, 116, 58); c.fill(); c.shadowColor = 'transparent';
    c.fillStyle = CHOCO; c.font = '800 38px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('RÉSERVE LE TIEN 👇', 0, 3);
    c.restore();
    T(c, 'glossbyk.com', 540, 1645, { size: 40, w: 600, ls: 2, col: CHOCO, blur: 10, sh: 'rgba(255,255,255,.9)', a: eOut(seg(t, 23.3, 23.7)) });
  }
  // sous-titres sur bandeau doux, lisibles sur fond clair comme sombre
  if (STG) for (const [a, b, s] of VOIX_DUO) {
    if (t < a - .05 || t > b + .2) continue;
    if (a > 22) continue; // la dernière phrase est écrite sur l'écran de fin
    const al = clamp(Math.min((t - a + .05) / .2, (b + .2 - t) / .2));
    c.save(); c.font = '600 40px Montserrat';
    const lines = wrap(c, s, 860), lh = 54, y0 = 1560 - (lines.length - 1) * lh;
    const w = Math.max(...lines.map(l => c.measureText(l).width)) + 56;
    c.globalAlpha = al * .62; c.fillStyle = '#1e0f08'; c.beginPath(); c.roundRect(540 - w / 2, y0 - 38, w, lines.length * lh + 22, 26); c.fill();
    c.globalAlpha = al; c.fillStyle = '#fff8ee'; c.textAlign = 'center'; c.textBaseline = 'middle';
    lines.forEach((l, i) => c.fillText(l, 540, y0 + i * lh));
    c.restore();
  }
}

window.draw = overlayDuo;
window.pret = (async () => {
  await window.pret;
  await Promise.all(['400 40px Montserrat', '500 40px Montserrat', '600 40px Montserrat', '800 40px Montserrat', 'italic 500 40px "Playfair Display"'].map(f => document.fonts.load(f, 'Aéà💀👇')));
  overlayDuo(0);
  return true;
})();
