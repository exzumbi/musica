import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLearning, downloadText } from "./store.tsx";
import {
  importSong,
  chordToken,
  transposeSymbol,
  transposeChordLine,
  transposeInline,
  songAsChordPro,
  soundingKey,
  keyOptions,
  type Song,
} from "./repertoire-model.ts";
import { parse, pitch, mod, pianoVoicing } from "../theory.ts";
import {
  instruments,
  shapesFor,
  playedNotes,
  type InstrumentId,
} from "../instruments.ts";
import { Diagram } from "../diagrams.tsx";
import { playAudio } from "../audio.ts";
import type { Tool } from "../tools/Tools.tsx";
export function Repertoire({
  practice,
  tool,
  active,
}: {
  practice: (s: string) => void;
  tool: (t: Tool) => void;
  active: boolean;
}) {
  const { state, update } = useLearning();
  const [query, setQuery] = useState("");
  const [importing, setImporting] = useState(false);
  const [draft, setDraft] = useState<Song>(() =>
    importSong("", "Minha música"),
  );
  const [allowed, setAllowed] = useState(false);
  const [message, setMessage] = useState("");
  const [chord, setChord] = useState<string | null>(null);
  const [scrolling, setScrolling] = useState(false);
  const [speed, setSpeed] = useState(24);
  const viewer = useRef<HTMLDivElement>(null);
  const upload = useRef<HTMLInputElement>(null);
  const song =
    state.songs.find((s) => s.id === state.selectedSong) || state.songs[0];
  const instrument = instruments.find((i) => i.id === state.instrument)!;
  function patch(next: Partial<Song>) {
    if (song)
      update((s) => ({
        ...s,
        songs: s.songs.map((m) => (m.id === song.id ? { ...m, ...next } : m)),
      }));
  }
  useEffect(() => {
    if (!active) setScrolling(false);
  }, [active]);
  useEffect(() => {
    setChord(null);
    setScrolling(false);
    if (viewer.current) viewer.current.scrollTop = 0;
  }, [song?.id]);
  useEffect(() => {
    if (!scrolling || !active) return;
    let frame = 0,
      last = 0;
    const step = (now: number) => {
      if (last && viewer.current) {
        viewer.current.scrollTop += ((now - last) / 1000) * speed;
        if (
          viewer.current.scrollTop + viewer.current.clientHeight >=
          viewer.current.scrollHeight - 1
        ) {
          setScrolling(false);
          return;
        }
      }
      last = now;
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [scrolling, speed, active]);
  async function fileSelected(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > 200000) throw new Error("Use um arquivo de até 200 KB.");
      const result = importSong(await file.text(), file.name);
      setDraft(result);
      setImporting(true);
      setAllowed(false);
      setMessage(
        "Revise título, tom e identificação de linhas antes de salvar.",
      );
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Não foi possível ler o arquivo.",
      );
    }
  }
  function newImport() {
    setDraft(importSong("", "Minha música"));
    setAllowed(false);
    setImporting(true);
    setMessage("");
  }
  function save() {
    if (!draft.title.trim() || !draft.body.trim()) {
      setMessage("Preencha título e conteúdo antes de salvar.");
      return;
    }
    if (!allowed) {
      setMessage("Confirme que você pode utilizar o conteúdo importado.");
      return;
    }
    update((s) => ({
      ...s,
      songs: [...s.songs, draft],
      selectedSong: draft.id,
      lastVisited: "repertoire",
      lastLabel: draft.title,
    }));
    setImporting(false);
    setMessage("Música salva neste navegador.");
  }
  function changeOffset(offset: number) {
    patch({ offset: Math.max(-24, Math.min(24, offset)) });
    setChord(null);
  }
  function openChord(symbol: string) {
    setChord(symbol);
  }
  function chordButton(symbol: string, key: string) {
    return chordToken(symbol) ? (
      <button
        type="button"
        className="inline-chord"
        key={key}
        onClick={() => openChord(symbol)}
      >
        {symbol}
      </button>
    ) : (
      symbol
    );
  }
  function inlineLine(text: string, lineIndex: number) {
    const parts: ReactNode[] = [];
    let cursor = 0;
    const displayed = transposeInline(text, song.offset, song.preference);
    for (const m of displayed.matchAll(/\[([^\]]+)\]/g)) {
      if (m.index! > cursor) parts.push(displayed.slice(cursor, m.index));
      const symbol = m[1];
      const next = displayed.slice(m.index! + m[0].length).split("[")[0];
      if (chordToken(symbol)) {
        parts.push(
          <span className="lyric-chunk" key={lineIndex + "-" + m.index}>
            {chordButton(symbol, lineIndex + "c" + m.index)}
            <span>{next || "\u00a0"}</span>
          </span>,
        );
        cursor = m.index! + m[0].length + next.length;
      } else {
        parts.push(m[0]);
        cursor = m.index! + m[0].length;
      }
    }
    if (cursor < displayed.length) parts.push(displayed.slice(cursor));
    return parts.length ? parts : displayed;
  }
  return (
    <div className="learning-page repertoire-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">SUAS MÚSICAS. SEU JEITO DE TOCAR.</div>
          <h1>
            Um repertório com <em>história.</em>
          </h1>
          <p className="page-intro">
            Traga suas cifras, descubra os acordes e encontre um tom confortável
            para sua voz.
          </p>
        </div>
        <button className="primary" onClick={newImport}>
          + Adicionar música
        </button>
      </div>
      <input
        ref={upload}
        type="file"
        accept=".txt,.cho,.crd,.chordpro,text/plain"
        className="sr-only"
        aria-label="Importar arquivo TXT ou ChordPro"
        onChange={(e) => {
          void fileSelected(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <div className="repertoire-layout">
        <aside className="song-library">
          <label>
            Buscar no meu repertório
            <input
              aria-label="Buscar no meu repertório"
              placeholder="Título ou artista…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <div className="song-list">
            {state.songs
              .filter((s) =>
                (s.title + " " + s.artist)
                  .toLocaleLowerCase("pt-BR")
                  .includes(query.toLocaleLowerCase("pt-BR")),
              )
              .map((s) => (
                <button
                  key={s.id}
                  className={s.id === song?.id ? "selected" : ""}
                  onClick={() =>
                    update((st) => ({
                      ...st,
                      selectedSong: s.id,
                      lastVisited: "repertoire",
                      lastLabel: s.title,
                    }))
                  }
                >
                  <span className="song-art">{s.favorite ? "♥" : "♫"}</span>
                  <span>
                    <strong>{s.title}</strong>
                    <small>{s.artist || "Artista não informado"}</small>
                  </span>
                </button>
              ))}
          </div>
          <button className="secondary" onClick={() => upload.current?.click()}>
            Importar TXT / ChordPro
          </button>
          <p className="rights-note">
            Catálogo local com dois estudos próprios. Não há busca externa nem
            importação automática de sites de cifras.
          </p>
          <a
            className="text-button"
            href="https://musicabrasilis.org.br/"
            target="_blank"
            rel="noreferrer"
          >
            Consultar acervo Musica Brasilis ↗
          </a>
          <p className="rights-note">
            Link externo de referência, sem importação. Confira os direitos de
            cada partitura, letra e gravação.
          </p>
        </aside>
        {song ? (
          <article className="song-study">
            <div className="song-heading">
              <div>
                <span className="eyebrow">{song.version || "SUA VERSÃO"}</span>
                <h2>{song.title}</h2>
                <p>{song.artist || "Artista não informado"}</p>
              </div>
              <button
                className="secondary"
                aria-pressed={song.favorite}
                onClick={() => patch({ favorite: !song.favorite })}
              >
                {song.favorite ? "♥ Favorita" : "♡ Favoritar"}
              </button>
            </div>
            <div className="song-toolbar">
              <div className="transpose">
                <button
                  aria-label="Descer cifra um semitom"
                  onClick={() => changeOffset(song.offset - 1)}
                >
                  −
                </button>
                <span>
                  {song.offset >= 0 ? "+" : ""}
                  {song.offset} semitons
                </span>
                <button
                  aria-label="Subir cifra um semitom"
                  onClick={() => changeOffset(song.offset + 1)}
                >
                  +
                </button>
              </div>
              <label>
                Tom original
                <select
                  aria-label="Tom original"
                  value={song.key}
                  onChange={(e) => patch({ key: e.target.value })}
                >
                  <option value="">Não informado</option>
                  {[
                    ...new Set([
                      ...keyOptions,
                      "Bb",
                      "Ebm",
                      "Bbm",
                      "F#m",
                      "C#m",
                      song.key,
                    ]),
                  ]
                    .filter(Boolean)
                    .map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                </select>
              </label>
              <label>
                Tom da cifra
                <select
                  aria-label="Tom de destino"
                  disabled={!song.key}
                  value={
                    song.key
                      ? transposeSymbol(song.key, song.offset, song.preference)
                      : ""
                  }
                  onChange={(e) => {
                    const source = chordToken(song.key);
                    const dest = chordToken(e.target.value);
                    if (source && dest)
                      changeOffset(mod(pitch(dest.root) - pitch(source.root)));
                  }}
                >
                  <option value="">Informe o tom original</option>
                  {[
                    ...new Set([
                      ...keyOptions,
                      "Db",
                      "Gb",
                      "Ab",
                      "Bb",
                      "Ebm",
                      "Abm",
                      "Bbm",
                      song.key
                        ? transposeSymbol(
                            song.key,
                            song.offset,
                            song.preference,
                          )
                        : "",
                    ]),
                  ]
                    .filter(Boolean)
                    .filter(
                      (k) =>
                        !song.key ||
                        chordToken(k)?.suffix === chordToken(song.key)?.suffix,
                    )
                    .map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                </select>
              </label>
              <label>
                Acidentes
                <select
                  aria-label="Preferência de acidentes"
                  value={song.preference}
                  onChange={(e) => {
                    patch({ preference: e.target.value as "sharp" | "flat" });
                    setChord(null);
                  }}
                >
                  <option value="sharp">Sustenidos</option>
                  <option value="flat">Bemóis</option>
                </select>
              </label>
              <button
                className="text-button"
                onClick={() => {
                  patch({ offset: 0, capo: 0 });
                  setChord(null);
                }}
              >
                Restaurar original
              </button>
            </div>
            <div className="song-context">
              <label>
                Capotraste · casa
                <input
                  aria-label="Casa do capotraste"
                  type="number"
                  min="0"
                  max="12"
                  value={song.capo}
                  onChange={(e) =>
                    patch({
                      capo: Math.min(
                        12,
                        Math.max(0, Math.round(Number(e.target.value) || 0)),
                      ),
                    })
                  }
                />
              </label>
              <span>
                <strong>Tom que soa: {soundingKey(song)}</strong>
                <small>
                  Transposição altera as cifras; capotraste eleva o som dessas
                  posições. Não alteramos gravações de áudio.
                </small>
              </span>
            </div>
            <div className="reading-toolbar">
              <label>
                Texto
                <input
                  aria-label="Tamanho da cifra"
                  type="range"
                  min="12"
                  max="28"
                  value={song.fontSize}
                  onChange={(e) => patch({ fontSize: Number(e.target.value) })}
                />
              </label>
              <button
                className="secondary"
                aria-pressed={scrolling}
                onClick={() => setScrolling(!scrolling)}
              >
                {scrolling ? "Pausar rolagem" : "Rolagem automática"}
              </button>
              <label>
                Velocidade
                <input
                  aria-label="Velocidade de rolagem"
                  type="range"
                  min="5"
                  max="80"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                />
              </label>
              <button className="secondary" onClick={() => tool("metronome")}>
                ♩ Metrônomo
              </button>
            </div>
            <p className="reading-hint">
              Clique em um acorde para consultar o diagrama no instrumento
              escolhido. A letra não muda ao transpor.
            </p>
            <div
              ref={viewer}
              className="song-sheet"
              tabIndex={0}
              aria-label="Letra e acordes"
              style={{ fontSize: song.fontSize }}
            >
              {song.body.split("\n").map((line, i) => {
                if (
                  /^\{(?:comment|c|start_of_chorus|end_of_chorus|start_of_verse|end_of_verse|soc|eoc)(?::[^}]*)?\}$/.test(
                    line.trim(),
                  )
                )
                  return (
                    <p key={i} className="song-section-label">
                      {line
                        .replace(/^\{(?:comment|c):\s*/, "")
                        .replace(/[{}]/g, "")}
                    </p>
                  );
                if (song.format === "chordpro")
                  return (
                    <div className="song-line inline-line" key={i}>
                      {inlineLine(line, i)}
                    </div>
                  );
                if (song.chordLines.includes(i)) {
                  const displayed = transposeChordLine(
                    line,
                    song.offset,
                    song.preference,
                  );
                  let end = 0;
                  const parts: ReactNode[] = [];
                  for (const m of displayed.matchAll(/\S+/g)) {
                    parts.push(displayed.slice(end, m.index));
                    parts.push(chordButton(m[0], i + "-" + m.index));
                    end = m.index! + m[0].length;
                  }
                  parts.push(displayed.slice(end));
                  return (
                    <div key={i} className="song-line chord-line">
                      {parts}
                    </div>
                  );
                }
                return (
                  <div key={i} className="song-line lyric-line">
                    {line || "\u00a0"}
                  </div>
                );
              })}
            </div>
            {chord && (
              <section
                className="song-chord-inspector"
                aria-label="Diagrama do acorde da cifra"
              >
                <div className="section-heading">
                  <h3>
                    {chord} · {instrument.name}
                  </h3>
                  <button
                    aria-label="Fechar diagrama"
                    className="icon-button"
                    onClick={() => setChord(null)}
                  >
                    ✕
                  </button>
                </div>
                <label>
                  Instrumento da cifra
                  <select
                    aria-label="Instrumento da cifra"
                    value={state.instrument}
                    onChange={(e) =>
                      update((s) => ({
                        ...s,
                        instrument: e.target.value as InstrumentId,
                      }))
                    }
                  >
                    {instruments.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </label>
                <ChordInspector
                  symbol={chord}
                  instrumentId={state.instrument}
                />
                <button className="text-button" onClick={() => practice(chord)}>
                  Abrir consulta completa na Prática →
                </button>
              </section>
            )}
            <div className="song-bottom-actions">
              <button
                className="secondary"
                onClick={() =>
                  downloadText(
                    song.title + ".cho",
                    songAsChordPro(song),
                    "text/plain;charset=utf-8",
                  )
                }
              >
                Exportar versão original
              </button>
              <button
                className="secondary"
                onClick={() => {
                  setDraft({ ...song });
                  setAllowed(false);
                  setImporting(true);
                }}
              >
                Editar / revisar cifra
              </button>
              <label>
                Adicionar à lista
                <select
                  aria-label="Adicionar música à lista"
                  value=""
                  onChange={(e) => {
                    if (e.target.value)
                      update((s) => ({
                        ...s,
                        lists: s.lists.map((l) =>
                          l.id === e.target.value
                            ? {
                                ...l,
                                songIds: [...new Set([...l.songIds, song.id])],
                              }
                            : l,
                        ),
                      }));
                    setMessage("Música adicionada à lista de estudo.");
                  }}
                >
                  <option value="">Escolha uma lista</option>
                  {state.lists.map((l) => (
                    <option value={l.id} key={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="song-notes-label">
              Suas anotações para esta versão
              <textarea
                aria-label="Anotações da música"
                value={song.notes}
                onChange={(e) => patch({ notes: e.target.value })}
                placeholder="Tom confortável, passagem para repetir, dedilhado…"
              />
            </label>
            <p className="rights-note">Origem: {song.source}</p>
          </article>
        ) : (
          <div className="empty-state">
            <h2>Seu próximo repertório começa aqui.</h2>
            <p>Adicione uma cifra sua ou importe um arquivo autorizado.</p>
            <button className="primary" onClick={newImport}>
              Adicionar música
            </button>
          </div>
        )}
      </div>
      {message && (
        <p className="exercise-feedback" role="status">
          {message}
        </p>
      )}
      {importing && (
        <div className="modal-backdrop">
          <ImportEditor
            draft={draft}
            setDraft={setDraft}
            allowed={allowed}
            setAllowed={setAllowed}
            close={() => setImporting(false)}
            save={() => {
              if (state.songs.some((s) => s.id === draft.id)) {
                if (!draft.title.trim() || !draft.body.trim() || !allowed) {
                  setMessage(
                    "Preencha título e conteúdo e confirme o direito de uso antes de salvar.",
                  );
                  return;
                }
                update((s) => ({
                  ...s,
                  songs: s.songs.map((m) => (m.id === draft.id ? draft : m)),
                }));
                setImporting(false);
                setMessage("Versão revisada e salva.");
              } else save();
            }}
            message={message}
          />
        </div>
      )}
    </div>
  );
}
function ChordInspector({
  symbol,
  instrumentId,
}: {
  symbol: string;
  instrumentId: InstrumentId;
}) {
  const chord = parse(symbol).chord;
  const instrument = instruments.find((i) => i.id === instrumentId)!;
  const [message, setMessage] = useState("");
  if (!chord)
    return (
      <p className="notice">
        A cifra {symbol} foi preservada e transposta, mas sua qualidade ou
        grafia ainda não tem diagrama implementado. Nenhuma posição foi
        inventada.
      </p>
    );
  const shapes = shapesFor(chord, instrument);
  const notes =
    instrumentId === "piano"
      ? pianoVoicing(chord)
      : shapes.length
        ? playedNotes(instrument, shapes[0])
        : [];
  return (
    <>
      <Diagram chord={chord} instrument={instrument} />
      <div className="button-row">
        <button
          className="secondary"
          disabled={!notes.length}
          onClick={() =>
            void playAudio(notes, 0.5, false, () => {}).catch(() =>
              setMessage("Não foi possível iniciar o áudio."),
            )
          }
        >
          Ouvir alturas
        </button>
        <span className="muted">
          Síntese genérica; não imita o instrumento.
        </span>
      </div>
      {message && <p role="status">{message}</p>}
    </>
  );
}
function ImportEditor({
  draft,
  setDraft,
  allowed,
  setAllowed,
  close,
  save,
  message,
}: {
  draft: Song;
  setDraft: (s: Song) => void;
  allowed: boolean;
  setAllowed: (b: boolean) => void;
  close: () => void;
  save: () => void;
  message: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    ref.current?.showModal();
    return () => ref.current?.close();
  }, []);
  function bodyChanged(body: string) {
    const detected = importSong(body, draft.title);
    setDraft({
      ...draft,
      body,
      format: detected.format,
      chordLines: detected.chordLines,
    });
    setTouched(true);
  }
  return (
    <dialog
      ref={ref}
      className="import-dialog"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <div className="section-heading">
        <h2>Traga uma música sua.</h2>
        <button
          className="icon-button"
          aria-label="Fechar importação"
          onClick={close}
        >
          ✕
        </button>
      </div>
      <p className="muted">
        Cole uma cifra que você tenha direito de utilizar. ChordPro usa acordes
        entre colchetes, como [C]antes da letra.
      </p>
      <div className="control-row">
        <label>
          Título
          <input
            aria-label="Título da música"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          />
        </label>
        <label>
          Artista
          <input
            aria-label="Artista da música"
            value={draft.artist}
            onChange={(e) => setDraft({ ...draft, artist: e.target.value })}
          />
        </label>
        <label>
          Versão
          <input
            aria-label="Versão da música"
            value={draft.version}
            onChange={(e) => setDraft({ ...draft, version: e.target.value })}
          />
        </label>
        <label>
          Tom informado
          <input
            aria-label="Tom informado na importação"
            placeholder="Ex.: C ou Am; deixe vazio se não souber"
            value={draft.key}
            onChange={(e) => setDraft({ ...draft, key: e.target.value })}
          />
        </label>
      </div>
      <label>
        Conteúdo
        <textarea
          className="import-body"
          aria-label="Conteúdo da cifra"
          maxLength={200000}
          value={draft.body}
          onChange={(e) => bodyChanged(e.target.value)}
        />
      </label>
      <div className="control-row">
        <label>
          Formato
          <select
            aria-label="Formato da cifra"
            value={draft.format}
            onChange={(e) =>
              setDraft({ ...draft, format: e.target.value as Song["format"] })
            }
          >
            <option value="chordpro">ChordPro · [acordes] junto à letra</option>
            <option value="txt">Texto · revisar linhas de acordes</option>
          </select>
        </label>
      </div>
      {draft.format === "txt" && (
        <div className="text-line-review">
          <h3>Revise quais linhas contêm acordes</h3>
          <p>
            Somente as linhas marcadas serão transpostas. Palavras da letra
            devem ficar desmarcadas, inclusive “A” e “Em”.
          </p>
          {draft.body.split("\n").map((line, i) => (
            <label key={i}>
              <input
                type="checkbox"
                aria-label={"Linha " + (i + 1) + " contém acordes"}
                checked={draft.chordLines.includes(i)}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    chordLines: e.target.checked
                      ? [...draft.chordLines, i]
                      : draft.chordLines.filter((n) => n !== i),
                  })
                }
              />
              <span>{i + 1}</span>
              <code>{line || "⏎"}</code>
            </label>
          ))}
        </div>
      )}
      <label className="rights-checkbox">
        <input
          type="checkbox"
          checked={allowed}
          onChange={(e) => setAllowed(e.target.checked)}
        />{" "}
        Tenho direito de utilizar esta letra/cifra e revisei o conteúdo e as
        linhas identificadas.
      </label>
      {draft.key && !/^([A-G][#b]?)(m)?$/.test(draft.key) && (
        <p className="notice">
          Informe o tom como C, F#, Bb ou Am. Não será estimado a partir do
          primeiro acorde.
        </p>
      )}
      {message && (
        <p className="exercise-feedback" role="status">
          {message}
        </p>
      )}
      <div className="button-row">
        <button
          className="primary"
          disabled={!!draft.key && !/^([A-G][#b]?)(m)?$/.test(draft.key)}
          onClick={save}
        >
          Salvar música
        </button>
        <button className="secondary" onClick={close}>
          Cancelar
        </button>
      </div>
      {touched && (
        <p className="rights-note">
          A identificação de formato e linhas é uma sugestão automática para sua
          revisão.
        </p>
      )}
    </dialog>
  );
}
