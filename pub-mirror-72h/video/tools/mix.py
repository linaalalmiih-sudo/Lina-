"""Place les voix dans le temps, baisse la musique sous les voix, écrit le mix et le fichier de synchro des bouches.
Entrées : audio/musique.wav, audio/bruitages.wav, audio/voix/*.wav
Sorties : audio/mix-brut.wav, scene/voix.js (débuts, fins et enveloppe de chaque réplique pour animer les bouches)."""
import numpy as np, wave, os, json

ICI = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(ICI, '..', 'audio')
SR = 48000
N = int(25 * SR)

# instant de début de chaque réplique (secondes) : la seule source de vérité du montage parlé
DEBUTS = {'f1': .10, 'f2': 1.20, 'm1': 5.40, 'f3': 7.72, 'm2': 8.35, 'm3': 11.72, 'm4': 13.95,
          'f4': 17.70, 'm6': 19.27, 'm7': 21.56}


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
synchro = {}
for rid, t0 in DEBUTS.items():
    v = lire(os.path.join(A, 'voix', rid + '.wav'))
    i = int(t0 * SR)
    j = min(N, i + len(v))
    voix[i:j] += v[:j - i]
    # enveloppe à 60 valeurs par seconde, pour les bouches
    hop = SR // 60
    env = [float(np.sqrt(np.mean(v[k:k + hop] ** 2))) for k in range(0, len(v), hop)]
    m = max(env) or 1
    synchro[rid] = {'a': round(t0, 3), 'b': round(t0 + len(v) / SR, 3), 'env': [round(min(1, (e / m) ** .7 * 1.15), 3) for e in env]}

# musique baissée sous les voix (−9 dB), avec attaque et relâche douces
pres = np.abs(voix) > 0.01
k = int(.12 * SR)
pres = np.convolve(pres.astype(float), np.ones(k) / k, 'same') > 0.02
duck = np.where(pres, 10 ** (-9 / 20), 1.0)
lis = int(.08 * SR)
duck = np.convolve(duck, np.ones(lis) / lis, 'same')

mix = mus * duck * .75 + sfx * .6 + voix * 1.0
mix /= np.max(np.abs(mix)) / .8
st = (np.clip(np.stack([mix, mix], 1), -1, 1) * 32767).astype('<i2')
with wave.open(os.path.join(A, 'mix-brut.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
with open(os.path.join(ICI, '..', 'scene', 'voix.js'), 'w') as f:
    f.write('// écrit par tools/mix.py : début, fin et enveloppe (60/s) de chaque réplique\nwindow.VOIX = ' + json.dumps(synchro) + ';\n')
for rid, s in synchro.items():
    print(f"{rid}  {s['a']:6.2f} → {s['b']:6.2f}")
