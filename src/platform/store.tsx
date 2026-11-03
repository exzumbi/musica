import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { baseState, validateState, type LearningState } from "./store-model.ts";
export { downloadText, readBackup } from "./store-model.ts";
export type { Page, LearningState, Backup } from "./store-model.ts";
type Store = {
  state: LearningState;
  update: (fn: (s: LearningState) => LearningState) => void;
  storageError: string;
  replace: (s: LearningState) => void;
};
const Context = createContext<Store | null>(null);
export function LearningProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => {
    try {
      const saved = localStorage.getItem("dm-learning");
      return {
        state: saved ? validateState(JSON.parse(saved)) : baseState(),
        error: "",
      };
    } catch {
      try {
        const raw = localStorage.getItem("dm-learning");
        if (raw) localStorage.setItem("dm-learning-recovery", raw);
      } catch {
        /* Storage may be unavailable. */
      }
      return {
        state: baseState(),
        error:
          "Não foi possível recuperar seus estudos. Os dados antigos foram preservados; esta sessão não os substituirá automaticamente. Exporte esta sessão ou importe uma cópia válida para retomar o salvamento.",
      };
    }
  });
  const [state, setState] = useState<LearningState>(initial.state);
  const [error, setError] = useState(initial.error);
  const [dirty, setDirty] = useState(false);
  const [canSave, setCanSave] = useState(!initial.error);
  const update = (fn: (s: LearningState) => LearningState) => {
    setDirty(true);
    setState(fn);
  };
  useEffect(() => {
    if (!dirty || !canSave) return;
    try {
      localStorage.setItem("dm-learning", JSON.stringify(state));
      setError("");
    } catch {
      setError(
        "O navegador não conseguiu salvar seus estudos. Exporte uma cópia; nesta sessão os dados continuam disponíveis.",
      );
    }
  }, [state, dirty, canSave]);
  return (
    <Context.Provider
      value={{
        state,
        update,
        storageError: error,
        replace: (s) => {
          setCanSave(true);
          update(() => s);
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useLearning() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("LearningProvider ausente");
  return ctx;
}
