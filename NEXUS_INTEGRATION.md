# Integração planejada — MCO GAMES NEXUS

O tutorial deve ser enviado somente quando o operador enviar os dados do jogo ao cliente pelo controle NEXUS.

## Contrato de URL

- Produto marcado como primário:
  `tutorial-ps5/index.html?licenca=primaria`
- Produto marcado como secundário:
  `tutorial-ps5/index.html?licenca=secundaria`

O módulo também aceita `tipo` ou `license` como nomes alternativos do parâmetro, mas a integração recomendada é usar `licenca`.

## Regras de integração

1. O NEXUS determina o tipo a partir dos dados do jogo/pedido já cadastrados.
2. O operador envia a mensagem normalmente; o NEXUS acrescenta o link correspondente ao tipo de licença.
3. O cliente não deve escolher ou trocar o tipo de acesso dentro do tutorial.
4. Não incluir e-mail, senha, QR Code, código 2FA, identificador privado de conta ou dado pessoal no link.
5. Não enviar o tutorial em mensagens de produtos que não sejam PS5.
6. Não alterar catálogo, preço, promoções, banners, checkout, estoque ou demais rotinas do NEXUS.

## Exemplo conceitual

```js
const tutorialUrl = tipoAcesso === 'secundaria'
  ? 'https://SEU-DOMINIO/tutorial-ps5/index.html?licenca=secundaria'
  : 'https://SEU-DOMINIO/tutorial-ps5/index.html?licenca=primaria';
```

O domínio e o caminho definitivos só devem ser definidos na integração, depois da aprovação do protótipo e da auditoria do pacote atual do site/NEXUS.
