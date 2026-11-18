/* Le Duo Iconic (Glaze & Gaze + Mirror 72H), version BD avec bulles. 37 s, 9:16, sans aucun son :
   chaque séquence laisse le temps de poser la voix off (ElevenLabs). Utilise les dessins de ../scene/scene.js.
   Le pot de Glaze & Gaze n'est pas dessiné (pas encore de visuel officiel) : la jelly est un personnage, sa texture dorée. */
'use strict';
const BD_DUREE = 37;

// toutes les répliques : [qui, texte, début, fin] (les mêmes instants que le script ElevenLabs)
const BD_LIGNES = [
  ['fille', 'Sérum, masque, crème… et une heure de lisseur.', 0.4, 4.2],
  ['fille', "Parfait. Aujourd'hui, rien ne peut m'arrêter.", 4.8, 7.8],
  ['fille', 'Non… pas maintenant !', 9.4, 11.8],
  ['fille', "J'ai TOUT essayé… et ça gonfle quand même.", 12.3, 15.3],
  ['mirror', 'Tout essayé ? Sauf nous deux.', 16.0, 19.2],
  ['jelly', "Moi, c'est Glaze & Gaze. Après le shampoing, je glace tes cheveux.", 20.0, 23.6],
  ['mirror', 'Et moi, sur cheveux essorés, je scelle ta coiffure. Elle ne bouge plus.', 24.8, 28.8],
  ['fille', 'Il pleut… et mes cheveux s’en fichent !', 29.6, 32.8],
  ['mirror', 'Le Duo Iconic. Seulement 50 coffrets.', 33.4, 36.6],
];
window.BD_LIGNES = BD_LIGNES;
const ligne = i => BD_LIGNES[i];
const parle = (t, i) => talk(t, ligne(i)[2], ligne(i)[3]);
function bulle(c, t, i, y, o = {}) {
  const [qui, txt, a, b] = ligne(i);
  const lab = qui === 'jelly' ? 'GLAZE & GAZE' : undefined;
  bubble(c, t, qui === 'fille' ? 'fille' : 'mirror', txt, a, b, y, Object.assign({ label: lab }, o));
}

// ---------- la jelly Glaze & Gaze (personnage) ----------
function jelly(c, x, y, s, o = {}) {
  const t = o.t || 0, sq = o.squash || 0, tk = o.talk || 0;
  c.save(); c.translate(x, y); c.scale(s * (1 + sq), s * (1 - sq));
  c.fillStyle = 'rgba(120,70,20,.18)'; c.beginPath(); c.ellipse(0, 92, 90, 16, 0, 0, 7); c.fill();
  const p = new Path2D();
  for (let i = 0; i <= 48; i++) {
    const a = i / 48 * Math.PI * 2, w = 1 + .04 * Math.sin(a * 3 + t * 5) + .03 * Math.sin(a * 5 - t * 4);
    const rx = 100 * w, ry = (a > Math.PI ? 100 : 86) * w;
    const px = Math.cos(a) * rx, py = Math.sin(a) * ry + (a > Math.PI ? -6 : 6);
    i ? p.lineTo(px, py) : p.moveTo(px, py);
  }
  p.closePath();
  const g = c.createRadialGradient(-30, -40, 6, 0, 0, 120);
  g.addColorStop(0, 'rgba(255,248,215,.98)'); g.addColorStop(.35, 'rgba(250,206,110,.95)'); g.addColorStop(.8, 'rgba(226,150,52,.95)'); g.addColorStop(1, 'rgba(190,110,30,.95)');
  c.fillStyle = g; c.fill(p);
  c.save(); c.clip(p);
  const r = rng(5); for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,252,235,${.3 + .6 * r() * (.5 + .5 * Math.sin(t * 6 + i))})`; c.beginPath(); c.arc((r() - .5) * 190, (r() - .5) * 170, .8 + r() * 2, 0, 7); c.fill(); }
  c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-42, -52, 26, 14, -.5, 0, 7); c.fill();
  c.restore();
  c.strokeStyle = 'rgba(160,90,20,.5)'; c.lineWidth = 3; c.stroke(p);
  for (const sd of [-1, 1]) {
    const ex = sd * 34, ey = -12, op = sd > 0 && o.wink ? .08 : 1;
    c.fillStyle = '#fffaf2'; c.beginPath(); c.ellipse(ex, ey, 20, 24 * op, 0, 0, 7); c.fill();
    if (op > .5) { c.fillStyle = '#1a0d06'; c.beginPath(); c.arc(ex + (o.look || 0) * 7, ey + 3, 11, 0, 7); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(ex + (o.look || 0) * 7 + 4, ey - 2, 4, 0, 7); c.fill(); }
    else { c.strokeStyle = '#5a3110'; c.lineWidth = 4; c.beginPath(); c.arc(ex, ey + 6, 14, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
  }
  c.fillStyle = 'rgba(232,120,90,.35)'; c.beginPath(); c.ellipse(-62, 20, 14, 8, 0, 0, 7); c.ellipse(62, 20, 14, 8, 0, 0, 7); c.fill();
  if (tk > .02) { c.fillStyle = '#5a1f12'; c.beginPath(); c.ellipse(0, 34, 15, 4 + tk * 12, 0, 0, 7); c.fill(); }
  else { c.strokeStyle = '#5a1f12'; c.lineWidth = 4.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(-16, 30); c.quadraticCurveTo(0, 44, 16, 30); c.stroke(); }
  c.restore();
}

// ---------- produits « déjà essayés » (génériques, sans marque) ----------
function produits(c, t) {
  const tg = c.createLinearGradient(0, 1500, 0, H); tg.addColorStop(0, '#e9d8c0'); tg.addColorStop(1, '#c9ac88');
  c.fillStyle = tg; c.fillRect(-200, 1500, W + 400, 600);
  c.fillStyle = 'rgba(120,90,60,.25)'; c.fillRect(-200, 1500, W + 400, 6);
  const items = [
    ['SÉRUM', .5, (c) => { c.fillStyle = '#d9a46a'; c.beginPath(); c.roundRect(-30, -40, 60, 90, 12); c.fill(); c.fillStyle = '#2b2b2b'; c.fillRect(-12, -70, 24, 32); c.beginPath(); c.arc(0, -76, 14, 0, 7); c.fill(); }],
    ['MASQUE', 1.3, (c) => { c.fillStyle = '#f2ece4'; c.beginPath(); c.roundRect(-50, -20, 100, 70, 14); c.fill(); c.fillStyle = '#9fb8b0'; c.beginPath(); c.roundRect(-54, -36, 108, 22, 8); c.fill(); }],
    ['CRÈME', 2.1, (c) => { c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(-28, -60); c.lineTo(28, -60); c.lineTo(20, 40); c.lineTo(-20, 40); c.closePath(); c.fill(); c.fillStyle = '#e48ca0'; c.fillRect(-20, 40, 40, 16); }],
    ['LISSEUR', 2.9, (c) => { c.fillStyle = '#2a2624'; c.beginPath(); c.roundRect(-80, -12, 160, 28, 12); c.fill(); c.fillStyle = '#e07a50'; c.fillRect(-20, -6, 30, 6); }],
  ];
  items.forEach(([nom, t0, dessin], i) => {
    if (t < t0) return;
    const k = eBack(seg(t, t0, t0 + .3)), x = 170 + i * 250, y = 1660;
    c.save(); c.translate(x, y); c.scale(k, k); dessin(c); c.restore();
    c.save(); c.globalAlpha = clamp(k); c.font = F(800, 26); c.textAlign = 'center'; c.fillStyle = '#5a3a22'; c.fillText(nom, x, y + 95);
    c.fillStyle = '#3f8f5a'; c.font = F(800, 40); c.fillText('✓', x + 58, y - 60); c.restore();
  });
}

// ---------- décors ----------
function rue(c, t, pluie = 1) {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#8e9aa7'); g.addColorStop(.6, '#c9c3ba'); g.addColorStop(1, '#5a5d63');
  c.fillStyle = g; c.fillRect(-200, -200, W + 400, H + 400);
  c.fillStyle = '#6e7783'; c.beginPath(); c.moveTo(-200, 1450); const r = rng(12);
  for (let x = -200; x <= 1300; x += 90) { const h = 1180 + r() * 160; c.lineTo(x, h); c.lineTo(x + 30, h - 30 - r() * 40); c.lineTo(x + 45, h - 30 - r() * 40); c.lineTo(x + 60, h); }
  c.lineTo(1300, 1450); c.closePath(); c.fill();
  c.fillStyle = '#e8e2d6'; for (let i = 0; i < 18; i++) c.fillRect(-150 + (i % 9) * 150, 1260 + Math.floor(i / 9) * 90, 34, 50);
  c.fillStyle = '#4b4f57'; c.fillRect(-200, 1450, W + 400, 600);
  c.fillStyle = 'rgba(220,225,235,.25)'; for (let i = 0; i < 8; i++) c.fillRect(100 + i * 120, 1480 + (i % 3) * 60, 80, 6);
  if (pluie) rain(c, t, 70, 3, .35 * pluie, 1500, 70);
}
function salleDeBain(c) {
  c.fillStyle = '#f2ebe2'; c.fillRect(-200, -200, W + 400, H + 400);
  c.strokeStyle = 'rgba(180,160,140,.35)'; c.lineWidth = 3;
  for (let x = -200; x < W + 200; x += 150) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
  for (let y = 0; y < H; y += 150) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
}
function etape(c, t, a, b, l1, l2) {
  punch(c, t, l1, a, b, 220, { size: 50, pill: C.choco, border: C.or });
  if (t > a + .3 && t < b) {
    const al = clamp(Math.min((t - a - .3) / .3, (b - t) / .15));
    c.save(); c.globalAlpha = al; c.font = F(700, 34); c.textAlign = 'center'; c.lineJoin = 'round';
    c.lineWidth = 8; c.strokeStyle = 'rgba(255,255,255,.9)'; c.strokeText(l2, 540, 320); c.fillStyle = C.choco; c.fillText(l2, 540, 320); c.restore();
  }
}

// ---------- les séquences ----------
function bdScene(c, t) {
  if (t < 4.5) { // 1. elle se prépare devant sa coiffeuse
    c.save(); camera(c, t, 1.02 + .03 * seg(t, 0, 4.5), 540, 900, 4);
    const fr = lerp(.7, 0, eIO(seg(t, .4, 3.8)));
    mirrorScene(c, t, { t, frizz: fr, expr: 'neutral', talk: parle(t, 0), sweep: seg(t, 3.0, 4.4), shine: 1 - fr, look: .3, coat: '#efe4d6' });
    produits(c, t);
    c.restore();
    punch(c, t, '7H00 · 1H DE PRÉPARATION', 0.15, 4.4, 220, { size: 50, pill: C.choco, border: C.or });
    bulle(c, t, 0, 1330);
  } else if (t < 8) { // 2. prête
    c.save(); camera(c, t, 1.06, 540, 900, 4);
    mirrorScene(c, t, { t, frizz: 0, expr: 'happy', talk: parle(t, 1), sweep: seg(t, 4.6, 6.0), shine: 1, tilt: Math.sin((t - 4.5) * 3) * .03, coat: '#9c6b45' });
    const r = rng(17); for (let i = 0; i < 10; i++) { const k = seg(t, 4.6 + r() * 2, 5.2 + r() * 2); sparkle(c, 200 + r() * 680, 500 + r() * 900, 10 + r() * 20, Math.sin(k * Math.PI), 0); }
    c.restore();
    bulle(c, t, 1, 1400);
  } else if (t < 12) { // 3. dehors : tout gonfle
    const P = 10.4;
    c.save(); camera(c, t, 1.02 + .05 * pulse(t, P, .05, .4), 540, 900, 5 + 16 * pulse(t, P, .03, .35));
    rue(c, t);
    const fr = eIn(seg(t, 8.4, P)) + .35 * pulse(t, P, .06, .5);
    woman(c, { t, x: 540, y: 1000, s: 1.5, frizz: fr, expr: t < 9.2 ? 'happy' : 'shock', talk: parle(t, 2), coat: '#9c6b45', coatWet: true, drips: t > 9 });
    rain(c, t, 60, 4, .5, 1900, 90);
    if (t > P - .02 && t < P + .8) { const k = seg(t, P - .02, P + .8), r = rng(5);
      for (let i = 0; i < 18; i++) { const a = Math.PI * (1.02 + r() * .96), d = 400 + k * 170 * (.6 + r() * .6);
        c.fillStyle = `rgba(255,250,240,${.8 * (1 - k)})`; c.beginPath(); c.arc(540 + Math.cos(a) * d, 1050 + Math.sin(a) * d * 1.1, 30 + 40 * k * r(), 0, 7); c.fill(); } }
    c.restore();
    punch(c, t, '2 MIN DEHORS. 💀', 8.2, 11.9, 220, { size: 76 });
    bulle(c, t, 2, 1440, { size: 60 });
  } else if (t < 15.5) { // 4. retour devant le miroir
    c.save(); camera(c, t, 1.0 + .06 * seg(t, 12, 15.5), 540, 900, 5);
    mirrorScene(c, t, { t, frizz: 1, expr: t < 13.8 ? 'angry' : 'blase', talk: parle(t, 3), coatWet: true, drips: true, blink: pulse(t, 14.6, .05, .1) });
    c.restore();
    bulle(c, t, 3, 1400);
  } else if (t < 19.5) { // 5. le duo se réveille sur la coiffeuse
    c.save(); camera(c, t, 1 + .04 * seg(t, 15.5, 19.5), 540, 900, 4);
    const open = eBack(seg(t, 15.65, 15.9));
    vanity(c, t, { x: 400, y: 880, s: .95, sweep: seg(t, 15.5, 16.3) * 1.4 - .2, squash: -.05 * pulse(t, 15.7, .05, .3),
      face: tubeFace(t, { open, lx: .4, br: .8, talk: parle(t, 4), smile: .8, wink: t > 18.6 && t < 18.95 ? 1 : 0 }) });
    const jk = eBack(seg(t, 17.0, 17.4));
    if (t > 17.0) jelly(c, 760, 1240 - 60 * Math.max(0, Math.sin((t - 17) * 6)) * (1 - seg(t, 17, 18)), .95 * jk, { t, look: -.6, squash: .08 * Math.sin((t - 17) * 9) * (1 - seg(t, 17, 18)) });
    const r = rng(9); for (let i = 0; i < 12; i++) { const a = r() * 7, d = 200 + r() * 260, k = seg(t, 15.5 + r() * .3, 16.4 + r() * .4);
      sparkle(c, 540 + Math.cos(a) * d, 900 + Math.sin(a) * d * 1.3, 16 + r() * 22, Math.sin(k * Math.PI), k * 2); }
    c.restore();
    punch(c, t, 'LE DUO ICONIC ✨', 17.4, 19.4, 220, { size: 70, color: '#ffe4a8' });
    bulle(c, t, 4, 1430, { tailUp: true, tail: 400 });
  } else if (t < 24.5) { // 6. étape 1 : Glaze & Gaze après le shampoing, 3 min, rincer
    c.save(); camera(c, t, 1.02, 540, 900, 3);
    salleDeBain(c);
    const glow = eOut(seg(t, 20.8, 22.2));
    woman(c, { t, x: 540, y: 1080, s: 1.6, frizz: .25 * (1 - glow), wet: 1, expr: 'happy', look: -.4, coat: '#f5efe7', goldGlow: glow * .9, sweep: seg(t, 21, 22.5), shine: glow });
    c.fillStyle = '#fbf8f3'; c.beginPath(); c.ellipse(540, 1560, 470, 120, 0, 0, 7); c.fill();
    // la jelly saute sur les cheveux puis se fond dedans
    if (t < 21.0) { const k = seg(t, 19.6, 20.8), x = lerp(170, 520, eIO(k)), y = lerp(1250, 700, eIO(k)) - Math.sin(k * Math.PI) * 260;
      jelly(c, x, y, .8 * (1 - .4 * seg(t, 20.5, 21.0)), { t, talk: parle(t, 5), look: .6 }); }
    else jelly(c, 190, 560, .62 * eBack(seg(t, 21.0, 21.3)), { t, talk: parle(t, 5), look: .6 });
    // minuteur 3 minutes
    if (t > 20.6 && t < 23.2) {
      const k = seg(t, 20.8, 23.0), al = clamp(Math.min((t - 20.6) / .2, (23.2 - t) / .2));
      c.save(); c.globalAlpha = al; c.translate(870, 600);
      c.fillStyle = 'rgba(255,255,255,.92)'; c.beginPath(); c.arc(0, 0, 92, 0, 7); c.fill();
      c.strokeStyle = C.or; c.lineWidth = 12; c.beginPath(); c.arc(0, 0, 76, -Math.PI / 2, -Math.PI / 2 + k * Math.PI * 2); c.stroke();
      c.fillStyle = C.choco; c.font = F(800, 46); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('3 MIN', 0, 4); c.restore();
    }
    // rinçage
    if (t > 23.0) { const k = seg(t, 23.0, 24.4); c.save(); c.globalAlpha = Math.sin(k * Math.PI);
      c.strokeStyle = 'rgba(170,205,235,.8)'; c.lineCap = 'round'; const r = rng(31);
      for (let i = 0; i < 40; i++) { const x = 240 + r() * 600, y = ((r() * 900 + (t - 23) * 1600) % 900) + 300; c.lineWidth = 3 + r() * 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 6, y + 60); c.stroke(); }
      c.restore(); }
    c.restore();
    etape(c, t, 19.6, 24.45, 'ÉTAPE 1 · GLAZE & GAZE', 'Après le shampoing · 3 min · puis rincer');
    punch(c, t, 'PUIS ON RINCE 💧', 23.0, 24.45, 760, { size: 60, color: '#e8f3ff', stroke: '#2f5a7a' });
    bulle(c, t, 5, 1400, { tailUp: true, tail: 220, tailDx: -40 });
  } else if (t < 29) { // 7. étape 2 : Mirror 72H sur cheveux essorés, puis coiffage
    if (t < 26.6) {
      c.save(); camera(c, t, 1.02, 540, 900, 3);
      salleDeBain(c);
      const glow = eOut(seg(t, 25.4, 26.3));
      woman(c, { t, x: 540, y: 1080, s: 1.6, frizz: .1, wet: .6, expr: 'happy', look: .5, coat: '#f5efe7', goldGlow: glow * .7, shine: .5 + glow * .5, sweep: seg(t, 25.4, 26.4) });
      c.fillStyle = '#fbf8f3'; c.beginPath(); c.ellipse(540, 1560, 470, 120, 0, 0, 7); c.fill();
      const sq = .12 * pulse(t, 24.95, .1, .25);
      tube(c, { x: 830, y: 470, s: .42, rot: .75, squash: sq, shadow: false, face: tubeFace(t, { lx: -.6, ly: .6, smile: .9, talk: parle(t, 6) * .8 }) });
      const tipX = 830 - Math.sin(.75) * 450 * .42, tipY = 470 + Math.cos(.75) * 450 * .42;
      if (t > 24.97 && t < 25.4) { const k = seg(t, 25.0, 25.35), x = lerp(tipX, 560, k), y = lerp(tipY, 760, eIn(k)) - Math.sin(k * Math.PI) * 30;
        const g = c.createRadialGradient(x - 8, y - 10, 2, x, y, 34); g.addColorStop(0, '#fff6cf'); g.addColorStop(.4, '#efcc6d'); g.addColorStop(1, '#a8761f');
        c.fillStyle = g; c.beginPath(); c.ellipse(x, y, 26, 32, 0, 0, 7); c.fill(); }
      c.restore();
    } else {
      c.save(); camera(c, t, 1.06, 540, 900, 3);
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ead8c3'); g.addColorStop(1, '#c4a382');
      c.fillStyle = g; c.fillRect(-200, -200, W + 400, H + 400);
      const p = eIO(seg(t, 26.7, 28.6)), ironY = lerp(160, 1780, p);
      lock(c, t, ironY, .8, 540, 300, 30, 3); flatIron(c, ironY, t);
      c.restore();
    }
    etape(c, t, 24.55, 28.95, 'ÉTAPE 2 · MIRROR 72H', 'Sur cheveux essorés · avant le coiffage');
    bulle(c, t, 6, 1400, { tailUp: true, tail: 760, tailDx: 60 });
  } else if (t < 33) { // 8. dehors sous la pluie : ça tient
    c.save(); camera(c, t, 1.02, 540, 900, 5);
    rue(c, t);
    const bob = Math.abs(Math.sin((t - 29) * Math.PI * 2)) * 12;
    woman(c, { t, x: 540, y: 1000 - bob, s: 1.5, frizz: 0, expr: 'happy', talk: parle(t, 7), coat: '#9c6b45', sweep: ((t - 29) * .6) % 1, shine: .8, tilt: Math.sin(t * 6.28) * .02 });
    c.strokeStyle = `rgba(255,220,150,${.2 + .1 * Math.sin(t * 5)})`; c.lineWidth = 5; c.beginPath(); c.ellipse(540, 900 - bob, 330, 380, 0, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
    const r2 = rng(40); for (let i = 0; i < 10; i++) { const ph = ((t - 29) * 1.3 + r2()) % 1, an = Math.PI * (1.15 + r2() * .7), x = 540 + Math.cos(an) * 335, y = 900 - bob + Math.sin(an) * 385;
      c.fillStyle = `rgba(230,240,255,${.9 * (1 - ph)})`; c.beginPath(); c.arc(x + Math.cos(an) * ph * 60, y - ph * 40 + ph * ph * 120, 6, 0, 7); c.fill(); }
    rain(c, t, 60, 4, .5, 1900, 90);
    c.restore();
    punch(c, t, "☔ ANTI-HUMIDITÉ JUSQU'À 72H*", 29.1, 32.95, 220, { size: 46, pill: C.choco, border: C.or });
    if (t > 29.3) { c.save(); c.globalAlpha = clamp(Math.min((t - 29.3) / .3, (32.95 - t) / .15)); c.font = F(600, 22); c.textAlign = 'center';
      c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,.8)'; c.shadowBlur = 8; c.fillText('*Selon le type de cheveux, le coiffage et la météo.', 540, 1660); c.restore(); }
    bulle(c, t, 7, 1400);
  } else { // 9. fin : précommande
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#fbf5ec'); g.addColorStop(1, '#ead6b8');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    bokeh(c, t, 10, 41, ['rgba(255,215,150,A)'], .3, 20);
    const k1 = eBack(seg(t, 33.1, 33.45));
    if (logo.complete && logo.naturalWidth) { c.save(); c.translate(540, 330); c.scale(k1, k1); c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 30; c.drawImage(logo, -170, -170, 340, 340); c.restore(); }
    const a2 = eOut(seg(t, 33.3, 33.7));
    c.save(); c.globalAlpha = a2; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = F(600, 58); c.letterSpacing = '10px'; c.fillStyle = C.choco; c.fillText('LE DUO ICONIC', 545, 600); c.letterSpacing = '0px';
    c.font = 'italic 500 46px "Playfair Display"'; c.fillStyle = '#9c7230'; c.fillText('Glaze & Gaze + Mirror 72H', 540, 675); c.restore();
    tube(c, { x: 380, y: 1085, s: .5, shadow: true, face: tubeFace(t, { lx: .3, smile: 1, talk: parle(t, 8), wink: t > 36.2 ? 1 : 0 }) });
    jelly(c, 720, 1200, .95 * eBack(seg(t, 33.4, 33.8)), { t, look: -.4, wink: t > 36.2 });
    punch(c, t, 'PRÉCOMMANDE · 50 DUOS SEULEMENT', 33.6, 37, 1345, { size: 34, pill: C.choco, border: C.or, rot: 0 });
    const k = eBack(seg(t, 34.0, 34.35)), beat = 1 + .03 * Math.max(0, Math.sin((t - 34.3) * Math.PI * 3));
    c.save(); c.translate(540, 1470); c.scale(k * beat, k * beat);
    const bg = c.createLinearGradient(0, -60, 0, 60); bg.addColorStop(0, '#f2d892'); bg.addColorStop(1, '#b8893c');
    c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 24; c.shadowOffsetY = 8;
    c.fillStyle = bg; c.beginPath(); c.roundRect(-400, -58, 800, 116, 58); c.fill(); c.shadowColor = 'transparent';
    c.fillStyle = C.choco; c.font = F(800, 40); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('RÉSERVE LE TIEN 👇', 0, 3);
    c.restore();
    c.save(); c.globalAlpha = eOut(seg(t, 34.3, 34.6)); c.font = F(700, 46); c.textAlign = 'center'; c.fillStyle = C.choco; c.fillText('www.glossbyk.com', 540, 1600); c.restore();
    bulle(c, t, 8, 725, { size: 42, tailUp: false, tail: 380 });
  }
}

// ---------- transitions et dessin ----------
const bdOff = document.createElement('canvas'); bdOff.width = cv.width; bdOff.height = cv.height;
const bdOctx = bdOff.getContext('2d');
function bdDraw(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (t >= 15.34 && t < 15.66) { // panoramique filé vers la coiffeuse
    const m = 15.5, k = t < m ? eIn(seg(t, 15.34, m)) : 1 - eOut(seg(t, m, 15.66));
    bdOctx.setTransform(DPR, 0, 0, DPR, 0, 0); bdOctx.clearRect(0, 0, W, H); bdScene(bdOctx, t < m ? Math.min(t, m - 1e-3) : t);
    const dx = (t < m ? -1 : 1) * k * W * .55;
    ctx.fillStyle = '#3b2316'; ctx.fillRect(0, 0, cv.width, cv.height);
    for (let i = 0; i < 7; i++) { ctx.globalAlpha = i ? .35 : 1; const x = (dx + (i - 3.5) * k * 120 / 7) * DPR; ctx.drawImage(bdOff, x, 0); ctx.drawImage(bdOff, x - Math.sign(dx || 1) * cv.width, 0); }
    ctx.globalAlpha = 1; return;
  }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  bdScene(ctx, t);
  // serviette qui balaie avant les étapes
  if (t > 19.32 && t < 19.68) {
    const k = eIO(seg(t, 19.32, 19.68)), x = lerp(-1400, 1400, k);
    ctx.save(); ctx.translate(x + 540, 960); ctx.rotate(.12); ctx.fillStyle = '#f7f1e8'; ctx.fillRect(-700, -1300, 1400, 2600);
    ctx.strokeStyle = 'rgba(200,185,165,.5)'; ctx.lineWidth = 6; for (let y = -1300; y < 1300; y += 26) { ctx.beginPath(); ctx.moveTo(-700, y); ctx.lineTo(700, y + 8); ctx.stroke(); }
    ctx.fillStyle = C.or; ctx.fillRect(-700, -40, 1400, 26); ctx.restore();
  }
  // éclats dorés aux coupes clés
  for (const m of [8.0, 29.0, 33.0]) { const fl = pulse(t, m, .01, .3); if (fl) { ctx.fillStyle = `rgba(255,240,205,${fl * .7})`; ctx.fillRect(0, 0, W, H); } }
}

window.DUREE = BD_DUREE;
window.draw = bdDraw;
window.pret = (async () => { await window.pret; bdDraw(0); return true; })();
