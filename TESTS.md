# Testes do protótipo v0.3

Testado em Chromium headless, viewport desktop 1440×1000 e mobile 390×844.

- [x] JavaScript validado com `node --check`.
- [x] Fluxo primário percorre as 15 etapas sem erro de execução.
- [x] Fluxo secundário percorre as 15 etapas sem erro de execução.
- [x] Seleção de estado do compartilhamento atualiza tela, seta, instruções e aviso.
- [x] Estados testados: habilitado, desabilitado e ativação em outro PS5.
- [x] Progresso salvo localmente e separado por tipo de acesso.
- [x] Setas presentes em todas as etapas e alvos alinhados aos elementos visuais reconstruídos.
- [x] Layout mobile sem overflow horizontal no viewport de 390 px.
- [x] Nenhuma senha, e-mail, QR real ou código 2FA incorporado.
- [x] Nenhuma requisição externa ou biblioteca de terceiros necessária.

Observação: os testes validam a navegação e o comportamento do protótipo. A confirmação visual final em aparelhos PS5 reais depende de homologação com consoles e versões de sistema diferentes.
