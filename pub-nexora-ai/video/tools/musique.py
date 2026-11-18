"""Musique originale et bruitages de la pub NEXORA AI (30 s, 120 BPM, do mineur).
Électronique, élégante : nappe analogique, arpège, basse pulsée, batterie feutrée qui monte scène après scène.
Tout est synthétisé ici avec numpy : aucun son existant n'est copié.
Sorties : audio/musique.wav, audio/bruitages.wav (tools/mix.py ajoute la voix)."""
import numpy as np, wave, os

SR = 48000
DUREE = 30.0
N = int(SR * DUREE)
BEAT = .5  # 120 BPM ; une mesure = 2 s ; les coupes 5, 10, 17, 24 s tombent sur des temps
rng = np.random.default_rng(2026)
OUT = os.path.join(os.path.dirname(__file__), '..', 'audio')
os.makedirs(OUT, exist_ok=True)

# instants partagés avec scene/scene.js
NOTIFS = [.15, .45, .72, .98, 1.22, 1.45, 1.66, 1.86, 2.05, 2.23, 2.40, 2.56, 2.71, 2.85, 2.98, 3.10, 3.21, 3.31, 3.40, 3.49, 3.57, 3.65]
MOTS = [5.55, 6.75, 7.95]                       # AUTOMATISEZ. OPTIMISEZ. ÉVOLUEZ.
LIENS = [5.75 + k * .2 for k in range(6)] + [6.95 + k * .16 for k in range(6)]
PANNEAUX = [11.70, 13.40, 15.10, 16.30]          # la caméra passe d'un écran à l'autre
UI = [10.25, 10.95, 11.35, 12.30, 12.70, 13.70, 13.95, 14.20, 14.45, 15.60, 15.85, 16.05]
NOEUDS = [17.45, 17.55, 17.65, 17.75, 17.95, 18.05, 18.15, 18.25, 18.45, 18.55, 18.65, 18.75]
COCHES = [19.9, 20.4, 21.3, 21.9, 22.5, 23.0]
SLOT = 20.75                                     # « Votre outil » s'emboîte


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
# do mineur : Cm9, Abmaj7, Ebmaj7/Bb, Bb6sus — une mesure (2 s) par accord
ACC = [[48, 51, 55, 58, 62], [44, 48, 51, 55, 60], [46, 51, 55, 58, 62], [46, 50, 53, 55, 60]]
RAC = [36, 32, 34, 34]
ARP = [[60, 63, 67, 70, 74, 70, 67, 63], [60, 63, 67, 72, 75, 72, 67, 63], [58, 62, 63, 67, 70, 67, 63, 62], [58, 62, 65, 67, 72, 67, 65, 62]]

for b in range(15):
    t0 = b * 2.0
    a = b % 4
    if t0 < 24:
        hi = 700 if t0 < 5 else (1400 if t0 < 10 else 2600)
        add(mus, pad(ACC[a], 2.15, .045 if t0 < 5 else .05, hi), t0)
# signature : accord final tenu, plus ouvert
add(mus, pad([48, 55, 58, 62, 67, 70], 6.0, .055, 3200), 24.0)

for i in range(int(30 / (BEAT / 4))):  # double-croches
    t = i * BEAT / 4
    b = int(t // 2.0) % 4
    step = i % 8
    # arpège : discret dès 5 s, plein de 10 à 23,5 s, doux pendant la signature
    if 5.0 <= t < 23.5:
        g = .045 if t < 10 else .07
        hi = 1500 + 2500 * min(1, (t - 5) / 12)
        add(mus, pluck(ARP[b][step], g=g, hi=hi), t)
    elif t >= 25.0 and t < 29.0 and step % 2 == 0:
        add(mus, pluck(ARP[0][step] + 12, d=.5, g=.03, hi=3500), t)
    # basse pulsée en croches décalées dès 10 s
    if 10.0 <= t < 23.5 and step % 2 == 1:
        add(mus, basse(RAC[b] + (12 if step == 7 else 0)), t)
    # tic-tac nerveux de la scène 1
    if t < 4.6:
        add(mus, tictac(), t, .5 + .5 * t / 4.6)

for i in range(int(30 / BEAT)):
    t = i * BEAT
    pos = i % 4
    if 5.0 <= t < 10.0 and pos in (0, 2):
        add(mus, kick(soft=True), t, .7)
    if 10.0 <= t < 23.5:
        add(mus, kick(), t, .85 if t < 17 else 1.0)
        if pos in (1, 3):
            add(mus, clap(), t, .8)
        add(mus, hat(), t + BEAT / 2, .8)
        if t >= 17.0:
            add(mus, hat(), t + BEAT / 4, .35)
            add(mus, hat(), t + 3 * BEAT / 4, .35)
        if pos == 3 and i % 8 == 7:
            add(mus, hat(True), t + BEAT / 2, .6)
    if t < 5.0 and pos == 0 and t >= 2.0:
        add(mus, kick(soft=True), t, .45)

# mélodie en cloches, scène 4 (sur mesure)
MEL = [(17.0, 79), (17.75, 75), (18.0, 74), (19.0, 72), (19.5, 74), (21.0, 75), (21.75, 74), (22.0, 70), (23.0, 72)]
for at, n in MEL:
    add(mus, cloche(midi(n), 1.6, .05), at)
# montées et impacts aux coupes
add(mus, montee(1.0, .16), 4.0)
add(mus, montee(.9, .12), 9.1)
add(mus, montee(.8, .12), 16.2)
add(mus, montee(.9, .2), 23.1)
for at, g in [(5.0, .8), (10.0, .55), (17.0, .7), (24.0, 1.0)]:
    add(mus, impact(), at, g)
add(mus, cloche(midi(84), 3.0, .09), 24.0)
add(mus, cloche(midi(91), 3.0, .05), 24.02)
add(mus, kick(1.1), 24.0, .9)
add(mus, kick(soft=True), 28.0, .5)
# fin : la queue s'éteint à 30 s
fade = np.ones(N)
fi = int(28.8 * SR)
fade[fi:] = np.linspace(1, 0, N - fi) ** 1.5
mus *= fade

# ---------------- bruitages ----------------
sfx = np.zeros(N)


def ping(at, k, g=1.0):  # notification : deux notes de verre, hauteurs variées
    f = midi([88, 91, 86, 93, 89][k % 5])
    add(sfx, cloche(f, .5, .09), at, g)
    add(sfx, cloche(f * 1.5, .35, .04), at, g)
    add(sfx, cloche(f * 1.5, .5, .06), at + .07, g)


def souffle(a, d, g=1.0, lo=500, hi=4000):  # passage rapide (caméra, carte qui entre)
    t = ax(d)
    x = band(noise(d), lo, hi) * np.sin(np.pi * t / d) ** 2
    add(sfx, x, a, .35 * g)


def blip(at, f0=1800, f1=900, g=1.0):
    t = ax(.12)
    f = f1 + (f0 - f1) * np.exp(-t * 40)
    add(sfx, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30), at, .12 * g)


def clic(at, g=1.0):
    t = ax(.025)
    add(sfx, np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 260) + band(noise(.025), 4000, None) * np.exp(-t * 400) * .3, at, .16 * g)


def coche(at, g=1.0):  # validation : petite tierce montante
    add(sfx, cloche(midi(84), .5, .06), at, g)
    add(sfx, cloche(midi(88), .6, .07), at + .07, g)


def aspiration(a, d, g=1.0):  # souffle inversé qui aspire vers le centre
    x = montee(d, .3, 200, 6000)
    add(sfx, x, a, g)


for k, at in enumerate(NOTIFS):
    ping(at, k, .65 + .35 * k / len(NOTIFS))
aspiration(4.05, .95, 1.1)
for at in MOTS:
    add(sfx, cloche(midi(96), 1.2, .05), at)
    souffle(at - .08, .35, .8, 2000, 9000)
for at in LIENS:
    blip(at, 2400, 1200, .8)
souffle(9.45, .55, 1.0, 300, 3000)  # plongée dans le noyau
for at in PANNEAUX:
    souffle(at - .1, .4, .9)
for at in UI:
    clic(at)
    blip(at + .02, 1500, 1100, .6)
for at in [10.6, 10.7, 10.8]:  # l'IA écrit
    clic(at, .5)
coche(12.7)
coche(15.6)
souffle(16.85, .3, .8, 1000, 6000)
for at in NOEUDS:
    clic(at, .7)
    blip(at, 2000, 1400, .5)
for at in COCHES:
    coche(at, .7)
souffle(SLOT - .35, .4, 1.0)
add(sfx, kick(.5, soft=True), SLOT, .5)
clic(SLOT, 1.2)
coche(SLOT + .12, 1.0)
aspiration(23.25, .7, 1.0)
# signature : scintillement argenté puis bouton
for k in range(12):
    add(sfx, cloche(midi(96 + [0, 3, 7, 10][k % 4] + 12 * (k // 8)), .7, .025), 24.35 + k * .07)
souffle(25.25, 1.1, .5, 3000, 12000)  # reflet qui passe sur le logo
clic(27.6, 1.0)
add(sfx, cloche(midi(87), .9, .05), 27.62)


def write(path, x):
    x = np.clip(x, -1, 1)
    st = np.stack([x, x], 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype('<i2').tobytes())


write(os.path.join(OUT, 'musique.wav'), mus / (np.max(np.abs(mus)) + 1e-9) * .5)
write(os.path.join(OUT, 'bruitages.wav'), sfx / (np.max(np.abs(sfx)) + 1e-9) * .5)
print('audio écrit dans', os.path.abspath(OUT))
