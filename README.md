# MCO GAMES — Tutorial Interativo PS5 v0.7.5

Três fluxos em uma página independente para GitHub Pages:

- **Primária**: instalação e verificação de Compartilhamento do console e jogo offline; retorno ao perfil pessoal apenas quando a conta tem licença e compartilha o conteúdo neste console.
- **Secundária**: roteiro independente; não instrui a habilitar compartilhamento; orienta uso pelo perfil que possui licença válida, possivelmente exigindo internet.
- **Cadeado no jogo**: diagnóstico de licença, compartilhamento e restauração de licenças.

## Instalação no GitHub

Envie os arquivos `index.html`, `app.js`, `styles.css` e a pasta `assets/` para **a raiz** do repositório `tutorial-ps5-`. Se o GitHub Pages estiver configurado em `main` / `root`, abra:

https://mcogames.github.io/tutorial-ps5-/

A tela inicial sempre apresenta as três escolhas. Para personalizar o nome do jogo:

https://mcogames.github.io/tutorial-ps5-/?jogo=EA%20Sports%20FC%2026

Os parâmetros `licenca=primaria` e `licenca=secundaria` podem destacar a opção, mas não pulam a seleção. O NEXUS ainda não está integrado.

## Recursos

- Passagem automática com **2 ciclos por indicação**, neon circular/retangular e seta/trilha sincronizadas.
- Pausar, voltar, próxima tela e menu de etapas.
- Progresso separado para cada roteiro salvo no navegador, sem dados de autenticação.
- Layout responsivo ajustado à altura do navegador; opção de ampliar a simulação.
- QR Code de exemplo não funcional, sem campos para e-mail, senha ou código 2FA no site.
- Reconstruções visuais orientativas, não capturas oficiais da interface.

## Segurança e limites

Os termos *primária* e *secundária* são nomes comerciais, não categorias de licenças oficiais da Sony. Uma conta só pode habilitar Compartilhamento do console e jogo offline em um PS5 por vez. A disponibilidade dos jogos depende de licença válida, regras da plataforma e condições da conta. Não altere a ativação de outro console sem autorização do titular.

Fontes de orientação:
- https://www.playstation.com/pt-br/support/account/ps5-console-sharing-offline-play/
- https://www.playstation.com/pt-br/support/games/restore-licences-playstation/

### Suporte na ativação primária
Na etapa **Verificar ativação primária**, escolha **Aviso de outro PS5**: o botão **Falar com suporte no WhatsApp** abre `https://wa.me/5599981810222` com uma mensagem pronta. Nenhum dado da conta é transmitido pelo tutorial.

### Ajuste recente no fluxo Secundária
Na etapa **Conferir compartilhamento**, quando a opção já aparece habilitada no PS5, o tutorial agora mostra a tela correta com **Desativar** e, depois, a confirmação **OK**.

### Ajuste da secundária (v0.7.3)
A etapa **Desativar compartilhamento** mostra diretamente o fluxo padrão do PS5: **Desativar** → **OK**. Não há seletor para o cliente decidir qual tela seguir. A opção opcional **Minha tela está diferente** oferece três alternativas: já aparece Habilitar (a função está desativada), houve erro (com contato de WhatsApp), ou voltar ao caminho principal. Uma falha bloqueia o avanço automático até que seja resolvida.


### Ajuste do fluxo Cadeado (v0.7.4)
- A etapa de compartilhamento no guia “Cadeado no jogo” passou a seguir um fluxo padrão: **Habilitar** -> mensagem de confirmação -> **OK**.
- Se o cliente visualizar uma tela diferente nessa etapa, o guia exibe o botão **“Minha tela está diferente”** com link direto para o suporte no WhatsApp.
- Os rótulos de usuário voltados ao cliente foram ajustados para **“Sua Conta Pessoal”**.

### Identidade visual v0.7.5
- Entrada alterada de “Parabéns pela compra” para “Central de Instalação e Suporte”.
- Logo horizontal de 2025 na abertura, símbolo quadrado de 2026 no cabeçalho/favicon.
- Ambos os PNGs originais são preservados em `assets/`. A inversão monocromática no CSS permite contraste no fundo escuro.
- Quando recebido pelo URL, o nome do jogo aparece discretamente na abertura.
