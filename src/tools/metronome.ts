import { claimAudio, registerAudio } from "../audio-bus.ts";
export type Meter = "2/4" | "3/4" | "4/4" | "6/8";
export type Division = "beat" | "eighth" | "triplet" | "sixteenth";
export type MetroConfig = {
  bpm: number;
  meter: Meter;
  division: Division;
  volume: number;
  muted: boolean;
  countIn: boolean;
};
export function meterParts(meter: Meter, division: Division) {
  const compound = meter === "6/8";
  return {
    beats: compound ? 2 : Number(meter[0]),
    parts:
      division === "beat"
        ? 1
        : division === "eighth"
          ? compound
            ? 3
            : 2
          : division === "triplet"
            ? 3
            : compound
              ? 6
              : 4,
    unit: compound ? "semínima pontuada" : "semínima",
  };
}
export function clickPlan(index: number, config: MetroConfig) {
  const { parts, beats } = meterParts(config.meter, config.division);
  const within = index % (parts * beats);
  return {
    beat: Math.floor(within / parts),
    subdivision: within % parts,
    accent: within === 0,
    seconds: 60 / config.bpm / parts,
    counting: config.countIn && index < parts * beats,
  };
}
export function tapTempo(taps: number[]): number | null {
  if (taps.length < 2) return null;
  const gaps = taps
    .slice(1)
    .map((t, i) => t - taps[i])
    .filter((t) => t >= 200 && t <= 3000);
  if (!gaps.length) return null;
  const sorted = [...gaps].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  return Math.max(30, Math.min(240, Math.round(60000 / median)));
}
export class MetronomeEngine {
  context: AudioContext | null = null;
  gain: GainNode | null = null;
  timer: ReturnType<typeof setTimeout> | undefined;
  frame = 0;
  nodes = new Set<OscillatorNode>();
  config: MetroConfig;
  index = 0;
  next = 0;
  queue: { time: number; index: number }[] = [];
  running = false;
  generation = 0;
  release: () => void;
  onTick: (index: number, counting: boolean) => void;
  onStop: () => void;
  onSuspend: () => void = () => {};
  constructor(
    config: MetroConfig,
    onTick: MetronomeEngine["onTick"],
    onStop: () => void,
  ) {
    this.config = config;
    this.onTick = onTick;
    this.onStop = onStop;
    this.release = registerAudio("metronome", () => this.stop());
  }
  async start() {
    this.stop(false);
    const attempt = ++this.generation;
    claimAudio("metronome");
    this.context ??= new AudioContext({ latencyHint: "interactive" });
    this.context.onstatechange = () => {
      if (this.running && this.context?.state === "suspended") {
        this.stop();
        this.onSuspend();
      }
    };
    await this.context.resume();
    if (attempt !== this.generation) return false;
    this.running = true;
    this.gain ??= this.context.createGain();
    this.gain.disconnect();
    this.gain.connect(this.context.destination);
    this.volume(this.config.volume, this.config.muted);
    this.index = 0;
    this.queue = [];
    this.next = this.context.currentTime + 0.08;
    this.schedule();
    this.visual();
    return true;
  }
  volume(value: number, muted: boolean) {
    this.config.volume = value;
    this.config.muted = muted;
    if (this.gain && this.context)
      this.gain.gain.setTargetAtTime(
        muted ? 0 : value,
        this.context.currentTime,
        0.015,
      );
  }
  schedule = () => {
    if (!this.running || !this.context) return;
    while (this.next < this.context.currentTime + 0.12) {
      const plan = clickPlan(this.index, this.config);
      const osc = this.context.createOscillator();
      const envelope = this.context.createGain();
      osc.frequency.value = plan.accent
        ? 1500
        : plan.subdivision === 0
          ? 1000
          : 650;
      envelope.gain.setValueAtTime(plan.accent ? 0.35 : 0.2, this.next);
      envelope.gain.exponentialRampToValueAtTime(0.0001, this.next + 0.035);
      osc.connect(envelope);
      envelope.connect(this.gain!);
      osc.start(this.next);
      osc.stop(this.next + 0.045);
      this.nodes.add(osc);
      osc.onended = () => {
        this.nodes.delete(osc);
        osc.disconnect();
        envelope.disconnect();
      };
      this.queue.push({ time: this.next, index: this.index++ });
      this.next += plan.seconds;
    }
    this.timer = setTimeout(this.schedule, 25);
  };
  visual = () => {
    if (!this.running || !this.context) return;
    while (
      this.queue.length &&
      this.queue[0].time <= this.context.currentTime
    ) {
      const event = this.queue.shift()!;
      this.onTick(event.index, clickPlan(event.index, this.config).counting);
    }
    this.frame = requestAnimationFrame(this.visual);
  };
  stop(notify = true) {
    this.generation++;
    this.running = false;
    clearTimeout(this.timer);
    cancelAnimationFrame(this.frame);
    this.queue = [];
    for (const node of this.nodes) {
      try {
        node.stop();
      } catch {
        /* ended */
      }
    }
    this.nodes.clear();
    if (notify) this.onStop();
  }
  dispose() {
    this.stop();
    this.release();
    void this.context?.close();
  }
}
