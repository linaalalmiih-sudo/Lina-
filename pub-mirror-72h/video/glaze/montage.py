"""Pub « Duo Iconic » (Glaze & Gaze + Mirror 72H, précommande) : montage des vraies vidéos et photos de la marque.
Plans recadrés en 9:16, étalonnage lumineux, fondus enchaînés ; le calque texte (glaze/index.html) est posé par-dessus.
Aucun son. Usage : python3 glaze/montage.py <dossier des vidéos reçues> <dossier des médias du site>"""
import os, sys, subprocess, json, shutil

SRCS = sys.argv[1:]  # dossiers des fichiers reçus (vidéos de la marque, médias du site)
ICI = os.path.dirname(os.path.abspath(__file__))
TMP = os.path.join(ICI, '..', 'out', 'glaze')
os.makedirs(TMP, exist_ok=True)
FPS, XF = 30, .25  # fondu enchaîné de 0,25 s


def f(prefix):
    for d in SRCS:
        for n in sorted(os.listdir(d)):
            if n.startswith(prefix):
                return os.path.join(d, n)
    raise SystemExit('fichier manquant : ' + prefix)


# lumineux : on éclaircit les ombres, on garde la peau et les reflets naturels, très légère touche chaude
CHAUD = 'null'  # couleurs naturelles : aucun étalonnage, les images restent comme filmées
VERT = 'scale=1080:1920:flags=lanczos'
# (nom, fichier, début dans la source, durée dans le film, filtres)
PLANS = [
    ('a_lisseur', f('duo.mp4'), 0.5, 3.0, VERT + ',unsharp=5:5:0.5,' + CHAUD),
    ('b_frisottis', f('c3e1fcb9'), 0.5, 3.0, 'crop=608:1080:656:0,scale=1080:1920:flags=lanczos,unsharp=5:5:0.6'),
    ('c_probleme', f('probleme.png'), 0, 3.0, 'photo'),
    ('d_revelation', None, 0, 4.0, 'couleur'),
    ('e_mirror', f('cd54ce23'), 1.6, 3.5, VERT + ',' + CHAUD),
    ('f_test', f('b598ca90'), 0.4, 2.5, "scale=1920:1080,split[a][b];[a]scale=-2:1920,crop=1080:1920,gblur=sigma=40[fond];[b]scale=1080:608[av];[fond][av]overlay=0:656," + CHAUD),
    ('g_regard', f('3d9c0641'), 4.6, 3.0, VERT + ',' + CHAUD),
    ('h_duo', f('IMG_0394'), 0, 3.0, 'photo-droite'),
]

segs = []
for i, (nom, src, deb, dur, filt) in enumerate(PLANS):
    d = dur + (XF if i < len(PLANS) - 1 else 0)
    out = os.path.join(TMP, nom + '.mp4')
    if filt == 'couleur':
        cmd = ['ffmpeg', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', f'color=c=0xF4EADB:s=1080x1920:r={FPS}:d={d:.3f}',
               '-vf', 'format=yuv420p', '-c:v', 'libx264', '-crf', '12', out]
    elif filt.startswith('photo'):
        n = int(round(d * FPS))
        z = "zoompan=z='1+0.07*on/%d':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=%d" % (n, FPS)
        pre = 'scale=-2:3840:flags=lanczos,crop=2160:3840:' + ('iw-2160-120' if filt == 'photo-droite' else '(iw-2160)/2') + ':0,'
        post = CHAUD
        cmd = ['ffmpeg', '-loglevel', 'error', '-y', '-loop', '1', '-i', src, '-t', f'{d:.3f}', '-vf', pre + z + ',' + post + ',format=yuv420p',
               '-r', str(FPS), '-c:v', 'libx264', '-crf', '12', '-preset', 'medium', out]
    else:
        cmd = ['ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{deb:.3f}', '-i', src, '-t', f'{d:.3f}', '-an',
               '-vf', filt + f',fps={FPS},format=yuv420p', '-c:v', 'libx264', '-crf', '12', '-preset', 'medium', out]
    subprocess.run(cmd, check=True)
    segs.append((out, d))
    print('plan', nom, f'{d:.2f} s')

# enchaînement en fondus
ins, fc, last, t = [], [], '[0:v]', 0.0
for i, (p, d) in enumerate(segs):
    ins += ['-i', p]
for i in range(1, len(segs)):
    t += PLANS[i - 1][3]
    lab = f'[x{i}]'
    fc.append(f'{last}[{i}:v]xfade=transition=fade:duration={XF}:offset={t:.3f}{lab}')
    last = lab
fc.append(f'{last}trim=duration=25,setpts=PTS-STARTPTS[v]')
base = os.path.join(TMP, 'base.mp4')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *ins, '-filter_complex', ';'.join(fc), '-map', '[v]',
                '-c:v', 'libx264', '-crf', '12', '-preset', 'medium', '-pix_fmt', 'yuv420p', base], check=True)
print('base :', base)
