## v0.7.4 — Testes recomendados
1. Abrir o guia “CADEADO NO JOGO” e confirmar que a etapa “Habilitar compartilhamento” mostra o fluxo padrão.
2. Avançar para “Confirmar ativação” e verificar a tela padrão com botão OK.
3. Clicar em “Minha tela está diferente” nessas etapas e validar a abertura do modal com link do WhatsApp.
4. Conferir os rótulos “Sua Conta Pessoal” nas telas aplicáveis.

# Testes da versão 0.7

## Verificações automatizadas locais

- [x] JavaScript sem erros de sintaxe (`node --check`).
- [x] Tela inicial exibe três escolhas.
- [x] Início do tutorial primário: 21 etapas.
- [x] Início do tutorial secundário: 19 etapas.
- [x] Início do tutorial de cadeado: 11 etapas.
- [x] Navegação manual completa: os três roteiros chegam à última etapa sem erros de JavaScript.
- [x] Na Secundária, a decisão de compartilhamento bloqueia avanço até a seleção de um estado.
- [x] Após selecionar "desabilitado", a Secundária orienta "Não habilitar" e permite continuar.
- [x] No Cadeado, o avanço para além da verificação de compartilhamento aguarda a seleção do estado.
- [x] Botão de voltar à seleção mantém a página navegável.
- [x] Renderização testada em 1440×900, 1366×768, 390×844 e 360×640.
- [x] Sem rolagem vertical da página principal nas quatro resoluções testadas.
- [x] Vídeo/JavaScript não utilizados: animações visuais SVG e JavaScript mantidas da versão 0.6.
- [x] HTML de prévia totalmente independente criado e renderizado sem erro de JavaScript.

## Observações e limitações

- As telas PS5 são reconstruções visuais educativas, não capturas oficiais.
- Não houve upload direto ao GitHub, publicação ou alteração do NEXUS.
- As escolhas do cliente não executam ações no PS5: apenas orientam o que selecionar manualmente.
- Progresso é salvo localmente no navegador; não há armazenamento de credenciais nem de códigos 2FA.
- O acesso aos jogos continua dependendo de licença válida e das regras oficiais da PlayStation.

## v0.7.3 — Secundária: fluxo principal e alternativas
- Conferido com Playwright em 1440×900, 390×844 e 360×640.
- Etapa 13 abre diretamente em **Desativar**, sem seletor de estado.
- Próxima indicação troca a tela ilustrativa para confirmação **OK**.
- Reprodução automática: ~7,1 s por indicação (dois ciclos); avanço automático após OK.
- Botão **Minha tela está diferente** abre alternativas de desativação prévia, erro e retorno à tela padrão.
- Caso já esteja desativado: libera a continuação, sem orientar habilitar.
- Caso de erro: pausa o roteiro, desabilita Próxima e mostra WhatsApp contextual.
- Sem erros JavaScript nos três tamanhos; sem rolagem vertical da página.
- Regressão: Primária e Cadeado continuam com suas opções específicas.
