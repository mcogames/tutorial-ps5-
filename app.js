(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const url = new URLSearchParams(location.search);
  const game = (url.get('jogo') || url.get('game') || 'seu jogo').trim().slice(0,90) || 'seu jogo';
  // A tela inicial sempre oferece escolha. O parâmetro licenca poderá destacar uma opção futuramente.
  const hintedKind = (url.get('licenca') || '').toLowerCase();
  const storageKey = 'mco_ps5_integrado_v07_' + (game.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').slice(0,45) || 'jogo');
  let current = 0, currentAction = 0, shareState = 'normal';
  let mode = 'primary';
  let secondaryShareState = 'ask';
  let lockShareState = 'ask';
  const modePosition = {primary:0, secondary:0, lock:0};
  const modeAction = {primary:0, secondary:0, lock:0};
  // Uma indicação é composta de duas reproduções sincronizadas da seta + trilha.
  const CYCLE_MS = 3550;
  const TRAVEL_BEGIN = 180;
  const TRAVEL_END = 2460;
  const HOLD_END = 2980;
  const LOOPS_PER_ACTION = 2;
  let autoPlaying = false;
  let rafId = 0;
  let timelineStart = null;
  let elapsedMs = 0;
  let overlayParts = null;
  let resumeAfterModal = false;
  let resumeAfterZoom = false;
  let resumeAfterHide = false;
  let done = new Set();
  let history = {};
  try { history = JSON.parse(localStorage.getItem(storageKey)||'{}'); if(Array.isArray(history.done)) done = new Set(history.done); } catch {}
  if(Number.isInteger(history.current) && history.current >= 0) current = history.current;
  if(['lock','primary','secondary'].includes(history.mode)) mode = history.mode;
  for(const m of ['primary','secondary','lock']) if(Number.isInteger(history[m+'Current'])) modePosition[m] = history[m+'Current'];
  if(['ask','enabled','disabled','conflict'].includes(history.lockShareState)) lockShareState = history.lockShareState;
  if(['ask','enabled','disabled','conflict'].includes(history.secondaryShareState)) secondaryShareState=history.secondaryShareState;
  const h = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  const R = (x,y,w,z,fill='#252338',rx=0,stroke='none',sw=1) => `<rect x="${x}" y="${y}" width="${w}" height="${z}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const C = (x,y,r,fill='none',stroke='none',sw=1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
  const L = (x1,y1,x2,y2,stroke='#aaa5ce',sw=2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${stroke}" stroke-width="${sw}" fill="none"/>`;
  const T = (x,y,str,size=30,fill='#eae5ff',anchor='start',weight=400) => `<text class="screen-svg-text" x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${h(str)}</text>`;
  const lines=(x,y,arr,size=25,fill='#c9c7e0',step=size*1.55,anchor='start') => arr.map((s,i)=>T(x,y+i*step,s,size,fill,anchor)).join('');
  const btn = (x,y,w,text,active=false,ht=68) => R(x,y,w,ht,active?'#e9e4f4':'#38364c',ht/2,active?'#ffffff':'#4f496a',active?3:1)+T(x+w/2,y+ht*.65,text,31,active?'#232035':'#e4dff2','middle',active?750:450);
  const title = text => T(75,101,text,48,'#f6f1ff');
  const backdrop = (type='classic') => {
    if(type==='home') return `${R(0,0,1600,900,'url(#blueHome)')}${Array.from({length:18},(_,i)=>C((i*221+19)%1600,(i*143+80)%900,3+i%5,'rgba(113,187,242,.13)')).join('')}${T(55,82,'Jogos',35,'#fff','start',750)}${T(200,82,'Mídia',35,'#adc3dd')}`;
    if(type==='library') return `${R(0,0,1600,900,'url(#libraryBG)')}${Array.from({length:10},(_,i)=>`<path d="M${1140+i*14} 0 C${890+i*3} 250 ${1460-i*20} 560 ${1110+i*8} 900" stroke="rgba(149,139,221,.07)" stroke-width="3" fill="none"/>`).join('')}`;
    return `${R(0,0,1600,900,'url(#psBG)')}${Array.from({length:170},(_,i)=>{const x=(i*79+113)%1600,y=(i*139+57)%900,r=.8+(i%8)*.48;return C(x,y,r,`rgba(245,188,154,${.03+(i%7)*.02})`)}).join('')}`;
  };
  const P = (cx,cy,name,mark,sel=false) => `${C(cx,cy,104,sel?'rgba(74,65,108,.23)':'rgba(57,49,84,.34)',sel?'#e7e2f5':'#6d6784',sel?4:2)}${T(cx,cy+25,mark,112,'#fff','middle',400)}${T(cx,cy+156,name,30,'#e5e0ee','middle')}`;
  const screenUser = () => `${title('Seja bem-vindo(a) novamente ao PlayStation')}${T(800,206,'Quem está usando esse controle?',33,'#b6b2c6','middle')}${T(810,287,'♙',40,'#c1bfcb','middle')}${P(805,452,'Adicionar usuário','+',true)}${P(1106,452,'Usuário 1','◉')}${P(1403,452,'Usuário 2','◈')}${T(800,855,'⏻',46,'#c6c3d4','middle')}${T(1510,858,'✕ Selecionar',25,'#eae5f1','end')}`;
  const screenAdd=()=>`${title('Adicionar usuário')}${L(800,220,800,800,'#7a7282',2)}${T(460,299,'☻⁺',90,'#fff','middle')}${T(1200,300,'♙',110,'#fff','middle')}${T(445,383,'Adicionar um usuário a esse PS5',37,'#faf5ff','middle')}${T(1208,383,'Jogar como convidado ocasional',36,'#faf5ff','middle')}${lines(180,465,['Inicie sessão com sua conta usada na','PlayStation Network ou crie uma nova.','Seus dados serão salvos neste console','para quando você quiser jogar.'],26)}${lines(940,465,['Os dados criados nesta sessão','serão excluídos quando você terminar.'],26)}${btn(175,677,550,'Vamos começar',true)}${btn(958,596,480,'Iniciar sessão')}${btn(958,690,480,'Jogo rápido')}`;
  const screenAgreement=()=>`${title('Acordo de Licença do Software do Sistema PlayStation 5')}${T(142,194,'ACORDO DE LICENÇA DO SOFTWARE DO SISTEMA PLAYSTATION 5',30,'#eeeaff','start',750)}${T(142,238,'Leia atentamente os termos apresentados no seu console.',26,'#d8d3e4')}${lines(142,296,['O acordo explica as condições de utilização do software','do sistema, os direitos e as responsabilidades','de quem utiliza o PlayStation 5.','', 'Este tutorial não substitui a leitura do texto legal','integral apresentado pelo console.'],30,'#bcb8d0',53)}${R(1147,685,37,37,'#646078',5)}${T(1165,716,'✓',30,'#fff','middle')}${T(1204,717,'Concordo',33)}${btn(1040,765,420,'Confirmar',true,72)}`;
  const screenQR=()=>`${title('Iniciar sessão com código QR')}${T(260,260,'◩  PlayStation',62,'#fff','start',700)}${lines(258,337,['Para iniciar sessão, digitalize o código QR','mostrado pelo seu próprio console.','Você também pode iniciar sessão manualmente.'],30,'#d0cadd',50)}${R(1005,220,315,315,'#f9f9fa',8)}${Array.from({length:13},(_,i)=>Array.from({length:13},(_,j)=>((i*17+j*31+(i*j)%5)%7<3?R(1025+j*21,240+i*21,20,20,'#090914'):'' )).join('')).join('')}${R(1000,548,330,35,'#242339',5)}${T(1160,573,'QR ilustrativo — não escanear',21,'#bcb4ce','middle')}${btn(154,746,450,'Iniciar sessão manualmente',true)}${btn(641,746,340,'Crie uma conta')}${btn(1021,746,435,'Ignorar e jogar offline')}`;
  const screenLogin=()=>`${title('Iniciar sessão')}${T(800,215,'Iniciar sessão manualmente',36,'#e7e3f4','middle')}${T(455,294,'ID de início de sessão (endereço de email)',27)}${R(455,322,690,74,'rgba(56,49,70,.42)',5,'#d3cbe4',3)}${T(455,459,'Senha',27)}${R(455,479,690,68,'rgba(56,49,70,.15)',3,'#928caa',1)}${btn(480,621,640,'Iniciar sessão',false)}${T(800,758,'Ainda não tem uma conta?',24,'#d0cbdc','middle')}${T(800,805,'Crie uma conta',29,'#fff','middle',700)}`;
  const screen2FA=()=>`${T(92,106,'Iniciar sessão manualmente',43,'#c0c3d7')}${R(210,153,1180,600,'#060715',2)}${T(272,225,'Verificação em duas etapas',45)}${T(460,435,'⬡',180,'#aba6da','middle')}${lines(625,351,['A verificação em duas etapas está ativa nesta conta.','Digite o código solicitado pelo PS5 no campo abaixo.','Use somente o código autorizado pelo titular da conta.'],29,'#c8c4e2',50)}${T(622,537,'Código de verificação',28)}${R(622,559,480,64,'#080817',4,'#c3badd',3)}${btn(650,679,440,'OK',false)}`;
  const screenProtect=()=>`${title('Proteja sua conta')}${T(800,233,'Confira as opções de segurança oferecidas pelo PS5.',31,'#d9d2e9','middle')}${R(185,306,1230,134,'rgba(181,168,211,.08)',10,'#746f95',2)}${T(232,364,'♢',55,'#c4b7e3')}${T(320,366,'Código de acesso ao PS5',33,'#f4ebff')}${T(320,408,'Protege o acesso ao perfil neste console.',24,'#bcb4cf')}${R(185,470,1230,134,'rgba(181,168,211,.08)',10,'#746f95',2)}${T(232,527,'⬡',55,'#c4b7e3')}${T(320,530,'Exigir senha para compras',33,'#f4ebff')}${T(320,573,'Protege as compras efetuadas na PlayStation Store.',24,'#bcb4cf')}${btn(590,700,420,'Continuar',false)}`;
  const screenOptional=()=>`${title('Configurações adicionais (se aparecerem)')}${T(800,290,'Algumas contas exibem mais etapas após o login.',33,'#ddd6f4','middle')}${T(800,346,'Veja as opções da sua própria tela antes de avançar.',29,'#c1b9de','middle')}${btn(175,485,385,'Seguinte')}${btn(606,485,385,'Fazer isso mais tarde')}${btn(1037,485,385,'Pular')}${T(800,693,'Opções ilustrativas — a disposição pode variar no seu PS5.',27,'#b3afcf','middle')}`;
  const homeTop = ()=>`${T(1190,73,'⌕',53,'#e5edff')}${T(1290,73,'⚙',52,'#eaf2ff')}${C(1386,53,27,'#1e4566')}${T(1386,63,'◉',28,'#fff','middle')}${T(1535,68,'2:18 PM',35,'#d8eeff','end')}`;
  const gameLibraryGlyph = (x,y,scale=1) => `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="#f6faff" stroke-width="3" stroke-linejoin="round"><rect x="2" y="1" width="40" height="38" rx="1"/><path d="M15 1v38M29 1v38M2 14h40M2 27h40" stroke-width="2.6"/><path d="M11 49q-9 0-11 11l-3 11q-1 9 7 9 5 0 10-7h20q5 7 10 7 8 0 7-9l-3-11q-2-11-11-11z" fill="#f6faff" stroke="#f6faff" stroke-width="1"/><path d="M8 61h11m-5-5v11" stroke="#17263d" stroke-width="4"/><circle cx="37" cy="59" r="2.7" fill="#17263d" stroke="none"/><circle cx="43" cy="65" r="2.7" fill="#17263d" stroke="none"/></g>`;
  const homeIcons = () => `${Array.from({length:8},(_,i)=>{const x=110+i*139;const fill=['#245d91','#183c91','#111f3b','#2b5478','#142b44','#19445f','#283b61','#162d45'][i];return R(x,120,116,116,fill,13, '#6ca1c7',1.2)}).join('')}${T(170,199,'▣',58,'#fff','middle')}${T(310,200,'A',58,'#fff','middle')}${T(450,200,'▣',58,'#fff','middle')}${T(587,199,'▶',56,'#fff','middle')}${T(726,199,'♧',59,'#fff','middle')}${T(866,199,'✦',57,'#fff','middle')}${T(1006,202,'▦',60,'#fff','middle')}${gameLibraryGlyph(1128,164,1)}`;
  const screenHome=()=>`${homeTop()}${homeIcons()}${T(178,326,'ASTRO’S',90,'#fff','start',950)}${T(178,424,'PLAYROOM',110,'#fff','start',950)}${lines(190,490,['Descubra o futuro do jogo','com ASTRO no PS5!'],39,'#d7e9fb',58)}${btn(185,694,314,'Exibir produto')}${T(1470,595,'◉',280,'rgba(178,220,255,.13)','middle')}`;
  const screenSettings=()=>`${title('Configurações')}${[
  ['▦','Guia do usuário, Saúde e segurança e Outras informações'],['◉','Acessibilidade'],['◎','Rede'],['☻','Usuários e contas'],['♟','Família e controles parentais'],['⬡','Sistema'],['▣','Armazenamento'],['◖','Áudio'],['▤','Tela e vídeo']
  ].map(([sym,name],i)=>{let y=154+i*76;return `${i===3?R(225,y-27,1130,68,'rgba(167,156,197,.17)',0,'#bcb5d5',2):''}${T(261,y+15,sym,32,'#e8e2f3')}${T(328,y+15,name,31,'#d6d1e5')}${L(328,y+38,1360,y+38,'rgba(168,160,197,.19)',1)}`}).join('')}`;
  const screenOthers=()=>`${title('Usuários e contas')}${['Conta','Família','Privacidade','Serviços vinculados','Aplicativos autorizados','Outros','Configurações de login','Excluir usuários'].map((s,i)=>`${i===5?R(132,565,367,76,'rgba(166,156,194,.16)',0,'#bfb7dc',3):''}${T(156,199+i*82,s,33,i===5?'#fff':'#bbb4d0')}`).join('')}${['Compartilhamento do console e jogo offline','Restaurar licenças','Finalizar sessão'].map((s,i)=>`${T(558,207+i*81,s,32,'#c7c3d9')}${L(558,236+i*81,1440,236+i*81,'#413d55',2)}`).join('')}`;
  const screenShareRow=()=>`${title('Usuários e contas')}${['Conta','Família','Privacidade','Serviços vinculados','Aplicativos autorizados','Outros','Configurações de login'].map((s,i)=>T(150,194+i*84,s,31,i===5?'#e4e1f1':'#aaa6bc')).join('')}${R(542,145,952,151,'rgba(166,156,194,.14)',0,'#bfb7dc',3)}${T(560,206,'Compartilhamento do console e jogo offline',31,'#eee8fa')}${lines(560,245,['Permita que qualquer usuário deste PS5 jogue seus jogos e reproduza suas','mídias, mesmo quando o console estiver offline.'],24,'#aca8c3',32)}${T(558,356,'Restaurar licenças',30)}${T(558,442,'Finalizar sessão',30)}`;
  const screenSharing = state => state==='enabled'
    ? `${title('Compartilhamento do console e jogo offline')}${T(800,365,'O compartilhamento do console já está habilitado neste PS5.',33,'#e0d8ec','middle')}${T(800,416,'Não desative uma configuração que está funcionando.',29,'#c5c0d7','middle')}${btn(540,659,520,'Não desativar',true)}`
    : state==='conflict' ? `${title('Compartilhamento do console e jogo offline')}${lines(260,282,['Você já tem outro PS5 com o compartilhamento habilitado.','Alterar esta configuração pode retirar o compartilhamento do outro PS5.','Confirme com o titular da conta antes de mudar qualquer ativação.'],30,'#d8cce4',75)}${btn(255,681,540,'Não habilitar',true)}${btn(835,681,500,'Habilitar')}`
    : `${title('Compartilhamento do console e jogo offline')}${T(800,304,'O compartilhamento do console está desabilitado.',33,'#e3ddee','middle')}${T(800,364,'Habilite somente se o titular autorizou este PS5.',30,'#d1c9df','middle')}${btn(542,595,520,'Habilitar',true)}`;
  const screenLibraryHome=()=>`${homeTop()}${homeIcons()}${T(190,376,'ASTRO’S',85,'#fff','start',950)}${T(190,463,'PLAYROOM',104,'#fff','start',950)}${lines(196,521,['Na tela principal, abra o ícone da Biblioteca de jogos.'],29,'#e1edf8')}${R(1092,99,116,146,'rgba(34,225,255,.08)',16,'#b7cdeb',2)}`;
  const libraryHeader=()=>`${gameLibraryGlyph(66,68,.53)}${T(170,104,'Biblioteca de jogos',41,'#eee9f8')}${T(158,211,'Instalado',32,'#b7b2cb')}${T(408,211,'Sua coleção',32,'#f5eeff')}${T(705,211,'PlayStation Plus',32,'#b7b2cb')}`;
  const cover=()=>`${R(150,302,290,325,'url(#coverBG)',5,'#a2b9d0',2)}${C(295,416,93,'rgba(35,236,233,.17)','#9beaff',7)}${T(295,408,'✦',63,'#fff','middle',850)}${T(295,462,game.length>15?game.slice(0,14)+'…':game,30,'#fff','middle',850)}`;
  const screenLibrary=()=>`${libraryHeader()}${T(150,301,'Todos: 1',30,'#bcb4ce')}${cover()}${T(1270,295,'Classificar por: Mais recente',28,'#a9a6c4','middle')}`;
  const screenSelectGame=()=>`${libraryHeader()}${T(150,302,'Todos: 1',29,'#d7d0ea')}${cover()}${T(512,410,'Escolha seu jogo na coleção',37,'#d3cce8')}${T(512,471,'Procure o título que você comprou.',28,'#aba5c7')}`;
  const screenDownload=()=>`${title('Detalhes do jogo')}${R(160,218,397,485,'url(#coverBG)',10)}${C(356,408,138,'rgba(35,236,233,.12)','#9beaff',6)}${T(355,424,game.length>15?game.slice(0,14)+'…':game,42,'#fff','middle',850)}${T(682,270,game.length>24?game.slice(0,23)+'…':game,54,'#fff','start',720)}${T(682,351,'PS5 · Versão digital',30,'#b9b5d7')}${btn(678,515,525,'Baixar',true,83)}${T(682,636,'Se o jogo estiver instalado, a opção poderá ser “Jogar”.',28,'#b9b4cf')}`;
  const screenProfileMenu = ()=>`${homeTop()}${homeIcons()}${R(1030,106,510,568,'rgba(21,25,48,.94)',10,'#5d5976',1.5)}${T(1093,167,'Perfil',33,'#e6e0f4')}${['Status online','Perfil','Troféus','Alternar usuário','Fazer logout'].map((s,i)=>`${i===3?R(1044,201+i*90,472,82,'rgba(146,142,176,.12)',4,'#a1a1bb',2):''}${T(1090,263+i*88,s,32,'#eeeaf9')}${L(1074,282+i*88,1510,282+i*88,'rgba(171,167,193,.19)',1)}`).join('')}`;
  const screenLogout=()=>`${homeTop()}${homeIcons()}${R(1030,106,510,568,'rgba(21,25,48,.94)',10,'#5d5976',1.5)}${T(1093,167,'Perfil',33,'#e6e0f4')}${['Status online','Perfil','Troféus','Alternar usuário','Fazer logout'].map((s,i)=>`${i===4?R(1044,201+i*90,472,82,'rgba(146,142,176,.15)',4,'#c1badd',3):''}${T(1090,263+i*88,s,32,'#eeeaf9')}${L(1074,282+i*88,1510,282+i*88,'rgba(171,167,193,.19)',1)}`).join('')}`;
  const screenPersonal=()=>`${title('Quem está usando esse controle?')}${T(800,244,'Selecione seu usuário pessoal',36,'#c1b9d5','middle')}${P(556,454,'Perfil de instalação','M')}${P(1042,454,'Seu usuário pessoal','☺',true)}${T(800,754,'Os nomes e as imagens de perfil podem ser diferentes.',29,'#b8b4cb','middle')}`;
  const screenFinish=()=>`${T(800,285,'✓',180,'#54f6ff','middle')}${T(800,414,'Tudo pronto!',75,'#fff','middle',800)}${T(800,503,'Você chegou ao fim do passo a passo.',34,'#d2cde3','middle')}${T(800,562,'Aproveite seu jogo!',35,'#9df7ff','middle',750)}`;
  // Screens for the separate, official-license troubleshooting path. Illustrative UI only.
  const screenLockIntro = () => `${libraryHeader()}${T(145,298,'Todos: 1',30,'#c2b9dd')}${cover()}${R(337,302,103,103,'rgba(6,9,26,.87)',8)}${T(390,379,'🔒',65,'#fff','middle')}${T(560,372,'Jogo com cadeado?',52,'#f4efff')}${lines(560,434,['Vamos conferir a conta, o compartilhamento','e as licenças do jogo no PS5.'],32,'#c6c0dc',56)}`;
  const screenLockAccount = () => `${title('Verificar acesso ao jogo')}${T(800,287,'Confira se o jogo pertence à conta conectada.',35,'#f4efff','middle')}${R(320,355,960,137,'rgba(169,150,200,.12)',15,'#8e85ae',2)}${T(800,412,'Conta que adquiriu o jogo',38,'#fff','middle')}${T(800,459,'Confirme a licença e o histórico de compras.',29,'#c8c1df','middle')}${T(800,634,'Se for do PlayStation Plus, confira se a assinatura ainda está ativa.',28,'#b9b2ce','middle')}`;
  const screenRestoreMenu = () => `${title('Usuários e contas')}${['Conta','Família','Privacidade','Serviços vinculados','Aplicativos autorizados','Outros'].map((v,i)=>T(150,200+i*96,v,30,i===5?'#fff':'#bab5d2')).join('')}${T(565,203,'Compartilhamento do console e jogo offline',30,'#c6c2dc')}${R(545,258,955,87,'rgba(178,163,205,.18)',4,'#e2daf7',2.6)}${T(573,316,'Restaurar licenças',33,'#fff')}${T(570,411,'Finalizar sessão',30,'#c6c2dc')}`;
  const screenRestore = () => `${title('Restaurar licenças')}${T(800,299,'Escolha o jogo ou as licenças que deseja restaurar.',32,'#ddd5eb','middle')}${R(340,351,920,180,'rgba(152,144,185,.15)',10,'#8e86b4',2)}${T(800,431,'Selecione as licenças',38,'#fff','middle')}${T(800,479,'A lista real depende do conteúdo da conta.',26,'#c3bcd4','middle')}${btn(560,645,480,'Restaurar',true)}${T(800,769,'A restauração não apaga os dados salvos.',27,'#b8b0cc','middle')}`;
  const screenLockRetry = () => `${libraryHeader()}${T(155,301,'Todos: 1',28,'#bbb3d0')}${cover()}${T(540,423,'Volte ao seu jogo e tente abrir novamente.',36,'#f4eeff')}${T(540,481,'Se ainda houver cadeado, procure ajuda.',30,'#c5beda')}`;
  const screenLockFinish = () => `${T(800,260,'✓',162,'#64edff','middle')}${T(800,408,'Verificação concluída!',67,'#fff','middle',750)}${T(800,508,'Tente abrir seu jogo novamente.',38,'#d6d0e6','middle')}${T(800,569,'Se continuar bloqueado, procure o suporte.',34,'#9deeff','middle')}`;
  const screenLockChoice = () => `${title('Compartilhamento do console e jogo offline')}${T(800,306,'O que aparece na tela do seu PS5?',42,'#fff','middle')}${R(255,396,1090,230,'rgba(183,165,221,.1)',14,'#aea5cd',2)}${lines(800,465,['Selecione abaixo a situação exibida no seu console.','Não mude a ativação de outro PS5 sem autorização do titular.'],31,'#d4cce5',58,'middle')}`;
  const screenSecondaryAccount=()=>`${title('Usar a conta que possui o jogo')}${T(800,276,'Para esta modalidade, utilize o perfil da conta com acesso ao jogo.',35,'#ece8f8','middle')}${P(545,458,'Sua conta pessoal','☺')}${P(1070,458,'Conta com o jogo','✦',true)}${T(800,727,'Acesso depende da licença e da conexão com a PlayStation Network.',27,'#c7c1df','middle')}`;
  const screenSecondaryFinish=()=>`${T(800,277,'✓',175,'#55eaff','middle')}${T(800,411,'Tudo pronto!',75,'#fff','middle',800)}${T(800,500,'Confira se o download terminou.',34,'#d8d1e8','middle')}${T(800,568,'Abra o jogo no perfil com a licença válida.',31,'#99f3ff','middle')}`;
  const screenSecondaryStatus=()=> secondaryShareState==='ask' ? screenLockChoice()
    : secondaryShareState==='enabled'
      ? `${title('Compartilhamento do console e jogo offline')}${T(800,330,'O compartilhamento já aparece habilitado neste PS5.',32,'#ece7f9','middle')}${T(800,389,'Não altere a configuração sem consultar o titular.',28,'#cfc8e2','middle')}${btn(540,657,520,'Não desativar',true)}`
      : secondaryShareState==='conflict'
        ? `${title('Compartilhamento do console e jogo offline')}${lines(250,293,['Há outro PS5 associado ao compartilhamento.','Nesta orientação, não mude a ativação desse console.','Use “Não habilitar” e continue apenas se a conta tiver acesso ao jogo.'],29,'#e3d5f1',78)}${btn(273,677,520,'Não habilitar',true)}${btn(833,677,520,'Habilitar')}`
        : `${title('Compartilhamento do console e jogo offline')}${T(800,315,'O compartilhamento está desabilitado neste PS5.',33,'#e6deef','middle')}${T(800,389,'Para este caminho, não é necessário habilitá-lo.',29,'#d3c8df','middle')}${btn(540,653,520,'Não habilitar',true)}`;
  const circle = (x,y,r)=>({type:'circle',x,y,r});
  const box=(x,y,w,height,rx=12)=>({type:'rect',x,y,w,h:height,rx});
  const installationSteps = [
    {id:'adicionar',name:'Adicionar usuário',lead:'No seletor de perfis do PS5, escolha o botão com o símbolo de “+”.',render:screenUser,actions:[{label:'Selecione “Adicionar usuário”.',focus:circle(805,452,104)}],todo:['Localize o círculo com o sinal de “+”.','Selecione “Adicionar usuário”.'],note:'O nome e os avatares dos outros usuários variam de console para console.'},
    {id:'perfil',name:'Criar perfil permanente',lead:'Escolha a opção da esquerda para criar um usuário salvo no console.',render:screenAdd,actions:[{label:'Na coluna esquerda, selecione “Vamos começar”.',focus:box(175,677,550,68,34)}],todo:['Verifique “Adicionar um usuário a esse PS5”.','Selecione “Vamos começar”.'],note:'Não utilize “Jogar como convidado ocasional”: esse modo não mantém o perfil.'},
    {id:'contrato',name:'Concordar e confirmar',lead:'Leia o acordo apresentado e conclua as duas ações nesta mesma tela.',render:screenAgreement,actions:[{label:'Leia os termos e, se concordar, marque “Concordo”.',focus:box(1145,681,43,43,6)},{label:'Depois, selecione “Confirmar”.',focus:box(1040,765,420,72,35)}],todo:['Leia o acordo de licença integral no seu PS5.','Se concordar, marque “Concordo”.','Depois, selecione “Confirmar”.'],note:'O texto legal foi resumido visualmente. O documento válido é o exibido em seu próprio console.'},
    {id:'qr',name:'Início de sessão manual',lead:'No acesso por QR Code, escolha entrar manualmente.',render:screenQR,actions:[{label:'Selecione “Iniciar sessão manualmente”.',focus:box(154,746,450,68,34)}],todo:['Não use um QR Code de outra tela.','Selecione “Iniciar sessão manualmente”.'],note:'O QR do desenho é apenas ilustrativo e não é um código de autenticação.'},
    {id:'login',name:'Digitar e-mail e senha',lead:'Preencha as credenciais apenas nos campos do próprio PS5.',render:screenLogin,actions:[{label:'Digite o e-mail da conta que você recebeu da MCO GAMES.',focus:box(455,322,690,74,7)},{label:'Agora, digite a senha enviada pela MCO GAMES.',focus:box(455,479,690,68,7)},{label:'Depois de preencher os dados, selecione “Iniciar sessão”.',focus:box(480,621,640,68,34)}],todo:['Preencha a ID de início de sessão (e-mail).','Preencha a senha.','Selecione “Iniciar sessão”.'],note:'Nunca digite e-mail ou senha neste site. Faça o login diretamente no console.'},
    {id:'2fa',name:'Verificação em duas etapas',lead:'Quando a verificação aparecer, solicite o código temporário ao titular da conta.',render:screen2FA,actions:[{label:'Entre em contato com a MCO GAMES e insira no PS5 o código recebido.',focus:box(622,559,480,64,5)},{label:'Após informar o código no console, selecione “OK”.',focus:box(650,679,440,68,34)}],todo:['Quando aparecer 2FA, entre em contato com a MCO GAMES pelo canal oficial.','Digite o código temporário somente no PS5.','Selecione “OK” para continuar.'],note:'A verificação já está configurada. Não a desative. Não envie códigos para pessoas não autorizadas.'},
    {id:'protect',name:'Proteção da conta',lead:'Etapa opcional: em alguns perfis, o PS5 apresenta opções de proteção após o primeiro login.',render:screenProtect,actions:[{label:'Confira as opções de segurança. Não desative proteções existentes e prossiga no console.',focus:box(590,700,420,68,34)}],todo:['Leia as opções de proteção da conta, se aparecerem.','Mantenha as medidas de segurança que já estiverem configuradas.','Avance após revisar as informações.'],note:'Exemplo visual da etapa de proteção: a disposição e os botões podem variar conforme a versão do PS5.'},
    {id:'extra',name:'Configurações adicionais',lead:'Etapa opcional: pode ser exibida em alguns consoles após o login.',render:screenOptional,actions:[{label:'Se surgir uma tela adicional, leia e use “Seguinte”, “Pular” ou “Fazer isso mais tarde” conforme a opção exibida.',focus:box(175,485,1247,68,34)}],todo:['Algumas contas exibem opções adicionais após o login.','Leia cada tela e avance conforme desejar; não desative a segurança.','Se não aparecer, prossiga para a próxima etapa.'],note:'Essa tela é ilustrativa, não é um print de um menu específico do PS5.'},
    {id:'config-home',name:'Abrir Configurações',lead:'Na página inicial do PS5, encontre a engrenagem no topo direito.',render:screenHome,actions:[{label:'Selecione o ícone de “Configurações” (engrenagem).',focus:circle(1290,58,43)}],todo:['Retorne à tela inicial de jogos.','Selecione a engrenagem de “Configurações”.']},
    {id:'config-users',name:'Usuários e contas',lead:'No menu Configurações, procure a linha “Usuários e contas”.',render:screenSettings,actions:[{label:'Selecione “Usuários e contas”.',focus:box(225,355,1130,68,4)}],todo:['Encontre “Usuários e contas”.','Confirme com o botão X do controle.']},
    {id:'outros',name:'Selecionar Outros',lead:'Dentro de “Usuários e contas”, a opção “Outros” fica na coluna esquerda.',render:screenOthers,actions:[{label:'Selecione “Outros”.',focus:box(132,565,367,76,3)}],todo:['Vá até a coluna esquerda.','Selecione “Outros”.']},
    {id:'compartilhar',name:'Abrir compartilhamento',lead:'Acesse a configuração oficial de compartilhamento do console.',render:screenShareRow,actions:[{label:'Selecione “Compartilhamento do console e jogo offline”.',focus:box(542,145,952,151,3)}],todo:['Localize a primeira opção na coluna direita.','Abra “Compartilhamento do console e jogo offline”.']},
    {id:'ativacao',name:'Verificar ativação primária',lead:'A mensagem exibida depende do estado atual de compartilhamento.',render:()=>screenSharing(shareState),actions:[],todo:[],note:'A Sony permite habilitar o compartilhamento em apenas um PS5 por conta. Não substitua a ativação de outro console sem autorização.',state:true},
    {id:'biblioteca-home',name:'Abrir Biblioteca de jogos',lead:'Volte à tela inicial e abra o ícone da biblioteca.',render:screenLibraryHome,actions:[{label:'No início dos jogos, selecione “Biblioteca de jogos”.',focus:box(1092,99,116,146,16)}],todo:['Volte para Início dos jogos.','Acesse “Biblioteca de jogos”.']},
    {id:'biblioteca',name:'Entrar em Sua coleção',lead:'A biblioteca apresenta as abas Instalado, Sua coleção e PlayStation Plus.',render:screenLibrary,actions:[{label:'Abra a aba “Sua coleção” para localizar seu jogo.',focus:box(390,151,230,82,6)}],todo:['Abra a biblioteca.','Selecione “Sua coleção”.'],note:'O conteúdo exibido depende dos jogos efetivamente disponíveis para a conta.'},
    {id:'jogo',name:'Selecionar o jogo',lead:'Identifique o jogo adquirido e selecione sua capa.',render:screenSelectGame,actions:[{label:'Encontre e selecione “${game}”, o jogo que você comprou.',focus:box(150,302,290,325,7)}],todo:['Localize o título correto na lista.','Selecione a capa do jogo.'],note:'A capa ilustrada é genérica. O jogo real exibirá sua capa e seu nome.'},
    {id:'download',name:'Baixar o jogo',lead:'Etapa acrescentada: a seleção do jogo abre a página de detalhes, onde pode aparecer “Baixar”.',render:screenDownload,actions:[{label:'Se a conta possui o jogo e aparecer “Baixar”, selecione essa opção.',focus:box(678,515,525,83,42)}],todo:['Confirme que é o título correto.','Selecione “Baixar”, quando disponível.','Acompanhe o andamento do download.'],note:'Esta tela foi reconstruída como exemplo didático: o vídeo enviado não demonstra o botão de download. Se aparecer “Comprar”, não faça outra compra. Procure o suporte.'},
    {id:'perfil-menu',name:'Abrir menu do perfil',lead:'Na tela principal, abra o avatar no canto superior direito.',render:screenProfileMenu,actions:[{label:'Selecione o ícone do perfil no topo direito.',focus:circle(1386,53,28)}],todo:['Volte para a tela inicial.','Abra o avatar do usuário no topo direito.']},
    {id:'logout',name:'Fazer logout',lead:'No menu do usuário, escolha a opção “Fazer logout”.',render:screenLogout,actions:[{label:'Selecione “Fazer logout”.',focus:box(1044,561,472,82,4)}],todo:['No menu do perfil, localize “Fazer logout”.','Saia da sessão e volte à seleção de usuários.'],note:'Fazer logout é diferente de excluir o usuário. Não exclua o perfil usado para baixar o jogo.'},
    {id:'pessoal',name:'Voltar ao usuário pessoal',lead:'Na seleção de usuários, escolha seu perfil habitual para jogar.',render:screenPersonal,actions:[{label:'Selecione seu usuário pessoal para jogar.',focus:circle(1042,454,105)}],todo:['Após sair, escolha o perfil que você normalmente usa no PS5.','Abra o jogo quando a instalação estiver concluída.'],note:'O compartilhamento deve permanecer habilitado no PS5 para que outros perfis possam acessar jogos comprados pela conta proprietária, conforme a licença.'},
    {id:'fim',name:'Instalação concluída',lead:'Concluímos o tutorial. Confirme o download antes de jogar.',render:screenFinish,actions:[],todo:['Confirme que o jogo terminou de baixar e instalar.','Jogue no seu perfil pessoal, quando o compartilhamento estiver corretamente habilitado.','Se houver cadeado, use a opção “Preciso de ajuda”.'],note:'A disponibilidade de jogos depende das licenças e regras da PlayStation. “Primária” não é uma licença transferível oficial da Sony.'}
  ];
  // Fluxo secundário: a conta deve ter direito de uso do jogo; não ativa compartilhamento neste roteiro.
  const secondarySteps = [
    ...installationSteps.slice(0,12),
    {id:'sec-ativacao',name:'Conferir compartilhamento',lead:'Vamos conferir o estado da opção, sem alterar a ativação de outro console.',render:screenSecondaryStatus,actions:[],todo:[],note:'Você não precisa habilitar o compartilhamento neste caminho. Não desative uma configuração existente sem autorização do titular.',state:'secondary'},
    ...installationSteps.slice(13,17),
    {id:'sec-perfil',name:'Acessar pela conta com o jogo',lead:'Nesta modalidade, não troque para um perfil sem licença própria.',render:screenSecondaryAccount,actions:[{label:'Use o perfil da conta que possui o jogo e mantenha o PS5 conectado à internet.',focus:circle(1070,458,104)}],todo:['Confira que está usando o perfil com licença válida.','Mantenha a internet disponível para eventual validação online.'],note:'Sem compartilhamento habilitado, não é garantido que outro usuário deste PS5 consiga abrir o jogo.'},
    {id:'sec-fim',name:'Orientação concluída',lead:'Você concluiu o roteiro secundário.',render:screenSecondaryFinish,actions:[],todo:['Conclua o download do jogo.','Acesse o jogo pelo perfil que possui a licença.','Se não abrir ou mostrar cadeado, use o guia de solução de problemas.'],note:'A disponibilidade depende de uma licença válida e das regras da PlayStation.'}
  ];
  const lockSteps = [
    {id:'lock-intro',name:'Jogo com cadeado',lead:'Vamos verificar por que o jogo não está abrindo.',render:screenLockIntro,actions:[{label:'Localize o jogo com cadeado na Biblioteca de jogos.',focus:box(150,302,290,325,7)}],todo:['Confira qual jogo está bloqueado.','Vamos verificar as configurações e a licença.']},
    {id:'lock-account',name:'Conferir licença do jogo',lead:'O jogo precisa estar disponível na conta que possui a licença.',render:screenLockAccount,actions:[{label:'Confirme que a conta conectada possui o jogo ou o benefício ativo.',focus:box(320,355,960,137,15)}],todo:['Verifique se a conta proprietária está acessível.','Confirme o conteúdo no histórico da conta, quando possível.'],note:'Se o jogo depender de uma assinatura PlayStation Plus, confirme que ela ainda está ativa.'},
    {id:'lock-settings',name:'Abrir Configurações',lead:'No início do PS5, escolha o ícone da engrenagem.',render:screenHome,actions:[{label:'Selecione “Configurações” no topo do PS5.',focus:circle(1290,58,43)}],todo:['Entre em Configurações.']},
    {id:'lock-users',name:'Usuários e contas',lead:'Abra as configurações da conta.',render:screenSettings,actions:[{label:'Selecione “Usuários e contas”.',focus:box(225,355,1130,68,4)}],todo:['Escolha “Usuários e contas”.']},
    {id:'lock-others',name:'Selecionar Outros',lead:'O próximo menu fica na coluna esquerda.',render:screenOthers,actions:[{label:'Selecione “Outros”.',focus:box(132,565,367,76,3)}],todo:['Abra a opção “Outros”.']},
    {id:'lock-share-menu',name:'Verificar compartilhamento',lead:'Vamos confirmar como está o compartilhamento do console.',render:screenShareRow,actions:[{label:'Abra “Compartilhamento do console e jogo offline”.',focus:box(542,145,952,151,3)}],todo:['Abra o compartilhamento do console.']},
    {id:'lock-activation',name:'Verificar ativação',lead:'Escolha o estado que aparece no seu PS5.',render:()=>lockShareState==='ask'?screenLockChoice():screenSharing(lockShareState==='disabled'?'normal':lockShareState),actions:[],todo:[],note:'Só habilite o compartilhamento se tiver autorização do titular. Um PS5 por conta pode ter essa função ativa.',state:'lock'},
    {id:'lock-restore-menu',name:'Restaurar licenças',lead:'Volte ao menu “Outros” para restaurar licenças.',render:screenRestoreMenu,actions:[{label:'Em “Usuários e contas > Outros”, escolha “Restaurar licenças”.',focus:box(545,258,955,87,4)}],todo:['Acesse Configurações > Usuários e contas > Outros.','Selecione Restaurar licenças.']},
    {id:'lock-restore',name:'Confirmar restauração',lead:'Restaure a licença da conta que possui o jogo.',render:screenRestore,actions:[{label:'Selecione o jogo ou as licenças que deseja restaurar.',focus:box(340,351,920,180,10)},{label:'Depois, confirme “Restaurar”.',focus:box(560,645,480,68,34)}],todo:['Selecione os conteúdos solicitados no seu PS5.','Confirme a restauração.'],note:'Restauração não apaga jogos salvos. Algumas versões permitem restaurar diretamente no menu Opções do jogo.'},
    {id:'lock-restart',name:'Reiniciar o PS5',lead:'Reiniciar o console pode ajudar quando o acesso continua bloqueado.',render:screenLockRetry,actions:[{label:'Reinicie o PS5 em Energia > Reiniciar PS5 e tente abrir o jogo.',focus:box(150,302,290,325,8)}],todo:['Reinicie o console usando Energia > Reiniciar PS5.','Depois, verifique o jogo novamente.']},
    {id:'lock-finish',name:'Testar o jogo',lead:'Faça uma última verificação.',render:screenLockFinish,actions:[{label:'Volte ao jogo. Se o cadeado continuar, procure o suporte.',focus:box(555,464,490,110,12)}],todo:['Tente iniciar o jogo no perfil que tem acesso autorizado.','Se permanecer bloqueado, fale com o suporte e confira os links oficiais.'],note:'Restaurar licenças não cria uma licença inexistente ou recupera uma compra que deixou de estar disponível.'}
  ];
  const stepsFor = m => m==='lock'?lockSteps:m==='secondary'?secondarySteps:installationSteps;
  let steps = stepsFor(mode);
  current = Math.max(0,Math.min(steps.length-1,modePosition[mode]));
  const lockActions = () => lockShareState==='ask'
    ? [{label:'Escolha abaixo o que o PS5 está mostrando para você.',focus:box(255,396,1090,230,14)}]
    : lockShareState==='enabled'
      ? [{label:'Já está habilitado? Selecione “Não desativar” e siga para restaurar as licenças.',focus:box(540,659,520,68,34)}]
      : lockShareState==='conflict'
        ? [{label:'Apareceu aviso de outro PS5? Não substitua a ativação. Procure o suporte.',focus:box(255,681,540,68,34)}]
        : [{label:'Se o titular autorizou este PS5, selecione “Habilitar”.',focus:box(542,595,520,68,34)}];
  const shareActions=()=> shareState==='enabled' ? [{label:'Se já estiver habilitado, mantenha a configuração. Não desative.',focus:box(540,659,520,68,34)}] : shareState==='conflict' ? [{label:'Apareceu aviso sobre outro PS5? Não habilite antes de confirmar com o titular.',focus:box(255,681,540,68,34)}] : [{label:'Se autorizado pelo titular, selecione “Habilitar”.',focus:box(542,595,520,68,34)}];
  const shareTodos=()=>shareState==='enabled' ? ['O compartilhamento já está habilitado neste PS5.','Mantenha a configuração e avance.'] : shareState==='conflict' ? ['O PS5 informa que outra ativação poderá ser substituída.','Não prossiga sem autorização expressa do titular.','Procure o suporte antes de mudar a ativação.'] : ['O compartilhamento está desabilitado.','Confirme que o titular autorizou este console.','Selecione “Habilitar”, quando permitido.'];
  const secondaryActions=()=>secondaryShareState==='ask'
    ? [{label:'Escolha abaixo o que aparece em seu PS5.',focus:box(255,396,1090,230,14)}]
    : secondaryShareState==='enabled'
      ? [{label:'Já está habilitado? Não desative sem autorização do titular.',focus:box(540,657,520,68,34)}]
      : secondaryShareState==='conflict'
        ? [{label:'Outro PS5 habilitado? Não altere a ativação. Selecione “Não habilitar”.',focus:box(273,677,520,68,34)}]
        : [{label:'Nesta modalidade, mantenha desabilitado. Selecione “Não habilitar”.',focus:box(540,653,520,68,34)}];
  const currentActions=()=> steps[current].id==='ativacao' ? shareActions() : steps[current].id==='lock-activation' ? lockActions() : steps[current].id==='sec-ativacao'?secondaryActions():steps[current].actions;
  function svgFrame(body){
    return `<svg xmlns="http://www.w3.org/2000/svg" class="console-svg" viewBox="0 0 1600 900" aria-hidden="true"><defs><radialGradient id="psBG" cx=".08" cy=".07" r="1.25"><stop offset="0" stop-color="#625259"/><stop offset=".5" stop-color="#22202f"/><stop offset="1" stop-color="#0a0920"/></radialGradient><linearGradient id="blueHome" x2=".95" y2=".78"><stop stop-color="#04395a"/><stop offset=".52" stop-color="#006a9e"/><stop offset="1" stop-color="#032052"/></linearGradient><linearGradient id="libraryBG"><stop stop-color="#080612"/><stop offset=".7" stop-color="#090715"/><stop offset="1" stop-color="#1f1a34"/></linearGradient><linearGradient id="coverBG" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#114ca2"/><stop offset=".55" stop-color="#252d79"/><stop offset="1" stop-color="#0b1528"/></linearGradient><filter id="neonGlow" x="-90%" y="-90%" width="280%" height="280%"><feGaussianBlur stdDeviation="8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>${backdrop(['config-home','biblioteca-home','perfil-menu','logout','lock-settings'].includes(steps[current].id)?'home':['biblioteca','jogo','download','lock-intro','lock-restart'].includes(steps[current].id)?'library':'classic')}${body}<g id="guideOverlay" pointer-events="none"></g></svg>`;
  }
  function buildOverlay(){
    const layer = $('sceneRoot').querySelector('#guideOverlay');
    overlayParts = null;
    if(!layer) return;
    const entry = currentActions()[currentAction];
    if(!entry){layer.innerHTML='';return;}
    const f=entry.focus;
    const centerY=f.type==='circle'?f.y:f.y+f.h/2;
    const left=f.type==='circle'?f.x-f.r:f.x;
    const edgeX=Math.max(24,left-16), edgeY=centerY;
    const startX=Math.max(30,Math.min(1430,edgeX-290));
    const startY=Math.max(80,Math.min(830,centerY+167));
    const path=`M${startX} ${startY} C${startX+100} ${startY-96},${edgeX-105} ${edgeY-39},${edgeX} ${edgeY}`;
    const focus=f.type==='circle'
      ? `<circle class="target-pulse" cx="${f.x}" cy="${f.y}" r="${f.r+7}"/>`
      : `<rect class="target-pulse" x="${f.x-4}" y="${f.y-4}" width="${f.w+8}" height="${f.h+8}" rx="${f.rx+4}"/>`;
    // Trilha e ponta da seta controladas pelo MESMO progresso por quadro.
    layer.innerHTML=`${focus}<path class="flight-trail" d="${path}"/><g class="flying-tip"><path d="M-30 -17L0 0L-30 17"/></g>`;
    const trace=layer.querySelector('.flight-trail');
    const tip=layer.querySelector('.flying-tip');
    const target=layer.querySelector('.target-pulse');
    const length=trace.getTotalLength();
    trace.style.strokeDasharray=`${length} ${length}`;
    trace.style.strokeDashoffset=String(length);
    trace.style.opacity='0';
    overlayParts={trace,tip,target,length};
    drawAnimation(0);
  }
  function drawAnimation(time){
    if(!overlayParts) return;
    const {trace,tip,target,length}=overlayParts;
    const local=time % CYCLE_MS;
    const moving=local>=TRAVEL_BEGIN && local<TRAVEL_END;
    const arrived=local>=TRAVEL_END && local<HOLD_END;
    const tail=local>=HOLD_END;
    let progress=0;
    if(moving){
      const t=Math.max(0,Math.min(1,(local-TRAVEL_BEGIN)/(TRAVEL_END-TRAVEL_BEGIN)));
      progress=t*t*(3-2*t); // easing suave e idêntico para linha e seta
    }else if(arrived || tail) progress=1;
    const px=length*progress;
    trace.style.strokeDashoffset=String(length-px);
    const fade=tail?Math.max(0,1-(local-HOLD_END)/(CYCLE_MS-HOLD_END)):1;
    trace.style.opacity=local>=TRAVEL_BEGIN?String(fade):'0';
    tip.style.opacity=local>=TRAVEL_BEGIN?String(fade):'0';
    const pos=trace.getPointAtLength(Math.max(0.01,px));
    const prev=trace.getPointAtLength(Math.max(0,px-3));
    const next=trace.getPointAtLength(Math.min(length,px+3));
    const angle=Math.atan2(next.y-prev.y,next.x-prev.x)*180/Math.PI;
    tip.setAttribute('transform',`translate(${pos.x} ${pos.y}) rotate(${angle})`);
    target.classList.toggle('arrived',arrived || (tail && fade>.3));
    target.style.opacity=arrived?'1':tail?String(fade*.85):'.12';
    const rep=Math.min(LOOPS_PER_ACTION,Math.floor(time/CYCLE_MS)+1);
    $('repeatCount').textContent=`${rep}/${LOOPS_PER_ACTION}`;
  }
  function stopTicker(){if(rafId) cancelAnimationFrame(rafId);rafId=0;timelineStart=null;}
  function setPlaying(value){
    autoPlaying=Boolean(value);
    $('pauseAuto').textContent=autoPlaying?'❚❚ Pausar':'▶ Continuar';
    $('pauseAuto').setAttribute('aria-pressed',String(!autoPlaying));
    if(autoPlaying){
      if(['fim','sec-fim','lock-finish'].includes(steps[current].id)){
        autoPlaying=false;$('pauseAuto').textContent='✓ Concluído';return;
      }
      if((steps[current].id==='ativacao' && shareState==='conflict') || (steps[current].id==='lock-activation' && ['ask','conflict'].includes(lockShareState)) || (steps[current].id==='sec-ativacao' && secondaryShareState==='ask')){
        autoPlaying=false;$('pauseAuto').textContent='▶ Continuar';return;
      }
      stopTicker();rafId=requestAnimationFrame(tick);
    }else stopTicker();
  }
  function tick(now){
    rafId=0;
    if(!autoPlaying || document.hidden || !$('modal').classList.contains('hidden') || !$('zoomModal').classList.contains('hidden'))return;
    if(timelineStart===null) timelineStart=now-elapsedMs;
    elapsedMs=Math.max(0,now-timelineStart);
    const maxDuration=CYCLE_MS*LOOPS_PER_ACTION;
    if(elapsedMs>=maxDuration){
      drawAnimation(maxDuration-1);
      advanceAutomatically();
      return;
    }
    drawAnimation(elapsedMs);
    rafId=requestAnimationFrame(tick);
  }
  function advanceAutomatically(){
    if(!autoPlaying)return;
    const list=currentActions();
    if(currentAction<list.length-1){currentAction++;updateAction();return;}
    if((steps[current].id==='ativacao'&&shareState==='conflict') || (steps[current].id==='lock-activation'&&['ask','conflict'].includes(lockShareState)) || (steps[current].id==='sec-ativacao'&&secondaryShareState==='ask')){setPlaying(false);return;}
    if(current>=steps.length-1){setPlaying(false);return;}
    go(current+1);
  }
  function updateAction(){
    stopTicker();elapsedMs=0;timelineStart=null;
    const actions=currentActions(); if(currentAction>=actions.length)currentAction=0;
    const a=actions[currentAction];
    $('actionCount').textContent=actions.length>1?`Indicação ${currentAction+1} de ${actions.length}`:actions.length?'Siga a indicação':'Concluído';
    $('actionText').textContent=a?.label || 'Aproveite seu jogo!';
    $('prevAction').disabled=actions.length<2;$('nextAction').disabled=actions.length<2;
    $('actionDots').innerHTML=actions.map((_,i)=>`<i class="${i===currentAction?'active':''}"></i>`).join('');
    $('repeatCount').textContent=actions.length?'1/2':'';
    buildOverlay();
    if(actions.length>0 && autoPlaying)rafId=requestAnimationFrame(tick);
    if(actions.length===0){setPlaying(false);$('repeatCount').textContent='';}
  }
  function closeSidebar(){
    $('stepSidebar').classList.remove('open');
    $('stepsToggle').setAttribute('aria-expanded','false');
    $('sidebarShade').classList.add('hidden');
  }
  function render(){
    stopTicker();
    if(current<0)current=0;if(current>=steps.length)current=steps.length-1;
    const s=steps[current];
    $('sceneIndex').textContent=`${current+1}/${steps.length}`;
    $('switchGuide').textContent='⌂ Menu';
    document.querySelector('.header-caption').textContent=mode==='lock'?'Cadeado · PS5':mode==='secondary'?'Secundária · PS5':'Primária · PS5';
    $('lockMenu').classList.toggle('active',false);
    $('guide').setAttribute('data-guide-mode',mode);
    $('sceneTitle').textContent=s.name;
    $('sceneLead').textContent=s.lead;
    $('directions').innerHTML=(s.state?shareTodos():s.todo).map((t,i)=>`<div class="direction"><em>${i+1}</em><span>${h(t)}</span></div>`).join('');
    $('warning').textContent=s.note||'';
    $('extraOptions').innerHTML=s.state==='lock'
      ? '<label for="lockShareChoice">O que aparece na tela?</label><select id="lockShareChoice"><option value="ask">Selecione a situação...</option><option value="enabled">Já está habilitado</option><option value="disabled">Está desabilitado</option><option value="conflict">Ativado em outro PS5</option></select>'
      : s.state==='secondary'
        ? '<label for="secondaryShareChoice">O que aparece na tela?</label><select id="secondaryShareChoice"><option value="ask">Selecione a situação...</option><option value="disabled">Está desabilitado</option><option value="enabled">Já está habilitado</option><option value="conflict">Há outro PS5 habilitado</option></select>'
        : s.state?'<label for="shareChoice">O que aparece na tela?</label><select id="shareChoice"><option value="normal">Habilitar</option><option value="enabled">Já está habilitado</option><option value="conflict">Aviso de outro PS5</option></select>':'';
    if(s.state==='lock'){
      $('lockShareChoice').value=lockShareState;
      $('lockShareChoice').onchange=e=>{
        lockShareState=e.target.value; currentAction=0; autoPlaying=!['ask','conflict'].includes(lockShareState);
        render();
      };
    } else if(s.state==='secondary'){
      $('secondaryShareChoice').value=secondaryShareState;
      $('secondaryShareChoice').onchange=e=>{secondaryShareState=e.target.value;currentAction=0;autoPlaying=secondaryShareState!=='ask';render();};
    } else if(s.state){$('shareChoice').value=shareState;$('shareChoice').onchange=e=>{shareState=e.target.value;currentAction=0;if(shareState==='conflict')setPlaying(false);else setPlaying(true);render();};}
    $('sceneRoot').innerHTML=svgFrame(s.render());
    $('stepNavigation').innerHTML=steps.map((item,i)=>`<button type="button" class="${i===current?'active':''} ${done.has(mode+':'+item.id)?'done':''}" data-index="${i}" ${i===current?'aria-current="step"':''}><span class="number">${done.has(mode+':'+item.id)?'✓':String(i+1).padStart(2,'0')}</span>${h(item.name)}</button>`).join('');
    $('stepNavigation').querySelectorAll('button').forEach(el=>el.addEventListener('click',()=>{closeSidebar();go(Number(el.dataset.index));}));
    $('progressText').textContent=`Etapa ${current+1} de ${steps.length}`;
    $('progressPct').textContent=`${Math.round((current+1)/steps.length*100)}%`;
    $('progressFill').style.width=`${Math.round((current+1)/steps.length*100)}%`;
    $('backStep').disabled=current===0;
    $('nextStep').textContent=current===steps.length-1?'✓ Finalizar':'Próxima tela →';
    $('nextStep').disabled=(s.id==='ativacao'&&shareState==='conflict')||(s.id==='lock-activation'&&['ask','conflict'].includes(lockShareState))||(s.id==='sec-ativacao'&&secondaryShareState==='ask');
    $('nextStep').title=$('nextStep').disabled?'Escolha a situação ou procure o titular antes de prosseguir':'';
    save();updateAction();
    if((s.id==='lock-activation' && ['ask','conflict'].includes(lockShareState)) || (s.id==='sec-ativacao' && secondaryShareState==='ask')) setPlaying(false);
  }
  function save(){
    modePosition[mode] = current;modeAction[mode] = currentAction;
    try{localStorage.setItem(storageKey,JSON.stringify({mode,current,primaryCurrent:modePosition.primary,secondaryCurrent:modePosition.secondary,lockCurrent:modePosition.lock,lockShareState,secondaryShareState,done:[...done]}));}catch{}
  }
  function go(next){
    if(next<0||next>=steps.length)return;
    if(mode==='primary' && shareState==='conflict' && next>steps.findIndex(x=>x.id==='ativacao')){
      openModal('Confirme a ativação','<p>Esta conta já está habilitada em outro PS5. Procure a MCO GAMES antes de mudar a ativação.</p>');return;
    }
    if(mode==='lock' && ['ask','conflict'].includes(lockShareState) && next>steps.findIndex(x=>x.id==='lock-activation')){
      openModal('Confira o compartilhamento','<p>Na etapa de ativação, selecione a situação exibida no seu PS5. Se estiver ativo em outro console, não substitua a ativação sem autorização do titular.</p>');return;
    }
    if(mode==='secondary' && secondaryShareState==='ask' && next>steps.findIndex(x=>x.id==='sec-ativacao')){
      openModal('Confira o compartilhamento','<p>Escolha primeiro a situação que aparece no seu PS5. Não altere uma ativação existente sem autorização.</p>');return;
    }
    done.add(mode+':'+steps[current].id);current=next;currentAction=0;render();
  }
  function openModal(title,html){
    resumeAfterModal=autoPlaying;
    if(autoPlaying)setPlaying(false);
    $('modalTitle').textContent=title;$('modalContent').innerHTML=html;
    $('modal').classList.remove('hidden');$('modalClose').focus();
  }
  function closeModal(){
    $('modal').classList.add('hidden');
    if(resumeAfterModal && $('guide').classList.contains('hidden')===false){setPlaying(true);}
    resumeAfterModal=false;
  }
  function toggleZoom(value){
    if(value){
      resumeAfterZoom=autoPlaying;
      if(autoPlaying)setPlaying(false);
      // Clone do desenho atual: útil para verificar os detalhes sem perder a etapa.
      $('zoomContent').innerHTML=$('sceneRoot').innerHTML;
      $('zoomModal').classList.remove('hidden');$('zoomClose').focus();
    }else{
      $('zoomModal').classList.add('hidden');$('zoomContent').innerHTML='';
      if(resumeAfterZoom){setPlaying(true);}
      resumeAfterZoom=false;
    }
  }
  function showLanding(){
    stopTicker();autoPlaying=false;save();closeSidebar();
    $('guide').classList.add('hidden');$('welcome').classList.remove('hidden');
    document.querySelector('.header-caption').textContent='Instalação PS5';
  }
  function enterGuide(targetMode){
    if(!['primary','secondary','lock'].includes(targetMode))return;
    stopTicker();
    modePosition[mode]=current;modeAction[mode]=currentAction;
    mode=targetMode;steps=stepsFor(mode);
    current=Math.max(0,Math.min(steps.length-1,modePosition[mode]||0));
    currentAction=Math.max(0,modeAction[mode]||0);
    closeSidebar();
    $('welcome').classList.add('hidden');$('guide').classList.remove('hidden');
    autoPlaying=true;render();
  }
  $('lockMenu').onclick=showLanding;
  $('switchGuide').onclick=showLanding;
  $('choosePrimary').onclick=()=>enterGuide('primary');
  $('chooseSecondary').onclick=()=>enterGuide('secondary');
  $('chooseLock').onclick=()=>enterGuide('lock');
  $('menuInstall').onclick=()=>enterGuide('primary');
  $('menuSecondary').onclick=()=>enterGuide('secondary');
  $('menuCadeado').onclick=()=>enterGuide('lock');
  $('nextStep').onclick=()=>{
    if(current===steps.length-1){setPlaying(false);openModal('Tutorial concluído',`<p>Você chegou ao final ${mode==='lock'?'da verificação do cadeado':mode==='secondary'?'da instalação secundária':'da instalação primária'} de ${h(game)}. Se o cadeado continuar, consulte os passos oficiais ou fale com o suporte.</p>`);}
    else go(current+1);
  };
  $('backStep').onclick=()=>go(current-1);
  $('nextAction').onclick=()=>{const n=currentActions().length;if(n<2)return;currentAction=(currentAction+1)%n;updateAction();};
  $('prevAction').onclick=()=>{const n=currentActions().length;if(n<2)return;currentAction=(currentAction+n-1)%n;updateAction();};
  $('pauseAuto').onclick=()=>setPlaying(!autoPlaying);
  $('stepsToggle').onclick=()=>{
    const isOpen=!$('stepSidebar').classList.contains('open');
    $('stepSidebar').classList.toggle('open',isOpen);
    $('sidebarShade').classList.toggle('hidden',!isOpen);
    $('stepsToggle').setAttribute('aria-expanded',String(isOpen));
  };
  $('closeSteps').onclick=closeSidebar;$('sidebarShade').onclick=closeSidebar;
  $('restart').onclick=()=>openModal('Reiniciar tutorial?','<p>O roteiro atual voltará para a primeira etapa.</p><button id="confirmRestart" class="btn btn-secondary" type="button">Sim, reiniciar</button>');
  document.addEventListener('click',e=>{
    if(e.target?.id==='confirmRestart'){
      steps.forEach(s=>done.delete(mode+':'+s.id));
      if(mode==='primary')shareState='normal';
      if(mode==='secondary')secondaryShareState='ask';
      if(mode==='lock')lockShareState='ask';
      current=0;currentAction=0;modePosition[mode]=0;autoPlaying=false;
      stopTicker();save();resumeAfterModal=false;closeModal();closeSidebar();
      showLanding();
    }
  });
  $('helpTop').onclick=()=>openModal('Solução de problemas no PS5',`<p><strong>Jogo com cadeado:</strong> confirme se o conteúdo pertence à conta conectada, se o compartilhamento está habilitado neste PS5 e se há problemas de rede ou licença.</p><p><strong>Restaurar licenças:</strong> vá a Configurações → Usuários e contas → Outros → Restaurar licenças. A Sony informa que isso não apaga seus dados.</p><p><strong>Outro PS5 habilitado:</strong> não altere a ativação sem autorização do titular. O compartilhamento é permitido em apenas um PS5 por conta.</p><p><strong>Login/2FA:</strong> entre em contato com o suporte oficial da MCO GAMES. Digite credenciais e códigos apenas no PS5.</p><p><a href="https://www.playstation.com/pt-br/support/account/ps5-console-sharing-offline-play/" target="_blank" rel="noopener noreferrer">Ajuda oficial Sony — compartilhamento</a><br><a href="https://www.playstation.com/pt-br/support/games/restore-licences-playstation/" target="_blank" rel="noopener noreferrer">Ajuda oficial Sony — restaurar licenças</a><br><a href="https://www.playstation.com/pt-br/support/games/find-download-games-ps-store/" target="_blank" rel="noopener noreferrer">Ajuda oficial Sony — download de jogos</a></p>`);
  $('modalClose').onclick=closeModal;
  $('modalConfirm').onclick=closeModal;
  $('modal').onclick=e=>{if(e.target===$('modal'))closeModal();};
  $('zoom').onclick=()=>toggleZoom(true);
  $('zoomClose').onclick=()=>toggleZoom(false);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      if(!$('zoomModal').classList.contains('hidden'))toggleZoom(false);
      else if(!$('modal').classList.contains('hidden'))closeModal();
      else closeSidebar();
    }
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){resumeAfterHide=autoPlaying;if(autoPlaying)setPlaying(false);}
    else if(resumeAfterHide && $('modal').classList.contains('hidden')&&$('zoomModal').classList.contains('hidden')){resumeAfterHide=false;setPlaying(true);}
  });
  $('gameWelcome').textContent=game;
  $('gameSubtitle').textContent=game;
  // A tela inicial oferece sempre as três opções.
  if(hintedKind==='primaria')$('choosePrimary').classList.add('suggested');
  if(hintedKind==='secundaria')$('chooseSecondary').classList.add('suggested');
})();
