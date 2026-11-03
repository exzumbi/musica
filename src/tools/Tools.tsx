import { useEffect, useRef, useState } from "react";
import { claimAudio, registerAudio, stopAllAudio } from "../audio-bus.ts";
import { playAudio } from "../audio.ts";
import { CHROMATIC, mod, noteName } from "../theory.ts";
import {
  detectPitch,
  frequencyToMidi,
  centsFrom,
  stablePitch,
} from "./pitch.ts";
import {
  MetronomeEngine,
  meterParts,
  clickPlan,
  tapTempo,
  type MetroConfig,
  type Meter,
  type Division,
} from "./metronome.ts";
export type Tool = "tuner" | "metronome";
export function ToolsHome({ open }: { open: (tool: Tool) => void }) {
  return (
    <div className="learning-page">
      <div className="eyebrow">ESCUTE. AJUSTE. ENCONTRE SEU TEMPO.</div>
      <h1>
        Suas ferramentas de <em>prática.</em>
      </h1>
      <p className="page-intro">
        Duas pequenas ajudas para tocar com mais confiança. O som e o microfone
        só começam quando você decidir.
      </p>
      <div className="feature-grid">
        <button className="feature-card" onClick={() => open("tuner")}>
          <span className="feature-symbol">∿</span>
          <span className="small-label">AFINAÇÃO</span>
          <h2>Cada corda no seu lugar.</h2>
          <p>
            Afinador cromático e por corda. Frequência, oitava e desvio em
            cents, processados no seu dispositivo.
          </p>
          <strong>Abrir afinador →</strong>
        </button>
        <button className="feature-card" onClick={() => open("metronome")}>
          <span className="feature-symbol">♩</span>
          <span className="small-label">PULSAÇÃO</span>
          <h2>Encontre seu próprio tempo.</h2>
          <p>
            De 30 a 240 BPM, compassos simples e compostos, subdivisões e
            contagem de entrada.
          </p>
          <strong>Abrir metrônomo →</strong>
        </button>
      </div>
      <div className="lesson-callout">
        Estas ferramentas abrem em um painel. Você pode mantê-las por perto
        durante uma aula ou sem sair da sua cifra.
      </div>
    </div>
  );
}
export function ToolPanel({
  tool,
  close,
}: {
  tool: Tool | null;
  close: () => void;
}) {
  const [minimized, setMinimized] = useState(false);
  const [summary, setSummary] = useState("");
  useEffect(() => {
    setMinimized(false);
    setSummary("");
  }, [tool]);
  return tool ? (
    <aside
      className={"tool-panel " + (minimized ? "minimized" : "")}
      aria-label={
        tool === "tuner" ? "Painel do afinador" : "Painel do metrônomo"
      }
    >
      <div className="tool-panel-top">
        <div>
          <span className="eyebrow">SEU COMPANHEIRO DE PRÁTICA</span>
          <h2>{tool === "tuner" ? "Afinador" : "Metrônomo"}</h2>
        </div>
        <div className="tool-panel-actions">
          <button
            className="icon-button"
            aria-label={
              minimized ? "Expandir ferramenta" : "Minimizar ferramenta"
            }
            aria-expanded={!minimized}
            aria-controls="tool-controls"
            onClick={() => setMinimized((v) => !v)}
          >
            {minimized ? "⌃" : "⌄"}
          </button>
          <button
            className="icon-button"
            aria-label="Fechar ferramenta e interromper"
            onClick={close}
          >
            ✕
          </button>
        </div>
      </div>
      {minimized && (
        <p className="tool-mini-summary" role="status">
          {summary || "Controles minimizados · fechar interrompe a ferramenta"}
        </p>
      )}
      <div id="tool-controls" hidden={minimized}>
        {tool === "tuner" ? (
          <Tuner onSummary={setSummary} />
        ) : (
          <Metronome onSummary={setSummary} />
        )}
      </div>
    </aside>
  ) : null;
}
const strings = [
  { midi: 40, label: "6ª · Mi grave · E2" },
  { midi: 45, label: "5ª · Lá · A2" },
  { midi: 50, label: "4ª · Ré · D3" },
  { midi: 55, label: "3ª · Sol · G3" },
  { midi: 59, label: "2ª · Si · B3" },
  { midi: 64, label: "1ª · Mi agudo · E4" },
];
export function Tuner({ onSummary }: { onSummary?: (text: string) => void }) {
  const [mode, setMode] = useState("guitar");
  const [target, setTarget] = useState(40);
  const [reference, setReference] = useState(440);
  const [running, setRunning] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [status, setStatus] = useState(
    "Toque uma corda por vez, perto do microfone.",
  );
  const [reading, setReading] = useState<{
    frequency: number;
    confidence: number;
    stable: boolean;
  } | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const context = useRef<AudioContext | null>(null);
  const frame = useRef(0);
  const token = useRef(0);
  const recent = useRef<number[]>([]);
  function stop(message = "Microfone desligado.") {
    token.current++;
    cancelAnimationFrame(frame.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    void context.current?.close();
    context.current = null;
    recent.current = [];
    setRunning(false);
    setRequesting(false);
    setReading(null);
    setStatus(message);
  }
  useEffect(() => {
    const release = registerAudio("tuner", () =>
      stop(
        "Captação pausada para não ouvir o áudio do próprio site. Ative novamente quando terminar de escutar.",
      ),
    );
    return () => {
      release();
      token.current++;
      cancelAnimationFrame(frame.current);
      stream.current?.getTracks().forEach((t) => t.stop());
      void context.current?.close();
    };
  }, []);
  useEffect(() => {
    recent.current = [];
    setReading(null);
  }, [mode, target, reference]);
  async function start() {
    if (!window.isSecureContext) {
      setStatus(
        "O microfone exige HTTPS ou localhost. Abra o site em uma conexão segura.",
      );
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.AudioContext) {
      setStatus(
        "Este navegador não oferece acesso compatível ao microfone e à análise de áudio.",
      );
      return;
    }
    stop("Solicitando acesso ao microfone…");
    claimAudio("tuner");
    const attempt = ++token.current;
    setRequesting(true);
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
      if (attempt !== token.current) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      media.getTracks().forEach((track) => {
        track.onended = () =>
          stop(
            "O microfone foi desconectado. Conecte um dispositivo e ative novamente.",
          );
      });
      const ac = new AudioContext({ latencyHint: "interactive" });
      context.current = ac;
      await ac.resume();
      if (attempt !== token.current) {
        media.getTracks().forEach((t) => t.stop());
        void ac.close();
        return;
      }
      const source = ac.createMediaStreamSource(media);
      const analyser = ac.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);
      const samples = new Float32Array(analyser.fftSize);
      let last = 0;
      setRunning(true);
      setRequesting(false);
      setStatus("Escutando uma nota por vez.");
      const sample = (now: number) => {
        if (attempt !== token.current) return;
        if (ac.state !== "running") {
          stop(
            "O navegador suspendeu a captação. Ative o microfone novamente ao retomar.",
          );
          return;
        }
        if (now - last > 85) {
          last = now;
          analyser.getFloatTimeDomainData(samples);
          const value = detectPitch(samples, ac.sampleRate);
          if (value && value.confidence >= 0.9) {
            recent.current = [...recent.current.slice(-4), value.frequency];
            setReading({ ...value, stable: stablePitch(recent.current) });
            setStatus("Escutando uma nota por vez.");
          } else {
            recent.current = [];
            setReading(null);
            setStatus(
              "Sinal fraco ou instável. Aproxime o instrumento e reduza o ruído.",
            );
          }
        }
        frame.current = requestAnimationFrame(sample);
      };
      frame.current = requestAnimationFrame(sample);
    } catch (e) {
      if (attempt !== token.current) return;
      const name = e instanceof DOMException ? e.name : "";
      stop(
        name === "NotAllowedError"
          ? "Permissão negada. Autorize o microfone nas configurações do navegador e tente novamente."
          : name === "NotFoundError"
            ? "Nenhum microfone disponível. Conecte ou habilite um dispositivo de entrada."
            : "Não foi possível iniciar o microfone. Ele pode estar ocupado por outro aplicativo.",
      );
    }
  }
  const nearest = reading
    ? Math.round(frequencyToMidi(reading.frequency, reference))
    : null;
  const midi = mode === "guitar" ? target : nearest;
  const cents =
    reading && midi !== null
      ? centsFrom(reading.frequency, midi, reference)
      : null;
  const octaveError =
    nearest !== null &&
    mode === "guitar" &&
    Math.abs(nearest - target) >= 12 &&
    mod(nearest) === mod(target);
  const reliable =
    !!reading?.stable &&
    cents !== null &&
    !octaveError &&
    Math.abs(cents) < 100;
  const instruction = !reading
    ? "Aguardando uma nota nítida"
    : !reading.stable
      ? "Estabilize a nota por um instante"
      : octaveError
        ? "Oitava diferente: confira a corda-alvo"
        : !reliable
          ? "Confira se tocou a corda-alvo"
          : Math.abs(cents!) <= 5
            ? "Afinado"
            : cents! < 0
              ? "Aperte um pouco"
              : "Afrouxe um pouco";
  useEffect(() => {
    onSummary?.(
      running
        ? "Microfone ligado · " +
            (nearest !== null
              ? noteName(CHROMATIC[mod(nearest)]) +
                " " +
                (Math.floor(nearest / 12) - 1) +
                " · " +
                instruction
              : "aguardando nota estável")
        : "Microfone desligado",
    );
  }, [running, nearest, instruction, onSummary]);
  return (
    <div className="tuner">
      <div className="control-row">
        <label>
          Modo
          <select
            aria-label="Modo do afinador"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="guitar">Violão / guitarra</option>
            <option value="chromatic">Cromático</option>
          </select>
        </label>
        <label>
          Lá de referência (Hz)
          <input
            aria-label="Lá de referência"
            type="number"
            min="430"
            max="450"
            value={reference}
            onChange={(e) =>
              setReference(
                Math.min(450, Math.max(430, Number(e.target.value) || 440)),
              )
            }
          />
        </label>
      </div>
      {mode === "guitar" && (
        <div className="string-targets">
          {strings.map((s) => (
            <button
              key={s.midi}
              className={target === s.midi ? "active" : ""}
              aria-pressed={target === s.midi}
              onClick={() => setTarget(s.midi)}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
      <div className="tuner-display">
        <span className="small-label">
          {mode === "guitar"
            ? "CORDA-ALVO: " + strings.find((s) => s.midi === target)!.label
            : "DETECÇÃO CROMÁTICA"}
        </span>
        <strong>
          {nearest !== null
            ? noteName(CHROMATIC[mod(nearest)]) +
              " " +
              (Math.floor(nearest / 12) - 1)
            : "—"}
        </strong>
        <span>
          {reading
            ? reading.frequency.toFixed(1) +
              " Hz · confiança " +
              Math.round(reading.confidence * 100) +
              "%"
            : "Nenhum som é gravado ou enviado"}
        </span>
        <div className="tuning-gauge">
          <span>−50</span>
          <div className="gauge-track">
            <i
              style={{
                left: `${50 + Math.max(-50, Math.min(50, cents ?? 0))}%`,
                opacity: reading?.stable ? 1 : 0.2,
              }}
            />
            <b />
          </div>
          <span>+50</span>
        </div>
        <p
          className={reliable && Math.abs(cents!) <= 5 ? "tuned" : ""}
          role="status"
        >
          {instruction}
        </p>
        <small>
          {cents !== null
            ? Math.round(cents) +
              " cents em relação " +
              (mode === "guitar" ? "à corda-alvo" : "à nota mais próxima")
            : "O indicador só confirma sinais estáveis e confiáveis."}
        </small>
      </div>
      <p className="tool-status" role="status">
        {status}
      </p>
      <div className="button-row">
        <button
          className="primary"
          disabled={running || requesting}
          onClick={() => void start()}
        >
          Ativar microfone
        </button>
        <button className="secondary" onClick={() => stop()}>
          Encerrar captação
        </button>
      </div>
      <button
        className="text-button"
        onClick={() => {
          stop(
            "Captação pausada durante a nota de referência. Ative novamente para afinar.",
          );
          void playAudio(
            [mode === "guitar" ? target : 69],
            0.5,
            false,
            () => {},
            reference,
          ).catch(() =>
            setStatus("O navegador não conseguiu reproduzir a referência."),
          );
        }}
      >
        ♪ Ouvir nota de referência
      </button>
      <p className="tool-help">
        Toque suavemente uma corda e abafe as outras. Harmônicos, ruído e
        microfones podem provocar erros, inclusive de oitava. Afinação de
        referência: temperamento igual, Lá ajustável. Confirme a oitava e evite
        tensionar demais a corda.
      </p>
    </div>
  );
}
export function Metronome({
  onSummary,
}: {
  onSummary?: (text: string) => void;
}) {
  const [config, setConfig] = useState<MetroConfig>({
    bpm: 80,
    meter: "4/4",
    division: "beat",
    volume: 0.5,
    muted: false,
    countIn: false,
  });
  const [running, setRunning] = useState(false);
  const [bpmDraft, setBpmDraft] = useState("80");
  const [index, setIndex] = useState(-1);
  const [counting, setCounting] = useState(false);
  const [message, setMessage] = useState("Pronto para acompanhar seu estudo.");
  const engine = useRef<MetronomeEngine | null>(null);
  const taps = useRef<number[]>([]);
  const { beats, parts, unit } = meterParts(config.meter, config.division);
  useEffect(() => {
    const e = new MetronomeEngine(
      config,
      (i, c) => {
        setIndex(i);
        setCounting(c);
      },
      () => {
        setRunning(false);
        setIndex(-1);
      },
    );
    e.onSuspend = () =>
      setMessage(
        "O navegador suspendeu o áudio. Inicie novamente para retomar o metrônomo.",
      );
    engine.current = e;
    const hidden = () => {
      if (document.hidden) {
        e.stop();
        setMessage(
          "Pausado: o navegador pode suspender o áudio em segundo plano ou com a tela bloqueada. Reinicie ao voltar.",
        );
      }
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      document.removeEventListener("visibilitychange", hidden);
      e.dispose();
      engine.current = null;
    };
  }, []);
  function change(next: Partial<MetroConfig>) {
    if (next.bpm) setBpmDraft(String(next.bpm));
    setConfig((c) => ({ ...c, ...next }));
    if (engine.current) {
      engine.current.config = { ...config, ...next };
      engine.current.volume(
        next.volume ?? config.volume,
        next.muted ?? config.muted,
      );
      if (
        next.bpm ||
        next.meter ||
        next.division ||
        next.countIn !== undefined
      ) {
        engine.current.stop();
        setMessage(
          "Configuração alterada. Inicie novamente para aplicar do primeiro tempo.",
        );
      }
    }
  }
  async function start() {
    try {
      engine.current!.config = config;
      const started = await engine.current!.start();
      if (!started) return;
      setRunning(true);
      setMessage("Em andamento. O primeiro pulso recebe acento.");
    } catch {
      setMessage(
        "O navegador não conseguiu iniciar o áudio. Tente novamente após verificar as permissões de som.",
      );
    }
  }
  function tap() {
    const now = performance.now();
    if (taps.current.length && now - taps.current.at(-1)! > 3000)
      taps.current = [];
    taps.current = [...taps.current.slice(-5), now];
    const bpm = tapTempo(taps.current);
    if (bpm) change({ bpm });
    setMessage(
      taps.current.length < 2
        ? "Toque novamente para definir o andamento."
        : "Andamento calculado pelos seus toques.",
    );
  }
  const plan = index >= 0 ? clickPlan(index, config) : null;
  useEffect(() => {
    onSummary?.(
      config.bpm +
        " BPM · " +
        (running
          ? "pulso " + ((plan?.beat ?? 0) + 1) + " / " + beats
          : "parado") +
        (config.muted ? " · sem som" : ""),
    );
  }, [config.bpm, running, plan?.beat, beats, config.muted, onSummary]);
  return (
    <div className="metronome">
      <div className="bpm-display">
        <input
          aria-label="BPM"
          type="number"
          min="30"
          max="240"
          value={bpmDraft}
          onChange={(e) => setBpmDraft(e.target.value)}
          onBlur={() =>
            change({ bpm: Math.min(240, Math.max(30, Number(bpmDraft) || 80)) })
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
        />
        <span>BPM · {unit}</span>
      </div>
      <input
        className="bpm-slider"
        aria-label="Ajustar andamento"
        type="range"
        min="30"
        max="240"
        value={config.bpm}
        onChange={(e) => change({ bpm: Number(e.target.value) })}
      />
      <div
        className="beat-lights"
        aria-label={`Pulso ${plan ? plan.beat + 1 : "parado"} de ${beats}`}
      >
        {Array.from({ length: beats }, (_, i) => (
          <span key={i} className={plan?.beat === i ? "active" : ""}>
            {i + 1}
          </span>
        ))}
      </div>
      <div className="beat-caption" aria-live="off">
        {counting ? "Contagem de entrada · " : ""}
        {running
          ? "Subdivisão " + ((plan?.subdivision ?? 0) + 1) + " / " + parts
          : "Pronto para começar"}
      </div>
      <div className="control-row">
        <label>
          Compasso
          <select
            aria-label="Compasso"
            value={config.meter}
            onChange={(e) => change({ meter: e.target.value as Meter })}
          >
            {["2/4", "3/4", "4/4", "6/8"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label>
          Subdivisão
          <select
            aria-label="Subdivisão"
            value={config.division}
            onChange={(e) => change({ division: e.target.value as Division })}
          >
            <option value="beat">Somente pulsos</option>
            <option value="eighth">
              Colcheias ({config.meter === "6/8" ? 3 : 2} por pulso)
            </option>
            <option value="triplet">Tercinas (3 por pulso)</option>
            <option value="sixteenth">
              Semicolcheias ({config.meter === "6/8" ? 6 : 4} por pulso)
            </option>
          </select>
        </label>
      </div>
      {config.meter === "6/8" && (
        <p className="tool-help">
          Em 6/8 contamos dois pulsos de semínima pontuada. Cada pulso contém
          três colcheias; 80 BPM significa 80 semínimas pontuadas por minuto.
        </p>
      )}
      <div className="tool-options">
        <label>
          <input
            type="checkbox"
            checked={config.countIn}
            onChange={(e) => change({ countIn: e.target.checked })}
          />{" "}
          Um compasso de entrada
        </label>
        <label>
          <input
            type="checkbox"
            checked={config.muted}
            onChange={(e) => change({ muted: e.target.checked })}
          />{" "}
          Som desligado · só visual
        </label>
        <label>
          Volume
          <input
            aria-label="Volume do metrônomo"
            type="range"
            min="0"
            max="1"
            step=".01"
            value={config.volume}
            onChange={(e) => change({ volume: Number(e.target.value) })}
          />
        </label>
      </div>
      <div className="button-row">
        <button
          className="primary"
          onClick={() => (running ? engine.current?.stop() : void start())}
        >
          {running ? "Parar metrônomo" : "Iniciar metrônomo"}
        </button>
        <button className="secondary" onClick={tap}>
          Tap tempo
        </button>
      </div>
      <p className="tool-status" role="status">
        {message}
      </p>
      <p className="tool-help">
        Cliques agendados pelo relógio de áudio. O indicador visual pode atrasar
        conforme a tela e a carga do aparelho. Iniciar outro áudio pausa este
        metrônomo.
      </p>
      <button className="text-button" onClick={stopAllAudio}>
        Interromper todos os sons
      </button>
    </div>
  );
}
