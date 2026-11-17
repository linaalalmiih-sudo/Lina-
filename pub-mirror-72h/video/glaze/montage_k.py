"""Duo Iconic, version « grande marque de soin » : ralentis, gros plans, grands titres fins.
Couleurs naturelles (aucun étalonnage), juste un peu de netteté. Aucun son.
Usage : python3 glaze/montage_k.py <dossier des vidéos reçues> <dossier des médias du site>"""
import os, sys, subprocess

SRCS = sys.argv[1:]
ICI = os.path.dirname(os.path.abspath(__file__))
TMP = os.path.join(ICI, '..', 'out', 'glaze-k')
os.makedirs(TMP, exist_ok=True)
FPS, XF = 30, .2


def f(prefix):
    for d in SRCS:
        for n in sorted(os.listdir(d)):
            if n.startswith(prefix):
                return os.path.join(d, n)
    raise SystemExit('fichier manquant : ' + prefix)


NET = 'unsharp=5:5:0.35'
# ralenti fluide : images intermédiaires calculées
RALENTI = lambda k: f'setpts={k}*PTS,minterpolate=fps={FPS}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1'
# gros plan qui avance doucement (z0 -> z1), centré en (cx, cy) en fraction de l'image
def zoom(z0, z1, n, cx=.5, cy=.5):
    return (f"zoompan=z='{z0}+({z1}-{z0})*on/{n}':x='iw*{cx}-iw/zoom/2':y='ih*{cy}-ih/zoom/2':d=1:s=1080x1920:fps={FPS}")

# (nom, fichier, début source, durée dans le film, ralenti, filtres)
PLANS = [
    ('a_lisseur', 'duo.mp4', 0.6, 2.5, 1.0, lambda n: 'scale=1080:1920:flags=lanczos,' + zoom(1.15, 1.3, n, .45, .45)),
    ('b_frisottis', 'c3e1fcb9', 0.6, 2.5, 1.0, lambda n: 'crop=608:1080:656:0,scale=1080:1920:flags=lanczos,' + zoom(1.0, 1.12, n, .5, .4)),
    ('c_probleme', 'probleme.png', 0, 2.5, 0, 'photo'),
    ('d_revelation', None, 0, 4.0, 0, 'couleur'),
    ('e_mirror', 'cd54ce23', 1.8, 3.0, 1.5, lambda n: 'scale=1080:1920:flags=lanczos,' + zoom(1.25, 1.4, n, .5, .42)),
    ('f_test', 'b598ca90', 0.4, 2.5, 1.0, lambda n: "scale=1920:1080,split[a][b];[a]scale=-2:1920,crop=1080:1920,gblur=sigma=40[fond];[b]scale=1080:608[av];[fond][av]overlay=0:656"),
    ('g_mouvement', '3d9c0641', 0.0, 4.0, 2.0, lambda n: 'scale=1080:1920:flags=lanczos,' + zoom(1.0, 1.1, n, .5, .45)),
    ('h_hero', 'model.png', 0, 1.6, 0, 'photo-hero'),
    ('i_duo', 'IMG_0394', 0, 2.9, 0, 'photo-droite'),
]

segs = []
for i, (nom, src, deb, dur, k, filt) in enumerate(PLANS):
    d = dur + (XF if i < len(PLANS) - 1 else 0)
    n = int(round(d * FPS))
    out = os.path.join(TMP, nom + '.mp4')
    if filt == 'couleur':
        cmd = ['ffmpeg', '-loglevel', 'error', '-y', '-f', 'lavfi', '-i', f'color=c=0xF4EADB:s=1080x1920:r={FPS}:d={d:.3f}',
               '-vf', 'format=yuv420p', '-c:v', 'libx264', '-crf', '12', out]
    elif isinstance(filt, str) and filt.startswith('photo'):
        cx = {'photo-droite': '(iw-2160)-120', 'photo-hero': '(iw-2160)/2'}.get(filt, '(iw-2160)/2')
        z = zoom(1.0, 1.08 if filt != 'photo-hero' else 1.12, n, .5, .5 if filt != 'photo-hero' else .55)
        vf = f'scale=-2:3840:flags=lanczos,crop=2160:3840:{cx}:0,' + z + ',' + NET + ',format=yuv420p'
        cmd = ['ffmpeg', '-loglevel', 'error', '-y', '-loop', '1', '-i', f(src), '-t', f'{d:.3f}', '-vf', vf, '-r', str(FPS),
               '-c:v', 'libx264', '-crf', '12', '-preset', 'medium', out]
    else:
        span = d / k
        pre = RALENTI(k) + ',' if k != 1 else ''
        vf = f'fps={FPS},' + pre + filt(n) + ',' + NET + ',format=yuv420p'
        cmd = ['ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{deb:.3f}', '-i', f(src), '-t', f'{span + .1:.3f}', '-an',
               '-filter_complex', vf, '-t', f'{d:.3f}', '-c:v', 'libx264', '-crf', '12', '-preset', 'medium', out]
    subprocess.run(cmd, check=True)
    segs.append((out, d))
    print('plan', nom, f'{d:.2f} s')

ins, fc, last, t = [], [], '[0:v]', 0.0
for p, d in segs:
    ins += ['-i', p]
for i in range(1, len(segs)):
    t += PLANS[i - 1][3]
    trans = 'fadewhite' if PLANS[i][0] in ('d_revelation', 'h_hero') else 'fade'
    fc.append(f'{last}[{i}:v]xfade=transition={trans}:duration={XF}:offset={t:.3f}[x{i}]')
    last = f'[x{i}]'
fc.append(f'{last}trim=duration=25,setpts=PTS-STARTPTS[v]')
base = os.path.join(TMP, 'base.mp4')
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', *ins, '-filter_complex', ';'.join(fc), '-map', '[v]',
                '-c:v', 'libx264', '-crf', '12', '-preset', 'medium', '-pix_fmt', 'yuv420p', base], check=True)
print('base :', base)
