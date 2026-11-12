# Testes v0.5

Validação em navegador Chromium headless via Playwright.

- Abertura e início do tutorial: sem erro de JavaScript.
- Renderização da logo oficial: tamanho intrínseco 2048 px detectado.
- Viewports 1440×900, 1366×768, 390×844 e 360×640: largura e altura da página iguais ao viewport; sem rolagem global.
- 21 etapas renderizadas por navegação direta.
- Animação sincronizada: trilha e ponta da seta compartilham o mesmo progresso, a partir do comprimento real do caminho SVG.
- Relógio controlado: repetição 1/2 → 2/2 → mudança automática de tela após dois ciclos.
- Login: três indicações executadas em sequência, duas repetições cada, depois avança para 2FA.
- Pausa: progresso congelado até a retomada.
- Aviso de compartilhamento em outro console: pausa automática e botão avançar bloqueado.
- Testes de captura para páginas de abertura, primeira tela, login e biblioteca em desktop e mobile.

O conteúdo real do PS5 deve ser validado por observação humana no dispositivo, já que as imagens são reconstruções orientativas.
