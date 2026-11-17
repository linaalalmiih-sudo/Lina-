"""Musique originale et bruitages de la pub Mirror 72H (25 s, 120 BPM, ré majeur).
Tout est synthétisé ici avec numpy : aucun son existant n'est copié.
Sorties : audio/musique.wav, audio/bruitages.wav, audio/mix.wav (avant normalisation)."""
import numpy as np, wave, os, sys

SR = 48000
DUREE = 25.0
N = int(SR * DUREE)
BPM = 120
BEAT = 60 / BPM
rng = np.random.default_rng(72)
OUT = os.path.join(os.path.dirname(__file__), '..', 'audio')
os.makedirs(OUT, exist_ok=True)


def t_axis(d):
    return np.arange(int(d * SR)) / SR


def add(buf, sig, at, gain=1.0):
    i = int(at * SR)
    if i >= len(buf):
        return
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


# ---------------- instruments ----------------
def kick(gain=1.0):
    t = t_axis(.42)
    f = 45 + 95 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t * 7.5)
    s[:200] += np.linspace(.6, 0, 200) * rng.standard_normal(200) * .3
    return np.tanh(s * 1.6) * gain


def snap():
    s = np.zeros(int(.25 * SR))
    for k, off in enumerate([0, .011, .022]):
        b = band(noise(.2), 1100, 4200) * np.exp(-t_axis(.2) * (30 if k < 2 else 14))
        add(s, b, off, .8)
    return s * .5


def hat(open_=False):
    d = .2 if open_ else .05
    b = band(noise(d), 7000, None) * np.exp(-t_axis(d) * (18 if open_ else 80))
    return b * .35


def ep(notes, d=1.7, gain=.12, bright=1.0):
    t = t_axis(d)
    s = np.zeros_like(t)
    for n in notes:
        f = midi(n)
        env = np.minimum(1, t / .008) * np.exp(-t * 1.9)
        trem = 1 + .12 * np.sin(2 * np.pi * 4.5 * t)
        tone = np.sin(2 * np.pi * f * t) + .35 * bright * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3) + .12 * bright * np.sin(2 * np.pi * 3 * f * t + .3) * np.exp(-t * 6)
        s += tone * env * trem
    return s * gain


def bass(n, d=.45, gain=.42):
    t = t_axis(d)
    f = midi(n)
    env = np.minimum(1, t / .006) * np.exp(-t * 2.2) * np.minimum(1, (d - t) / .03)
    return (np.sin(2 * np.pi * f * t) + .25 * np.sin(4 * np.pi * f * t)) * env * gain


def pluck(n, d=.35, gain=.13):
    t = t_axis(d)
    f = midi(n)
    tri = 2 / np.pi * np.arcsin(np.sin(2 * np.pi * f * t))
    return (tri * .7 + np.sin(4 * np.pi * f * t) * .3) * np.exp(-t * 9) * np.minimum(1, t / .003) * gain


def bell(f, d=1.6, gain=.18):
    t = t_axis(d)
    s = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * dec) for r, a, dec in [(1, 1, 3), (2.76, .45, 6), (5.4, .25, 10), (8.9, .1, 16)])
    return s * np.minimum(1, t / .002) * gain


# ---------------- musique ----------------
mus = np.zeros(N)
# accords (une mesure = 2 s) : Gmaj7, F#m7, Em7, A7 ... en ré majeur
CHORDS = [[55, 59, 62, 66], [54, 57, 61, 64], [52, 55, 59, 62], [57, 61, 64, 67]]
ROOTS = [43, 42, 40, 45]
bar = 2 * BEAT * 2  # 2 s

for b in range(13):
    t0 = b * bar
    if t0 >= 24.0:
        break
    ch, root = CHORDS[b % 4], ROOTS[b % 4]
    bright = .5 if t0 < 5 else 1.0
    add(mus, ep(ch, bright=bright, gain=.10 if t0 < 5 else .12), t0)
    add(mus, ep([n + 12 for n in ch[1:3]], d=.9, gain=.05 * bright), t0 + 1.5 * BEAT)
    if t0 >= 1.0:
        for k, (off, n) in enumerate([(0, root), (1.5, root), (2.5, root + 12), (3.0, root + 7)]):
            add(mus, bass(n, d=.4 if k else .7, gain=.30 if t0 < 5 else .42), t0 + off * BEAT)

# batterie
for i in range(int(24.0 / BEAT)):
    tb = i * BEAT
    pos = i % 4
    full = 5.0 <= tb < 24.0
    if tb < 5.0:  # intro : grosse caisse feutrée sur 1 et 3, claquements
        if pos in (0, 2):
            add(mus, band(kick(), None, 900), tb, .55)
        if pos in (1, 3):
            add(mus, snap(), tb, .5)
    elif full:
        if pos in (0, 2) or (pos == 3 and i % 8 == 7):
            add(mus, kick(), tb + (BEAT / 2 if pos == 3 else 0), .95)
        if pos in (1, 3):
            add(mus, snap(), tb, .9)
    for h in range(2):
        th = tb + h * BEAT / 2 + (.035 if h else 0)
        if th < 24.0 and (full or tb >= 1.0):
            add(mus, hat(open_=(h == 1 and pos == 3)), th, (.9 if h == 0 else .6) * (1 if full else .6))

# mélodie (10 s → 21 s)
MOTIF = [(0, 74), (.5, 76), (1, 78), (1.75, 81), (2.5, 78), (3, 76), (4, 74), (4.5, 73), (5, 71), (6, 69), (6.5, 71), (7, 74)]
for rep in range(3):
    base = 10.0 + rep * 4.0
    for off, n in MOTIF:
        tt = base + off * BEAT
        if tt < 21.0 and not (16.0 <= tt < 18.0 and off > 5):
            add(mus, pluck(n), tt)

# montée 20 → 21 : roulement
for k in range(16):
    add(mus, snap(), 20.0 + k * BEAT / 8, .25 + .5 * k / 16)
# impact 21 s et accord final 24 s
add(mus, band(noise(1.6), 3000, None) * np.exp(-t_axis(1.6) * 2.5), 21.0, .18)
add(mus, kick(1.2), 21.0, 1.0)
add(mus, ep([50, 57, 62, 66, 69], d=1.0, gain=.12), 24.0)
add(mus, bass(38, d=1.0, gain=.45), 24.0)
add(mus, kick(1.1), 24.0, .9)
add(mus, band(noise(1.0), 3000, None) * np.exp(-t_axis(1.0) * 3), 24.0, .12)
# coupure nette à 25 s avec une petite queue
fade = np.ones(N)
fi = int(24.6 * SR)
fade[fi:] = np.linspace(1, 0, N - fi)
mus *= fade

# ---------------- bruitages ----------------
sfx = np.zeros(N)


def pouf(at, g=1.0):
    t = t_axis(.5)
    s = band(noise(.5), 80, 900) * np.minimum(1, t / .01) * np.exp(-t * 9)
    s += np.sin(2 * np.pi * (90 + 60 * np.exp(-t * 20)) * t) * np.exp(-t * 12) * .8
    add(sfx, s, at, .55 * g)


def whoosh(a, b, g=1.0):
    d = b - a
    t = t_axis(d)
    x = noise(d)
    out = np.zeros_like(x)
    win = 2048
    for i in range(0, len(x), win // 2):
        seg = x[i:i + win]
        if len(seg) < 64:
            break
        k = (i / len(x))
        fc = 400 + 3500 * np.sin(np.pi * k)
        w = np.hanning(len(seg))
        out[i:i + len(seg)] += band(seg * w, fc * .6, fc * 1.6)
    env = np.sin(np.pi * t / d) ** 2
    add(sfx, out * env, a, .5 * g)


def bloop(at, f0=650, f1=180, g=1.0):
    t = t_axis(.18)
    f = f1 + (f0 - f1) * np.exp(-t * 25)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 18)
    add(sfx, s, at, .3 * g)


def tick(at, g=1.0):
    t = t_axis(.03)
    add(sfx, np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 220), at, .14 * g)


def pop(at, g=1.0):
    t = t_axis(.09)
    s = np.sin(2 * np.pi * (300 + 900 * np.exp(-t * 60)) * t) * np.exp(-t * 45)
    add(sfx, s, at, .22 * g)


def shimmer(at, d=1.0, g=1.0):
    for k in range(10):
        add(sfx, bell(midi(86 + [0, 2, 4, 7, 9][k % 5] + 12 * (k // 5)), d=.6, gain=.05), at + k * d / 14, g)


# 0 s : la pluie dehors s'efface, porte claquée
add(sfx, band(noise(1.2), 800, 6000) * np.linspace(1, 0, int(1.2 * SR)), 0, .05)
pouf(3.0)
whoosh(4.80, 5.20)
add(sfx, bell(midi(91)), 5.0)
add(sfx, bell(midi(98), d=1.0, gain=.08), 5.08)
shimmer(5.05, .8, .7)
bloop(7.03, 300, 900, 1.2)  # « ?! »
add(sfx, bell(midi(96), d=.6, gain=.10), 9.3)  # clin d'œil
whoosh(9.80, 10.20, 1.1)
bloop(10.45, 500, 220)  # pression du tube
bloop(10.80, 260, 120, 1.3)  # la goutte tombe
shimmer(10.9, 1.0, .8)
for a, b in [(12.05, 12.95), (13.0, 13.9)]:  # lisseur
    d = b - a
    s = band(noise(d), 2500, 9000) * (.5 + .5 * rng.random(int(d * SR)) ** 8) * np.sin(np.pi * t_axis(d) / d)
    add(sfx, s, a, .09)
    pop(a, .6)
for k in range(14):
    tick(12.1 + 1.4 * (k / 14) ** .7)
shimmer(14.0, 1.4, 1.0)
rainlen = 2.0
add(sfx, band(noise(rainlen), 600, 7000) * np.minimum(1, np.minimum(t_axis(rainlen) / .2, (rainlen - t_axis(rainlen)) / .2)), 16.0, .12)
for k in range(18):
    tick(16.15 + 1.35 * (k / 18) ** .7)
add(sfx, bell(midi(93), d=.8, gain=.1), 17.5)
shimmer(18.0, 1.2, .7)
whoosh(20.85, 21.15, 1.2)
shimmer(21.0, 1.0, 1.0)
pouf(22.75, .8)
add(sfx, bell(midi(96), d=.6, gain=.10), 22.85)
for at in [0.0, 1.0, 10.5, 12.0, 14.0, 14.5, 16.05, 21.05, 21.25, 23.05, 23.45]:
    pop(at)
add(sfx, bell(midi(86)), 23.05)

def write(path, x):
    x = np.clip(x, -1, 1)
    st = np.stack([x, x], 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype('<i2').tobytes())

mus_n = mus / (np.max(np.abs(mus)) + 1e-9) * .5
sfx_n = sfx / (np.max(np.abs(sfx)) + 1e-9) * .5
mix = mus_n * .8 + sfx_n * .75
mix /= np.max(np.abs(mix)) / .7
write(os.path.join(OUT, 'musique.wav'), mus_n)
write(os.path.join(OUT, 'bruitages.wav'), sfx_n)
write(os.path.join(OUT, 'mix-brut.wav'), mix)
print('audio écrit dans', os.path.abspath(OUT))
