/**
 * SpeechAdapter — abstração desacoplada de reconhecimento de voz (pt-BR).
 * Implementação padrão: Web Speech API do navegador. Nenhum áudio é gravado ou armazenado.
 */
export type SpeechStatus = "idle" | "listening" | "unsupported" | "error";

export interface SpeechCallbacks {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onStatus: (status: SpeechStatus, message?: string) => void;
}

export interface SpeechAdapter {
  isSupported(): boolean;
  start(cb: SpeechCallbacks): void;
  stop(): void;
}

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult:
    | ((e: {
        resultIndex: number;
        results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
      }) => void)
    | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

export function createWebSpeechAdapter(): SpeechAdapter {
  let rec: RecognitionLike | null = null;
  const getCtor = () => {
    if (typeof window === "undefined") return undefined;
    const w = window as unknown as Record<string, unknown>;
    return (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as
      (new () => RecognitionLike) | undefined;
  };
  return {
    isSupported: () => !!getCtor(),
    start(cb) {
      const Ctor = getCtor();
      if (!Ctor)
        return cb.onStatus("unsupported", "Reconhecimento de voz não disponível neste navegador.");
      rec = new Ctor();
      rec.lang = "pt-BR";
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i]!;
          if (r.isFinal) cb.onFinal(r[0].transcript.trim());
          else interim += r[0].transcript;
        }
        cb.onInterim(interim);
      };
      rec.onerror = (e) => cb.onStatus("error", `Erro no microfone: ${e.error}`);
      rec.onend = () => cb.onStatus("idle");
      rec.start();
      cb.onStatus("listening");
    },
    stop() {
      rec?.stop();
      rec = null;
    },
  };
}

/** Adaptador simulado para testes automatizados. */
export function createMockSpeechAdapter(phrases: string[]): SpeechAdapter {
  return {
    isSupported: () => true,
    start(cb) {
      cb.onStatus("listening");
      phrases.forEach((p) => cb.onFinal(p));
      cb.onStatus("idle");
    },
    stop() {},
  };
}
