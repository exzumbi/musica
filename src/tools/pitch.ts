export type PitchReading = {
  frequency: number;
  confidence: number;
  rms: number;
};
// YIN: difference function, cumulative mean normalization and parabolic refinement.
// Own implementation; see de Cheveigné & Kawahara (2002), JASA 111(4):1917–1930.
export function detectPitch(
  input: Float32Array,
  sampleRate: number,
): PitchReading | null {
  const step = sampleRate > 30000 ? 2 : 1;
  const length = Math.floor(input.length / step);
  const data = new Float32Array(length);
  let mean = 0;
  for (let i = 0; i < length; i++) {
    data[i] = input[i * step];
    mean += data[i];
  }
  mean /= length;
  let power = 0;
  for (let i = 0; i < length; i++) {
    data[i] -= mean;
    power += data[i] * data[i];
  }
  const rms = Math.sqrt(power / length);
  if (rms < 0.006) return null;
  const rate = sampleRate / step;
  const max = Math.min(Math.floor(rate / 60), Math.floor(length / 2) - 1);
  const min = Math.max(2, Math.floor(rate / 1400));
  const size = length - max;
  const diff = new Float32Array(max + 1);
  const normalized = new Float32Array(max + 1);
  let running = 0;
  for (let tau = 1; tau <= max; tau++) {
    let sum = 0;
    for (let i = 0; i < size; i++) {
      const d = data[i] - data[i + tau];
      sum += d * d;
    }
    diff[tau] = sum;
    running += sum;
    normalized[tau] = running ? (sum * tau) / running : 1;
  }
  let tau = -1;
  for (let i = min; i < max - 1; i++)
    if (normalized[i] < 0.12) {
      while (i + 1 < max && normalized[i + 1] < normalized[i]) i++;
      tau = i;
      break;
    }
  if (tau < 0) return null;
  const a = normalized[tau - 1],
    b = normalized[tau],
    c = normalized[tau + 1];
  const denominator = a - 2 * b + c;
  const refined = tau + (denominator ? (a - c) / (2 * denominator) : 0);
  const frequency = rate / refined;
  const confidence = 1 - b;
  if (confidence < 0.88 || frequency < 60 || frequency > 1400) return null;
  return { frequency, confidence, rms };
}
export function frequencyToMidi(frequency: number, reference = 440) {
  return 69 + 12 * Math.log2(frequency / reference);
}
export function midiFrequency(midi: number, reference = 440) {
  return reference * 2 ** ((midi - 69) / 12);
}
export function centsFrom(frequency: number, midi: number, reference = 440) {
  return 1200 * Math.log2(frequency / midiFrequency(midi, reference));
}
export function stablePitch(readings: number[]) {
  if (readings.length < 5) return false;
  const middle = [...readings].sort((a, b) => a - b)[
    Math.floor(readings.length / 2)
  ];
  return readings.every((f) => Math.abs(1200 * Math.log2(f / middle)) < 9);
}
