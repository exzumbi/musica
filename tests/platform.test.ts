import test from "node:test";
import assert from "node:assert/strict";
import {
  detectPitch,
  centsFrom,
  frequencyToMidi,
  midiFrequency,
  stablePitch,
} from "../src/tools/pitch.ts";
import {
  meterParts,
  clickPlan,
  tapTempo,
  type MetroConfig,
} from "../src/tools/metronome.ts";
import {
  chordToken,
  transposeSymbol,
  classifyText,
  transposeInline,
  transposeChordLine,
  importSong,
  songAsChordPro,
  soundingKey,
} from "../src/platform/repertoire-model.ts";
import {
  baseState,
  readBackup,
  validateState,
} from "../src/platform/store-model.ts";
import {
  scaleNotes,
  rhythmTotal,
  rhythmValues,
  rhythmScore,
} from "../src/platform/learning-music.ts";
function signal(frequency: number, sampleRate = 48000, harmonic = false) {
  return Float32Array.from(
    { length: 4096 },
    (_, i) =>
      0.35 * Math.sin((2 * Math.PI * frequency * i) / sampleRate) +
      (harmonic
        ? 0.45 * Math.sin((4 * Math.PI * frequency * i) / sampleRate)
        : 0),
  );
}
test("Afinador: seis cordas padrão, Lá440, frequências fora da referência e dois Mis", () => {
  for (const rate of [44100, 48000])
    for (const midi of [40, 45, 50, 55, 59, 64, 69]) {
      const f = midiFrequency(midi);
      const p = detectPitch(signal(f, rate), rate);
      assert.ok(p, `Ausente ${midi} @ ${rate}`);
      assert.ok(
        Math.abs(centsFrom(p.frequency, midi)) < 3,
        `${midi}: ${p.frequency}`,
      );
      assert.ok(p.confidence > 0.95);
      assert.equal(Math.round(frequencyToMidi(p.frequency)), midi);
    }
  const detuned = detectPitch(
    signal(midiFrequency(40) * 2 ** (-18 / 1200)),
    48000,
  )!;
  assert.ok(Math.abs(centsFrom(detuned.frequency, 40) + 18) < 3);
  assert.equal(Math.round(frequencyToMidi(440, 442)), 69);
  assert.ok(Math.abs(centsFrom(442, 69, 442)) < 0.001);
});
test("Afinador rejeita silêncio e ruído, mantém fundamental com harmônicos e exige estabilidade", () => {
  assert.equal(detectPitch(new Float32Array(4096), 48000), null);
  let seed = 1;
  const noise = Float32Array.from({ length: 4096 }, () => {
    seed = (seed * 16807) % 2147483647;
    return (seed / 2147483647 - 0.5) * 0.2;
  });
  assert.equal(detectPitch(noise, 48000), null);
  for (const m of [40, 45, 64])
    assert.ok(
      Math.abs(
        centsFrom(
          detectPitch(signal(midiFrequency(m), 48000, true), 48000)!.frequency,
          m,
        ),
      ) < 4,
    );
  assert.equal(stablePitch([440, 440.1, 439.9]), false);
  assert.equal(stablePitch([440, 440.1, 439.9, 440, 440.1]), true);
  assert.equal(stablePitch([440, 460, 440, 440, 440]), false);
});
test("Metrônomo: durações, acentos, subdivisões, 6/8 e contagem de entrada", () => {
  const c: MetroConfig = {
    bpm: 120,
    meter: "4/4",
    division: "eighth",
    volume: 0.5,
    muted: false,
    countIn: true,
  };
  assert.deepEqual(meterParts("6/8", "eighth"), {
    beats: 2,
    parts: 3,
    unit: "semínima pontuada",
  });
  assert.equal(clickPlan(0, c).seconds, 0.25);
  assert.equal(clickPlan(0, c).accent, true);
  assert.equal(clickPlan(1, c).accent, false);
  assert.equal(clickPlan(7, c).counting, true);
  assert.equal(clickPlan(8, c).counting, false);
  assert.equal(clickPlan(8, c).accent, true);
  const six = { ...c, meter: "6/8" as const, division: "eighth" as const };
  assert.equal(clickPlan(0, six).seconds, 1 / 6);
  assert.equal(clickPlan(3, six).beat, 1);
  assert.equal(clickPlan(6, six).accent, true);
  assert.equal(meterParts("3/4", "triplet").parts, 3);
  assert.equal(meterParts("4/4", "sixteenth").parts, 4);
  assert.equal(meterParts("6/8", "sixteenth").parts, 6);
  assert.equal(tapTempo([0, 750, 1500, 2250]), 80);
  assert.equal(tapTempo([0]), null);
});
test("Transposição preserva extensões, grafia original e baixos invertidos", () => {
  for (const [from, to] of [
    ["C/E", "D/F#"],
    ["Bm7", "C#m7"],
    ["Cmaj7", "Dmaj7"],
    ["Am7(b5)", "Bm7(b5)"],
    ["F#7(b9)/A#", "G#7(b9)/C"],
    ["Dsus4", "Esus4"],
    ["Cdim7", "Ddim7"],
  ])
    assert.equal(transposeSymbol(from, 2), to);
  assert.equal(transposeSymbol("C/E", 1, "flat"), "Db/F");
  assert.equal(transposeSymbol("Dbmaj7/Ab", 0), "Dbmaj7/Ab");
  assert.equal(chordToken("Amor"), null);
  assert.equal(chordToken("Casa"), null);
});
test("Texto e ChordPro: letra intacta, revisão de linhas e metadados", () => {
  const text =
    "{title: Teste}\n{artist: Autora}\n{key: C}\n[C/E]A casa [Am7]é minha\nAmor e mar";
  const song = importSong(text);
  assert.equal(song.title, "Teste");
  assert.equal(song.key, "C");
  assert.equal(song.format, "chordpro");
  assert.equal(
    transposeInline(song.body, 2, "sharp"),
    "[D/F#]A casa [Bm7]é minha\nAmor e mar",
  );
  assert.equal(
    transposeInline(song.body, 2, "sharp").replace(/\[[^\]]+\]/g, ""),
    song.body.replace(/\[[^\]]+\]/g, ""),
  );
  const txt = classifyText("C     G/B\nA casa é minha\nAmor");
  assert.deepEqual(
    txt.map((l) => l.type),
    ["chords", "text", "text"],
  );
  assert.equal(transposeChordLine("C     G/B", 2, "sharp"), "D     A/C#");
  const roundtrip = importSong(songAsChordPro(song));
  assert.equal(roundtrip.body, song.body);
  assert.equal(roundtrip.artist, "Autora");
  assert.equal(soundingKey({ ...song, offset: 2, capo: 2 }), "E");
});
test("Exportação/importação validada preserva estudo, repertório, tom, listas e favoritos", () => {
  const state = baseState();
  state.completed = ["som"];
  state.notes = "Não perder esta anotação";
  state.songs[0].offset = 2;
  state.songs[0].capo = 1;
  state.lists = [
    { id: "list-1", name: "Estudar", songIds: [state.songs[0].id] },
  ];
  const input = {
    format: "dicionario-musical",
    version: 1,
    exportedAt: "2026-11-02",
    state,
    chordFavorites: ["Em7"],
    chordHistory: ["C/E"],
  };
  const output = readBackup(JSON.stringify(input));
  assert.deepEqual(output.state, state);
  assert.deepEqual(output.chordFavorites, ["Em7"]);
  assert.throws(() => readBackup("{}"));
  assert.throws(() =>
    validateState({
      ...state,
      songs: [{ ...state.songs[0], offset: Infinity }],
    }),
  );
  assert.throws(() =>
    validateState({
      ...state,
      lists: [{ id: "bad", name: "x", songIds: ["missing"] }],
    }),
  );
  assert.throws(() =>
    validateState({ ...state, songs: [{ ...state.songs[0], body: null }] }),
  );
});
test("Exemplos pedagógicos: escalas com grafia, pausas, avaliação relativa de ritmo", () => {
  assert.deepEqual(scaleNotes("F", "major"), [
    "F",
    "G",
    "A",
    "Bb",
    "C",
    "D",
    "E",
  ]);
  assert.deepEqual(scaleNotes("D", "dorian"), [
    "D",
    "E",
    "F",
    "G",
    "A",
    "B",
    "C",
  ]);
  assert.deepEqual(scaleNotes("C", "minor"), [
    "C",
    "D",
    "Eb",
    "F",
    "G",
    "Ab",
    "Bb",
  ]);
  assert.equal(
    rhythmTotal([rhythmValues[2], rhythmValues[0], rhythmValues[3]]),
    4,
  );
  assert.equal(rhythmScore([20, 770, 1520, 2270], 80)?.averageErrorMs, 0);
  assert.ok(rhythmScore([0, 500, 1250, 1800], 80)!.averageErrorMs > 100);
});
