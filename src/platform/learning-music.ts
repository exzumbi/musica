import { spell, pitch } from "../theory.ts";
export type ScaleMode = "major" | "minor" | "dorian";
export const scalePatterns: Record<ScaleMode, number[]> = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
};
export function scaleNotes(root: string, mode: ScaleMode) {
  return scalePatterns[mode].map((interval, i) => spell(root, i, interval));
}
export function scaleMidi(root: string, mode: ScaleMode) {
  return scalePatterns[mode].map((n) => 60 + pitch(root) + n);
}
export type RhythmValue = {
  name: string;
  symbol: string;
  beats: number;
  rest: boolean;
};
export const rhythmValues: RhythmValue[] = [
  { name: "Semínima", symbol: "♩", beats: 1, rest: false },
  { name: "Colcheia", symbol: "♪", beats: 0.5, rest: false },
  { name: "Mínima", symbol: "𝅗𝅥", beats: 2, rest: false },
  { name: "Pausa de semínima", symbol: "𝄽", beats: 1, rest: true },
  { name: "Pausa de colcheia", symbol: "𝄾", beats: 0.5, rest: true },
];
export function rhythmTotal(values: RhythmValue[]) {
  return values.reduce((sum, v) => sum + v.beats, 0);
}
export function rhythmScore(taps: number[], bpm: number) {
  if (taps.length < 4) return null;
  const beat = 60000 / bpm;
  const gaps = taps.slice(1).map((t, i) => t - taps[i]);
  const error =
    gaps.reduce((sum, g) => sum + Math.abs(g - beat), 0) / gaps.length;
  return {
    averageErrorMs: Math.round(error),
    percent: Math.max(0, Math.round(100 - (error / beat) * 100)),
  };
}
