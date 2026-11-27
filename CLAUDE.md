# CLAUDE.md — ComunicaLibras | Atenção Básica SUS (USF Barra do Pojuca)

Academic prototype (university extension project) that supports communication between
SUS primary-care staff (UBS/USF) and Deaf patients who use Libras.
It does **not** replace a Libras interpreter and performs **no medical diagnosis**.

Also read: `README.md` (stack, eMAG compliance table) and `AGENTS.md` (architecture rules).

## Commands

```sh
bun install          # or: npm install
bun run dev          # dev server (Vite / TanStack Start)
bun run test         # vitest run  — run this after any logic change
bun run lint         # eslint .
bun run format       # prettier --write .
bunx tsc --noEmit    # typecheck (strict; see tsconfig.json)
```

Package manager: `bun` (`bun.lock`), but `npm` works too.

## Layout

| Path | Role |
| --- | --- |
| `src/routes/__root.tsx` | `<html lang="pt-BR">`, fonts (Rawline via `<link>`), `<Toaster />`, root layout |
| `src/routes/index.tsx` | `/` → renders `ComunicaApp` |
| `src/components/comunica/ComunicaApp.tsx` | Whole screen: header, side menu, breadcrumb, profiles (professional / patient / shared / tele-care / about), history |
| `src/components/govbr/govbr.tsx` | gov.br v3.7 Design System pieces (Header, Footer, SideMenu, Breadcrumb, SkipLinks, GovButton, MagicButton, Message, Loading, GovAvatar) |
| `src/lib/adapters/speech.ts` | `SpeechAdapter` — Web Speech API pt-BR + mock |
| `src/lib/adapters/libras.ts` | `LibrasAdapter` — official VLibras widget + mock, status machine |
| `src/lib/adapters/video.ts` | `VideoAdapter` — local camera/mic (WebRTC signalling still pending) |
| `src/lib/adapters/gesture.ts` | `GestureAdapter` — MediaPipe HandLandmarker, dynamic import, mock |
| `src/lib/gestures.ts` | Pure gesture classification from 21 landmarks (Sim, Não, Espere, Dor, OK, A, B, L, V, Y) + stabiliser |
| `src/lib/session.ts` | Quick phrases, in-memory history, CPF / SUS-card redaction |
| `src/test/*.test.ts(x)` | Vitest suites (session rules, gesture rules, routing) |

## Hard rules (do not break)

1. **No persistence, no backend.** No login, no database, no Lovable Cloud, no Supabase.
   History lives in React state only; "Limpar sessão" wipes it. Never add storage of
   personal data, CPF, medical records, audio or video.
2. **Gestures are assistive suggestions only.** Never auto-send a recognised gesture,
   never claim it translates Libras, never claim diagnosis. The user must press
   "Enviar esta resposta", and the entry is labelled "via gesto — confirmar".
3. **VLibras is the official gov.br widget.** It has no public translation API. Its DOM is
   created by `LibrasAdapter` (not React) and moved into the card slot via `mount()`;
   React re-renders would destroy it. Keep that boundary.
4. **Browser-only code must never enter SSR.** Load MediaPipe / camera / speech through
   dynamic `import()` inside the component (or `React.lazy` + `<ClientOnly>`), never as a
   static import from an SSR route module.
5. **Accessibility (eMAG / gov.br / WCAG 2.1) is a requirement, not a nicety.** Semantic
   HTML5, one `<h1>` per view, `<label htmlFor>` on every input, `aria-live`/`aria-atomic`
   on transcription and captions, visible focus, full keyboard operation, high-contrast
   toggle and font resizing (A-, A, A+).
6. **Design tokens only.** Colours, spacing and elevation come from `src/styles.css`
   (gov.br palette, Rawline font). Never hardcode `text-white`, `bg-black`, `bg-[#...]`.
7. **TanStack Router is fixed.** No `react-router-dom`, no `BrowserRouter`, no `src/pages`.
   Never edit the generated `src/routeTree.gen.ts`. Every `Link`/`navigate` target needs a
   real route file in the same change.
8. **Tailwind v4:** all `@import` rules stay at the top of `src/styles.css`; web fonts and
   remote CSS go in a `<link>` in `src/routes/__root.tsx`, never as a remote `@import`.
9. Keep UI copy in **pt-BR**. The ethical banner ("Protótipo acadêmico de extensão
   universitária — não substitui intérprete de Libras e não realiza diagnóstico médico")
   must stay visible.
10. This project is synced with Lovable. Avoid rewriting published git history
    (force push, rebase/squash of pushed commits). Keep the synced branch working.

## Verifying work

Run `bun run test` and `bunx tsc --noEmit` after changes, and check `/tmp/observability/build-errors.log`
when working inside the Lovable sandbox. Add a small focused test when you change a rule
(quick phrases, redaction, gesture classification) — one assertion per rule, no snapshot tests.
