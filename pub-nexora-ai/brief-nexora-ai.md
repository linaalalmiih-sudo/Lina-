# NEXORA AI · Pub vidéo « L'intelligence qui fait avancer votre entreprise »

Format : 9:16 vertical · 30 s · français · Instagram Reels, TikTok, Meta Ads · cible : dirigeants de PME

Ce dossier contient :

| Fichier | Contenu |
|---|---|
| `video/nexora-ai-4k.mp4` | **la vidéo finie**, 2160×3840, voix off, musique, bruitages, sous-titres incrustés |
| `video/nexora-ai-1080p.mp4` | la même en 1080×1920 (la taille à charger dans Meta et TikTok) |
| `video/nexora-ai-sans-sous-titres-1080p.mp4` | sans sous-titres incrustés, pour utiliser les sous-titres automatiques de la plateforme |
| `production/storyboard.jpg` | le storyboard, une image par plan |
| `production/sous-titres.srt` | les sous-titres synchronisés, importables dans CapCut, Premiere, TikTok, Meta |
| `production/prompts-runway-kling.md` | les prompts prêts à coller dans Runway ou Kling, plan par plan |
| `production/script-voix-off.md` | la voix off complète, avec instants et réglages ElevenLabs |
| `video/` | la scène, la musique et les outils pour refaire ou modifier la vidéo (voir `video/NOTICE.md`) |

---

## 1. Le scénario amélioré : ce qui change et pourquoi

| Brief d'origine | Version améliorée | Pourquoi |
|---|---|---|
| Écran noir, puis les notifications | **La première notification tombe à 0,15 s**, le titre est là à 0,3 s, puis la rafale accélère | Sur Reels et TikTok, on décide en une seconde. Le noir pur au départ fait défiler. |
| Les notifications restent un décor | **Les notifications sont aspirées** dans un point de lumière, qui devient le noyau IA de la scène 2 | Le problème se transforme sous nos yeux en solution : une seule idée visuelle relie les scènes 1 et 2. |
| Scène 2 : « des lignes se connectent » | Six applications (Emails, Agenda, CRM, Messagerie, Documents, Facturation) **reliées à un noyau IA**. Les trois mots tombent un par un, sur le temps. | Le dirigeant reconnaît ses propres outils : l'IA vient s'y brancher, elle ne les remplace pas. |
| Scène 3 : quatre interfaces | **Quatre écrans sur un même tableau**, la caméra passe de l'un à l'autre, puis recule pour les montrer tous en même temps | On voit une conversation complète (question, réponse de l'IA, créneau réservé), pas une maquette figée. Le recul final montre que tout tourne en parallèle. |
| Voix off scène 3 : « Automatisez vos processus… » | « Demandes clients, rendez-vous, relances : tout s'automatise. Concentrez-vous sur ce qui compte vraiment. » | Des tâches concrètes, nommées : un dirigeant de PME se reconnaît plus vite que dans « vos processus ». |
| Scène 4 : des workflows | Trois workflows qui tournent, et **un emplacement vide « Sur mesure »** qui se remplit avec « Votre outil » | C'est la preuve visuelle de « sur mesure » : l'automatisation s'adapte aux outils de l'entreprise. |
| CTA seulement à l'écran | **Le CTA est aussi dit** : « Réservez votre diagnostic gratuit. » | Une offre dite à voix haute convertit mieux qu'un texte seul, surtout le son activé (Reels, TikTok). |
| — | Aucun chiffre de résultat (« +40 % », « 10 h gagnées »…) | Respecte la consigne : aucune promesse non démontrée. Les seuls nombres sont des éléments d'interface (horaires, « 3 actifs »). |

Structure : **Accroche (0-1) → Problème (1-5) → Basculement (5-10) → Démonstration (10-17) → Expertise (17-24) → Signature et CTA (24-30)**

---

## 2. Storyboard et prompts visuels détaillés

Le storyboard image est dans `production/storyboard.jpg`. Les prompts complets pour Runway et Kling, en anglais (ces
outils comprennent mieux l'anglais) avec le français à côté, sont dans `production/prompts-runway-kling.md`.

### Direction artistique commune

- **Fond** : noir profond (#020306), halo bleu nuit très doux au centre, vignettage léger, grain de film à peine visible.
- **Couleurs** : argent métallique pour les titres (dégradé blanc, gris perle, argent), **bleu électrique #2F8CFF**
  pour la lumière et les données, blanc pour les textes d'interface. Aucune autre couleur.
- **Matière** : cartes « verre fumé » sombres, bord fin argenté, reflet en haut ; icônes au trait fin.
- **Lumière** : un seul motif lumineux d'un bout à l'autre : le trait de lumière bleue (sous le titre, entre les
  applications, entre les écrans, entre les nœuds des workflows, puis la ligne qui ouvre la signature).
- **Typographie** : Montserrat. Titres en capitales très espacées, fines (300) ou demi-grasses (600) ; interface en 500.
- **Mouvement** : caméra lente qui avance, transitions « sur la lumière » (aspiration, plongée dans le noyau, repli en
  une ligne). Pas de transitions de logiciel de montage (cubes, volets, étoiles).
- **Zones de sécurité Reels / TikTok** : aucun texte important dans les 250 px du haut ni sous 1 500 px (sur 1 920) ;
  rien de lisible à droite au-delà de 960 px, là où se placent les boutons des applications.

### Scène 1 · 0:00-0:05 · Le temps perdu

| Temps | Image | Son | Texte à l'écran |
|---|---|---|---|
| 0:00-0:01 | Noir. Une notification de verre fumé tombe, icône d'email bleue. Le titre se dessine en argent au centre. | Ping de verre, tic-tac d'horloge très sec | **Votre entreprise perd / du temps chaque jour.** |
| 0:01-0:04 | La rafale : 22 notifications (devis, rendez-vous à confirmer, facture à envoyer, relance, nouveau prospect, conflit d'agenda…), de plus en plus vite, l'image tremble à peine. Un trait de lumière bleue souligne le titre. | Pings qui s'accélèrent, tic-tac qui monte | idem |
| 0:04-0:05 | Toutes les notifications sont **aspirées en spirale vers le centre**, laissant des traînées bleues ; le titre s'étire et disparaît ; il ne reste qu'un point de lumière. | Souffle inversé qui aspire, puis impact grave à 0:05 | — |

Voix off (0:01) : « Et si votre entreprise fonctionnait… plus intelligemment ? »

### Scène 2 · 0:05-0:10 · Tout se connecte

| Temps | Image | Son | Texte à l'écran |
|---|---|---|---|
| 0:05-0:06 | Éclair bleu-blanc. Le point devient un **noyau IA** : sphère de lumière, anneaux argentés qui tournent. Six applications apparaissent en hexagone autour. | Impact, basse, grosse caisse feutrée | **AUTOMATISEZ.** (0:05,5) |
| 0:06-0:08 | Des traits bleu électrique partent de chaque application vers le noyau, puis relient les applications entre elles. Des impulsions lumineuses circulent. | Petits signaux électroniques à chaque connexion | **OPTIMISEZ.** (0:06,75) |
| 0:08-0:09,4 | Le réseau entier respire ; lente rotation de caméra. | Arpège qui s'ouvre | **ÉVOLUEZ.** (0:07,95) |
| 0:09,4-0:10 | La caméra **plonge dans le noyau** jusqu'au blanc. | Souffle de plongée, montée | — |

Voix off (0:05,5) : « L'intelligence artificielle transforme votre façon de travailler. »

### Scène 3 · 0:10-0:17 · L'IA au travail

| Temps | Image | Son | Texte à l'écran |
|---|---|---|---|
| 0:10-0:11,7 | Du blanc sort un écran **Assistant IA** : « Bonjour, avez-vous un créneau jeudi ? » → l'IA écrit → « Oui, jeudi à 14 h. Je vous réserve ce créneau ? » → « Parfait, merci ! » | Clics doux, petits signaux | **Moins de tâches répétitives.** |
| 0:11,7-0:13,4 | Mouvement de caméra vers l'écran **Rendez-vous** : le créneau Jeu. 14:00 se remplit en bleu, halo, « Rendez-vous confirmé ». | Souffle de passage, tierce de validation | idem |
| 0:13,4-0:15,1 | Écran **CRM · Prospects** : quatre contacts glissent dans la liste, chacun avec son statut ; « + 4 prospects enregistrés automatiquement ». | Clics à chaque ligne | + **Plus de temps pour votre croissance.** (bleu) |
| 0:15,1-0:16,3 | Écran **Suivi automatique** : l'email se rédige, « Envoyé », puis la séquence J+0, J+3, J+7. | Validation | idem |
| 0:16,3-0:17 | La caméra recule : les quatre écrans tournent ensemble, reliés par des traits de lumière. | Montée | — |

Voix off : « Demandes clients, rendez-vous, relances : tout s'automatise. » (0:10,35) / « Concentrez-vous sur ce qui
compte vraiment. » (0:14,55)

Les noms des contacts (Sophie L., Atelier Moreau…) sont inventés pour l'illustration.

### Scène 4 · 0:17-0:24 · Sur mesure

| Temps | Image | Son | Texte à l'écran |
|---|---|---|---|
| 0:17-0:18,7 | Un tableau « Workflows · 3 actifs ». Trois chaînes de nœuds s'allument : **Prospection** (Nouveau lead → Qualification IA → Ajout au CRM → Email de suivi), **Relation client** (Demande client → Réponse IA → [emplacement vide « Sur mesure »] → Rappel RDV), **Gestion** (Devis signé → Facture → Relance auto → Tableau de bord). | Impact, groove complet, mélodie en cloches | **DES SOLUTIONS IA / SUR MESURE** |
| 0:18,7-0:20,5 | Les impulsions de lumière parcourent les chaînes ; chaque nœud s'allume au passage, une coche bleue valide la fin. | Clics, validations | idem |
| 0:20,5-0:21,5 | La caméra s'approche de l'emplacement vide : le nœud **« Votre outil »** arrive par la droite et s'emboîte. La chaîne s'allume en entier. | Souffle, déclic, validation | idem |
| 0:21,5-0:23,2 | Recul : les trois workflows tournent seuls. | Groove | idem |
| 0:23,2-0:24 | Tout se **replie en une seule ligne de lumière** horizontale ; noir. | Aspiration | — |

Voix off (0:17,4) : « Avec NEXORA AI, nous concevons des automatisations adaptées à votre entreprise. »

### Scène 5 · 0:24-0:30 · Signature

| Temps | Image | Son | Texte à l'écran |
|---|---|---|---|
| 0:24-0:25,2 | La ligne de lumière remonte et dessine l'anneau du logo, puis le monogramme **N** tracé comme un réseau (trois traits, quatre nœuds, deux bleus). « NEXORA » en argent et « AI » en bleu se révèlent de gauche à droite. Halo bleu discret. | Impact grave, cloche, scintillement argenté | **NEXORA AI** |
| 0:25,3-0:26,3 | Un reflet argenté traverse le nom, une seule fois. Ensuite le logo reste **parfaitement immobile et net**. | Souffle léger | idem |
| 0:25,7 | La promesse apparaît sous un filet de lumière. | — | **L'intelligence qui fait avancer votre entreprise.** |
| 0:27,55-0:30 | Le bouton bleu apparaît, un reflet le traverse. | Clic, note douce, la musique s'éteint | **Réservez votre diagnostic gratuit →** |

Voix off : « NEXORA AI. » (0:24,15) / « Passez à la nouvelle génération d'automatisation. » (0:25,25) /
« Réservez votre diagnostic gratuit. » (0:28,05)

Le logo est un **logo de travail** dessiné pour la vidéo. Si NEXORA AI a déjà un logo, envoyez-le : il remplace le
monogramme dans `video/scene/scene.js` (fonction `embleme`).

---

## 3. La voix off complète

Le texte, les instants exacts et les réglages ElevenLabs sont dans `production/script-voix-off.md`. 63 mots, 21 s de
parole sur 30 s : un débit posé et confiant, sans précipitation.

> Et si votre entreprise fonctionnait… plus intelligemment ?
> L'intelligence artificielle transforme votre façon de travailler.
> Demandes clients, rendez-vous, relances : tout s'automatise.
> Concentrez-vous sur ce qui compte vraiment.
> Avec NEXORA AI, nous concevons des automatisations adaptées à votre entreprise.
> NEXORA AI. Passez à la nouvelle génération d'automatisation.
> Réservez votre diagnostic gratuit.

La voix de la vidéo est une **voix de synthèse libre** (Piper, `fr_FR-siwis-medium`), légèrement grave et traitée
comme une voix off de pub. Elle est correcte, mais une voix ElevenLabs ou une comédienne donnera un rendu nettement plus
haut de gamme : on remplace les fichiers et on relance le mixage (voir `video/NOTICE.md`), sans toucher à l'image.

---

## 4. Montage, transitions, effets sonores, sous-titres

### Montage et transitions

| Instant | Transition | Comment |
|---|---|---|
| 0:04,05-0:05 | **Aspiration** | Les éléments convergent vers le centre avec traînées, le point de lumière grossit, éclair à 0:05 pile |
| 0:09,35-0:10 | **Plongée** | Zoom ×10 en accélération sur le noyau jusqu'au blanc ; la scène 3 sort du blanc en 0,4 s |
| 0:11,7 / 13,4 / 15,1 | **Mouvement de caméra** entre les écrans | 0,3 s, accélération et freinage doux, souffle sonore |
| 0:16,3-0:17 | **Recul** puis flash léger | La vue d'ensemble fait respirer avant la scène 4 |
| 0:23,25-0:24 | **Repli en ligne** | Toute l'image s'écrase en une ligne lumineuse qui devient le point de départ du logo |

Règles : chaque coupe tombe **sur un temps de la musique** (120 BPM : 5, 10, 17 et 24 s sont des temps) ; aucun texte
ne reste moins de 1,5 s ; le logo reste immobile pendant les 4 dernières secondes.

### Musique

Originale, synthétisée par code (`video/tools/musique.py`), aucun titre existant n'est copié. 120 BPM, do mineur.
- 0-5 s : nappe sombre filtrée, tic-tac nerveux (le temps qui passe), grosse caisse feutrée.
- 5-10 s : la nappe s'ouvre, arpège électronique discret, grosse caisse sur 1 et 3.
- 10-17 s : groove complet (grosse caisse, claps, charleston, basse pulsée), arpège plus brillant.
- 17-24 s : même groove, double charleston, mélodie en cloches.
- 24-30 s : accord tenu, ouvert et lumineux, arpège très doux, extinction à 30 s.
- Montées de souffle avant chaque coupe, impact grave sur chaque coupe.
- La musique baisse de 8 dB sous la voix. Mix final à −14 LUFS, crête à −1,5 dBTP (norme des réseaux sociaux).

Pour une musique de banque de sons à la place : chercher « corporate tech », « minimal electronic », « luxury
technology », 115-125 BPM, sans voix, avec un temps fort à 24 s pour le logo.

### Effets sonores

| Instant | Effet |
|---|---|
| 0:00-0:03,7 | 22 pings de verre (une note par notification), qui s'accélèrent |
| 0:04,05 | Souffle inversé (aspiration) → impact grave à 0:05 |
| 0:05,55 / 6,75 / 7,95 | Cloche aiguë et souffle bref sur chaque mot |
| 0:05,75-0:07,8 | Petits signaux électroniques à chaque connexion |
| 0:09,45 | Souffle de plongée |
| 0:10-0:16 | Clics d'interface, l'IA qui écrit, validations (tierce montante) à 12,7 et 15,6 |
| 0:17-0:23 | Clics de nœuds, coches ; à 20,75 déclic grave de « Votre outil » |
| 0:23,25 | Aspiration → impact, cloche et scintillement argenté à 0:24 |
| 0:27,6 | Clic du bouton et note douce |

### Sous-titres

- Fichier : `production/sous-titres.srt` (10 cartons, calés sur la voix réelle).
- Incrustés dans `nexora-ai-4k.mp4` et `nexora-ai-1080p.mp4` : Montserrat demi-gras 44 px, blanc, ombre douce, à
  1 415 px du haut (hors des boutons des applications), au maximum deux lignes. Le mot prononcé passe en blanc plein,
  la suite reste en gris argent : on suit la voix sans le son.
- Version sans sous-titres fournie pour les plateformes qui ajoutent les leurs.

---

## 5. Diffusion Meta et TikTok

- Charger `nexora-ai-1080p.mp4` (H.264, AAC, 30 i/s). Garder la 4K comme master.
- Texte principal de l'annonce (suggestion) : « Vos demandes clients, rendez-vous et relances peuvent s'organiser
  tout seuls. NEXORA AI conçoit des automatisations sur mesure pour les PME. Réservez votre diagnostic gratuit. »
- Bouton : « Réserver » ou « En savoir plus », vers la page de prise de rendez-vous.
- Variantes à tester : l'accroche (« Votre entreprise perd du temps chaque jour. » contre « Combien de temps passez-vous
  sur vos emails ? ») en ne changeant que la scène 1.

## 6. À fournir ou à valider

- **Le logo officiel**, s'il existe (sinon le monogramme N de la vidéo peut servir de base).
- **L'adresse du site** ou de la page de réservation : je peux l'ajouter sous le bouton final.
- La prononciation du nom : dans la vidéo, « Nexora A-I » à la française. Pour « Nexora A.I. » à l'anglaise
  (« é-aï »), le préciser à la voix ElevenLabs.
