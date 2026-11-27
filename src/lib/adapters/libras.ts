/**
 * LibrasAdapter — abstração desacoplada de tradução Português → Libras.
 * Implementação padrão: widget oficial VLibras (gov.br), embutido no card
 * "Tradução em Libras" via mount(slot). O VLibras não tem API oficial de embutir:
 * movemos o contêiner do widget para o slot e forçamos o layout por CSS
 * (.vw-embedded em styles.css). Sem slot, ele volta ao modo flutuante padrão.
 * Traduções ficam "pendentes de validação" por intérprete humano.
 */
export type LibrasStatus = "pronto" | "processando" | "indisponivel" | "pendente";

export interface LibrasAdapter {
  init(onStatus: (s: LibrasStatus) => void): Promise<void>;
  translate(text: string, onStatus: (s: LibrasStatus) => void): Promise<void>;
  /** Ancora o avatar dentro de um elemento. Retorna função para desancorar. */
  mount?(slot: HTMLElement): () => void;
}

const SCRIPT_URL = "https://vlibras.gov.br/app/vlibras-plugin.js";

function createWidgetRoot(): HTMLElement {
  const root = document.createElement("div");
  root.setAttribute("vw", "");
  root.className = "enabled";
  root.innerHTML =
    '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
  document.body.appendChild(root);
  return root;
}

export function createVLibrasAdapter(): LibrasAdapter {
  let ready = false;
  let root: HTMLElement | null = null;
  let slot: HTMLElement | null = null;

  const EMBED_CSS =
    "#vlibras-app{position:absolute!important;inset:0!important;top:0!important;left:0!important;transform:none!important;translate:none!important;--widget-width:100%;width:100%!important;height:100%!important;animation:none!important;z-index:1!important}";
  /** Ancora a janela do avatar (shadow DOM #vlibras-app-root) dentro do slot. */
  const anchor = () => {
    const app = document.getElementById("vlibras-app-root");
    if (!app || !slot) return false;
    if (app.parentElement !== slot) slot.appendChild(app);
    for (const [k, v] of <[string, string][]>[
      ["position", "absolute"],
      ["inset", "0"],
      ["display", "block"],
      ["transform", "none"],
      ["translate", "none"],
      ["margin", "0"],
    ])
      app.style.setProperty(k, v, "important");
    const sr = app.shadowRoot;
    if (sr && !sr.querySelector("style[data-embed]")) {
      const st = document.createElement("style");
      st.setAttribute("data-embed", "");
      st.textContent = EMBED_CSS;
      sr.appendChild(st);
    }
    return true;
  };
  const open = () => {
    if (anchor()) return;
    const btn =
      document
        .getElementById("vlibras-access-wrapper")
        ?.shadowRoot?.querySelector<HTMLElement>("#vlibras-button") ??
      root?.querySelector<HTMLElement>("[vw-access-button]");
    btn?.click();
    let tries = 0;
    const iv = window.setInterval(() => {
      if (anchor() || ++tries > 40) window.clearInterval(iv);
    }, 150);
  };

  return {
    async init(onStatus) {
      if (typeof window === "undefined") return;
      onStatus("processando");
      const w = window as unknown as { VLibras?: { Widget: new (url: string) => unknown } };
      try {
        root = document.querySelector<HTMLElement>("[vw]") ?? createWidgetRoot();
        if (!w.VLibras) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement("script");
            s.src = SCRIPT_URL;
            s.async = true;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error("falha ao carregar VLibras"));
            document.body.appendChild(s);
            setTimeout(() => reject(new Error("timeout")), 15000);
          });
        }
        if (!w.VLibras) throw new Error("VLibras ausente");
        new w.VLibras.Widget("https://vlibras.gov.br/app");
        window.dispatchEvent(new Event("load"));
        ready = true;
        if (slot) setTimeout(open, 800);
        onStatus("pronto");
      } catch {
        ready = false;
        onStatus("indisponivel");
      }
    },
    mount(target) {
      slot = target;
      document.documentElement.classList.add("vw-embedded");
      if (ready) setTimeout(open, 300);
      return () => {
        if (slot !== target) return;
        slot = null;
        document.documentElement.classList.remove("vw-embedded");
        const app = document.getElementById("vlibras-app-root");
        if (app) {
          app.style.display = "none";
          document.body.appendChild(app);
        }
      };
    },
    async translate(_text, onStatus) {
      if (!ready) return onStatus("indisponivel");
      onStatus("processando");
      open();
      // O VLibras traduz o texto clicado quando está ativo: clicamos na legenda.
      await new Promise((r) => setTimeout(r, 600));
      document.querySelector<HTMLElement>("[data-libras-caption]")?.click();
      onStatus("pendente");
    },
  };
}

export function createMockLibrasAdapter(available = true): LibrasAdapter {
  return {
    async init(onStatus) {
      onStatus(available ? "pronto" : "indisponivel");
    },
    async translate(_t, onStatus) {
      onStatus(available ? "pendente" : "indisponivel");
    },
  };
}

export const LIBRAS_STATUS_LABEL: Record<LibrasStatus, string> = {
  pronto: "Pronto",
  processando: "Processando",
  indisponivel: "Indisponível / Erro",
  pendente: "Pendente de validação",
};
