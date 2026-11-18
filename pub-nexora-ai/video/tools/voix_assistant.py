"""Voix de la pub « Votre prochain employé n'est pas humain » (synthèse Piper, voix libres rhasspy/piper-voices).
Usage : python3 tools/voix_assistant.py <dossier des modèles .onnx>
Écrit audio/assistant/<id>.wav (48 kHz mono) : l'assistante (siwis), le prospect au téléphone (tom), la signature (siwis)."""
import sys, os, wave, io, subprocess
from piper import PiperVoice, SynthesisConfig

MODELES = sys.argv[1] if len(sys.argv) > 1 else '.'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'audio', 'assistant')
os.makedirs(OUT, exist_ok=True)

# id, voix, texte prononcé, vitesse (plus grand = plus lent)
REPLIQUES = [
    ('a1', 'assistante', "Bonjour. Je suis votre assistante virtuelle. Comment puis-je vous aider ?", 1.0),
    ('p1', 'prospect', "Bonsoir. Vous auriez un rendez-vous cette semaine ?", .95),
    ('a2', 'assistante', "Jeudi à dix heures, cela vous convient ?", .95),
    ('p2', 'prospect', "Parfait.", 1.0),
    ('a3', 'assistante', "C'est réservé. Je vous envoie la confirmation.", .95),
    ('n1', 'signature', "Nexora A I. L'intelligence travaille avec vous.", 1.05),
    ('n2', 'signature', "Découvrez votre futur assistant I A.", 1.0),
]
EQ_VOIX = "highpass=f=80,equalizer=f=180:t=q:w=1:g=2,equalizer=f=3200:t=q:w=1.2:g=3,acompressor=threshold=-22dB:ratio=3.5:attack=3:release=70"
VOIX = {
    # l'assistante : claire, légèrement « interface » (un peu d'air et un écho très court)
    'assistante': ('fr_FR-siwis-medium.onnx', .98, EQ_VOIX + ",equalizer=f=8000:t=q:w=1:g=2,aecho=0.8:0.4:14:0.12"),
    # le prospect : voix d'homme, au téléphone (bande passante réduite)
    'prospect': ('fr_FR-tom-medium.onnx', 1.0, "highpass=f=320,lowpass=f=3400,equalizer=f=1500:t=q:w=1:g=4,acompressor=threshold=-20dB:ratio=4:attack=2:release=50"),
    # la signature : même voix, posée, plus chaude
    'signature': ('fr_FR-siwis-medium.onnx', .95, EQ_VOIX + ",aecho=0.8:0.5:22:0.07"),
}
charge = {}
for rid, qui, texte, vit in REPLIQUES:
    modele, pitch, eq = VOIX[qui]
    if modele not in charge:
        charge[modele] = PiperVoice.load(os.path.join(MODELES, modele))
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as w:
        charge[modele].synthesize_wav(texte, w, syn_config=SynthesisConfig(length_scale=vit, noise_scale=.6, noise_w_scale=.7))
    dest = os.path.join(OUT, rid + '.wav'); src = dest + '.brut.wav'
    open(src, 'wb').write(buf.getvalue())
    sr = wave.open(src).getframerate()
    f = (f"asetrate={int(sr * pitch)},aresample=48000,atempo={1 / pitch:.4f},"
         "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
         + eq + ",loudnorm=I=-16:TP=-2")
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-af', f, '-ac', '1', '-ar', '48000', dest], check=True)
    os.remove(src)
    with wave.open(dest) as w:
        print(f'{rid}  {w.getnframes() / w.getframerate():5.2f} s  {texte}')
