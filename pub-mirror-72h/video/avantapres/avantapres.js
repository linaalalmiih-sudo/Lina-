/* Mirror 72H — film luxe « Avant / Après » : fond chocolat, vraies images dans des arches dorées,
   cheveux en pétard, révélation du produit, avant/après à curseur, brillance au ralenti, signature. 22 s, sans son. */
'use strict';
const AA_DUREE = 22;
const SRCA = '../out/punch/';
const OR1 = '#d8b46a', OR2 = '#f3dfae', OR3 = '#9c7230', CREMEA = '#f4ead8';
let INF = {};
const cacheA = new Map();
function img(url) {
  if (cacheA.has(url)) return cacheA.get(url);
  const p = new Promise(r => { const im = new Image(); im.onload = () => im.decode().then(() => r(im), () => r(im)); im.onerror = () => r(null); im.src = url; });
  cacheA.set(url, p); if (cacheA.size > 120) cacheA.delete(cacheA.keys().next().value); return p;
}
const frame = (nom, s) => img(SRCA + nom + '/' + String(clamp(Math.floor(s * 60) + 1, 1, INF[nom] || 1)).padStart(5, '0') + '.jpg');

// ---------- décor ----------
function fondChoco(c, t) {
  const g = c.createRadialGradient(540, 820, 80, 540, 960, 1300); g.addColorStop(0, '#4a2a1c'); g.addColorStop(.55, '#2c170f'); g.addColorStop(1, '#140a06');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // halo doré qui respire
  const h = c.createRadialGradient(540, 760, 20, 540, 760, 720); h.addColorStop(0, `rgba(216,180,106,${.13 + .04 * Math.sin(t * 1.3)})`); h.addColorStop(1, 'rgba(216,180,106,0)');
  c.fillStyle = h; c.fillRect(0, 0, W, H);
  const r = rng(11);
  for (let i = 0; i < 60; i++) { const x = (r() * W + Math.sin(t * .4 + i) * 20), y = ((r() * H - t * (10 + r() * 25)) % H + H) % H, a = .12 + .35 * (.5 + .5 * Math.sin(t * 2.2 + i));
    c.fillStyle = `rgba(243,223,174,${a})`; c.beginPath(); c.arc(x, y, .6 + r() * 2, 0, 7); c.fill(); }
}
function arche(c, x, y, w, h) { c.beginPath(); c.moveTo(x, y + h); c.lineTo(x, y + w / 2); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.lineTo(x + w, y + h); c.closePath(); }
function cadre(c, x, y, w, h, draw, a = 1, cy = .5) {
  if (a <= 0) return;
  c.save(); c.globalAlpha = a;
  c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 60; c.shadowOffsetY = 30; c.fillStyle = '#140a06'; arche(c, x, y, w, h); c.fill(); c.shadowColor = 'transparent';
  c.save(); arche(c, x, y, w, h); c.clip(); draw(x, y, w, h); c.restore();
  const g = c.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, OR2); g.addColorStop(.5, OR3); g.addColorStop(1, OR1);
  c.strokeStyle = g; c.lineWidth = 4; arche(c, x, y, w, h); c.stroke();
  c.strokeStyle = 'rgba(243,223,174,.25)'; c.lineWidth = 1.5; arche(c, x - 14, y - 14, w + 28, h + 28); c.stroke();
  c.restore();
}
function couvrir(c, im, x, y, w, h, z = 1, cy = .5) {
  if (!im) return; const s = Math.max(w / im.width, h / im.height) * z, iw = im.width * s, ih = im.height * s;
  c.drawImage(im, x + (w - iw) / 2, y + (h - ih) * cy, iw, ih);
}
function serif(c, s, y, size, a, o = {}) {
  if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `${o.it ? 'italic ' : ''}500 ${size}px "Playfair Display"`; c.letterSpacing = (o.ls || 0) + 'px';
  if (o.or) { const g = c.createLinearGradient(0, y - size / 2, 0, y + size / 2); g.addColorStop(0, '#fff3cf'); g.addColorStop(.55, OR1); g.addColorStop(1, OR3); c.fillStyle = g; } else c.fillStyle = CREMEA;
  c.filter = `blur(${(1 - a) * 6}px)`; c.fillText(s, 540 + (o.ls || 0) / 2, y + (1 - a) * 18); c.restore();
}
function sans(c, s, y, size, a, o = {}) {
  if (a <= 0) return;
  c.save(); c.globalAlpha = a; c.textAlign = o.align || 'center'; c.textBaseline = 'middle'; c.font = `${o.w || 500} ${size}px Montserrat`;
  c.letterSpacing = (o.ls || 8) + 'px'; c.fillStyle = o.col || OR2; c.fillText(s, (o.x || 540) + (o.align ? 0 : (o.ls || 8) / 2), y); c.restore();
}
const A = (t, a, b, d = .45) => clamp(Math.min(eOut(seg(t, a, a + d)), 1 - seg(t, b - .3, b)));

// ---------- dessin ----------
async function aaDraw(t) {
  const c = ctx; c.setTransform(DPR, 0, 0, DPR, 0, 0);
  fondChoco(c, t);

  // 1. cheveux en pétard (0 – 3,6)
  if (t < 3.8) {
    const im = await frame('frisottis', .3 + t * .9), a = A(t, 0, 3.8, .6), z = 1.15 - .1 * seg(t, 0, 3.8);
    cadre(c, 190, 470, 700, 1040, (x, y, w, h) => { couvrir(c, im, x, y, w, h, z, .4); }, a);
    sans(c, 'HUMIDITÉ · 90 %', 330, 28, A(t, .3, 3.8), { ls: 10 });
    serif(c, 'Frisottis.', 1640, 84, A(t, .8, 3.8), { it: true });
    serif(c, 'Volume. Électricité.', 1735, 52, A(t, 1.6, 3.8), { or: true, it: true });
  }
  // 2. le triptyque du problème (3,6 – 6,4)
  if (t >= 3.4 && t < 6.6) {
    const noms = [['panneau-frisottis', 'FRISOTTIS'], ['panneau-gonfles', 'GONFLÉS'], ['panneau-lisses', 'TERNES']];
    const ims = await Promise.all(noms.slice(0, 2).map(([n]) => img(SRCA + n + '.jpg')));
    const im3 = await img(SRCA + 'panneau-gonfles.jpg');
    noms.forEach(([n, lab], i) => {
      const a = A(t, 3.6 + i * .25, 6.6, .5), x = 70 + i * 320, y = 560 + (1 - a) * 60;
      cadre(c, x, y, 300, 640, (xx, yy, w, h) => { couvrir(c, i < 2 ? ims[i] : im3, xx, yy, w, h, 1.05 + .05 * seg(t, 3.6, 6.6), .35); if (i === 2) { c.fillStyle = 'rgba(30,20,15,.35)'; c.fillRect(xx, yy, w, h); } }, a);
      sans(c, lab, 1260 + (1 - a) * 30, 26, a, { x: x + 150, ls: 6, w: 600 });
    });
    serif(c, 'Une heure de brushing.', 360, 62, A(t, 3.8, 6.6));
    serif(c, 'Deux minutes dehors.', 450, 62, A(t, 4.4, 6.6), { or: true });
    serif(c, 'Tout recommencer ?', 1500, 64, A(t, 5.0, 6.6), { it: true });
  }
  // 3. le produit (6,4 – 10)
  if (t >= 6.3 && t < 10.2) {
    const a = A(t, 6.4, 10.2, .6);
    if (t < 8.4) {
      const im = await img(SRCA + 'satin.jpg');
      cadre(c, 220, 430, 640, 1060, (x, y, w, h) => {
        couvrir(c, im, x, y, w, h, lerp(1.25, 1.08, eOut(seg(t, 6.4, 8.4))), .45);
        const k = eIO(seg(t, 6.7, 8.0)), sx = lerp(x - 300, x + w + 300, k);
        c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(sx - 160, y, sx + 160, y + 400);
        g.addColorStop(0, 'rgba(255,225,170,0)'); g.addColorStop(.5, 'rgba(255,230,180,.28)'); g.addColorStop(1, 'rgba(255,225,170,0)'); c.fillStyle = g; c.fillRect(x, y, w, h); c.restore();
      }, Math.min(a, 1 - seg(t, 8.2, 8.5)));
    } else {
      const im = await frame('gel', (t - 8.4) * .55);
      cadre(c, 220, 430, 640, 1060, (x, y, w, h) => couvrir(c, im, x, y, w, h, 1.35, .5), Math.min(eOut(seg(t, 8.3, 8.6)), 1 - seg(t, 9.9, 10.2)));
    }
    sans(c, 'GLOSS BY K PRÉSENTE', 290, 26, A(t, 6.5, 10.2), { ls: 12 });
    serif(c, 'Mirror 72H', 1630, 110, A(t, 6.8, 10.2), { or: true });
    serif(c, 'le voile anti-météo', 1735, 46, A(t, 7.3, 10.2), { it: true });
  }
  // 4. avant / après à curseur (10 – 15,4)
  if (t >= 10 && t < 15.6) {
    const a = A(t, 10.1, 15.6, .6);
    const av = await img(SRCA + 'panneau-gonfles.jpg'), ap = await img(SRCA + 'panneau-lisses.jpg');
    const x = 150, y = 390, w = 780, h = 1180;
    // position du curseur : part à droite (tout « avant »), glisse à gauche (tout « après »), revient au milieu
    let p = 1;
    if (t > 11.0) p = lerp(1, 0, eIO(seg(t, 11.0, 12.9)));
    if (t > 13.1) p = lerp(0, .5, eIO(seg(t, 13.1, 14.2)));
    cadre(c, x, y, w, h, (xx, yy, ww, hh) => {
      couvrir(c, ap, xx, yy, ww, hh, 1.02, .3);
      c.save(); c.beginPath(); c.rect(xx, yy, ww * p, hh); c.clip(); couvrir(c, av, xx, yy, ww, hh, 1.02, .3); c.restore();
      const lx = xx + ww * p;
      c.fillStyle = OR2; c.fillRect(lx - 2, yy, 4, hh);
      c.save(); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 20; c.fillStyle = '#2c170f'; c.beginPath(); c.arc(lx, yy + hh * .55, 38, 0, 7); c.fill(); c.restore();
      c.strokeStyle = OR1; c.lineWidth = 3; c.beginPath(); c.arc(lx, yy + hh * .55, 38, 0, 7); c.stroke();
      c.fillStyle = OR2; c.beginPath(); c.moveTo(lx - 22, yy + hh * .55); c.lineTo(lx - 10, yy + hh * .55 - 10); c.lineTo(lx - 10, yy + hh * .55 + 10); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(lx + 22, yy + hh * .55); c.lineTo(lx + 10, yy + hh * .55 - 10); c.lineTo(lx + 10, yy + hh * .55 + 10); c.closePath(); c.fill();
    }, a);
    sans(c, 'AVANT', 1640, 30, a * clamp(p * 3), { x: 330, ls: 10, w: 600 });
    sans(c, 'APRÈS', 1640, 30, a * clamp((1 - p) * 3), { x: 750, ls: 10, w: 600 });
    serif(c, 'Une seule étape.', 260, 70, A(t, 10.3, 15.6));
    sans(c, 'AVANT LE COIFFAGE · SANS RINÇAGE', 330, 24, A(t, 10.7, 15.6), { ls: 6 });
    serif(c, 'Lisses. Disciplinés. Brillants.', 1735, 50, A(t, 12.6, 15.6), { it: true, or: true });
  }
  // 5. la brillance au ralenti (15,4 – 18,6)
  if (t >= 15.3 && t < 18.8) {
    const a = A(t, 15.4, 18.8, .6), im = await frame('regard', .2 + (t - 15.4) * .7);
    cadre(c, 190, 430, 700, 1080, (x, y, w, h) => couvrir(c, im, x, y, w, h, 1.12, .35), a);
    serif(c, 'Brillance miroir.', 300, 74, A(t, 15.6, 18.8), { it: true });
    serif(c, "Jusqu'à 72h*", 1640, 96, A(t, 16.1, 18.8), { or: true });
    sans(c, 'ANTI-FRISOTTIS · ANTI-HUMIDITÉ · 230 °C', 1740, 24, A(t, 16.5, 18.8), { ls: 4 });
  }
  // 6. signature (18,6 – 22)
  if (t >= 18.5) {
    const a = A(t, 18.6, 30, .7);
    if (logo.complete && logo.naturalWidth) { const s = lerp(.9, 1, eOut(seg(t, 18.6, 19.6))); c.save(); c.globalAlpha = a; c.translate(540, 780); c.scale(s, s);
      c.shadowColor = 'rgba(216,180,106,.35)'; c.shadowBlur = 60; c.drawImage(logo, -220, -220, 440, 440); c.restore(); }
    serif(c, 'Vous avez fait vos cheveux.', 1130, 54, A(t, 19.2, 30));
    serif(c, "La météo n'a pas son mot à dire.", 1210, 54, A(t, 19.7, 30), { it: true, or: true });
    sans(c, 'GLOSSBYK.COM', 1400, 32, A(t, 20.3, 30), { ls: 12, w: 600 });
  }
  if ((t > 16.1 && t < 18.8) || t > 19.2) sans(c, '*Selon le type de cheveux, le coiffage et la météo.', 1850, 19, .8, { ls: 0, col: 'rgba(244,234,216,.7)', w: 400 });
  if (t > 10.1 && t < 15.6) sans(c, 'Visuel avant/après à titre illustratif.', 1850, 19, .7 * A(t, 10.1, 15.6), { ls: 0, col: 'rgba(244,234,216,.7)', w: 400 });
  // vignette
  const v = c.createRadialGradient(540, 960, 520, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.5)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
}

window.DUREE = AA_DUREE;
window.draw = aaDraw;
window.pret = (async () => {
  await window.pret; INF = await (await fetch(SRCA + 'infos.json')).json();
  await document.fonts.load('italic 500 40px "Playfair Display"', 'A'); await document.fonts.load('500 40px "Playfair Display"', 'A');
  await aaDraw(0); return true;
})();
