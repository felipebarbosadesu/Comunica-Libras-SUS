/**
 * Componentes do Padrão Digital de Governo (Design System gov.br v3.7) reimplementados
 * em React + Tailwind com tokens semânticos (src/styles.css).
 */
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Info, CheckCircle2, AlertTriangle, XCircle, X, Menu, ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "tertiary" | "danger";
export function GovButton({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg" }) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45",
        size === "sm" && "h-8 px-4 text-sm",
        size === "md" && "h-10 px-6 text-base",
        size === "lg" && "min-h-12 px-8 text-lg",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary-strong",
        variant === "secondary" && "border border-primary bg-card text-primary hover:bg-accent",
        variant === "tertiary" && "bg-transparent text-primary hover:bg-accent",
        variant === "danger" && "bg-destructive text-destructive-foreground hover:opacity-90",
        className,
      )}
    />
  );
}

/** br-magic-button: ação de destaque única por tela. */
export function MagicButton({ className, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <span className="inline-flex rounded-full bg-accent p-[var(--spacing-scale-base)] shadow-elevation-1">
      <button
        type="button"
        {...props}
        className={cn(
          "inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-primary px-8 text-lg font-semibold text-primary-foreground shadow-elevation-2 transition-colors hover:bg-primary-strong disabled:opacity-45",
          className,
        )}
      >
        {children}
      </button>
    </span>
  );
}

export function Loading({ label, size = "md" }: { label: string; size?: "sm" | "md" }) {
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={cn(
          "inline-block rounded-full border-primary border-t-transparent",
          size === "sm" ? "h-5 w-5 border-[3px]" : "h-10 w-10 border-4",
        )}
        style={{ animation: "gov-spin 0.9s linear infinite" }}
      />
      <span className={size === "sm" ? "text-sm" : ""}>{label}</span>
    </span>
  );
}

export type MessageKind = "info" | "success" | "warning" | "danger";
const msgStyle: Record<MessageKind, { box: string; bar: string; Icon: typeof Info; label: string }> = {
  info: { box: "bg-info-soft", bar: "bg-info", Icon: Info, label: "Informação" },
  success: { box: "bg-success-soft", bar: "bg-success", Icon: CheckCircle2, label: "Sucesso" },
  warning: { box: "bg-warning-soft", bar: "bg-warning", Icon: AlertTriangle, label: "Atenção" },
  danger: { box: "bg-danger-soft", bar: "bg-destructive", Icon: XCircle, label: "Erro" },
};
/** br-message (feedback/notificação). */
export function Message({ kind, children, onClose }: { kind: MessageKind; children: ReactNode; onClose?: () => void }) {
  const s = msgStyle[kind];
  return (
    <div className={cn("flex items-stretch overflow-hidden rounded", s.box)}>
      <div className={cn("flex w-14 shrink-0 items-center justify-center", s.bar)}>
        <s.Icon aria-hidden="true" className="h-6 w-6 text-primary-foreground" />
      </div>
      <p className="flex-1 p-[var(--spacing-scale-2x)] text-foreground">
        <strong>{s.label}. </strong>
        {children}
      </p>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Fechar mensagem" className="m-2 grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary hover:bg-accent">
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export function GovAvatar({ label, initials, className }: { label: string; initials: string; className?: string }) {
  return (
    <span role="img" aria-label={label} className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-full bg-primary text-lg font-bold text-primary-foreground", className)}>
      <span aria-hidden="true">{initials}</span>
    </span>
  );
}

export function SkipLinks() {
  const cls =
    "sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded focus:bg-primary-deep focus:px-4 focus:py-3 focus:font-semibold focus:text-primary-deep-foreground";
  return (
    <nav aria-label="Atalhos de teclado">
      <a className={cls} href="#main-content" accessKey="1">Ir para o conteúdo [1]</a>
      <a className={cls} href="#main-navigation" accessKey="2">Ir para o menu [2]</a>
      <a className={cls} href="#footer" accessKey="4">Ir para o rodapé [4]</a>
    </nav>
  );
}

export function GovLogo() {
  return (
    <span aria-label="gov.br" role="img" className="text-2xl font-extrabold tracking-tight">
      <span aria-hidden="true">
        <span className="text-gov-blue">g</span>
        <span className="text-gov-yellow">o</span>
        <span className="text-gov-green">v</span>
        <span className="text-gov-blue">.br</span>
      </span>
    </span>
  );
}

export function GovHeader({
  onMenu,
  contrast,
  onContrast,
  onFont,
}: {
  onMenu: () => void;
  contrast: boolean;
  onContrast: () => void;
  onFont: (d: -1 | 0 | 1) => void;
}) {
  const fn = "grid h-10 min-w-10 place-items-center rounded-full px-2 text-sm font-semibold text-primary hover:bg-accent";
  return (
    <header className="bg-card shadow-elevation-2">
      <div className="mx-auto max-w-[1280px] px-[var(--spacing-scale-3x)]">
        <div className="flex flex-wrap items-center justify-between gap-[var(--spacing-scale-2x)] py-[var(--spacing-scale-2x)]">
          <div className="flex min-w-0 items-center gap-[var(--spacing-scale-2x)]">
            <GovLogo />
            <span aria-hidden="true" className="h-8 w-px bg-border" />
            <span className="truncate text-sm text-muted-foreground">Ministério da Saúde · SUS · Atenção Básica</span>
          </div>
          <div role="group" aria-label="Funcionalidades do sistema" className="flex items-center gap-1">
            <button className={fn} onClick={() => onFont(-1)} aria-label="Diminuir tamanho da fonte">A-</button>
            <button className={fn} onClick={() => onFont(0)} aria-label="Restaurar tamanho da fonte">A</button>
            <button className={fn} onClick={() => onFont(1)} aria-label="Aumentar tamanho da fonte">A+</button>
            <button className={fn} onClick={onContrast} aria-pressed={contrast}>
              <span aria-hidden="true">◐</span>&nbsp;Alto contraste
            </button>
          </div>
        </div>
        <div className="flex items-center gap-[var(--spacing-scale-2x)] pb-[var(--spacing-scale-3x)]">
          <button type="button" onClick={onMenu} aria-label="Abrir menu de navegação" className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-primary hover:bg-accent lg:hidden">
            <Menu aria-hidden="true" className="h-6 w-6" />
          </button>
          <div className="min-w-0">
            <p className="text-xl font-semibold leading-tight text-foreground md:text-2xl">ComunicaLibras — Teleatendimento Inclusivo</p>
            <p className="text-sm text-muted-foreground">USF Barra do Pojuca · Camaçari-BA</p>
          </div>
        </div>
      </div>
      <div role="note" className="border-t-4 border-warning bg-warning-soft">
        <p className="mx-auto max-w-[1280px] px-[var(--spacing-scale-3x)] py-[var(--spacing-scale-base)] text-sm font-semibold text-warning-foreground">
          <span aria-hidden="true">⚠ </span>Protótipo acadêmico de extensão universitária — não substitui intérprete de Libras e não realiza diagnóstico médico.
        </p>
      </div>
    </header>
  );
}

export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <nav aria-label="Você está aqui" className="py-[var(--spacing-scale-2x)]">
      <ol className="flex flex-wrap items-center gap-1 text-sm">
        <li className="flex items-center">
          <Home aria-hidden="true" className="h-4 w-4 text-primary" />
          <span className="sr-only">Início</span>
        </li>
        {items.map((it, i) => (
          <li key={it} className="flex items-center gap-1">
            <ChevronRight aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
            <span aria-current={i === items.length - 1 ? "page" : undefined} className={i === items.length - 1 ? "font-semibold" : "text-primary"}>
              {it}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SideMenu<T extends string>({
  items,
  current,
  onSelect,
}: {
  items: { id: T; label: string; Icon: typeof Info }[];
  current: T;
  onSelect: (id: T) => void;
}) {
  return (
    <ul className="flex flex-col">
      {items.map(({ id, label, Icon }) => (
        <li key={id}>
          <button
            type="button"
            aria-current={current === id ? "page" : undefined}
            onClick={() => onSelect(id)}
            className={cn(
              "flex w-full items-center gap-[var(--spacing-scale-2x)] border-b border-border px-[var(--spacing-scale-3x)] py-[var(--spacing-scale-2x)] text-left text-base hover:bg-accent",
              current === id ? "border-l-4 border-l-primary bg-accent font-semibold text-primary" : "text-foreground",
            )}
          >
            <Icon aria-hidden="true" className="h-5 w-5 shrink-0" />
            {label}
          </button>
        </li>
      ))}
    </ul>
  );
}

export function GovFooter() {
  return (
    <footer id="footer" className="bg-primary-deep text-primary-deep-foreground">
      <div className="mx-auto max-w-[1280px] px-[var(--spacing-scale-3x)] py-[var(--spacing-scale-5x)]">
        <p className="text-3xl font-extrabold" aria-label="gov.br">gov.br</p>
        <div className="mt-[var(--spacing-scale-5x)] grid gap-[var(--spacing-scale-3x)] md:grid-cols-3">
          <section aria-labelledby="ft-servico">
            <h2 id="ft-servico" className="border-b border-primary-deep-foreground/30 pb-2 font-bold uppercase">Serviço</h2>
            <ul className="mt-2 space-y-1 text-sm">
              <li>USF Barra do Pojuca — Camaçari, Bahia</li>
              <li>Atenção Primária à Saúde · SUS</li>
              <li>Disque Saúde: 136</li>
            </ul>
          </section>
          <section aria-labelledby="ft-acess">
            <h2 id="ft-acess" className="border-b border-primary-deep-foreground/30 pb-2 font-bold uppercase">Acessibilidade</h2>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Atalhos: Alt+1 conteúdo, Alt+2 menu, Alt+4 rodapé</li>
              <li>Tradução automática via VLibras</li>
              <li>Conformidade com eMAG e WCAG 2.1</li>
            </ul>
          </section>
          <section aria-labelledby="ft-priv">
            <h2 id="ft-priv" className="border-b border-primary-deep-foreground/30 pb-2 font-bold uppercase">Privacidade (LGPD)</h2>
            <ul className="mt-2 space-y-1 text-sm">
              <li>Sem login e sem armazenamento de dados</li>
              <li>Nenhum áudio ou vídeo é gravado</li>
              <li>Histórico somente na memória da sessão</li>
            </ul>
          </section>
        </div>
        <p className="mt-[var(--spacing-scale-5x)] border-t border-primary-deep-foreground/30 pt-[var(--spacing-scale-3x)] text-sm">
          Protótipo acadêmico de extensão universitária. Conteúdo sem valor clínico ou legal.
        </p>
      </div>
    </footer>
  );
}
