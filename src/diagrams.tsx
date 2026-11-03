import { useState } from "react";
import {
  CHROMATIC,
  mod,
  noteForMidi,
  noteName,
  octaveForNote,
  pianoVoicing,
  type Chord,
} from "./theory.ts";
import {
  playedNotes,
  shapesFor,
  richterBlow,
  richterDraw,
  type Instrument,
  type Shape,
} from "./instruments.ts";
export function Piano({
  chord,
  inversion,
  names,
}: {
  chord: Chord;
  inversion: number;
  names: boolean;
}) {
  const pressed = pianoVoicing(chord, inversion);
  const white = Array.from({ length: 36 }, (_, i) => 48 + i).filter(
    (m) => ![1, 3, 6, 8, 10].includes(mod(m)),
  );
  return (
    <div className="piano-scroll">
      <svg
        className="piano-svg"
        viewBox="0 0 756 240"
        role="img"
        aria-label={`Teclado: ${pressed.map((m) => noteName(noteForMidi(chord, m)) + octaveForNote(noteForMidi(chord, m), m)).join(", ")}`}
      >
        <defs>
          <linearGradient id="white-key" x2="0" y2="1">
            <stop stopColor="#fff" />
            <stop offset="1" stopColor="#d8d7e2" />
          </linearGradient>
          <linearGradient id="black-key" x2="0" y2="1">
            <stop stopColor="#30303b" />
            <stop offset="1" stopColor="#16161e" />
          </linearGradient>
        </defs>
        {white.map((m, i) => {
          const on = pressed.includes(m);
          return (
            <g key={m}>
              <rect
                x={i * 36 + 1}
                y="10"
                width="34"
                height="199"
                rx="5"
                fill={on ? "#b4a0ff" : "url(#white-key)"}
                stroke={on ? "#d5c8ff" : "#aaa8b5"}
              />
              {on && <circle cx={i * 36 + 18} cy="151" r="4" fill="#5837a4" />}
              <text
                x={i * 36 + 18}
                y="184"
                textAnchor="middle"
                fill={on ? "#33205f" : "#686576"}
                fontSize="10"
                fontWeight={on ? 700 : 500}
              >
                {names
                  ? noteName(noteForMidi(chord, m))
                  : noteForMidi(chord, m)}
              </text>
              {(on || mod(m) === 0) && (
                <text
                  x={i * 36 + 18}
                  y="229"
                  textAnchor="middle"
                  fill="#898497"
                  fontSize="10"
                >
                  {octaveForNote(noteForMidi(chord, m), m)}ª
                </text>
              )}
            </g>
          );
        })}
        {Array.from({ length: 36 }, (_, i) => 48 + i)
          .filter((m) => [1, 3, 6, 8, 10].includes(mod(m)))
          .map((m) => {
            const i = white.filter((w) => w < m).length;
            const on = pressed.includes(m);
            return (
              <g key={m}>
                <rect
                  x={i * 36 - 12}
                  y="10"
                  width="24"
                  height="123"
                  rx="4"
                  fill={on ? "#8f6de9" : "url(#black-key)"}
                  stroke={on ? "#cdb9ff" : "#0b0b10"}
                />
                {on && (
                  <text
                    x={i * 36}
                    y="112"
                    fill="white"
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {names
                      ? noteName(noteForMidi(chord, m))
                      : noteForMidi(chord, m)}
                  </text>
                )}
              </g>
            );
          })}
      </svg>
    </div>
  );
}
export function Frets({
  instrument,
  shape,
  chord,
  left,
  names,
}: {
  instrument: Instrument;
  shape: Shape;
  chord: Chord;
  left: boolean;
  names: boolean;
}) {
  const n = shape.frets.length;
  const positive = shape.frets.filter((f) => f > 0);
  const start = Math.min(...positive) > 4 ? Math.min(...positive) : 1;
  const rows = Math.max(4, Math.max(...positive) - start + 1);
  const x = (i: number) => 65 + (left ? n - 1 - i : i) * 52;
  const width = 130 + (n - 1) * 52;
  const height = 120 + rows * 48;
  return (
    <svg
      className="chord-svg"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`${chord.symbol}, ${shape.label}. Cordas da grave à aguda: ${shape.frets.map((f) => (f < 0 ? "abafada" : f === 0 ? "solta" : "casa " + f)).join(", ")}`}
    >
      <text x="14" y="108" fill="#a39bb4" fontSize="13">
        {start}ª
      </text>
      {Array.from({ length: rows + 1 }, (_, i) => (
        <line
          key={i}
          x1="65"
          x2={width - 65}
          y1={80 + i * 48}
          y2={80 + i * 48}
          stroke={i === 0 && start === 1 ? "#c0b8cf" : "#514959"}
          strokeWidth={i === 0 && start === 1 ? 6 : 2}
        />
      ))}
      {shape.frets.map((f, i) => (
        <g key={i}>
          <line
            x1={x(i)}
            x2={x(i)}
            y1="80"
            y2={80 + rows * 48}
            stroke="#756b83"
            strokeWidth={2 - i * 0.14}
          />
          <text
            x={x(i)}
            y="53"
            textAnchor="middle"
            fill={f < 0 ? "#766c86" : "#cab7ff"}
            fontSize="20"
          >
            {f < 0 ? "×" : f === 0 ? "○" : ""}
          </text>
          <text
            x={x(i)}
            y={110 + rows * 48}
            textAnchor="middle"
            fill={f < 0 ? "#6c657b" : "#d7ccec"}
            fontSize="12"
          >
            {f < 0
              ? "—"
              : names
                ? noteName(noteForMidi(chord, instrument.tuning![i] + f))
                : noteForMidi(chord, instrument.tuning![i] + f)}
          </text>
        </g>
      ))}
      {shape.barre && (
        <rect
          x={Math.min(x(shape.barre.from), x(shape.barre.to)) - 15}
          y={80 + (shape.barre.fret - start + 0.5) * 48 - 15}
          width={Math.abs(x(shape.barre.to) - x(shape.barre.from)) + 30}
          height="30"
          rx="15"
          fill="#a98ae9"
        />
      )}
      {shape.frets.map(
        (f, i) =>
          f > 0 && (
            <g key={i}>
              <circle
                cx={x(i)}
                cy={80 + (f - start + 0.5) * 48}
                r="16"
                fill="#bba0ff"
              />
              <text
                x={x(i)}
                y={85 + (f - start + 0.5) * 48}
                textAnchor="middle"
                fontSize="13"
                fontWeight="700"
                fill="#241736"
              >
                {shape.fingers[i]}
              </text>
            </g>
          ),
      )}
    </svg>
  );
}
export function StudyBoard({
  chord,
  instrument,
  names,
  left = false,
}: {
  chord: Chord;
  instrument: Instrument;
  names: boolean;
  left?: boolean;
}) {
  const violin = instrument.id === "violin";
  const max = violin ? 7 : 12;
  const tuning = instrument.tuning!;
  return (
    <div className="study-board-scroll">
      <svg
        viewBox={`0 0 750 ${65 + tuning.length * 47}`}
        role="img"
        aria-label={`${instrument.name}: localização das notas para estudo individual e arpejos`}
        className="study-board"
      >
        {Array.from({ length: max + 1 }, (_, f) => (
          <g key={f}>
            <line
              x1={80 + f * 50}
              x2={80 + f * 50}
              y1="35"
              y2={30 + tuning.length * 47}
              stroke={violin ? "#3d354a" : "#5e526e"}
              strokeDasharray={violin ? "3 5" : undefined}
            />
            <text
              x={80 + (left ? max - f : f) * 50}
              y="20"
              fill="#958ba6"
              textAnchor="middle"
              fontSize="11"
            >
              {f === 0 ? "Solta" : violin ? "+" + f : f}
            </text>
          </g>
        ))}
        {tuning.map((m, i) => (
          <g key={i}>
            <text x="30" y={63 + i * 47} fill="#ccc0df" fontSize="12">
              {CHROMATIC[mod(m)]}
              {Math.floor(m / 12) - 1}
            </text>
            <line
              x1="80"
              x2={80 + max * 50}
              y1={59 + i * 47}
              y2={59 + i * 47}
              stroke="#7b6b8b"
            />
            {Array.from({ length: max + 1 }, (_, f) => {
              const pc = mod(m + f);
              if (!chord.pcs.includes(pc)) return null;
              const j = chord.pcs.indexOf(pc);
              return (
                <g key={f}>
                  <circle
                    cx={80 + (left ? max - f : f) * 50}
                    cy={59 + i * 47}
                    r="17"
                    fill={j === 0 ? "#b69aff" : "#51416c"}
                  />
                  <text
                    x={80 + (left ? max - f : f) * 50}
                    y={63 + i * 47}
                    textAnchor="middle"
                    fill={j === 0 ? "#20152f" : "#f1eaff"}
                    fontSize="10"
                  >
                    {names ? noteName(chord.notes[j]) : chord.notes[j]}
                  </text>
                  <text
                    x={80 + (left ? max - f : f) * 50}
                    y={85 + i * 47}
                    textAnchor="middle"
                    fill="#aea1c2"
                    fontSize="8"
                  >
                    {chord.formula[j]}
                    {violin && f > 0
                      ? " · dedo " + (f <= 2 ? 1 : f <= 4 ? 2 : f <= 6 ? 3 : 4)
                      : ""}
                  </text>
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}
export function Harmonica({
  chord,
  onNotes,
}: {
  chord: Chord;
  onNotes?: (notes: number[]) => void;
}) {
  const [kind, setKind] = useState("");
  const [key, setKey] = useState("");
  const root = CHROMATIC.indexOf(key);
  const base = (root >= 7 ? 48 : 60) + Math.max(root, 0);
  const available = [...richterBlow, ...richterDraw]
    .map((n) => base + n)
    .filter((m) => chord.pcs.includes(mod(m)));
  const missing = chord.pcs.filter(
    (pc) => !available.some((m) => mod(m) === pc),
  );
  return (
    <div className="harmonica">
      <div className="inline-controls">
        <label>
          Tipo
          <select
            aria-label="Tipo da gaita"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            <option value="">Selecione o tipo</option>
            <option value="richter">Diatônica Richter · 10 furos</option>
            <option value="chromatic">Cromática — indisponível</option>
          </select>
        </label>
        <label>
          Tonalidade
          <select
            aria-label="Tonalidade da gaita"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          >
            <option value="">Selecione a tonalidade</option>
            {CHROMATIC.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </label>
      </div>
      {!kind || !key ? (
        <p className="notice">
          Escolha o tipo e a tonalidade antes de consultar as posições.
        </p>
      ) : kind !== "richter" ? (
        <p className="notice">
          Mapeamento de gaita cromática ainda não implementado.
        </p>
      ) : (
        <>
          <p className="muted">
            Registro padrão · tônica {key}
            {Math.floor(base / 12) - 1}. Apenas notas naturais, sem bends.
          </p>
          <div className="hole-scroll">
            <table className="holes">
              <thead>
                <tr>
                  <th>Furo</th>
                  {richterBlow.map((_, i) => (
                    <th key={i}>{i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[richterBlow, richterDraw].map((row, i) => (
                  <tr key={i}>
                    <th>{i === 0 ? "↑ Sopro" : "↓ Aspiração"}</th>
                    {row.map((n, j) => (
                      <td
                        key={j}
                        className={
                          chord.pcs.includes(mod(base + n)) ? "lit" : ""
                        }
                      >
                        {noteName(noteForMidi(chord, base + n))}
                        <small>
                          {octaveForNote(
                            noteForMidi(chord, base + n),
                            base + n,
                          )}
                        </small>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="notice">
            {missing.length
              ? "Notas não disponíveis sem técnicas adicionais: " +
                missing
                  .map((pc) => noteName(chord.notes[chord.pcs.indexOf(pc)]))
                  .join(", ") +
                "."
              : "As alturas do acorde estão disponíveis como notas individuais."}{" "}
            O mapa não representa um acorde simultâneo: os furos podem exigir
            direções de ar diferentes. Bends e overblows não estão mapeados.
          </p>
          {onNotes && (
            <button
              className="secondary"
              onClick={() =>
                onNotes(
                  available.filter(
                    (n, i, a) => a.findIndex((x) => mod(x) === mod(n)) === i,
                  ),
                )
              }
            >
              Ouvir notas acessíveis
            </button>
          )}
        </>
      )}
    </div>
  );
}
export function Percussion() {
  const [beat, setBeat] = useState<number | undefined>();
  const hits = [
    "Grave",
    "Ponta",
    "Tapa",
    "Ponta",
    "Grave",
    "Ponta",
    "Tapa",
    "Ponta",
  ];
  return (
    <div className="percussion">
      <div className="tambourine">◉</div>
      <h3>O ritmo também tem seu lugar.</h3>
      <p>
        O pandeiro não tem altura definida: cifras e posições de acordes não se
        aplicam. Explore um padrão introdutório de samba em 2/4.
      </p>
      <div className="rhythm">
        {hits.map((h, i) => (
          <button
            key={i}
            className={beat === i ? "active" : ""}
            onClick={() => setBeat(i)}
          >
            <small>
              {i < 4 ? "1" : "2"}
              {["", "e", "&", "a"][i % 4]}
            </small>
            {h}
          </button>
        ))}
      </div>
      <p className="muted">
        Toque cada subdivisão devagar no instrumento. Grave: polegar na borda.
        Ponta: dedos na borda. Tapa: mão mais aberta na pele. Os blocos marcam o
        estudo visual; não geram som.
      </p>
    </div>
  );
}
export function Diagram({
  chord,
  instrument,
  inversion = 0,
  position = 0,
  left = false,
  names = true,
  onNotes,
}: {
  chord: Chord;
  instrument: Instrument;
  inversion?: number;
  position?: number;
  left?: boolean;
  names?: boolean;
  onNotes?: (n: number[]) => void;
}) {
  if (instrument.id === "piano")
    return <Piano {...{ chord, inversion, names }} />;
  if (instrument.id === "harmonica")
    return <Harmonica chord={chord} onNotes={onNotes} />;
  if (instrument.id === "percussion") return <Percussion />;
  if (instrument.id === "bass" || instrument.id === "violin" || chord.noteOnly)
    return (
      <>
        <StudyBoard {...{ chord, instrument, names, left }} />
        <p className="diagram-footnote">
          {instrument.id === "violin"
            ? "Referências de semitons na primeira posição, sem trastes reais. Dedos indicam regiões aproximadas; ajuste a afinação pelo ouvido. Estudo de notas e arpejos, sem acordes simultâneos."
            : "Mapa de notas para tocar individualmente ou em arpejo; não é uma posição de acorde simultâneo."}
        </p>
      </>
    );
  const shapes = shapesFor(chord, instrument);
  const shape = shapes[position % shapes.length];
  return shape ? (
    <>
      <Frets {...{ instrument, shape, chord, left, names }} />
      <div className="fret-legend">
        <span>○ Corda solta</span>
        <span>× Corda abafada</span>
        <span>● Número do dedo</span>
      </div>
      <p className="diagram-footnote">
        {shape.label} · {playedNotes(instrument, shape).length} cordas tocadas.{" "}
        {shape.barre ? "Faixa roxa: pestana. " : ""}Dedos: 1 indicador, 2 médio,
        3 anelar, 4 mínimo.
      </p>
    </>
  ) : (
    <div className="empty-diagram">
      <span>♧</span>
      <h3>Essa posição ainda não está no catálogo.</h3>
      <p>
        A teoria está disponível, mas não temos uma digitação cadastrada para{" "}
        {chord.symbol} no {instrument.name.toLowerCase()}. Explore no piano ou
        experimente Em7, C, Am, D ou G.
      </p>
    </div>
  );
}
