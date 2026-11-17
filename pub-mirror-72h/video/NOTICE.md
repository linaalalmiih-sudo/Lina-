# Pub Mirror 72H — la vidéo fabriquée par code

25 s, vertical 9:16, 2160×3840 (4K) et 1080×1920, 30 i/s. Tout est dessiné par code (canvas rendu par Chromium),
la musique et les bruitages sont synthétisés (aucun son existant n'est copié), puis ffmpeg assemble l'image et le son.
Même principe que le kit « Lancement de produit » : on modifie la scène, on relance le rendu.

**Style :** motion design illustré (pas de prise de vue réelle). Le tube est redessiné fidèlement d'après la photo du
vrai produit, avec les vraies mentions de l'étiquette. Pas de voix : les dialogues s'affichent en bulles, mot après mot,
pour une vidéo qui se comprend **sans le son** (comme la plupart des vues sur TikTok et Meta).

## L'histoire

| Secondes | Ce qui se passe |
|---|---|
| 0 – 5 | Hook : la fille devant le miroir, cheveux en nuage. « 1H DE BRUSHING. » / « 2 MIN SOUS LA PLUIE. 💀 » ; « Non mais c'est une blague ?! » ; *pouf* sur le temps 3 |
| 5 – 10 | Panoramique filé vers la coiffeuse : le tube Mirror 72h ouvre les yeux (ding). « Meuf… tu laisses vraiment la météo choisir ta coiffure ? » ; « …Pardon ?! » ; « Oui, c'est moi qui parle… » + clin d'œil |
| 10 – 16 | La serviette balaie l'écran. Le tube dépose une goutte de gel doré sur cheveux essorés (SANS RINÇAGE) ; le lisseur passe, compteur jusqu'à 230 °C (PROTECTION THERMIQUE) ; mèche brillante (ANTI-FRISOTTIS, ANTI-HUMIDITÉ) |
| 16 – 19,5 | Le lendemain, sous la pluie : la coiffure tient, compteur jusqu'à 72H ; retour au même miroir : « Attends… donc je panique plus quand il pleut ?! » |
| 19,5 – 21 | Le tube, fier : « Ta coiffure, tes règles. Pas celles de la météo. » |
| 21 – 23 | Packshot : le tube plongé dans la coupe à champagne de gel doré. « LA MÉTÉO N'A PLUS LE DERNIER MOT. ☔✨ » ; « Ton brushing mérite mieux que de finir en nuage. » |
| 23 – 25 | Fin : logo, « MIRROR 72H — GLOSS BY K », bouton « COMMANDE LE TIEN MAINTENANT 👇 », www.glossbyk.com |

Musique : 120 BPM, ré majeur, coupes et apparitions sur les temps. Mix à −14 LUFS, crête à −2,5 dBFS.
Le logo utilisé (`assets/logo-fr.png`) est le logo officiel sans le slogan anglais.

## Refaire la vidéo

Il faut Node 18+, Playwright avec Chromium, Python 3 avec numpy, ffmpeg. Depuis ce dossier :

    python3 tools/musique.py
    ffmpeg -y -i audio/mix-brut.wav -af "acompressor=threshold=-20dB:ratio=3:attack=5:release=90:makeup=4,alimiter=limit=0.7:level=false,loudnorm=I=-14:TP=-1.5:LRA=9,volume=-1dB" -ar 48000 audio/mix.wav
    node tools/rendu.mjs video --dpr 2 --fps 30 --workers 4 --crf 17 --out out/muet-4k.mp4
    ffmpeg -y -i out/muet-4k.mp4 -i audio/mix.wav -c:v copy -c:a aac -b:a 192k -shortest mirror-72h-4k.mp4
    ffmpeg -y -i mirror-72h-4k.mp4 -vf scale=1080:1920:flags=lanczos -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a copy -movflags +faststart mirror-72h-1080p.mp4

Images d'essai : `node tools/rendu.mjs stills --dpr 0.5 --times 1,6,12.5,22 --dir out/essai`.

## Changer quelque chose

- **Un dialogue ou un texte** : `scene/scene.js`, appels `bubble(...)` (bulles) et `punch(...)` (gros textes), dans
  `scene1` à `scene5`. Le premier nombre après le texte est l'instant d'apparition, le second l'instant de disparition.
- **L'étiquette du tube** : fonction `tube(...)`.
- **Un instant** : les secondes sont écrites dans chaque scène ; si un temps fort bouge, déplacer aussi le bruitage
  correspondant dans `tools/musique.py` (section « bruitages »).
- **La musique** : `tools/musique.py` (accords `CHORDS`, mélodie `MOTIF`).
