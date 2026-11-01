import numpy as np, wave, json, subprocess, os
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000
DUR = 54.5
N = int(SR * DUR)
D = os.path.dirname(os.path.abspath(__file__))
rs = np.random.RandomState(7)

def readwav(p):
    with wave.open(p) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
        if w.getnchannels() == 2: x = x.reshape(-1, 2).mean(1)
    if sr != SR: x = resample_poly(x, SR, sr).astype(np.float32)
    return x

def filt(x, kind, f, order=2):
    if kind == 'bp': sos = butter(order, [f[0] / (SR / 2), f[1] / (SR / 2)], btype='band', output='sos')
    else: sos = butter(order, f / (SR / 2), btype=kind, output='sos')
    return sosfilt(sos, x)

def add(buf, x, t, g=1.0):
    i = int(t * SR); j = min(len(buf), i + len(x))
    if i >= len(buf) or j <= 0: return
    buf[i:j] += x[: j - i] * g

def env_ad(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)

def note(m): return 440 * 2 ** ((m - 69) / 12)

# ---------------- VOICE ----------------
voice = np.zeros(N, np.float32)
lines = [('l1', 1.0), ('l2', 5.4), ('l3', 12.6), ('l4', 19.5), ('l5a', 23.8), ('l5b', 26.5), ('l5c', 29.2), ('l5d', 31.9), ('l6', 35.2), ('l7', 45.4), ('l8', 50.0)]
for name, t in lines:
    x = readwav(os.path.join(D, name + '.wav'))
    x = x / (np.abs(x).max() + 1e-6) * 0.9
    add(voice, x, t)
# voice polish: highpass + presence + light compression
voice = filt(voice, 'high', 90)
pres = filt(voice, 'bp', (2500, 6000))
voice = voice + 0.35 * pres
# soft compression
venv = np.maximum(filt(np.abs(voice), 'low', 20), 0)
gain = 1 / np.maximum(1, (venv / 0.25) ** 0.5)
voice = voice * gain
voice = voice / (np.abs(voice).max() + 1e-6) * 0.92
# lip-sync envelope at 30fps
fps = 30; hop = SR // fps
e = np.array([np.sqrt(np.mean(voice[i * hop:(i + 1) * hop] ** 2)) for i in range(int(DUR * fps) + 2)])
e = np.nan_to_num(e); e = np.clip(e / (np.percentile(e[e > 0.01], 90) + 1e-6), 0, 1)
e = np.where(e < 0.12, 0, e)
json.dump([round(float(v), 3) for v in e], open(os.path.join(D, '..', 'proj', 'env.json'), 'w'))
# ducking envelope
duck_env = np.maximum(filt(np.abs(voice), 'low', 6), 0); duck_env = np.clip(duck_env / 0.08, 0, 1)

# ---------------- MUSIC ----------------
BPM = 120; B = 60 / BPM
L = np.zeros(N, np.float32); R = np.zeros(N, np.float32)
def addst(x, t, g=1.0, pan=0.0):
    add(L, x, t, g * (1 - max(0, pan))); add(R, x, t, g * (1 + min(0, pan)))

def kick():
    n = int(0.4 * SR); tt = np.arange(n) / SR
    f = 45 + 110 * np.exp(-tt * 30); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-tt * 7) + 0.3 * np.exp(-tt * 200) * rs.randn(n) * 0.3).astype(np.float32)
def clap():
    n = int(0.3 * SR); x = rs.randn(n); x = filt(x, 'bp', (900, 4000)); tt = np.arange(n) / SR
    e = np.exp(-tt * 18) * (1 + 0.6 * ((tt % 0.012) < 0.006) * (tt < 0.04)); return (x * e * 0.8).astype(np.float32)
def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR); x = filt(rs.randn(n), 'high', 7000); tt = np.arange(n) / SR
    return (x * np.exp(-tt * (12 if open_ else 60)) * 0.5).astype(np.float32)
def saw(f, n, det=0.0):
    tt = np.arange(n) / SR; return 2 * ((tt * f * (1 + det)) % 1) - 1
def pad(midis, dur, bright=1.0):
    n = int(dur * SR); x = np.zeros(n)
    for m in midis:
        for d in (-0.006, 0, 0.007): x += saw(note(m), n, d)
    x = filt(x, 'low', 900 + 1800 * bright) / (len(midis) * 3)
    tt = np.arange(n) / SR; e = np.minimum(1, tt / 0.25) * np.minimum(1, (dur - tt) / 0.3)
    return (x * e).astype(np.float32)
def bass(m, dur):
    n = int(dur * SR); tt = np.arange(n) / SR; f = note(m)
    x = np.sign(np.sin(2 * np.pi * f * tt)) * 0.5 + np.sin(2 * np.pi * f * tt)
    x = filt(x, 'low', 500); return (x * np.exp(-tt * 3) * np.minimum(1, tt / 0.005) * 0.5).astype(np.float32)
def bell(m, dur=0.6, bright=1):
    n = int(dur * SR); tt = np.arange(n) / SR; f = note(m)
    x = np.sin(2 * np.pi * f * tt) + 0.35 * np.sin(2 * np.pi * 2 * f * tt) * np.exp(-tt * 6) + 0.2 * bright * np.sin(2 * np.pi * 4.01 * f * tt) * np.exp(-tt * 12)
    return (x * np.exp(-tt * 5) * np.minimum(1, tt / 0.003) * 0.4).astype(np.float32)
def lead(m, dur):
    n = int(dur * SR); tt = np.arange(n) / SR; f = note(m) * (1 + 0.004 * np.sin(2 * np.pi * 5.5 * tt) * np.minimum(1, tt / 0.15))
    ph = 2 * np.pi * np.cumsum(f) / SR; x = np.sign(np.sin(ph)) * 0.35 + np.sin(ph) * 0.5 + 0.2 * np.sin(2 * ph)
    x = filt(x, 'low', 3500); e = np.minimum(1, tt / 0.01) * np.minimum(1, (dur - tt) / 0.04).clip(0) * (0.8 + 0.2 * np.exp(-tt * 4))
    return (x * e * 0.28).astype(np.float32)

# chord progression C G Am F (bar = 4 beats = 2s)
prog = [[60, 64, 67], [59, 62, 67], [57, 60, 64], [57, 60, 65]]
roots = [36, 31, 33, 29]
minor_prog = [[57, 60, 64], [53, 57, 60], [55, 60, 64], [55, 59, 62]]
minor_roots = [33, 29, 36, 31]

KICK, CLAP, HAT, HATO = kick(), clap(), hat(), hat(True)

# section 1: 0-11 subdued
for bar in range(6):
    t = bar * 2.0
    ch = minor_prog[bar % 4]
    addst(pad(ch, 2.05, 0.2), t, 0.45)
    addst(bass(minor_roots[bar % 4], 1.9), t, 0.35)
    for k in range(8):
        if t + k * 0.25 < 10.8: addst(HAT, t + k * 0.25, 0.12 if k % 2 else 0.2, 0.3)
    for k, m in enumerate([69, 72, 76, 72]):
        addst(bell(m + (0 if bar % 2 == 0 else -2), 0.5, 0.5), t + k * 0.5 + 0.25, 0.22, -0.3)

# melody for groove
mel = [76, 79, 81, 79, 76, 74, 72, 74, 76, 79, 84, 83, 81, 79, 76, 79]
def groove(t0, t1, full=True, melody=True, lead_on=False, bright=1.0):
    bar = 0; t = t0
    while t < t1 - 0.01:
        i = bar % 4
        span = min(2.0, t1 - t)
        addst(pad(prog[i], span + 0.05, bright), t, 0.38)
        for k in range(4):
            tk = t + k * B
            if tk >= t1: break
            if full: addst(KICK, tk, 0.9)
            if full and k % 2 == 1: addst(CLAP, tk, 0.45)
        for k in range(8):
            tk = t + k * B / 2
            if tk >= t1: break
            addst(HAT if k % 2 == 0 else HAT, tk + (0.0 if k % 2 == 0 else 0.0), 0.22 if k % 2 else 0.14, 0.25)
            if k % 2 == 1: addst(HATO, tk, 0.07, -0.25)
            addst(bass(roots[i] + (12 if k % 4 == 3 else 0), B / 2), tk, 0.55)
            if melody:
                m = mel[(bar % 2) * 8 + k]
                if lead_on: addst(lead(m, B / 2 * 0.95), tk, 0.6)
                else: addst(bell(m, 0.45), tk, 0.33, -0.2)
        bar += 1; t += 2.0

def riser(t0, dur, g=0.4):
    n = int(dur * SR); tt = np.arange(n) / SR; x = rs.randn(n)
    out = np.zeros(n)
    seg = n // 20
    for s in range(20):
        a, b2 = s * seg, (s + 1) * seg
        f = 400 + (s / 20) ** 2 * 8000
        out[a:b2] = filt(x[a:b2], 'bp', (f, min(f * 1.8, 20000)))
    addst((out * (tt / dur) ** 2 * g).astype(np.float32), t0, 1)

def crash(t0, g=0.5):
    n = int(2.0 * SR); tt = np.arange(n) / SR; x = filt(rs.randn(n), 'high', 4000)
    addst((x * np.exp(-tt * 2.2) * g).astype(np.float32), t0, 1)

def boom(t0, g=0.9):
    n = int(1.2 * SR); tt = np.arange(n) / SR; f = 30 + 80 * np.exp(-tt * 8); ph = 2 * np.pi * np.cumsum(f) / SR
    addst((np.sin(ph) * np.exp(-tt * 3) * g).astype(np.float32), t0, 1)

riser(9.6, 1.4, 0.25)
groove(11.0, 17.6, full=True, melody=True)
# build 17.6-22
for bar in range(2):
    t = 17.6 + bar * 2.0; i = bar % 4
    addst(pad(prog[i], 2.05, 0.4 + bar * 0.3), t, 0.35)
    for k in range(4): addst(KICK, t + k * B, 0.5)
    for k in range(8): addst(bass(roots[i], B / 2), t + k * B / 2, 0.4)
addst(pad(prog[2], 0.45, 1.0), 21.6, 0.3)
for k in range(12): addst(CLAP, 20.0 + k * (1.2 / 12) * (1 - k / 30), 0.12 + k * 0.025)
riser(20.2, 1.8, 0.35)
crash(22.0, 0.45); boom(22.0, 0.8)
groove(22.0, 44.6, full=True, melody=True, lead_on=False, bright=1.0)
# extra lead layer in globe section
groove(34.3, 44.6, full=False, melody=True, lead_on=True, bright=1.0)
riser(43.2, 1.4, 0.3)
crash(44.6, 0.55); boom(44.6, 0.9)
groove(44.6, 52.6, full=True, melody=True, lead_on=True, bright=1.2)
# outro chord
addst(pad([60, 64, 67, 72], 1.9, 1.0), 52.6, 0.5)
addst(bell(84, 1.5), 52.6, 0.4); addst(bell(79, 1.5), 52.6, 0.3); addst(KICK, 52.6, 0.9); crash(52.6, 0.35)

music = np.stack([L, R], 1)
# sidechain duck
duck = 1 - 0.55 * duck_env
music *= duck[:, None]
music /= (np.abs(music).max() + 1e-6); music *= 0.55

# ---------------- SFX ----------------
S = np.zeros((N, 2), np.float32)
def sfx(x, t, g=1.0, pan=0.0):
    i = int(t * SR); j = min(N, i + len(x))
    if i >= N: return
    S[i:j, 0] += x[: j - i] * g * (1 - max(0, pan)); S[i:j, 1] += x[: j - i] * g * (1 + min(0, pan))
def tone_sweep(f0, f1, dur, shape='sin', dec=6):
    n = int(dur * SR); tt = np.arange(n) / SR; f = f0 * (f1 / f0) ** (tt / dur); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) if shape == 'sin' else np.sign(np.sin(ph)) * 0.6
    return (x * np.exp(-tt * dec) * np.minimum(1, tt / 0.004)).astype(np.float32)
def pop(): return tone_sweep(500, 1400, 0.09, dec=30)
def whoosh(dur=0.6, g=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR; x = rs.randn(n); out = np.zeros(n); seg = n // 16
    for s2 in range(16):
        a, b2 = s2 * seg, (s2 + 1) * seg; f = 300 + 2500 * np.sin(np.pi * s2 / 16)
        out[a:b2] = filt(x[a:b2], 'bp', (f, f * 2.2))
    return (out * np.sin(np.pi * tt / dur) ** 2 * g).astype(np.float32)
def buzz(dur=0.25):
    n = int(dur * SR); tt = np.arange(n) / SR; x = np.sign(np.sin(2 * np.pi * 110 * tt)) * 0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 116 * tt))
    return (filt(x, 'low', 1500) * np.minimum(1, (dur - tt) / 0.03) * 0.35).astype(np.float32)
def chime(ms, step=0.07, dur=0.9):
    n = int((dur + step * len(ms)) * SR); x = np.zeros(n, np.float32)
    for k, m in enumerate(ms):
        b2 = bell(m, dur, 1.5); i = int(k * step * SR); x[i:i + len(b2)] += b2
    return x
def sparkle(dur=1.0, cnt=14):
    n = int(dur * SR); x = np.zeros(n, np.float32)
    for k in range(cnt):
        m = 88 + rs.randint(0, 14); b2 = bell(m, 0.3, 2) * 0.5; i = int(rs.rand() * (n - len(b2))); x[i:i + len(b2)] += b2
    return x
def click():
    n = int(0.05 * SR); tt = np.arange(n) / SR; return (filt(rs.randn(n), 'bp', (1500, 6000)) * np.exp(-tt * 120) * 1.2 + np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt * 80) * 0.5).astype(np.float32)
def wingbuzz(dur):
    n = int(dur * SR); tt = np.arange(n) / SR; f = 210 + 15 * np.sin(2 * np.pi * 3 * tt); ph = 2 * np.pi * np.cumsum(f) / SR
    x = filt(np.sign(np.sin(ph)), 'bp', (200, 2500)) * (0.6 + 0.4 * np.sin(2 * np.pi * 9.3 * tt))
    return (x * np.sin(np.pi * tt / dur) * 0.18).astype(np.float32)
def trombone():
    out = []
    for f0, f1, d in [(233, 220, 0.32), (220, 208, 0.32), (208, 196, 0.32), (196, 150, 0.9)]:
        n = int(d * SR); tt = np.arange(n) / SR; f = np.linspace(f0, f1, n) * (1 + (0.02 * np.sin(2 * np.pi * 6 * tt) if d > 0.5 else 0)); ph = 2 * np.pi * np.cumsum(f) / SR
        x = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph) + 0.15 * np.sin(4 * ph)
        out.append(filt(x, 'low', 1800) * np.minimum(1, tt / 0.03) * np.minimum(1, (d - tt) / 0.05) * 0.25)
    return np.concatenate(out).astype(np.float32)
def poof():
    n = int(0.5 * SR); tt = np.arange(n) / SR; return (filt(rs.randn(n), 'low', 1200) * np.exp(-tt * 7) * 0.8).astype(np.float32)

# phone taps 2..7
for k, t in enumerate(np.arange(2.2, 7.0, 0.55)): sfx(click(), t, 0.25, 0.1)
# error icons
for i in range(5):
    t = 5.3 + i * 0.55; sfx(pop(), t, 0.5, -0.4 + i * 0.2)
    if i in (0, 2): sfx(buzz(0.22), t + 0.05, 0.6)
sfx(whoosh(0.5), 7.0, 0.5)
sfx(trombone(), 9.3, 0.7)
# bee arrival
sfx(sparkle(1.0), 10.95, 0.7); sfx(whoosh(1.1), 11.0, 0.9); sfx(wingbuzz(1.4), 11.0, 1.0)
sfx(tone_sweep(1200, 300, 0.25, 'sq', 8), 12.05, 0.35); sfx(poof(), 12.1, 0.7)
sfx(chime([72, 76, 79, 84]), 12.15, 0.6)
sfx(chime([79, 84, 88], 0.06), 14.6, 0.5)
# transitions
for c in [17.6, 22.0, 23.6, 26.3, 29.0, 31.7, 34.3, 44.6]: sfx(whoosh(0.6), c - 0.32, 0.6)
# connect
sfx(click(), 20.45, 1.0)
for k in range(5): sfx(tone_sweep(880 + k * 110, 880 + k * 110, 0.08, dec=20), 20.55 + k * 0.13, 0.25)
sfx(chime([72, 76, 79, 84, 88], 0.06, 1.2), 21.2, 0.8)
sfx(sparkle(1.2, 20), 21.2, 0.6)
sfx(tone_sweep(120, 600, 0.8, 'sin', 2), 22.05, 0.4); sfx(sparkle(1.3, 22), 22.05, 0.7)
# vignettes: pops for reactions + shield shimmer + bee buzz
for t0 in [23.6, 26.3, 29.0, 31.7]:
    sfx(chime([84, 88], 0.05, 0.6), t0 + 0.35, 0.35)
    for k in range(4): sfx(pop(), t0 + 0.5 + k * 0.5, 0.25, (k % 2) * 0.6 - 0.3)
    sfx(wingbuzz(1.2), t0 + 1.0, 0.7)
sfx(tone_sweep(150, 90, 2.0, 'sq', 1.2) * 0.3, 32.6, 0.3)  # plane rumble-ish
# globe
for t0 in [34.3, 36.4, 38.4, 40.3]: sfx(whoosh(0.8), t0, 0.45); sfx(chime([79, 84], 0.05, 0.6), t0 + 0.6, 0.35)
for i in range(10): sfx(bell(91 + (i % 5) * 2, 0.3, 2) * 0.6, 34.6 + i * 0.55 + 0.9, 0.35, (i % 3 - 1) * 0.5)
sfx(sparkle(1.4, 18), 42.4, 0.5)
# finale
sfx(chime([72, 76, 79, 84, 88, 91], 0.05, 1.4), 45.0, 0.7)
for k in range(10): sfx(pop(), 45.1 + k * 0.07, 0.35, (k % 5 - 2) * 0.3)
sfx(sparkle(2.0, 30), 45.1, 0.5)
sfx(chime([84, 91], 0.08, 1.0), 49.8, 0.6)
sfx(sparkle(1.5, 20), 52.6, 0.5)

sfx_m = S / (np.abs(S).max() + 1e-6) * 0.5

mix = music * 0.85 + sfx_m * 0.75 + np.stack([voice, voice], 1) * 1.0
# fades
fade = np.ones(N); fi = int(0.3 * SR); fo = int(1.2 * SR)
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
mix *= fade[:, None]
# limiter-ish
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix /= (np.abs(mix).max() + 1e-6); mix *= 0.95
pcm = (mix * 32767).astype(np.int16)
with wave.open(os.path.join(D, 'mix.wav'), 'w') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('ok', len(e))
