"""Voix françaises de la pub (synthèse Piper, voix libres de Hugging Face rhasspy/piper-voices).
Usage : python3 tools/voix.py <dossier des modèles .onnx>
Écrit audio/voix/<id>.wav (48 kHz mono) et audio/voix/durees.json."""
import sys, os, json, wave, io, subprocess
from piper import PiperVoice, SynthesisConfig

MODELES = sys.argv[1] if len(sys.argv) > 1 else '.'
ICI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ICI, '..', 'audio', 'voix')
os.makedirs(OUT, exist_ok=True)

# id, qui, texte affiché (pour mémoire), texte prononcé (orthographe adaptée à la synthèse)
REPLIQUES = [
    ('f1', 'fille', "Non mais c'est une blague ?!", "Non mais c'est une blague ?!"),
    ('f2', 'fille', "Une heure de lissage… et trois gouttes ont tout ruiné !", "Une heure de lissage... et trois gouttes ont tout ruiné !"),
    ('m1', 'mirror', "Meuf… tu laisses vraiment la météo choisir ta coiffure ?", "Meuf... tu laisses vraiment la météo choisir ta coiffure ?"),
    ('f3', 'fille', "…Pardon ?!", "Pardon ?!"),
    ('m2', 'mirror', "Oui, c'est moi qui parle. On aurait dû se rencontrer avant.", "Oui, c'est moi qui parle. On aurait dû se rencontrer avant."),
    ('m3', 'mirror', "Sur cheveux essorés, avant ton brushing…", "Sur cheveux essorés, avant ton breuchingue..."),
    ('m4', 'mirror', "Je te protège du lisseur… et de la pluie.", "Je te protège du lisseur, et de la pluie."),
    ('f4', 'fille', "Attends… je panique plus quand il pleut ?!", "Attends... je panique plus quand il pleut ?!"),
    ('m6', 'mirror', "Ta coiffure, tes règles. Pas celles de la météo.", "Ta coiffure, tes règles. Pas celles de la météo."),
    ('m7', 'mirror', "Ton brushing mérite mieux que de finir en nuage.", "Ton breuchingue mérite mieux que de finir en nuage."),
]
# vitesse de diction (1 = normale, plus petit = plus rapide) : rythme TikTok, sans précipitation
VITESSE = float(os.environ.get('VITESSE', '.86'))

VOIX = {
    # la fille : voix jeune et vive ; Mirror : autre voix féminine, plus posée et un peu plus grave
    'fille': dict(modele='fr_FR-siwis-medium.onnx', speaker=None, pitch=1.03, noise=.75, noise_w=.9),
    'mirror': dict(modele='fr_FR-upmc-medium.onnx', speaker=0, pitch=.94, noise=.6, noise_w=.7),
}
charge = {}

def synth(qui, texte, vitesse):
    v = VOIX[qui]
    if v['modele'] not in charge:
        charge[v['modele']] = PiperVoice.load(os.path.join(MODELES, v['modele']))
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as w:
        charge[v['modele']].synthesize_wav(texte, w, syn_config=SynthesisConfig(speaker_id=v['speaker'], length_scale=vitesse, noise_scale=v['noise'], noise_w_scale=v['noise_w']))
    return buf.getvalue()

def traite(brut, qui, dest):
    """hauteur, silence coupé, égalisation légère, 48 kHz"""
    p = VOIX[qui]['pitch']
    src = dest + '.brut.wav'
    open(src, 'wb').write(brut)
    sr = wave.open(src).getframerate()
    filtres = (f"asetrate={int(sr * p)},aresample=48000,atempo={1 / p:.4f},"
               "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
               "highpass=f=90,equalizer=f=3500:t=q:w=1:g=3,acompressor=threshold=-20dB:ratio=3:attack=3:release=60,loudnorm=I=-16:TP=-2")
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-af', filtres, '-ac', '1', '-ar', '48000', dest], check=True)
    os.remove(src)
    with wave.open(dest) as w:
        return w.getnframes() / w.getframerate()

durees = {}
for rid, qui, _, texte in REPLIQUES:
    d = traite(synth(qui, texte, VITESSE), qui, os.path.join(OUT, rid + '.wav'))
    durees[rid] = round(d, 3)
    print(f'{rid:3} {qui:6} {d:5.2f} s')
print('total', round(sum(durees.values()), 2))
json.dump(durees, open(os.path.join(OUT, 'durees.json'), 'w'), indent=1)
