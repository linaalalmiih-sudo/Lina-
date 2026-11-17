"""Pub Mirror 72H « réelle » : montage des vraies vidéos et photos de la marque.
1) chaque plan est recadré en 9:16, étalonné (noir et doré), ralenti si besoin ;
2) les plans sont enchaînés en fondus enchaînés ;
3) le calque texte (sous-titres, logo, mentions) est rendu par reel/index.html et posé par-dessus ;
4) grain et vignette. Aucun son : la marque ajoute musique et voix.
Usage : python3 reel/montage.py <dossier des fichiers reçus>"""
import os, sys, subprocess, json, shutil

SRC = sys.argv[1]
ICI = os.path.dirname(os.path.abspath(__file__))
TMP = os.path.join(ICI, '..', 'out', 'reel')
os.makedirs(TMP, exist_ok=True)
FPS, XF = 30, .25  # fondu enchaîné de 0,25 s


def f(prefix):
    for n in os.listdir(SRC):
        if n.startswith(prefix):
            return os.path.join(SRC, n)
    raise SystemExit('fichier manquant : ' + prefix)


# lumineux : on éclaircit les ombres, on garde la peau et les reflets naturels, très légère touche chaude
CHAUD = 'eq=brightness=0.03:contrast=1.02:saturation=1.05:gamma=1.12,colorbalance=rh=0.015:bh=-0.015'
VERT = 'scale=1080:1920:flags=lanczos'
# (nom, fichier, début dans la source, durée dans le film, filtres)
PLANS = [
    ('a_frisottis', f('c3e1fcb9'), 0.5, 2.8, 'crop=608:1080:656:0,scale=1080:1920:flags=lanczos,unsharp=5:5:0.6,'
     'eq=brightness=0.02:contrast=1.02:saturation=0.85:gamma=1.05'),
    ('b_avant_apres', f('b598ca90'), 0.2, 3.8, "scale=1920:1080,split[a][b];[a]scale=-2:1920,crop=1080:1920,gblur=sigma=40,eq=brightness=0.04[fond];[b]zoompan=z='1+0.03*on/120':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1080x608:fps=30[av];[fond][av]overlay=0:656," + CHAUD),
    ('c_gel', f('cd54ce23'), 1.6, 3.6, VERT + ',' + CHAUD),
    ('d_peigne', f('b146d09b'), 6.6, 2.8, VERT + ',' + CHAUD),
    ('e_cheveux', f('3d9c0641'), 0.2, 2.0, VERT + ',' + CHAUD),
    ('f_regard', f('3d9c0641'), 5.6, 3.0, VERT + ',' + CHAUD),
    ('g_packshot', f('c65e9327'), 0, 3.0, 'photo'),
    ('h_signature', f('cbe8347b'), 0, 4.0, 'photo-sombre'),
]

segs = []
for i, (nom, src, deb, dur, filt) in enumerate(PLANS):
    d = dur + (XF if i < len(PLANS) - 1 else 0)
    out = os.path.join(TMP, nom + '.mp4')
    if filt.startswith('photo'):
        n = int(round(d * FPS))
        z = "zoompan=z='1+0.07*on/%d':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=%d" % (n, FPS)
        pre = 'scale=2560:3840:flags=lanczos,crop=2160:3840,'
        post = CHAUD if filt == 'photo' else 'gblur=sigma=28,eq=brightness=0.02:saturation=1.0'
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
