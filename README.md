# ComunicaLibras | Atenção Básica SUS (USF Barra do Pojuca)

Protótipo acadêmico de extensão universitária para apoiar a comunicação entre profissionais de UBS/USF do SUS e pacientes surdos usuários de Libras.
**Não substitui intérprete de Libras e não realiza diagnóstico médico.**

## Stack
TypeScript · React 19 · TanStack Start (Vite) · Tailwind CSS v4 · Vitest.

## Estrutura
| Caminho | Função |
| --- | --- |
| `src/components/comunica/ComunicaApp.tsx` | Interface: cabeçalho, abas, perfis, histórico, sobre |
| `src/lib/adapters/speech.ts` | `SpeechAdapter` (Web Speech API pt-BR + mock para testes) |
| `src/lib/adapters/libras.ts` | `LibrasAdapter` (widget oficial VLibras + mock) e status |
| `src/components/govbr/govbr.tsx` | Componentes do Design System gov.br v3.7 (Header, Footer, Menu, Breadcrumb, Skip Link, Button, Magic Button, Message, Loading, Avatar) |
| `src/lib/adapters/video.ts` | `VideoAdapter` (câmera/microfone locais; sinalização WebRTC pendente) |
| `src/lib/adapters/gesture.ts` | `GestureAdapter` (MediaPipe HandLandmarker local) + mock |
| `src/lib/gestures.ts` | Classificação de gestos assistivos (Sim, Não, Espere, Dor, OK, A, B, L, V, Y) |
| `src/lib/session.ts` | Frases rápidas, histórico em memória e remoção de CPF/cartão SUS |
| `src/test/session.test.ts` | Testes das regras de sessão |

### Adaptadores
- `SpeechAdapter { isSupported(); start({onInterim,onFinal,onStatus}); stop() }`
- `LibrasAdapter { init(onStatus); translate(text,onStatus) }` — status: `pronto | processando | indisponivel | pendente`.
Substitua as implementações (ex.: API de tradução, outro motor de voz) sem alterar a interface.

## Privacidade
Histórico apenas em memória (estado React); botão "Limpar sessão". Sem login, sem banco de dados, sem gravação de áudio/vídeo. Padrões de CPF e cartão SUS são substituídos por `[dado removido]`.

## Conformidade eMAG / gov.br
| Recomendação | Status |
| --- | --- |
| HTML5 semântico (header, nav, main, section, article, footer) | ✔ |
| Sem tabelas para layout (Flexbox/Grid) | ✔ |
| Um único `<h1>`, hierarquia h1→h3 | ✔ |
| `<html lang="pt-BR">` | ✔ |
| Imagens/ícones com texto alternativo | ✔ |
| Campos com `<label htmlFor>` | ✔ |
| `aria-live`/`aria-atomic` em transcrição e legendas | ✔ |
| Alto contraste e ajuste de fonte (A-, A, A+) | ✔ |
| Atalhos de teclado (accesskey 1, 2, 3) e "pular para conteúdo" | ✔ |
| Abas com teclado (setas ←/→) e foco visível | ✔ |
| Template Base gov.br (Header, Breadcrumb, Menu lateral, Footer, Skip Link), fonte Rawline, escala de espaçamento | ✔ |
| Modais de consentimento (microfone, câmera) e confirmação de limpeza | ✔ |
| VLibras oficial com fallback textual | ✔ (tradução pendente de validação humana) |
| VLibras embutido no card "Tradução em Libras" | ✔ (depende da estrutura interna do widget) |
| Reconhecimento de gestos local com consentimento e confirmação | ✔ (experimental, não traduz Libras) |
| Entrada por voz com consentimento | ✔ (Chrome/Edge; indisponível no Firefox) |

## Desenvolvimento
```sh
npm i
npm run dev
bunx vitest run
```
