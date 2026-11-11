# MCO GAMES — Assistente interativo PS5

**Versão:** 0.2 — protótipo independente  
**Status:** prévia para avaliação; ainda não integrado ao site nem ao NEXUS.

## Abrir o protótipo

Abra `index.html` em um navegador moderno. O protótipo não usa bibliotecas externas, banco de dados ou servidor.

### Simular o tipo de acesso que será enviado pelo NEXUS

- Primária: `index.html?licenca=primaria`
- Secundária: `index.html?licenca=secundaria`

O código lê `licenca` (aceita também `tipo` ou `license`). Se o NEXUS não enviar o parâmetro, a prévia local assume primária. O cliente não escolhe o tipo de acesso dentro do tutorial.

## O que foi construído

- 15 etapas com navegação anterior/próxima e acesso direto pelo roteiro lateral.
- Telas PS5 reconstruídas em HTML/CSS, usando a gravação como referência de disposição, textos e sequência.
- Setas SVG já visíveis em cada etapa, com animação discreta e círculo de destaque no alvo.
- Dois fluxos independentes, selecionados pelo parâmetro enviado pelo NEXUS.
- Opções condicionais para o estado do Compartilhamento do console e jogo offline.
- Orientação de 2FA conforme a conta demonstrada no vídeo: solicitar suporte/código ao canal oficial e inserir o código somente no PS5.
- Diagnóstico de cadeado, jogo ausente, login/2FA e ativação em outro PS5.
- Layout adaptado para desktop e celular.
- Progresso local no navegador, separado por tipo de acesso.

## Fidelidade visual e privacidade

As telas foram **reconstruídas** com base nos quadros do vídeo enviado, e não são capturas oficiais nem reproduções pixel a pixel do sistema. A estrutura visual e os rótulos foram aproximados para orientar o cliente sem confundi-lo com menus inventados.

Não foram reutilizados os quadros contaminados por marcas d'água, publicidade, QR Code real, endereço de e-mail, código 2FA, nomes de perfis ou avatares pessoais. O QR exibido é decorativo e contém aviso de que não pode ser escaneado. Os campos de e-mail, senha e 2FA ficam vazios.

A tela de biblioteca permanece vazia, como no vídeo. O vídeo não mostra um download real, portanto o tutorial não inventa um jogo nem apresenta uma captura falsa de download. A instrução explica o que fazer caso o título apareça em “Sua coleção”.

## Regras dos fluxos

### Primária

- Se o compartilhamento já estiver habilitado neste PS5, manter a configuração e selecionar **Não desativar**.
- Se estiver desabilitado, só habilitar com autorização do titular e se aquele for o PS5 destinado ao compartilhamento.
- Se a conta estiver habilitada em outro PS5, interromper e pedir que o titular verifique a ativação anterior.
- Depois que a licença estiver disponível e o compartilhamento estiver habilitado, o roteiro orienta retornar ao perfil pessoal.

### Secundária

- Manter o compartilhamento desabilitado neste PS5; não selecionar **Habilitar**.
- Se o compartilhamento aparecer habilitado neste PS5, interromper e confirmar com o titular/suporte; não desativar automaticamente.
- O roteiro explica que outros usuários do PS5 não recebem o acesso compartilhado quando o recurso está desabilitado. O acesso pode depender da conta proprietária conectada e de validação online.
- O roteiro não manda alternar para o perfil pessoal como se o compartilhamento estivesse disponível.

## Integração futura com o NEXUS

Ver `NEXUS_INTEGRATION.md`. A integração deverá enviar somente o tipo de fluxo, sem credenciais, e-mail, QR Code ou código 2FA.

## Segurança e transparência

- O tutorial não pede nem armazena senha, QR Code ou código 2FA.
- A 2FA não deve ser desativada para concluir o procedimento.
- “Primária” e “secundária” são nomenclaturas comerciais, não categorias oficiais de licença da Sony.
- O nome oficial da configuração é **Compartilhamento do console e jogo offline**.
- O recurso oficial pode ser habilitado em apenas um PS5 por conta. A disponibilidade dos jogos depende da conta que detém a licença e das regras da plataforma.
- O manual não promete acesso vitalício e não substitui os termos da Sony nem os direitos do consumidor.

## Documentação oficial consultada

- Compartilhamento do console e jogo offline no PS5: https://www.playstation.com/pt-br/support/account/ps5-console-sharing-offline-play/
- Restaurar licenças: https://www.playstation.com/pt-br/support/games/restore-licences-playstation/
- Desativar um console PlayStation: https://www.playstation.com/pt-br/support/account/deactivate-playstation-console/
