import { useEffect, useState } from "react";
import {
  lessons,
  periods,
  brazilModules,
  works,
  glossary,
  REVIEW_DATE,
  sources,
  type Source,
  type Lesson,
} from "./content.ts";
import { useLearning } from "./store.tsx";
import { Lab, AudioSafety, SequenceLab, playStudySequence } from "./Labs.tsx";
import type { Tool } from "../tools/Tools.tsx";
import { stopAudio } from "../audio.ts";
type Actions = {
  practice: (s: string) => void;
  tool: (t: Tool) => void;
  goTheory: (id: string) => void;
  goHistory: (id: string) => void;
  goWork: (id: string) => void;
};
export function SourceList({ items }: { items: Source[] }) {
  return (
    <details className="source-list">
      <summary>
        Fontes e aprofundamento · revisão{" "}
        {REVIEW_DATE.split("-").reverse().join("/")}
      </summary>
      <ul>
        {items.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.label} ↗
            </a>
            <small>
              {s.status === "consulted"
                ? "Texto consultado no repositório oficial."
                : "Referência recomendada; página e disponibilidade ainda não verificadas nesta revisão."}
            </small>
          </li>
        ))}
      </ul>
      <p>
        Textos e exercícios originais. Simplificações didáticas não substituem a
        diversidade de práticas e pesquisas.
      </p>
    </details>
  );
}
export function Theory({ actions }: { actions: Actions }) {
  const { state, update } = useLearning();
  const [glossaryQuery, setGlossaryQuery] = useState("");
  const [extras, setExtras] = useState(false);
  const selected = lessons.find((l) => l.id === state.lessonId) || lessons[0];
  function choose(l: Lesson) {
    stopAudio();
    update((s) => ({
      ...s,
      lessonId: l.id,
      lastVisited: "theory",
      lastLabel: l.title,
    }));
  }
  return (
    <div className="learning-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow">ENTENDER TAMBÉM É FAZER MÚSICA</div>
          <h1>
            Seu primeiro <em>caminho.</em>
          </h1>
          <p className="page-intro">
            Pequenas descobertas, com tempo para experimentar. Siga a trilha ou
            escolha um assunto.
          </p>
        </div>
        <div className="progress-ring">
          <strong>
            {state.completed.length}
            <small>/ 12</small>
          </strong>
          <span>aulas concluídas</span>
        </div>
      </div>
      <div className="course-layout">
        <aside className="course-outline" aria-label="Trilha de teoria">
          {lessons.map((l, i) => (
            <button
              key={l.id}
              className={selected.id === l.id ? "selected" : ""}
              aria-current={selected.id === l.id ? "step" : undefined}
              onClick={() => choose(l)}
            >
              <span className={state.completed.includes(l.id) ? "done" : ""}>
                {state.completed.includes(l.id)
                  ? "✓"
                  : String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <strong>{l.title}</strong>
                <small>
                  {l.subtitle} · {l.minutes} min
                </small>
              </div>
            </button>
          ))}
        </aside>
        <LessonView
          key={selected.id}
          lesson={selected}
          actions={actions}
          next={() => {
            const i = lessons.indexOf(selected);
            if (i < lessons.length - 1) choose(lessons[i + 1]);
          }}
        />
      </div>
      <div className="section-spacer" />
      <div className="section-heading">
        <h2>Uma dúvida no meio do caminho?</h2>
        <button className="text-button" onClick={() => setExtras(!extras)}>
          {extras ? "Fechar laboratório" : "Abrir laboratório de sequências"} →
        </button>
      </div>
      {extras && (
        <section className="content-card">
          <h3>Laboratório de harmonia</h3>
          <p>
            Crie uma sequência de até oito acordes do campo de Dó maior. Cada
            bloco abre a consulta no seu instrumento.
          </p>
          <SequenceLab practice={actions.practice} />
        </section>
      )}
      <section className="content-card glossary">
        <h3>Glossário para ter por perto</h3>
        <input
          aria-label="Pesquisar no glossário"
          placeholder="Busque motivo, sonata, pulso…"
          value={glossaryQuery}
          onChange={(e) => setGlossaryQuery(e.target.value)}
        />
        <div className="glossary-grid">
          {glossary
            .filter(([name, meaning]) =>
              (name + " " + meaning)
                .toLocaleLowerCase("pt-BR")
                .includes(glossaryQuery.toLocaleLowerCase("pt-BR")),
            )
            .map(([name, meaning]) => (
              <article key={name}>
                <strong>{name}</strong>
                <p>{meaning}</p>
              </article>
            ))}
        </div>
        <SourceList items={[sources.notation, sources.form, sources.meter]} />
      </section>
    </div>
  );
}
function LessonView({
  lesson,
  actions,
  next,
}: {
  lesson: Lesson;
  actions: Actions;
  next: () => void;
}) {
  const { state, update } = useLearning();
  const [activity, setActivity] = useState(false);
  const [review, setReview] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const completed = state.completed.includes(lesson.id);
  const reviewed = review === lesson.answer;
  return (
    <article className="lesson-view">
      <div className="lesson-meta">
        <span>
          AULA {String(lessons.indexOf(lesson) + 1).padStart(2, "0")} / 12
        </span>
        <span>◷ {lesson.minutes} minutos · no seu ritmo</span>
      </div>
      <h2>{lesson.title}</h2>
      <p className="lesson-subtitle">{lesson.subtitle}</p>
      <div className="lesson-goal">
        <span>SEU OBJETIVO</span>
        <p>{lesson.goal}</p>
      </div>
      {lesson.body.map((p) => (
        <p className="lesson-text" key={p}>
          {p}
        </p>
      ))}
      <section className="lab-card">
        <div className="lab-heading">
          <span>✧</span>
          <div>
            <span className="small-label">EXPERIMENTE NA PRÁTICA</span>
            <h3>Um conceito que você pode tocar.</h3>
          </div>
          {activity && (
            <span className="completion-badge">✓ atividade feita</span>
          )}
        </div>
        <p className="lab-instruction">{lesson.activity}</p>
        <Lab
          lesson={lesson}
          success={() => setActivity(true)}
          practice={actions.practice}
          tool={actions.tool}
        />
        <AudioSafety />
      </section>
      <section className="review-card">
        <span className="small-label">ANTES DE SEGUIR</span>
        <h3>{lesson.review}</h3>
        <div className="review-options">
          {lesson.options.map((o, i) => (
            <button
              key={o}
              aria-pressed={review === i}
              className={review === i ? "selected" : ""}
              onClick={() => setReview(i)}
            >
              <span>{String.fromCharCode(65 + i)}</span>
              {o}
              {review === i && <small>{reviewed ? "✓" : "↻"}</small>}
            </button>
          ))}
        </div>
        {review !== null && (
          <p role="status" className="exercise-feedback">
            {reviewed ? "Isso mesmo. " : "Vamos conferir. "}
            {lesson.explanation}
          </p>
        )}
      </section>
      <div className="lesson-connect">
        <button
          className="text-button"
          onClick={() => actions.practice(lesson.chord)}
        >
          Abrir {lesson.chord} no instrumento escolhido →
        </button>
        <button
          className="text-button"
          onClick={() => actions.tool("metronome")}
        >
          Praticar com metrônomo →
        </button>
      </div>
      <div className="button-row">
        <button
          className="primary"
          onClick={() => {
            if (!activity || !reviewed) {
              setMessage(
                "Conclua a atividade e acerte a revisão para registrar esta aula. Você pode repetir sem limite.",
              );
              return;
            }
            update((s) => ({
              ...s,
              completed: [...new Set([...s.completed, lesson.id])],
              lastVisited: "theory",
              lastLabel: lesson.title,
            }));
            setMessage(
              "Aula concluída e salva neste navegador. Retome quando quiser.",
            );
          }}
        >
          {completed
            ? "✓ Aula concluída · conferir novamente"
            : "Concluir aula"}
        </button>
        {completed && lesson.id !== "modos" && (
          <button className="secondary" onClick={next}>
            Próxima descoberta →
          </button>
        )}
      </div>
      {message && (
        <p className="exercise-feedback" role="status">
          {message}
        </p>
      )}
      <SourceList items={lesson.sources} />
    </article>
  );
}
const orchestraFamilies = [
  {
    title: "Cordas",
    text: "Violinos, violas, violoncelos e contrabaixos podem fazer melodia, acompanhamento, articulações e texturas.",
    sound:
      "Compare o registro agudo dos violinos com o grave dos contrabaixos.",
  },
  {
    title: "Madeiras",
    text: "Flautas, oboés, clarinetes e fagotes têm timbres e registros distintos. O nome da família não depende apenas do material físico.",
    sound:
      "Escute como uma linha de sopro pode se destacar ou se misturar às cordas.",
  },
  {
    title: "Metais",
    text: "Trompas, trompetes, trombones e tuba participam de melodias, apoios harmônicos e contrastes. Não servem apenas para tocar forte.",
    sound:
      "Perceba variações de intensidade e presença, inclusive em passagens suaves.",
  },
  {
    title: "Percussão e outros",
    text: "Tímpanos têm alturas definidas; muitos outros instrumentos de percussão não têm. Harpa, teclados e vozes entram conforme a obra.",
    sound: "Diferencie pulsação, efeitos de cor e notas com altura definida.",
  },
];
export function Classical({
  actions,
  workId,
  setWorkId,
}: {
  actions: Actions;
  workId: string;
  setWorkId: (id: string) => void;
}) {
  const { state, update } = useLearning();
  const work = works.find((w) => w.id === workId) || works[0];
  const [before, setBefore] = useState("");
  useEffect(() => setBefore(""), [work.id]);
  return (
    <div className="learning-page">
      <div className="eyebrow">APRENDER A OUVIR, SEM PRECISAR SABER TUDO</div>
      <h1>
        Uma escuta mais <em>atenta.</em>
      </h1>
      <p className="page-intro">
        Você não precisa reconhecer cada instrumento para começar. Escolha uma
        ideia, ouça de novo e descubra o que mudou.
      </p>
      <div className="lesson-callout">
        <strong>Clássica ou Classicismo?</strong>
        <p>
          “Música clássica” costuma nomear, de forma ampla e imprecisa, uma
          tradição de concerto. “Classicismo” é um recorte histórico,
          aproximadamente entre 1750 e 1820. Nem toda música de concerto é do
          Classicismo, e essa tradição não representa toda a música do mundo.
        </p>
      </div>
      <section className="content-card">
        <div className="section-heading">
          <h2>Quatro perguntas para começar.</h2>
          <span className="pill-tag">10–15 MINUTOS</span>
        </div>
        <div className="listening-steps">
          {[
            [
              "01",
              "O que fica?",
              "Encontre um pulso, uma textura ou um gesto recorrente.",
            ],
            [
              "02",
              "O que volta?",
              "Procure uma ideia curta: um motivo pode crescer em tema ou frase.",
            ],
            [
              "03",
              "O que muda?",
              "Perceba contrastes de timbre, intensidade, registro e instrumentação.",
            ],
            [
              "04",
              "O que você sente?",
              "Descreva sua experiência sem achar que existe uma única resposta emocional correta.",
            ],
          ].map(([n, t, p]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{t}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
      <h2 className="section-title">Uma pequena porta de entrada.</h2>
      <div
        className="work-tabs"
        role="group"
        aria-label="Obras para escuta guiada"
      >
        {works.map((w) => (
          <button
            key={w.id}
            className={work.id === w.id ? "selected" : ""}
            onClick={() => {
              setWorkId(w.id);
              update((s) => ({
                ...s,
                lastVisited: "classical",
                lastLabel: w.title,
              }));
            }}
          >
            <span>{w.composer}</span>
            <strong>{w.title}</strong>
            <small>{w.formation}</small>
          </button>
        ))}
      </div>
      <article className="work-detail content-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              ESCUTA GUIADA · SEM MARCAÇÕES DE TEMPO NÃO CONFERIDAS
            </span>
            <h2>{work.title}</h2>
            <p>
              {work.composer} · {work.formation}
            </p>
          </div>
          <button
            className="secondary"
            aria-pressed={state.favoriteWorks.includes(work.id)}
            onClick={() =>
              update((s) => ({
                ...s,
                favoriteWorks: s.favoriteWorks.includes(work.id)
                  ? s.favoriteWorks.filter((id) => id !== work.id)
                  : [...s.favoriteWorks, work.id],
              }))
            }
          >
            {state.favoriteWorks.includes(work.id)
              ? "♥ Obra favorita"
              : "♡ Favoritar obra"}
          </button>
        </div>
        <p className="lesson-text">{work.context}</p>
        <div className="guided-layout">
          <section>
            <span className="small-label">ANTES</span>
            <h3>{work.before}</h3>
            <textarea
              aria-label="Resposta antes da escuta"
              placeholder="Uma hipótese, uma imagem, uma pergunta…"
              value={before}
              onChange={(e) => setBefore(e.target.value)}
            />
            <span className="small-label">DURANTE</span>
            <ol>
              {work.listen.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ol>
            <a
              className="external-button"
              href={work.link}
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                window.dispatchEvent(new Event("dm-stop-request"));
              }}
            >
              {work.linkLabel} ↗
            </a>
            <p className="rights-note">
              {work.verifiedLink
                ? "Link de gravação identificado no material consultado do Open Music Theory. Reprodução depende da plataforma, região e eventual conta. A gravação não foi ouvida nem cronometrada nesta revisão."
                : "Este é um link de catálogo institucional, não uma gravação específica verificada. Escolha uma versão publicada pelo intérprete, instituição ou serviço licenciado; a ligação direta ainda está pendente."}{" "}
              Não hospedamos gravações, partituras ou letras dessas obras.
              Direitos da composição, edição e interpretação são distintos.
            </p>
          </section>
          <section>
            <span className="small-label">DEPOIS</span>
            <h3>{work.after}</h3>
            <textarea
              aria-label="Anotações da escuta"
              placeholder="O que você percebeu? Sua resposta fica salva aqui."
              value={state.listeningNotes[work.id] || ""}
              onChange={(e) =>
                update((s) => ({
                  ...s,
                  listeningNotes: {
                    ...s.listeningNotes,
                    [work.id]: e.target.value,
                  },
                }))
              }
            />
            <div className="lesson-connect">
              <button
                className="secondary"
                onClick={() => actions.goTheory(work.theory)}
              >
                Conectar com teoria →
              </button>
              <button
                className="secondary"
                onClick={() => actions.goHistory(work.period)}
              >
                Conhecer o período →
              </button>
            </div>
            <p className="muted">
              A escuta é aberta: suas anotações registram observações, não uma
              nota ou julgamento.
            </p>
          </section>
        </div>
        <SourceList items={work.sources} />
      </article>
      <section className="content-card">
        <h2>Quem faz o som da orquestra?</h2>
        <div className="orchestra-grid">
          {orchestraFamilies.map((f) => (
            <article key={f.title}>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              <small>{f.sound}</small>
            </article>
          ))}
        </div>
        <SourceList items={[sources.orchestra]} />
      </section>
      <section className="content-card">
        <h2>Palavras para acompanhar uma obra</h2>
        <div className="glossary-grid">
          {glossary
            .filter(([n]) =>
              [
                "Motivo",
                "Tema",
                "Frase",
                "Textura",
                "Movimento",
                "Sinfonia",
                "Concerto",
                "Sonata",
                "Suíte",
                "Fuga",
                "Ópera",
              ].includes(n),
            )
            .map(([n, t]) => (
              <article key={n}>
                <strong>{n}</strong>
                <p>{t}</p>
              </article>
            ))}
        </div>
        <SourceList items={[sources.form]} />
      </section>
    </div>
  );
}
export function History({
  actions,
  periodId,
  setPeriodId,
}: {
  actions: Actions;
  periodId: string;
  setPeriodId: (id: string) => void;
}) {
  const { state, update } = useLearning();
  const [compare, setCompare] = useState("classicism");
  const [track, setTrack] = useState<"west" | "brazil">("west");
  const [feedback, setFeedback] = useState("");
  const period = periods.find((p) => p.id === periodId) || periods[3];
  const second = periods.find((p) => p.id === compare)!;
  const linkedWork = works.find((w) => w.period === period.id);
  function demo(which: "baroque" | "classicism") {
    const notes =
      which === "baroque"
        ? [60, 62, 64, 65, 67, 65, 64, 62]
        : [60, 64, 67, 72, 67, 64, 62, 60];
    void playStudySequence(
      notes.map((midi, i) => ({
        midi,
        at: i * 0.3,
        duration: 0.25,
        level: 0.7,
      })),
      0.5,
    ).catch(() => window.dispatchEvent(new CustomEvent("dm-audio-error")));
    setFeedback(
      "Exemplo original sintetizado para comparar contorno, não uma reconstrução sonora nem uma gravação histórica. Instrumentação e contexto não podem ser avaliados por este timbre genérico.",
    );
  }
  return (
    <div className="learning-page">
      <div className="eyebrow">MÚSICA ACONTECE ENTRE PESSOAS</div>
      <h1>
        Ouça também as <em>histórias.</em>
      </h1>
      <p className="page-intro">
        Uma linha do tempo é uma forma de organizar perguntas, não uma regra
        universal. Datas aproximadas se sobrepõem e variam entre regiões.
      </p>
      <p className="source-status-banner">
        Conteúdo introdutório: as referências institucionais de história
        aguardam conferência de acesso. Cada fonte mostra seu status e a data de
        revisão; use os links para aprofundar, sem tratar esta síntese como
        história universal.
      </p>
      <div className="segmented-control">
        <button
          className={track === "west" ? "active" : ""}
          onClick={() => setTrack("west")}
        >
          Tradição ocidental de concerto
        </button>
        <button
          className={track === "brazil" ? "active" : ""}
          onClick={() => setTrack("brazil")}
        >
          Músicas no Brasil
        </button>
      </div>
      {track === "brazil" ? (
        <>
          <div className="lesson-callout">
            Esta trilha tem recortes próprios. Tradições indígenas, africanas,
            afro-brasileiras e populares não são encaixadas como etapas de uma
            cronologia europeia.
          </div>
          <div className="brazil-grid">
            {brazilModules.map((m) => (
              <article key={m.id} className="content-card">
                <span className="eyebrow">{m.scope}</span>
                <h2>{m.title}</h2>
                <p className="lesson-text">{m.text}</p>
                <div className="study-question">
                  <strong>Uma pergunta para investigar</strong>
                  <p>{m.activity}</p>
                </div>
                {m.id === "concert" && (
                  <button
                    className="secondary"
                    onClick={() => actions.goWork("villa")}
                  >
                    Escuta: Villa-Lobos →
                  </button>
                )}
                <SourceList items={m.sources} />
              </article>
            ))}
          </div>
        </>
      ) : (
        <>
          <div
            className="timeline"
            role="group"
            aria-label="Períodos históricos"
          >
            {periods.map((p, i) => (
              <button
                key={p.id}
                className={p.id === period.id ? "selected" : ""}
                onClick={() => setPeriodId(p.id)}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                <strong>{p.title}</strong>
                <small>{p.dates}</small>
              </button>
            ))}
          </div>
          <article className="period-detail content-card">
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  RECORTE EUROPEU · {period.dates}
                </span>
                <h2>{period.title}</h2>
              </div>
              {linkedWork && (
                <button
                  className="secondary"
                  onClick={() => actions.goWork(linkedWork.id)}
                >
                  Abrir escuta guiada →
                </button>
              )}
            </div>
            <p className="lesson-text">{period.context}</p>
            <div className="history-facts">
              {[
                ["Onde e para quem", period.audience],
                ["O que escutar", period.sound],
                ["Instrumentos e formações", period.instruments],
                ["Formas e gêneros", period.forms],
                ["Pessoas e trajetórias", period.people],
                ["Para conhecer", period.work],
              ].map(([title, text]) => (
                <section key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </section>
              ))}
            </div>
            <div className="study-question">
              <strong>Compare e anote</strong>
              <p>{period.compare}</p>
              <textarea
                aria-label="Anotações históricas"
                placeholder="Registre uma observação; ela ficará em Meus estudos."
                value={state.listeningNotes["period-" + period.id] || ""}
                onChange={(e) =>
                  update((s) => ({
                    ...s,
                    listeningNotes: {
                      ...s.listeningNotes,
                      ["period-" + period.id]: e.target.value,
                    },
                  }))
                }
              />
            </div>
            <SourceList items={period.sources} />
          </article>
          <section className="content-card">
            <div className="section-heading">
              <h2>Uma história ao lado da outra.</h2>
              <label>
                Comparar com
                <select
                  aria-label="Comparar período"
                  value={compare}
                  onChange={(e) => setCompare(e.target.value)}
                >
                  {periods.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="comparison-table-scroll">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Olhar</th>
                    <th>{period.title}</th>
                    <th>{second.title}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Som", "sound"],
                    ["Instrumentação", "instruments"],
                    ["Circulação e papel dos músicos", "audience"],
                  ].map(([label, key]) => (
                    <tr key={key}>
                      <th>{label}</th>
                      <td>{period[key as "sound"]}</td>
                      <td>{second[key as "sound"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="period-recording-links">
              {[period, second].map((p, index) => {
                const recording = works.find((w) => w.period === p.id);
                return (
                  <section key={p.id + "-" + index}>
                    <h3>{p.title} · escuta</h3>
                    {recording ? (
                      <>
                        <p>
                          {recording.composer}: {recording.title}
                        </p>
                        <a
                          className="external-button"
                          href={recording.link}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() =>
                            window.dispatchEvent(new Event("dm-stop-request"))
                          }
                        >
                          {recording.verifiedLink
                            ? "Abrir gravação na plataforma"
                            : "Consultar catálogo institucional"}{" "}
                          ↗
                        </a>
                        <small>
                          {recording.verifiedLink
                            ? "Link identificado no material consultado; disponibilidade depende da plataforma."
                            : "Sem gravação direta conferida nesta revisão."}
                        </small>
                      </>
                    ) : (
                      <p>
                        Este módulo ainda não tem uma gravação específica
                        selecionada. A comparação textual continua disponível.
                      </p>
                    )}
                  </section>
                );
              })}
            </div>
            <div className="button-row">
              <button className="secondary" onClick={() => demo("baroque")}>
                Ouvir um motivo em movimento
              </button>
              <button className="secondary" onClick={() => demo("classicism")}>
                Ouvir um contorno em arpejo
              </button>
            </div>
            {feedback && (
              <p className="rights-note" role="status">
                {feedback}
              </p>
            )}
            <p className="muted">
              Para comparar períodos pelo som real, use as gravações externas
              indicadas nas escutas de Bach, Mozart e Beethoven. Os exemplos
              acima apenas apoiam conceitos teóricos e não rotulam estilos
              históricos.
            </p>
            <button
              className="text-button"
              onClick={() => actions.goWork("bach")}
            >
              Ir às escutas guiadas →
            </button>
            <AudioSafety />
          </section>
        </>
      )}
    </div>
  );
}
