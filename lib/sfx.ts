/**
 * The one sound the site makes: a short swish as an item drops into the
 * basket.
 *
 * It is synthesised rather than loaded, which keeps it off the network, out of
 * the bundle and free of licensing questions — and lets it stay genuinely
 * short. Peak gain is deliberately low; this is a confirmation, not an event.
 *
 * Browsers refuse audio until the visitor has interacted, so the context is
 * created inside the click that starts the throw (`primeCartSound`) and only
 * played when the throw lands (`playCartDrop`).
 */
type Ctor = typeof AudioContext;

let context: AudioContext | null = null;
let noise: AudioBuffer | null = null;

function ctor(): Ctor | undefined {
  if (typeof window === "undefined") return undefined;
  return window.AudioContext ?? (window as unknown as { webkitAudioContext?: Ctor }).webkitAudioContext;
}

/** Called from the click, where creating an AudioContext is still permitted. */
export function primeCartSound() {
  const Ctx = ctor();
  if (!Ctx) return;
  try {
    context ??= new Ctx();
    if (context.state === "suspended") void context.resume();
  } catch {
    context = null;
  }
}

/** Half a second of white noise, generated once and reused for every swish. */
function noiseBuffer(ac: AudioContext) {
  if (noise) return noise;
  const frames = Math.floor(ac.sampleRate * 0.5);
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  noise = buffer;
  return buffer;
}

/**
 * Voiced as a bling: a bright glockenspiel sparkle rather than a thud.
 *
 * The shape of that sound is a C major arpeggio rolled upwards over about a
 * tenth of a second, each note ringing on into the next so the whole thing
 * blurs into one shimmer rather than reading as five separate notes. The top
 * notes are quieter and die sooner, which is what stops a bright chime turning
 * into a shriek on laptop speakers.
 *
 * `at` is the strike offset in seconds — the roll is what makes it sparkle; hit
 * all five together and it is just a chord.
 */
const SPARKLE: { hz: number; gain: number; decay: number; at: number }[] = [
  { hz: 1046.5, gain: 0.055, decay: 0.9, at: 0 }, // C6
  { hz: 1318.51, gain: 0.05, decay: 0.82, at: 0.028 }, // E6
  { hz: 1567.98, gain: 0.044, decay: 0.74, at: 0.052 }, // G6
  { hz: 2093.0, gain: 0.034, decay: 0.62, at: 0.076 }, // C7
  { hz: 2637.02, gain: 0.022, decay: 0.5, at: 0.098 }, // E7
];

/** Cents of detune on a doubled voice. Two slightly-apart copies beat against
 *  each other, which is most of what makes a synthesised bell sound expensive. */
const DETUNE = 7;

export function playCartDrop() {
  const ac = context;
  if (!ac || ac.state !== "running") return;

  const now = ac.currentTime;

  /* One master, rolled off at the top so the sparkle stays bright without
     turning glassy on laptop speakers. */
  const out = ac.createGain();
  out.gain.value = 0.8;
  const polish = ac.createBiquadFilter();
  polish.type = "lowpass";
  polish.frequency.value = 9000;
  polish.Q.value = 0.5;
  out.connect(polish).connect(ac.destination);

  /* The sparkle: an arpeggio rolled upwards, each note doubled and detuned. */
  for (const { hz, gain, decay, at } of SPARKLE) {
    const start = now + at;
    for (const cents of [0, DETUNE]) {
      const tone = ac.createOscillator();
      tone.type = cents === 0 ? "triangle" : "sine";
      tone.frequency.value = hz;
      tone.detune.value = cents;
      const env = ac.createGain();
      const level = cents === 0 ? gain : gain * 0.55;
      env.gain.setValueAtTime(0.0001, start);
      env.gain.exponentialRampToValueAtTime(level, start + 0.006);
      env.gain.exponentialRampToValueAtTime(0.0001, start + decay);
      tone.connect(env).connect(out);
      tone.start(start);
      tone.stop(start + decay + 0.02);
    }
  }

  /* A pinch of high air on the attack, the "tss" inside a bling. */
  const air = ac.createBufferSource();
  air.buffer = noiseBuffer(ac);
  const shelf = ac.createBiquadFilter();
  shelf.type = "highpass";
  shelf.frequency.value = 6000;
  const airGain = ac.createGain();
  airGain.gain.setValueAtTime(0.0001, now);
  airGain.gain.exponentialRampToValueAtTime(0.02, now + 0.012);
  airGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
  air.connect(shelf).connect(airGain).connect(out);
  air.start(now);
  air.stop(now + 0.18);

  window.setTimeout(() => out.disconnect(), 1400);
}
