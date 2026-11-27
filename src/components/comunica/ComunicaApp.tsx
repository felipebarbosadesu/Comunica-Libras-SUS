import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Stethoscope,
  Hand,
  Users,
  Video,
  Info as InfoIcon,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Send,
  Trash2,
} from "lucide-react";
import { createWebSpeechAdapter, type SpeechStatus } from "@/lib/adapters/speech";
import {
  createVLibrasAdapter,
  LIBRAS_STATUS_LABEL,
  type LibrasStatus,
} from "@/lib/adapters/libras";
import { createBrowserVideoAdapter } from "@/lib/adapters/video";
import { createMediaPipeGestureAdapter } from "@/lib/adapters/gesture";
import { classifyStable, GESTURES, type GestureId, type Point } from "@/lib/gestures";

const LibrasMountContext = createContext<((slot: HTMLElement) => () => void) | null>(null);
import {
  addMessage,
  PATIENT_QUICK,
  PROFESSIONAL_QUICK,
  type Author,
  type Message as Msg,
} from "@/lib/session";
import {
  Breadcrumb,
  GovAvatar,
  GovButton,
  GovFooter,
  GovHeader,
  Loading,
  MagicButton,
  Message,
  SideMenu,
  SkipLinks,
  type MessageKind,
} from "@/components/govbr/govbr";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type View = "profissional" | "paciente" | "compartilhado" | "teleatendimento" | "sobre";
const VIEWS: { id: View; label: string; Icon: typeof Users }[] = [
  { id: "profissional", label: "Profissional de Saúde (SUS)", Icon: Stethoscope },
  { id: "paciente", label: "Paciente Surdo (Libras)", Icon: Hand },
  { id: "compartilhado", label: "Atendimento Presencial Compartilhado", Icon: Users },
  { id: "teleatendimento", label: "Teleatendimento por vídeo", Icon: Video },
  { id: "sobre", label: "Sobre o Projeto", Icon: InfoIcon },
];

type Notice = { id: number; kind: MessageKind; text: string };
const surface = "rounded bg-card p-[var(--spacing-scale-3x)] shadow-elevation-1";

export function ComunicaApp() {
  const [view, setView] = useState<View>("profissional");
  const [menuOpen, setMenuOpen] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [fontStep, setFontStep] = useState(0);
  const [history, setHistory] = useState<Msg[]>([]);
  const [caption, setCaption] = useState("");
  const [libras, setLibras] = useState<LibrasStatus>("processando");
  const [notices, setNotices] = useState<Notice[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const librasAdapter = useMemo(() => createVLibrasAdapter(), []);
  const librasMount = useMemo(
    () => librasAdapter.mount?.bind(librasAdapter) ?? null,
    [librasAdapter],
  );

  const notify = (kind: MessageKind, text: string) =>
    setNotices((n) => [...n.slice(-2), { id: Date.now() + Math.random(), kind, text }]);

  useEffect(() => {
    void librasAdapter.init((s) => {
      setLibras(s);
      if (s === "indisponivel")
        notify("warning", "O VLibras não conectou. As mensagens seguem em legenda em português.");
    });
  }, [librasAdapter]);
  useEffect(() => {
    document.documentElement.classList.toggle("contraste", contrast);
  }, [contrast]);
  useEffect(() => {
    document.documentElement.style.fontSize = `${100 + fontStep * 12.5}%`;
  }, [fontStep]);

  const send = (author: Author, text: string) => {
    setHistory((h) => addMessage(h, author, text));
    if (author === "profissional") {
      setCaption(text.trim());
      void librasAdapter.translate(text, setLibras);
    }
  };
  const go = (v: View) => {
    setView(v);
    setMenuOpen(false);
    setTimeout(() => document.getElementById("main-content")?.focus(), 0);
  };
  const current = VIEWS.find((v) => v.id === view)!;
  const menu = <SideMenu items={VIEWS} current={view} onSelect={go} />;

  return (
    <LibrasMountContext.Provider value={librasMount}>
      <div className="flex min-h-dvh flex-col bg-muted">
        <SkipLinks />
        <GovHeader
          onMenu={() => setMenuOpen(true)}
          contrast={contrast}
          onContrast={() => setContrast((c) => !c)}
          onFont={(d) => setFontStep((s) => (d === 0 ? 0 : Math.min(4, Math.max(-1, s + d))))}
        />

        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetContent side="left" className="p-0">
            <SheetHeader className="p-[var(--spacing-scale-3x)]">
              <SheetTitle>Menu ComunicaLibras</SheetTitle>
            </SheetHeader>
            <nav aria-label="Menu principal">{menu}</nav>
          </SheetContent>
        </Sheet>

        <div className="mx-auto flex w-full max-w-[1280px] flex-1 gap-[var(--spacing-scale-3x)] px-[var(--spacing-scale-3x)] py-[var(--spacing-scale-3x)]">
          <nav
            id="main-navigation"
            tabIndex={-1}
            aria-label="Menu principal"
            className="hidden w-72 shrink-0 self-start overflow-hidden rounded bg-card shadow-elevation-1 lg:block"
          >
            <p className="bg-primary-deep px-[var(--spacing-scale-3x)] py-[var(--spacing-scale-2x)] font-semibold text-primary-deep-foreground">
              Atendimento
            </p>
            {menu}
          </nav>

          <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 focus:outline-none">
            <Breadcrumb items={["Atendimento", current.label]} />
            <h1 className="mb-[var(--spacing-scale-3x)] text-3xl font-semibold text-foreground">
              {current.label}
            </h1>

            <div
              aria-live="polite"
              className="mb-[var(--spacing-scale-3x)] flex flex-col gap-[var(--spacing-scale-2x)] empty:mb-0"
            >
              {notices.map((n) => (
                <Message
                  key={n.id}
                  kind={n.kind}
                  onClose={() => setNotices((l) => l.filter((x) => x.id !== n.id))}
                >
                  {n.text}
                </Message>
              ))}
            </div>

            {view === "profissional" && (
              <Professional
                onSend={(t) => send("profissional", t)}
                libras={libras}
                notify={notify}
              />
            )}
            {view === "paciente" && (
              <Patient caption={caption} libras={libras} onSend={(t) => send("paciente", t)} />
            )}
            {view === "compartilhado" && (
              <div className="grid gap-[var(--spacing-scale-3x)] xl:grid-cols-2">
                <Professional
                  onSend={(t) => send("profissional", t)}
                  libras={libras}
                  notify={notify}
                  compact
                />
                <Patient
                  caption={caption}
                  libras={libras}
                  onSend={(t) => send("paciente", t)}
                  compact
                />
              </div>
            )}
            {view === "teleatendimento" && (
              <Teleconsulta
                caption={caption}
                libras={libras}
                notify={notify}
                onSend={(t) => send("profissional", t)}
                onPatient={(t) => send("paciente", t)}
              />
            )}
            {view === "sobre" && <About />}

            {view !== "sobre" && (
              <History history={history} onClear={() => setConfirmClear(true)} />
            )}
          </main>
        </div>

        <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Limpar sessão?</DialogTitle>
              <DialogDescription>
                Todo o histórico e a legenda atual serão apagados desta tela. Essa ação não pode ser
                desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <GovButton onClick={() => setConfirmClear(false)}>Cancelar</GovButton>
              <GovButton
                variant="primary"
                onClick={() => {
                  setHistory([]);
                  setCaption("");
                  setConfirmClear(false);
                  notify("success", "Sessão limpa. Nenhum dado foi mantido.");
                }}
              >
                Limpar sessão
              </GovButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <GovFooter />
      </div>
    </LibrasMountContext.Provider>
  );
}

function StatusTag({ s }: { s: LibrasStatus }) {
  const tone: Record<LibrasStatus, string> = {
    pronto: "bg-success text-success-foreground",
    processando: "bg-info-soft text-foreground",
    indisponivel: "bg-destructive text-destructive-foreground",
    pendente: "bg-warning text-warning-foreground",
  };
  return (
    <p
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold ${tone[s]}`}
    >
      {s === "processando" ? (
        <Loading size="sm" label="VLibras: Processando" />
      ) : (
        <>VLibras: {LIBRAS_STATUS_LABEL[s]}</>
      )}
    </p>
  );
}

function Field({
  id,
  label,
  hint,
  ...props
}: {
  id: string;
  label: string;
  hint?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="flex flex-col gap-[var(--spacing-scale-half)]">
      <label htmlFor={id} className="font-semibold">
        {label}
      </label>
      <textarea
        id={id}
        aria-describedby={hint ? `${id}-hint` : undefined}
        {...props}
        className="w-full rounded border border-input bg-card p-[var(--spacing-scale-2x)] text-lg text-foreground hover:bg-accent/40"
      />
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

function Professional({
  onSend,
  libras,
  notify,
  compact,
}: {
  onSend: (t: string) => void;
  libras: LibrasStatus;
  notify: (k: MessageKind, t: string) => void;
  compact?: boolean;
}) {
  const speech = useMemo(() => createWebSpeechAdapter(), []);
  const [text, setText] = useState("");
  const [notes, setNotes] = useState("");
  const [interim, setInterim] = useState("");
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [askConsent, setAskConsent] = useState(false);
  const id = compact ? "c" : "p";
  useEffect(() => () => speech.stop(), [speech]);

  const start = () => {
    setAskConsent(false);
    speech.start({
      onInterim: setInterim,
      onFinal: (t) => setText((prev) => (prev ? `${prev} ${t}` : t)),
      onStatus: (s, m) => {
        setStatus(s);
        if (s !== "listening") setInterim("");
        if (m) notify(s === "unsupported" ? "warning" : "danger", m);
      },
    });
  };

  return (
    <article aria-labelledby={`h-prof-${id}`} className={surface}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <GovAvatar initials="PS" label="Avatar do profissional de saúde" />
          <h2 id={`h-prof-${id}`} className="text-xl font-semibold">
            Profissional de Saúde
          </h2>
        </div>
        <StatusTag s={libras} />
      </div>

      <section
        aria-labelledby={`h-voz-${id}`}
        className="mt-[var(--spacing-scale-3x)] rounded bg-muted p-[var(--spacing-scale-2x)]"
      >
        <h3 id={`h-voz-${id}`} className="text-lg font-semibold">
          Transcrição de voz (Speech-to-Text)
        </h3>
        <div className="mt-[var(--spacing-scale-2x)] flex flex-wrap items-center gap-[var(--spacing-scale-2x)]">
          {status === "listening" ? (
            <GovButton variant="danger" size="lg" onClick={() => speech.stop()}>
              <MicOff aria-hidden="true" className="h-5 w-5" /> Parar transcrição
            </GovButton>
          ) : (
            <MagicButton onClick={() => setAskConsent(true)}>
              <Mic aria-hidden="true" className="h-6 w-6" /> Ativar transcrição
            </MagicButton>
          )}
          <div aria-live="polite" aria-atomic="true" className="min-h-6">
            {status === "listening" && <Loading size="sm" label={`Ouvindo… ${interim}`} />}
          </div>
        </div>
      </section>

      <section aria-labelledby={`h-txt-${id}`} className="mt-[var(--spacing-scale-3x)]">
        <h3 id={`h-txt-${id}`} className="mb-[var(--spacing-scale-2x)] text-lg font-semibold">
          Revisão antes de sinalizar
        </h3>
        <Field
          id={`msg-${id}`}
          label="Mensagem para o paciente"
          hint="Revise ou digite. Ao enviar, vira legenda e tradução em Libras."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={compact ? 3 : 4}
        />
        <div className="mt-[var(--spacing-scale-2x)] flex flex-wrap gap-[var(--spacing-scale-2x)]">
          <GovButton
            variant="primary"
            disabled={!text.trim()}
            onClick={() => {
              onSend(text);
              setText("");
            }}
          >
            <Send aria-hidden="true" className="h-4 w-4" /> Enviar para Libras
          </GovButton>
          <GovButton variant="tertiary" onClick={() => setText("")}>
            <Trash2 aria-hidden="true" className="h-4 w-4" /> Apagar
          </GovButton>
        </div>
      </section>

      <section aria-labelledby={`h-acao-${id}`} className="mt-[var(--spacing-scale-3x)]">
        <h3 id={`h-acao-${id}`} className="text-lg font-semibold">
          Ações rápidas de acolhimento
        </h3>
        <ul className="mt-[var(--spacing-scale-2x)] flex flex-wrap gap-[var(--spacing-scale-base)]">
          {PROFESSIONAL_QUICK.map((q) => (
            <li key={q}>
              <GovButton onClick={() => onSend(q)}>{q}</GovButton>
            </li>
          ))}
        </ul>
      </section>

      {!compact && (
        <section aria-labelledby={`h-notas-${id}`} className="mt-[var(--spacing-scale-3x)]">
          <h3 id={`h-notas-${id}`} className="mb-[var(--spacing-scale-2x)] text-lg font-semibold">
            Anotações do atendimento
          </h3>
          <Field
            id={`notas-${id}`}
            label="Anotações rápidas (rascunho)"
            hint="Não informe nome, CPF ou dados de prontuário. Nada é salvo."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </section>
      )}

      <Dialog open={askConsent} onOpenChange={setAskConsent}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Autorizar uso do microfone</DialogTitle>
            <DialogDescription>
              A fala será convertida em texto em tempo real, apenas nesta tela. Nenhum áudio é
              gravado ou enviado para armazenamento. Informe o paciente antes de iniciar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <GovButton onClick={() => setAskConsent(false)}>Cancelar</GovButton>
            <GovButton variant="primary" onClick={start}>
              Autorizo e iniciar
            </GovButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}

function LibrasPlayer({
  caption,
  libras,
  id,
}: {
  caption: string;
  libras: LibrasStatus;
  id: string;
}) {
  const mount = useContext(LibrasMountContext);
  const slot = useRef<HTMLDivElement>(null);
  useEffect(() => (slot.current && mount ? mount(slot.current) : undefined), [mount]);
  return (
    <section
      aria-labelledby={`h-av-${id}`}
      className="rounded bg-surface-2 p-[var(--spacing-scale-2x)] shadow-elevation-1"
    >
      <h3 id={`h-av-${id}`} className="text-lg font-semibold">
        Tradução em Libras
      </h3>
      <figure className="mt-2 flex flex-col items-center gap-2 text-center">
        <div
          ref={slot}
          data-libras-slot
          role="img"
          aria-label={
            caption
              ? `Avatar VLibras sinalizando: ${caption}`
              : "Avatar 3D do VLibras aguardando mensagem"
          }
          className="relative h-[440px] w-full overflow-hidden rounded bg-card"
        />
        <figcaption className="text-sm text-muted-foreground">
          {libras === "indisponivel"
            ? "VLibras indisponível. Leia a legenda em português abaixo ou solicite intérprete."
            : "O avatar sinaliza automaticamente cada nova mensagem. Tradução automática pendente de validação humana."}
        </figcaption>
      </figure>
      <p className="sr-only">Legenda em português:</p>
      <p
        role="log"
        aria-live="polite"
        aria-atomic="true"
        data-libras-caption
        className="mt-3 min-h-20 rounded bg-caption p-[var(--spacing-scale-2x)] text-center text-2xl font-bold leading-snug text-caption-foreground md:text-3xl"
      >
        {caption || "Aguardando mensagem do profissional…"}
      </p>
    </section>
  );
}

function Patient({
  caption,
  libras,
  onSend,
  compact,
}: {
  caption: string;
  libras: LibrasStatus;
  onSend: (t: string) => void;
  compact?: boolean;
}) {
  const id = compact ? "c" : "p";
  const [ack, setAck] = useState("");
  const ackRef = useRef<number | undefined>(undefined);
  const reply = (q: string) => {
    onSend(q);
    setAck(`Resposta enviada: ${q}`);
    window.clearTimeout(ackRef.current);
    ackRef.current = window.setTimeout(() => setAck(""), 4000);
  };
  return (
    <article aria-labelledby={`h-pac-${id}`} className={surface}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <GovAvatar
            initials="PL"
            label="Avatar do paciente usuário de Libras"
            className="bg-secondary text-secondary-foreground"
          />
          <h2 id={`h-pac-${id}`} className="text-xl font-semibold">
            Paciente Surdo (Libras)
          </h2>
        </div>
        <StatusTag s={libras} />
      </div>
      <div className="mt-[var(--spacing-scale-3x)]">
        <LibrasPlayer caption={caption} libras={libras} id={id} />
      </div>
      <section aria-labelledby={`h-resp-${id}`} className="mt-[var(--spacing-scale-3x)]">
        <h3 id={`h-resp-${id}`} className="text-lg font-semibold">
          Respostas rápidas
        </h3>
        <ul className="mt-[var(--spacing-scale-2x)] grid grid-cols-2 gap-[var(--spacing-scale-2x)] sm:grid-cols-3">
          {PATIENT_QUICK.map((q) => (
            <li key={q}>
              <button
                type="button"
                onClick={() => reply(q)}
                className="min-h-20 w-full rounded bg-primary px-4 text-xl font-semibold text-primary-foreground shadow-elevation-1 hover:bg-primary-strong"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
        <p aria-live="assertive" className="mt-2 min-h-6 font-semibold">
          {ack}
        </p>
      </section>
    </article>
  );
}

function Teleconsulta({
  caption,
  libras,
  notify,
  onSend,
  onPatient,
}: {
  caption: string;
  libras: LibrasStatus;
  notify: (k: MessageKind, t: string) => void;
  onSend: (t: string) => void;
  onPatient: (t: string) => void;
}) {
  const video = useMemo(() => createBrowserVideoAdapter(), []);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [ask, setAsk] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  useEffect(() => () => video.stop(stream), [video, stream]);

  const start = async () => {
    setAsk(false);
    setConnecting(true);
    try {
      setStream(await video.startLocal());
      notify(
        "info",
        "Câmera local ativa. A conexão com o paciente remoto ainda está pendente de integração.",
      );
    } catch (e) {
      notify(
        "danger",
        e instanceof Error
          ? `Não foi possível acessar a câmera: ${e.message}`
          : "Não foi possível acessar a câmera.",
      );
    } finally {
      setConnecting(false);
    }
  };
  const end = () => {
    video.stop(stream);
    setStream(null);
    notify("success", "Chamada encerrada. Nada foi gravado.");
  };
  const toggle = (kind: "audio" | "video") => {
    stream
      ?.getTracks()
      .filter((t) => t.kind === kind)
      .forEach((t) => (t.enabled = !t.enabled));
    if (kind === "audio") setMicOn((v) => !v);
    else setCamOn((v) => !v);
  };

  return (
    <div className="flex flex-col gap-[var(--spacing-scale-3x)]">
      <section aria-labelledby="h-video" className={surface}>
        <h2 id="h-video" className="text-xl font-semibold">
          Videochamada
        </h2>
        <div className="mt-[var(--spacing-scale-2x)] grid gap-[var(--spacing-scale-2x)] md:grid-cols-2">
          <figure className="relative aspect-video overflow-hidden rounded bg-primary-deep shadow-elevation-2">
            {stream ? (
              <video
                ref={ref}
                autoPlay
                playsInline
                muted
                aria-label="Imagem da sua câmera (pré-visualização local)"
                className="size-full -scale-x-100 object-cover"
              />
            ) : (
              <div className="grid size-full place-items-center text-primary-deep-foreground">
                {connecting ? (
                  <Loading label="Conectando câmera…" />
                ) : (
                  <GovAvatar
                    initials="PS"
                    label="Câmera desligada"
                    className="h-20 w-20 text-2xl"
                  />
                )}
              </div>
            )}
            <GestureOverlay videoRef={ref} active={!!stream && camOn} />
            <figcaption className="absolute bottom-2 left-2 rounded bg-primary-deep px-2 py-1 text-sm text-primary-deep-foreground">
              Câmera local
            </figcaption>
          </figure>
          <figure className="relative grid aspect-video place-items-center rounded bg-primary-deep text-center text-primary-deep-foreground shadow-elevation-2">
            <div className="flex flex-col items-center gap-2 p-4">
              <GovAvatar
                initials="PL"
                label="Paciente remoto aguardando conexão"
                className="h-20 w-20 bg-secondary text-2xl text-secondary-foreground"
              />
              <p>Aguardando paciente</p>
            </div>
            <figcaption className="absolute bottom-2 left-2 rounded bg-primary-deep px-2 py-1 text-sm">
              Paciente
            </figcaption>
          </figure>
        </div>
        <div
          role="toolbar"
          aria-label="Controles da chamada"
          className="mt-[var(--spacing-scale-3x)] flex flex-wrap items-center justify-center gap-[var(--spacing-scale-2x)]"
        >
          {!stream ? (
            <MagicButton onClick={() => setAsk(true)} disabled={connecting}>
              <Video aria-hidden="true" className="h-6 w-6" /> Iniciar chamada
            </MagicButton>
          ) : (
            <>
              <GovButton size="lg" aria-pressed={!micOn} onClick={() => toggle("audio")}>
                {micOn ? (
                  <Mic aria-hidden="true" className="h-5 w-5" />
                ) : (
                  <MicOff aria-hidden="true" className="h-5 w-5" />
                )}{" "}
                {micOn ? "Silenciar microfone" : "Ativar microfone"}
              </GovButton>
              <GovButton size="lg" aria-pressed={!camOn} onClick={() => toggle("video")}>
                {camOn ? (
                  <Video aria-hidden="true" className="h-5 w-5" />
                ) : (
                  <VideoOff aria-hidden="true" className="h-5 w-5" />
                )}{" "}
                {camOn ? "Desligar câmera" : "Ligar câmera"}
              </GovButton>
              <GovButton size="lg" variant="danger" onClick={end}>
                <PhoneOff aria-hidden="true" className="h-5 w-5" /> Encerrar
              </GovButton>
            </>
          )}
        </div>
        <GestureControls
          videoRef={ref}
          enabled={!!stream && camOn}
          notify={notify}
          onSend={onPatient}
        />
      </section>
      <div className="grid gap-[var(--spacing-scale-3x)] xl:grid-cols-2">
        <Professional onSend={onSend} libras={libras} notify={notify} compact />
        <div className={surface}>
          <LibrasPlayer caption={caption} libras={libras} id="t" />
        </div>
      </div>

      <Dialog open={ask} onOpenChange={setAsk}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Autorizar câmera e microfone</DialogTitle>
            <DialogDescription>
              A imagem e o som são usados apenas durante a chamada e não são gravados. Confirme que
              o paciente concorda com o teleatendimento.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <GovButton onClick={() => setAsk(false)}>Cancelar</GovButton>
            <GovButton variant="primary" onClick={() => void start()}>
              Autorizo e iniciar
            </GovButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Pontos da mão desenhados sobre o vídeo — decorativo; a informação está sempre em texto. */
const landmarksBus = { current: null as Point[] | null };
function GestureOverlay({
  videoRef,
  active,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  active: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const draw = () => {
      const c = canvas.current,
        v = videoRef.current;
      if (c && v) {
        c.width = c.clientWidth;
        c.height = c.clientHeight;
        const ctx = c.getContext("2d")!;
        ctx.clearRect(0, 0, c.width, c.height);
        const lm = landmarksBus.current;
        if (lm) {
          ctx.fillStyle = getComputedStyle(c).color;
          lm.forEach((p) => {
            ctx.beginPath();
            ctx.arc((1 - p.x) * c.width, p.y * c.height, 5, 0, Math.PI * 2);
            ctx.fill();
          });
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [active, videoRef]);
  if (!active) return null;
  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full text-gov-yellow"
    />
  );
}

function GestureControls({
  videoRef,
  enabled,
  notify,
  onSend,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  notify: (k: MessageKind, t: string) => void;
  onSend: (t: string) => void;
}) {
  const adapter = useMemo(() => createMediaPipeGestureAdapter(), []);
  const [on, setOn] = useState(false);
  const [ask, setAsk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gesture, setGesture] = useState<GestureId | null>(null);
  const recent = useRef<(GestureId | null)[]>([]);

  useEffect(() => {
    if (!on || !enabled || !videoRef.current) return;
    const v = videoRef.current;
    adapter.start(v, (f) => {
      landmarksBus.current = f.landmarks;
      recent.current = [...recent.current.slice(-29), f.gesture];
      const g = classifyStable(recent.current, 15);
      if (g) setGesture(g);
    });
    return () => {
      adapter.stop();
      landmarksBus.current = null;
    };
  }, [on, enabled, adapter, videoRef]);
  useEffect(() => {
    if (!enabled) setOn(false);
  }, [enabled]);

  const activate = async () => {
    setAsk(false);
    setLoading(true);
    try {
      await adapter.load();
      setOn(true);
    } catch {
      notify(
        "warning",
        "Não foi possível carregar o reconhecimento de gestos neste navegador. Use as respostas rápidas.",
      );
    } finally {
      setLoading(false);
    }
  };
  const send = () => {
    if (!gesture) return;
    onSend(`${GESTURES[gesture].message} (via gesto — confirmar)`);
    notify("success", `Resposta por gesto enviada: ${GESTURES[gesture].message}`);
    setGesture(null);
    recent.current = [];
  };

  return (
    <section
      aria-labelledby="h-gest"
      className="mt-[var(--spacing-scale-3x)] rounded bg-surface-2 p-[var(--spacing-scale-2x)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="h-gest" className="text-lg font-semibold">
          <Hand aria-hidden="true" className="mr-1 inline h-5 w-5" />
          Reconhecimento de gestos (experimental)
        </h3>
        <GovButton
          aria-pressed={on}
          disabled={!enabled || loading}
          onClick={() => (on ? setOn(false) : setAsk(true))}
        >
          {on ? "Desativar reconhecimento de gestos" : "Ativar reconhecimento de gestos"}
        </GovButton>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {enabled
          ? "Gestos simples e letras isoladas. Não traduz Libras e não substitui intérprete."
          : "Inicie a chamada com a câmera ligada para usar."}
      </p>
      {loading && (
        <div className="mt-2">
          <Loading size="sm" label="Carregando detector de mãos…" />
        </div>
      )}
      {on && (
        <div className="mt-[var(--spacing-scale-2x)] flex flex-wrap items-center gap-[var(--spacing-scale-2x)]">
          <p aria-live="polite" aria-atomic="true" className="min-h-8 flex-1 text-xl font-semibold">
            {gesture
              ? `Gesto reconhecido: ${GESTURES[gesture].label} (${GESTURES[gesture].hint})`
              : "Mostre a mão para a câmera…"}
          </p>
          <GovButton variant="primary" size="lg" disabled={!gesture} onClick={send}>
            <Send aria-hidden="true" className="h-5 w-5" /> Enviar esta resposta
          </GovButton>
        </div>
      )}
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer font-semibold">Gestos disponíveis</summary>
        <ul className="mt-1 grid grid-cols-2 gap-1 sm:grid-cols-3">
          {Object.values(GESTURES).map((g) => (
            <li key={g.label}>
              {g.label}: {g.hint}
            </li>
          ))}
        </ul>
      </details>
      <Dialog open={ask} onOpenChange={setAsk}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ativar reconhecimento de gestos?</DialogTitle>
            <DialogDescription>
              A imagem da câmera é analisada apenas neste navegador. Nada é gravado nem enviado. A
              sugestão de resposta só é enviada quando você confirmar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <GovButton onClick={() => setAsk(false)}>Cancelar</GovButton>
            <GovButton variant="primary" onClick={() => void activate()}>
              Concordo e ativar
            </GovButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function History({ history, onClear }: { history: Msg[]; onClear: () => void }) {
  return (
    <section aria-labelledby="h-hist" className={`${surface} mt-[var(--spacing-scale-3x)]`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="h-hist" className="text-xl font-semibold">
          Histórico de legendas da sessão
        </h2>
        <GovButton variant="danger" onClick={onClear} disabled={history.length === 0}>
          <Trash2 aria-hidden="true" className="h-4 w-4" /> Limpar sessão
        </GovButton>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Mantido apenas na memória desta aba. Some ao fechar ou limpar.
      </p>
      {history.length === 0 ? (
        <p className="mt-3">Nenhuma mensagem ainda.</p>
      ) : (
        <ol className="mt-3 flex flex-col gap-2" aria-live="polite">
          {history.map((m) => (
            <li
              key={m.id}
              className={`rounded border-l-4 p-3 ${m.author === "profissional" ? "border-primary bg-accent" : "border-secondary bg-muted"}`}
            >
              <span className="font-semibold">
                {m.author === "profissional" ? "Profissional" : "Paciente"}
              </span>{" "}
              <time className="text-sm text-muted-foreground">{m.time}</time>
              <p className="text-lg">{m.text}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function About() {
  return (
    <article aria-labelledby="h-sobre" className={`${surface} max-w-3xl`}>
      <h2 id="h-sobre" className="text-2xl font-semibold">
        Escopo e responsabilidade
      </h2>
      <section className="mt-4">
        <h3 className="text-lg font-semibold">Escopo acadêmico</h3>
        <p>
          Protótipo de extensão universitária para apoiar a comunicação entre profissionais da
          Atenção Primária e pessoas surdas usuárias de Libras em acolhimento, recepção, triagem,
          vacinação, orientações gerais e teleatendimento.
        </p>
      </section>
      <section className="mt-4">
        <h3 className="text-lg font-semibold">Unidade parceira</h3>
        <p>
          USF Barra do Pojuca — Camaçari, Bahia. Atenção Básica do Sistema Único de Saúde (SUS).
        </p>
      </section>
      <section className="mt-4">
        <h3 className="text-lg font-semibold">Responsabilidade ética</h3>
        <ul className="list-disc pl-6">
          <li>Não substitui intérprete de Libras (Lei nº 10.436/2002 e Decreto nº 5.626/2005).</li>
          <li>Não realiza diagnóstico nem registra prontuário.</li>
          <li>Não armazena dados pessoais, CPF, áudio ou vídeo (LGPD — Lei nº 13.709/2018).</li>
          <li>
            Traduções automáticas do VLibras ficam “pendentes de validação” por intérprete humano.
          </li>
          <li>
            O reconhecimento de gestos pela câmera é experimental, reconhece apenas gestos simples e
            letras isoladas, não traduz Libras e roda só no navegador: nenhuma imagem é salva ou
            enviada.
          </li>
        </ul>
      </section>
      <section className="mt-4">
        <h3 className="text-lg font-semibold">Padrão visual</h3>
        <p>
          Interface baseada no Padrão Digital de Governo (Design System gov.br v3.7): Template Base,
          Header, Skip Link, Breadcrumb, Menu, Footer, Message, Modal, Loading e Magic Button.
        </p>
      </section>
      <section className="mt-4">
        <h3 className="text-lg font-semibold">Metadados acadêmicos</h3>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          <dt className="font-semibold">Professor / Orientador</dt>
          <dd>Jader Cristiano</dd>
          <dt className="font-semibold">Faculdade</dt>
          <dd>UCSAL — Universidade Católica do Salvador</dd>
          <dt className="font-semibold">Curso</dt>
          <dd>ADS — Análise e Desenvolvimento de Sistemas</dd>
          <dt className="font-semibold">Aluno / Autor</dt>
          <dd>Felipe Vieira Barbosa</dd>
        </dl>
      </section>
    </article>
  );
}
