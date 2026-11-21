"""Prépare les vraies images de la vidéo « Le voile anti-météo » : chaque plan est recadré en 1080×1920 et découpé
en images à 60 i/s (ralentis fluides calculés pour les plans marqués « fluide »). Les photos sont recadrées à part.
Usage : python3 punch/prep.py <dossier des fichiers reçus> <dossier des médias du site> [<dossier produits du site>]"""
import os, sys, subprocess, json
from PIL import Image

U, M = sys.argv[1], sys.argv[2]
P = sys.argv[3] if len(sys.argv) > 3 else M
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'out', 'punch')
os.makedirs(OUT, exist_ok=True)


def trouve(dossier, prefixe):
    for n in sorted(os.listdir(dossier)):
        if n.startswith(prefixe):
            return os.path.join(dossier, n)
    raise SystemExit('fichier manquant : ' + prefixe)


VERT = 'scale=1080:1920:force_original_aspect_ratio=increase:flags=lanczos,crop=1080:1920'
# nom, fichier, début, durée source, recadrage, ralenti fluide
VIDEOS = [
    ('lisseur', trouve(M, 'duo.mp4'), 0.4, 4.2, VERT, False),
    ('frisottis', trouve(U, 'c3e1fcb9'), 0.4, 3.2, 'crop=608:1080:656:0,scale=1080:1920:flags=lanczos', False),
    ('gel', trouve(U, 'cd54ce23'), 1.4, 4.0, VERT, True),
    ('peigne', trouve(U, 'b146d09b'), 6.3, 3.4, VERT, True),
    ('test', trouve(U, 'b598ca90'), 0.2, 4.0, 'crop=608:1080:656:0,scale=1080:1920:flags=lanczos', False),
    ('nuit', trouve(M, 'test.mp4'), 1.0, 4.0, VERT, True),
    ('mouvement', trouve(U, '3d9c0641'), 0.0, 2.6, VERT, True),
    ('regard', trouve(U, '3d9c0641'), 5.3, 3.2, VERT, True),
]
PHOTOS = [
    ('probleme', trouve(M, 'probleme.png')),
    ('satin', trouve(U, 'c65e9327')),
    ('canape', trouve(U, '0d536cf7')),
    ('coulure', trouve(P, '9D66246E')),
]

infos = {}
for nom, src, deb, dur, crop, fluide in VIDEOS:
    d = os.path.join(OUT, nom); os.makedirs(d, exist_ok=True)
    for f in os.listdir(d): os.remove(os.path.join(d, f))
    fps = 'minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1' if fluide else 'fps=60'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{deb}', '-i', src, '-t', f'{dur}', '-an',
                    '-vf', f'{crop},{fps},unsharp=5:5:0.3', '-q:v', '3', os.path.join(d, '%05d.jpg')], check=True)
    n = len(os.listdir(d)); infos[nom] = n
    print(nom, n, 'images')
for nom, src in PHOTOS:
    im = Image.open(src).convert('RGB')
    w, h = im.size; k = max(1080 / w, 1920 / h) * 1.25  # marge pour les zooms
    im = im.resize((round(w * k), round(h * k)), Image.LANCZOS)
    im.save(os.path.join(OUT, nom + '.jpg'), quality=92)
    infos[nom] = im.size
    print(nom, im.size)
json.dump(infos, open(os.path.join(OUT, 'infos.json'), 'w'))
