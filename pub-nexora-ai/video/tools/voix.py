"""Voix off française de la pub NEXORA AI (synthèse Piper, voix libre fr_FR-siwis-medium, Hugging Face rhasspy/piper-voices).
Usage : python3 tools/voix.py <dossier des modèles .onnx>
Écrit audio/voix/<id>.wav (48 kHz mono) et audio/voix/durees.json.
Pour une voix enregistrée ou ElevenLabs : remplacer audio/voix/<id>.wav (même nom) et relancer tools/mix.py."""
import sys, os, json, wave, io, subprocess
from piper import PiperVoice, SynthesisConfig

MODELES = sys.argv[1] if len(sys.argv) > 1 else '.'
ICI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ICI, '..', 'audio', 'voix')
os.makedirs(OUT, exist_ok=True)

# id, texte affiché (sous-titre), texte prononcé (orthographe adaptée à la synthèse)
REPLIQUES = [
    ('v1', "Et si votre entreprise fonctionnait… plus intelligemment ?", "Et si votre entreprise fonctionnait... plus intelligemment ?"),
    ('v2', "L'intelligence artificielle transforme votre façon de travailler.", "L'intelligence artificielle transforme votre façon de travailler."),
    ('v3', "Demandes clients, rendez-vous, relances : tout s'automatise.", "Demandes clients, rendez-vous, relances : tout s'automatise."),
    ('v4', "Concentrez-vous sur ce qui compte vraiment.", "Concentrez-vous sur ce qui compte vraiment."),
    ('v5', "Avec NEXORA AI, nous concevons des automatisations adaptées à votre entreprise.", "Avec Nexora A I, nous concevons des automatisations adaptées à votre entreprise."),
    ('v6', "NEXORA AI.", "Nexora A I."),
    ('v7', "Passez à la nouvelle génération d'automatisation.", "Passez à la nouvelle génération d'automatisation."),
    ('v8', "Réservez votre diagnostic gratuit.", "Réservez votre diagnostic gratuit."),
]
VITESSE = float(os.environ.get('VITESSE', '1.0'))  # 1 = normale, plus grand = plus lent
MODELE, PITCH = 'fr_FR-siwis-medium.onnx', .96     # voix un peu plus grave : posée, confiante

voix = PiperVoice.load(os.path.join(MODELES, MODELE))

# vitesse propre à certaines répliques (la signature doit tenir entre 24 et 30 s)
VITESSE_REPLIQUE = {'v6': .95, 'v7': .95, 'v8': .95}

def synth(texte, vitesse):
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as w:
        voix.synthesize_wav(texte, w, syn_config=SynthesisConfig(length_scale=vitesse, noise_scale=.6, noise_w_scale=.7))
    return buf.getvalue()

def traite(brut, dest):
    """hauteur, silences coupés, égalisation « voix off pub » (présence, chaleur), 48 kHz"""
    src = dest + '.brut.wav'
    open(src, 'wb').write(brut)
    sr = wave.open(src).getframerate()
    filtres = (f"asetrate={int(sr * PITCH)},aresample=48000,atempo={1 / PITCH:.4f},"
               "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,"
               "highpass=f=80,equalizer=f=180:t=q:w=1:g=2,equalizer=f=3200:t=q:w=1.2:g=3,equalizer=f=9000:t=q:w=1:g=1.5,"
               "acompressor=threshold=-22dB:ratio=3.5:attack=3:release=70,aecho=0.8:0.5:22:0.07,loudnorm=I=-16:TP=-2")
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', src, '-af', filtres, '-ac', '1', '-ar', '48000', dest], check=True)
    os.remove(src)
    with wave.open(dest) as w:
        return w.getnframes() / w.getframerate()

durees = {}
for rid, _, texte in REPLIQUES:
    d = traite(synth(texte, VITESSE_REPLIQUE.get(rid, VITESSE)), os.path.join(OUT, rid + '.wav'))
    durees[rid] = round(d, 3)
    print(f'{rid}  {d:5.2f} s  {texte}')
print('total', round(sum(durees.values()), 2))
json.dump(durees, open(os.path.join(OUT, 'durees.json'), 'w'), indent=1)
