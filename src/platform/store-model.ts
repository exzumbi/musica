import { ownExamples, type Song } from "./repertoire-model.ts";
import type { InstrumentId } from "../instruments.ts";
export type Page =
  | "practice"
  | "theory"
  | "classical"
  | "history"
  | "tools"
  | "repertoire"
  | "studies";
export type StudyList = { id: string; name: string; songIds: string[] };
export type LearningState = {
  version: 1;
  page: Page;
  lessonId: string;
  workId: string;
  periodId: string;
  completed: string[];
  favoriteWorks: string[];
  listeningNotes: Record<string, string>;
  notes: string;
  songs: Song[];
  lists: StudyList[];
  selectedSong: string;
  instrument: InstrumentId;
  lastVisited: string;
  lastLabel: string;
  sessionMinutes: number;
};
const pages: Page[] = [
  "practice",
  "theory",
  "classical",
  "history",
  "tools",
  "repertoire",
  "studies",
];
export function baseState(): LearningState {
  return {
    version: 1,
    page: "practice",
    lessonId: "som",
    workId: "bach",
    periodId: "baroque",
    completed: [],
    favoriteWorks: [],
    listeningNotes: {},
    notes: "",
    songs: ownExamples.map((s, i) => ({ ...s, id: "example-" + i })),
    lists: [],
    selectedSong: "example-0",
    instrument: "piano",
    lastVisited: "practice",
    lastLabel: "Explorar acordes",
    sessionMinutes: 15,
  };
}
export function validateState(value: unknown): LearningState {
  if (!value || typeof value !== "object")
    throw new Error("Arquivo de estudos inválido.");
  const s = value as LearningState;
  if (
    s.version !== 1 ||
    !pages.includes(s.page) ||
    !Array.isArray(s.songs) ||
    s.songs.length > 300 ||
    !Array.isArray(s.completed) ||
    !Array.isArray(s.favoriteWorks) ||
    !Array.isArray(s.lists) ||
    !s.listeningNotes ||
    typeof s.listeningNotes !== "object" ||
    typeof s.notes !== "string"
  )
    throw new Error("Formato ou versão de estudos não reconhecida.");
  const strings = (a: unknown) =>
    Array.isArray(a) &&
    a.length < 1000 &&
    a.every((x) => typeof x === "string" && x.length < 1000);
  if (
    !strings(s.completed) ||
    !strings(s.favoriteWorks) ||
    !Object.values(s.listeningNotes).every(
      (v) => typeof v === "string" && v.length < 100000,
    ) ||
    s.notes.length > 100000
  )
    throw new Error("Dados de progresso inválidos.");
  const ids = new Set<string>();
  for (const song of s.songs) {
    if (
      !song ||
      [
        "id",
        "title",
        "artist",
        "version",
        "source",
        "key",
        "body",
        "notes",
      ].some((k) => typeof song[k as keyof Song] !== "string") ||
      song.body.length > 200000 ||
      ids.has(song.id) ||
      !["chordpro", "txt"].includes(song.format) ||
      !["sharp", "flat"].includes(song.preference) ||
      !Array.isArray(song.chordLines) ||
      !song.chordLines.every(
        (n) => Number.isInteger(n) && n >= 0 && n < 100000,
      ) ||
      !Number.isInteger(song.offset) ||
      Math.abs(song.offset) > 48 ||
      !Number.isFinite(song.fontSize) ||
      song.fontSize < 12 ||
      song.fontSize > 32 ||
      !Number.isInteger(song.capo) ||
      song.capo < 0 ||
      song.capo > 12 ||
      typeof song.favorite !== "boolean"
    )
      throw new Error("Uma música possui dados inválidos.");
    ids.add(song.id);
  }
  if (
    !s.lists.every(
      (l) =>
        l &&
        typeof l.id === "string" &&
        typeof l.name === "string" &&
        strings(l.songIds) &&
        l.songIds.every((id) => ids.has(id)),
    )
  )
    throw new Error("Lista de estudo inválida.");
  if (
    ![
      "piano",
      "guitar",
      "electric",
      "cavaquinho",
      "ukulele",
      "bass",
      "violin",
      "harmonica",
      "percussion",
    ].includes(s.instrument) ||
    typeof s.lessonId !== "string" ||
    typeof s.selectedSong !== "string" ||
    typeof s.lastVisited !== "string" ||
    typeof s.lastLabel !== "string" ||
    ![10, 15, 20].includes(s.sessionMinutes)
  )
    throw new Error("Configurações de estudo inválidas.");
  return {
    ...s,
    workId: typeof s.workId === "string" ? s.workId : "bach",
    periodId: typeof s.periodId === "string" ? s.periodId : "baroque",
  };
}
export type Backup = {
  format: "dicionario-musical";
  version: 1;
  exportedAt: string;
  state: LearningState;
  chordFavorites: string[];
  chordHistory: string[];
};
function safeStrings(v: unknown): string[] {
  if (
    !Array.isArray(v) ||
    !v.every((x) => typeof x === "string" && x.length <= 100)
  )
    throw new Error("Favoritos ou histórico inválidos.");
  return v.slice(0, 1000);
}
export function readBackup(text: string): Backup {
  if (text.length > 5000000)
    throw new Error("Arquivo muito grande (máximo 5 MB).");
  const b = JSON.parse(text);
  if (b.format !== "dicionario-musical" || b.version !== 1)
    throw new Error("Esse arquivo não é uma exportação de estudos compatível.");
  return {
    ...b,
    state: validateState(b.state),
    chordFavorites: safeStrings(b.chordFavorites),
    chordHistory: safeStrings(b.chordHistory),
  };
}
export function downloadText(
  name: string,
  text: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
