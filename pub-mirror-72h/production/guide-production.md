# Mirror 72H — Fabriquer la pub soi-même, étape par étape

Ce guide transforme le dossier (`../brief-mirror-72h.md`) en vidéo finie avec un outil d'IA vidéo de ton choix et
CapCut. Compte une demi-journée à une journée, surtout pour régénérer les plans ratés.

Fichiers utiles dans ce dossier :
- `prompts-prets-a-coller.md` : les 8 prompts complets, à copier tels quels ;
- `sous-titres.srt` : les sous-titres déjà calés à la seconde, à importer dans CapCut ;
- `../references/tube-reel-mirror-72h.jpg` : la photo du tube, à donner comme image de référence.

---

## Étape 1 — Choisir l'outil vidéo

Prends un outil qui accepte **une image de référence** (« image-to-video » ou « éléments / ingrédients ») et le
format **9:16**. Kling, Veo, Runway, Sora ou Hailuo, par exemple, le proposent : leurs fonctions changent vite, vérifie
sur l'offre du moment. Ce qui compte :
- l'**image de référence** pour le tube (plans 2, 3 et 8) ;
- la **cohérence du personnage** d'un plan à l'autre : génère d'abord une image de la fille (plan 1), puis donne-la
  comme référence aux plans 3 à 7 ;
- une option **lip-sync** (synchronisation des lèvres), ou un outil à part pour ça (étape 3).

## Étape 2 — Générer les 8 plans

1. Ouvre `prompts-prets-a-coller.md`, copie le prompt du plan 1, règle **9:16** et la durée indiquée.
2. Génère **3 à 4 versions** par plan et garde la meilleure. C'est normal : un plan sur deux sort avec un défaut
   (mains bizarres, étiquette déformée, cheveux en plastique).
3. Pour les plans avec le tube, vérifie l'étiquette en plein écran. Si les lettres bougent ou se déforment, deux
   solutions : régénérer, ou cadrer pour que l'étiquette soit floue / de biais.
4. Télécharge chaque plan gardé en meilleure qualité, nommé `plan1.mp4`, `plan2.mp4`, etc.

Astuce pour le packshot (plan 8) : si l'IA déforme l'étiquette, fais une **vraie photo** du tube (fond beige,
lumière de fenêtre, téléphone en mode portrait), puis anime-la dans CapCut avec un zoom lent (« Ken Burns »). Le
résultat est souvent plus net qu'une génération.

## Étape 3 — Les voix

**Option A, de vraies voix (le plus naturel) :** enregistre toi-même ou deux amies au téléphone, dans une pièce
calme (un placard à vêtements absorbe très bien l'écho). Une prise par réplique, en suivant le script ci-dessous.

**Option B, des voix de synthèse :** un outil comme ElevenLabs, voix françaises féminines :
- la fille : jeune, vive, expressive ;
- Mirror : plus grave, posée, un peu moqueuse.
Exporte une piste audio par réplique.

Script à enregistrer (le même que dans le dossier) :

| # | Qui | Réplique | Ton |
|---|---|---|---|
| 1 | Fille | Non mais c'est une blague ?! Une heure de lissage… et trois gouttes ont tout ruiné. | Exaspérée, comique, « ruiné » qui traîne |
| 2 | Mirror | Meuf… tu laisses vraiment la météo choisir ta coiffure ? | Posée, taquine, pause après « Meuf » |
| 3 | Fille | …Pardon ?! | Choquée, monte dans les aigus |
| 4 | Mirror | Oui, c'est moi qui parle. On aurait dû se rencontrer avant. | Sûre d'elle, sourire dans la voix |
| 5 | Mirror | Mirror 72H. Sur cheveux essorés, avant ton brushing. Je te protège du lisseur… et de la pluie. Frisottis sous contrôle. | Voix off, complice, rythme du montage |
| 6 | Fille | Attends… donc je panique plus quand il pleut ?! | Incrédule, rire dans la voix |
| 7 | Mirror | Ta coiffure, tes règles. Pas celles de la météo. | Fière |
| 8 | Mirror | Ton brushing mérite mieux que de finir en nuage. | Regard caméra, clin d'œil dans la voix |

**Lip-sync :** les plans où on voit parler la fille (1, 7) et le tube (2, 8) ont besoin que les lèvres suivent la
voix. Utilise la fonction lip-sync de ton outil vidéo (ou un outil dédié) : on lui donne le plan + la piste audio. Pour
le tube, la bouche est petite : un lip-sync approximatif passe très bien.

## Étape 4 — Le montage dans CapCut

1. **Nouveau projet** en 9:16. Importe les 8 plans, les voix, la photo du tube et le logo
   (`../references/logo-gloss-by-k.jpg`).
2. **Place les plans** selon le storyboard (section 2 du dossier) :

   | Temps | Plan |
   |---|---|
   | 0:00-0:05 | Plan 1 — hook |
   | 0:05-0:10 | Plan 2 — le tube parle |
   | 0:10-0:12 | Plan 3 — application |
   | 0:12-0:14 | Plan 4 — coiffage (3 coupes rapides) |
   | 0:14-0:16 | Plan 5 — résultat |
   | 0:16-0:18 | Plan 6 — dehors sous la pluie |
   | 0:18-0:21 | Plan 7 — miroir après (et le tube à 0:20) |
   | 0:21-0:25 | Plan 8 — packshot + carton final |

3. **Les voix** : pose chaque réplique sous son plan.
4. **Les sous-titres** : Texte → Importer des sous-titres → `sous-titres.srt`. Style : blanc, contour noir, police
   grasse, animation « mot par mot ». Place-les au milieu de l'écran, pas en bas (les boutons TikTok les cachent).
5. **Les cartons** (Texte, police fine en capitales, couleur or `#C9A45C` ou blanc, ombre légère) :

   | Temps | Texte |
   |---|---|
   | 0:00-0:01 | 1H DE BRUSHING. |
   | 0:01-0:03 | 2 MIN SOUS LA PLUIE. 💀 |
   | 0:10-0:12 | 💗 SANS RINÇAGE |
   | 0:12-0:14 | 🔥 PROTECTION THERMIQUE JUSQU'À 230°C |
   | 0:14-0:16 | ✨ ANTI-FRISOTTIS · ANTI-HUMIDITÉ |
   | 0:16-0:18 | ☔ JUSQU'À 72H · *le lendemain* |
   | 0:21-0:23 | LA MÉTÉO N'A PLUS LE DERNIER MOT. ☔✨ |
   | 0:23-0:25 | logo + MIRROR 72H — GLOSS BY K · www.glossbyk.com · COMMANDE LE TIEN MAINTENANT 👇 |

6. **Les transitions** : à 0:05 « Whip pan » (ou flou de mouvement), à 0:10 un balayage, à 0:21 « fondu blanc »
   teinté doré. Tout le reste en coupe sèche.
7. **La musique** : prends-la **dans la bibliothèque commerciale** de TikTok (Commercial Music Library) ou de Meta
   (Sound Collection). Une musique tendance « normale » est interdite en pub et fera refuser l'annonce. Volume bas
   (environ −20 dB) pour que les voix passent devant.
8. **Les bruitages** (bibliothèque d'effets de CapCut) : pluie (0:16), « pouf » (0:03 et 0:23), « ding » scintillant
   (0:05), « whoosh » (0:05 et 0:10).
9. **Vérifie la zone sûre** : rien d'important dans le bas de l'écran, le haut, ni la bande de droite.

## Étape 5 — Exporter et tester

1. Export : **1080p ou 4K, 30 i/s**, qualité maximale.
2. Fais une version **15 s** (hook → « Pardon ?! » → démo accélérée → packshot) en dupliquant le projet.
3. Pour les tests A/B, duplique le projet et remplace seulement les 5 premières secondes par les hooks A, B ou C du
   dossier (section 6).
4. Regarde la vidéo **sur ton téléphone, sans le son** : si on comprend tout, c'est bon.
5. Mets en ligne avec les textes d'annonce de la section 7 du dossier.

## Liste de contrôle avant diffusion

- [ ] L'étiquette du tube est lisible et sans lettres déformées dans tous les plans
- [ ] Les lèvres suivent les voix
- [ ] La fille a le même visage dans tous les plans
- [ ] Les cheveux du résultat ont l'air réels (pas plastique, pas perruque)
- [ ] Aucun texte en anglais à l'écran (le « Leave-in » sur le tube est accepté, c'est l'étiquette)
- [ ] Musique issue de la bibliothèque commerciale
- [ ] URL www.glossbyk.com bien écrite au carton final
- [ ] Justificatifs des allégations (72 h, 230 °C) à portée de main
