/* NEXORA AI — « Votre prochain employé n'est pas humain. » 30 s, 9:16.
   Chargé après ../scene/scene.js, dont il reprend les outils (txt, carte, icone, lueur, embleme, motLogo, finition…)
   et remplace la chorégraphie. Concept de démonstration : scénario fictif, aucun résultat client.
   Les instants des bruitages (tools/musique_assistant.py) reprennent ceux de ce fichier. */
'use strict';

const LOGO = 23.0;            // la signature commence ici (les outils du logo de scene.js sont calés sur 24 s)
const DECROCHE = 3.75;

// volume de la voix à l'instant t (0 à 1), et qui parle
function voixA(t) {
  const E = window.ENV || {};
  for (const id in E) { const v = E[id], i = Math.floor((t - v.a) * 60); if (i >= 0 && i < v.env.length) return [clamp(v.env[i]), v.qui]; }
  return [0, null];
}
function horloge(c, s, x, y, o = {}) { txt(c, s, x, y, Object.assign({ size: 26, w: 500, col: C.argent, ls: 2 }, o)); }

// =====================================================================
// SCÈNE 1 — 0 à 5 s : le bureau vide, le téléphone sonne
// =====================================================================
const BOKEH = (() => { const r = rng(17); return Array.from({ length: 70 }, () => ({ x: 60 + r() * 960, y: 180 + r() * 760, r: 6 + r() * 26, a: .05 + r() * .22, b: r() < .8, p: r() * 7 })); })();
function telephone(c, t, x, y, s) {
  const sonne = (t > .9 && t < 1.9) || (t > 2.3 && t < 3.3);
  const vib = sonne ? Math.sin(t * 140) * 2.2 : 0;
  c.save(); c.translate(x + vib, y); c.scale(s, s * .62); c.rotate(-.12);
  // halo de l'écran sur le bureau
  c.save(); c.globalCompositeOperation = 'lighter';
  const rep = seg(t, DECROCHE, DECROCHE + .4);
  lueur(c, 0, 0, 420, rep > 0 ? '47,140,255' : '170,200,255', .2 + .18 * (sonne ? .5 + .5 * Math.sin(t * 9) : 0) + .25 * rep);
  c.restore();
  // ondes de sonnerie
  if (sonne) { c.save(); c.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 3; k++) { const p = ((t * 1.4 + k / 3) % 1); c.strokeStyle = `rgba(160,200,255,${.35 * (1 - p)})`; c.lineWidth = 3;
      c.beginPath(); c.roundRect(-150 - p * 120, -280 - p * 120, 300 + p * 240, 560 + p * 240, 60 + p * 40); c.stroke(); } c.restore(); }
  // le téléphone
  c.beginPath(); c.roundRect(-140, -270, 280, 540, 46); c.fillStyle = '#0B0E14'; c.fill();
  c.lineWidth = 4; c.strokeStyle = 'rgba(200,210,225,.45)'; c.stroke();
  c.beginPath(); c.roundRect(-126, -256, 252, 512, 36);
  const g = c.createLinearGradient(0, -256, 0, 256);
  if (rep > 0) { g.addColorStop(0, '#0A2D66'); g.addColorStop(1, '#04112A'); } else { g.addColorStop(0, '#1A2232'); g.addColorStop(1, '#0B0F18'); }
  c.fillStyle = g; c.fill();
  c.save(); c.clip();
  txt(c, '03:17', 0, -150, { size: 64, w: 300, col: C.blanc, ls: 2 });
  if (rep <= 0) {
    txt(c, 'Appel entrant', 0, -60, { size: 24, w: 500, col: C.gris });
    txt(c, 'Nouveau client', 0, -22, { size: 30, w: 600, col: C.blanc });
    c.beginPath(); c.arc(-60, 160, 34, 0, 7); c.fillStyle = '#5A6272'; c.fill();
    c.beginPath(); c.arc(60, 160, 34, 0, 7); c.fillStyle = '#2F8CFF'; c.fill();
  } else {
    c.globalAlpha = eOut(rep);
    txt(c, 'Assistante NEXORA', 0, -60, { size: 26, w: 600, col: C.bleuClair });
    txt(c, 'répond…', 0, -22, { size: 26, w: 400, col: C.blanc });
    c.globalCompositeOperation = 'lighter'; lueur(c, 0, 140, 120, '47,140,255', .8);
    c.beginPath(); c.arc(0, 140, 40, 0, 7); c.fillStyle = '#BFE0FF'; c.fill();
  }
  c.restore();
  c.restore();
}
function scene1(c, t) {
  c.fillStyle = '#010204'; c.fillRect(0, 0, W, H);
  const plonge = eIn(seg(t, 4.3, 5.0));
  const z = (1.18 + .3 * eIO(seg(t, 0, 4.3))) * (1 + 9 * plonge);
  c.save(); camera(c, z, 560, 1290, 0, 540, lerp(1150, 960, eIO(seg(t, 0, 4.3))));
  // la baie vitrée : la ville la nuit, floue
  const gv = c.createLinearGradient(0, 120, 0, 1000); gv.addColorStop(0, '#040A18'); gv.addColorStop(1, '#0A1730');
  c.fillStyle = gv; c.fillRect(-100, 120, W + 200, 880);
  c.save(); c.globalCompositeOperation = 'lighter';
  for (const b of BOKEH) { const a = b.a * (.75 + .25 * Math.sin(t * .8 + b.p)); lueur(c, b.x, b.y, b.r * 2.2, b.b ? '120,170,255' : '230,236,245', a); }
  c.restore();
  c.fillStyle = '#020306';
  for (const x of [-20, 340, 720, 1080]) c.fillRect(x, 120, 26, 880);
  c.fillRect(-100, 560, W + 200, 14);
  // reflet froid sur la vitre
  const rf = c.createLinearGradient(0, 120, W, 1000); rf.addColorStop(0, 'rgba(255,255,255,0)'); rf.addColorStop(.5, 'rgba(180,200,240,.05)'); rf.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = rf; c.fillRect(-100, 120, W + 200, 880);
  // le mur sous la fenêtre et le bureau
  c.fillStyle = '#03050A'; c.fillRect(-200, 1000, W + 400, 200);
  const gb = c.createLinearGradient(0, 1150, 0, 1900); gb.addColorStop(0, '#141A26'); gb.addColorStop(.25, '#0A0E16'); gb.addColorStop(1, '#030407');
  c.fillStyle = gb; c.beginPath(); c.moveTo(-300, 1150); c.lineTo(W + 300, 1150); c.lineTo(W + 600, 2100); c.lineTo(-600, 2100); c.fill();
  c.fillStyle = 'rgba(200,215,240,.22)'; c.fillRect(-300, 1150, W + 600, 2);
  // écran d'ordinateur éteint et lampe éteinte : personne
  c.fillStyle = '#05070C'; c.beginPath(); c.roundRect(40, 820, 400, 260, 10); c.fill(); c.strokeStyle = 'rgba(200,210,225,.12)'; c.lineWidth = 2; c.stroke();
  c.fillRect(220, 1080, 40, 80); c.fillRect(150, 1150, 180, 10);
  c.strokeStyle = 'rgba(200,210,225,.18)'; c.lineWidth = 6; c.beginPath(); c.moveTo(900, 1155); c.lineTo(930, 900); c.lineTo(840, 840); c.stroke();
  c.fillStyle = '#05070C'; c.beginPath(); c.moveTo(790, 860); c.lineTo(880, 800); c.lineTo(870, 880); c.fill();
  // tasse
  c.fillStyle = '#0B0F17'; c.beginPath(); c.roundRect(260, 1240, 70, 80, 10); c.fill(); c.strokeStyle = 'rgba(200,210,225,.15)'; c.stroke();
  telephone(c, t, 600, 1300, .9);
  c.restore();
  // le texte
  const k = seg(t, .6, 1.1), aT = 1 - seg(t, 4.1, 4.4);
  txt(c, 'Il est 3 h 17 du matin.', 540, 470 + 14 * (1 - eOut(k)), { size: 66, w: 500, grad: 'argent', a: eOut(k) * aT, max: 920 });
  // passage dans l'écran
  if (plonge > 0) { c.fillStyle = `rgba(8,30,70,${plonge})`; c.fillRect(0, 0, W, H); }
  const fl = eIn(seg(t, 4.7, 5.0)); if (fl > 0) { c.fillStyle = `rgba(190,222,255,${fl * .9})`; c.fillRect(0, 0, W, H); }
}

// =====================================================================
// orbe vocal de l'assistante (scènes 2 et 3)
// =====================================================================
function orbe(c, t, x, y, s, a = 1) {
  const [v, qui] = voixA(t), lv = qui === 'a' || qui === 'n' ? v : 0, lp = qui === 'p' ? v : 0;
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha *= a;
  c.save(); c.globalCompositeOperation = 'lighter';
  lueur(c, 0, 0, 340, '47,140,255', .32 + .3 * lv);
  lueur(c, 0, 0, 130, '210,235,255', .45 + .4 * lv);
  c.restore();
  // couronne d'ondes : suit la voix de l'assistante (bleue) ou du client (argent)
  const n = 96;
  for (let i = 0; i < n; i++) {
    const ang = i / n * Math.PI * 2, wob = .5 + .5 * Math.sin(ang * 5 + t * 6) * Math.sin(ang * 3 - t * 4);
    const L = 8 + 70 * lv * (.35 + .65 * wob) + 40 * lp * (.3 + .7 * Math.abs(Math.sin(ang * 7 + t * 9))) + 4 * Math.sin(t * 2 + i);
    const r0 = 118;
    c.strokeStyle = lp > lv ? `rgba(220,228,240,${.35 + .5 * lp})` : `rgba(120,190,255,${.35 + .6 * lv})`;
    c.lineWidth = 3; c.lineCap = 'round';
    c.beginPath(); c.moveTo(Math.cos(ang) * r0, Math.sin(ang) * r0); c.lineTo(Math.cos(ang) * (r0 + L), Math.sin(ang) * (r0 + L)); c.stroke();
  }
  c.strokeStyle = 'rgba(220,232,250,.55)'; c.lineWidth = 2;
  c.beginPath(); c.arc(0, 0, 100, t * .7, t * .7 + 4.2); c.stroke();
  const g = c.createRadialGradient(-20, -24, 6, 0, 0, 86);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(.3, '#CDE6FF'); g.addColorStop(.75, '#3B8EF0'); g.addColorStop(1, '#123E8A');
  c.fillStyle = g; c.beginPath(); c.arc(0, 0, 82 * (1 + .06 * lv), 0, 7); c.fill();
  c.restore();
}

// =====================================================================
// SCÈNE 2 — 5 à 10 s : l'assistante décroche
// =====================================================================
function fond(c, t, aube = 0) {
  c.fillStyle = C.noir; c.fillRect(0, 0, W, H);
  lueur(c, 540, 900, 1150, '20,60,140', .16 + .08 * aube);
  if (aube > 0) lueur(c, 540, 1900, 1300, '90,130,200', .12 * aube);
}
function scene2(c, t) {
  fond(c, t);
  poussiere(c, t, .7, -10);
  const e = eOut(seg(t, 5.0, 5.8));
  txt(c, '03:17', 540, 290, { size: 30, w: 400, col: C.gris, ls: 4, a: e });
  txt(c, 'ASSISTANTE NEXORA', 540, 380, { size: 30, w: 600, grad: 'argent', ls: 10, a: e, max: 900 });
  const live = .5 + .5 * Math.sin(t * 5);
  c.save(); c.globalAlpha = e;
  c.beginPath(); c.arc(462, 436, 6, 0, 7); c.fillStyle = `rgba(79,168,255,${live})`; c.fill(); c.restore();
  txt(c, `Appel en cours · 00:0${Math.min(9, Math.floor(t - 5))}`, 552, 437, { size: 22, w: 500, col: C.bleuClair, a: e });
  orbe(c, t, 540, 860, .35 + .65 * eBack(seg(t, 5.0, 5.7)));
  // fin de scène : l'orbe monte et rapetisse (repris en scène 3)
  const fl = pulse(t, 5.0, .01, .5) * .9;
  if (fl > 0) { c.fillStyle = `rgba(190,222,255,${fl})`; c.fillRect(0, 0, W, H); }
}

// =====================================================================
// SCÈNE 3 — 10 à 17 s : la conversation et le rendez-vous
// =====================================================================
function bulleChat(c, s, x, y, droite, k, w = 600) {
  if (k <= 0) return;
  c.save(); c.globalAlpha *= eOut(k); c.translate(0, 18 * (1 - eOut(k)));
  c.font = F(500, 27); const lignes = coupe(c, s, w - 52);
  const h = 30 + lignes.length * 36, bw = Math.max(...lignes.map(l => c.measureText(l).width)) + 52;
  const bx = droite ? x - bw : x;
  c.beginPath(); c.roundRect(bx, y, bw, h, 26);
  if (droite) { const g = c.createLinearGradient(bx, y, bx + bw, y + h); g.addColorStop(0, '#3A95FF'); g.addColorStop(1, '#1F63D1'); c.fillStyle = g; }
  else c.fillStyle = 'rgba(60,68,84,.9)';
  c.fill();
  lignes.forEach((l, i) => txt(c, l, bx + 26, y + 33 + i * 36, { size: 27, w: 500, align: 'left', col: C.blanc }));
  c.restore();
}
function scene3(c, t) {
  fond(c, t);
  poussiere(c, t, .5, -10);
  const m = eIO(seg(t, 10.0, 10.6));
  // panneau de conversation
  const ap = eOut(seg(t, 10.1, 10.6));
  c.save(); c.globalAlpha = ap; c.translate(0, 40 * (1 - ap));
  carte(c, 70, 470, 940, 840, 40, { bord: 'rgba(190,210,240,.22)' });
  txt(c, 'Appel · Nouveau client', 120, 530, { size: 26, w: 600, align: 'left', col: C.blanc });
  txt(c, '03:18', 960, 530, { size: 24, w: 500, align: 'right', col: C.gris, ls: 2 });
  c.save(); c.strokeStyle = 'rgba(205,218,238,.08)'; c.beginPath(); c.moveTo(100, 570); c.lineTo(980, 570); c.stroke(); c.restore();
  txt(c, 'TRANSCRIPTION EN DIRECT', 120, 606, { size: 16, w: 600, align: 'left', col: '#6B7486', ls: 3 });
  bulleChat(c, 'Bonsoir. Vous auriez un rendez-vous cette semaine ?', 110, 640, false, seg(t, 10.15, 10.45));
  bulleChat(c, 'Jeudi à 10 h, cela vous convient ?', 970, 790, true, seg(t, 13.4, 13.65));
  bulleChat(c, 'Parfait.', 110, 890, false, seg(t, 15.4, 15.6));
  bulleChat(c, "C'est réservé. Je vous envoie la confirmation.", 970, 990, true, seg(t, 16.0, 16.25));
  // carte du créneau
  const kc = seg(t, 13.65, 13.95);
  if (kc > 0) {
    c.save(); c.globalAlpha *= eOut(kc); c.translate(0, 20 * (1 - eOut(kc)));
    const ok = seg(t, 16.15, 16.35);
    carte(c, 110, 1150, 860, 120, 28, ok > 0 ? { haut: 'rgba(30,70,140,.95)', bas: 'rgba(18,48,100,.95)', bord: 'rgba(130,190,255,.7)' } : { bord: 'rgba(130,190,255,.4)' });
    c.beginPath(); c.arc(180, 1210, 34, 0, 7); c.fillStyle = bleuA(.22); c.fill();
    icone(c, 'agenda', 180, 1210, 36, C.bleuClair, 2.4);
    txt(c, 'Jeudi · 10:00', 238, 1192, { size: 30, w: 600, align: 'left', col: C.blanc });
    txt(c, ok > 0 ? 'Rendez-vous réservé' : 'Créneau disponible', 238, 1232, { size: 22, w: 500, align: 'left', col: ok > 0 ? C.bleuClair : C.gris });
    if (ok > 0) { c.beginPath(); c.arc(910, 1210, 26 * eBack(ok), 0, 7); c.fillStyle = C.bleu; c.fill(); icone(c, 'check', 910, 1210, 26, C.blanc, 3.4);
      const h = pulse(t, 16.2, .03, .8); if (h > 0) { c.save(); c.globalCompositeOperation = 'lighter'; lueur(c, 540, 1210, 500, '47,140,255', .35 * h); c.restore(); } }
    c.restore();
  }
  // email de confirmation
  const ke = seg(t, 16.55, 16.8);
  if (ke > 0) { c.save(); c.globalAlpha *= eOut(ke); icone(c, 'mail', 380, 1290 + 8, 26, C.bleuClair, 2.4);
    txt(c, 'Confirmation envoyée par email', 410, 1298, { size: 20, w: 500, align: 'left', col: C.bleuClair }); c.restore(); }
  c.restore();
  // l'orbe venu de la scène 2, en petit en haut du panneau
  orbe(c, t, 540, lerp(860, 470, m), lerp(1, .32, m));
  // titre
  const k1 = seg(t, 10.45, 10.9), aT = 1 - seg(t, 16.75, 16.95);
  txt(c, "Vos clients n'attendent", 540, 225 + 12 * (1 - eOut(k1)), { size: 56, w: 600, grad: 'argent', a: eOut(k1) * aT, max: 900 });
  txt(c, "plus l'ouverture.", 540, 298 + 12 * (1 - eOut(k1)), { size: 56, w: 600, grad: 'bleu', a: eOut(k1) * aT, max: 900, glow: 16 });
}

// =====================================================================
// SCÈNE 4 — 17 à 23 s : la nuit passe, tout est traité
// =====================================================================
const TACHES = [
  ['mail', 'Email · Demande de tarif', 'Répondu'], ['agenda', 'Réservation · Ven. 9:30', 'Confirmé'],
  ['chat', 'Message · « Vous êtes ouverts samedi ? »', 'Répondu'], ['crm', 'Nouveau prospect', 'Ajouté au CRM'],
  ['mail', 'Email · Suivi de devis', 'Envoyé'], ['agenda', 'Rendez-vous déplacé', 'Replanifié'],
  ['chat', 'Question · Délais', 'Répondu'], ['facture', 'Facture demandée', 'Envoyée'],
  ['agenda', 'Réservation · Lun. 14:00', 'Confirmé'], ['mail', 'Email · Nouvelle demande', 'Répondu'],
];
const T0 = 17.5, PAS = .5, CH = 118;
function scene4(c, t) {
  const aube = seg(t, 17, 22.5);
  fond(c, t, aube);
  const fin = eIn(seg(t, 22.35, 22.95));
  c.save(); c.translate(540, 960); c.scale(1, 1 - fin * .995); c.translate(-540, -960);
  poussiere(c, t, .6, -30);
  // horloge qui file : 03:18 → 07:58
  const mn = Math.floor(lerp(3 * 60 + 18, 7 * 60 + 58, eIO(seg(t, 17.2, 22.2))));
  const hh = String(Math.floor(mn / 60)).padStart(2, '0'), mm = String(mn % 60).padStart(2, '0');
  txt(c, `${hh}:${mm}`, 540, 470, { size: 110, w: 300, grad: 'argent', ls: 6, a: seg(t, 17.05, 17.4) });
  txt(c, 'PENDANT QUE VOUS DORMEZ', 540, 560, { size: 20, w: 600, col: C.gris, ls: 6, a: seg(t, 17.3, 17.7) });
  // le fil des tâches : la plus récente en haut, les autres descendent
  c.save(); c.beginPath(); c.rect(0, 620, W, 760); c.clip();
  const nb = TACHES.length;
  for (let i = 0; i < nb; i++) {
    const ti = T0 + i * PAS; if (t < ti) continue;
    const pos = TACHES.reduce((s, _, j) => s + (j > i && t >= T0 + j * PAS ? eOut(seg(t, T0 + j * PAS, T0 + j * PAS + .25)) : 0), 0);
    const y = 660 + pos * CH, k = seg(t, ti, ti + .25), ok = seg(t, ti + .2, ti + .35);
    const a = eOut(k) * (1 - seg(pos, 4, 5.5));
    if (a <= 0) continue;
    const [ic, lib, st] = TACHES[i];
    c.save(); c.globalAlpha = a; c.translate(60 * (1 - eOut(k)), 0);
    carte(c, 90, y, 900, 100, 28, { bord: pos < .5 ? 'rgba(130,190,255,.5)' : C.bord });
    c.beginPath(); c.arc(150, y + 50, 30, 0, 7); c.fillStyle = bleuA(.18); c.fill();
    icone(c, ic, 150, y + 50, 32, C.bleuClair, 2.4);
    txt(c, lib, 200, y + 50, { size: 25, w: 600, align: 'left', col: C.blanc, max: 520 });
    c.beginPath(); c.roundRect(760, y + 30, 200, 40, 20); c.fillStyle = ok > 0 ? bleuA(.25) : 'rgba(200,215,235,.08)'; c.fill();
    if (ok > 0) { icone(c, 'check', 786, y + 50, 18, C.bleuClair, 3.2); txt(c, st, 806, y + 51, { size: 19, w: 600, align: 'left', col: C.bleuClair, max: 145 }); }
    else txt(c, 'En cours…', 860, y + 51, { size: 19, w: 500, col: C.gris });
    c.restore();
  }
  c.restore();
  c.restore();
  if (fin > 0) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, bleuA(0)); g.addColorStop(.5, `rgba(200,230,255,${fin})`); g.addColorStop(1, bleuA(0));
    c.fillStyle = g; c.fillRect(0, 959, W, 3); lueur(c, 540, 960, 300, '47,140,255', .4 * fin); c.restore(); }
  const k1 = seg(t, 17.3, 17.75), aT = 1 - seg(t, 22.2, 22.45);
  txt(c, 'Un nouveau niveau', 540, 225 + 12 * (1 - eOut(k1)), { size: 60, w: 300, grad: 'argent', ls: 4, a: eOut(k1) * aT, max: 900 });
  txt(c, "d'automatisation.", 540, 300 + 12 * (1 - eOut(k1)), { size: 60, w: 600, grad: 'argent', ls: 4, a: eOut(k1) * aT, max: 900, glow: 24 });
  const fl = pulse(t, 17.0, .01, .35) * .45;
  if (fl > 0) { c.fillStyle = `rgba(210,232,255,${fl})`; c.fillRect(0, 0, W, H); }
}

// =====================================================================
// SCÈNE 5 — 23 à 30 s : la signature
// =====================================================================
function scene5(c, t) {
  const u = t + 1; // les outils du logo de scene.js sont calés sur 24 s
  c.fillStyle = C.noir; c.fillRect(0, 0, W, H);
  const h = seg(t, LOGO, LOGO + 1);
  c.save(); c.globalCompositeOperation = 'lighter'; lueur(c, 540, 780, 900, '25,80,190', (.2 + .03 * Math.sin(t * 1.6)) * h); c.restore();
  poussiere(c, t, .35 * h, -8);
  const o = seg(t, LOGO, LOGO + .6);
  if (o < 1) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, bleuA(0)); g.addColorStop(.5, `rgba(220,238,255,${1 - o})`); g.addColorStop(1, bleuA(0));
    c.fillStyle = g; c.fillRect(0, lerp(960, LY, eOut(o)) - 1.5, W, 3); c.restore(); }
  embleme(c, u, 540, LY, 1 + .015 * eOut(seg(t, LOGO, 30)));
  motLogo(c, u);
  const k1 = seg(t, 24.7, 25.3);
  txt(c, "L'intelligence travaille avec vous.", 540, 1040 + 10 * (1 - eOut(k1)), { size: 42, w: 300, col: C.blanc, a: eOut(k1) * .94, ls: 1, max: 900 });
  const k2 = seg(t, 27.35, 27.8);
  if (k2 > 0) {
    c.save(); c.globalAlpha = eOut(k2); c.translate(0, 16 * (1 - eOut(k2)));
    const bw = 720, bh = 92, bx = 540 - bw / 2, by = 1170;
    c.save(); c.globalCompositeOperation = 'lighter'; lueur(c, 540, by + bh / 2, 380, '47,140,255', .22 + .06 * Math.sin(t * 3)); c.restore();
    c.beginPath(); c.roundRect(bx, by, bw, bh, bh / 2);
    c.lineWidth = 2; c.strokeStyle = 'rgba(210,232,255,.8)'; c.fillStyle = 'rgba(47,140,255,.14)'; c.fill(); c.stroke();
    const r = seg(t, 27.8, 28.5);
    if (r > 0 && r < 1) { c.save(); c.clip(); const rx = lerp(bx - 100, bx + bw + 100, r); const gr = c.createLinearGradient(rx - 80, 0, rx + 80, 0);
      gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(.5, 'rgba(255,255,255,.3)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(bx, by, bw, bh); c.restore(); }
    txt(c, 'Découvrez votre futur assistant IA', 540, by + bh / 2 + 1, { size: 32, w: 600, col: C.blanc, max: 620 });
    c.restore();
  }
  txt(c, 'Concept de démonstration · scénario fictif', 540, 1312, { size: 18, w: 400, col: '#6B7486', ls: 1, a: seg(t, 25.5, 26.2) });
}

// =====================================================================
// sous-titres : assistante en bleu clair, client en argent, signature en blanc
// =====================================================================
function sousTitresDialogue(c, t) {
  const L = window.SOUS_TITRES || [];
  const on = L.some(([a, b]) => t > a - .1 && t < b + .3);
  if (on) { const g = c.createLinearGradient(0, 1340, 0, 1560); g.addColorStop(0, 'rgba(2,3,6,0)'); g.addColorStop(.35, 'rgba(2,3,6,.62)'); g.addColorStop(.65, 'rgba(2,3,6,.62)'); g.addColorStop(1, 'rgba(2,3,6,0)'); c.fillStyle = g; c.fillRect(0, 1340, W, 220); }
  for (const [a, b, s, qui] of L) {
    const tf = b + .2; if (t < a - .05 || t > tf) continue;
    const al = Math.min(seg(t, a - .05, a + .1), 1 - seg(t, tf - .12, tf));
    c.save(); c.font = F(600, 44); c.letterSpacing = '0.5px';
    const lignes = coupe(c, s, 860), prog = seg(t, a, b) * s.length, col = qui === 'a' ? '#A9D6FF' : qui === 'p' ? '#E3E8EE' : C.blanc;
    let n = 0;
    lignes.forEach((l, i) => {
      const y = 1450 + (i - (lignes.length - 1) / 2) * 58;
      let x = 540 - c.measureText(l).width / 2; c.textAlign = 'left'; c.textBaseline = 'middle';
      for (const m of l.split(' ')) {
        const dit = n <= prog; c.globalAlpha = al * (dit ? 1 : .5); c.shadowColor = 'rgba(0,0,0,.85)'; c.shadowBlur = 16;
        c.fillStyle = col; c.fillText(m, x, y); x += c.measureText(m + ' ').width; n += m.length + 1;
      }
    });
    c.restore();
  }
}

function renduAssistant(c, t) {
  if (t < 5) scene1(c, t);
  else if (t < 10) scene2(c, t);
  else if (t < 17) scene3(c, t);
  else if (t < LOGO) scene4(c, t);
  else scene5(c, t);
  if (ST) sousTitresDialogue(c, t);
  finition(c, t);
}
window.draw = t => { ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; renduAssistant(ctx, t); };
