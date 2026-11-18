# NEXORA AI · Prompts prêts à coller (Runway Gen-4, Kling 2.x)

La vidéo finie existe déjà (`video/nexora-ai-1080p.mp4`, dessinée par code). Ces prompts servent à en faire une
**version filmée en images générées**, ou à créer des plans de remplacement.

## Méthode conseillée

1. **Une image de départ par plan** : générer d'abord une image fixe (Midjourney, Runway Frames, Kling image) avec le
   prompt « Image », ou partir de l'image correspondante de `storyboard.jpg`. Puis l'animer avec le prompt « Mouvement ».
   Le résultat est bien plus fidèle qu'un texte seul.
2. **Format** : 9:16, 1080×1920, clips de 5 s (Runway) ou 5-10 s (Kling, mode Professionnel).
3. **Le texte** (titres, sous-titres, logo) ne se génère pas dans l'outil vidéo : les générateurs déforment les
   lettres. On l'ajoute au montage (CapCut, Premiere) avec `sous-titres.srt`, ou on superpose la vidéo dessinée par code.
4. **Le logo final** : utiliser le plan de la vidéo par code (0:24-0:30), jamais un logo généré.
5. Les prompts sont en anglais (meilleurs résultats). Ajouter partout le prompt négatif.

**Prompt négatif (Kling) / à éviter (Runway)**
```
text, letters, words, watermark, logo, robot, humanoid robot, cartoon, childish, cute, toy, neon pink, purple, green, rainbow colors, cheap stock footage, lens flare overload, people, faces, hands, distorted UI, glitch art, low quality, blurry
```

**Style commun, à coller en fin de chaque prompt**
```
premium technology commercial, deep black background, silver and white accents, electric blue light (#2F8CFF), dark smoked-glass UI panels with thin silver borders, minimal, elegant, subtle volumetric light, shallow depth of field, cinematic, ultra sharp, 4K, vertical 9:16
```

---

## Plan 1 · 0:00-0:05 · Le temps perdu

**Image**
```
A swarm of floating dark smoked-glass notification cards in a pitch-black void, each card with a small glowing blue icon (envelope, calendar, invoice, chat bubble) and blurred unreadable text lines, cards at different depths and slight angles, thin silver edges catching the light, faint blue haze in the center, premium technology commercial, deep black background, silver and white accents, electric blue light, minimal, elegant, cinematic, 4K, vertical 9:16
```
**Mouvement**
```
Notification cards pop into existence one after another, faster and faster, gently drifting upward, the camera slowly pushes in with a very subtle tremor; in the last second all the cards are sucked into a single bright blue point of light at the center, leaving thin blue light trails, then a soft white-blue flash.
```
Kling : intensité de mouvement 0,6. Runway : caméra « push in », lente.

## Plan 2 · 0:05-0:10 · Tout se connecte

**Image**
```
A glowing AI core at the center of a black void: a luminous white-blue sphere surrounded by thin rotating silver rings, six minimalist app icons in dark glass rounded squares arranged in a perfect hexagon around it (mail, calendar, contact, chat, document, invoice), thin electric blue light lines connecting every icon to the core and to each other, tiny light pulses traveling along the lines, floating dust particles, premium technology commercial, deep black background, silver accents, electric blue light, cinematic, 4K, vertical 9:16
```
**Mouvement**
```
The core ignites from a single point of light, the six app icons appear one by one, electric blue lines draw themselves from each icon to the core then around the hexagon, light pulses flow along the network; slow clockwise camera orbit, then in the final second a fast accelerating dolly into the core until the frame turns white.
```

## Plan 3 · 0:10-0:17 · L'IA au travail

Générer **quatre images**, une par écran, puis les monter en enchaînant des mouvements de caméra latéraux rapides.

**3a · Assistant IA**
```
Close-up of a sleek dark glass AI chat interface floating in a black void, a grey message bubble on the left and a glowing electric blue reply bubble on the right, small sparkle AI icon in the header, soft blue light reflected on the glass, unreadable blurred text, premium technology commercial, minimal, cinematic, 4K, vertical 9:16
```
**3b · Rendez-vous**
```
Close-up of a minimalist dark calendar week view interface on smoked glass, grey booked slots and one slot lighting up in bright electric blue with a soft glow, a small confirmation banner with a check mark, black background, premium technology commercial, cinematic, 4K, vertical 9:16
```
**3c · CRM**
```
Close-up of an elegant dark CRM contact list interface on smoked glass, rows with round avatars and blue status pills sliding in one by one, a soft blue highlight on the newest row, black background, premium technology commercial, cinematic, 4K, vertical 9:16
```
**3d · Emails de suivi**
```
Close-up of a dark email composer interface on smoked glass with a glowing blue "send" button turning into a check mark, below a vertical timeline of three automated follow-up steps with blue nodes, black background, premium technology commercial, cinematic, 4K, vertical 9:16
```
**Mouvement (pour chacune)**
```
Interface elements animate in smoothly one by one, subtle parallax, the camera glides slowly forward; end with a quick smooth lateral camera move.
```
**3e · Vue d'ensemble (0:16-0:17)**
```
Four dark glass interface panels arranged in a 2x2 grid floating in a black void, connected by thin electric blue light lines with pulses running between them, the camera pulls back smoothly to reveal all four working at once, premium technology commercial, cinematic, 4K, vertical 9:16
```

## Plan 4 · 0:17-0:24 · Sur mesure

**Image**
```
A large elegant dark smoked-glass workflow automation board floating in a black void, three horizontal chains of four minimalist node icons connected by electric blue light lines, light pulses running from left to right, one node in the middle chain is an empty dashed outline slot, small blue check marks at the end of each chain, premium technology commercial, silver accents, electric blue light, cinematic, 4K, vertical 9:16
```
**Mouvement**
```
Nodes light up as luminous pulses travel along each chain; the camera slowly pushes toward the empty dashed slot, a new glowing node slides in from the right and snaps into place, the whole chain lights up; the camera pulls back; at the end the entire board collapses vertically into a single thin horizontal line of blue-white light.
```

## Plan 5 · 0:24-0:30 · Signature

**Ne pas générer** : utiliser le plan de la vidéo par code, pour que le logo soit exact et parfaitement net. Si besoin
d'un fond animé derrière le logo :
```
Pure deep black background with a very soft electric blue halo breathing slowly in the center, a few tiny floating silver dust particles, a thin horizontal line of light opening at the center, extremely minimal and luxurious, premium technology commercial, 4K, vertical 9:16
```

---

## Montage d'une version générée

1. Poser les clips sur la piste vidéo aux instants du storyboard (5 / 5 / 7 / 7 / 6 s), couper chaque clip sur les
   images clés : les coupes tombent à 5, 10, 17 et 24 s.
2. Poser le son de la vidéo finie (`ffmpeg -i nexora-ai-1080p.mp4 -vn -c:a copy son.m4a`) : musique, voix et
   bruitages sont déjà calés sur ces instants.
3. Ajouter les titres (Montserrat, capitales espacées, argent) et `sous-titres.srt`.
4. Étalonnage : noirs bien noirs, saturation basse sauf le bleu, léger halo (« glow ») sur les hautes lumières.
