"""Voix off de « Trois clics » (Piper, voix française upmc / Jessica). Usage : python3 parcours/voix.py <dossier des modèles>"""
import sys, os, io, wave, subprocess, json
from piper import PiperVoice, SynthesisConfig
M = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'audio', 'parcours'); os.makedirs(OUT, exist_ok=True)
LIGNES = [
  ('v1', 'Samedi, dix-neuf heures.'),
  ('v2', 'Tu as une soirée… et il pleut.'),
  ('v3', 'Tu tapes : cheveux qui gonflent.'),
  ('v4', "Gloss bai Ké s'ouvre. Mirreur soixante-douze heures, le voile anti-météo."),
  ('v5', "Anti-frisottis, anti-humidité. Jusqu'à soixante-douze heures."),
  ('v6', 'Trois clics suffisent.'),
  ('v7', "Et la météo n'a plus le dernier mot."),
]
v = PiperVoice.load(os.path.join(M, 'fr_FR-upmc-medium.onnx'))
dur = {}
for k, txt in LIGNES:
    b = io.BytesIO()
    with wave.open(b, 'wb') as w:
        v.synthesize_wav(txt, w, syn_config=SynthesisConfig(speaker_id=0, length_scale=1.0, noise_scale=.55, noise_w_scale=.7))
    raw = os.path.join(OUT, k + '.raw.wav'); open(raw, 'wb').write(b.getvalue())
    dst = os.path.join(OUT, k + '.wav')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', raw, '-af',
      'asetrate=22050*0.97,aresample=48000,atempo=1.0309,silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,highpass=f=80,equalizer=f=3000:t=q:w=1:g=2,acompressor=threshold=-20dB:ratio=3,loudnorm=I=-16:TP=-2',
      '-ac', '1', '-ar', '48000', dst], check=True)
    os.remove(raw)
    with wave.open(dst) as w: dur[k] = round(w.getnframes() / w.getframerate(), 2)
    print(k, dur[k])
json.dump(dur, open(os.path.join(OUT, 'durees.json'), 'w'))
