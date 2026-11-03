export const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
export const PT = ["Dó", "Ré", "Mi", "Fá", "Sol", "Lá", "Si"];
export const NATURAL = [0, 2, 4, 5, 7, 9, 11];
export const mod = (n: number) => ((n % 12) + 12) % 12;
export const CHROMATIC = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];
export const qualities = {
  "": {
    name: "maior",
    intervals: [0, 4, 7],
    degrees: [0, 2, 4],
    formula: ["1", "3", "5"],
  },
  m: {
    name: "menor",
    intervals: [0, 3, 7],
    degrees: [0, 2, 4],
    formula: ["1", "♭3", "5"],
  },
  "7": {
    name: "com sétima dominante",
    intervals: [0, 4, 7, 10],
    degrees: [0, 2, 4, 6],
    formula: ["1", "3", "5", "♭7"],
  },
  m7: {
    name: "menor com sétima",
    intervals: [0, 3, 7, 10],
    degrees: [0, 2, 4, 6],
    formula: ["1", "♭3", "5", "♭7"],
  },
  maj7: {
    name: "maior com sétima maior",
    intervals: [0, 4, 7, 11],
    degrees: [0, 2, 4, 6],
    formula: ["1", "3", "5", "7"],
  },
  sus4: {
    name: "suspenso com quarta",
    intervals: [0, 5, 7],
    degrees: [0, 3, 4],
    formula: ["1", "4", "5"],
  },
  sus2: {
    name: "suspenso com segunda",
    intervals: [0, 2, 7],
    degrees: [0, 1, 4],
    formula: ["1", "2", "5"],
  },
  dim: {
    name: "diminuto",
    intervals: [0, 3, 6],
    degrees: [0, 2, 4],
    formula: ["1", "♭3", "♭5"],
  },
  aug: {
    name: "aumentado",
    intervals: [0, 4, 8],
    degrees: [0, 2, 4],
    formula: ["1", "3", "♯5"],
  },
  "m7(b5)": {
    name: "meio diminuto",
    intervals: [0, 3, 6, 10],
    degrees: [0, 2, 4, 6],
    formula: ["1", "♭3", "♭5", "♭7"],
  },
} as const;
export type Quality = keyof typeof qualities;
export type Chord = {
  symbol: string;
  root: string;
  rootPc: number;
  quality: Quality;
  bass?: string;
  noteOnly: boolean;
  notes: string[];
  pcs: number[];
  formula: readonly string[];
  name: string;
};
export function pitch(note: string): number {
  const i = LETTERS.indexOf(note[0].toUpperCase());
  return mod(
    NATURAL[i] +
      [...note.slice(1)].reduce(
        (a, c) => a + (c === "#" ? 1 : c === "b" ? -1 : 0),
        0,
      ),
  );
}
export function noteName(note: string, portuguese = true): string {
  return (
    (portuguese ? PT[LETTERS.indexOf(note[0])] : note[0]) +
    note.slice(1).replaceAll("#", "♯").replaceAll("b", "♭")
  );
}
export function spell(root: string, degree: number, interval: number) {
  const i = (LETTERS.indexOf(root[0]) + degree) % 7;
  let diff = mod(pitch(root) + interval - NATURAL[i]);
  if (diff > 6) diff -= 12;
  return LETTERS[i] + (diff > 0 ? "#".repeat(diff) : "b".repeat(-diff));
}
export function makeChord(
  root: string,
  quality: Quality = "",
  bass?: string,
  noteOnly = false,
): Chord {
  const q = qualities[quality];
  const notes = noteOnly
    ? [root]
    : q.intervals.map((n, i) => spell(root, q.degrees[i], n));
  return {
    root,
    rootPc: pitch(root),
    quality,
    bass,
    noteOnly,
    symbol:
      (noteOnly ? "Nota " : "") +
      root +
      (noteOnly ? "" : quality) +
      (bass ? "/" + bass : ""),
    notes,
    pcs: notes.map(pitch),
    formula: noteOnly ? ["1"] : q.formula,
    name:
      noteName(root) +
      (noteOnly ? " — nota isolada" : " " + q.name) +
      (bass ? " com baixo em " + noteName(bass) : ""),
  };
}
export type Parsed = { chord?: Chord; choices?: string[]; error?: string };
export function parse(input: string): Parsed {
  let s = input
    .trim()
    .replaceAll("♯", "#")
    .replaceAll("♭", "b")
    .replace(/\s+/g, " ");
  const noteOnly = /^nota\s/i.test(s);
  s = s.replace(/^nota\s+/i, "");
  const portuguese = /^(d[oó]|r[eé]|mi|f[aá]|sol|l[aá]|si)(?=[#b\s]|$)/i.exec(
    s,
  );
  if (portuguese) {
    const v = portuguese[1]
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    const roots: Record<string, string> = {
      do: "C",
      re: "D",
      mi: "E",
      fa: "F",
      sol: "G",
      la: "A",
      si: "B",
    };
    s = roots[v] + s.slice(portuguese[1].length);
  }
  const match = /^([a-gA-G])([#b]?)(.*)$/.exec(s);
  if (!match)
    return {
      error:
        "Não reconhecemos essa busca. Experimente Em7, Dó maior ou nota F#.",
    };
  const root = match[1].toUpperCase() + match[2];
  let suffix = match[3].trim();
  const bassMatch = /\/([A-Ga-g][#b]?)$/.exec(suffix);
  const bass = bassMatch
    ? bassMatch[1][0].toUpperCase() + bassMatch[1].slice(1)
    : undefined;
  if (bassMatch) suffix = suffix.slice(0, bassMatch.index).trim();
  if (suffix === "M7")
    return {
      choices: [
        root + "maj7" + (bass ? "/" + bass : ""),
        root + "m7" + (bass ? "/" + bass : ""),
      ],
    };
  const words = suffix
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const aliases: Record<string, Quality> = {
    maior: "",
    menor: "m",
    "menor com setima": "m7",
    "menor com setima menor": "m7",
    "maior com setima maior": "maj7",
    "maior com setima": "7",
    "com setima": "7",
    "suspenso com quarta": "sus4",
    diminuto: "dim",
    aumentado: "aug",
    "meio diminuto": "m7(b5)",
  };
  if (words in aliases) suffix = aliases[words];
  if (suffix === "ø" || suffix === "ø7") suffix = "m7(b5)";
  if (suffix === "+") suffix = "aug";
  if (suffix === "°") suffix = "dim";
  if (!(suffix in qualities) || (noteOnly && (suffix !== "" || bass)))
    return {
      error:
        "Esse tipo ainda não está disponível. Experimente maior, m, 7, m7, maj7, sus2, sus4, dim, aug ou m7(b5).",
    };
  const chord = makeChord(root, suffix as Quality, bass, noteOnly);
  if (bass && !chord.pcs.includes(pitch(bass)))
    return {
      error:
        "Nesta versão, o baixo deve ser uma nota do acorde. Experimente C/E ou C/G.",
    };
  return { chord };
}
export function pianoVoicing(chord: Chord, inversion = 0): number[] {
  const first = chord.bass
    ? chord.pcs.indexOf(pitch(chord.bass))
    : inversion % chord.pcs.length;
  const pcs = [...chord.pcs.slice(first), ...chord.pcs.slice(0, first)];
  let previous = 47;
  return pcs.map((pc) => {
    let midi = 48 + pc;
    while (midi <= previous) midi += 12;
    previous = midi;
    return midi;
  });
}
export function transpose(chord: Chord, delta: number): Chord {
  return makeChord(
    CHROMATIC[mod(chord.rootPc + delta)],
    chord.quality,
    chord.bass ? CHROMATIC[mod(pitch(chord.bass) + delta)] : undefined,
    chord.noteOnly,
  );
}
export function noteForMidi(chord: Chord, midi: number): string {
  const i = chord.pcs.indexOf(mod(midi));
  return i >= 0 ? chord.notes[i] : CHROMATIC[mod(midi)];
}

export function octaveForNote(note: string, midi: number): number {
  const natural = NATURAL[LETTERS.indexOf(note[0])];
  const accidental = [...note.slice(1)].reduce(
    (sum, c) => sum + (c === "#" ? 1 : c === "b" ? -1 : 0),
    0,
  );
  return Math.round((midi - natural - accidental) / 12) - 1;
}
