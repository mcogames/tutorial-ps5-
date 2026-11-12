# MCO GAMES · Tutorial PS5

Site estático, independente, sem backend, preparado para GitHub Pages. Implementação integral das 15 etapas e 2 fluxos (primaria/secundaria), com identidade escura e neon ciano, destaque sincronizado ao elemento, seta SVG com loop e interface recriada a partir do vídeo do projeto.

## Testar

Abra `index.html` num navegador ou execute `python -m http.server 8000` nesta pasta e visite `http://localhost:8000/?licenca=primaria&jogo=Nome%20do%20Jogo`.

- Primária: `?licenca=primaria&jogo=Nome%20do%20Jogo`
- Secundária: `?licenca=secundaria&jogo=Nome%20do%20Jogo`

Parâmetros demonstrativos não são autenticação. Nunca inclua email, senha, códigos 2FA, tokens ou identificadores pessoais no endereço. O tutorial **não está integrado ao NEXUS**.

## Publicação

Coloque os três arquivos `index.html`, `styles.css` e `app.js` na raiz do repositório `mcogames/tutorial-ps5-`, em uma branch para GitHub Pages. Em Settings > Pages, configure `Deploy from a branch`, selecione a branch e `/ (root)`. A URL esperada após publicação é `https://mcogames.github.io/tutorial-ps5-/`. A publicação efetiva precisa ser verificada na conta GitHub.

## Estado

Projeto criado para revisão pública. Algumas telas da interface de PS5 são ilustrações reconstruídas e não capturas originais; os menus podem variar por atualização. O vídeo original é a fonte, mas não foi incluído no site por ter elementos de terceiros e possíveis dados pessoais. Antes do uso com clientes, validar cada tela frente ao console.

O projeto não coleta dados pessoais, não envia requisições e não contém dados de conta. Fluxo primário mantém compartilhamento se já habilitado; instruções não autorizam alterações em outro console. Fluxo secundário não ativa compartilhamento.
