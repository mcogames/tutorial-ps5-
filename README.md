# MCO GAMES — Tutorial Interativo PS5 Primária v0.4

## O que é
Site estático e independente para orientar o cliente em **21 telas ilustrativas**, baseadas nas capturas de tela do PS5 fornecidas pelo projeto. O fluxo é **somente primário**. A versão secundária fica para uma revisão futura.

### Recursos
- Boas-vindas com **nome do jogo dinâmico** (`?jogo=Nome%20do%20Jogo`).
- Logo textual MCO GAMES, aparência escura com neon ciano.
- **Seta em movimento**: aparece, percorre a trajetória até a opção, desaparece e recomeça em loop, com contorno neon pulsante no botão ou elemento destacado.
- Animações sequenciais dentro da mesma tela: `Concordo → Confirmar`, `e-mail → senha → Iniciar sessão`, `código 2FA → OK`.
- Botões **Indicação anterior / Próxima indicação**; ciclos automáticos a cada ~6,5 s quando houver mais de uma indicação.
- Tela opcional de proteção de conta e de telas intermediárias pós-login.
- Tratamento dos estados de compartilhamento (desabilitado, já habilitado ou aviso sobre outro PS5).
- **Bloqueio de avanço** se o usuário informar aviso de ativação em outro PS5.
- Biblioteca → Sua coleção → seleção do jogo → botão Baixar (reconstrução ilustrativa).
- Fazer logout, selecionar perfil pessoal e tela final.
- Modal de solução de problemas com links oficiais da Sony; ampliação da tela para celular.
- Salva progresso por nome do jogo em `localStorage` somente; não solicita nem armazena credenciais nem 2FA.

## Publicar no GitHub Pages
Se o repositório do tutorial é **mcogames/tutorial-ps5-**:

1. Extraia o ZIP.
2. No GitHub, abra o repositório e acesse a **raiz** da branch `main`.
3. Clique em **Add file → Upload files**.
4. Envie **index.html**, **styles.css**, **app.js** e a documentação `.md` diretamente para a raiz (não crie uma pasta extra).
5. Confirme com **Commit changes**.
6. Confira em **Settings → Pages** se está configurado como `Deploy from a branch`, branch `main`, folder `/(root)`.
7. Aguarde a execução `pages build and deployment` aparecer como concluída em **Actions**.

URL esperada, após publicação:

`https://mcogames.github.io/tutorial-ps5-/?jogo=EA%20Sports%20FC%2026&licenca=primaria`

Se o nome do repositório mudar, ajuste o endereço. **Não é preciso editar o site da loja nem o NEXUS nesta etapa.**

## Teste local
Abra `index.html` no navegador. Se o progresso não funcionar em `file://`, teste com um servidor local simples (por exemplo: `python -m http.server`).

## Limitações e transparência
- As telas principais **são reconstruções visuais**, inspiradas nos prints reais disponibilizados, sem reproduzir setas amarelas, avatares pessoais nem propagandas. **Não são screenshots oficiais nem correspondência pixel a pixel.**
- As telas **Proteção da conta**, **Configurações adicionais** e **Baixar o jogo** são exemplos didáticos, pois não constavam claramente nos prints disponibilizados.
- A nomenclatura comercial “primária” não constitui licença oficial transferível da Sony.
- O compartilhamento do console só pode ficar habilitado em um PS5 por conta.
- O NEXUS ainda **não foi integrado**. O parâmetro `?jogo=` simula o nome que será enviado pelo sistema.

## Fontes oficiais usadas para conferir os procedimentos
- [Compartilhamento do console e jogo offline](https://www.playstation.com/pt-br/support/account/ps5-console-sharing-offline-play/)
- [Restaurar licenças](https://www.playstation.com/pt-br/support/games/restore-licences-playstation/)
- [Baixar jogos](https://www.playstation.com/pt-br/support/games/find-download-games-ps-store/)
