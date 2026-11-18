"""Musique originale et bruitages de la pub « Votre prochain employé n'est pas humain » (30 s, 120 BPM, mi mineur).
La nuit : nappe grave et silence du bureau, sonnerie de téléphone ; puis la pulsation monte avec l'assistante,
groove complet pendant le défilé des tâches, signature lumineuse à 23 s.
Tout est synthétisé avec numpy : aucun son existant n'est copié. Sorties : audio/assistant/musique.wav, bruitages.wav."""
import numpy as np, wave, os

SR = 48000
DUREE = 30.0
N = int(SR * DUREE)
BEAT = .5
rng = np.random.default_rng(317)
OUT = os.path.join(os.path.dirname(__file__), '..', 'audio', 'assistant')
os.makedirs(OUT, exist_ok=True)

# instants partagés avec assistant/assistant.js
SONNERIES = [.9, 2.3]           # le téléphone sonne
DECROCHE = 3.75                  # l'assistante décroche
BULLES = [10.15, 13.4, 13.65, 15.4, 16.0, 16.15, 16.55]
TACHES = [17.5 + k * .5 for k in range(10)]
LOGO = 23.0

def ax(d):
    return np.arange(int(d * SR)) / SR


def add(buf, sig, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf) or i + len(sig) <= 0:
        return
    if i < 0:
        sig, i = sig[-i:], 0
    j = min(len(buf), i + len(sig))
    buf[i:j] += sig[:j - i] * gain


def band(x, lo=None, hi=None):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    m = np.ones_like(f)
    if lo:
        m *= 1 / (1 + (lo / np.maximum(f, 1)) ** 4)
    if hi:
        m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))


def midi(n):
    return 440 * 2 ** ((n - 69) / 12)


def noise(d):
    return rng.standard_normal(int(d * SR))


def saw(f, t, ph=0.0):
    return 2 * ((f * t + ph) % 1) - 1


# ---------------- instruments ----------------
def pad(notes, d, gain=.05, hi=1800):
    t = ax(d)
    s = np.zeros_like(t)
    for n in notes:
        for det in (-.11, 0, .12):
            s += saw(midi(n + det), t, rng.random())
    env = np.minimum(1, t / .6) * np.minimum(1, (d - t) / .5)
    return band(s, 60, hi) * env * gain


def kick(g=1.0, soft=False):
    t = ax(.45)
    f = 42 + (70 if soft else 110) * np.exp(-t * 30)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    if not soft:
        s[:180] += np.linspace(.5, 0, 180) * rng.standard_normal(180) * .25
    return np.tanh(s * 1.5) * g


def clap():
    s = np.zeros(int(.3 * SR))
    for k, off in enumerate([0, .009, .018, .028]):
        add(s, band(noise(.25), 900, 5000) * np.exp(-ax(.25) * (40 if k < 3 else 13)), off, .7)
    return s * .45


def hat(open_=False):
    d = .22 if open_ else .045
    return band(noise(d), 7500, None) * np.exp(-ax(d) * (16 if open_ else 90)) * .3


def tictac():  # petite horloge nerveuse de la scène 1
    t = ax(.03)
    return band(noise(.03), 3000, 9000) * np.exp(-t * 300) * .5


def basse(n, d=.24, g=.35, hi=700):
    t = ax(d)
    f = midi(n)
    s = saw(f, t) * .6 + np.sin(2 * np.pi * f * t)
    env = np.minimum(1, t / .004) * np.exp(-t * 4) * np.minimum(1, (d - t) / .02)
    return band(s, 30, hi) * env * g


def pluck(n, d=.3, g=.07, hi=4000):
    t = ax(d)
    f = midi(n)
    s = saw(f, t) * .5 + saw(f * 1.004, t, .3) * .5
    return band(s * np.exp(-t * 11) * np.minimum(1, t / .002), 200, hi) * g


def cloche(f, d=1.8, g=.1):
    t = ax(d)
    s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * dec) for r, a, dec in [(1, 1, 2.2), (2.01, .35, 4), (3.0, .18, 7), (4.17, .08, 11)])
    return s * np.minimum(1, t / .002) * g


def montee(d, g=.2, lo=300, hi=9000):  # souffle filtré qui monte
    x = noise(d)
    out = np.zeros_like(x)
    win = 2048
    for i in range(0, len(x) - 64, win // 2):
        k = i / len(x)
        seg = x[i:i + win] * np.hanning(len(x[i:i + win]))
        fc = lo * (hi / lo) ** k
        out[i:i + len(seg)] += band(seg, fc * .5, fc * 1.5)
    return out * (ax(d) / d) ** 2 * g


def impact(g=1.0):
    t = ax(2.2)
    sub = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-t * 9)) / SR) * np.exp(-t * 2.2)
    air = band(noise(2.2), 2500, None) * np.exp(-t * 3.5) * .25
    return (np.tanh(sub * 1.3) + air) * g



# ---------------- musique ----------------
mus = np.zeros(N)
# mi mineur : Em9, Cmaj7, Am9, Bsus4
ACC = [[40, 47, 50, 54, 55], [36, 43, 47, 52, 55], [45, 48, 52, 55, 59], [47, 52, 54, 57, 59]]
RAC = [28, 24, 33, 35]
ARP = [[64, 67, 71, 74, 78, 74, 71, 67], [64, 67, 71, 72, 76, 72, 71, 67], [69, 72, 76, 79, 81, 79, 76, 72], [71, 74, 76, 78, 83, 78, 76, 74]]

# la nuit (0-5 s) : une note grave tenue, à peine filtrée, et le souffle du bureau vide
add(mus, pad([28, 35], 5.4, .05, 350), 0)
add(mus, band(noise(5.2), 80, 900) * .015, 0)
for b in range(2, 12):
    t0 = b * 2.0 + 1.0 if b == 2 else b * 2.0
    if t0 >= 23:
        break
    hi = 900 if t0 < 10 else (1600 if t0 < 17 else 2600)
    add(mus, pad(ACC[b % 4], 2.15 if t0 > 5 else 1.2, .045, hi), t0)
add(mus, pad([40, 47, 50, 54, 59, 62], 7.0, .055, 3000), LOGO)

for i in range(int(30 / (BEAT / 4))):
    t = i * BEAT / 4
    b = int(t // 2.0) % 4
    step = i % 8
    if 5.0 <= t < 22.5:
        g = .03 if t < 10 else (.05 if t < 17 else .07)
        add(mus, pluck(ARP[b][step], g=g, hi=1200 + 3000 * min(1, (t - 5) / 14)), t)
    elif 24.0 <= t < 29.0 and step % 2 == 0:
        add(mus, pluck(ARP[0][step] + 12, d=.5, g=.028, hi=3500), t)
    if 17.0 <= t < 22.5 and step % 2 == 1:
        add(mus, basse(RAC[b] + 12 + (12 if step == 7 else 0)), t)

for i in range(int(30 / BEAT)):
    t = i * BEAT
    pos = i % 4
    if 10.0 <= t < 17.0:
        if pos == 0:
            add(mus, kick(soft=True), t, .6)
        if pos == 2:
            add(mus, clap(), t, .35)
        add(mus, hat(), t + BEAT / 2, .45)
    if 17.0 <= t < 22.5:
        add(mus, kick(), t, .95)
        if pos in (1, 3):
            add(mus, clap(), t, .8)
        add(mus, hat(), t + BEAT / 2, .8)
        add(mus, hat(), t + BEAT / 4, .3)
        add(mus, hat(), t + 3 * BEAT / 4, .3)

add(mus, montee(1.0, .12), 4.0)
add(mus, montee(.9, .2), 22.1)
for at, g in [(5.0, .5), (10.0, .35), (17.0, .7), (LOGO, 1.0)]:
    add(mus, impact(), at, g)
add(mus, cloche(midi(83), 3.0, .09), LOGO)
add(mus, cloche(midi(90), 3.0, .05), LOGO + .02)
add(mus, kick(1.1), LOGO, .9)
fade = np.ones(N)
fi = int(28.6 * SR)
fade[fi:] = np.linspace(1, 0, N - fi) ** 1.5
mus *= fade

# ---------------- bruitages ----------------
sfx = np.zeros(N)


def souffle(a, d, g=1.0, lo=500, hi=4000):
    t = ax(d)
    add(sfx, band(noise(d), lo, hi) * np.sin(np.pi * t / d) ** 2, a, .35 * g)


def blip(at, f0=1800, f1=900, g=1.0):
    t = ax(.12)
    f = f1 + (f0 - f1) * np.exp(-t * 40)
    add(sfx, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30), at, .12 * g)


def clic(at, g=1.0):
    t = ax(.025)
    add(sfx, np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 260) + band(noise(.025), 4000, None) * np.exp(-t * 400) * .3, at, .16 * g)


def coche(at, g=1.0):
    add(sfx, cloche(midi(83), .5, .06), at, g)
    add(sfx, cloche(midi(87), .6, .07), at + .07, g)


def sonnerie(at):
    """sonnerie de téléphone originale : arpège doux de quatre notes, deux fois, et la vibration sur le bureau"""
    for k, n in enumerate([76, 83, 79, 86, 76, 83, 79, 86]):
        add(sfx, cloche(midi(n), .5, .07), at + k * .11)
    t = ax(1.0)
    vib = np.sin(2 * np.pi * 150 * t) * (np.sin(2 * np.pi * 22 * t) > 0) * np.minimum(1, (1.0 - t) / .05)
    add(sfx, band(vib, 60, 600), at, .1)


for at in SONNERIES:
    sonnerie(at)
clic(DECROCHE, 1.2)
add(sfx, cloche(midi(88), 1.2, .08), DECROCHE + .05)
add(sfx, cloche(midi(95), 1.2, .05), DECROCHE + .12)
souffle(4.35, .7, 1.2, 300, 5000)
for at in BULLES:
    blip(at, 1600, 1100, .7)
    clic(at, .6)
coche(16.15)
coche(16.55, .8)
souffle(16.8, .3, .8, 1000, 6000)
for k, at in enumerate(TACHES):
    clic(at, .8)
    blip(at + .02, 2000 + 60 * k, 1300, .6)
    if k % 2 == 1:
        coche(at + .2, .5)
x = montee(.7, .3, 200, 6000)
add(sfx, x, 22.3)
for k in range(12):
    add(sfx, cloche(midi(95 + [0, 4, 7, 11][k % 4] + 12 * (k // 8)), .7, .025), LOGO + .35 + k * .07)
souffle(LOGO + 1.25, 1.1, .5, 3000, 12000)
clic(27.4, 1.0)
add(sfx, cloche(midi(88), .9, .05), 27.42)


def write(path, x):
    x = np.clip(x, -1, 1)
    st = np.stack([x, x], 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype('<i2').tobytes())


write(os.path.join(OUT, 'musique.wav'), mus / (np.max(np.abs(mus)) + 1e-9) * .5)
write(os.path.join(OUT, 'bruitages.wav'), sfx / (np.max(np.abs(sfx)) + 1e-9) * .5)
print('audio écrit dans', os.path.abspath(OUT))
