import { mod, pitch, type Chord } from "./theory.ts";
export type InstrumentId =
  | "piano"
  | "guitar"
  | "electric"
  | "cavaquinho"
  | "ukulele"
  | "bass"
  | "violin"
  | "harmonica"
  | "percussion";
export type Instrument = {
  id: InstrumentId;
  name: string;
  family: string;
  icon: string;
  tuning?: number[];
  tuningLabel?: string;
};
export const instruments: Instrument[] = [
  { id: "piano", name: "Piano", family: "Teclas", icon: "▥" },
  {
    id: "guitar",
    name: "Violão",
    family: "Cordas dedilhadas",
    icon: "♧",
    tuning: [40, 45, 50, 55, 59, 64],
    tuningLabel: "E2 · A2 · D3 · G3 · B3 · E4",
  },
  {
    id: "electric",
    name: "Guitarra",
    family: "Cordas dedilhadas",
    icon: "ϟ",
    tuning: [40, 45, 50, 55, 59, 64],
    tuningLabel: "E2 · A2 · D3 · G3 · B3 · E4",
  },
  {
    id: "cavaquinho",
    name: "Cavaquinho",
    family: "Cordas dedilhadas",
    icon: "♧",
    tuning: [50, 55, 59, 62],
    tuningLabel: "D3 · G3 · B3 · D4",
  },
  {
    id: "ukulele",
    name: "Ukulele",
    family: "Cordas dedilhadas",
    icon: "♧",
    tuning: [67, 60, 64, 69],
    tuningLabel: "G4 · C4 · E4 · A4 (sol agudo)",
  },
  {
    id: "bass",
    name: "Baixo",
    family: "Cordas — estudo",
    icon: "♩",
    tuning: [28, 33, 38, 43],
    tuningLabel: "E1 · A1 · D2 · G2",
  },
  {
    id: "violin",
    name: "Violino",
    family: "Cordas — estudo",
    icon: "♬",
    tuning: [55, 62, 69, 76],
    tuningLabel: "G3 · D4 · A4 · E5",
  },
  { id: "harmonica", name: "Gaita", family: "Sopro", icon: "▤" },
  { id: "percussion", name: "Pandeiro", family: "Percussão", icon: "◉" },
];
export type Shape = {
  frets: number[];
  fingers: number[];
  label: string;
  barre?: { fret: number; from: number; to: number };
};
const shape = (
  frets: number[],
  fingers: number[],
  label = "Posição aberta",
  barre?: Shape["barre"],
): Shape => ({ frets, fingers, label, barre });
// Catálogo editorial próprio. Fretes e dedos explícitos, conferidos pela afinação.
const guitar: Record<string, Shape[]> = {
  C: [
    shape([-1, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0]),
    shape([-1, 3, 5, 5, 5, 3], [0, 1, 3, 3, 3, 1], "Pestana na 3ª casa", {
      fret: 3,
      from: 1,
      to: 5,
    }),
  ],
  Am: [shape([-1, 0, 2, 2, 1, 0], [0, 0, 2, 3, 1, 0])],
  Em: [shape([0, 2, 2, 0, 0, 0], [0, 2, 3, 0, 0, 0])],
  Em7: [
    shape([0, 2, 2, 0, 3, 0], [0, 1, 2, 0, 3, 0]),
    shape([0, 2, 0, 0, 0, 0], [0, 2, 0, 0, 0, 0], "Posição com cordas soltas"),
  ],
  Bm7: [
    shape([-1, 2, 4, 2, 3, 2], [0, 1, 3, 1, 2, 1], "Pestana na 2ª casa", {
      fret: 2,
      from: 1,
      to: 5,
    }),
  ],
  Bmaj7: [
    shape([-1, 2, 4, 3, 4, 2], [0, 1, 3, 2, 4, 1], "Pestana na 2ª casa", {
      fret: 2,
      from: 1,
      to: 5,
    }),
  ],
  Cmaj7: [shape([-1, 3, 2, 0, 0, 0], [0, 3, 2, 0, 0, 0])],
  D: [shape([-1, -1, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2])],
  Dm: [shape([-1, -1, 0, 2, 3, 1], [0, 0, 0, 2, 3, 1])],
  Dsus4: [shape([-1, -1, 0, 2, 3, 3], [0, 0, 0, 1, 3, 4])],
  G: [shape([3, 2, 0, 0, 0, 3], [2, 1, 0, 0, 0, 3])],
  F: [
    shape([1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], "Pestana na 1ª casa", {
      fret: 1,
      from: 0,
      to: 5,
    }),
  ],
  "F#": [
    shape([2, 4, 4, 3, 2, 2], [1, 3, 4, 2, 1, 1], "Pestana na 2ª casa", {
      fret: 2,
      from: 0,
      to: 5,
    }),
  ],
  E: [shape([0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0])],
  A: [shape([-1, 0, 2, 2, 2, 0], [0, 0, 1, 2, 3, 0])],
  A7: [shape([-1, 0, 2, 0, 2, 0], [0, 0, 1, 0, 2, 0])],
  Am7: [shape([-1, 0, 2, 0, 1, 0], [0, 0, 2, 0, 1, 0])],
  G7: [shape([3, 2, 0, 0, 0, 1], [3, 2, 0, 0, 0, 1])],
  "C/E": [shape([0, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0], "Dó com baixo em Mi")],
  Bdim: [shape([-1, 2, 3, 4, 3, -1], [0, 1, 2, 4, 3, 0], "Tríade diminuta")],
  Caug: [
    shape([-1, 3, 2, 1, 1, -1], [0, 3, 2, 1, 1, 0], "Tríade aumentada", {
      fret: 1,
      from: 3,
      to: 4,
    }),
  ],
  "Am7(b5)": [shape([-1, 0, 1, 0, 1, -1], [0, 0, 1, 0, 2, 0], "Meio diminuto")],
};
const ukulele: Record<string, Shape[]> = {
  C: [
    shape([0, 0, 0, 3], [0, 0, 0, 3]),
    shape([5, 4, 3, 3], [3, 2, 1, 1], "Pestana parcial na 3ª casa", {
      fret: 3,
      from: 2,
      to: 3,
    }),
  ],
  Am: [shape([2, 0, 0, 0], [2, 0, 0, 0])],
  Em: [shape([0, 4, 3, 2], [0, 3, 2, 1])],
  Em7: [shape([0, 2, 0, 2], [0, 1, 0, 2])],
  Bm7: [
    shape([2, 2, 2, 2], [1, 1, 1, 1], "Pestana na 2ª casa", {
      fret: 2,
      from: 0,
      to: 3,
    }),
  ],
  Bmaj7: [shape([4, 3, 2, 1], [4, 3, 2, 1], "Posição na 1ª casa")],
  Cmaj7: [shape([0, 0, 0, 2], [0, 0, 0, 2])],
  F: [shape([2, 0, 1, 0], [2, 0, 1, 0])],
  G: [shape([0, 2, 3, 2], [0, 1, 3, 2])],
  D: [shape([2, 2, 2, 0], [1, 2, 3, 0])],
  Am7: [shape([0, 0, 0, 0], [0, 0, 0, 0])],
  A: [shape([2, 1, 0, 0], [2, 1, 0, 0])],
  Dsus4: [shape([0, 2, 3, 0], [0, 1, 2, 0])],
};
const cavaquinho: Record<string, Shape[]> = {
  C: [
    shape([2, 0, 1, 2], [2, 0, 1, 3]),
    shape([5, 5, 5, 5], [1, 1, 1, 1], "Pestana na 5ª casa", {
      fret: 5,
      from: 0,
      to: 3,
    }),
  ],
  Am: [shape([2, 2, 1, 2], [2, 3, 1, 4])],
  Em7: [shape([2, 0, 0, 0], [2, 0, 0, 0])],
  Em: [shape([2, 0, 0, 2], [1, 0, 0, 2])],
  G: [shape([0, 0, 0, 0], [0, 0, 0, 0])],
  D: [shape([0, 2, 3, 4], [0, 1, 2, 3])],
  F: [shape([3, 2, 1, 3], [3, 2, 1, 4])],
  Am7: [
    shape([7, 5, 5, 5], [3, 1, 1, 1], "Pestana parcial na 5ª casa", {
      fret: 5,
      from: 1,
      to: 3,
    }),
  ],
};
export const catalog = { guitar, electric: guitar, ukulele, cavaquinho };
export function playedNotes(instrument: Instrument, s: Shape): number[] {
  return s.frets.flatMap((f, i) => (f < 0 ? [] : [instrument.tuning![i] + f]));
}
export function validShape(
  chord: Chord,
  instrument: Instrument,
  s: Shape,
): boolean {
  const notes = playedNotes(instrument, s);
  const pcs = notes.map(mod);
  return (
    notes.length > 0 &&
    pcs.every((pc) => chord.pcs.includes(pc)) &&
    chord.pcs.every((pc) => pcs.includes(pc)) &&
    (!chord.bass || mod(Math.min(...notes)) === pitch(chord.bass))
  );
}
export function shapesFor(chord: Chord, instrument: Instrument): Shape[] {
  if (chord.noteOnly || !(instrument.id in catalog)) return [];
  const table = catalog[instrument.id as keyof typeof catalog];
  const entry = Object.entries(table).find(([key]) => {
    const root = /^([A-G][#b]?)/.exec(key)![0];
    return (
      pitch(root) === chord.rootPc &&
      key.slice(root.length) ===
        chord.quality + (chord.bass ? "/" + chord.bass : "")
    );
  });
  return (entry?.[1] ?? []).filter((s) => validShape(chord, instrument, s));
}
export const richterBlow = [0, 4, 7, 12, 16, 19, 24, 28, 31, 36];
export const richterDraw = [2, 7, 11, 14, 17, 21, 23, 26, 29, 33];

export function studyVoicing(chord: Chord, instrument: Instrument): number[] {
  const max = instrument.id === "violin" ? 7 : 12;
  const available = instrument.tuning!.flatMap((m) =>
    Array.from({ length: max + 1 }, (_, f) => m + f),
  );
  return chord.pcs.map((pc) =>
    Math.min(...available.filter((m) => mod(m) === pc)),
  );
}
