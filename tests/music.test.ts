import test from "node:test";
import assert from "node:assert/strict";
import {
  parse,
  makeChord,
  qualities,
  pianoVoicing,
  pitch,
  mod,
  transpose,
  octaveForNote,
} from "../src/theory.ts";
import {
  catalog,
  instruments,
  validShape,
  shapesFor,
  playedNotes,
} from "../src/instruments.ts";
test("Em7, Bm7 e Bmaj7 têm qualidades e alturas distintas", () => {
  assert.deepEqual(parse("Em7").chord?.notes, ["E", "G", "B", "D"]);
  assert.deepEqual(parse("Bm7").chord?.notes, ["B", "D", "F#", "A"]);
  assert.deepEqual(parse("Bmaj7").chord?.notes, ["B", "D#", "F#", "A#"]);
  assert.deepEqual(parse("BM7").choices, ["Bmaj7", "Bm7"]);
  assert.equal(parse("bm7").chord?.symbol, "Bm7");
});
test("Nomes em português, acidentes e enarmonias", () => {
  for (const [name, symbol] of [
    ["Dó maior", "C"],
    ["Lá menor", "Am"],
    ["Mi menor com sétima", "Em7"],
    ["Si menor com sétima", "Bm7"],
    ["Dó maior com sétima maior", "Cmaj7"],
  ])
    assert.equal(parse(name).chord?.symbol, symbol);
  assert.deepEqual(parse("F#").chord?.notes, ["F#", "A#", "C#"]);
  assert.deepEqual(parse("Gb").chord?.notes, ["Gb", "Bb", "Db"]);
  assert.deepEqual(parse("Caug").chord?.notes, ["C", "E", "G#"]);
  assert.deepEqual(parse("Bdim").chord?.notes, ["B", "D", "F"]);
  assert.deepEqual(parse("Am7(b5)").chord?.notes, ["A", "C", "Eb", "G"]);
});
test("Cifras, notas, rejeições e inversões", () => {
  assert.equal(parse("nota Dó").chord?.noteOnly, true);
  assert.equal(parse("C").chord?.noteOnly, false);
  assert.ok(parse("qualquer coisa").error);
  assert.ok(parse("C/H").error);
  assert.ok(parse("C/F#").error);
  const chord = parse("C/E").chord!;
  assert.equal(mod(pianoVoicing(chord)[0]), 4);
  assert.deepEqual(pianoVoicing(makeChord("E", "m7")), [52, 55, 59, 62]);
  for (let i = 0; i < 4; i++) {
    const v = pianoVoicing(makeChord("E", "m7"), i);
    assert.equal(mod(v[0]), [4, 7, 11, 2][i]);
    assert.ok(v.every((m, j) => !j || m > v[j - 1]));
  }
});
test("Todas as fórmulas, tônicas e inversões preservam alturas e grafias", () => {
  for (const root of [
    "C",
    "C#",
    "Db",
    "D",
    "D#",
    "Eb",
    "E",
    "F",
    "F#",
    "Gb",
    "G",
    "G#",
    "Ab",
    "A",
    "A#",
    "Bb",
    "B",
    "Cb",
  ]) {
    for (const key of Object.keys(qualities)) {
      const c = makeChord(root, key as keyof typeof qualities);
      assert.deepEqual(c.notes.map(pitch), c.pcs);
      assert.deepEqual(
        c.pcs,
        qualities[c.quality].intervals.map((i) => mod(c.rootPc + i)),
      );
      for (let inv = 0; inv < c.pcs.length; inv++)
        assert.deepEqual(
          [...new Set(pianoVoicing(c, inv).map(mod))].sort((a, b) => a - b),
          [...c.pcs].sort((a, b) => a - b),
        );
      assert.deepEqual(transpose(transpose(c, 1), -1).pcs, c.pcs);
    }
  }
});
for (const [id, table] of Object.entries(catalog)) {
  test(`Catálogo ${id}: cada posição contém todas e somente as alturas do acorde`, () => {
    const instrument = instruments.find((i) => i.id === id)!;
    for (const [symbol, shapes] of Object.entries(table)) {
      const chord = parse(symbol).chord!;
      for (const shape of shapes) {
        assert.ok(
          validShape(chord, instrument, shape),
          `${id} ${symbol}: ${playedNotes(instrument, shape)}`,
        );
        assert.equal(shape.frets.length, instrument.tuning!.length);
        assert.equal(shape.fingers.length, shape.frets.length);
        const fretted = shape.frets.filter((f) => f > 0);
        assert.ok(
          Math.max(...fretted) - Math.min(...fretted) <= 4,
          `${symbol}: alcance`,
        );
        assert.ok(shape.fingers.every((f) => f >= 0 && f <= 4));
      }
      assert.equal(shapesFor(chord, instrument).length, shapes.length);
    }
  });
}
test("Afinação reentrante e ausência de posições não geram resultados fictícios", () => {
  const uke = instruments.find((i) => i.id === "ukulele")!;
  const c = parse("C").chord!;
  assert.deepEqual(playedNotes(uke, shapesFor(c, uke)[0]), [67, 60, 64, 72]);
  assert.equal(shapesFor(parse("Dbaug").chord!, uke).length, 0);
  assert.equal(
    shapesFor(
      parse("Gb").chord!,
      instruments.find((i) => i.id === "guitar")!,
    ).length,
    1,
  );
});

test("Oitavas respeitam acidentes que cruzam Dó, inclusive Si sustenido e Dó bemol", () => {
  assert.equal(octaveForNote("Cb", 59), 4);
  assert.equal(octaveForNote("B#", 60), 3);
  assert.equal(octaveForNote("E", 52), 3);
  assert.equal(octaveForNote("D", 62), 4);
});
