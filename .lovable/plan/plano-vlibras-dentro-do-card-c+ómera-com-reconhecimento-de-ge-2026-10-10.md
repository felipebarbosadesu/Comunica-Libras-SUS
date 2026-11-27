# Plano: VLibras dentro do card + câmera com reconhecimento de gestos

## Parte 1 — Avatar VLibras dentro de "Tradução em Libras"

O que muda para o usuário:
- O desenho estático do card some. No lugar, o próprio avatar 3D do VLibras aparece dentro do card, do mesmo tamanho, sem janela flutuante sobre os botões "Sim / Não".
- Quando uma nova frase chega, ela é enviada automaticamente ao avatar (sem precisar selecionar texto e clicar no ícone lateral).
- O botão azul flutuante do VLibras deixa de aparecer na lateral da tela.
- Se o VLibras falhar, o card mostra o aviso atual e a legenda em português continua visível.

Como:
- O widget oficial é desenhado em `position: fixed` no canto da página. Vamos mover o contêiner `[vw-plugin-wrapper]` para dentro de um "slot" no card e sobrescrever o CSS para `position: relative`, largura 100% e altura fixa (ex.: 360 px).
- Envio automático: após cada nova legenda, abrir o widget programaticamente e disparar a tradução pelo mecanismo do plugin (simular clique no texto da legenda, que é o gatilho oficial). Isto fica dentro do `LibrasAdapter.translate`, mantendo a interface igual.
- Apenas um avatar por página: na aba "Atendimento Compartilhado" o avatar fica no lado do paciente; nas outras abas, no card visível. Ao trocar de aba o slot muda de lugar.
- Limitação honesta: o VLibras não tem API pública oficial para embutir; esta adaptação depende da estrutura interna do widget e pode quebrar se o governo atualizá-lo. Haverá fallback para o modo flutuante padrão.

## Parte 2 — Câmera com reconhecimento de gestos (aba Teleatendimento)

O que muda para o usuário:
- Na videochamada, um novo botão "Ativar reconhecimento de gestos" (desligado por padrão, com modal de consentimento explicando que nada é gravado nem enviado).
- Com ele ligado, o navegador detecta a mão na imagem da câmera, desenha os pontos da mão sobre o vídeo e mostra uma sugestão como "Gesto reconhecido: Sim (polegar para cima)".
- A sugestão NÃO é enviada sozinha: o paciente confirma com "Enviar esta resposta", que entra no histórico como mensagem do paciente marcada "via gesto — confirmar".
- Conjunto inicial pequeno e seguro de gestos assistivos (não é Libras completa): Sim (polegar para cima), Não (polegar para baixo), Pare/Espere (mão aberta), OK, Dor (mão fechada), e letras isoladas A, B, L, V, Y do alfabeto manual para soletração simples.
- Painel de status com Loading enquanto o modelo carrega, e aviso se o navegador não suportar.

Limites éticos (texto visível na tela e no "Sobre"):
- Reconhecimento experimental de gestos simples; não traduz Libras, não substitui intérprete, não serve para diagnóstico.
- Processamento 100% local no navegador: nenhum quadro de vídeo é salvo ou enviado.
- Conexão real entre os dois participantes (WebRTC) continua pendente, como hoje.

## Acessibilidade eMAG / gov.br
- Botões com rótulo claro, `aria-pressed` no liga/desliga, foco visível.
- Gesto reconhecido anunciado em região `aria-live="polite"` (sem repetir o mesmo gesto continuamente: só anuncia ao mudar e após 1 s estável).
- Canvas de pontos marcado como decorativo; informação sempre em texto.
- Alto contraste aplicado aos pontos e ao painel; atalhos de teclado mantidos.
- Avatar embutido com título acessível e texto alternativo "Avatar VLibras sinalizando: <frase>".

## Detalhes técnicos
- Novo `src/lib/adapters/gesture.ts`: interface `GestureAdapter { load(); start(video, onResult); stop() }` + mock para testes, seguindo o padrão dos outros adaptadores.
- Implementação com `@mediapipe/tasks-vision` (HandLandmarker, mais leve e mantido que o Handpose antigo do TF.js), carregado por `import()` dinâmico apenas no navegador, modelo baixado do CDN oficial. Classificação de gestos com `fingerpose` (mesma abordagem do repositório de referência) sobre os 21 pontos da mão; estabilização por janela de N quadros.
- `src/lib/gestures.ts`: definições de gestos e função pura `classifyStable()` testada em `src/test/gestures.test.ts` (ex.: polegar para cima estável por 10 quadros → "Sim"; troca rápida → nenhum resultado).
- `LibrasPlayer` ganha um `<div>` slot; `libras.ts` ganha `mount(slot)` e CSS em `styles.css` para o modo embutido.
- Nenhum backend, nenhuma persistência; README e tabela de conformidade atualizados; AGENTS.md registra o `GestureAdapter`.
