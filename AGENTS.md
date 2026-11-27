<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Speech and Libras integrations live behind `SpeechAdapter`/`LibrasAdapter` in `src/lib/adapters/` — keeps providers swappable and testable with mocks.
- No backend/persistence: session history stays in React memory only — privacy requirement (no personal data storage).
- gov.br Design System pieces (header, footer, menu, breadcrumb, skip links, buttons, message, loading) live in `src/components/govbr/` using semantic tokens — keeps the government visual standard in one place.
- Hand-gesture recognition lives behind `GestureAdapter` (`src/lib/adapters/gesture.ts`) with pure classification in `src/lib/gestures.ts` — runs locally in the browser, loaded via dynamic import so it never enters SSR.
- VLibras widget DOM is created by `LibrasAdapter` (not React) and moved into the card slot via `mount()` — React re-renders would otherwise destroy the widget.
