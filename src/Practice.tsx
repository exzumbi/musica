import React, { useState, useEffect, useRef } from "react";
import {
  parse,
  makeChord,
  transpose,
  pianoVoicing,
  noteName,
  noteForMidi,
  octaveForNote,
  qualities,
  type Chord,
} from "./theory.ts";
import {
  instruments,
  shapesFor,
  playedNotes,
  studyVoicing,
  type InstrumentId,
} from "./instruments.ts";
import { Diagram } from "./diagrams.tsx";
import { playAudio, stopAudio, setAudioVolume } from "./audio.ts";
const APP_NAME = "Dicionário Musical";
type IconName =
  | "search"
  | "book"
  | "heart"
  | "clock"
  | "grid"
  | "headphones"
  | "arrow"
  | "play"
  | "stop"
  | "minus"
  | "plus"
  | "chevron"
  | "close"
  | "volume"
  | "spark"
  | "check";
function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    book: (
      <>
        <path d="M3 4h6a4 4 0 0 1 3 2 4 4 0 0 1 3-2h6v15h-6a4 4 0 0 0-3 2 4 4 0 0 0-3-2H3zM12 6v15" />
      </>
    ),
    heart: (
      <path d="M20.8 5.6a5.2 5.2 0 0 0-8.8 1 5.2 5.2 0 0 0-8.8-1c-4.6 5.2 3.1 10.5 8.8 15 5.7-4.5 13.4-9.8 8.8-15Z" />
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l4 2" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    headphones: (
      <>
        <path d="M4 14v-3a8 8 0 0 1 16 0v3" />
        <rect x="3" y="12" width="4" height="8" rx="2" />
        <rect x="17" y="12" width="4" height="8" rx="2" />
      </>
    ),
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    play: <path d="m9 5 11 7-11 7Z" />,
    stop: <rect x="6" y="6" width="12" height="12" rx="1" />,
    minus: <path d="M5 12h14" />,
    plus: <path d="M5 12h14M12 5v14" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    volume: (
      <>
        <path d="M11 4 6 8H3v8h3l5 4zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />
      </>
    ),
    spark: (
      <>
        <path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
function useStored(key: string) {
  const [value, setValue] = useState<string[]>(() => {
    try {
      const v = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(v)
        ? v.filter((x: unknown) => typeof x === "string")
        : [];
    } catch {
      return [];
    }
  });
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [key, value]);
  useEffect(() => {
    const reload = () => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(data))
          setValue(data.filter((x) => typeof x === "string"));
      } catch {
        setFailed(true);
      }
    };
    window.addEventListener("dm-storage-imported", reload);
    return () => window.removeEventListener("dm-storage-imported", reload);
  }, [key]);
  return [value, setValue, failed] as const;
}
const suggestions = [
  "Em7",
  "C",
  "Am",
  "Bm7",
  "Cmaj7",
  "F#",
  "Dsus4",
  "Bdim",
  "Caug",
  "Am7(b5)",
  "C/E",
  "Nota Dó",
];
export function Practice({
  request,
  instrumentId,
  setInstrumentId,
}: {
  request: { query: string; nonce: number } | null;
  instrumentId: InstrumentId;
  setInstrumentId: (id: InstrumentId) => void;
}) {
  const [chord, setChord] = useState<Chord>(makeChord("E", "m7"));
  const [query, setQuery] = useState("Em7");
  const [position, setPosition] = useState(0);
  const [inversion, setInversion] = useState(0);
  const [names, setNames] = useState(true);
  const [left, setLeft] = useState(false);
  const [compare, setCompare] = useState(false);
  const [error, setError] = useState("");
  const [choices, setChoices] = useState<string[]>([]);
  const [focused, setFocused] = useState(false);
  const [favorites, setFavorites, favoritesFailed] = useStored("dm-favorites");
  const [history, setHistory, historyFailed] = useStored("dm-history");
  const [modal, setModal] = useState<"favorites" | "history" | "theory" | null>(
    null,
  );
  const dialog = useRef<HTMLDialogElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [audioError, setAudioError] = useState("");
  const instrument = instruments.find((i) => i.id === instrumentId)!;
  const shapes = shapesFor(chord, instrument);
  const favorite = favorites.includes(chord.symbol);
  useEffect(() => {
    if (modal) dialog.current?.showModal();
    else dialog.current?.close();
  }, [modal]);
  useEffect(() => {
    stopAudio();
    setPlaying(false);
  }, [chord, instrumentId, position, inversion]);
  useEffect(() => () => stopAudio(), []);
  function search(value: string) {
    const result = parse(value);
    setQuery(value);
    setFocused(false);
    setError(result.error || "");
    setChoices(result.choices || []);
    if (result.chord) {
      setChord(result.chord);
      setPosition(0);
      setInversion(0);
      setHistory((prev) =>
        [
          result.chord!.symbol,
          ...prev.filter((h) => h !== result.chord!.symbol),
        ].slice(0, 16),
      );
    }
  }
  function changeInstrument(id: InstrumentId) {
    setInstrumentId(id);
    setPosition(0);
  }
  function toggleFavorite() {
    setFavorites((f) =>
      favorite ? f.filter((x) => x !== chord.symbol) : [chord.symbol, ...f],
    );
  }
  async function listen(arpeggio = false, custom?: number[]) {
    let notes = custom;
    if (!notes) {
      if (instrumentId === "piano") notes = pianoVoicing(chord, inversion);
      else if (
        instrumentId === "bass" ||
        instrumentId === "violin" ||
        chord.noteOnly
      )
        notes = instrument.tuning
          ? studyVoicing(chord, instrument)
          : pianoVoicing(chord);
      else if (shapes.length)
        notes = playedNotes(instrument, shapes[position % shapes.length]);
    }
    if (!notes?.length) return;
    setAudioError("");
    setPlaying(true);
    try {
      await playAudio(
        notes,
        volume,
        arpeggio || instrumentId === "bass" || instrumentId === "violin",
        () => setPlaying(false),
      );
      setPlaying(true);
    } catch {
      setAudioError(
        "Não foi possível iniciar o áudio neste navegador. Verifique as permissões de som.",
      );
      setPlaying(false);
    }
  }
  function move(delta: number) {
    search(transpose(chord, delta).symbol);
  }
  const soundAvailable =
    instrumentId === "piano" ||
    instrumentId === "bass" ||
    instrumentId === "violin" ||
    (chord.noteOnly && !!instrument.tuning) ||
    shapes.length > 0;
  const actual =
    instrumentId === "piano"
      ? pianoVoicing(chord, inversion)
      : shapes.length
        ? playedNotes(instrument, shapes[position % shapes.length])
        : [];
  useEffect(() => {
    if (request) search(request.query);
  }, [request]);
  useEffect(() => {
    const onStop = () => setPlaying(false);
    window.addEventListener("dm-tones-stopped", onStop);
    return () => window.removeEventListener("dm-tones-stopped", onStop);
  }, []);
  return (
    <>
      <div className="practice-shortcuts">
        <button
          aria-label="Meus favoritos"
          onClick={() => setModal("favorites")}
        >
          ♡ Meus favoritos
        </button>
        <button aria-label="Histórico" onClick={() => setModal("history")}>
          ◷ Histórico
        </button>
        <button onClick={() => setModal("theory")}>Fundamentos musicais</button>
      </div>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span /> EXPLORE. OUÇA. TOQUE.
            </div>
            <h1>
              Encontre seu próximo <em>som.</em>
            </h1>
            <p>
              Das primeiras notas às novas descobertas.
              <br className="mobile-break" /> Explore acordes e leve a música
              para o seu instrumento.
            </p>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="floating-note">♪</span>
            <div className="waveform">
              {Array.from({ length: 33 }, (_, i) => (
                <i
                  key={i}
                  style={{
                    height:
                      18 +
                      Math.sin(i * 0.7) ** 2 * 58 +
                      (i > 10 && i < 22 ? 22 : 0),
                  }}
                />
              ))}
            </div>
            <span className="art-spark">✧</span>
          </div>
        </section>
        <section className="search-section" aria-label="Busca musical">
          <form
            className="search-form"
            onSubmit={(e) => {
              e.preventDefault();
              search(query);
            }}
          >
            <Icon name="search" size={23} />
            <input
              ref={searchRef}
              aria-label="Pesquisar nota ou acorde"
              placeholder="Qual nota ou acorde você quer tocar?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              autoComplete="off"
              onKeyDown={(e) => {
                if (e.key === "Escape") setFocused(false);
              }}
            />
            <span className="search-hint">Cifra ou nome</span>
            <button className="primary search-button" type="submit">
              Explorar <Icon name="arrow" size={18} />
            </button>
            {focused && (
              <div className="suggestions">
                <span>EXPERIMENTE UMA SONORIDADE</span>
                {suggestions
                  .filter(
                    (s) =>
                      s.toLowerCase().includes(query.toLowerCase()) ||
                      query.length < 2,
                  )
                  .slice(0, 6)
                  .map((s) => (
                    <button
                      type="button"
                      key={s}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => search(s)}
                    >
                      <Icon name="search" size={14} />
                      {s}
                      <small>{parse(s).chord?.name}</small>
                    </button>
                  ))}
                <p>Dica: use “nota Dó” para uma nota isolada.</p>
              </div>
            )}
          </form>
          <div className="example-row">
            <span>Comece por aqui</span>
            {["C", "Am", "Em7", "Bm7", "Cmaj7", "Dsus4"].map((s) => (
              <button
                className={chord.symbol === s ? "example selected" : "example"}
                onClick={() => search(s)}
                key={s}
              >
                {s}
              </button>
            ))}
            <span className="example-caption">
              ou tente “Mi menor com sétima”
            </span>
          </div>
          {(error || choices.length > 0) && (
            <div className="search-feedback" role="alert">
              {error ||
                "Essa grafia pode ter mais de uma interpretação. Qual você quis dizer?"}
              {choices.map((c) => (
                <button key={c} className="secondary" onClick={() => search(c)}>
                  {c} — {parse(c).chord?.name}
                </button>
              ))}
              <small>
                O resultado abaixo mantém a última consulta reconhecida:{" "}
                {chord.symbol}.
              </small>
            </div>
          )}
        </section>
        <section className="instrument-section">
          <div className="section-label">
            <span>01</span> ESCOLHA SEU INSTRUMENTO
          </div>
          <div className="instrument-bar">
            <div
              className="instrument-tabs"
              role="group"
              aria-label="Instrumentos principais"
            >
              {instruments.slice(0, 5).map((i) => (
                <button
                  key={i.id}
                  className={
                    "instrument-tab " +
                    (instrumentId === i.id ? "selected" : "")
                  }
                  aria-pressed={instrumentId === i.id}
                  onClick={() => changeInstrument(i.id)}
                >
                  <span className="instrument-glyph" aria-hidden="true">
                    {i.icon}
                  </span>
                  {i.name}
                  {instrumentId === i.id && (
                    <span className="instrument-selected-dot" />
                  )}
                </button>
              ))}
            </div>
            <label className="more-instruments">
              <select
                aria-label="Selecionar qualquer instrumento"
                value={instrumentId}
                onChange={(e) =>
                  changeInstrument(e.target.value as InstrumentId)
                }
              >
                {[...new Set(instruments.map((i) => i.family))].map((f) => (
                  <optgroup label={f} key={f}>
                    {instruments
                      .filter((i) => i.family === f)
                      .map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
              <Icon name="chevron" size={16} />
            </label>
          </div>
        </section>
        <section className="result-section" aria-labelledby="result-title">
          <div className="result-top">
            <div className="section-label">
              <span>02</span> DESCUBRA COMO TOCAR
            </div>
            <button
              className={"compare-button " + (compare ? "enabled" : "")}
              aria-pressed={compare}
              onClick={() => setCompare(!compare)}
            >
              <Icon name="grid" size={16} />
              Comparar instrumentos
            </button>
          </div>
          <div className="result-heading">
            <div className="chord-title">
              <div className="chord-symbol" id="result-title">
                {chord.symbol.replace("Nota ", "")}
                <span className="chord-kind">
                  {chord.noteOnly ? "NOTA ISOLADA" : "ACORDE"}
                </span>
              </div>
              <div className="chord-description">
                <h2>{chord.name}</h2>
                <p>
                  {chord.noteOnly
                    ? "Uma única altura, muitas possibilidades."
                    : chord.quality === "m7"
                      ? "Uma sonoridade suave, expressiva e cheia de possibilidades."
                      : "Explore as notas e descubra a sonoridade desse acorde."}
                </p>
              </div>
            </div>
            <div className="result-actions">
              <div className="transpose">
                <button aria-label="Descer um semitom" onClick={() => move(-1)}>
                  <Icon name="minus" size={16} />
                </button>
                <span>½ tom</span>
                <button aria-label="Subir um semitom" onClick={() => move(1)}>
                  <Icon name="plus" size={16} />
                </button>
              </div>
              <button
                className={"favorite-button " + (favorite ? "saved" : "")}
                aria-label={
                  favorite ? "Remover dos favoritos" : "Salvar nos favoritos"
                }
                aria-pressed={favorite}
                onClick={toggleFavorite}
              >
                <Icon name="heart" size={20} />
              </button>
            </div>
          </div>
          <div className="result-grid">
            <article className="diagram-card">
              <div className="card-header">
                <h3>
                  <span className="instrument-glyph" aria-hidden="true">
                    {instrument.icon}
                  </span>
                  {instrument.name}
                  <span className="subtle-tag">{instrument.family}</span>
                </h3>
                <label className="name-toggle">
                  <input
                    type="checkbox"
                    checked={names}
                    onChange={(e) => setNames(e.target.checked)}
                  />
                  <span className="switch" />
                  Nomes das notas
                </label>
              </div>
              <div className="diagram-topline">
                <span className="status-dot" />
                {instrumentId === "piano"
                  ? chord.bass
                    ? "Baixo indicado na cifra"
                    : inversion === 0
                      ? "Posição fundamental"
                      : inversion + "ª inversão"
                  : instrument.tuning
                    ? "Afinação padrão · " + instrument.tuningLabel
                    : "Explore seu instrumento"}
                {instrument.tuning && instrumentId !== "violin" && (
                  <label className="left-handed">
                    <input
                      type="checkbox"
                      checked={left}
                      onChange={(e) => setLeft(e.target.checked)}
                    />{" "}
                    Canhoto
                  </label>
                )}
              </div>
              <div
                className={
                  "diagram-stage " +
                  (instrumentId === "piano" ? "piano-stage" : "")
                }
              >
                <Diagram
                  {...{ chord, instrument, inversion, position, left, names }}
                  onNotes={(n) => listen(true, n)}
                />
              </div>
              {actual.length > 0 && (
                <div className="actual-notes">
                  {actual.map((m, i) => (
                    <span key={i}>
                      {names
                        ? noteName(noteForMidi(chord, m))
                        : noteForMidi(chord, m)}
                      <small>{octaveForNote(noteForMidi(chord, m), m)}</small>
                    </span>
                  ))}
                  <span className="actual-label">alturas tocadas</span>
                </div>
              )}
              <div className="audio-bar">
                <button
                  className="primary listen-button"
                  disabled={!soundAvailable}
                  onClick={() => listen(false)}
                >
                  <Icon name="play" size={16} />
                  {playing
                    ? "Reproduzir novamente"
                    : "Ouvir " +
                      (chord.noteOnly
                        ? "nota"
                        : instrumentId === "bass" || instrumentId === "violin"
                          ? "arpejo"
                          : "acorde")}
                </button>
                <button
                  className="arpeggio-button"
                  disabled={!soundAvailable}
                  onClick={() => listen(true)}
                >
                  <Icon name="headphones" size={17} />
                  Arpejo lento
                </button>
                <div className="volume-control">
                  <Icon name="volume" size={16} />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    aria-label="Volume"
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      setAudioVolume(Number(e.target.value));
                    }}
                  />
                </div>
                <button
                  className="stop-button"
                  aria-label="Interromper áudio"
                  disabled={!playing}
                  onClick={() => {
                    stopAudio();
                    setPlaying(false);
                  }}
                >
                  <Icon name="stop" size={16} />
                </button>
              </div>
              <p className="audio-note">
                <span className={playing ? "audio-led playing" : "audio-led"} />
                {playing ? "Reproduzindo · " : " "}Áudio sintetizado para
                demonstrar alturas; não imita o timbre do instrumento.
              </p>
              {audioError && (
                <p role="alert" className="notice">
                  {audioError}
                </p>
              )}
            </article>
            <aside className="chord-info">
              <div className="info-heading">
                <Icon name="book" size={17} />
                <h3>Por dentro {chord.noteOnly ? "da nota" : "do acorde"}</h3>
              </div>
              <p className="small-label">
                {chord.noteOnly ? "NOTA" : "NOTAS QUE FORMAM O ACORDE"}
              </p>
              <div className="note-pills">
                {chord.notes.map((n, i) => (
                  <div
                    key={n}
                    className={i === 0 ? "note-pill root-note" : "note-pill"}
                  >
                    <strong>{names ? noteName(n) : n}</strong>
                    <span>{chord.formula[i]}</span>
                  </div>
                ))}
              </div>
              <div className="formula-row">
                <span>Fórmula intervalar</span>
                <strong>{chord.formula.join(" · ")}</strong>
              </div>
              <div className="info-divider" />
              <p className="small-label">
                {instrumentId === "piano"
                  ? "EXPLORE AS INVERSÕES"
                  : "OUTRAS POSIÇÕES"}
              </p>
              <div className="positions">
                {instrumentId === "piano" ? (
                  chord.notes.map((n, i) => (
                    <button
                      disabled={!!chord.bass}
                      className={inversion === i ? "active" : ""}
                      key={i}
                      onClick={() => setInversion(i)}
                    >
                      <span>{i === 0 ? "Fundamental" : i + "ª inversão"}</span>
                      <small>Baixo em {noteName(n)}</small>
                      {inversion === i && <Icon name="check" size={15} />}
                    </button>
                  ))
                ) : shapes.length ? (
                  shapes.map((s, i) => (
                    <button
                      key={i}
                      className={position === i ? "active" : ""}
                      onClick={() => setPosition(i)}
                    >
                      <span>Posição {i + 1}</span>
                      <small>{s.label}</small>
                      {position === i && <Icon name="check" size={15} />}
                    </button>
                  ))
                ) : (
                  <p className="muted">
                    {instrumentId === "bass" || instrumentId === "violin"
                      ? "Explore as notas no mapa. Toque uma de cada vez."
                      : instrumentId === "percussion"
                        ? "Explore o padrão rítmico na área ao lado."
                        : instrumentId === "harmonica"
                          ? "Escolha tipo e tonalidade no diagrama."
                          : "Sem posições cadastradas para esta consulta."}
                  </p>
                )}
              </div>
              {chord.bass && instrumentId === "piano" && (
                <p className="muted">
                  A cifra fixa o baixo em {noteName(chord.bass)}. Pesquise{" "}
                  {chord.root + chord.quality} para explorar todas as inversões.
                </p>
              )}
              <div className="study-tip">
                <Icon name="spark" size={19} />
                <div>
                  <strong>Dica de estudo</strong>
                  <p>
                    {instrumentId === "piano"
                      ? "Toque cada nota devagar e depois todas juntas. Perceba como a inversão muda a cor do acorde. A escolha dos dedos depende da mão e do contexto."
                      : instrumentId === "violin"
                        ? "Estude com notas longas e confira a afinação. Este mapa não representa cordas duplas ou acordes simultâneos."
                        : instrumentId === "percussion"
                          ? "Comece sem pressa e mantenha o pulso regular antes de aumentar a velocidade."
                          : "Toque cada corda separadamente. Escute as alturas e ajuste a mão sem tensionar os dedos."}
                  </p>
                </div>
              </div>
            </aside>
          </div>
          {compare && (
            <section className="comparison">
              <h2>Um acorde, diferentes caminhos.</h2>
              <p className="muted">
                {chord.symbol} em cada instrumento. Catálogo de posições
                limitado; os mapas de estudo não indicam acordes simultâneos.
              </p>
              <div className="comparison-grid">
                {instruments
                  .filter((i) => i.id !== "percussion")
                  .map((i) => (
                    <article className="compare-card" key={i.id}>
                      <h3>
                        {i.icon} {i.name}
                      </h3>
                      {i.tuningLabel && (
                        <p className="muted">{i.tuningLabel}</p>
                      )}
                      <Diagram chord={chord} instrument={i} names={names} />
                      <button
                        className="text-button"
                        onClick={() => {
                          changeInstrument(i.id);
                          setCompare(false);
                        }}
                      >
                        Explorar no {i.name.toLowerCase()}{" "}
                        <Icon name="arrow" size={15} />
                      </button>
                    </article>
                  ))}
              </div>
            </section>
          )}
        </section>
        <section className="discovery-strip">
          <div className="discovery-icon">♬</div>
          <div>
            <h3>A mesma harmonia. Novas possibilidades.</h3>
            <p>
              Troque de instrumento e descubra outras formas de tocar{" "}
              {chord.symbol}.
            </p>
          </div>
          <button onClick={() => setCompare(!compare)}>
            Comparar instrumentos <Icon name="arrow" size={17} />
          </button>
        </section>
        <footer className="main-footer">
          <span>
            {APP_NAME} <span className="footer-dot">·</span> Sua curiosidade tem
            som.
          </span>
          <button onClick={() => setModal("theory")}>
            Sobre as notas e posições <Icon name="arrow" size={13} />
          </button>
        </footer>
        {(favoritesFailed || historyFailed) && (
          <p className="notice" role="status">
            O navegador bloqueou o armazenamento local. Favoritos e histórico
            funcionam nesta sessão, mas podem não persistir.
          </p>
        )}
      </main>{" "}
      <dialog
        ref={dialog}
        className="library-dialog"
        onCancel={() => setModal(null)}
        onClick={(e) => {
          if (e.target === dialog.current) setModal(null);
        }}
      >
        <div className="dialog-top">
          <div className="eyebrow">SUA JORNADA MUSICAL</div>
          <button
            className="icon-button"
            aria-label="Fechar janela"
            onClick={() => setModal(null)}
          >
            <Icon name="close" />
          </button>
        </div>
        <h2>
          {modal === "favorites"
            ? "Seus sons favoritos."
            : modal === "history"
              ? "Por onde você passou."
              : "Um pouco de teoria."}
        </h2>
        {modal === "theory" ? (
          <div className="theory-content">
            <p>
              Uma nota é uma altura isolada. Um acorde reúne alturas diferentes;
              a tônica dá nome ao conjunto, e a fórmula descreve suas relações.
            </p>
            <div className="theory-list">
              {Object.entries(qualities).map(([q, v]) => (
                <button
                  key={q}
                  onClick={() => {
                    search("C" + q);
                    setModal(null);
                  }}
                >
                  <strong>C{q}</strong>
                  <span>{v.name}</span>
                  <small>{v.formula.join(" · ")}</small>
                </button>
              ))}
            </div>
            <h3>Precisão e cobertura</h3>
            <p>
              Teoria calculada localmente para 10 tipos de acorde, todas as
              tônicas, notas isoladas e inversões com baixo pertencente ao
              acorde. As grafias respeitam os graus, incluindo equivalências
              enarmônicas.
            </p>
            <p>
              Violão, guitarra, cavaquinho e ukulele usam um catálogo editorial
              próprio, com posições explícitas verificadas pela afinação. Isso
              não cobre todos os acordes. Não há classificação universal de
              dificuldade. O ukulele considera o sol agudo reentrante.
            </p>
            <p>
              Baixo e violino oferecem mapas para notas e arpejos; gaita oferece
              notas naturais em afinação Richter. Pandeiro tem estudo rítmico
              visual. Outros instrumentos, bends e posições avançadas ainda
              estão indisponíveis.
            </p>
            <p>
              Sem base externa de posições ou IA em tempo real. Fórmulas e
              diagramas são gerados pelo código do projeto; dependências e
              licenças estão documentadas no README.
            </p>
          </div>
        ) : (
          <>
            <p className="muted">
              {modal === "favorites"
                ? "Acordes guardados neste navegador, sempre à mão."
                : "Suas últimas 16 pesquisas reconhecidas neste navegador."}
            </p>
            <div className="library-list">
              {(modal === "favorites" ? favorites : history).length === 0 ? (
                <div className="empty-library">
                  <Icon
                    name={modal === "favorites" ? "heart" : "clock"}
                    size={35}
                  />
                  <p>
                    {modal === "favorites"
                      ? "Salve um acorde pelo coração para encontrá-lo aqui."
                      : "Pesquise um acorde para começar sua jornada."}
                  </p>
                </div>
              ) : (
                (modal === "favorites" ? favorites : history).map((s) => (
                  <div key={s}>
                    <button
                      onClick={() => {
                        search(s);
                        setModal(null);
                      }}
                    >
                      <strong>{s}</strong>
                      <span>{parse(s).chord?.name}</span>
                      <Icon name="arrow" size={16} />
                    </button>
                    {modal === "favorites" && (
                      <button
                        aria-label={"Remover " + s + " dos favoritos"}
                        className="icon-button"
                        onClick={() =>
                          setFavorites((f) => f.filter((x) => x !== s))
                        }
                      >
                        <Icon name="close" size={16} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
            {modal === "history" && history.length > 0 && (
              <button className="secondary" onClick={() => setHistory([])}>
                Limpar histórico
              </button>
            )}
          </>
        )}
      </dialog>
    </>
  );
}
