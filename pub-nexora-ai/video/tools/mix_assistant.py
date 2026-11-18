"""Version « Votre prochain employé n'est pas humain ». Place les voix dans le temps, baisse la musique sous la voix, écrit le mix, les sous-titres et la synchro de la scène.
Entrées : audio/musique.wav, audio/bruitages.wav, audio/voix/*.wav
Sorties : audio/mix-brut.wav, scene/voix.js (sous-titres et instants pour la scène), ../production/sous-titres.srt"""
import numpy as np, wave, os, json

ICI = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(ICI, '..', 'audio', 'assistant')
SR = 48000
DUREE = 30.0
N = int(DUREE * SR)

# début de chaque réplique (secondes) et texte des sous-titres ; « | » coupe un sous-titre en deux cartons
# id, début, texte du sous-titre ; le préfixe de l'id dit qui parle (a : assistante, p : prospect, n : signature)
REPLIQUES = [
    ('a1', 5.45, "Bonjour. Je suis votre assistante virtuelle. | Comment puis-je vous aider ?"),
    ('p1', 10.15, "Bonsoir. Vous auriez un rendez-vous cette semaine ?"),
    ('a2', 13.40, "Jeudi à 10 h, cela vous convient ?"),
    ('p2', 15.40, "Parfait."),
    ('a3', 16.00, "C'est réservé. Je vous envoie la confirmation."),
    ('n1', 24.00, "NEXORA AI. | L'intelligence travaille avec vous."),
    ('n2', 27.45, "Découvrez votre futur assistant IA."),
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
env = {}
for rid, t0, texte in REPLIQUES:
    v = lire(os.path.join(A, rid + '.wav'))
    i = int(t0 * SR)
    j = min(N, i + len(v))
    assert j - i == len(v), f'{rid} dépasse la fin de la vidéo'
    voix[i:j] += v
    t1 = t0 + len(v) / SR
    parts = [p.strip() for p in texte.split('|')]
    poids = np.cumsum([0] + [len(p) for p in parts]) / sum(len(p) for p in parts)
    for k, p in enumerate(parts):
        cartons.append([round(t0 + (t1 - t0) * poids[k], 3), round(t0 + (t1 - t0) * poids[k + 1], 3), p, rid[0]])
    hop = SR // 60
    env[rid] = {'a': round(t0, 3), 'qui': rid[0], 'env': [round(float(np.sqrt(np.mean(v[q:q + hop] ** 2))) / (np.sqrt(np.mean(v ** 2)) * 2.2), 3) for q in range(0, len(v), hop)]}

# musique baissée sous la voix (−8 dB), attaque et relâche douces
pres = np.abs(voix) > 0.01
k = int(.15 * SR)
pres = np.convolve(pres.astype(float), np.ones(k) / k, 'same') > 0.02
duck = np.where(pres, 10 ** (-8 / 20), 1.0)
lis = int(.12 * SR)
duck = np.convolve(duck, np.ones(lis) / lis, 'same')

mix = mus * duck * .8 + sfx * .6 + voix * 1.0
mix /= np.max(np.abs(mix)) / .8
st = (np.clip(np.stack([mix, mix], 1), -1, 1) * 32767).astype('<i2')
with wave.open(os.path.join(A, 'mix-brut.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())

with open(os.path.join(ICI, '..', 'assistant', 'voix.js'), 'w') as f:
    f.write('// écrit par tools/mix_assistant.py : sous-titres [début, fin, texte, qui] et enveloppe des voix (60/s)\nwindow.SOUS_TITRES = '
            + json.dumps(cartons, ensure_ascii=False, indent=0) + ';\nwindow.ENV = ' + json.dumps(env) + ';\n')


def tc(s):
    ms = int(round(s * 1000))
    return f'{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}'


with open(os.path.join(ICI, '..', '..', 'production', 'assistant-sous-titres.srt'), 'w') as f:
    for n, (a, b, p, _) in enumerate(cartons, 1):
        f.write(f'{n}\n{tc(a)} --> {tc(b)}\n{p}\n\n')
for a, b, p, _ in cartons:
    print(f'{a:6.2f} → {b:6.2f}  {p}')
