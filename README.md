# S33 - Twin Core

A **monophonic, two-oscillator, semi-modular synthesizer** that runs in the browser, made to be played from a **MIDI keyboard** on the Mac.
It plays straight away with no cables, like a classic mono synth; the **patch bay** on the right lets you re-route it.

It is a **PWA** in a single HTML file, with no dependencies or build step: open it, install it as an app, and it keeps working offline.

> A personal project of the S33 family. The name comes from the two oscillators — the gold and the blue core of a double star — sharing one heart. Inspired by the semi-modular mono synths of the 2010s, not a copy of any of them. No warranty: see [Known limits](#known-limits).

---

## Quick start

### Try it locally

The synth also works by double-clicking `index.html`. To test the **installable app** (service worker), serve the folder:

```bash
cd s33-twin-core
python3 -m http.server 8000
# then open http://localhost:8000 in Chrome
```

### Publish on GitHub Pages

1. Create a repository and upload **the contents** of this folder (`index.html`, `sw.js`, `manifest.webmanifest`, `icons/`, `README.md`).
2. *Settings → Pages → Deploy from a branch →* `main` / `(root)`.
3. Open `https://<user>.github.io/<repository>/`.

All paths are relative, so it also works from a subfolder. GitHub is case-sensitive: the folder must be called `icons`.

### Install as an app

In **Chrome** open the address and choose *Install S33 - Twin Core* from the address bar (or the ⋮ menu). On the Mac it appears as a standalone application with its own icon.

### Playing

1. Connect the MIDI keyboard **before** opening the page (or reload after connecting it).
2. Press **Start audio** (the browser requires a user gesture) and allow MIDI access.
3. Pick a preset from the menu and play.

Without a MIDI keyboard you can use the on-screen keyboard or the computer keys: `A W S E D F T G Y H U J K` play one octave from middle C (they follow **Oct +/−**).

MIDI: notes, pitch bend (range set by *Bend Range*), mod wheel (CC1), All Notes Off (CC120/123).

| | Chrome / Edge | Safari | Firefox |
|---|---|---|---|
| Audio and interface | yes | yes | yes |
| MIDI input (Web MIDI) | **yes** | no | limited |

---

## What's inside

### Signal path (normalled)

VCO 1 + VCO 2 + Noise → **Mixer** → **High-pass** → **Ladder filter 24 dB/oct** → **VCA** → **Spring reverb** → Output

| Block | Controls |
|---|---|
| **Modulation** | LFO Rate (0.05–40 Hz) and Wave (triangle, square, sawtooth, ramp, sample & hold); Pitch Amt, Filter Amt, PWM Amt; vibrato *Always* or via *Mod Wheel* |
| **Oscillators** | VCO 1 and VCO 2: wave (triangle, sawtooth, square, narrow pulse), octave 32′–2′, pulse width. VCO 2: Frequency ±7 semitones, **Hard Sync** to VCO 1 |
| **Mixer** | VCO 1, VCO 2, Noise. High levels drive the filter input into saturation |
| **Filter** | Highpass, Cutoff, Resonance, Env Amt (±6 octaves), Keyboard tracking |
| **Envelope** | ADSR on VCA and filter; Trigger *Retrig* or *Legato* |
| **Spring Reverb** | Dwell (drive into the tank), Decay, Tone, Mix, **Kick** (kick the tank) |
| **Output** | Glide and Glide Mode (*Always* / *Legato* only), Bend Range, Volume |

### Engine

- Both oscillators run in one **AudioWorklet** with **PolyBLEP** anti-aliasing (one-sample lookahead), so hard sync and pulse waves stay clean.
- **Ladder filter**: 4-pole TPT ladder with tanh input saturation; cutoff modulated in octaves.
- **Spring reverb**: two springs, each a cascade of 90 stretched all-pass filters in a feedback loop with damping — a simplified version of Välimäki, Parker & Abel, *Parametric Spring Reverberation Effect* (JAES, 2010). Stereo: one spring per side.
- **Mono voice**: last-note priority, returns to a still-held note on release, legato without envelope retrigger.

### Patch bay

Drag from a jack to another (always output → input). Drag a plugged input away to unplug it, or double-click a cable. Outputs have **cream labels**, inputs dark labels. Cables are saved with the presets.

A cable plugged into an input **replaces** the internal connection; unplug it and the normal connection returns.

| Input | Normalled to | Notes |
|---|---|---|
| FILTER IN | Mixer out | |
| VCA IN | Filter out | |
| VCA CV | Envelope | |
| SPRING IN | VCA out | |
| PITCH MOD | LFO | amount = *Pitch Amt*, gated by the mod wheel when set |
| CUTOFF MOD | LFO | amount = *Filter Amt* |
| PWM MOD | LFO | amount = *PWM Amt* |
| VCO1 PITCH, VCO2 PITCH | — | 1 unit = 1 octave |
| MIX EXT | — | extra mixer input |
| LFO RATE | — | 1 unit = rate doubled |

Outputs: LFO (−1…+1), ENV (0…1), **KB CV** (keyboard in octaves, middle C = 0, with glide), VCO 1, VCO 2, Noise, Mix, Filter, VCA.
Utilities: **MULT** (one input, two outputs) and **ATTEN** (−1…+1, can invert).

### Arpeggiator

ARP on/off, **LATCH**; Mode UP, DN, U/D, RND, ORD (as played); Rate 1/4…1/32 with triplets; 1–4 octaves; Tempo 40–240 bpm; Gate; Swing (straight rates only).

### Presets (30)

- **Sounds**: Init, Fat Bass, Sub Pluck, Acid Line, Taurus Pedal, Classic Lead, Sync Lead, Hollow Square, Brass, PWM Pad, S&H Bleeps, Spring Drip, Synth Drum, Ocean Wind, Tremolo Drone *(plays without keys)*.
- **Patch** (they use cables): Cross-Mod Bell, Clang FM, Filter FM Growl, Envelope PWM Brass, Pedal Point, Random Talk, Accelerating Vibrato, Sync Sweep.
- **Arpeggios**: Classic Up, Berlin Sequence, Random Bleeps, Triplet Bells, Sync Stabs, Wandering Bells, Acid Slide.

A preset stores everything (knobs, cables, arpeggiator) except Volume and Bend Range. **Save as…** adds your own under *My Presets*; **Delete** removes only your own; **Init** resets.

---

## Folder structure

```
index.html              the whole app (interface, engine, AudioWorklet)
sw.js                   service worker (offline cache)
manifest.webmanifest    PWA manifest
icons/                  icon.svg, icon-192/512, maskable, apple-touch, favicon
README.md
```

### Updating the app

The service worker answers from the cache and updates silently when online: after publishing a change, the new version appears **the second time you open it**. To force a refresh, change `VERSIONE` in `sw.js`.

### Data saved in the browser (`localStorage`)

| Key | Content |
|---|---|
| `s33-mono2vco-v1` | current settings and cables |
| `s33-mono2vco-user` | your presets |

The keys keep the project's working name so that settings from the development versions carry over.

---

## Known limits

- Monophonic by design (one voice).
- No velocity response and no MIDI clock sync for the arpeggiator.
- Patch loops without a delay (e.g. VCA → MIX EXT) are silenced by the browser's audio engine.
- MIDI requires Chrome or Edge.

## Use

Personal project, free to study and modify. No warranty of any kind.
