import { useEffect, useRef, useState } from "react";
import { Practice } from "../Practice.tsx";
import { LearningProvider, useLearning, type Page } from "./store.tsx";
import { Theory, Classical, History } from "./Education.tsx";
import { Repertoire } from "./Repertoire.tsx";
import { Studies } from "./Studies.tsx";
import { ToolPanel, ToolsHome, type Tool } from "../tools/Tools.tsx";
import { stopAllAudio } from "../audio-bus.ts";
import { lessons } from "./content.ts";
const nav: {
  id: Page;
  icon: string;
  name: string;
  short: string;
  caption: string;
}[] = [
  {
    id: "practice",
    icon: "♮",
    name: "Prática",
    short: "Prática",
    caption: "Notas, acordes e instrumentos",
  },
  {
    id: "theory",
    icon: "▤",
    name: "Teoria musical",
    short: "Teoria",
    caption: "Entender, ouvir e experimentar",
  },
  {
    id: "classical",
    icon: "♫",
    name: "Música clássica",
    short: "Escuta",
    caption: "Uma nova maneira de ouvir",
  },
  {
    id: "history",
    icon: "◷",
    name: "História da música",
    short: "História",
    caption: "Pessoas, lugares e sonoridades",
  },
  {
    id: "tools",
    icon: "∿",
    name: "Ferramentas",
    short: "Ferramentas",
    caption: "Afinador e metrônomo",
  },
  {
    id: "repertoire",
    icon: "≡",
    name: "Cifras e repertório",
    short: "Cifras",
    caption: "Suas músicas, seu jeito de tocar",
  },
  {
    id: "studies",
    icon: "✧",
    name: "Meus estudos",
    short: "Estudos",
    caption: "Seu percurso, no seu ritmo",
  },
];
export function Platform() {
  return (
    <LearningProvider>
      <Shell />
    </LearningProvider>
  );
}
function Shell() {
  const { state, update, storageError } = useLearning();
  const [request, setRequest] = useState<{
    query: string;
    nonce: number;
  } | null>(null);
  const [tool, setTool] = useState<Tool | null>(null);
  const workId = state.workId;
  const periodId = state.periodId;
  const setWorkId = (id: string) => update((s) => ({ ...s, workId: id }));
  const setPeriodId = (id: string) => update((s) => ({ ...s, periodId: id }));
  const [notice, setNotice] = useState("");
  const main = useRef<HTMLDivElement>(null);
  const current = nav.find((n) => n.id === state.page)!;
  function navigate(page: Page) {
    stopAllAudio();
    update((s) => ({
      ...s,
      page,
      ...(page !== "studies"
        ? {
            lastVisited: page,
            lastLabel:
              page === "theory"
                ? lessons.find((l) => l.id === s.lessonId)?.title ||
                  "Teoria musical"
                : nav.find((n) => n.id === page)!.name,
          }
        : {}),
    }));
    window.history.replaceState(null, "", "#" + page);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function practice(query: string) {
    setRequest({ query, nonce: Date.now() });
    navigate("practice");
  }
  function goTheory(id: string) {
    update((s) => ({ ...s, lessonId: id }));
    navigate("theory");
  }
  function goWork(id: string) {
    setWorkId(id);
    navigate("classical");
  }
  function goHistory(id: string) {
    setPeriodId(id);
    navigate("history");
  }
  const actions = { practice, tool: setTool, goTheory, goHistory, goWork };
  useEffect(() => {
    const onHash = () => {
      const value = window.location.hash.slice(1);
      if (nav.some((n) => n.id === value))
        update((s) => ({ ...s, page: value as Page }));
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    const stop = () => stopAllAudio();
    const onError = (event: Event) =>
      setNotice(
        (event as CustomEvent<string>).detail ||
          "Não foi possível iniciar o áudio neste navegador.",
      );
    window.addEventListener("dm-stop-request", stop);
    window.addEventListener("dm-audio-error", onError);
    return () => {
      window.removeEventListener("dm-stop-request", stop);
      window.removeEventListener("dm-audio-error", onError);
    };
  }, []);
  function openTool(next: Tool) {
    if (tool !== next) stopAllAudio();
    setTool(next);
  }
  return (
    <div className="app-shell platform-shell">
      <a className="skip-link" href="#conteudo-principal">
        Pular para o conteúdo
      </a>
      <aside className="sidebar">
        <a
          className="brand"
          href="#practice"
          onClick={(e) => {
            e.preventDefault();
            navigate("practice");
          }}
          aria-label="Dicionário Musical"
        >
          <div className="brand-mark">♪</div>
          <span>
            Dicionário
            <span>
              Musical<span className="brand-dot">.</span>
            </span>
          </span>
        </a>
        <div className="workspace-tag">
          <span className="tiny-dot" /> SEU ESPAÇO MUSICAL
        </div>
        <nav aria-label="Navegação principal">
          {nav.map((n) => (
            <button
              key={n.id}
              className={"nav-item " + (n.id === state.page ? "active" : "")}
              aria-current={n.id === state.page ? "page" : undefined}
              aria-label={n.name}
              onClick={() => navigate(n.id)}
            >
              <span className="platform-nav-icon" aria-hidden="true">
                {n.icon}
              </span>
              <span className="nav-full-label">{n.name}</span>
              <span className="nav-short-label">{n.short}</span>
              {n.id === state.page && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="practice-card">
            <div className="small-icon">✧</div>
            <h3>Um pouco de cada vez.</h3>
            <p>
              Sua próxima descoberta não tem prazo. Comece por onde a
              curiosidade levar.
            </p>
            <button
              onClick={() =>
                goTheory(
                  lessons.find((l) => !state.completed.includes(l.id))?.id ||
                    "som",
                )
              }
            >
              Encontre seu próximo passo →
            </button>
          </div>
          <div className="sidebar-footer">
            <span className="mini-wave">▂▅▃▇▃</span> Aprender também é fazer
            música.
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            Seu universo musical <span>/</span>
            <strong>{current.name}</strong>
          </div>
          <div className="quick-tools">
            <button
              aria-label="Abrir afinador"
              onClick={() => openTool("tuner")}
            >
              <span aria-hidden="true">∿</span>
              <span>Afinador</span>
            </button>
            <button
              aria-label="Abrir metrônomo"
              onClick={() => openTool("metronome")}
            >
              <span aria-hidden="true">♩</span>
              <span>Metrônomo</span>
            </button>
            <button
              className="global-stop"
              aria-label="Interromper todos os áudios"
              onClick={() => {
                stopAllAudio();
                setNotice("Todos os áudios e a captação foram interrompidos.");
              }}
            >
              ■
            </button>
          </div>
        </header>
        <div id="conteudo-principal" tabIndex={-1} ref={main}>
          <div hidden={state.page !== "practice"}>
            <Practice
              request={request}
              instrumentId={state.instrument}
              setInstrumentId={(id) =>
                update((s) => ({ ...s, instrument: id }))
              }
            />
          </div>
          {state.page === "theory" && (
            <Theory actions={{ ...actions, tool: openTool }} />
          )}
          {state.page === "classical" && (
            <Classical
              actions={{ ...actions, tool: openTool }}
              workId={workId}
              setWorkId={setWorkId}
            />
          )}
          {state.page === "history" && (
            <History
              actions={{ ...actions, tool: openTool }}
              periodId={periodId}
              setPeriodId={setPeriodId}
            />
          )}
          {state.page === "tools" && <ToolsHome open={openTool} />}
          <div hidden={state.page !== "repertoire"}>
            <Repertoire
              practice={practice}
              tool={openTool}
              active={state.page === "repertoire"}
            />
          </div>
          {state.page === "studies" && (
            <Studies
              navigate={navigate}
              practice={practice}
              work={goWork}
              tool={openTool}
            />
          )}
        </div>
        {storageError && (
          <p className="platform-notice" role="alert">
            {storageError}
          </p>
        )}
        {notice && (
          <div className="toast" role="status">
            {notice}
            <button aria-label="Fechar aviso" onClick={() => setNotice("")}>
              ×
            </button>
          </div>
        )}
        <footer className="platform-footer">
          <span>Dicionário Musical · Aprenda com curiosidade.</span>
          <span>Dados locais · Sem cadastro</span>
        </footer>
      </div>
      <ToolPanel
        tool={tool}
        close={() => {
          stopAllAudio();
          setTool(null);
        }}
      />
    </div>
  );
}
