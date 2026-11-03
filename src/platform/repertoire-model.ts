import { CHROMATIC, mod, pitch } from "../theory.ts";
export type ChordToken = { root: string; suffix: string; bass?: string };
// Preserve extensions without claiming a diagram exists for every extension.
export function chordToken(text: string): ChordToken | null {
  const m = /^([A-G](?:#|b)?)([^\s\[\]{}\/]*?)(?:\/([A-G](?:#|b)?))?$/.exec(
    text.trim(),
  );
  if (!m) return null;
  if (m[2] && !/^(?:m|maj|M|dim|aug|sus|add|no|[0-9+°ø(])/.test(m[2]))
    return null;
  if (!/^(?:(?:maj|dim|aug|sus|add|no|omit)|[mM0-9+#b°ø(),-])*$/.test(m[2]))
    return null;
  return { root: m[1], suffix: m[2], bass: m[3] };
}
export type AccidentalPreference = "sharp" | "flat";
export function transposeSymbol(
  symbol: string,
  delta: number,
  preference: AccidentalPreference = "sharp",
) {
  const c = chordToken(symbol);
  if (!c || delta === 0) return symbol;
  const names =
    preference === "flat"
      ? ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]
      : ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const root = names[mod(pitch(c.root) + delta)];
  const bass = c.bass ? "/" + names[mod(pitch(c.bass) + delta)] : "";
  return root + c.suffix + bass;
}
export type TextLine =
  | { type: "text"; text: string }
  | { type: "chords"; text: string }
  | { type: "inline"; text: string };
export function classifyText(body: string): TextLine[] {
  return body
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((text) => {
      if (/\[[^\]]+\]/.test(text)) return { type: "inline", text };
      const tokens = text.trim().split(/\s+/);
      return {
        type:
          tokens.length > 0 && tokens.every((t) => chordToken(t))
            ? "chords"
            : "text",
        text,
      };
    });
}
export function transposeChordLine(
  line: string,
  delta: number,
  preference: AccidentalPreference,
) {
  const matches = [...line.matchAll(/\S+/g)];
  let result = "";
  for (const match of matches) {
    const pos = match.index!;
    if (result.length < pos) result += " ".repeat(pos - result.length);
    else if (result.length) result += " ";
    result += transposeSymbol(match[0], delta, preference);
  }
  return result;
}
export function transposeInline(
  text: string,
  delta: number,
  preference: AccidentalPreference,
) {
  return text.replace(/\[([^\]]+)\]/g, (whole, symbol) =>
    chordToken(symbol)
      ? "[" + transposeSymbol(symbol, delta, preference) + "]"
      : whole,
  );
}
export type Song = {
  id: string;
  title: string;
  artist: string;
  version: string;
  source: string;
  key: string;
  body: string;
  format: "chordpro" | "txt";
  chordLines: number[];
  offset: number;
  preference: AccidentalPreference;
  fontSize: number;
  capo: number;
  favorite: boolean;
  notes: string;
};
export function importSong(body: string, fileName = "Minha música"): Song {
  const directives: Record<string, string> = {};
  for (const m of body.matchAll(
    /^\s*\{(title|t|artist|a|key|k|subtitle|st):\s*([^}]+)\}\s*$/gm,
  ))
    directives[m[1]] = m[2].trim();
  const content = body
    .replace(/^\s*\{(?:title|t|artist|a|key|k|subtitle|st):[^}]*\}\s*$/gm, "")
    .trim();
  const format = /\[[A-G][^\]]*\]/.test(content) ? "chordpro" : "txt";
  const chordLines = classifyText(content).flatMap((l, i) =>
    l.type === "chords" ? [i] : [],
  );
  return {
    id: crypto.randomUUID(),
    title:
      directives.title ||
      directives.t ||
      fileName.replace(/\.(?:txt|cho|crd|chordpro)$/i, ""),
    artist: directives.artist || directives.a || "",
    version: directives.subtitle || directives.st || "",
    source:
      "Importação pessoal — direitos sob responsabilidade de quem importa",
    key: directives.key || directives.k || "",
    body: content,
    format,
    chordLines,
    offset: 0,
    preference: "sharp",
    fontSize: 17,
    capo: 0,
    favorite: false,
    notes: "",
  };
}
export function songAsChordPro(song: Song) {
  const headers = [
    `{title: ${song.title}}`,
    song.artist ? `{artist: ${song.artist}}` : "",
    song.version ? `{subtitle: ${song.version}}` : "",
    song.key ? `{key: ${song.key}}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  return headers + "\n\n" + song.body;
}
export function soundingKey(song: Song) {
  return song.key
    ? transposeSymbol(song.key, song.offset + song.capo, song.preference)
    : "Tom de origem não informado";
}
export const ownExamples: Omit<Song, "id">[] = [
  {
    title: "Primeiro horizonte",
    artist: "Estudo original do Dicionário Musical",
    version: "Progressão introdutória · 4/4",
    source:
      "Letra e cifra originais criadas para esta plataforma; livres para estudo e adaptação.",
    key: "C",
    body: "{comment: Toque cada acorde por quatro pulsos.}\n[C]Uma nota abre o [Am]dia\n[F]Outra encontra o seu [G]lugar\n[C/E]Passo a passo, a harmo[Am]nia\n[F]Dá vontade de can[G]tar [C]",
    format: "chordpro",
    chordLines: [],
    offset: 0,
    preference: "sharp",
    fontSize: 17,
    capo: 0,
    favorite: false,
    notes: "",
  },
  {
    title: "Caminho de volta",
    artist: "Estudo original do Dicionário Musical",
    version: "Arpejos · 3/4",
    source: "Progressão instrumental original, sem letra de terceiros.",
    key: "Em",
    body: "{comment: Cada cifra ocupa um compasso de 3/4.}\n[Em7]  [Am7]  [D7]  [Gmaj7]\n[Cmaj7]  [Am7(b5)]  [B7]  [Em]",
    format: "chordpro",
    chordLines: [],
    offset: 0,
    preference: "sharp",
    fontSize: 17,
    capo: 0,
    favorite: false,
    notes: "",
  },
];
export const keyOptions = CHROMATIC.flatMap((n) => [n, n + "m"]);
