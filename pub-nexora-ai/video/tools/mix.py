"""Place la voix off dans le temps, baisse la musique sous la voix, écrit le mix, les sous-titres et la synchro de la scène.
Entrées : audio/musique.wav, audio/bruitages.wav, audio/voix/*.wav
Sorties : audio/mix-brut.wav, scene/voix.js (sous-titres et instants pour la scène), ../production/sous-titres.srt"""
import numpy as np, wave, os, json

ICI = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(ICI, '..', 'audio')
SR = 48000
DUREE = 30.0
N = int(DUREE * SR)

# début de chaque réplique (secondes) et texte des sous-titres ; « | » coupe un sous-titre en deux cartons
REPLIQUES = [
    ('v1', 1.00, "Et si votre entreprise fonctionnait… plus intelligemment ?"),
    ('v2', 5.45, "L'intelligence artificielle transforme votre façon de travailler."),
    ('v3', 10.35, "Demandes clients, rendez-vous, relances : | tout s'automatise."),
    ('v4', 14.55, "Concentrez-vous sur ce qui compte vraiment."),
    ('v5', 17.40, "Avec NEXORA AI, nous concevons | des automatisations adaptées à votre entreprise."),
    ('v6', 24.15, "NEXORA AI."),
    ('v7', 25.25, "Passez à la nouvelle génération d'automatisation."),
    ('v8', 28.05, "Réservez votre diagnostic gratuit."),
]


def lire(p):
    with wave.open(p) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(float) / 32768
        if w.getnchannels() == 2:
            x = x.reshape(-1, 2).mean(1)
        assert w.getframerate() == SR, p
    return x


mus = lire(os.path.join(A, 'musique.wav'))[:N]
sfx = lire(os.path.join(A, 'bruitages.wav'))[:N]
voix = np.zeros(N)
cartons = []
for rid, t0, texte in REPLIQUES:
    v = lire(os.path.join(A, 'voix', rid + '.wav'))
    i = int(t0 * SR)
    j = min(N, i + len(v))
    assert j - i == len(v), f'{rid} dépasse la fin de la vidéo'
    voix[i:j] += v
    t1 = t0 + len(v) / SR
    parts = [p.strip() for p in texte.split('|')]
    poids = np.cumsum([0] + [len(p) for p in parts]) / sum(len(p) for p in parts)
    for k, p in enumerate(parts):
        cartons.append([round(t0 + (t1 - t0) * poids[k], 3), round(t0 + (t1 - t0) * poids[k + 1], 3), p])

# musique baissée sous la voix (−8 dB), attaque et relâche douces
pres = np.abs(voix) > 0.01
k = int(.15 * SR)
pres = np.convolve(pres.astype(float), np.ones(k) / k, 'same') > 0.02
duck = np.where(pres, 10 ** (-8 / 20), 1.0)
lis = int(.12 * SR)
duck = np.convolve(duck, np.ones(lis) / lis, 'same')

mix = mus * duck * .8 + sfx * .55 + voix * 1.0
mix /= np.max(np.abs(mix)) / .8
st = (np.clip(np.stack([mix, mix], 1), -1, 1) * 32767).astype('<i2')
with wave.open(os.path.join(A, 'mix-brut.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())

with open(os.path.join(ICI, '..', 'scene', 'voix.js'), 'w') as f:
    f.write('// écrit par tools/mix.py : sous-titres [début, fin, texte], calés sur la voix off\nwindow.SOUS_TITRES = '
            + json.dumps(cartons, ensure_ascii=False, indent=0) + ';\n')


def tc(s):
    ms = int(round(s * 1000))
    return f'{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}'


with open(os.path.join(ICI, '..', '..', 'production', 'sous-titres.srt'), 'w') as f:
    for n, (a, b, p) in enumerate(cartons, 1):
        f.write(f'{n}\n{tc(a)} --> {tc(b)}\n{p}\n\n')
for a, b, p in cartons:
    print(f'{a:6.2f} → {b:6.2f}  {p}')
