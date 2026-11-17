/* Mirror 72H — Gloss By K : publicité 9:16, 25 s, dessinée par code.
   draw(t) dessine l'image à l'instant t (secondes). Tout est déterministe. */
'use strict';

const W = 1080, H = 1920, DUREE = 25;
const params = new URLSearchParams(location.search);
const DPR = parseFloat(params.get('dpr') || '1');
const cv = document.getElementById('c');
cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
cv.style.width = W + 'px'; cv.style.height = H + 'px';
const ctx = cv.getContext('2d');

// ---------- outils ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eOut = k => 1 - Math.pow(1 - k, 3);
const eIn = k => k * k * k;
const eIO = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const eBack = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function noise(x) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i), hash(i + 1), u) * 2 - 1; }
function noise2(x, y) { return noise(x + noise(y * 1.7 + 13.1) * 2.3 + y * 57.3); }
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// pulse rapide : 0 -> 1 -> 0 autour de t0
function pulse(t, t0, up = .08, down = .5) { if (t < t0 - up || t > t0 + down) return 0; return t < t0 ? eOut(seg(t, t0 - up, t0)) : 1 - eOut(seg(t, t0, t0 + down)); }
// bouche qui parle pendant [a,b]
function talk(t, a, b) {
  if (t < a || t > b) return 0;
  const env = Math.min(1, (t - a) / .06, (b - t) / .08);
  return env * clamp(.25 + .75 * Math.abs(noise(t * 11 + a * 7)) * (.6 + .4 * Math.abs(Math.sin(t * 23))));
}

const C = {
  choco: '#2a1712', chocoMid: '#4a2b22', or: '#c9a45c', orClair: '#ecd49a', creme: '#f6e7cf',
  peau: '#ebb898', peauOmbre: '#d39a7a', cheveux: '#4a2c1c', cheveuxFonce: '#2b170d', manteau: '#b5835a'
};
const F = (w, s, fam = 'Montserrat') => `${w} ${s}px ${fam}, 'Noto Color Emoji'`;

// ---------- motif nacré du tube ----------
const nacre = document.createElement('canvas'); nacre.width = nacre.height = 512;
{ const g = nacre.getContext('2d'), r = rng(7);
  for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${230 + r() * 25},${200 + r() * 40},${200 + r() * 50},${.08 + r() * .45})`;
    g.beginPath(); g.arc(r() * 512, r() * 512, .4 + r() * 1.3, 0, 7); g.fill(); } }
let nacrePat = null;

// ---------- images ----------
const logo = new Image(); logo.src = '../assets/logo-fr.png';

// ---------- courbes ----------
function catmull(pts, n = 8, closed = false) {
  const out = [], L = pts.length;
  const P = i => closed ? pts[(i + L) % L] : pts[clamp(i, 0, L - 1)];
  const last = closed ? L : L - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let k = 0; k < n; k++) {
      const s = k / n, s2 = s * s, s3 = s2 * s;
      out.push([
        .5 * (2 * p1[0] + (-p0[0] + p2[0]) * s + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * s2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * s3),
        .5 * (2 * p1[1] + (-p0[1] + p2[1]) * s + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * s2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * s3)]);
    }
  }
  if (!closed) out.push(pts[L - 1]);
  return out;
}
function poly(c, pts, close = true) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]); if (close) c.closePath(); }
// frisottis : pousse les points vers l'extérieur avec du bruit
function frizzify(pts, f, cx, cy, seed, t, edge = 1) {
  if (f <= 0.001) return pts;
  return pts.map((p, i) => {
    const dx = p[0] - cx, dy = p[1] - cy, d = Math.hypot(dx, dy) || 1;
    const big = (22 + 30 * (noise(i * .09 + seed) * .5 + .5)) * f;
    const fuzz = 13 * f * noise(i * .9 + seed * 3 + t * .8);
    const k = (1 + .16 * f) * edge;
    return [cx + dx * k + dx / d * (big + fuzz) * edge, cy + dy * k + dy / d * (big + fuzz) * edge];
  });
}

// ---------- texte ----------
function wrap(c, text, maxW) {
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const test = cur ? cur + ' ' + w : w; if (c.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test; }
  if (cur) lines.push(cur); return lines;
}
function rrect(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
function fitFont(c, text, weight, size, maxW, fam = 'Montserrat') {
  let s = size; c.font = F(weight, s, fam);
  while (c.measureText(text).width > maxW && s > 6) { s -= .5; c.font = F(weight, s, fam); }
  return s;
}

// bulle de dialogue (fille = blanche, mirror = chocolat et or)
function bubble(c, t, who, text, t0, t1, y, opts = {}) {
  if (t < t0 - .01 || t > t1 + .12) return;
  const a = t < t0 + .18 ? eBack(seg(t, t0, t0 + .18)) : 1;
  const fade = 1 - seg(t, t1, t1 + .12);
  const size = opts.size || 50;
  c.save(); c.font = F(800, size);
  text = text.replace(/ ([?!:;])/g, '\u00A0$1');
  const lines = wrap(c, text, 820);
  const lh = size * 1.22, padX = 44, padY = 30;
  const tw = Math.max(...lines.map(l => c.measureText(l).width));
  const bw = tw + padX * 2, bh = lines.length * lh + padY * 2 - (lh - size);
  const bx = (opts.x || 540) - bw / 2;
  c.globalAlpha = fade;
  c.translate(540, y + bh / 2); c.scale(.6 + .4 * a, .6 + .4 * a); c.translate(-540, -(y + bh / 2));
  const mirror = who === 'mirror';
  c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 30; c.shadowOffsetY = 10;
  c.fillStyle = mirror ? C.choco : '#ffffff';
  rrect(c, bx, y, bw, bh, 38); c.fill();
  // queue
  const tx = opts.tail != null ? opts.tail : 540;
  c.beginPath();
  if (opts.tailUp) { c.moveTo(tx - 26, y + 2); c.lineTo(tx + (opts.tailDx || 0), y - 34); c.lineTo(tx + 26, y + 2); }
  else { c.moveTo(tx - 26, y + bh - 2); c.lineTo(tx + (opts.tailDx || 0), y + bh + 34); c.lineTo(tx + 26, y + bh - 2); }
  c.fill();
  c.shadowColor = 'transparent';
  if (mirror) { c.strokeStyle = C.or; c.lineWidth = 4; rrect(c, bx, y, bw, bh, 38); c.stroke(); }
  // étiquette
  if (mirror) {
    c.font = F(800, 24); const lab = opts.off ? 'MIRROR 72H · VOIX OFF' : 'MIRROR 72H';
    const lw = c.measureText(lab).width + 36;
    c.fillStyle = C.or; rrect(c, bx + 34, y - 22, lw, 44, 22); c.fill();
    c.fillStyle = C.choco; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(lab, bx + 52, y + 1);
  }
  // mots qui apparaissent comme la parole
  c.font = F(800, size); c.textBaseline = 'alphabetic'; c.textAlign = 'left';
  const allWords = text.split(' ').length;
  const shown = (t - t0) / Math.max(.3, (t1 - t0) * .82) * allWords;
  let wi = 0;
  lines.forEach((ln, li) => {
    const lw = c.measureText(ln).width; let x = 540 + ((opts.x || 540) - 540) - lw / 2;
    const yy = y + padY + size * .86 + li * lh;
    for (const w of ln.split(' ')) {
      const k = clamp(shown - wi + 1);
      c.globalAlpha = fade * (.18 + .82 * k);
      c.fillStyle = mirror ? (k >= 1 && shown - wi < 1.6 ? C.orClair : C.creme) : (k >= 1 && shown - wi < 1.6 ? '#b0472f' : '#2b1a12');
      c.fillText(w, x, yy); x += c.measureText(w + ' ').width; wi++;
    }
  });
  c.restore();
}

// gros texte qui claque
function punch(c, t, text, t0, t1, y, o = {}) {
  if (t < t0 || t > t1) return;
  const k = eBack(seg(t, t0, t0 + .2)), out = seg(t, t1 - .12, t1);
  const size = o.size || 84;
  c.save();
  c.globalAlpha = 1 - out;
  c.translate(540, y); c.rotate((o.rot || -.02) * (1 - k * .5)); const s = lerp(1.6, 1, k); c.scale(s, s);
  c.font = F(o.weight || 900 > 800 ? 800 : 800, size); c.textAlign = 'center'; c.textBaseline = 'middle';
  if (o.pill) {
    const w = c.measureText(text).width + 70, h = size * 1.55;
    c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 24; c.shadowOffsetY = 8;
    c.fillStyle = o.pill; rrect(c, -w / 2, -h / 2, w, h, h / 2); c.fill(); c.shadowColor = 'transparent';
    if (o.border) { c.strokeStyle = o.border; c.lineWidth = 4; rrect(c, -w / 2, -h / 2, w, h, h / 2); c.stroke(); }
    c.fillStyle = o.color || C.orClair; c.fillText(text, 0, 4);
  } else {
    c.lineJoin = 'round'; c.lineWidth = size * .13; c.strokeStyle = o.stroke || C.choco; c.strokeText(text, 0, 0);
    c.fillStyle = o.color || '#fff'; c.fillText(text, 0, 0);
  }
  c.restore();
}

// ---------- décors ----------
function bokeh(c, t, n, seed, cols, alpha = .5, drift = 10) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * W + Math.sin(t * .3 + i) * drift, y = r() * H + Math.cos(t * .25 + i) * drift, rad = 30 + r() * 110;
    const col = cols[i % cols.length];
    const g = c.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, col.replace('A', String(alpha * (.4 + r() * .6)))); g.addColorStop(.7, col.replace('A', String(alpha * .25))); g.addColorStop(1, col.replace('A', '0'));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, rad, 0, 7); c.fill();
  }
}
function sparkle(c, x, y, r, a, rot = 0) {
  if (a <= 0) return;
  c.save(); c.translate(x, y); c.rotate(rot); c.globalAlpha = a; c.fillStyle = '#fff6dc';
  c.beginPath();
  for (let i = 0; i < 8; i++) { const ang = i * Math.PI / 4, rr = i % 2 ? r * .22 : r; c.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr); }
  c.closePath(); c.fill();
  const g = c.createRadialGradient(0, 0, 0, 0, 0, r * .9); g.addColorStop(0, 'rgba(255,230,170,.8)'); g.addColorStop(1, 'rgba(255,230,170,0)');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, r * .9, 0, 7); c.fill();
  c.restore();
}
function rain(c, t, n, seed, alpha = .5, speed = 1700, len = 60, wind = -.18) {
  const r = rng(seed); c.save(); c.strokeStyle = `rgba(235,242,250,${alpha})`; c.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const x0 = r() * (W + 400), off = r() * (H + 200), sp = speed * (.75 + r() * .5), w = 1.5 + r() * 2.5;
    const y = ((off + t * sp) % (H + 200)) - 100, x = x0 + wind * y - 100;
    c.lineWidth = w; c.beginPath(); c.moveTo(x, y); c.lineTo(x + wind * len, y + len); c.stroke();
  }
  c.restore();
}
function wall(c, top = '#eadfce', bot = '#d6c1a6') {
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot);
  c.fillStyle = g; c.fillRect(-200, -200, W + 400, H + 400);
  const l = c.createRadialGradient(150, 300, 50, 150, 300, 1300); l.addColorStop(0, 'rgba(255,248,235,.55)'); l.addColorStop(1, 'rgba(255,248,235,0)');
  c.fillStyle = l; c.fillRect(-200, -200, W + 400, H + 400);
}
function camera(c, t, zoom, cx = 540, cy = 960, shake = 0, seed = 0) {
  const sx = noise(t * 2.1 + seed) * shake, sy = noise(t * 1.7 + 50 + seed) * shake, rot = noise(t * 1.3 + 9 + seed) * shake * .0009;
  c.translate(cx + sx, cy + sy); c.rotate(rot); c.scale(zoom, zoom); c.translate(-cx, -cy);
}

// ---------- la fille (illustration) ----------
function woman(c, o) {
  const t = o.t, f = o.frizz || 0, wet = o.wet || 0;
  c.save(); c.translate(o.x, o.y); c.rotate(o.tilt || 0); c.scale(o.s, o.s);
  const hairGrad = () => { const g = c.createLinearGradient(0, -260, 0, 460);
    g.addColorStop(0, wet ? '#2e190e' : '#553220'); g.addColorStop(.5, wet ? '#25140b' : C.cheveux); g.addColorStop(1, C.cheveuxFonce); return g; };
  // --- masse arrière
  const back = [];
  for (let i = 0; i <= 40; i++) { const a = Math.PI + i / 40 * Math.PI; back.push([Math.cos(a) * 182, -35 + Math.sin(a) * 200]); }
  back.push([196, 150], [214, 330], [205, 455], [120, 470], [0, 440], [-120, 470], [-205, 455], [-214, 330], [-196, 150]);
  let bp = catmull(back, 5, true); bp = frizzify(bp, f, 0, 60, 3.1, t);
  c.fillStyle = hairGrad(); poly(c, bp); c.fill();
  // --- cou et manteau
  c.fillStyle = C.peauOmbre; rrect(c, -50, 90, 100, 200, 30); c.fill();
  c.fillStyle = o.coat || C.manteau;
  c.beginPath(); c.moveTo(-330, 700); c.lineTo(-300, 380); c.quadraticCurveTo(-270, 270, -130, 245); c.lineTo(-55, 235); c.lineTo(0, 330); c.lineTo(55, 235); c.lineTo(130, 245);
  c.quadraticCurveTo(270, 270, 300, 380); c.lineTo(330, 700); c.closePath(); c.fill();
  c.fillStyle = 'rgba(0,0,0,.14)';
  c.beginPath(); c.moveTo(-55, 235); c.lineTo(0, 330); c.lineTo(-20, 520); c.lineTo(-120, 260); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(55, 235); c.lineTo(0, 330); c.lineTo(20, 520); c.lineTo(120, 260); c.closePath(); c.fill();
  c.fillStyle = '#efe4d6'; c.beginPath(); c.moveTo(-50, 236); c.lineTo(0, 320); c.lineTo(50, 236); c.closePath(); c.fill();
  if (o.coatWet) { c.fillStyle = 'rgba(255,255,255,.5)'; const r = rng(4); for (let i = 0; i < 14; i++) { c.beginPath(); c.ellipse(-280 + r() * 560, 300 + r() * 300, 3, 5, 0, 0, 7); c.fill(); } }
  // --- visage
  const fg = c.createRadialGradient(-30, -40, 20, 0, 0, 170); fg.addColorStop(0, '#f4c9ab'); fg.addColorStop(1, C.peau);
  c.fillStyle = fg; c.beginPath(); c.ellipse(0, 0, 118, 150, 0, 0, 7); c.fill();
  c.fillStyle = 'rgba(214,120,110,.22)'; c.beginPath(); c.ellipse(-68, 48, 30, 18, 0, 0, 7); c.ellipse(68, 48, 30, 18, 0, 0, 7); c.fill();
  // traits
  const e = o.expr || 'neutral', blink = o.blink || 0;
  const brow = { angry: [14, -10], shock: [-20, -18], happy: [-6, -10], blase: [6, 4], neutral: [0, -4], smug: [-2, -8] }[e];
  c.strokeStyle = '#3a2216'; c.lineCap = 'round'; c.lineWidth = 9;
  for (const sd of [-1, 1]) {
    c.beginPath(); c.moveTo(sd * 22, -62 + brow[0]); c.quadraticCurveTo(sd * 52, -78 + (brow[0] + brow[1]) / 2 - 6, sd * 82, -64 + brow[1]); c.stroke();
  }
  let open = (e === 'shock' ? 1.25 : e === 'blase' ? .5 : e === 'happy' ? .8 : 1) * (1 - blink);
  for (const sd of [-1, 1]) {
    const ex = sd * 50, ey = -22;
    c.save();
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(ex, ey, 25, Math.max(1.5, 14 * open), 0, 0, 7); c.fill();
    c.clip();
    const lx = (o.look || 0) * 8;
    c.fillStyle = '#4a2a17'; c.beginPath(); c.arc(ex + lx, ey + 1, 12, 0, 7); c.fill();
    c.fillStyle = '#120a06'; c.beginPath(); c.arc(ex + lx, ey + 1, 6, 0, 7); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(ex + lx + 4, ey - 3, 3.4, 0, 7); c.fill();
    c.restore();
    c.strokeStyle = '#22130b'; c.lineWidth = 4.5;
    c.beginPath(); c.ellipse(ex, ey, 26, Math.max(1.5, 14 * open), 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
    c.lineWidth = 3; c.beginPath(); c.moveTo(ex + sd * 22, ey - 10 * open); c.lineTo(ex + sd * 32, ey - 16 * open - 3); c.stroke();
  }
  c.strokeStyle = 'rgba(150,80,55,.7)'; c.lineWidth = 4; c.beginPath(); c.moveTo(4, 12); c.quadraticCurveTo(14, 40, 0, 48); c.stroke();
  // bouche
  const tk = o.talk || 0;
  c.save(); c.translate(0, 88);
  if (e === 'happy' || e === 'smug') {
    const op = 4 + tk * 22;
    c.fillStyle = '#7a2a2a'; c.beginPath(); c.moveTo(-38, -4); c.quadraticCurveTo(0, 16 + op, 38, -4); c.quadraticCurveTo(0, 8, -38, -4); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-30, -1); c.quadraticCurveTo(0, 8, 30, -1); c.lineTo(28, 3); c.quadraticCurveTo(0, 12, -28, 3); c.fill();
    c.strokeStyle = '#c0605a'; c.lineWidth = 5; c.beginPath(); c.moveTo(-40, -5); c.quadraticCurveTo(0, 18 + op, 40, -5); c.stroke();
  } else if (e === 'shock') {
    c.fillStyle = '#6e2424'; c.beginPath(); c.ellipse(0, 4, 16 + tk * 4, 20 + tk * 8, 0, 0, 7); c.fill();
    c.strokeStyle = '#c0605a'; c.lineWidth = 5; c.stroke();
  } else if (e === 'blase') {
    c.strokeStyle = '#b5574f'; c.lineWidth = 7; c.beginPath(); c.moveTo(-26, 6); c.quadraticCurveTo(0, 0, 26, 8); c.stroke();
  } else {
    const op = 3 + tk * 26;
    c.fillStyle = '#6e2424'; c.beginPath(); c.ellipse(0, 4, 30 - tk * 4, op, 0, 0, 7); c.fill();
    if (op > 8) { c.fillStyle = '#fff'; c.fillRect(-20, 4 - op + 1, 40, Math.min(8, op * .4)); }
    c.strokeStyle = '#c0605a'; c.lineWidth = 5; c.beginPath(); c.ellipse(0, 4, 31 - tk * 4, op + 2, 0, 0, 7); c.stroke();
  }
  c.restore();
  // --- mèches de devant
  for (const sd of [-1, 1]) {
    const pts = [[-8, -192], [-90, -170], [-150, -110], [-172, -10], [-168, 120], [-180, 290], [-210, 440], [-160, 432], [-132, 300], [-124, 150], [-120, 20], [-108, -80], [-70, -140]].map(p => [p[0] * sd, p[1]]);
    let fp = catmull(pts, 7, true);
    fp = frizzify(fp, f, 0, 40, sd > 0 ? 9.3 : 5.7, t);
    c.fillStyle = hairGrad(); poly(c, fp); c.fill();
    // brillance
    c.save(); poly(c, fp); c.clip();
    const sh = (1 - f) * (.55 + (o.shine || 0) * .45) + (o.goldGlow || 0) * .5;
    if (sh > 0.01) {
      const sweep = o.sweep != null ? o.sweep : -1;
      const g = c.createLinearGradient(0, -200, 0, 460);
      const p = clamp(.2 + sweep * .6, .05, .95);
      g.addColorStop(0, 'rgba(255,220,180,0)'); g.addColorStop(clamp(p - .12), 'rgba(255,220,180,0)'); g.addColorStop(p, `rgba(255,226,190,${.55 * sh})`); g.addColorStop(clamp(p + .12), 'rgba(255,220,180,0)'); g.addColorStop(1, 'rgba(255,220,180,0)');
      c.fillStyle = g; c.fillRect(-260, -260, 520, 760);
      c.strokeStyle = `rgba(255,214,170,${.35 * sh})`; c.lineWidth = 7;
      c.beginPath(); c.moveTo(sd * -140, -110); c.quadraticCurveTo(sd * -160, 100, sd * -170, 330); c.stroke();
    }
    if (o.goldGlow) { c.fillStyle = `rgba(236,196,110,${.28 * o.goldGlow})`; c.fillRect(-260, -260, 520, 760); }
    // fils
    c.strokeStyle = wet ? 'rgba(15,8,4,.45)' : 'rgba(25,12,6,.3)'; c.lineWidth = wet ? 4 : 2.5;
    for (let i = 0; i < 9; i++) { const x = sd * (-118 - i * 7); c.beginPath(); c.moveTo(x * .7, -150); c.quadraticCurveTo(x * 1.08, 120, x * 1.12 - sd * (wet ? 8 : 0), 420); c.stroke(); }
    c.restore();
  }
  // frisottis volants
  if (f > 0.02) {
    const r = rng(11); c.strokeStyle = `rgba(120,80,52,${.85 * clamp(f)})`; c.lineWidth = 2.6; c.lineCap = 'round';
    const outline = bp;
    for (let i = 0; i < 120; i++) {
      const p = outline[Math.floor(r() * outline.length)], dx = p[0], dy = p[1] - 60, d = Math.hypot(dx, dy) || 1;
      const nx = dx / d, ny = dy / d, L = (14 + r() * 34) * f, curl = (r() - .5) * 3 + noise(t * 2 + i) * .6;
      c.beginPath(); c.moveTo(p[0] - nx * 6, p[1] - ny * 6);
      let x = p[0], y = p[1], ang = Math.atan2(ny, nx);
      for (let k = 0; k < 6; k++) { ang += curl * .35; x += Math.cos(ang) * L / 6; y += Math.sin(ang) * L / 6; c.lineTo(x, y); }
      c.stroke();
    }
  }
  // gouttes (cheveux mouillés ou pluie)
  if (o.drips) {
    c.fillStyle = 'rgba(220,235,250,.9)';
    for (let i = 0; i < 4; i++) { const ph = (t * .9 + i * .27) % 1, x = (i % 2 ? 1 : -1) * (150 + i * 12), y = 300 + ph * 260;
      c.globalAlpha = 1 - ph; c.beginPath(); c.ellipse(x, y, 5, 8, 0, 0, 7); c.fill(); }
    c.globalAlpha = 1;
  }
  c.restore();
}

// ---------- le tube Mirror 72h ----------
function tube(c, o) {
  c.save(); c.translate(o.x, o.y); c.rotate(o.rot || 0);
  const sq = o.squash || 0; c.translate(0, 450 * o.s); c.scale(o.s * (1 + sq), o.s * (1 - sq)); c.translate(0, -450);
  // ombre portée
  if (o.shadow !== false) { c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(0, 452, 170, 22, 0, 0, 7); c.fill(); }
  // corps
  const body = new Path2D();
  body.moveTo(-152, -404); body.lineTo(152, -404); body.bezierCurveTo(156, -120, 128, 200, 120, 336); body.lineTo(-120, 336); body.bezierCurveTo(-128, 200, -156, -120, -152, -404); body.closePath();
  const g = c.createLinearGradient(-156, 0, 156, 0);
  g.addColorStop(0, '#1e0f0c'); g.addColorStop(.1, '#4b302c'); g.addColorStop(.26, '#7b5751'); g.addColorStop(.36, '#b89590'); g.addColorStop(.44, '#7c5853'); g.addColorStop(.7, '#53342f'); g.addColorStop(.9, '#3a221e'); g.addColorStop(1, '#170b09');
  c.fillStyle = g; c.fill(body);
  c.save(); c.clip(body);
  if (!nacrePat) nacrePat = c.createPattern(nacre, 'repeat');
  c.globalAlpha = .55; c.fillStyle = nacrePat; c.fillRect(-160, -410, 320, 760); c.globalAlpha = 1;
  // reflet qui glisse
  const sw = o.sweep != null ? o.sweep : -2;
  const sx = -260 + sw * 520;
  const hg = c.createLinearGradient(sx - 70, -400, sx + 70, -260);
  hg.addColorStop(0, 'rgba(255,235,225,0)'); hg.addColorStop(.5, 'rgba(255,235,225,.38)'); hg.addColorStop(1, 'rgba(255,235,225,0)');
  c.fillStyle = hg; c.fillRect(-160, -410, 320, 760);
  const vg = c.createLinearGradient(0, -400, 0, 336); vg.addColorStop(0, 'rgba(255,240,230,.10)'); vg.addColorStop(.75, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.35)');
  c.fillStyle = vg; c.fillRect(-160, -410, 320, 760);
  // étiquette
  c.fillStyle = 'rgba(40,18,16,.32)'; c.fillRect(-126, -378, 252, 690);
  c.strokeStyle = 'rgba(255,230,220,.10)'; c.lineWidth = 1.5; c.strokeRect(-126, -378, 252, 690);
  c.restore();
  // soudure striée
  const cg = c.createLinearGradient(0, -452, 0, -404); cg.addColorStop(0, '#6e504b'); cg.addColorStop(.5, '#8d6c66'); cg.addColorStop(1, '#4a302c');
  c.fillStyle = cg; c.fillRect(-158, -452, 316, 50);
  c.strokeStyle = 'rgba(30,14,12,.55)'; c.lineWidth = 2;
  for (let x = -154; x <= 154; x += 6) { c.beginPath(); c.moveTo(x, -450); c.lineTo(x, -420); c.stroke(); }
  // bouchon
  const capG = c.createLinearGradient(-122, 0, 122, 0); capG.addColorStop(0, '#050505'); capG.addColorStop(.3, '#2b2b2b'); capG.addColorStop(.45, '#4a4a4a'); capG.addColorStop(.6, '#1c1c1c'); capG.addColorStop(1, '#030303');
  c.fillStyle = capG; rrect(c, -122, 330, 244, 122, [6, 6, 26, 26]); c.fill();
  c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-118, 352); c.lineTo(118, 352); c.stroke();
  c.fillStyle = '#000'; rrect(c, -40, 400, 80, 30, 8); c.fill();
  // textes de l'étiquette (fidèles au vrai tube)
  const silver = c.createLinearGradient(0, -330, 0, 320); silver.addColorStop(0, '#fbf7f4'); silver.addColorStop(1, '#e6dcd6');
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = silver;
  c.letterSpacing = '2px'; fitFont(c, 'GLOSS BY K', 500, 36, 230); c.fillText('GLOSS BY K', 0, -318);
  c.letterSpacing = '2px'; fitFont(c, 'MIRROR 72h', 400, 46, 228); c.fillText('MIRROR 72h', 0, -12);
  c.letterSpacing = '0.4px';
  fitFont(c, 'ANTI-FRISOTTIS · ANTI-HUMIDITÉ', 600, 15, 214); c.fillText('ANTI-FRISOTTIS · ANTI-HUMIDITÉ', 0, 50);
  fitFont(c, 'Leave-in · Sans rinçage', 500, 15, 214); c.fillText('Leave-in · Sans rinçage', 0, 74);
  c.strokeStyle = '#e9dfd9'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-100, 92); c.lineTo(100, 92); c.stroke();
  c.beginPath(); c.arc(0, 92, 3, 0, 7); c.fill();
  c.letterSpacing = '0.8px';
  fitFont(c, 'PROTECTION THERMIQUE', 600, 15, 200); c.fillText('PROTECTION THERMIQUE', 0, 112);
  fitFont(c, "JUSQU'À 230°C", 600, 15, 200); c.fillText("JUSQU'À 230°C", 0, 133);
  c.fillStyle = '#b9a052';
  fitFont(c, 'MICRO - PERLES', 500, 15, 200); c.fillText('MICRO - PERLES', 0, 218);
  fitFont(c, "D'AMLA & BIOTINE", 500, 15, 200); c.fillText("D'AMLA & BIOTINE", 0, 238);
  c.fillStyle = silver; fitFont(c, '100 ml', 600, 15, 120); c.fillText('100 ml', 0, 296);
  c.letterSpacing = '0px';
  // visage (entre « GLOSS BY K » et « MIRROR 72h », sans rien cacher)
  if (o.face) {
    const fc = o.face, op = fc.open == null ? 1 : fc.open;
    for (const sd of [-1, 1]) {
      const ex = sd * 44, ey = -178;
      const wink = sd > 0 ? (fc.wink || 0) : 0, half = fc.half || 0;
      const oo = op * (1 - wink) * (1 - half * .45);
      c.save();
      c.fillStyle = '#fffaf2'; c.beginPath(); c.ellipse(ex, ey, 27, Math.max(1, 31 * oo), 0, 0, 7); c.fill();
      c.clip();
      c.fillStyle = '#100806'; c.beginPath(); c.arc(ex + (fc.lx || 0) * 10, ey + (fc.ly || 0) * 10 + 3, 15, 0, 7); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(ex + (fc.lx || 0) * 10 + 5, ey + (fc.ly || 0) * 10 - 3, 5, 0, 7); c.fill();
      if (half) { c.fillStyle = '#5b3a35'; c.fillRect(ex - 30, ey - 40, 60, 40 * half * .9); }
      c.restore();
      c.strokeStyle = '#140907'; c.lineWidth = 3; c.beginPath(); c.ellipse(ex, ey, 27, Math.max(1, 31 * oo), 0, 0, 7); c.stroke();
      if (wink > .5) { c.strokeStyle = '#f2e3c4'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.arc(ex, ey + 8, 20, Math.PI * 1.15, Math.PI * 1.85); c.stroke(); }
      // sourcils
      const b = sd < 0 ? (fc.bl || 0) : (fc.br || 0);
      c.strokeStyle = '#f2e3c4'; c.lineWidth = 5.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(ex - 20, ey - 42 - b * 14 + (sd < 0 ? 0 : 0)); c.quadraticCurveTo(ex, ey - 52 - b * 18, ex + 20, ey - 44 - b * 10 + sd * b * -4); c.stroke();
    }
    const tk = fc.talk || 0;
    c.save(); c.translate(0, -112);
    if (tk > .02) {
      c.fillStyle = '#140907'; c.beginPath(); c.ellipse(0, 0, 18 + tk * 3, 4 + tk * 13, 0, 0, 7); c.fill();
      c.fillStyle = '#c0605a'; c.beginPath(); c.ellipse(0, 4 + tk * 6, 10, 3 + tk * 4, 0, 0, Math.PI); c.fill();
    } else {
      const sm = fc.smile == null ? .6 : fc.smile;
      c.strokeStyle = '#140907'; c.lineWidth = 4.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-18, -2); c.quadraticCurveTo(fc.smirk ? 4 : 0, -2 + sm * 16, 18, -2 - (fc.smirk ? 6 : 0)); c.stroke();
    }
    c.restore();
  }
  c.restore();
}

// ---------- coupe à champagne + gel doré ----------
function coupeBack(c, t) {
  // intérieur arrière de la coupe
  const g = c.createLinearGradient(240, 0, 840, 0);
  g.addColorStop(0, '#5f5a56'); g.addColorStop(.2, '#e9e5e1'); g.addColorStop(.45, '#8f8984'); g.addColorStop(.7, '#f2efeb'); g.addColorStop(1, '#55504c');
  c.fillStyle = g;
  c.beginPath(); c.moveTo(232, 1180); c.bezierCurveTo(250, 1310, 420, 1365, 524, 1372); c.lineTo(556, 1372); c.bezierCurveTo(660, 1365, 830, 1310, 848, 1180); c.closePath(); c.fill();
  // reflets dorés
  c.fillStyle = 'rgba(214,170,80,.25)'; c.beginPath(); c.ellipse(540, 1250, 250, 60, 0, 0, Math.PI); c.fill();
  // pied
  const sg = c.createLinearGradient(520, 0, 560, 0); sg.addColorStop(0, '#6a6460'); sg.addColorStop(.5, '#f6f3f0'); sg.addColorStop(1, '#6a6460');
  c.fillStyle = sg; c.beginPath(); c.moveTo(526, 1370); c.lineTo(554, 1370); c.lineTo(548, 1700); c.lineTo(532, 1700); c.closePath(); c.fill();
  const bg = c.createLinearGradient(370, 0, 710, 0); bg.addColorStop(0, '#55504c'); bg.addColorStop(.5, '#efebe7'); bg.addColorStop(1, '#55504c');
  c.fillStyle = bg; c.beginPath(); c.ellipse(540, 1712, 170, 30, 0, 0, 7); c.fill();
}
function gelSurface(c, t) {
  const g = c.createLinearGradient(240, 1130, 840, 1230);
  g.addColorStop(0, '#9b6a1c'); g.addColorStop(.35, '#e9c56a'); g.addColorStop(.55, '#f7e09a'); g.addColorStop(.8, '#c99a3c'); g.addColorStop(1, '#8f5f16');
  c.fillStyle = g; c.beginPath(); c.ellipse(540, 1180, 306, 58, 0, 0, 7); c.fill();
  // vagues et paillettes
  c.save(); c.beginPath(); c.ellipse(540, 1180, 306, 58, 0, 0, 7); c.clip();
  c.strokeStyle = 'rgba(255,245,210,.55)'; c.lineWidth = 4;
  for (let i = 0; i < 5; i++) { c.beginPath(); for (let x = 240; x <= 840; x += 20) { const y = 1150 + i * 14 + Math.sin(x * .02 + t * 1.6 + i) * 6; x === 240 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke(); }
  const r = rng(21);
  for (let i = 0; i < 160; i++) { const x = 240 + r() * 600, y = 1124 + r() * 112, tw = .5 + .5 * Math.sin(t * 6 + i * 1.7);
    c.fillStyle = `rgba(255,250,225,${.25 + .6 * tw * r()})`; c.beginPath(); c.arc(x, y, .8 + r() * 2.2, 0, 7); c.fill(); }
  c.restore();
}
function gelDrips(c, t, grow) {
  const drips = [[790, 1196, 170, 16], [826, 1186, 110, 13], [300, 1196, 90, 12]];
  drips.forEach(([x, y, L, w], i) => {
    const l = L * grow * (.85 + .15 * Math.sin(t * 1.3 + i));
    const g = c.createLinearGradient(x - w, 0, x + w, 0); g.addColorStop(0, '#a87623'); g.addColorStop(.5, '#f3d78a'); g.addColorStop(1, '#a87623');
    c.fillStyle = g; c.beginPath(); c.moveTo(x - w, y); c.bezierCurveTo(x - w, y + l * .6, x - w * .6, y + l, x, y + l + w * .8);
    c.bezierCurveTo(x + w * .6, y + l, x + w, y + l * .6, x + w, y); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,240,.6)'; c.beginPath(); c.ellipse(x - w * .35, y + l * .5, w * .18, l * .25 + 2, 0, 0, 7); c.fill();
  });
}
function rimFront(c) {
  c.strokeStyle = 'rgba(250,248,245,.9)'; c.lineWidth = 6; c.beginPath(); c.ellipse(540, 1180, 308, 60, 0, 0, Math.PI); c.stroke();
  c.strokeStyle = 'rgba(120,115,110,.8)'; c.lineWidth = 3; c.beginPath(); c.ellipse(540, 1180, 308, 60, 0, Math.PI, Math.PI * 2); c.stroke();
}
function packshot(c, t, faceOpts) {
  coupeBack(c, t);
  gelSurface(c, t);
  // tube plongé dans le gel (coupé sous la surface)
  c.save(); c.beginPath(); c.rect(0, 0, W, 1178); c.ellipse(540, 1178, 306, 50, 0, 0, Math.PI); c.clip();
  tube(c, { x: 600, y: 760, s: .86, rot: .3, shadow: false, sweep: faceOpts.sweep, face: faceOpts });
  c.restore();
  // ménisque autour du bouchon
  c.fillStyle = 'rgba(255,236,170,.7)'; c.beginPath(); c.ellipse(712, 1176, 112, 16, .05, 0, 7); c.fill();
  c.fillStyle = 'rgba(190,140,50,.8)'; c.beginPath(); c.ellipse(712, 1180, 100, 10, .05, 0, 7); c.fill();
  gelDrips(c, t, faceOpts.grow == null ? 1 : faceOpts.grow);
  rimFront(c);
}

// ---------- décors des scènes ----------
function mirrorScene(c, t, o) {
  wall(c);
  c.strokeStyle = 'rgba(160,130,100,.25)'; c.lineWidth = 3; c.strokeRect(70, 1500, 940, 600);
  // miroir ovale doré
  const mx = 540, my = 980, rx = 405, ry = 610;
  c.save(); c.shadowColor = 'rgba(60,35,20,.35)'; c.shadowBlur = 50; c.shadowOffsetY = 20;
  const fg = c.createLinearGradient(mx - rx, my - ry, mx + rx, my + ry);
  fg.addColorStop(0, '#8a6a32'); fg.addColorStop(.3, '#f0d593'); fg.addColorStop(.55, '#a4823d'); fg.addColorStop(.8, '#e8c97c'); fg.addColorStop(1, '#6f5224');
  c.fillStyle = fg; c.beginPath(); c.ellipse(mx, my, rx + 30, ry + 30, 0, 0, 7); c.fill(); c.restore();
  c.save(); c.beginPath(); c.ellipse(mx, my, rx, ry, 0, 0, 7); c.clip();
  const rg = c.createLinearGradient(0, my - ry, 0, my + ry); rg.addColorStop(0, '#d8c8b4'); rg.addColorStop(1, '#b49c80');
  c.fillStyle = rg; c.fillRect(0, 0, W, H);
  c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(700, 380, 160, 900);
  c.strokeStyle = 'rgba(110,85,60,.35)'; c.lineWidth = 10; c.strokeRect(190, 420, 300, 1300);
  woman(c, Object.assign({ x: 540, y: 960, s: 1.5 }, o));
  // reflet du verre
  const gl = c.createLinearGradient(mx - rx, my - ry, mx + rx, my + ry); gl.addColorStop(0, 'rgba(255,255,255,.22)'); gl.addColorStop(.35, 'rgba(255,255,255,0)'); gl.addColorStop(1, 'rgba(255,255,255,.05)');
  c.fillStyle = gl; c.fillRect(0, 0, W, H);
  c.restore();
}
function vanity(c, t, tubeO, opts = {}) {
  const g = c.createRadialGradient(540, 800, 80, 540, 900, 1300); g.addColorStop(0, '#7a5638'); g.addColorStop(.55, '#3b2316'); g.addColorStop(1, '#170c07');
  c.fillStyle = g; c.fillRect(-200, -200, W + 400, H + 400);
  bokeh(c, t, 14, 3, ['rgba(255,205,130,A)', 'rgba(255,230,190,A)'], .45, 14);
  const ty = opts.table || 1330;
  const tg = c.createLinearGradient(0, ty, 0, H); tg.addColorStop(0, '#efe2cf'); tg.addColorStop(1, '#bfa688');
  c.fillStyle = tg; c.fillRect(-200, ty, W + 400, H);
  c.strokeStyle = 'rgba(160,130,100,.25)'; c.lineWidth = 3; c.beginPath(); c.moveTo(-200, ty + 70); c.bezierCurveTo(300, ty + 40, 600, ty + 140, 1300, ty + 90); c.stroke();
  // halo derrière le tube
  const hg = c.createRadialGradient(tubeO.x, tubeO.y, 50, tubeO.x, tubeO.y, 520); hg.addColorStop(0, 'rgba(255,215,150,.45)'); hg.addColorStop(1, 'rgba(255,215,150,0)');
  c.fillStyle = hg; c.fillRect(-200, -200, W + 400, H + 400);
  // reflet sur la table
  c.save(); c.beginPath(); c.rect(-200, ty, W + 400, H); c.clip(); c.globalAlpha = .18;
  c.translate(0, 2 * ty); c.scale(1, -1); tube(c, Object.assign({}, tubeO, { shadow: false, face: null })); c.restore();
  tube(c, tubeO);
}

// ---------- mèche en gros plan (lisseur) ----------
function lock(c, t, smoothTo, glossy, cx = 540, width = 300, n = 30, seed = 1) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1), x0 = cx - width / 2 + u * width + (r() - .5) * 10;
    const col = ['#3a2216', '#4b2c1c', '#5a3622', '#2c180e', '#6a4128'][i % 5];
    c.strokeStyle = col; c.lineWidth = 11 + r() * 6; c.lineCap = 'round';
    c.beginPath();
    for (let y = 80; y <= 1800; y += 24) {
      const fr = clamp((y - smoothTo) / 120 + .5);
      const sway = Math.sin(y * .004 + t * 1.2 + u) * 18;
      const fz = fr * (noise(y * .03 + i * 5.3) * 34 + noise(y * .11 + i) * 12);
      const spread = fr * (u - .5) * 70;
      const x = x0 + sway + fz + spread;
      y === 80 ? c.moveTo(x, y) : c.lineTo(x, y);
    }
    c.stroke();
  }
  // brillance sur la partie lisse
  c.save(); c.globalCompositeOperation = 'lighter';
  const top = 80, bot = Math.min(1800, smoothTo);
  if (bot > top) {
    const yb = lerp(top, bot, .5 + .3 * Math.sin(t * 2.2));
    const g = c.createLinearGradient(0, yb - 140, 0, yb + 140);
    g.addColorStop(0, 'rgba(255,200,150,0)'); g.addColorStop(.5, `rgba(255,205,160,${.35 * glossy})`); g.addColorStop(1, 'rgba(255,200,150,0)');
    c.fillStyle = g; c.fillRect(cx - width, Math.max(top, yb - 140), width * 2, 280);
  }
  c.restore();
}
function flatIron(c, y, t) {
  c.save(); c.translate(0, y);
  c.fillStyle = 'rgba(0,0,0,.3)'; rrect(c, 300, -48, 560, 120, 50); c.fill();
  const g = c.createLinearGradient(0, -60, 0, 60); g.addColorStop(0, '#3b3634'); g.addColorStop(.5, '#151312'); g.addColorStop(1, '#2a2624');
  c.fillStyle = g; rrect(c, 280, -60, 900, 120, 56); c.fill();
  c.fillStyle = C.or; c.fillRect(300, -8, 600, 6);
  c.fillStyle = '#c9a45c'; rrect(c, 330, -58, 140, 116, 30); c.fill();
  c.fillStyle = '#0d0b0a'; rrect(c, 600, -30, 150, 60, 12); c.fill();
  c.fillStyle = '#ff9a4a'; c.font = F(700, 34); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('230°C', 675, 2);
  c.restore();
  // vapeur
  for (let i = 0; i < 5; i++) {
    const ph = (t * .8 + i * .2) % 1, x = 420 + i * 50 + Math.sin(t * 3 + i) * 20, yy = y - 70 - ph * 220;
    c.fillStyle = `rgba(255,255,255,${.28 * (1 - ph)})`; c.beginPath(); c.ellipse(x, yy, 30 + ph * 40, 20 + ph * 25, 0, 0, 7); c.fill();
  }
}

// ---------- compte à rebours / compteurs ----------
function bigCounter(c, t, value, suffix, y, t0, size = 170) {
  if (t < t0) return;
  const k = eBack(seg(t, t0, t0 + .22));
  c.save(); c.translate(540, y); c.scale(k, k);
  c.font = F(800, size); c.textAlign = 'center'; c.textBaseline = 'middle';
  c.lineJoin = 'round'; c.lineWidth = 18; c.strokeStyle = C.choco; c.strokeText(value + suffix, 0, 0);
  const g = c.createLinearGradient(0, -size / 2, 0, size / 2); g.addColorStop(0, '#fff2c9'); g.addColorStop(1, '#d4a84f');
  c.fillStyle = g; c.fillText(value + suffix, 0, 0);
  c.restore();
}

// ---------- scènes (calées sur les voix : scene/voix.js) ----------
const VX = window.VOIX || {};
const va = id => VX[id] ? VX[id].a : 0, vb = id => VX[id] ? VX[id].b : 0;
// ouverture de bouche d'après la vraie voix
function say(t, id) {
  const v = VX[id]; if (!v || t < v.a || t > v.b) return 0;
  const i = Math.floor((t - v.a) * 60), e = v.env;
  return clamp(((e[i] || 0) + (e[i + 1] || 0) + (e[Math.max(0, i - 1)] || 0)) / 3);
}
const sayAll = (t, ...ids) => Math.max(...ids.map(id => say(t, id)));
// bulle pendant la réplique
const bub = (c, t, who, text, id, y, o = {}) => bubble(c, t, who, text, va(id) - .05, Math.max(vb(id) + .15, va(id) + .9), y, o);

// découpage
const CUT = { pan: 5.0, pardon: 7.6, oui: 8.25, serviette: 11.6, lisseur: 13.9, pluie: 16.1, miroir: 17.6, fier: 19.2, pack: 21.5, fin: 23.25 };

function scene1(c, t) { // 0-5 : le hook
  const P = 3.5;
  const zoom = 1 + .1 * eOut(seg(t, .3, .7)) + .04 * seg(t, .7, 4.8) + .05 * pulse(t, P, .05, .4);
  c.save(); camera(c, t, zoom, 540, 900, 7 + 18 * pulse(t, P, .03, .35));
  const puff = pulse(t, P, .06, .5);
  const no = t > .15 && t < 1.0 ? Math.sin((t - .15) * 22) * .035 * (1 - seg(t, .7, 1)) : 0;
  mirrorScene(c, t, {
    t, frizz: 1 + .35 * puff, expr: t < 3.95 ? 'angry' : 'blase', tilt: no,
    talk: sayAll(t, 'f1', 'f2'), blink: pulse(t, 2.35, .05, .08) + pulse(t, 4.6, .05, .1),
    look: t > 3.95 ? .6 : 0, coatWet: true, drips: true
  });
  if (t > P - .02 && t < P + .8) {
    const k = seg(t, P - .02, P + .8), r = rng(5);
    for (let i = 0; i < 18; i++) { const a = Math.PI * (1.02 + r() * .96), d = 400 + k * 170 * (.6 + r() * .6);
      c.fillStyle = `rgba(255,250,240,${.8 * (1 - k)})`; c.beginPath(); c.arc(540 + Math.cos(a) * d, 1010 + Math.sin(a) * d * 1.1, 30 + 40 * k * r(), 0, 7); c.fill(); }
    c.save(); c.globalAlpha = 1 - k; c.font = F('italic 800', 72); c.textAlign = 'center'; c.lineWidth = 12; c.strokeStyle = '#fff'; c.lineJoin = 'round';
    c.translate(820, 520 - k * 60); c.rotate(.18); c.strokeText('*pouf*', 0, 0); c.fillStyle = '#b0472f'; c.fillText('*pouf*', 0, 0); c.restore();
  }
  c.restore();
  punch(c, t, '1H DE BRUSHING.', 0.0, 4.75, 230, { size: 86 });
  punch(c, t, '2 MIN SOUS LA PLUIE. 💀', 1.0, 4.75, 345, { size: 70, color: '#ffe4a8', rot: .02 });
  bub(c, t, 'fille', "Non mais c'est une blague ?!", 'f1', 1440, { size: 54 });
  bub(c, t, 'fille', 'Une heure de lissage… et trois gouttes ont tout ruiné !', 'f2', 1400);
}

function tubeFace(t, base) { return Object.assign({ open: 1, lx: 0, ly: 0, bl: 0, br: 0, smile: .6 }, base); }

function scene2(c, t) { // le tube parle, « Pardon ?! », « Oui, c'est moi »
  if (t < CUT.pardon) {
    const z = 1 + .05 * seg(t, 5, CUT.pardon);
    c.save(); camera(c, t, z, 540, 900, 4);
    const open = eBack(seg(t, 5.12, 5.38));
    vanity(c, t, { x: 540, y: 880, s: 1, sweep: seg(t, 5.0, 5.7) * 1.4 - .2,
      squash: -.05 * pulse(t, 5.15, .05, .3),
      face: tubeFace(t, { open, lx: -.55, br: eOut(seg(t, 5.4, 5.6)), talk: say(t, 'm1') }) });
    const r = rng(9);
    for (let i = 0; i < 14; i++) { const a = r() * 7, d = 230 + r() * 260, k = seg(t, 5.0 + r() * .2, 5.9 + r() * .4);
      sparkle(c, 540 + Math.cos(a) * d, 880 + Math.sin(a) * d * 1.4, 18 + r() * 26, Math.sin(k * Math.PI), k * 2); }
    c.restore();
    bub(c, t, 'mirror', 'Meuf… tu laisses vraiment la météo choisir ta coiffure ?', 'm1', 1420, { tailUp: true, tail: 540 });
  } else if (t < CUT.oui) {
    const a = CUT.pardon;
    c.save();
    const jolt = 1 - eBack(seg(t, a, a + .22));
    camera(c, t, 1.02 + .04 * seg(t, a, CUT.oui), 540, 900, 8);
    wall(c, '#e6d8c5', '#cdb79b');
    c.fillStyle = 'rgba(120,90,60,.2)'; c.fillRect(760, 200, 260, 1000);
    woman(c, { t, x: 540 + jolt * 120, y: 1010, s: 2.05, tilt: jolt * .22, frizz: 1, expr: 'shock', talk: say(t, 'f3'), look: -.4 });
    c.save(); c.font = F(800, 120); c.textAlign = 'center'; c.lineWidth = 14; c.strokeStyle = '#fff'; c.lineJoin = 'round';
    const k = eBack(seg(t, a + .05, a + .25)); c.translate(880, 360); c.scale(k, k); c.rotate(.2); c.strokeText('?!', 0, 0); c.fillStyle = '#b0472f'; c.fillText('?!', 0, 0); c.restore();
    c.restore();
    bubble(c, t, 'fille', '…Pardon ?!', a + .03, CUT.oui - .03, 1480, { size: 72 });
  } else {
    const a = CUT.oui;
    c.save(); camera(c, t, 1.0 + .03 * seg(t, a, CUT.serviette), 540, 900, 4);
    const bounce = pulse(t, a + .2, .06, .35);
    const wink = t > 9.75 && t < 10.1 ? 1 : 0;
    vanity(c, t, { x: 540, y: 820, s: 1.32, squash: .07 * bounce - .04 * pulse(t, a + .45, .05, .25), sweep: seg(t, a, a + 1.4) * 1.5 - .2,
      face: tubeFace(t, { lx: t < 9.7 ? 0 : .5, bl: .4 + .6 * bounce, br: .4 + .6 * bounce, talk: say(t, 'm2'), wink, smile: .9 }) }, { table: 1420 });
    c.restore();
    bub(c, t, 'mirror', "Oui, c'est moi qui parle. On aurait dû se rencontrer avant.", 'm2', 1460, { tailUp: true });
  }
}

function scene3(c, t) { // la solution
  if (t < CUT.lisseur) {
    const a = CUT.serviette;
    c.save(); camera(c, t, 1.0 + .03 * seg(t, a, CUT.lisseur), 540, 900, 3);
    c.fillStyle = '#f2ebe2'; c.fillRect(-200, -200, W + 400, H + 400);
    c.strokeStyle = 'rgba(180,160,140,.35)'; c.lineWidth = 3;
    for (let x = -200; x < W + 200; x += 150) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
    for (let y = 0; y < H; y += 150) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
    const glow = eOut(seg(t, 12.4, 13.3));
    woman(c, { t, x: 540, y: 1080, s: 1.6, frizz: .12, wet: 1, expr: 'happy', talk: 0, look: .5, coat: '#f5efe7', goldGlow: glow * (1 - .5 * seg(t, 13.3, 13.9)), sweep: seg(t, 12.45, 13.5), shine: glow });
    c.fillStyle = '#fbf8f3'; c.beginPath(); c.ellipse(540, 1560, 470, 120, 0, 0, 7); c.fill();
    const sq = .12 * pulse(t, 11.95, .1, .25);
    tube(c, { x: 830, y: 420, s: .42, rot: .75, squash: sq, shadow: false, face: tubeFace(t, { lx: -.6, ly: .6, smile: .9, talk: say(t, 'm3') * .8 }) });
    const tipX = 830 - Math.sin(.75) * 450 * .42, tipY = 420 + Math.cos(.75) * 450 * .42;
    if (t > 11.97 && t < 12.4) {
      const k = seg(t, 12.0, 12.35), x = lerp(tipX, 560, k), y = lerp(tipY, 760, eIn(k)) - Math.sin(k * Math.PI) * 30;
      const g = c.createRadialGradient(x - 8, y - 10, 2, x, y, 34); g.addColorStop(0, '#fff6cf'); g.addColorStop(.4, '#efcc6d'); g.addColorStop(1, '#a8761f');
      c.fillStyle = g; c.beginPath(); c.ellipse(x, y, 26, 32, 0, 0, 7); c.fill();
    }
    if (t > 12.35) { const r = rng(14); for (let i = 0; i < 18; i++) { const k = seg(t, 12.35 + r() * .3, 13.35 + r() * .3);
      sparkle(c, 540 + (r() - .5) * 560, 700 + r() * 600, 12 + r() * 18, Math.sin(k * Math.PI), k * 3); } }
    c.restore();
    punch(c, t, '💗 SANS RINÇAGE', 11.75, CUT.lisseur - .03, 230, { size: 64, pill: C.choco, border: C.or });
    punch(c, t, '✨ ANTI-FRISOTTIS', 12.5, CUT.lisseur - .03, 355, { size: 64, pill: C.choco, border: C.or, rot: .02 });
    bub(c, t, 'mirror', 'Sur cheveux essorés, avant ton brushing…', 'm3', 1400, { off: true, tailUp: true, tail: 760, tailDx: 60 });
  } else {
    const a = CUT.lisseur;
    c.save(); camera(c, t, 1.06, 540, 900, 3);
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ead8c3'); g.addColorStop(1, '#c4a382');
    c.fillStyle = g; c.fillRect(-200, -200, W + 400, H + 400);
    const p1 = eIO(seg(t, a + .05, 14.95)), p2 = eIO(seg(t, 15.0, 16.0));
    const ironY = t < 15 ? lerp(160, 1780, p1) : lerp(160, 1780, p2);
    const smooth = t < 15 ? ironY : 2000;
    lock(c, t, smooth, t < 15 ? .7 : .7 + .3 * p2, 540, 300, 30, 3);
    flatIron(c, ironY, t);
    c.restore();
    punch(c, t, '🔥 PROTECTION THERMIQUE', a, CUT.pluie - .03, 220, { size: 54, pill: C.choco, border: C.or });
    const deg = Math.round(230 * eOut(seg(t, a + .1, 15.0)));
    bigCounter(c, t, "JUSQU'À " + deg, '°C', 360, a + .1, 92);
    bub(c, t, 'mirror', 'Je te protège du lisseur… et de la pluie.', 'm4', 1420, { off: true, tailUp: true });
  }
}

function scene4(c, t) { // le lendemain sous la pluie, puis le miroir
  if (t < CUT.miroir) {
    const a = CUT.pluie;
    c.save(); camera(c, t, 1.02, 540, 900, 5);
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#8e9aa7'); g.addColorStop(.6, '#c9c3ba'); g.addColorStop(1, '#5a5d63');
    c.fillStyle = g; c.fillRect(-200, -200, W + 400, H + 400);
    c.fillStyle = '#6e7783';
    c.beginPath(); c.moveTo(-200, 1450); const r = rng(12);
    for (let x = -200; x <= 1300; x += 90) { const h = 1180 + r() * 160; c.lineTo(x, h); c.lineTo(x + 30, h - 30 - r() * 40); c.lineTo(x + 45, h - 30 - r() * 40); c.lineTo(x + 60, h); }
    c.lineTo(1300, 1450); c.closePath(); c.fill();
    c.fillStyle = '#e8e2d6'; for (let i = 0; i < 18; i++) { c.fillRect(-150 + (i % 9) * 150, 1260 + Math.floor(i / 9) * 90, 34, 50); }
    c.fillStyle = '#4b4f57'; c.fillRect(-200, 1450, W + 400, 600);
    c.fillStyle = 'rgba(220,225,235,.25)'; for (let i = 0; i < 8; i++) c.fillRect(100 + i * 120, 1480 + (i % 3) * 60, 80, 6);
    rain(c, t, 70, 3, .35, 1500, 70);
    const bob = Math.abs(Math.sin((t - a) * Math.PI * 2)) * 12;
    woman(c, { t, x: 540, y: 1000 - bob, s: 1.5, frizz: 0, expr: 'happy', talk: 0, coat: '#9c6b45', sweep: ((t - a) * .6) % 1, shine: .6, tilt: Math.sin(t * 6.28) * .02 });
    const pulseA = .18 + .1 * Math.sin(t * 5);
    c.strokeStyle = `rgba(255,220,150,${pulseA})`; c.lineWidth = 5; c.beginPath(); c.ellipse(540, 900 - bob, 330, 380, 0, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
    const r2 = rng(40);
    for (let i = 0; i < 10; i++) { const ph = ((t - a) * 1.3 + r2()) % 1, an = Math.PI * (1.15 + r2() * .7), x = 540 + Math.cos(an) * 335, y = 900 - bob + Math.sin(an) * 385;
      c.fillStyle = `rgba(230,240,255,${.9 * (1 - ph)})`; c.beginPath(); c.arc(x + Math.cos(an) * ph * 60, y - ph * 40 + ph * ph * 120, 6, 0, 7); c.fill(); }
    rain(c, t, 70, 4, .5, 1900, 90);
    c.restore();
    punch(c, t, '☔ ANTI-HUMIDITÉ JUSQU\'À', a + .02, CUT.miroir - .03, 210, { size: 50, pill: C.choco, border: C.or });
    const h = Math.round(72 * eOut(seg(t, a + .05, 17.25)));
    bigCounter(c, t, h, 'H', 380, a + .02, 190);
    punch(c, t, 'le lendemain', a + .05, CUT.miroir - .03, 1520, { size: 46, color: '#fff', stroke: 'rgba(40,30,25,.8)' });
  } else {
    const a = CUT.miroir;
    c.save(); camera(c, t, 1.08 - .04 * seg(t, a, CUT.fier), 540, 900, 5);
    mirrorScene(c, t, { t, frizz: 0, expr: 'happy', talk: say(t, 'f4'), sweep: seg(t, a + .1, a + 1.2), shine: 1, tilt: Math.sin((t - a) * 3) * .04, look: .3 });
    const r = rng(17); for (let i = 0; i < 12; i++) { const k = seg(t, a + r() * 1.2, a + .5 + r() * 1.2); sparkle(c, 200 + r() * 680, 500 + r() * 900, 10 + r() * 20, Math.sin(k * Math.PI), 0); }
    c.restore();
    bub(c, t, 'fille', 'Attends… je panique plus quand il pleut ?!', 'f4', 1400);
  }
}

function scene5(c, t) { // le tube fier, packshot, fin
  if (t < CUT.pack) {
    const a = CUT.fier;
    c.save(); camera(c, t, 1.0 + .04 * seg(t, a, CUT.pack), 540, 900, 3);
    vanity(c, t, { x: 540, y: 860, s: 1.18, sweep: seg(t, a + .1, a + 1.1) * 1.4 - .2,
      face: tubeFace(t, { half: .55, lx: t < 19.9 ? -.6 : 0, bl: .2, br: .9, talk: say(t, 'm6'), smirk: true, smile: 1 }) }, { table: 1390 });
    c.restore();
    bub(c, t, 'mirror', 'Ta coiffure, tes règles. Pas celles de la météo.', 'm6', 1450, { tailUp: true });
    return;
  }
  const P = CUT.pack, E = CUT.fin;
  const end = eIO(seg(t, E, E + .5));
  const bg = c.createRadialGradient(540, 950, 60, 540, 950, 1300);
  bg.addColorStop(0, '#e6c99c'); bg.addColorStop(.35, '#a87a4c'); bg.addColorStop(.8, '#3a2015'); bg.addColorStop(1, '#1c0e08');
  c.fillStyle = bg; c.fillRect(0, 0, W, H);
  bokeh(c, t, 12, 41, ['rgba(255,225,170,A)'], .35, 30);
  c.save();
  const s = lerp(.9 + .04 * seg(t, P, E), .42, end);
  c.translate(540, lerp(1090, 1170, end)); c.rotate(lerp(-.01 + .02 * seg(t, P, E), 0, end)); c.scale(s, s); c.translate(-540, -1060);
  packshot(c, t, { lx: t > P + .15 ? 0 : .4, ly: .1, talk: say(t, 'm7'), smile: 1, wink: t > 24.0 && t < 24.4 ? 1 : 0, bl: .3, br: .3,
    sweep: seg(t, P, P + 1.0) * 1.4 - .2, grow: eOut(seg(t, P, E)) });
  c.restore();
  const r = rng(51); for (let i = 0; i < 18; i++) { const k = ((t - P) * .6 + r()) % 1; sparkle(c, 120 + r() * 840, 500 + r() * 1100, 10 + r() * 22, Math.sin(k * Math.PI) * .9, t); }
  const fl = pulse(t, P, .01, .35);
  if (fl > 0) { c.fillStyle = `rgba(255,236,190,${fl * .85})`; c.fillRect(0, 0, W, H); }
  if (t < E) {
    punch(c, t, "LA MÉTÉO N'A PLUS", P + .05, E - .03, 195, { size: 70, color: C.creme });
    punch(c, t, 'LE DERNIER MOT. ☔✨', P + .25, E - .03, 290, { size: 70, color: C.orClair });
  }
  // la réplique finale continue pendant l'arrivée du carton : bulle en haut du carton
  if (t >= E) {
    const k = eBack(seg(t, E + .05, E + .4));
    if (logo.complete && logo.naturalWidth) {
      c.save(); c.translate(540, 450); c.scale(k, k); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 50;
      c.drawImage(logo, -250, -250, 500, 500); c.restore();
      sparkle(c, 540 + 150 * Math.cos(t * 2), 330, 34, seg(t, E + .3, E + .6) * (1 - seg(t, 24.4, 24.9)), t);
    }
    const a2 = eOut(seg(t, E + .25, E + .55));
    c.save(); c.globalAlpha = a2; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = F(600, 46); c.letterSpacing = '6px'; c.fillStyle = C.creme; c.fillText('MIRROR 72H — GLOSS BY K', 540, 790); c.letterSpacing = '0px';
    c.restore();
    const a3 = eBack(seg(t, E + .45, E + .75)), beat = 1 + .04 * Math.max(0, Math.sin((t - 23.5) * Math.PI * 4));
    c.save(); c.translate(540, 1530); c.scale(a3 * beat, a3 * beat);
    c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 30; c.shadowOffsetY = 10;
    const bgb = c.createLinearGradient(0, -60, 0, 60); bgb.addColorStop(0, '#f2d892'); bgb.addColorStop(1, '#b8893c');
    c.fillStyle = bgb; rrect(c, -420, -62, 840, 124, 62); c.fill(); c.shadowColor = 'transparent';
    c.fillStyle = C.choco; fitFont(c, 'COMMANDE LE TIEN MAINTENANT 👇', 800, 42, 740); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('COMMANDE LE TIEN MAINTENANT 👇', 0, 4);
    c.restore();
    c.save(); c.globalAlpha = eOut(seg(t, E + .6, E + .9)); c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = F(700, 52); c.letterSpacing = '2px'; c.lineWidth = 10; c.strokeStyle = 'rgba(28,14,8,.8)'; c.lineJoin = 'round';
    c.strokeText('www.glossbyk.com', 540, 1636); c.fillStyle = '#fff'; c.fillText('www.glossbyk.com', 540, 1636); c.letterSpacing = '0px';
    c.restore();
  }
  bub(c, t, 'mirror', 'Ton brushing mérite mieux que de finir en nuage.', 'm7', t < E ? 1440 : 1040, { tailUp: true, tail: 600 });
}

function sceneAt(c, t) {
  if (t < CUT.pan) scene1(c, t); else if (t < CUT.serviette) scene2(c, t); else if (t < CUT.pluie) scene3(c, t); else if (t < CUT.fier) scene4(c, t); else scene5(c, t);
}

// ---------- transitions ----------
const off = document.createElement('canvas'); off.width = cv.width; off.height = cv.height;
const octx = off.getContext('2d');
function whip(t, a, b, dir) { // panoramique filé entre a et b, coupe au milieu
  const m = (a + b) / 2;
  octx.setTransform(DPR, 0, 0, DPR, 0, 0); octx.clearRect(0, 0, W, H);
  sceneAt(octx, t < m ? Math.min(t, m - 1e-3) : t);
  const k = t < m ? eIn(seg(t, a, m)) : 1 - eOut(seg(t, m, b));
  const dx = (t < m ? -1 : 1) * k * W * .55 * dir, blur = k * 120;
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#3b2316'; ctx.fillRect(0, 0, cv.width, cv.height);
  const n = 7;
  for (let i = 0; i < n; i++) { ctx.globalAlpha = i === 0 ? 1 : .35; const x = (dx + (i - n / 2) * blur / n) * DPR;
    ctx.drawImage(off, x, 0); ctx.drawImage(off, x - Math.sign(dx || 1) * cv.width, 0); }
  ctx.globalAlpha = 1;
}

function draw(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (t >= 4.84 && t < 5.16) { whip(t, 4.84, 5.16, 1); return; }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  sceneAt(ctx, t);
  // serviette qui balaie
  if (t > CUT.serviette - .18 && t < CUT.serviette + .18) {
    const k = eIO(seg(t, CUT.serviette - .18, CUT.serviette + .18)), x = lerp(-1400, 1400, k);
    ctx.save(); ctx.translate(x + 540, 960); ctx.rotate(.12);
    ctx.fillStyle = '#f7f1e8'; ctx.fillRect(-700, -1300, 1400, 2600);
    ctx.strokeStyle = 'rgba(200,185,165,.5)'; ctx.lineWidth = 6; for (let y = -1300; y < 1300; y += 26) { ctx.beginPath(); ctx.moveTo(-700, y); ctx.lineTo(700, y + 8); ctx.stroke(); }
    ctx.fillStyle = C.or; ctx.fillRect(-700, -40, 1400, 26);
    ctx.restore();
  }
  // vignette douce
  const v = ctx.createRadialGradient(540, 960, 600, 540, 960, 1250); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.28)');
  ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
}

window.DUREE = DUREE;
window.draw = draw;
window.pret = (async () => {
  const faces = ['400 40px Montserrat', '500 40px Montserrat', '600 40px Montserrat', '700 40px Montserrat', '800 40px Montserrat', 'italic 800 40px Montserrat', '40px "Noto Color Emoji"'];
  await Promise.all(faces.map(f => document.fonts.load(f, 'Aé💀☔✨🔥💗👇')));
  await document.fonts.ready;
  if (!logo.complete) await new Promise(r => { logo.onload = r; logo.onerror = r; });
  draw(0);
  return true;
})();
