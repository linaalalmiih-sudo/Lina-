# NEXORA AI · « Votre prochain employé n'est pas humain. »

Deuxième pub, 30 s, 9:16. **Concept de démonstration** : la scène est fictive, aucun résultat client n'est annoncé.
La mention « Concept de démonstration · scénario fictif » apparaît en petit sous le logo.

| Fichier | Contenu |
|---|---|
| `video/assistant/rendu/nexora-ai-assistant-4k.mp4` | la vidéo finie, 2160×3840 : voix, musique, bruitages, sous-titres incrustés |
| `video/assistant/rendu/nexora-ai-assistant-1080p.mp4` | la même en 1080×1920, à charger dans Meta et TikTok |
| `video/assistant/rendu/nexora-ai-assistant-sans-sous-titres-1080p.mp4` | sans sous-titres incrustés |
| `production/assistant-storyboard.jpg` | le storyboard, 15 plans |
| `production/assistant-sous-titres.srt` | les sous-titres |

## Ce que j'ai gardé, et ce que j'ai ajusté

| Proposition | Dans la vidéo | Pourquoi |
|---|---|---|
| Écran noir, un téléphone sonne dans un bureau vide | Le bureau vide est visible dès la première image : baie vitrée, ville la nuit, écran et lampe éteints, le téléphone qui s'allume et vibre | Le noir pur fait défiler ; le bureau vide raconte « personne n'est là » sans un mot |
| « Il est 3 h 17 du matin. » | Identique, et 03:17 sur l'écran du téléphone | — |
| L'assistante dit bonjour | Elle **décroche à l'image** (« Assistante NEXORA répond… »), puis un orbe lumineux vibre avec sa voix | On voit qui parle : l'orbe devient le visage de l'assistante, sans robot ni personnage |
| Le prospect pose une question et réserve | **Un vrai échange court** : « Vous auriez un rendez-vous cette semaine ? » / « Jeudi à 10 h, cela vous convient ? » / « Parfait. » / « C'est réservé. Je vous envoie la confirmation. » La voix du client est une voix d'homme, filtrée comme au téléphone | Un dialogue complet en 7 s se comprend, et deux voix différentes rendent la scène vivante. La transcription s'affiche en direct, le créneau passe à « Rendez-vous réservé » |
| Succession d'emails, réservations, demandes | Un fil de tâches qui tombent une par demi-temps (« Répondu », « Confirmé », « Ajouté au CRM »…), pendant que l'horloge file de 03:18 à 07:58 sous « Pendant que vous dormez » | L'horloge rend la nuit sensible ; aucun compteur chiffré, donc aucune promesse de volume |
| Le logo et « L'intelligence travaille avec vous. » | La même signature que la première pub, sortie de la ligne de lumière | Les deux pubs se reconnaissent comme une même marque |
| « Découvrez votre futur assistant IA. » | Dit et affiché sur un bouton | — |

Une remarque sur l'accroche « Votre prochain employé n'est pas humain » : je ne l'ai pas mise à l'écran, la vidéo
la montre sans la dire. Elle ferait un très bon **texte principal de l'annonce** ou une **légende** Instagram et TikTok :
« Votre prochain employé n'est pas humain. Il répond à vos clients à 3 h 17 du matin. »

## La voix et les sous-titres

| Instant | Qui | Texte |
|---|---|---|
| 0:05,45 | Assistante | Bonjour. Je suis votre assistante virtuelle. Comment puis-je vous aider ? |
| 0:10,15 | Client (téléphone) | Bonsoir. Vous auriez un rendez-vous cette semaine ? |
| 0:13,40 | Assistante | Jeudi à 10 h, cela vous convient ? |
| 0:15,40 | Client | Parfait. |
| 0:16,00 | Assistante | C'est réservé. Je vous envoie la confirmation. |
| 0:24,00 | Signature | NEXORA AI. L'intelligence travaille avec vous. |
| 0:27,45 | Signature | Découvrez votre futur assistant IA. |

Les sous-titres sont colorés selon qui parle : bleu clair pour l'assistante, argent pour le client, blanc pour la
signature. L'assistante se présente comme virtuelle dès sa première phrase : c'est honnête, et c'est le principe de la
pub.

Les voix sont des voix de synthèse libres (Piper : `siwis` pour l'assistante, `tom` pour le client). Pour ElevenLabs,
générer chaque phrase séparément et remplacer `video/audio/assistant/<id>.wav` (a1, p1, a2, p2, a3, n1, n2), puis relancer
le mixage (voir ci-dessous). Pour l'assistante, une voix douce et précise ; pour le client, une voix d'homme naturelle,
à passer en effet « téléphone ».

## Son

Musique originale (`video/tools/musique_assistant.py`), 120 BPM, mi mineur : une note grave et le silence du bureau la
nuit, une **sonnerie originale** (quatre notes, deux fois) avec la vibration sur le bureau, un déclic quand l'assistante
décroche. Ensuite, une pulsation douce pendant l'appel, puis un groove complet pendant le défilé des tâches, avec un clic
par tâche. Pour finir, impact et scintillement sur le logo à 23 s. Mix à −14 LUFS.

## Refaire ou modifier

Depuis `video/` :

    python3 tools/voix_assistant.py VOIX        # dossier des voix Piper siwis et tom
    python3 tools/musique_assistant.py
    python3 tools/mix_assistant.py
    ffmpeg -y -i audio/assistant/mix-brut.wav -af "acompressor=threshold=-18dB:ratio=2.5:attack=5:release=120:makeup=2,alimiter=limit=0.8:level=false,loudnorm=I=-14:TP=-1.5:LRA=11,volume=-0.9dB" -ar 48000 audio/assistant/mix.wav
    node tools/rendu.mjs video --scene assistant/index.html --dpr 2 --workers 4 --crf 17 --out out/a-muet-4k.mp4
    ffmpeg -y -i out/a-muet-4k.mp4 -i audio/assistant/mix.wav -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart assistant/rendu/nexora-ai-assistant-4k.mp4

Les images sont dans `video/assistant/assistant.js` (scènes 1 à 5), qui réutilise les outils et le logo de
`video/scene/scene.js`. Les textes du fil de tâches sont dans `TACHES`.
