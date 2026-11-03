import { claimAudio, registerAudio } from "./audio-bus.ts";
let context: AudioContext | undefined;
let active: OscillatorNode[] = [];
let master: GainNode | undefined;
let timer: ReturnType<typeof setTimeout> | undefined;
let generation = 0;
export function setAudioVolume(volume: number) {
  if (master && context)
    master.gain.setTargetAtTime(volume, context.currentTime, 0.025);
}
export function stopAudio() {
  generation++;
  clearTimeout(timer);
  for (const o of active) {
    try {
      o.stop();
    } catch {
      /* ended */
    }
  }
  active = [];
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event("dm-tones-stopped"));
}
registerAudio("tones", stopAudio);
export type SoundEvent = {
  midi: number;
  at: number;
  duration: number;
  wave?: OscillatorType;
  level?: number;
  frequency?: number;
};
export async function playSequence(
  events: SoundEvent[],
  volume = 0.6,
  onEnd: () => void = () => {},
) {
  claimAudio("tones");
  stopAudio();
  const run = generation;
  context ??= new AudioContext();
  await context.resume();
  if (run !== generation) return;
  master ??= context.createGain();
  master.disconnect();
  master.connect(context.destination);
  setAudioVolume(volume);
  const now = context.currentTime + 0.02;
  for (const event of events) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = event.wave ?? "triangle";
    osc.frequency.value =
      event.frequency ?? 440 * 2 ** ((event.midi - 69) / 12);
    const start = now + event.at;
    const duration = Math.max(0.07, event.duration);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.13 * (event.level ?? 1), start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(start);
    osc.stop(start + duration + 0.02);
    active.push(osc);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }
  const end = Math.max(0, ...events.map((e) => e.at + e.duration));
  timer = setTimeout(
    () => {
      if (run === generation) {
        active = [];
        onEnd();
      }
    },
    (end + 0.15) * 1000,
  );
}
export async function playAudio(
  notes: number[],
  volume: number,
  arpeggio: boolean,
  onEnd: () => void,
  reference = 440,
) {
  return playSequence(
    notes.map((midi, i) => ({
      midi,
      at: arpeggio ? i * 0.48 : 0,
      duration: arpeggio ? 1.05 : 2.2,
      level: 1 / Math.sqrt(notes.length),
      frequency: reference * 2 ** ((midi - 69) / 12),
    })),
    volume,
    onEnd,
  );
}
