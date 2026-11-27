# Prompt para o Claude Code — ComunicaLibras

Copie o bloco abaixo e cole no Claude Code. Antes dele, escolha uma das duas formas de levar o código para a sua máquina (GitHub ou download do codebase) e ajuste o caminho da pasta.

---

```text
Você vai trabalhar no projeto "ComunicaLibras | Atenção Básica SUS (USF Barra do Pojuca)".

É um protótipo acadêmico de extensão universitária (UCSAL, curso de Análise e
Desenvolvimento de Sistemas), orientado pelo professor Jader Cristiano, autor
Felipe Vieira Barbosa. A aplicação apoia a comunicação entre profissionais de
saúde da Atenção Primária (UBS/USF) e pacientes surdos usuários de Libras.
Ela NÃO substitui intérprete de Libras e NÃO realiza diagnóstico médico.

PASSO 1 — Instalar e rodar
1. Entre na pasta do projeto.
2. Instale as dependências: bun install   (se não tiver bun: npm install)
3. Rode o servidor de desenvolvimento: bun run dev   (ou npm run dev)
4. Confirme que a aplicação abre na URL local mostrada no terminal e que a
   tela inicial com a escolha de perfis aparece.
5. Rode a suíte de testes: bun run test
6. Rode a checagem de tipos: bunx tsc --noEmit
7. Rode a lintagem: bun run lint
Reporte o resultado de cada passo. Se algo falhar, corrija e rode de novo até
passar. Não declare conclusão sem mostrar a saída dos comandos.

PASSO 2 — Conhecer o projeto
Leia primeiro: CLAUDE.md, AGENTS.md e README.md. Eles contêm os comandos, a
arquitetura e as regras do projeto. Depois leia:
- src/routes/__root.tsx e src/routes/index.tsx
- src/components/comunica/ComunicaApp.tsx
- src/components/govbr/govbr.tsx
- src/lib/adapters/ (speech.ts, libras.ts, video.ts, gesture.ts)
- src/lib/gestures.ts e src/lib/session.ts
- src/test/ (session.test.ts, gestures.test.ts, app-routing.test.tsx)
Ao final, me dê um resumo curto do que cada parte faz.

REGRAS INEGOCIÁVEIS (não quebre nenhuma):
1. Sem backend, sem banco de dados, sem login, sem Lovable Cloud, sem Supabase.
   Histórico existe só em memória do React; "Limpar sessão" apaga tudo. Nunca
   armazene dados pessoais, CPF, prontuário, áudio ou vídeo.
2. Gestos reconhecidos pela câmera são sugestões assistivas. Nunca envie um
   gesto automaticamente, nunca afirme que ele traduz Libras, nunca afirme
   diagnóstico. A pessoa precisa tocar em "Enviar esta resposta", e a entrada
   entra no histórico marcada como "via gesto — confirmar".
3. O VLibras é o widget oficial do gov.br e não tem API pública de tradução.
   O DOM do widget é criado fora do React e movido para dentro do card pelo
   método mount() do LibrasAdapter. Mantenha essa fronteira.
4. Código que só funciona no navegador (MediaPipe, câmera, Web Speech) deve ser
   carregado com import dinâmico dentro do componente. Nunca importe
   estaticamente em módulo de rota que passa por SSR.
5. Acessibilidade eMAG / gov.br / WCAG 2.1 é requisito: HTML5 semântico, um
   único h1 por visão, html lang="pt-BR", alt descritivo, label com htmlFor em
   todo input, aria-live/aria-atomic na transcrição e nas legendas, foco
   visível, navegação 100% por teclado, alto contraste e ajuste de fonte
   (A-, A, A+).
6. Cores, espaçamentos e sombras só saem dos tokens de src/styles.css. Nunca
   escreva text-white, bg-black ou bg-[#...] no componente.
7. TanStack Router é fixo. Não instale react-router-dom nem BrowserRouter, não
   crie src/pages, nunca edite src/routeTree.gen.ts.
8. Tailwind v4: todo @import fica no topo de src/styles.css; fontes e CSS
   remoto entram como <link> em src/routes/__root.tsx.
9. Toda a interface em português do Brasil. O aviso ético "Protótipo acadêmico
   de extensão universitária — não substitui intérprete de Libras e não realiza
   diagnóstico médico" precisa continuar visível.
10. Antes de finalizar qualquer mudança, rode bun run test, bunx tsc --noEmit e
    bun run lint, e mostre a saída.

Agora execute o PASSO 1 e me diga o que aconteceu.
```

---

## Como levar o código para a sua máquina

**Opção A — GitHub (sincroniza nos dois sentidos)**
No editor do Lovable: Project settings → Git → GitHub → Connect. O Lovable cria um repositório novo com o código atual. Depois:

```sh
git clone <url do repositório>
cd <nome-do-repo>
claude
```

**Opção B — Download do codebase (cópia simples, sem sincronia)**
Code editor → "Download codebase" no fim do painel de arquivos. Descompacte a pasta, entre nela e rode `claude`.
