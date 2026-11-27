import { createFileRoute } from "@tanstack/react-router";
import { ComunicaApp } from "@/components/comunica/ComunicaApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ComunicaLibras | Atenção Básica SUS (USF Barra do Pojuca)" },
      { name: "description", content: "Apoio à comunicação em Libras entre profissionais da USF Barra do Pojuca (SUS) e pacientes surdos." },
      { property: "og:title", content: "ComunicaLibras | Atenção Básica SUS" },
      { property: "og:description", content: "Protótipo acadêmico acessível de comunicação em Libras para UBS/USF do SUS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ComunicaApp,
});
