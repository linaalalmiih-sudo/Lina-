# NEXORA AI · Voix off française complète

Vidéo de 30 s. Les instants sont ceux de la vidéo finie et de `sous-titres.srt`. Chaque phrase doit tenir dans sa
« durée max » pour rester calée sur l'image.

## Le ton

Voix féminine française, 30-45 ans, **professionnelle, confiante, chaleureuse sans être commerciale**. Débit posé,
voix placée un peu grave, sourire léger dans la voix sur la fin. Le registre d'une pub de grande marque technologique :
on n'élève jamais la voix, on affirme.

## Le texte, phrase par phrase

| # | Début | Durée max | Texte | Intention |
|---|---|---|---|---|
| 1 | 0:01,0 | 3,5 s | Et si votre entreprise fonctionnait… plus intelligemment ? | Question sincère, petite suspension avant « plus intelligemment » |
| 2 | 0:05,45 | 4,0 s | L'intelligence artificielle transforme votre façon de travailler. | Affirmatif, posé |
| 3 | 0:10,35 | 3,9 s | Demandes clients, rendez-vous, relances : tout s'automatise. | Énumération rythmée, détente sur « tout s'automatise » |
| 4 | 0:14,55 | 2,4 s | Concentrez-vous sur ce qui compte vraiment. | Plus doux, appuyer « vraiment » |
| 5 | 0:17,40 | 5,8 s | Avec NEXORA AI, nous concevons des automatisations adaptées à votre entreprise. | Assurance d'expert, « adaptées » appuyé |
| 6 | 0:24,15 | 1,0 s | NEXORA AI. | Signature : lent, net, avec un léger sourire |
| 7 | 0:25,25 | 2,7 s | Passez à la nouvelle génération d'automatisation. | Élan, ton montant |
| 8 | 0:28,05 | 1,9 s | Réservez votre diagnostic gratuit. | Invitation simple et directe |

63 mots, environ 21 s de parole.

## Dans ElevenLabs

- Bibliothèque de voix : chercher « French », « female », « professional », « narration », « confident » ou
  « corporate ». Écouter la phrase 5 avec chaque voix : c'est la plus longue et la plus exigeante.
- Modèle multilingue le plus récent.
- Réglages de départ : Stability 50 %, Similarity 75 %, Style 15 %, Speed 0,95.
- Écrire « NEXORA AI » tel quel. Si la voix lit mal le nom, écrire « Nexora A-I » (à la française) ou « Nexora
  É-aï » (à l'anglaise), selon la prononciation choisie pour la marque.
- Générer **chaque phrase séparément**, l'exporter en WAV, puis la nommer `v1.wav` à `v8.wav`.

## Remplacer la voix de la vidéo

1. Convertir chaque fichier en 48 kHz mono et le poser dans `video/audio/voix/` (même nom, v1 à v8) :
   `ffmpeg -i v1-elevenlabs.mp3 -ar 48000 -ac 1 video/audio/voix/v1.wav`
2. Depuis `video/` : `python3 tools/mix.py` (recalcule les sous-titres sur la nouvelle voix), puis les commandes de
   rendu de `video/NOTICE.md`.

Si une phrase est trop longue pour sa place, raccourcir le silence en début de fichier ou demander un débit un peu plus
rapide, plutôt que de changer les instants (ils suivent les coupes de l'image).
