import { useRef, useState, useEffect } from "react";
import {
  useLearning,
  downloadText,
  readBackup,
  type Backup,
  type Page,
} from "./store.tsx";
import { lessons, works } from "./content.ts";
import type { Tool } from "../tools/Tools.tsx";
export function Studies({
  navigate,
  practice,
  work,
  tool,
}: {
  navigate: (p: Page) => void;
  practice: (c: string) => void;
  work: (id: string) => void;
  tool: (t: Tool) => void;
}) {
  const { state, update, replace } = useLearning();
  const [message, setMessage] = useState("");
  const [listName, setListName] = useState("");
  const [pending, setPending] = useState<Backup | null>(null);
  const [chords, setChords] = useState<string[]>([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("dm-favorites") || "[]");
      setChords(
        Array.isArray(data) ? data.filter((x) => typeof x === "string") : [],
      );
    } catch {
      setChords([]);
    }
  }, [state.page]);
  const next =
    lessons.find((l) => !state.completed.includes(l.id)) ||
    lessons[lessons.length - 1];
  function exportAll() {
    try {
      const backup: Backup = {
        format: "dicionario-musical",
        version: 1,
        exportedAt: new Date().toISOString(),
        state,
        chordFavorites: JSON.parse(
          localStorage.getItem("dm-favorites") || "[]",
        ),
        chordHistory: JSON.parse(localStorage.getItem("dm-history") || "[]"),
      };
      downloadText(
        "meus-estudos-musicais.json",
        JSON.stringify(backup, null, 2),
      );
      setMessage(
        "Cópia exportada com progresso, cifras, configurações, anotações e favoritos. Guarde o arquivo em um local seu.",
      );
    } catch {
      setMessage(
        "Não foi possível ler os dados para exportar. Verifique o armazenamento do navegador.",
      );
    }
  }
  async function importFile(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > 5000000) throw new Error("Arquivo maior que 5 MB.");
      const backup = readBackup(await file.text());
      setPending(backup);
      setMessage(
        "Arquivo válido. Confira o resumo antes de substituir os estudos deste navegador.",
      );
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Arquivo inválido. Nenhum dado foi alterado.",
      );
      setPending(null);
    }
  }
  function importAll() {
    if (!pending) return;
    try {
      localStorage.setItem(
        "dm-favorites",
        JSON.stringify(pending.chordFavorites),
      );
      localStorage.setItem("dm-history", JSON.stringify(pending.chordHistory));
      replace(pending.state);
      setChords(pending.chordFavorites);
      window.dispatchEvent(new Event("dm-storage-imported"));
      setPending(null);
      setMessage(
        "Estudos importados. Os dados e configurações foram restaurados.",
      );
    } catch {
      setMessage(
        "O navegador bloqueou o salvamento. A importação não pôde ser concluída.",
      );
    }
  }
  function addList() {
    const name = listName.trim();
    if (!name) {
      setMessage("Dê um nome à lista.");
      return;
    }
    update((s) => ({
      ...s,
      lists: [...s.lists, { id: crypto.randomUUID(), name, songIds: [] }],
    }));
    setListName("");
    setMessage(
      "Lista criada. Adicione músicas pelo repertório ou pelos controles abaixo.",
    );
  }
  function openSong(id: string) {
    update((s) => ({ ...s, selectedSong: id }));
    navigate("repertoire");
  }
  return (
    <div className="learning-page">
      <div className="eyebrow">UM ESPAÇO PARA O SEU PERCURSO</div>
      <h1>
        A música cabe no <em>seu ritmo.</em>
      </h1>
      <p className="page-intro">
        Sem sequências obrigatórias ou dias perdidos. Seus estudos ficam neste
        navegador; uma cópia exportada ajuda a levá-los com você.
      </p>
      <div className="study-overview">
        <article className="continue-card">
          <span className="small-label">CONTINUE DE ONDE PAROU</span>
          <h2>{state.lastLabel}</h2>
          <p>
            Retome sua última exploração, com a cifra ou a aula selecionada.
          </p>
          <button
            className="primary"
            onClick={() =>
              navigate(
                ([
                  "practice",
                  "theory",
                  "classical",
                  "history",
                  "tools",
                  "repertoire",
                ].includes(state.lastVisited)
                  ? state.lastVisited
                  : "theory") as Page,
              )
            }
          >
            Continuar estudo →
          </button>
        </article>
        <article className="study-stat">
          <strong>
            {state.completed.length}
            <small> / 12</small>
          </strong>
          <span>aulas concluídas</span>
          <button
            className="text-button"
            onClick={() => setShowCompleted(!showCompleted)}
          >
            {showCompleted ? "Ocultar aulas" : "Ver minhas aulas"}
          </button>
        </article>
        <article className="study-stat">
          <strong>{state.songs.length}</strong>
          <span>músicas no repertório</span>
          <button
            className="text-button"
            onClick={() => navigate("repertoire")}
          >
            Abrir repertório →
          </button>
        </article>
      </div>
      {showCompleted && (
        <section className="content-card">
          <h2>Aulas concluídas</h2>
          {state.completed.length ? (
            state.completed.map((id) => (
              <button
                className="study-chip"
                key={id}
                onClick={() => {
                  update((s) => ({ ...s, lessonId: id }));
                  navigate("theory");
                }}
              >
                ✓ {lessons.find((l) => l.id === id)?.title || id}
              </button>
            ))
          ) : (
            <p className="muted">
              Sua primeira descoberta pode começar pela aula sobre o som.
            </p>
          )}
        </section>
      )}
      <section className="content-card">
        <div className="section-heading">
          <h2>Uma sessão possível para hoje.</h2>
          <label>
            Tempo disponível
            <select
              aria-label="Duração da sessão de estudo"
              value={state.sessionMinutes}
              onChange={(e) =>
                update((s) => ({
                  ...s,
                  sessionMinutes: Number(e.target.value),
                }))
              }
            >
              {[10, 15, 20].map((n) => (
                <option key={n} value={n}>
                  {n} minutos
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="session-steps">
          <button
            onClick={() => {
              update((s) => ({ ...s, lessonId: next.id }));
              navigate("theory");
            }}
          >
            <span>
              01 ·{" "}
              {state.sessionMinutes === 10
                ? 4
                : state.sessionMinutes === 15
                  ? 6
                  : 8}{" "}
              MIN
            </span>
            <strong>{next.title}</strong>
            <p>
              Próxima aula sugerida. Você também pode explorar fora de ordem.
            </p>
          </button>
          <button onClick={() => practice("Em7")}>
            <span>
              02 ·{" "}
              {state.sessionMinutes === 10
                ? 3
                : state.sessionMinutes === 15
                  ? 5
                  : 7}{" "}
              MIN
            </span>
            <strong>Uma harmonia no instrumento</strong>
            <p>Ouça Em7, toque as notas e experimente um arpejo.</p>
          </button>
          <button onClick={() => work("mozart")}>
            <span>
              03 ·{" "}
              {state.sessionMinutes === 10
                ? 3
                : state.sessionMinutes === 15
                  ? 4
                  : 5}{" "}
              MIN
            </span>
            <strong>Um pequeno recorte de escuta</strong>
            <p>
              Observe uma ideia que volta no quarteto de Mozart. Não precisa
              ouvir a obra inteira.
            </p>
          </button>
        </div>
        <div className="lesson-callout">
          Revisão sugerida:{" "}
          {state.completed.length
            ? "volte a uma aula concluída e repita o exercício sem olhar a explicação."
            : "compare som grave e agudo antes de começar as cifras."}{" "}
          A sugestão não expira e não penaliza pausas.
        </div>
        <button className="text-button" onClick={() => tool("metronome")}>
          Levar o metrônomo para a sessão →
        </button>
      </section>
      <section className="content-card">
        <h2>Um lugar para suas descobertas.</h2>
        <label>
          Anotações gerais
          <textarea
            aria-label="Anotações gerais"
            value={state.notes}
            onChange={(e) => update((s) => ({ ...s, notes: e.target.value }))}
            placeholder="O que você percebeu ao ouvir? Qual passagem quer retomar?"
            maxLength={100000}
          />
        </label>
      </section>
      <section className="content-card">
        <h2>Seus favoritos, lado a lado.</h2>
        <div className="favorites-columns">
          <div>
            <h3>Acordes</h3>
            {chords.length ? (
              chords.map((c) => (
                <button
                  className="study-chip"
                  key={c}
                  onClick={() => practice(c)}
                >
                  ♥ {c}
                </button>
              ))
            ) : (
              <p className="muted">
                Marque o coração na Prática para guardar acordes.
              </p>
            )}
          </div>
          <div>
            <h3>Obras</h3>
            {state.favoriteWorks.length ? (
              state.favoriteWorks.map((id) => (
                <button
                  className="study-link"
                  key={id}
                  onClick={() => work(id)}
                >
                  ♥ {works.find((w) => w.id === id)?.title || id} →
                </button>
              ))
            ) : (
              <p className="muted">
                Favorite uma escuta guiada para revisitá-la.
              </p>
            )}
          </div>
          <div>
            <h3>Músicas</h3>
            {state.songs.filter((s) => s.favorite).length ? (
              state.songs
                .filter((s) => s.favorite)
                .map((s) => (
                  <button
                    className="study-link"
                    key={s.id}
                    onClick={() => openSong(s.id)}
                  >
                    ♥ {s.title} →
                  </button>
                ))
            ) : (
              <p className="muted">Marque uma música no seu repertório.</p>
            )}
          </div>
        </div>
      </section>
      <section className="content-card">
        <div className="section-heading">
          <h2>Listas para estudar.</h2>
          <div className="list-create">
            <input
              aria-label="Nome da lista"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Ex.: tocar no fim de semana"
              maxLength={100}
            />
            <button className="secondary" onClick={addList}>
              Criar lista
            </button>
          </div>
        </div>
        {state.lists.length ? (
          state.lists.map((list) => (
            <article className="study-list" key={list.id}>
              <h3>{list.name}</h3>
              <p className="muted">Selecione as músicas para esta lista.</p>
              {state.songs.map((song) => (
                <label key={song.id}>
                  <input
                    type="checkbox"
                    checked={list.songIds.includes(song.id)}
                    onChange={(e) =>
                      update((s) => ({
                        ...s,
                        lists: s.lists.map((l) =>
                          l.id === list.id
                            ? {
                                ...l,
                                songIds: e.target.checked
                                  ? [...new Set([...l.songIds, song.id])]
                                  : l.songIds.filter((id) => id !== song.id),
                              }
                            : l,
                        ),
                      }))
                    }
                  />
                  <span>{song.title}</span>
                  {list.songIds.includes(song.id) && (
                    <button
                      className="text-button"
                      onClick={() => openSong(song.id)}
                    >
                      Estudar →
                    </button>
                  )}
                </label>
              ))}
              <button
                className="text-button"
                onClick={() =>
                  update((s) => ({
                    ...s,
                    lists: s.lists.filter((l) => l.id !== list.id),
                  }))
                }
              >
                Remover esta lista
              </button>
            </article>
          ))
        ) : (
          <p className="muted">
            Crie sua primeira lista. As músicas continuam no repertório ao
            remover uma lista.
          </p>
        )}
      </section>
      {Object.entries(state.listeningNotes).filter(([, text]) => text.trim())
        .length > 0 && (
        <section className="content-card">
          <h2>Notas de escuta e história</h2>
          {Object.entries(state.listeningNotes)
            .filter(([, text]) => text.trim())
            .map(([id, text]) => (
              <article className="saved-note" key={id}>
                <h3>
                  {works.find((w) => w.id === id)?.title ||
                    id.replace("period-", "Período: ")}
                </h3>
                <p>{text}</p>
              </article>
            ))}
        </section>
      )}
      <section className="content-card backup-card">
        <div>
          <span className="small-label">SEUS DADOS CONTINUAM SEUS</span>
          <h2>Guarde uma cópia do caminho.</h2>
          <p>
            O arquivo inclui progresso, repertório, listas, favoritos, anotações
            e configurações. Limpar os dados do navegador pode removê-los deste
            dispositivo.
          </p>
        </div>
        <div className="button-row">
          <button className="primary" onClick={exportAll}>
            Exportar meus estudos
          </button>
          <button className="secondary" onClick={() => input.current?.click()}>
            Importar estudos
          </button>
          <input
            type="file"
            accept="application/json,.json"
            ref={input}
            className="sr-only"
            aria-label="Arquivo de estudos"
            onChange={(e) => {
              void importFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>
        {pending && (
          <div className="backup-preview">
            <h3>Confira antes de substituir</h3>
            <p>
              {pending.state.songs.length} músicas ·{" "}
              {pending.state.completed.length} aulas concluídas ·{" "}
              {pending.state.lists.length} listas. A importação substituirá os
              dados atuais; exporte uma cópia primeiro se desejar mantê-los.
            </p>
            <div className="button-row">
              <button className="secondary" onClick={importAll}>
                Importar e substituir os estudos
              </button>
              <button className="text-button" onClick={() => setPending(null)}>
                Cancelar importação
              </button>
            </div>
          </div>
        )}
      </section>
      {message && (
        <p className="exercise-feedback" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
