# MCO GAMES · Guia PS5 — versão de testes v0.5

Protótipo independente para testar o tutorial de instalação **primária**. Não está integrado à loja nem ao NEXUS.

## Novidades nesta versão

- Logo oficial `assets/mco-logo-oficial.png` incorporada sem mudar seu desenho, exibida em branco sobre fundo escuro.
- Interface simplificada para o cliente: título, desenho do PS5, orientação do momento e navegação. Recursos de suporte ficam em `Ajuda`.
- Tutorial **automático** a partir de `Começar agora`: cada indicação é apresentada em **2 ciclos completos**, depois o tutorial muda sozinho para a indicação seguinte ou para a próxima tela.
- Movimento da seta e revelação de sua trilha **sincronizados, no mesmo quadro de animação** (`requestAnimationFrame`). O foco neon pulsa ao chegar no botão.
- Controles manuais: `Pausar/Continuar`, `Anterior/Próxima tela`, `‹/›` para alternar indicações e `Etapas` para navegar diretamente.
- Layout ajustado ao espaço visível do navegador (desktop/mobile). A página principal não exige rolagem; a lista de etapas e as caixas de ajuda possuem rolagem própria quando necessário.
- Textos de login personalizados para os dados que a pessoa recebeu da MCO GAMES.
- Ícone da biblioteca reconstruído com a grade e o controle visualmente próximos do desenho real do PS5 (não é uma imagem oficial).
- Biblioteca com orientação de selecionar o jogo adquirido e nome dinâmico na capa ilustrativa.
- Tela de finalização enxuta.

## Testar

Abra `index.html` no navegador. Exemplo de link para informar o jogo:

`index.html?jogo=EA%20Sports%20FC%2026&licenca=primaria`

O nome é apresentado na mensagem inicial e nas instruções de seleção. **Atenção:** o nome não faz download, compra ou ativação; este é um tutorial visual.

Para uma prévia sem necessidade de pasta, abra `MCO_PS5_PRIMARIA_PREVIEW_v0.5.html`, fornecido separadamente do ZIP.

## Publicação no GitHub Pages

No repositório `mcogames/tutorial-ps5-`, raiz de `main`:

1. Substitua `index.html`, `styles.css` e `app.js` pelos arquivos desta versão.
2. Acrescente a pasta **`assets`** com o arquivo **`mco-logo-oficial.png`** sem mudar o nome ou caminho.
3. Faça o commit e aguarde o GitHub Pages terminar a publicação em `Actions`.
4. Abra o endereço publicado, preferencialmente em guia anônima ou com atualização forçada para evitar cache.

URL exemplo (quando GitHub Pages estiver ativado):

`https://mcogames.github.io/tutorial-ps5-/?jogo=EA%20Sports%20FC%2026&licenca=primaria`

**O NEXUS e o site principal permanecem intocados.**

## Observações técnicas e segurança

- Há 21 etapas e algumas são reconstruções ilustrativas. O roteiro foi inspirado nas capturas enviadas, mas **não é a interface oficial do sistema nem uma captura exata**.
- As telas opcionais após o login e o botão de download são demonstrações adicionais; podem aparecer de forma diferente ou não aparecer em certas versões do PS5.
- A reprodução automática **apenas muda as orientações no navegador**. Ela NÃO executa comandos no console; o cliente precisa executar as ações no PS5. É possível pausar a qualquer momento.
- No aviso de compartilhamento em outro PS5, o avanço automático para e a orientação é procurar o titular/suporte antes de alterar a ativação.
- O site não coleta senha, e-mail nem códigos 2FA. O progresso local salvo em `localStorage` contém apenas o índice da etapa.
- “Primária” é nomenclatura comercial, não uma licença oficial transferível Sony; os recursos de compartilhamento estão sujeitos às regras da plataforma.
- A documentação oficial pode ser consultada nos links da janela `Ajuda`.
- Esta versão inclui exclusivamente o fluxo primário. O secundário terá seu próprio tratamento posterior.
