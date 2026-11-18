# Pub NEXORA AI · la vidéo fabriquée par code

30 s, vertical 9:16, 2160×3840 (4K) et 1080×1920, 30 i/s. Tout est dessiné par code (canvas rendu par Chromium) ; la
musique et les bruitages sont synthétisés (aucun son existant n'est copié) ; la voix off est une voix de synthèse
française libre (Piper `fr_FR-siwis-medium`, Hugging Face `rhasspy/piper-voices`). ffmpeg assemble l'image et le son.

| Fichier | Contenu |
|---|---|
| `scene/scene.js` | les 5 scènes, `scene1` à `scene5`, plus les sous-titres et la finition (grain, vignette) |
| `scene/voix.js` | écrit par `tools/mix.py` : les sous-titres calés sur la voix |
| `tools/voix.py` | le texte de la voix off et la synthèse |
| `tools/musique.py` | la musique (120 BPM, do mineur) et les bruitages ; ses instants reprennent ceux de `scene.js` |
| `tools/mix.py` | place les répliques (`REPLIQUES` : instant et sous-titre), baisse la musique sous la voix, écrit le `.srt` |
| `tools/rendu.mjs` | rendu image par image avec Playwright |

## Refaire la vidéo

Il faut Node 18+, Playwright avec Chromium, Python 3 avec numpy et Pillow, ffmpeg. Depuis ce dossier :

    pip install piper-tts      # puis télécharger fr_FR-siwis-medium.onnx et .onnx.json dans un dossier VOIX
    python3 tools/voix.py VOIX
    python3 tools/musique.py
    python3 tools/mix.py
    ffmpeg -y -i audio/mix-brut.wav -af "acompressor=threshold=-18dB:ratio=2.5:attack=5:release=120:makeup=2,alimiter=limit=0.8:level=false,loudnorm=I=-14:TP=-1.5:LRA=9" -ar 48000 audio/mix.wav
    node tools/rendu.mjs video --dpr 2 --fps 30 --workers 4 --crf 17 --out out/muet-4k.mp4
    node tools/rendu.mjs video --dpr 1 --fps 30 --workers 4 --crf 16 --query st=0 --out out/muet-sans-st-1080p.mp4
    ffmpeg -y -i out/muet-4k.mp4 -i audio/mix.wav -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart nexora-ai-4k.mp4
    ffmpeg -y -i nexora-ai-4k.mp4 -vf scale=1080:1920:flags=lanczos -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a copy -movflags +faststart nexora-ai-1080p.mp4
    ffmpeg -y -i out/muet-sans-st-1080p.mp4 -i audio/mix.wav -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart nexora-ai-sans-sous-titres-1080p.mp4

Le rendu 4K prend environ 3 minutes sur 4 cœurs. Images d'essai :
`node tools/rendu.mjs stills --dpr 0.5 --times 2,8,14,20,28 --dir out/essai`.

## Changer quelque chose

- **Une phrase de voix off** : le texte prononcé dans `tools/voix.py`, le sous-titre et l'instant dans `REPLIQUES` de
  `tools/mix.py`. Relancer `voix.py`, `mix.py`, le mastering ffmpeg et le rendu.
- **Une voix ElevenLabs ou enregistrée** : remplacer `audio/voix/v1.wav` à `v8.wav` (48 kHz mono), puis `mix.py`.
- **Un texte à l'écran** : `scene/scene.js` (titres dans `scene1` à `scene5`, contenus des écrans dans `panneauIA`,
  `panneauAgenda`, `panneauCRM`, `panneauSuivi`, workflows dans `FLUX`).
- **Le logo** : fonctions `embleme` (monogramme) et `motLogo` (nom) de `scene/scene.js`. Pour un logo officiel en
  image, le charger comme `new Image()` et le dessiner à la place de `embleme`.
- **Un instant** : il est écrit dans `scene/scene.js` ; s'il porte un bruitage, le déplacer aussi dans
  `tools/musique.py` (constantes en tête de fichier).
