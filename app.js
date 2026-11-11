(() => {
  const $ = id => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const rawLicense = (params.get('licenca') || params.get('tipo') || params.get('license') || 'primaria').toLowerCase();
  let licenseType = ['secundaria','secondary'].includes(rawLicense) ? 'secondary' : 'primary';
  const licenseNames = {primary:'LICENÇA PRIMÁRIA',secondary:'LICENÇA SECUNDÁRIA'};
  let current = 0;
  let completed = new Set();
  let sharingStatus = licenseType === 'primary' ? 'enabled' : 'disabled';
  let issue = 'lock';
  let toastTimer;
  const storageKey = `mco_ps5_setup_v03_${licenseType}`;
  const saved = (()=>{try{return JSON.parse(localStorage.getItem(storageKey)||'{}')}catch{return {}}})();
  if(Array.isArray(saved.completed)) completed = new Set(saved.completed);
  if(Number.isInteger(saved.current) && saved.current >= 0) current = saved.current;

  const icon = (symbol) => `<span class="sicon">${symbol}</span>`;

  function inferFocus(step){
    if(step.focus) return step.focus;
    const a = step.arrow || {};
    const label = (a.label || '').toUpperCase();
    const id = step.id || '';
    let focus = {x:(a.x || 500), y:(a.y || 281), w:180, h:48, r:14};
    if(id === 'profile'){ focus = {x:a.x||337, y:a.y||238, w:112, h:120, r:28}; }
    else if(id === 'user-add'){ focus = {x:a.x||280, y:a.y||362, w:236, h:212, r:22}; }
    else if(id === 'terms'){ focus = {x:a.x||834, y:a.y||488, w:166, h:44, r:22}; }
    else if(id === 'qr'){ focus = {x:a.x||212, y:a.y||499, w:262, h:40, r:20}; }
    else if(id === 'login'){ focus = {x:a.x||721, y:a.y||193, w:344, h:42, r:10}; }
    else if(id === 'twofa'){ focus = {x:a.x||541, y:a.y||329, w:248, h:40, r:10}; }
    else if(id === 'protect'){ focus = {x:a.x||500, y:a.y||453, w:146, h:42, r:20}; }
    else if(id === 'settings'){ focus = {x:a.x||500, y:a.y||280, w:314, h:40, r:8}; }
    else if(id === 'users'){ focus = {x:a.x||632, y:a.y||159, w:346, h:38, r:8}; }
    else if(id === 'sharing' && (label.includes('NÃO DESATIVAR') || label.includes('NÃO ALTERAR'))){ focus = {x:a.x||362, y:a.y||488, w:194, h:46, r:24}; }
    else if(id === 'sharing' && (label.includes('HABILITAR') || label.includes('DESABILITADO'))){ focus = {x:a.x||500, y:a.y||381, w:206, h:48, r:24}; }
    else if(label.includes('SUA COLEÇÃO')){ focus = {x:a.x||216, y:a.y||73, w:170, h:40, r:8}; }
    else if(label.includes('ALTERNAR USUÁRIO')){ focus = {x:a.x||780, y:a.y||261, w:220, h:38, r:10}; }
    else if(label.includes('SEU PERFIL PESSOAL') || label.includes('PERMANEÇA NESTA CONTA')){ focus = {x:a.x||592, y:a.y||298, w:114, h:118, r:28}; }
    else if(label.includes('RESTAURAR LICENÇAS')){ focus = {x:a.x||500, y:a.y||193, w:290, h:40, r:8}; }
    else if(label.includes('ETAPA CONCLUÍDA')){ focus = {x:a.x||500, y:a.y||354, w:220, h:54, r:27}; }
    return focus;
  }

  function applyFocus(focus){
    const el = $('targetOutline');
    if(!el) return;
    if(!focus){ el.style.opacity = '0'; return; }
    el.style.opacity = '1';
    el.style.left = `${focus.x}px`;
    el.style.top = `${focus.y}px`;
    el.style.width = `${focus.w}px`;
    el.style.height = `${focus.h}px`;
    el.style.borderRadius = `${focus.r ?? 14}px`;
  }
  const base = (className, inner) => `<div class="ps5-screen ${className}"><div class="ps5-content">${inner}</div></div>`;
  const stepsBeforeSharing = [
    {
      id:'profile',title:'Selecionar “Adicionar usuário”',short:'Adicionar usuário',time:'~ 30 s',
      intro:'Na tela inicial de seleção de usuários, escolha a opção com o símbolo de “+” para criar um perfil no console.',
      caption:'A seta aponta para “Adicionar usuário”, na tela de seleção de perfis.',
      arrow:{d:'M850 470 C700 390 500 300 337 238',x:337,y:238,label:'ADICIONAR USUÁRIO'},
      screen:()=>base('screen-profile',`<div class="center-title">Seja bem-vindo(a) novamente ao PlayStation</div><div class="center-sub">Quem está usando esse controle?</div><div class="profile-row"><div class="profile-tile add"><div class="profile-avatar">＋</div>Adicionar usuário</div><div class="profile-tile"><div class="profile-avatar">◉</div>Perfil existente</div><div class="profile-tile"><div class="profile-avatar">◈</div>Outro perfil</div></div><div class="screen-bottom-hint">✕ Selecionar <span>◯ Voltar</span></div>`),
      instructions:['Na tela “Quem está usando esse controle?”, localize o círculo com o sinal de “+”.','Selecione “Adicionar usuário”.','Não escolha um perfil que não seja o indicado para esta instalação.'],
      note:'O nome e os avatares dos perfis podem variar. A tela foi reconstruída sem nomes ou imagens pessoais que apareciam no vídeo.'
    },
    {
      id:'add',title:'Adicionar um usuário a esse PS5',short:'Criar perfil',time:'~ 30 s',
      intro:'O PS5 apresenta duas opções em colunas. Para criar um perfil salvo no console, use a opção da esquerda.',
      caption:'Selecione “Vamos começar” na coluna “Adicionar um usuário a esse PS5”.',
      arrow:{d:'M100 520 C165 470 225 410 280 362',x:280,y:362,label:'VAMOS COMEÇAR'},
      screen:()=>base('screen-add',`<div class="ps5-title">Adicionar usuário</div><div class="add-columns"><div class="add-column"><div class="add-icon">☻<sup>＋</sup></div><div class="add-heading">Adicionar um usuário a esse PS5</div><div class="add-desc">Inicie sessão com sua conta usada na PlayStation Network ou crie uma nova. Seus dados serão salvos nesse console para a próxima vez que você quiser jogar.</div><div class="ps5-btn selected">Vamos começar</div></div><div class="add-column"><div class="add-icon">♟</div><div class="add-heading">Jogar como convidado ocasional</div><div class="add-desc">Qualquer dado criado nesse console será excluído quando você terminar.</div><div class="guest-actions"><div class="ps5-btn">Iniciar sessão</div><div class="ps5-btn">Jogo rápido</div></div><div class="guest-terms">Você concorda em cumprir o Acordo de Licença do Software do Sistema do PS5.</div></div></div>`),
      instructions:['Na coluna esquerda, confirme “Adicionar um usuário a esse PS5”.','Selecione “Vamos começar”.','A opção da direita é para convidado ocasional e não é a indicada para criar um perfil permanente.'],
      note:'A própria interface informa que os dados de uma sessão de convidado ocasional são excluídos quando ela termina.'
    },
    {
      id:'terms',title:'Aceitar o contrato de licença',short:'Termos do sistema',time:'~ 1 min',
      intro:'O console apresenta o Acordo de Licença do Software do Sistema PlayStation 5 antes de continuar.',
      caption:'Leia o contrato. Se concordar, marque “Concordo” e selecione “Confirmar”.',
      arrow:{d:'M920 320 C900 390 865 445 834 488',x:834,y:488,label:'CONFIRMAR'},
      screen:()=>base('screen-license',`<div class="ps5-title">Acordo de Licença do Software do Sistema PlayStation 5</div><div class="license-copy"><b>ACORDO DE LICENÇA DO SOFTWARE DO SISTEMA PLAYSTATION 5</b>LEIA ESTE ACORDO DE LICENÇA DO SOFTWARE DO SISTEMA PLAYSTATION 5 ATENTAMENTE PARA COMPREENDER SEUS DIREITOS E AS SUAS OBRIGAÇÕES.<br><br>O acesso e o uso do software do sistema estão expressamente condicionados à aceitação dos termos deste acordo. Ao utilizar seu sistema PS5, você declara que pode celebrar um contrato segundo as leis da sua jurisdição e concorda em cumprir os termos deste acordo.<br><br>Você aceita este acordo em seu nome e em nome de outras pessoas que acessam ou usam seu sistema PS5. Você é responsável pelo uso do sistema PS5 por outras pessoas e pela conformidade delas com os termos deste acordo.<br><br>Leia o texto integral apresentado no seu console antes de continuar.</div><div class="license-actions"><div class="license-check"><span class="check-square">✓</span> Concordo</div><div class="ps5-btn selected">Confirmar</div></div>`),
      instructions:['Leia o Acordo de Licença exibido no PS5.','Se concordar com os termos, marque a caixa “Concordo”.','Selecione “Confirmar” para continuar.'],
      note:'A imagem é uma reconstrução resumida da disposição visual. O texto legal integral e vigente é o que aparece no próprio console; não substitua a leitura por este resumo.'
    },
    {
      id:'qr',title:'Escolher a forma de início de sessão',short:'QR Code ou manual',time:'~ 30 s',
      intro:'O PS5 apresenta o acesso por QR Code. Para seguir o procedimento manual demonstrado no vídeo, selecione a opção inferior correspondente.',
      caption:'Para o passo a passo deste guia, selecione “Iniciar sessão manualmente”.',
      arrow:{d:'M80 455 C120 470 165 485 212 499',x:212,y:499,label:'LOGIN MANUAL'},
      screen:()=>{const cells=Array.from({length:289},(_,i)=>`<span style="opacity:${((i*17+7)%11)>4?1:.3}"></span>`).join('');return base('screen-qr',`<div class="ps5-title">Iniciar sessão com código QR</div><div class="qr-layout"><div class="qr-copy"><div class="ps5-wordmark">PlayStation</div><p class="ps5-body">Para iniciar sessão, digitalize o código QR. Você também pode iniciar sessão no PlayStation App, indo para [ ⚙ ] &gt; [Digitalizar código QR].</p></div><div class="qr-demo">${cells}</div></div><div class="qr-actions"><div class="ps5-btn selected">Iniciar sessão manualmente</div><div class="ps5-btn">Crie uma conta</div><div class="ps5-btn">Ignorar e jogar offline</div></div>`);},
      instructions:['O QR Code real é gerado pelo seu próprio PS5 e pode expirar.','Neste roteiro, escolha “Iniciar sessão manualmente”.','Não escaneie códigos QR exibidos em capturas de tela ou enviados por terceiros.'],
      note:'O QR desta reconstrução é apenas decorativo e não pode ser escaneado. Nunca use um QR reproduzido em tutorial como se fosse o código de autenticação da sua conta.'
    },
    {
      id:'signin',title:'Iniciar sessão manualmente',short:'Login na PSN',time:'~ 1 min',
      intro:'A tela manual solicita a ID de início de sessão (endereço de e-mail) e a senha. Esses dados devem ser digitados exclusivamente no console.',
      caption:'A seta aponta para o campo “ID de início de sessão”. A senha é preenchida no campo logo abaixo.',
      arrow:{d:'M900 465 C850 370 790 260 721 193',x:721,y:193,label:'CAMPO DE E-MAIL'},
      screen:()=>{const keys='1234567890qwertyuiopasdfghjklzxcvbnm'.split('').map(k=>`<span>${k}</span>`).join('');return base('screen-signin',`<div class="ps5-title">Iniciar sessão manualmente</div><div class="signin-layout"><div class="signin-copy"><div class="ps5-wordmark">PlayStation</div><p class="ps5-body">Inicie sessão com sua ID de início de sessão (endereço de email) e senha.</p></div><div class="signin-fields"><div class="field-label">ID de início de sessão (endereço de email)</div><div class="field-box empty"></div><div class="field-label">Senha</div><div class="field-box empty"></div><div class="ps5-btn signin-button">Iniciar sessão</div></div></div><div class="keyboard">${keys}<span>ABC</span><span>@#:</span><span>Concluído</span></div>`);},
      instructions:['Digite a ID de início de sessão (e-mail) diretamente no PS5.','Digite a senha diretamente no campo correspondente do console.','Selecione “Iniciar sessão” quando os campos estiverem preenchidos.'],
      note:'Não informe senha neste site, em formulários da MCO ou em capturas de tela. A MCO GAMES não deve solicitar que o cliente envie sua senha por mensagem.'
    },
    {
      id:'twofa',title:'Verificação em duas etapas (2FA)',short:'Código 2FA',time:'~ 1 min',
      intro:'O vídeo mostra a conta com a verificação em duas etapas já ativada. O PS5 solicita um código temporário para concluir o login.',
      caption:'Se esta janela aparecer, solicite orientação/código ao suporte MCO GAMES e digite-o somente no PS5.',
      arrow:{d:'M850 475 C740 420 640 365 541 329',x:541,y:329,label:'CÓDIGO DE VERIFICAÇÃO'},
      screen:()=>base('screen-2fa',`<div class="ps5-title">Iniciar sessão manualmente</div><div class="modal-2fa"><div class="shield">♢<small>▣</small></div><div class="twofa-copy"><h4>Verificação em duas etapas</h4><p>A verificação em duas etapas está ativa em sua conta. Abra seu aplicativo autenticador e insira o código a seguir. Também é possível usar um código de backup salvo.</p><div class="twofa-field">Código de verificação<div class="field-box empty"></div></div><div class="ps5-btn twofa-ok">OK</div></div></div>`),
      instructions:['Pause a instalação quando o PS5 solicitar o código.','Entre em contato com o suporte MCO GAMES pelo canal oficial para solicitar orientação sobre o código desta conta.','Digite o código temporário exclusivamente no campo exibido pelo PS5 e selecione “OK”.'],
      note:'O código é temporário. Não o publique, não o envie em grupos e não o digite neste site. A tela de demonstração não contém código real.'
    },
    {
      id:'protect',title:'Revisar as opções “Proteja sua conta”',short:'Proteção da conta',time:'~ 30 s',
      intro:'Após a autenticação, o vídeo apresenta a tela “Proteja sua conta”, com duas opções locais de segurança do PS5.',
      caption:'Confira as opções exibidas e selecione “OK” para continuar, sem alterar configurações sem autorização.',
      arrow:{d:'M830 475 C720 470 610 460 500 453',x:500,y:453,label:'OK'},
      screen:()=>base('screen-protect',`<div class="ps5-title">Proteja sua conta</div><p class="protect-intro">Sua sessão na PlayStation Network nesse PS5 continuará até que você finalize a sessão em [Configurações]. Os seguintes passos são recomendados para proteger ainda mais a sua conta. Você pode alterar essas configurações a qualquer momento indo para [Configurações] &gt; [Usuários e contas].</p><div class="protect-row"><span class="protect-icon">♙</span><div><b>Exigir um código de acesso de login para o PS5</b><small>Use um código de acesso de quatro dígitos para que outras pessoas não façam login usando seus dados.</small></div><span class="protect-state">Desativado</span></div><div class="protect-row"><span class="protect-icon">▣</span><div><b>Exigir senha ao finalizar compra</b></div><span class="toggle"></span></div><div class="ps5-btn selected protect-ok">OK</div>`),
      instructions:['Leia as duas opções exibidas: código de acesso local do PS5 e senha ao finalizar compra.','Não confunda essas opções com a verificação em duas etapas da PSN.','Selecione “OK” para prosseguir, sem alterar controles de segurança sem autorização do titular.'],
      note:'A tela “Proteja sua conta” não é a configuração da 2FA. Ela trata de opções locais de acesso ao console e confirmação de compras.'
    },
    {
      id:'settings',title:'Abrir as configurações do PS5',short:'Configurações',time:'~ 30 s',
      intro:'Na tela inicial, abra Configurações (ícone de engrenagem) e localize “Usuários e contas”.',
      caption:'A seta aponta para “Usuários e contas” no menu Configurações.',
      arrow:{d:'M850 470 C740 405 620 335 500 280',x:500,y:280,label:'USUÁRIOS E CONTAS'},
      screen:()=>base('screen-settings',`<div class="ps5-title">Configurações</div><div class="settings-list"><div class="settings-row">${icon('◌')}Guia e dicas, Saúde e segurança e Outras informações</div><div class="settings-row">${icon('◉')}Acessibilidade</div><div class="settings-row">${icon('◎')}Rede</div><div class="settings-row active">${icon('▣')}Usuários e contas</div><div class="settings-row">${icon('♧')}Família e controles parentais</div><div class="settings-row">${icon('◇')}Sistema</div><div class="settings-row">${icon('▤')}Armazenamento</div><div class="settings-row">${icon('◖')}Áudio</div></div>`),
      instructions:['Na tela inicial, selecione o ícone de Configurações (engrenagem).','Na lista, escolha “Usuários e contas”.','Continue para a categoria “Outros”.'],
      note:'A posição dos itens pode variar ligeiramente conforme a versão do software do sistema do PS5.'
    },
    {
      id:'users',title:'Localizar o compartilhamento do console',short:'Usuários e contas',time:'~ 30 s',
      intro:'Dentro de “Usuários e contas”, acesse “Outros”. O menu à direita contém o compartilhamento e a restauração de licenças.',
      caption:'Selecione “Compartilhamento do console e jogo offline”.',
      arrow:{d:'M850 470 C770 360 700 245 632 159',x:632,y:159,label:'COMPARTILHAMENTO'},
      screen:()=>base('screen-users',`<div class="ps5-title">Usuários e contas</div><div class="users-layout"><div class="users-left"><span>Conta</span><span>Família</span><span>Privacidade</span><span>Serviços vinculados</span><span>Aplicativos autorizados</span><span class="active">Outros</span><span>Configurações de login</span></div><div class="users-right"><div class="settings-row active">Compartilhamento do console e jogo offline</div><div class="settings-row">Restaurar licenças</div><div class="settings-row">Finalizar sessão</div></div></div>`),
      instructions:['Na coluna esquerda, selecione “Outros”.','Na lista à direita, localize “Compartilhamento do console e jogo offline”.','Abra essa opção e observe se o console informa que está habilitada ou desabilitada.'],
      note:'Caminho oficial indicado pela Sony: Configurações > Usuários e contas > Outros > Compartilhamento do console e jogo offline.'
    }
  ];

  function sharingStep(){
    const isPrimary = licenseType === 'primary';
    const statusOptions = isPrimary ? [
      ['enabled','Já está habilitado neste PS5'],['disabled','Está desabilitado neste PS5'],['other','Aparece que está ativo em outro PS5']
    ] : [
      ['disabled','Está desabilitado neste PS5'],['enabled','Já está habilitado neste PS5'],['other','Aparece que está ativo em outro PS5']
    ];
    const config = sharingContent();
    return {
      id:'sharing',title:isPrimary?'Configuração para acesso primário':'Configuração para acesso secundário',short:'Compartilhamento',time:'~ 1–2 min',
      intro:isPrimary?'Para o caminho primário, o compartilhamento deve permanecer habilitado neste PS5 autorizado. Observe a mensagem e não desative uma configuração que já esteja correta.':'Para o caminho secundário, o compartilhamento deve permanecer desabilitado neste PS5. Não selecione “Habilitar” sem instrução expressa do titular da conta.',
      caption:config.caption,arrow:config.arrow,screen:config.screen,
      instructions:config.instructions,note:config.note,
      branch:{title:'O que aparece na tela do seu PS5?',options:statusOptions,selected:sharingStatus,result:config.result}
    };
  }
  function sharingContent(){
    const p = licenseType==='primary';
    if(sharingStatus==='enabled'){
      if(p) return {
        caption:'O vídeo mostra esta tela: o compartilhamento já está habilitado. Mantenha assim e selecione “Não desativar”.',
        arrow:{d:'M120 530 C205 520 285 500 362 488',x:362,y:488,label:'NÃO DESATIVAR'},
        screen:()=>base('screen-sharing sharing-enabled',`<div class="sharing-title">Compartilhamento do console e jogo offline</div><div class="sharing-message">A configuração [Compartilhamento do console e Jogo offline] está habilitada para você nesse PS5.</div><div class="sharing-sub">Deseja desativar [Compartilhamento do console e Jogo offline]? Se fizer isso, nenhum outro usuário desse PS5 poderá jogar seus jogos e mídias.<br><br>Você pode ter um PS5 com a configuração habilitada.</div><div class="sharing-actions"><div class="ps5-btn selected">Não desativar</div><div class="ps5-btn">Desativar</div></div>`),
        instructions:['O PS5 informa que o compartilhamento já está habilitado neste console.','Selecione “Não desativar” para manter a configuração.','Não escolha “Desativar” se a intenção é manter o compartilhamento primário neste PS5.'],
        note:'Esta é a situação mostrada no vídeo original. A seleção “Não desativar” preserva a configuração que já está habilitada.',
        result:'<strong>Primária · já habilitada</strong>O compartilhamento está ativo neste PS5. Selecione “Não desativar” e siga para a biblioteca.'
      };
      return {
        caption:'O compartilhamento já está habilitado neste PS5. Não altere essa ativação sem orientação do titular da conta.',
        arrow:{d:'M120 530 C205 520 285 500 362 488',x:362,y:488,label:'NÃO ALTERAR'},
        screen:()=>base('screen-sharing sharing-enabled',`<div class="sharing-title">Compartilhamento do console e jogo offline</div><div class="sharing-message">A configuração [Compartilhamento do console e Jogo offline] está habilitada para você nesse PS5.</div><div class="sharing-sub">Deseja desativar [Compartilhamento do console e Jogo offline]? Se fizer isso, nenhum outro usuário desse PS5 poderá jogar seus jogos e mídias.</div><div class="sharing-actions"><div class="ps5-btn selected">Não desativar</div><div class="ps5-btn">Desativar</div></div>`),
        instructions:['O compartilhamento aparece habilitado neste PS5.','Não selecione “Desativar” automaticamente.','Interrompa e confirme com o titular da conta se essa ativação está correta para o acesso secundário.'],
        note:'“Secundária” não é um modo oficial da Sony. Desativar o compartilhamento afeta os outros usuários desse console; só o titular deve autorizar qualquer mudança.',
        result:'<strong>Secundária · aparece habilitada</strong>O estado não corresponde ao fluxo secundário esperado. Não altere; procure o titular/suporte para confirmar antes de continuar.'
      };
    }
    if(sharingStatus==='disabled'){
      if(p) return {
        caption:'O compartilhamento está desabilitado. Só habilite se o titular autorizar este PS5 como o console de compartilhamento da conta.',
        arrow:{d:'M850 475 C740 440 620 410 500 381',x:500,y:381,label:'HABILITAR · SOMENTE AUTORIZADO'},
        screen:()=>base('screen-sharing sharing-disabled',`<div class="sharing-title">Compartilhamento do console e jogo offline</div><div class="sharing-message">O Compartilhamento do console e jogo offline está desabilitado neste PS5.</div><div class="sharing-sub">Habilite para permitir que outros usuários deste PS5 joguem os jogos e mídias adquiridos por esta conta, inclusive offline.</div><div class="ps5-btn selected">Habilitar</div>`),
        instructions:['Confirme com o titular que este é o único PS5 que deve ter o compartilhamento habilitado.','Se houver autorização, selecione “Habilitar”.','Se a conta estiver ativada em outro PS5, interrompa e peça ao titular para resolver a ativação pelo procedimento oficial.'],
        note:'A Sony permite habilitar o compartilhamento em apenas um PS5 por conta. Não tente contornar a ativação vinculada a outro console.',
        result:'<strong>Primária · está desabilitada</strong>Habilite somente com autorização do titular e se este for o PS5 destinado ao compartilhamento.'
      };
      return {
        caption:'Para o caminho secundário, mantenha o compartilhamento desabilitado. Não selecione “Habilitar”.',
        arrow:{d:'M840 470 C740 400 640 315 500 239',x:500,y:239,label:'MANTER DESABILITADO'},
        screen:()=>base('screen-sharing sharing-disabled',`<div class="sharing-title">Compartilhamento do console e jogo offline</div><div class="sharing-message">O Compartilhamento do console e jogo offline está desabilitado neste PS5.</div><div class="sharing-sub">A opção “Habilitar” ativaria o compartilhamento neste console. Para o caminho secundário deste roteiro, não altere esse estado.</div><div class="ps5-btn">Habilitar</div>`),
        instructions:['O estado desabilitado corresponde ao caminho secundário deste roteiro.','Não selecione “Habilitar”.','Continue sem modificar o compartilhamento e mantenha a conta proprietária acessível conforme as condições do serviço.'],
        note:'Com o compartilhamento desabilitado, outros usuários do PS5 não recebem o acesso compartilhado aos jogos dessa conta. A conta proprietária pode precisar permanecer conectada e online para validar licenças.',
        result:'<strong>Secundária · está desabilitada</strong>Correto para este fluxo. Não selecione “Habilitar”; prossiga para a biblioteca.'
      };
    }
    return {
      caption:'O PS5 informa que a ativação está associada a outro console. Não tente alterar a conta remotamente.',
      arrow:{d:'M840 470 C740 390 640 290 500 204',x:500,y:204,label:'PARE E PROCURE O TITULAR'},
      screen:()=>base('screen-sharing sharing-stop',`<div class="sharing-title">Compartilhamento do console e jogo offline</div><div class="sharing-message">Não foi possível concluir a alteração do compartilhamento neste PS5.</div><div class="sharing-sub">A conta pode estar com o compartilhamento habilitado em outro console PS5. O titular da conta deve verificar a ativação anterior.</div><div class="ps5-btn">Voltar</div>`),
      instructions:['Interrompa a configuração.','Não use o site da Sony para desativar todos os dispositivos sem autorização do titular.','Solicite ao titular que verifique o console que já está ativado.'],
      note:'A desativação remota de todos os dispositivos tem limite de uso definido pela Sony. Não é uma etapa normal de instalação.',
      result:'<strong>Ativação em outro PS5</strong>Não continue. O titular precisa verificar a ativação anterior e decidir o próximo passo.'
    };
  }

  function libraryStep(){return {
    id:'library',title:'Conferir a Biblioteca de jogos',short:'Biblioteca',time:'~ 1 min',
    intro:'O vídeo mostra a Biblioteca de jogos na aba “Sua coleção”. A captura original está vazia; ela identifica o menu, mas não comprova que um jogo esteja disponível.',
    caption:'A seta aponta para a aba “Sua coleção”. Se o jogo estiver disponível para essa conta, selecione-o e escolha “Baixar”.',
    arrow:{d:'M850 150 C650 130 420 95 216 73',x:216,y:73,label:'SUA COLEÇÃO'},
    screen:()=>base('screen-library',`<div class="library-tabs"><span>Instalado</span><span class="active">Sua coleção</span><span>PlayStation Plus</span></div><div class="library-art"></div><div class="library-empty"><b>Ainda não há nada aqui.</b><p>Acesse a PlayStation Store para começar.</p><div class="ps5-btn selected">▣ &nbsp; Ir para a PS Store</div></div>`),
    instructions:['Abra “Biblioteca de jogos” na tela inicial.','Selecione a aba “Sua coleção”.','Se o jogo aparecer, abra a página do título e selecione “Baixar”, se a licença permitir.'],
    note:'A tela vazia é a que aparece no vídeo. Não incluímos um jogo fictício nem um botão “Baixar” que não aparece na gravação. Se o jogo aparecer, selecione-o e escolha “Baixar”. Se a coleção estiver vazia, confirme a conta e a licença com o titular/suporte antes de comprar novamente. O modo repouso pode manter o download ativo se “Permanecer conectado à Internet” estiver habilitado; ele não aumenta a velocidade da conexão.'
  };}

  function switchStep(){
    const p=licenseType==='primary';
    return {
      id:'switch',title:p?'Abrir “Alternar usuário”':'Manter a conta conectada',short:p?'Alternar usuário':'Manter conectado',time:'~ 30 s',
      intro:p?'Com o compartilhamento habilitado neste PS5, você pode retornar ao seu perfil pessoal depois que o jogo estiver disponível.':'No caminho secundário, o compartilhamento fica desabilitado. Não alterne para outro perfil presumindo que ele terá acesso ao jogo.',
      caption:p?'Abra o menu do perfil e selecione “Alternar usuário”.':'Mantenha a sessão da conta proprietária ativa para iniciar o jogo, conforme as condições de acesso.',
      arrow:p?{d:'M850 100 C830 160 805 215 780 261',x:780,y:261,label:'ALTERNAR USUÁRIO'}:{d:'M850 70 C830 80 805 90 780 97',x:780,y:97,label:'CONTA CONECTADA'},
      screen:()=>base('screen-switch',`<div class="home-top"><b>Jogos</b><span>⌕　⚙　●　2:34 PM</span></div><div class="home-games"><div class="game-tile">PS5</div><div class="game-tile">JOGO</div><div class="game-tile">GAME</div><div class="game-tile">PLAY</div><div class="game-tile settings">▦</div></div><div class="switch-menu"><h5>Conta conectada</h5><div>Status online</div><div>Perfil</div><div>Troféus</div><div class="${p?'active':''}">${p?'Alternar usuário':'Conta da instalação'}</div><div>Fazer logout</div></div>`),
      instructions:p?['Abra o menu do perfil no canto superior da tela inicial.','Selecione “Alternar usuário”.','Na próxima etapa, escolha seu perfil pessoal.']:['Não selecione “Alternar usuário” para jogar em outro perfil.','Com o compartilhamento desabilitado, outros usuários não recebem o acesso compartilhado da conta.','Mantenha a conta que possui a licença conectada para iniciar o jogo, se essa for a condição informada pelo titular.'],
      note:p?'O compartilhamento habilitado permite que outros usuários deste PS5 joguem conteúdos adquiridos pela conta, sujeito à licença e às regras da Sony.':'A conta titular pode precisar permanecer conectada e online para validar a licença. A nomenclatura “secundária” não é um modo oficial da Sony.'
    };
  }

  function profileStep(){
    const p=licenseType==='primary';
    return {
      id:'profileSelect',title:p?'Selecionar seu perfil pessoal':'Permanecer na conta da instalação',short:p?'Seu perfil pessoal':'Conta proprietária',time:'~ 30 s',
      intro:p?'Depois de selecionar “Alternar usuário”, escolha o perfil que você utiliza normalmente para jogar.':'Neste caminho, mantenha selecionado o perfil da conta que possui a licença. Não mude para outro usuário esperando que o compartilhamento esteja disponível.',
      caption:p?'Selecione seu usuário pessoal. Os nomes e avatares no seu console serão diferentes.':'Permaneça no perfil da conta proprietária ao iniciar o jogo.',
      arrow:p?{d:'M850 460 C760 410 680 340 592 298',x:592,y:298,label:'SEU PERFIL PESSOAL'}:{d:'M850 460 C740 400 570 340 407 298',x:407,y:298,label:'PERMANEÇA NESTA CONTA'},
      screen:()=>base('screen-switch',`<div class="switch-profiles"><h4>Alternar usuário</h4><div class="ps5-body">Você assumirá os acessórios do usuário anterior. Será feito o logout desse usuário.</div><div class="switch-profile-row"><div class="switch-profile"><div class="switch-avatar">＋</div>Adicionar usuário</div><div class="switch-profile ${p?'':'active'}"><div class="switch-avatar">◉</div>Conta da instalação</div><div class="switch-profile ${p?'active':''}"><div class="switch-avatar">☺</div>Seu usuário pessoal</div><div class="switch-profile"><div class="switch-avatar">◈</div>Outro perfil</div></div></div>`),
      instructions:p?['Na tela “Alternar usuário”, localize seu perfil pessoal.','Selecione o perfil que você já utiliza no console.','O jogo pode ser iniciado por esse perfil quando o compartilhamento estiver habilitado e a licença permitir.']:['Não selecione “Seu usuário pessoal” neste fluxo.','Mantenha “Conta da instalação” como usuário ativo para iniciar o jogo.','Se o jogo não abrir, não altere o compartilhamento por conta própria; procure o suporte/titular.'],
      note:p?'Este passo só é aplicável se o compartilhamento estiver habilitado neste PS5.':'Com o compartilhamento desabilitado, os outros perfis do console não recebem o acesso compartilhado aos jogos dessa conta.'
    };
  }

  function diagnosticsStep(){
    const issueText={
      lock:{title:'Jogo com cadeado',body:'Confirme se a conta conectada é a proprietária do jogo e se a licença está disponível. O titular pode acessar Configurações > Usuários e contas > Outros > Restaurar licenças. Restaurar licenças não apaga os dados salvos.',items:['Verifique a conta proprietária e a disponibilidade da licença.','Confira a conexão e o status dos serviços PlayStation.','Se necessário, o titular pode restaurar as licenças no PS5.']},
      missing:{title:'Jogo não aparece na coleção',body:'Confira se a conta conectada é a que adquiriu o conteúdo e consulte o histórico de transações. A captura vazia do vídeo não confirma a existência de uma licença.',items:['Confira a conta conectada.','Verifique histórico de transações e filtros da biblioteca.','Não compre novamente antes de confirmar a licença.']},
      signin:{title:'Falha no login ou 2FA',body:'Confira a ID de início de sessão, a conexão e a mensagem exibida. Se for solicitado código 2FA, use o fluxo oficial e fale com o titular/suporte.',items:['Não compartilhe senha por mensagem.','Solicite orientação sobre o código 2FA pelo canal oficial.','Nunca digite o código neste site.']},
      activation:{title:'Ativação vinculada a outro PS5',body:'O compartilhamento só pode estar habilitado em um PS5 por conta. O titular deve verificar o console anterior e decidir se deseja alterar a ativação.',items:['Interrompa o procedimento.','Não desative dispositivos remotamente sem autorização.','Consulte o titular da conta e o suporte oficial PlayStation.']}
    };
    const d=issueText[issue];
    return {id:'diagnostics',title:d.title,short:'Solução de problemas',time:'~ 2 min',intro:'Selecione o problema que apareceu no console para ver as verificações correspondentes.',caption:'A seta aponta para “Restaurar licenças” no menu oficial de Usuários e contas > Outros.',arrow:{d:'M840 470 C740 390 630 280 500 193',x:500,y:193,label:'RESTAURAR LICENÇAS'},screen:()=>base('screen-diagnostics',`<div class="diag-title">Usuários e contas</div><div class="diag-menu"><div class="settings-row">${icon('▣')}Compartilhamento do console e jogo offline</div><div class="settings-row active">${icon('↻')}Restaurar licenças</div><div class="settings-row">${icon('⇥')}Finalizar sessão</div></div>`),instructions:d.items,note:d.body,branch:{title:'Qual problema você está enfrentando?',options:[['lock','Jogo com cadeado'],['missing','Jogo não aparece'],['signin','Falha de login / 2FA'],['activation','Ativação em outro PS5']],selected:issue,result:`<strong>${d.title}</strong>${d.body}`}};
  }

  function finishStep(){
    const p=licenseType==='primary';
    return {id:'finish',title:'Orientação concluída',short:'Finalização',time:'~ 30 s',intro:'Revise as condições do acesso antes de encerrar. Se o console apresentar uma tela diferente, não improvise.',caption:'Você chegou ao final do caminho selecionado pelo NEXUS.',arrow:{d:'M820 450 C730 420 620 380 500 354',x:500,y:354,label:'ETAPA CONCLUÍDA'},screen:()=>base('screen-finish',`<div class="finish-message"><h4>Pronto para continuar</h4><p>${p?'O compartilhamento deve permanecer habilitado neste PS5 para que outros perfis possam acessar os jogos, conforme as regras de licença.':'O compartilhamento permanece desabilitado neste PS5. O acesso pode depender da conta proprietária conectada e da validação online.'}</p><div class="finish-check">✓ &nbsp; Revisão concluída</div></div>`),instructions:['Confirme que concluiu apenas as etapas correspondentes ao tipo de acesso recebido.','Não compartilhe senha, QR Code ou código 2FA.','Em caso de cadeado, falha de licença ou mensagem de ativação, procure o suporte.'],note:'“Primária” e “secundária” são termos comerciais. A Sony não emite licenças com esses nomes; a disponibilidade depende dos direitos da conta, das regras de ativação e dos termos da plataforma.'};
  }

  function buildSteps(){return [...stepsBeforeSharing,sharingStep(),libraryStep(),switchStep(),profileStep(),diagnosticsStep(),finishStep()];}
  let steps=buildSteps();
  if(current>=steps.length)current=0;

  function save(){try{localStorage.setItem(storageKey,JSON.stringify({current,completed:[...completed]}))}catch{}}
  function renderNav(){
    $('stepNav').innerHTML=steps.map((s,i)=>`<button class="step-link ${i===current?'active':''} ${completed.has(s.id)?'done':''}" data-step="${i}"><span class="step-num">${completed.has(s.id)?'✓':String(i+1).padStart(2,'0')}</span><span class="step-label">${s.short}</span></button>`).join('');
    $('stepNav').querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>go(Number(b.dataset.step))));
  }
  function renderBranch(branch){
    if(!branch){$('branchArea').innerHTML='';return;}
    $('branchArea').innerHTML=`<div class="branch-title">${branch.title}</div><div class="branch-buttons">${branch.options.map(([v,t])=>`<button class="branch-button ${branch.selected===v?'selected':''}" data-branch-value="${v}">${t}</button>`).join('')}</div><div class="branch-result" id="branchResult">${branch.result}</div>`;
    $('branchArea').querySelectorAll('[data-branch-value]').forEach(btn=>btn.addEventListener('click',()=>{
      if(steps[current].id==='sharing')sharingStatus=btn.dataset.branchValue;else issue=btn.dataset.branchValue;
      render();
    }));
  }
  function render(){
    steps=buildSteps();const s=steps[current];
    $('licenseLabel').textContent=licenseNames[licenseType];
    $('licenseOrigin').textContent=params.has('licenca')||params.has('tipo')||params.has('license')?'Tipo recebido pelo parâmetro do link':'Prévia local · primária por padrão';
    $('stepTitle').textContent=s.title;$('stepIntro').textContent=s.intro;$('stepKicker').textContent=`ETAPA ${String(current+1).padStart(2,'0')} / ${String(steps.length).padStart(2,'0')}`;$('stepTime').textContent=s.time;
    $('screenCaption').textContent=s.caption;$('ps5Screen').innerHTML=s.screen();
    $('instructionList').innerHTML=s.instructions.map((t,i)=>`<div class="instruction-item"><span class="n">${i+1}</span><span>${t}</span></div>`).join('');
    $('coachNote').style.display=s.note?'block':'none';$('noteText').textContent=s.note||'';
    const a=s.arrow||{d:'M850 470 C750 420 650 350 500 280',x:500,y:280,label:'SIGA A ORIENTAÇÃO'};
    $('arrowPath').setAttribute('d',a.d);$('arrowHalo').setAttribute('cx',a.x);$('arrowHalo').setAttribute('cy',a.y);$('arrowCaption').textContent=a.label||'SIGA A ORIENTAÇÃO';applyFocus(inferFocus(s));
    $('backButton').disabled=current===0;$('nextButton').innerHTML=current===steps.length-1?'Concluir <span>✓</span>':'Próxima etapa <span>→</span>';
    $('stepCount').textContent=`${String(current+1).padStart(2,'0')} / ${String(steps.length).padStart(2,'0')}`;$('progressName').textContent=`Etapa ${current+1} de ${steps.length}`;
    $('progressPercent').textContent=`${Math.round(completed.size/steps.length*100)}%`;$('progressFill').style.width=`${completed.size/steps.length*100}%`;
    $('stepDots').innerHTML=steps.map((_,i)=>`<span class="${i===current?'active':''}"></span>`).join('');
    renderNav();renderBranch(s.branch);save();
  }
  function go(i){if(i<0||i>=steps.length)return;if(current!==i)completed.add(steps[current].id);current=i;render();}
  function next(){completed.add(steps[current].id);if(current<steps.length-1){current++;render();}else{render();showToast('Orientação concluída.');}save();}
  function showToast(t){$('toast').textContent=t;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2400)}
  function openModal(title,body){$('modalTitle').textContent=title;$('modalBody').innerHTML=body;$('modal').classList.remove('hidden');$('modalOk').focus()}
  function closeModal(){$('modal').classList.add('hidden')}
  function restart(){current=0;completed.clear();save();$('hero').classList.remove('hidden');$('app').classList.add('hidden');window.scrollTo({top:0,behavior:'smooth'});showToast('Tutorial reiniciado.');}
  $('startButton').addEventListener('click',()=>{$('hero').classList.add('hidden');$('app').classList.remove('hidden');render();});
  $('backButton').addEventListener('click',()=>go(current-1));$('nextButton').addEventListener('click',next);
  $('restartTop').addEventListener('click',()=>openModal('Reiniciar tutorial?','<p>O progresso salvo neste navegador será apagado para este tipo de acesso. Nenhuma senha ou código de autenticação é armazenado.</p><p>Deseja voltar ao início?</p>'));
  $('restartSide').addEventListener('click',()=>openModal('Reiniciar tutorial?','<p>O progresso salvo neste navegador será apagado para este tipo de acesso. Nenhuma senha ou código de autenticação é armazenado.</p>'));
  $('modalClose').addEventListener('click',closeModal);$('modalOk').addEventListener('click',()=>{if($('modalTitle').textContent.startsWith('Reiniciar'))restart();closeModal()});$('modal').addEventListener('click',e=>{if(e.target===$('modal'))closeModal()});
  $('supportButton').addEventListener('click',()=>openModal('Suporte MCO GAMES','<p>Na integração final, este botão será conectado ao canal de atendimento indicado pela loja.</p><p>Informe apenas o problema ou a mensagem apresentada no PS5. Não envie senha, QR Code, código 2FA ou dados completos da conta por este tutorial.</p>'));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
  if(saved && Number.isInteger(saved.current) && saved.current>0)$('startButton').innerHTML='Continuar orientação <span>→</span>';
})();
