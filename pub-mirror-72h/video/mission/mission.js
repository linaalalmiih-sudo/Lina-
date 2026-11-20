/* « Nouvelle mission » : visuel 4:5 (1080×1350) façon jeu vidéo en monde ouvert, personnages et interface originaux
   (aucun personnage ni logo de jeu existant). ?etat=1 : nouvelle mission · ?etat=2 : mission accomplie. */
'use strict';
const ETAT = new URLSearchParams(location.search).get('etat') || '1';
const MH = 1350;
const brosseImg = new Image(); brosseImg.src = '../assets/brosse.png';

// police « jeu » : grosses lettres avec contour noir épais
function hud(c, s, x, y, o = {}) {
  c.save(); c.font = `${o.w || 900} ${o.size || 40}px Montserrat, 'Noto Color Emoji'`; c.textAlign = o.align || 'left'; c.textBaseline = 'middle';
  c.lineJoin = 'round'; c.lineWidth = o.lw || (o.size || 40) * .22; c.strokeStyle = '#000'; c.strokeText(s, x, y);
  c.fillStyle = o.col || '#fff'; c.fillText(s, x, y); c.restore();
}

function decor(c, t, pluie) {
  const g = c.createLinearGradient(0, 0, 0, 700); g.addColorStop(0, '#d9c27f'); g.addColorStop(.7, '#efd9a0'); g.addColorStop(1, '#e8d6a8');
  c.fillStyle = g; c.fillRect(0, 0, W, MH);
  if (pluie) { c.fillStyle = 'rgba(120,130,150,.28)'; c.fillRect(0, 0, W, 700); }
  // maisons basses
  const r = rng(4);
  for (let i = 0; i < 6; i++) { const x = -60 + i * 210, w = 180, h = 110 + r() * 40, y = 640 - h;
    c.fillStyle = ['#d8c3a0', '#c9b08a', '#e2d2b4'][i % 3]; c.fillRect(x, y, w, h);
    c.fillStyle = ['#8a5a44', '#7a4e3a', '#94634a'][i % 3]; c.beginPath(); c.moveTo(x - 14, y); c.lineTo(x + w / 2, y - 50); c.lineTo(x + w + 14, y); c.closePath(); c.fill();
    c.fillStyle = 'rgba(60,50,40,.55)'; c.fillRect(x + 24, y + 30, 40, 36); c.fillRect(x + 110, y + 30, 40, 36); }
  // palmiers et poteaux
  for (const [x, h] of [[90, 470], [330, 420], [930, 500], [1040, 380]]) {
    c.strokeStyle = '#6b5a3c'; c.lineWidth = 12; c.beginPath(); c.moveTo(x, 640); c.quadraticCurveTo(x + 20, 640 - h / 2, x + 8, 640 - h); c.stroke();
    c.strokeStyle = '#4f6a3a'; c.lineWidth = 9; c.lineCap = 'round';
    for (let k = 0; k < 7; k++) { const a = -Math.PI + k * Math.PI / 6; c.beginPath(); c.moveTo(x + 8, 640 - h); c.quadraticCurveTo(x + 8 + Math.cos(a) * 60, 640 - h - 30, x + 8 + Math.cos(a) * 110, 640 - h + 40 + Math.abs(Math.sin(a)) * 10); c.stroke(); }
  }
  c.strokeStyle = '#3c3a36'; c.lineWidth = 6; for (const x of [520, 760]) { c.beginPath(); c.moveTo(x, 640); c.lineTo(x, 200); c.stroke(); }
  c.lineWidth = 2; c.beginPath(); c.moveTo(0, 230); c.quadraticCurveTo(520, 260, 1080, 220); c.stroke();
  // route, trottoir, voiture
  c.fillStyle = pluie ? '#5d5a57' : '#7a756c'; c.fillRect(0, 640, W, 260);
  c.fillStyle = '#e8e2c8'; for (let x = 20; x < W; x += 160) c.fillRect(x, 760, 90, 10);
  c.fillStyle = '#b9b1a0'; c.fillRect(0, 900, W, MH - 900);
  c.fillStyle = '#3f6a4c'; c.beginPath(); c.roundRect(-40, 650, 360, 120, 30); c.fill(); c.fillStyle = '#2f523a'; c.beginPath(); c.roundRect(10, 610, 230, 70, 22); c.fill();
  c.fillStyle = 'rgba(200,220,230,.7)'; c.fillRect(40, 620, 170, 46); c.fillStyle = '#1d1d1d'; c.beginPath(); c.arc(60, 775, 34, 0, 7); c.arc(260, 775, 34, 0, 7); c.fill();
  if (pluie) { c.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 9; i++) c.fillRect(60 + i * 120, 680 + (i % 3) * 60, 70, 4); }
}

// le coiffeur (personnage original)
function coiffeur(c, x, y, s) {
  c.save(); c.translate(x, y); c.scale(s, s);
  // torse : débardeur blanc + tablier chocolat
  c.fillStyle = '#f4f1ea'; c.beginPath(); c.moveTo(-170, 520); c.lineTo(-150, 210); c.quadraticCurveTo(-120, 150, -50, 140); c.lineTo(50, 140); c.quadraticCurveTo(120, 150, 150, 210); c.lineTo(170, 520); c.closePath(); c.fill();
  c.fillStyle = '#4a2b1f'; c.beginPath(); c.moveTo(-120, 520); c.lineTo(-105, 230); c.lineTo(-60, 200); c.lineTo(60, 200); c.lineTo(105, 230); c.lineTo(120, 520); c.closePath(); c.fill();
  c.strokeStyle = '#4a2b1f'; c.lineWidth = 10; c.beginPath(); c.moveTo(-60, 200); c.lineTo(-40, 130); c.moveTo(60, 200); c.lineTo(40, 130); c.stroke();
  c.fillStyle = '#d8b46a'; c.font = 'italic 600 34px "Playfair Display"'; c.textAlign = 'center'; c.fillText('GK', 0, 300);
  // bras (épaules)
  c.fillStyle = '#9a6447';
  c.beginPath(); c.ellipse(-160, 230, 46, 70, .3, 0, 7); c.ellipse(160, 230, 46, 70, -.3, 0, 7); c.fill();
  // cou + tête
  c.fillStyle = '#8c5a3f'; c.fillRect(-36, 90, 72, 70);
  const fg = c.createRadialGradient(-20, -20, 10, 0, 0, 120); fg.addColorStop(0, '#b07a58'); fg.addColorStop(1, '#93613f');
  c.fillStyle = fg; c.beginPath(); c.ellipse(0, 0, 92, 115, 0, 0, 7); c.fill();
  c.fillStyle = '#93613f'; c.beginPath(); c.ellipse(-92, 10, 16, 26, 0, 0, 7); c.ellipse(92, 10, 16, 26, 0, 0, 7); c.fill();
  // cheveux courts dégradés + barbe légère
  c.fillStyle = '#1c120c'; c.beginPath(); c.ellipse(0, -62, 92, 60, 0, Math.PI, Math.PI * 2); c.fill(); c.fillRect(-92, -64, 184, 16);
  c.fillStyle = 'rgba(28,18,12,.55)'; c.beginPath(); c.moveTo(-80, 30); c.quadraticCurveTo(-70, 110, 0, 118); c.quadraticCurveTo(70, 110, 80, 30); c.quadraticCurveTo(60, 80, 0, 86); c.quadraticCurveTo(-60, 80, -80, 30); c.fill();
  // yeux concentrés vers le bas
  c.strokeStyle = '#1c120c'; c.lineWidth = 7; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-58, -28); c.lineTo(-18, -24); c.moveTo(18, -24); c.lineTo(58, -28); c.stroke();
  for (const sd of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(sd * 38, -2, 17, 8, 0, 0, 7); c.fill(); c.fillStyle = '#1c120c'; c.beginPath(); c.arc(sd * 38 + 3, 1, 6, 0, 7); c.fill(); }
  c.strokeStyle = 'rgba(70,40,25,.8)'; c.lineWidth = 4; c.beginPath(); c.moveTo(4, 14); c.quadraticCurveTo(14, 40, 0, 46); c.stroke();
  c.strokeStyle = '#5a2f22'; c.lineWidth = 5; c.beginPath(); c.moveTo(-20, 70); c.quadraticCurveTo(0, 76, 20, 70); c.stroke();
  c.restore();
}
function bras(c, x0, y0, x1, y1, w = 46) {
  c.strokeStyle = '#9a6447'; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
  c.fillStyle = '#a56c4d'; c.beginPath(); c.arc(x1, y1, w * .62, 0, 7); c.fill();
}

function chariot(c) {
  c.fillStyle = '#1e1e1e'; c.beginPath(); c.roundRect(40, 1010, 300, 340, 14); c.fill();
  c.fillStyle = '#2e2e2e'; for (let i = 0; i < 3; i++) c.fillRect(56, 1080 + i * 90, 268, 70);
  c.fillStyle = '#111'; c.fillRect(30, 1000, 320, 20);
  // serviette
  c.fillStyle = '#f2e3d0'; c.beginPath(); c.roundRect(150, 960, 180, 52, 10); c.fill();
  c.fillStyle = '#4a2b1f'; c.font = 'italic 600 24px "Playfair Display"'; c.textAlign = 'center'; c.fillText('Gloss By K', 240, 994);
  tube(c, { x: 92, y: 880, s: .27, shadow: false, face: null });
  if (brosseImg.complete && brosseImg.naturalWidth) { c.save(); c.translate(250, 930); c.rotate(-1.25); c.drawImage(brosseImg, -26, -88, 52, 176); c.restore(); }
}

function interfaceJeu(c, t, accompli) {
  // texte de mission
  c.save(); c.fillStyle = 'rgba(0,0,0,.62)'; c.beginPath(); c.roundRect(30, 40, 560, accompli ? 150 : 176, 14); c.fill(); c.restore();
  hud(c, accompli ? 'MISSION ACCOMPLIE ✅' : 'NOUVELLE MISSION', 54, 84, { size: 34, col: accompli ? '#7ee08a' : '#f6d36b' });
  c.save(); c.font = '600 25px Montserrat'; c.fillStyle = '#fff'; c.textBaseline = 'top'; c.textAlign = 'left';
  const lignes = accompli ? ['Brushing intact malgré la pluie.', 'Bonus débloqué : 72H de tranquillité*'] : ['Arriver à la soirée avec un brushing', 'parfait. Il pleut. Tu as 30 minutes.', 'Arme secrète : Mirror 72H.'];
  lignes.forEach((l, i) => c.fillText(l, 54, 112 + i * 32)); c.restore();
  // chrono, jauge d'humidité, compteur
  c.save(); c.fillStyle = '#fff'; c.strokeStyle = '#000'; c.lineWidth = 6; c.beginPath(); c.roundRect(740, 40, 94, 94, 18); c.fill(); c.stroke();
  c.font = '44px "Noto Color Emoji"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(accompli ? '💇‍♀️' : '☔', 787, 89); c.restore();
  hud(c, accompli ? '00:00' : '00:30', 1040, 76, { size: 50, align: 'right', col: '#e9e9f2' });
  c.save(); c.fillStyle = '#000'; c.fillRect(850, 104, 194, 22); c.fillStyle = accompli ? '#7ee08a' : '#5aa9ff'; c.fillRect(853, 107, 188 * (accompli ? .06 : .92), 16); c.restore();
  hud(c, 'HUMIDITÉ', 1040, 146, { size: 20, align: 'right', col: '#cfe6ff' });
  hud(c, accompli ? '€00000072' : '€00000000', 1040, 190, { size: 44, align: 'right', col: '#5fcf6a' });
  // mini-carte
  c.save(); c.beginPath(); c.arc(140, 1200, 105, 0, 7); c.fillStyle = '#4f7d55'; c.fill(); c.clip();
  c.fillStyle = '#d9d9d0'; for (let i = 0; i < 5; i++) { c.fillRect(30 + i * 52, 1095, 18, 220); c.fillRect(30, 1110 + i * 50, 240, 14); }
  c.fillStyle = '#f2f2f2'; for (let i = 0; i < 7; i++) c.fillRect(48 + (i % 3) * 52, 1130 + Math.floor(i / 3) * 50, 30, 24);
  c.restore();
  c.lineWidth = 8; c.strokeStyle = '#111'; c.beginPath(); c.arc(140, 1200, 105, 0, 7); c.stroke();
  c.fillStyle = '#d8b46a'; c.beginPath(); c.moveTo(140, 1182); c.lineTo(154, 1214); c.lineTo(140, 1206); c.lineTo(126, 1214); c.closePath(); c.fill();
  c.fillStyle = '#4a2b1f'; c.beginPath(); c.arc(196, 1150, 16, 0, 7); c.fill(); c.fillStyle = '#d8b46a'; c.font = '800 16px Montserrat'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('K', 196, 1151);
  hud(c, 'N', 236, 1200, { size: 26 });
  // boutons d'action
  [['☔', 980, 960], ['💧', 980, 1080], ['🛍️', 860, 1200], ['🏃‍♀️', 980, 1200]].forEach(([e, x, y]) => {
    c.save(); c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); c.arc(x, y, 52, 0, 7); c.fill(); c.lineWidth = 5; c.strokeStyle = '#fff'; c.stroke();
    c.font = '50px "Noto Color Emoji"'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, x, y + 3); c.restore(); });
}

function mission(t) {
  const c = ctx, accompli = ETAT === '2';
  c.setTransform(DPR, 0, 0, DPR, 0, 0); c.clearRect(0, 0, W, H);
  c.save(); c.beginPath(); c.rect(0, 0, W, MH); c.clip();
  decor(c, t, true);
  // fauteuil
  c.fillStyle = '#151515'; c.beginPath(); c.roundRect(390, 760, 360, 440, 40); c.fill();
  coiffeur(c, 400, 470, .95);
  // la cliente, cape noire
  woman(c, { t, x: 590, y: 930, s: 1.02, frizz: 0, expr: accompli ? 'happy' : 'neutral', look: -.5, coat: '#1b1b1b', sweep: accompli ? .55 : .3, shine: 1, goldGlow: accompli ? .25 : .1 });
  // bras du coiffeur : une main sur les cheveux, l'autre tient le tube au-dessus
  bras(c, 290, 690, 470, 770, 44);
  tube(c, { x: 712, y: 575, s: .2, rot: .6, shadow: false, face: null, sweep: .4 });
  bras(c, 520, 690, 718, 572, 44);
  if (!accompli) { const g = c.createRadialGradient(650, 690, 2, 654, 694, 18); g.addColorStop(0, '#fff6cf'); g.addColorStop(.5, '#efcc6d'); g.addColorStop(1, '#a8761f');
    c.fillStyle = g; c.beginPath(); c.ellipse(652, 700, 13, 17, 0, 0, 7); c.fill(); }
  else { const r = rng(17); for (let i = 0; i < 10; i++) sparkle(c, 470 + r() * 260, 700 + r() * 380, 12 + r() * 14, .9, i); }
  chariot(c);
  rain(c, t, 70, 9, .32, 1500, 60);
  interfaceJeu(c, t, accompli);
  if (accompli) hud(c, '*Selon le type de cheveux, le coiffage et la météo.', 1050, 1325, { size: 19, w: 600, align: 'right', lw: 4 });
  c.restore();
}

window.draw = mission;
window.pret = (async () => { await window.pret; if (!brosseImg.complete) await new Promise(r => { brosseImg.onload = r; brosseImg.onerror = r; }); mission(1.2); return true; })();
