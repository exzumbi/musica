import { useEffect, useState } from "react";
import {
  playAudio as rawPlayAudio,
  playSequence as rawPlaySequence,
  stopAudio,
  setAudioVolume,
  type SoundEvent,
} from "../audio.ts";
import {
  CHROMATIC,
  mod,
  noteName,
  makeChord,
  pianoVoicing,
  pitch,
  LETTERS,
} from "../theory.ts";
import { Piano } from "../diagrams.tsx";
import {
  scaleNotes,
  scaleMidi,
  rhythmValues,
  rhythmTotal,
  rhythmScore,
  type RhythmValue,
  type ScaleMode,
} from "./learning-music.ts";
import type { Lesson } from "./content.ts";
import type { Tool } from "../tools/Tools.tsx";

function reportAudio() {
  window.dispatchEvent(
    new CustomEvent("dm-audio-error", {
      detail:
        "Não foi possível iniciar o som. Verifique se o navegador permite áudio.",
    }),
  );
}
let studyVolume = 0.5;
let lastRequestedVolume = 0.5;
export const playStudySequence = (
  ...args: Parameters<typeof rawPlaySequence>
) => {
  lastRequestedVolume = args[1] ?? 0.5;
  args[1] = (lastRequestedVolume * studyVolume) / 0.5;
  return rawPlaySequence(...args).catch(reportAudio);
};
const playSequence = playStudySequence;
const playAudio = (...args: Parameters<typeof rawPlayAudio>) => {
  lastRequestedVolume = args[1];
  args[1] = (args[1] * studyVolume) / 0.5;
  return rawPlayAudio(...args).catch(reportAudio);
};
const say = (notes: number[], arpeggio = true) =>
  playAudio(notes, 0.5, arpeggio, () => {});
type Props = {
  lesson: Lesson;
  success: () => void;
  practice: (s: string) => void;
  tool: (t: Tool) => void;
};
export function Lab(props: Props) {
  switch (props.lesson.lab) {
    case "sound":
      return <SoundLab success={props.success} />;
    case "notes":
      return <StaffLab success={props.success} />;
    case "pulse":
      return <PulseLab success={props.success} tool={props.tool} />;
    case "steps":
      return <StepsLab success={props.success} />;
    case "rhythm":
      return <RhythmLab success={props.success} />;
    case "interval":
      return <EarLab success={props.success} />;
    case "scale":
      return <ScaleLab success={props.success} />;
    case "chord":
      return <ChordLab success={props.success} practice={props.practice} />;
    case "inversion":
      return <InversionLab success={props.success} />;
    case "key":
      return <KeyLab success={props.success} practice={props.practice} />;
    case "cadence":
      return <SequenceLab success={props.success} practice={props.practice} />;
    case "mode":
      return <ModeLab success={props.success} />;
  }
}
function Feedback({ text }: { text: string }) {
  return text ? (
    <p className="exercise-feedback" role="status">
      {text}
    </p>
  ) : null;
}
function SoundLab({ success }: { success: () => void }) {
  const [duration, setDuration] = useState(0.6);
  const [volume, setVolume] = useState(0.4);
  const [wave, setWave] = useState<OscillatorType>("sine");
  const [message, setMessage] = useState("");
  const [heard, setHeard] = useState<number[]>([]);
  function play(midi: number) {
    setHeard((a) => [...a, midi]);
    void playSequence([{ midi, at: 0, duration, wave }], volume);
  }
  return (
    <>
      <div className="control-row">
        <label>
          Duração · {duration.toFixed(1)} s
          <input
            aria-label="Duração do som"
            type="range"
            min=".2"
            max="2"
            step=".1"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </label>
        <label>
          Intensidade
          <input
            aria-label="Intensidade do som"
            type="range"
            min=".1"
            max=".8"
            step=".05"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </label>
        <label>
          Timbre sintetizado
          <select
            value={wave}
            onChange={(e) => setWave(e.target.value as OscillatorType)}
          >
            <option value="sine">Senoidal</option>
            <option value="triangle">Triangular</option>
            <option value="square">Quadrado</option>
          </select>
        </label>
      </div>
      <div className="sound-comparison">
        <button onClick={() => play(48)}>
          <span>∿</span>
          <strong>Som A</strong>
          <small>Dó3 · 130,8 Hz</small>
        </button>
        <button onClick={() => play(72)}>
          <span>∿∿</span>
          <strong>Som B</strong>
          <small>Dó5 · 523,3 Hz</small>
        </button>
      </div>
      <p>Qual dos dois é mais agudo?</p>
      <div className="button-row">
        {["Som A", "Som B"].map((s, i) => (
          <button
            className="secondary"
            key={s}
            onClick={() => {
              if (!heard.includes(48) || !heard.includes(72)) {
                setMessage("Ouça os dois sons antes de comparar.");
                return;
              }
              if (i === 1) {
                success();
                setMessage(
                  "Isso! B tem frequência maior. Alterar o volume não muda essa relação.",
                );
              } else
                setMessage(
                  "A tem frequência menor: é o mais grave. Repita B e compare sem aumentar o volume.",
                );
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <Feedback text={message} />
    </>
  );
}
const naturals = [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77];
function StaffLab({ success }: { success: () => void }) {
  const [midi, setMidi] = useState(60);
  const [message, setMessage] = useState("");
  const name = CHROMATIC[mod(midi)];
  const octave = Math.floor(midi / 12) - 1;
  const degree = (octave - 4) * 7 + LETTERS.indexOf(name[0]);
  const y = 144 - degree * 9;
  const ledger: number[] = [];
  for (let line = 144; line <= y; line += 18) ledger.push(line);
  for (let line = 36; line >= y; line -= 18) ledger.push(line);
  function change(n: number) {
    setMidi(Math.min(77, Math.max(60, n)));
    void say([Math.min(77, Math.max(60, n))], false);
  }
  function step(d: number) {
    const current = naturals.findIndex((n) => n >= midi);
    const index = current < 0 ? naturals.length - 1 : current;
    change(naturals[Math.min(naturals.length - 1, Math.max(0, index + d))]);
  }
  return (
    <>
      <div className="staff-wrap">
        <svg
          viewBox="0 0 520 185"
          role="img"
          aria-label={`Pauta na clave de Sol: ${noteName(name)}${octave}. Clique em uma altura ou use os botões para mover a nota.`}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const target = ((e.clientY - rect.top) / rect.height) * 185;
            const i = Math.max(
              0,
              Math.min(naturals.length - 1, Math.round((144 - target) / 9)),
            );
            change(naturals[i]);
          }}
        >
          {[54, 72, 90, 108, 126].map((line) => (
            <line
              key={line}
              x1="25"
              x2="495"
              y1={line}
              y2={line}
              stroke="#9985b1"
            />
          ))}
          <text x="40" y="124" fill="#d3b9f3" fontSize="78">
            𝄞
          </text>
          {ledger.map((line) => (
            <line
              key={line}
              x1="244"
              x2="285"
              y1={line}
              y2={line}
              stroke="#d9bfef"
            />
          ))}
          <ellipse
            cx="264"
            cy={y}
            rx="13"
            ry="9"
            transform={`rotate(-15 264 ${y})`}
            fill="#c4a1f3"
          />
          <line
            x1="276"
            x2="276"
            y1={y - 2}
            y2={y - 55}
            stroke="#c4a1f3"
            strokeWidth="3"
          />
          {name.length > 1 && (
            <text x="230" y={y + 6} fill="#e0c6f7" fontSize="28">
              {name.includes("#") ? "♯" : "♭"}
            </text>
          )}
          <text x="345" y="160" fill="#ad98c1" fontSize="13">
            {noteName(name)}
            {octave}
          </text>
        </svg>
      </div>
      <div
        className="mini-keyboard"
        role="group"
        aria-label="Teclas de Dó4 a Dó5"
      >
        {Array.from({ length: 13 }, (_, i) => 60 + i).map((m) => (
          <button
            key={m}
            aria-label={
              "Tocar " + noteName(CHROMATIC[mod(m)]) + (Math.floor(m / 12) - 1)
            }
            className={
              (CHROMATIC[mod(m)].length > 1 ? "black " : "") +
              (midi === m ? "selected" : "")
            }
            onClick={() => change(m)}
          >
            {noteName(CHROMATIC[mod(m)])}
          </button>
        ))}
      </div>
      <div className="button-row">
        <button className="secondary" onClick={() => step(-1)}>
          ↓ Descer na pauta
        </button>
        <button className="secondary" onClick={() => step(1)}>
          ↑ Subir na pauta
        </button>
        <label className="sr-only">
          Mover nota com setas
          <input
            type="range"
            min="0"
            max={naturals.length - 1}
            value={Math.max(0, naturals.indexOf(midi))}
            onChange={(e) => change(naturals[Number(e.target.value)])}
          />
        </label>
        <button
          className="primary"
          onClick={() => {
            if (midi === 67) {
              success();
              setMessage(
                "Sol4: segunda linha de baixo para cima. A posição e o som agora estão conectados.",
              );
            } else
              setMessage(
                "Procure Sol4: fica na segunda linha de baixo para cima. Use os botões ou a tecla Sol.",
              );
          }}
        >
          Verificar Sol4
        </button>
      </div>
      <Feedback text={message} />
    </>
  );
}
function PulseLab({
  success,
  tool,
}: {
  success: () => void;
  tool: (t: Tool) => void;
}) {
  const [taps, setTaps] = useState<number[]>([]);
  const [message, setMessage] = useState("");
  const [latency, setLatency] = useState(0);
  const bpm = 80;
  function tap() {
    const now = performance.now() - latency;
    setTaps((a) => [...a, now].slice(-9));
  }
  const score = rhythmScore(taps, bpm);
  return (
    <>
      <div className="button-row">
        <button
          className="secondary"
          onClick={() =>
            void playSequence(
              Array.from({ length: 8 }, (_, i) => ({
                midi: i % 4 ? 84 : 91,
                at: i * 0.75,
                duration: 0.06,
              })),
              0.5,
            )
          }
        >
          Ouvir 8 pulsos a 80 BPM
        </button>
        <button className="text-button" onClick={() => tool("metronome")}>
          Abrir metrônomo
        </button>
      </div>
      <button className="tap-pad" onClick={tap}>
        Bata o pulso{" "}
        <span>{taps.length} toques · clique ou barra de espaço com foco</span>
      </button>
      <div className="control-row">
        <label>
          Compensação estimada de latência · {latency} ms
          <input
            aria-label="Compensação de latência"
            type="range"
            min="-200"
            max="200"
            step="10"
            value={latency}
            onChange={(e) => {
              setLatency(Number(e.target.value));
              setTaps([]);
            }}
          />
        </label>
      </div>
      <p className="muted">
        A análise compara intervalos entre seus toques, não sincronismo absoluto
        com a saída de som. Atrasos constantes se cancelam; atrasos variáveis do
        aparelho ainda afetam a medida. Não é uma avaliação clínica ou de
        precisão.
      </p>
      <div className="button-row">
        <button
          className="primary"
          onClick={() => {
            if (!score || taps.length < 5) {
              setMessage("Faça ao menos cinco toques para avaliar.");
              return;
            }
            if (score.averageErrorMs < 140) {
              success();
              setMessage(
                `Bom início: desvio médio de ${score.averageErrorMs} ms entre pulsos. Continue com conforto.`,
              );
            } else
              setMessage(
                `Desvio médio aproximado: ${score.averageErrorMs} ms. Tente reduzir a pressa e deixar os espaços mais regulares. Você pode repetir sem limite.`,
              );
          }}
        >
          Avaliar pulsação
        </button>
        <button
          className="secondary"
          onClick={() => {
            setTaps([]);
            setMessage("");
          }}
        >
          Recomeçar
        </button>
      </div>
      <Feedback text={message} />
    </>
  );
}
function StepsLab({ success }: { success: () => void }) {
  const [target, setTarget] = useState(61);
  const [message, setMessage] = useState("");
  return (
    <>
      <div className="interval-distance">
        <span>Dó4</span>
        <div>
          {Array.from({ length: target - 60 }, (_, i) => (
            <i key={i}>½</i>
          ))}
        </div>
        <span>{noteName(CHROMATIC[mod(target)])}4</span>
      </div>
      <div className="control-row">
        <label>
          Segunda nota
          <select
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
          >
            {[61, 62, 63, 64, 65, 67].map((m) => (
              <option key={m} value={m}>
                {noteName(CHROMATIC[mod(m)])}4
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="button-row">
        <button className="secondary" onClick={() => void say([60, target])}>
          Ouvir as duas notas
        </button>
        <button
          className="primary"
          onClick={() => {
            if (target === 62) {
              success();
              setMessage(
                "Dó–Ré: dois semitons, um tom. Você incluiu a tecla Dó♯ no caminho.",
              );
            } else
              setMessage(
                `Essa distância tem ${target - 60} semitons. Um tom precisa de dois: escolha Ré.`,
              );
          }}
        >
          Verificar um tom
        </button>
      </div>
      <Feedback text={message} />
    </>
  );
}
function RhythmLab({ success }: { success: () => void }) {
  const [values, setValues] = useState<RhythmValue[]>([]);
  const [message, setMessage] = useState("");
  const total = rhythmTotal(values);
  function listen() {
    let at = 0;
    const events: SoundEvent[] = [];
    for (const v of values) {
      if (!v.rest)
        events.push({ midi: 60, at, duration: v.beats * 0.6 * 0.85 });
      at += v.beats * 0.6;
    }
    void playSequence(events, 0.5);
  }
  return (
    <>
      <div className="rhythm-palette">
        {rhythmValues.map((v) => (
          <button
            key={v.name}
            aria-label={"Adicionar " + v.name}
            onClick={() => {
              if (total + v.beats <= 8) setValues((a) => [...a, v]);
            }}
          >
            <span>{v.symbol}</span>
            <strong>{v.name}</strong>
            <small>
              {v.beats} pulso{v.beats !== 1 ? "s" : ""}
            </small>
          </button>
        ))}
      </div>
      <div className="rhythm-measure" aria-label="Compasso construído">
        <b>4/4</b>
        {values.length ? (
          values.map((v, i) => (
            <button
              key={i}
              title={"Remover " + v.name}
              aria-label={"Remover " + v.name + " " + (i + 1)}
              onClick={() => setValues((a) => a.filter((_, j) => j !== i))}
            >
              {v.symbol}
            </button>
          ))
        ) : (
          <span>Adicione figuras e pausas acima.</span>
        )}
        <strong>{total} / 4</strong>
      </div>
      <div className="button-row">
        <button
          className="secondary"
          disabled={!values.length}
          onClick={listen}
        >
          Ouvir compasso
        </button>
        <button
          className="primary"
          onClick={() => {
            if (total !== 4) {
              setMessage(
                total < 4
                  ? `Faltam ${4 - total} pulsos.`
                  : `Há ${total - 4} pulso(s) a mais. Clique em uma figura para removê-la.`,
              );
              return;
            }
            if (!values.some((v) => v.rest)) {
              setMessage(
                "A soma está correta. Agora inclua pelo menos uma pausa para exercitar o silêncio.",
              );
              return;
            }
            success();
            setMessage("Compasso completo! Sons e pausas somam quatro pulsos.");
          }}
        >
          Verificar compasso
        </button>
        <button className="text-button" onClick={() => setValues([])}>
          Limpar
        </button>
      </div>
      <Feedback text={message} />
    </>
  );
}
const intervals = [
  { n: 2, name: "Segunda maior" },
  { n: 4, name: "Terça maior" },
  { n: 7, name: "Quinta justa" },
];
function EarLab({ success }: { success: () => void }) {
  const [exercise, setExercise] = useState(() => Math.floor(Math.random() * 3));
  const [heard, setHeard] = useState(false);
  const [message, setMessage] = useState("");
  const [hint, setHint] = useState(false);
  const current = intervals[exercise];
  return (
    <>
      <div className="ear-exercise">
        <span className="feature-symbol">♫</span>
        <h3>Que distância você ouviu?</h3>
        <p>
          Notas ascendentes, começando em Dó4. O desafio fica oculto até você
          responder.
        </p>
        <button
          className="primary"
          onClick={() => {
            setHeard(true);
            void say([60, 60 + current.n]);
          }}
        >
          Ouvir / repetir intervalo
        </button>
      </div>
      <div className="choice-grid">
        {intervals.map((v, i) => (
          <button
            className="secondary"
            key={v.n}
            onClick={() => {
              if (!heard) {
                setMessage("Ouça o intervalo primeiro.");
                return;
              }
              if (i === exercise) {
                success();
                setMessage(
                  `Correto: ${v.name.toLowerCase()}, ${v.n} semitons. Compare cantando a distância com conforto.`,
                );
              } else
                setMessage(
                  `Tente novamente. ${v.name} tem ${v.n} semitons; este exemplo tem outra distância. Use a dica e repita.`,
                );
            }}
          >
            {v.name}
          </button>
        ))}
      </div>
      <div className="button-row">
        <button className="text-button" onClick={() => setHint(true)}>
          Quero uma dica
        </button>
        <button
          className="text-button"
          onClick={() => {
            setExercise((v) => (v + 1 + Math.floor(Math.random() * 2)) % 3);
            setHeard(false);
            setMessage("");
            setHint(false);
          }}
        >
          Novo desafio
        </button>
      </div>
      {hint && (
        <p className="lesson-callout">
          Da primeira à segunda nota há {current.n} semitons. Relacione essa
          distância aos exemplos da aula.
        </p>
      )}
      <Feedback text={message} />
    </>
  );
}
function ScaleLab({ success }: { success: () => void }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [mode, setMode] = useState<ScaleMode>("major");
  const [root, setRoot] = useState("C");
  const [message, setMessage] = useState("");
  const names = scaleNotes(root, mode);
  const notes = scaleMidi(root, mode);
  return (
    <>
      <div className="control-row">
        <label>
          Tônica
          <select value={root} onChange={(e) => setRoot(e.target.value)}>
            {["C", "G", "F", "D", "A"].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <label>
          Escala
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as ScaleMode)}
          >
            <option value="major">Maior</option>
            <option value="minor">Menor natural</option>
          </select>
        </label>
      </div>
      <div className="scale-chain">
        {names.map((n, i) => (
          <span key={i}>
            <b>{noteName(n)}</b>
            <small>{i + 1}º</small>
            {i < 6 && <em>{notes[i + 1] - notes[i] === 2 ? "T" : "S"}</em>}
          </span>
        ))}
        <span>
          <b>{noteName(root)}</b>
          <small>8º</small>
          <em className="scale-last">
            {12 + pitch(root) + 60 - notes[6] === 2 ? "T" : "S"}
          </em>
        </span>
      </div>
      <button
        className="secondary"
        onClick={() => void say([...notes, notes[0] + 12])}
      >
        Ouvir escala exibida
      </button>
      <p className="lab-prompt">
        Agora construa Dó maior: selecione exatamente suas sete notas abaixo.
      </p>
      <div className="pitch-selector">
        {Array.from({ length: 12 }, (_, i) => i).map((pc) => (
          <button
            key={pc}
            aria-pressed={selected.includes(pc)}
            className={selected.includes(pc) ? "active" : ""}
            onClick={() =>
              setSelected((a) =>
                a.includes(pc) ? a.filter((n) => n !== pc) : [...a, pc],
              )
            }
          >
            {noteName(CHROMATIC[pc])}
          </button>
        ))}
      </div>
      <div className="button-row">
        <button
          className="secondary"
          disabled={!selected.length}
          onClick={() =>
            void say([...selected].sort((a, b) => a - b).map((n) => 60 + n))
          }
        >
          Ouvir minha escala
        </button>
        <button
          className="primary"
          onClick={() => {
            const correct = [0, 2, 4, 5, 7, 9, 11];
            if (
              selected.length === 7 &&
              correct.every((n) => selected.includes(n))
            ) {
              success();
              setMessage(
                "Dó, Ré, Mi, Fá, Sol, Lá e Si: maior, sem acidentes nessa tônica.",
              );
            } else
              setMessage(
                "Confira T–T–S–T–T–T–S a partir de Dó. Em Dó maior, todas as notas são naturais.",
              );
          }}
        >
          Verificar escala
        </button>
      </div>
      <Feedback text={message} />
    </>
  );
}
function ChordLab({
  success,
  practice,
}: {
  success: () => void;
  practice: (s: string) => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const [minor, setMinor] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <>
      <p>Monte C: selecione fundamental, terça maior e quinta justa.</p>
      <div className="pitch-selector">
        {[0, 2, 3, 4, 5, 7, 9, 11].map((pc) => (
          <button
            key={pc}
            aria-pressed={selected.includes(pc)}
            className={selected.includes(pc) ? "active" : ""}
            onClick={() =>
              setSelected((a) =>
                a.includes(pc) ? a.filter((n) => n !== pc) : [...a, pc],
              )
            }
          >
            {noteName(CHROMATIC[pc])}
          </button>
        ))}
      </div>
      <div className="button-row">
        <button
          className="secondary"
          disabled={!selected.length}
          onClick={() =>
            void say(
              selected.map((n) => 60 + n),
              false,
            )
          }
        >
          Ouvir construção
        </button>
        <button
          className="primary"
          onClick={() => {
            if (
              selected.length === 3 &&
              [0, 4, 7].every((n) => selected.includes(n))
            ) {
              success();
              setMessage(
                "C = Dó, Mi e Sol. Agora compare a terça maior com a menor no exemplo abaixo.",
              );
            } else
              setMessage(
                "Procure 0, 4 e 7 semitons acima de Dó: Dó, Mi e Sol. Ré, Fá e Si não pertencem a essa tríade.",
              );
          }}
        >
          Verificar tríade
        </button>
      </div>
      <div className="chord-compare-lab">
        <label>
          <input
            type="checkbox"
            checked={minor}
            onChange={(e) => setMinor(e.target.checked)}
          />{" "}
          Abaixar a terça: {minor ? "Mi♭ · Cm" : "Mi · C"}
        </label>
        <Piano chord={makeChord("C", minor ? "m" : "")} inversion={0} names />
        <div className="button-row">
          <button
            className="secondary"
            onClick={() => void say([60, minor ? 63 : 64, 67], false)}
          >
            Ouvir {minor ? "Cm" : "C"}
          </button>
          <button
            className="text-button"
            onClick={() => practice(minor ? "Cm" : "C")}
          >
            Abrir no instrumento escolhido →
          </button>
        </div>
      </div>
      <Feedback text={message} />
    </>
  );
}
function InversionLab({ success }: { success: () => void }) {
  const [inversion, setInversion] = useState(0);
  const [message, setMessage] = useState("");
  const chord = makeChord("C");
  return (
    <>
      <div className="choice-grid">
        {[
          "Dó · fundamental",
          "Mi · primeira inversão",
          "Sol · segunda inversão",
        ].map((v, i) => (
          <button
            key={v}
            className={inversion === i ? "secondary active" : "secondary"}
            onClick={() => setInversion(i)}
          >
            {v}
          </button>
        ))}
      </div>
      <Piano chord={chord} inversion={inversion} names />
      <div className="button-row">
        <button
          className="secondary"
          onClick={() => void say(pianoVoicing(chord, inversion), false)}
        >
          Ouvir em bloco
        </button>
        <button
          className="secondary"
          onClick={() => void say(pianoVoicing(chord, inversion))}
        >
          Ouvir arpejo
        </button>
        <button
          className="primary"
          onClick={() => {
            if (inversion === 1) {
              success();
              setMessage(
                "Mi é o som mais grave. As notas continuam sendo Dó, Mi e Sol: C/E.",
              );
            } else
              setMessage(
                "Para C/E, escolha Mi como nota mais grave, a primeira inversão.",
              );
          }}
        >
          Verificar C/E
        </button>
      </div>
      <Feedback text={message} />
    </>
  );
}
function KeyLab({
  success,
  practice,
}: {
  success: () => void;
  practice: (s: string) => void;
}) {
  const [root, setRoot] = useState("C");
  const [selected, setSelected] = useState(-1);
  const [message, setMessage] = useState("");
  const scale = scaleNotes(root, "major");
  const qualities = ["", "m", "m", "", "", "m", "dim"];
  return (
    <>
      <label>
        Tonalidade maior
        <select
          value={root}
          onChange={(e) => {
            setRoot(e.target.value);
            setSelected(-1);
          }}
        >
          {["C", "G", "F", "D"].map((n) => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </label>
      <div className="harmonic-field">
        {scale.map((n, i) => (
          <button
            key={n}
            className={selected === i ? "active" : ""}
            onClick={() => {
              setSelected(i);
              void say(
                pianoVoicing(makeChord(n, qualities[i] as "" | "m" | "dim")),
                false,
              );
            }}
          >
            <small>{["I", "ii", "iii", "IV", "V", "vi", "vii°"][i]}</small>
            <strong>{n + qualities[i]}</strong>
          </button>
        ))}
      </div>
      <div className="button-row">
        <button
          className="primary"
          onClick={() => {
            if (selected === 4) {
              success();
              setMessage(
                "Quinto grau: " +
                  scale[4] +
                  ". No campo harmônico maior, essa tríade é maior.",
              );
            } else
              setMessage(
                "Conte os graus a partir da tônica. O quinto usa o numeral V; clique nele para ouvir.",
              );
          }}
        >
          Verificar quinto grau
        </button>
        {selected >= 0 && (
          <button
            className="text-button"
            onClick={() => practice(scale[selected] + qualities[selected])}
          >
            Abrir acorde na Prática →
          </button>
        )}
      </div>
      <Feedback text={message} />
    </>
  );
}
export function SequenceLab({
  success,
  practice,
}: {
  success?: () => void;
  practice: (s: string) => void;
}) {
  const [sequence, setSequence] = useState<string[]>(["C", "F"]);
  const [message, setMessage] = useState("");
  function listen() {
    const events = sequence.flatMap((s, i) => {
      const root = s.replace(/m$/, "");
      return pianoVoicing(makeChord(root, s.endsWith("m") ? "m" : "")).map(
        (midi) => ({ midi, at: i * 1.2, duration: 1, level: 0.55 }),
      );
    });
    void playSequence(events, 0.5);
  }
  return (
    <>
      <div className="pitch-selector">
        {["C", "Dm", "Em", "F", "G", "Am"].map((s) => (
          <button
            key={s}
            disabled={sequence.length >= 8}
            onClick={() => setSequence((a) => [...a, s])}
          >
            + {s}
          </button>
        ))}
      </div>
      <div className="progression-slots">
        {sequence.map((s, i) => (
          <div key={i}>
            <button onClick={() => practice(s)} title={"Consultar " + s}>
              {s}
            </button>
            <button
              aria-label={"Remover acorde " + (i + 1)}
              onClick={() => setSequence((a) => a.filter((_, j) => j !== i))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="button-row">
        <button
          className="secondary"
          disabled={!sequence.length}
          onClick={listen}
        >
          Ouvir sequência
        </button>
        <button className="text-button" onClick={() => setSequence([])}>
          Limpar sequência
        </button>
        {success && (
          <button
            className="primary"
            onClick={() => {
              if (
                sequence.length >= 2 &&
                sequence.at(-2) === "G" &&
                sequence.at(-1) === "C"
              ) {
                success();
                setMessage(
                  "Você concluiu G–C. Agora compare com a versão que termina em G.",
                );
              } else
                setMessage(
                  "Neste exemplo, termine com G seguido de C. Ouça a expectativa e a chegada.",
                );
            }}
          >
            Verificar chegada G–C
          </button>
        )}
      </div>
      <Feedback text={message} />
    </>
  );
}
function ModeLab({ success }: { success: () => void }) {
  const [mode, setMode] = useState<ScaleMode>("major");
  const [root, setRoot] = useState("C");
  const [explored, setExplored] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const notes = scaleNotes(root, mode);
  return (
    <>
      <div className="control-row">
        <label>
          Tônica
          <select value={root} onChange={(e) => setRoot(e.target.value)}>
            {["C", "D", "F", "G"].map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <label>
          Organização
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as ScaleMode)}
          >
            <option value="major">Maior</option>
            <option value="minor">Menor natural</option>
            <option value="dorian">Dórico</option>
          </select>
        </label>
      </div>
      <div className="scale-chain">
        {notes.map((n, i) => (
          <span key={n}>
            <b>{noteName(n)}</b>
            <small>{i + 1}º</small>
          </span>
        ))}
      </div>
      <button
        className="secondary"
        onClick={() => {
          setExplored((a) => [...new Set([...a, mode])]);
          const midi = scaleMidi(root, mode);
          void say([...midi, midi[0] + 12]);
        }}
      >
        Ouvir organização
      </button>
      <div className="button-row">
        <button
          className="primary"
          onClick={() => {
            if (
              explored.includes("major") &&
              explored.includes("minor") &&
              explored.includes("dorian")
            ) {
              success();
              setMessage(
                "Você comparou três padrões. Agora mude a tônica: as relações de cada padrão são preservadas.",
              );
            } else
              setMessage(
                "Ouça maior, menor natural e dórico ao menos uma vez. No dórico, compare especialmente a sexta com a menor natural.",
              );
          }}
        >
          Conferir exploração
        </button>
      </div>
      <Feedback text={message} />
    </>
  );
}
export function AudioSafety({ error = "" }: { error?: string }) {
  const [volume, setVolume] = useState(studyVolume);
  return (
    <div className="audio-safety">
      <span>Áudio sintetizado · demonstração de alturas</span>
      <label className="study-volume-label">
        Volume
        <input
          aria-label="Volume do estudo"
          type="range"
          min="0"
          max="1"
          step=".01"
          value={volume}
          onChange={(e) => {
            const v = Number(e.target.value);
            studyVolume = v;
            setVolume(v);
            setAudioVolume((lastRequestedVolume * v) / 0.5);
          }}
        />
      </label>
      <button onClick={stopAudio}>■ Interromper áudio da aula</button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
