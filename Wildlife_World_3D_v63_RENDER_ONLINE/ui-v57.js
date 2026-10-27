/* Wildlife World 3D v57 — Adventure Edition. Navigation + one-language UI.
   Keeps v56 renderer, rescue system, terrain, horses, backend and account handlers. */
(()=>{
'use strict';
const $=(id)=>document.getElementById(id);
const TXT={
 en:{welcomeSub:'THE WILD IS CALLING',welcomeIntro:'A whole planet to discover. Ride through wild forests, find amazing creatures and become a wildlife hero.',ready:'Your adventure begins here',guest:'▶ START PLAYING',account:'Sign in / Create account',back:'← Back',tip:'No account needed • Join friends anytime',homeSub:'Explore • Rescue • Discover',hero:'Your next adventure awaits.',heroDesc:'80 animal species, beautiful habitats, horses and missions. Choose how you want to play.',explore:'🌍 Explore World',exploreHead:'Free Exploration',exploreDesc:'Roam freely, rescue any animal and ride your horse. No timer.',questHead:'Rescue Quest',questDesc:'Save 12 animals and earn rewards. Choose your difficulty.',junior:'🌱 Junior',senior:'⚡ Senior',startQuest:'Start Quest',friendsHead:'Play with Friends',friendsDesc:'Enter the same 5-digit room code as your friends.',join:'Join Room',name:'Explorer Name',menu:'☰ Menu',map:'🗺️ Map & Travel',ranger:'⭐ Ranger Profile',wardrobe:'👕 Wardrobe',ranks:'🏆 Rankings',settings:'⚙️ Settings',leave:'🏠 Leave Adventure',sound:'🔊 Sound',language:'Language',adminMenu:'⚙️ Administrator',testOnline:'Test Online Connection',serverStatus:'Open server status',close:'Close',done:'Done',riding:'🐎 Ride',dismount:'🚶 Dismount',jump:'⬆ Jump',rescue:'🐾 Rescue',room:'Room',animals:'Rescued',time:'Time',hint:'Drag to look • Joystick to move',online:'Online',offline:'Offline',onlineSoon:'Online rooms require the game server to be live.',modeHelp:'Choose a room or enter your friend’s code.',offlinePlay:'Play Offline',joinTitle:'Join a room',friends:'Friends',roomCode:'5-digit room code',level:'Level',progress:'Progress',progressInfo:'Save animals to level up.',teleport:'Choose a habitat',teleportDesc:'Travel across the planet. Every area has different wildlife.',rescues:'rescuable animals',save:'Save',coins:'Coins',correct:'Correct!',wrong:'Try again',menuTitle:'Adventure Menu',accountLabel:'Explorer',saved:'Outfit saved',noRoom:'Enter five digits, e.g. 10001',goHome:'Return to main menu',helpControls:'Move with the left joystick or WASD. Swipe to look. Press E to rescue, H to ride and T for map.',tutorial:'How to play',statusChecking:'Connecting to room…',goodbye:'Continue exploring.',choose:'Choose an adventure',joinDefault:'Tap a room number to join instantly.',quit:'Exit',timeLeft:'Remaining',start:'Play',forest:'Habitat',player:'Player',ranksIntro:'Room rankings',languageChange:'Switch language',noSecret:'Discover animals in their natural homes.',homeStats:'🌿 10 habitats · 🐾 80 species · 🐎 Horse travel',badgeWorld:'OPEN-WORLD ADVENTURE',badgeSpecies:'ANIMAL SPECIES',badgeHabitats:'HABITATS',badgePlayers:'ONLINE FRIENDS',eyebrow:'DISCOVER • RESCUE • EXPLORE'},
 zh:{welcomeSub:'探索無限可能',welcomeIntro:'踏上壯麗的 3D 星球，騎馬穿越森林、尋找野生動物，成為守護自然的冒險家。',ready:'你的冒險由此開始',guest:'▶ 開始遊戲',account:'登入或建立帳號',back:'← 返回',tip:'毋須註冊 • 隨時與朋友一起冒險',homeSub:'探索 • 救援 • 發現',hero:'下一段冒險正等著你！',heroDesc:'80 種動物、自然生態、坐騎和救援任務。選擇你的玩法。',explore:'🌍 自由探索',exploreHead:'自由探索',exploreDesc:'自由走動、救援任何動物和騎馬，沒有倒數時間。',questHead:'動物救援任務',questDesc:'救援 12 隻動物，贏取獎勵。請先選擇難度。',junior:'🌱 初級',senior:'⚡ 高級',startQuest:'開始任務',friendsHead:'與朋友一起玩',friendsDesc:'輸入與朋友相同的五位數字房間號碼。',join:'加入房間',name:'探險家名字',menu:'☰ 選單',map:'🗺️ 地圖與傳送',ranger:'⭐ 探險家資料',wardrobe:'👕 服裝',ranks:'🏆 排行榜',settings:'⚙️ 設定',leave:'🏠 返回主頁',sound:'🔊 聲音',language:'語言',adminMenu:'⚙️ 管理員',testOnline:'測試網絡連線',serverStatus:'查看伺服器狀態',close:'關閉',done:'完成',riding:'🐎 騎馬',dismount:'🚶 下馬',jump:'⬆ 跳躍',rescue:'🐾 救援',room:'房間',animals:'已救援',time:'時間',hint:'滑動轉視角 • 搖桿移動',online:'在線',offline:'離線',onlineSoon:'網上房間需要已啟動的遊戲伺服器。',modeHelp:'選擇房間，或輸入朋友的房間號碼。',offlinePlay:'離線遊玩',joinTitle:'加入房間',friends:'朋友',roomCode:'五位數字房間號碼',level:'等級',progress:'進度',progressInfo:'救援動物可提升等級。',teleport:'選擇生態區',teleportDesc:'傳送到星球不同地點，每區都有不同的動物。',rescues:'隻可救援動物',save:'儲存',coins:'金幣',correct:'答對了！',wrong:'再試一次',menuTitle:'冒險選單',accountLabel:'探險家',saved:'服裝已儲存',noRoom:'請輸入五位數字，例如 10001',goHome:'返回主頁',helpControls:'左側搖桿或 WASD 移動；滑動轉視角；按 E 救援、H 騎馬、T 開地圖。',tutorial:'操作說明',statusChecking:'正在連接房間…',goodbye:'繼續探險吧！',choose:'選擇冒險',joinDefault:'點選房間號碼即可加入。',quit:'退出',timeLeft:'剩餘',start:'開始',forest:'生態區',player:'玩家',ranksIntro:'房間排行榜',languageChange:'切換語言',noSecret:'在自然棲息地尋找動物。',homeStats:'🌿 10 種生態區 · 🐾 80 種動物 · 🐎 騎馬旅行',badgeWorld:'開放世界大冒險',badgeSpecies:'動物種類',badgeHabitats:'自然棲地',badgePlayers:'與好友同玩',eyebrow:'探索 • 救援 • 冒險'}
};
const SPEC_ZH={'valley':'翠綠山谷','snow':'冰雪海岸','desert':'沙漠綠洲','twilight':'暮光濕地','safari':'野生草原','coast':'珊瑚海岸','jungle':'叢林瀑谷','highland':'迷霧高地','canyon':'夕照峽谷','tundra':'苔原'};
let lang='en',mode='junior',menuOpen=false,menuPause=false,lastNear='',oldStatus='';
try{lang=localStorage.getItem('wildlife_language_v57')==='zh'?'zh':'en'}catch(_){}
const t=(k)=>TXT[lang][k]||k;
const act=(id)=>{const b=$(id);if(b)b.click()};
const localize=()=>{
 document.documentElement.dataset.ww57Lang=lang;document.documentElement.lang=lang==='zh'?'zh-Hant':'en';
 document.querySelectorAll('[data-ww57-t]').forEach(el=>{const val=t(el.dataset.ww57T);if(el.textContent!==val)el.textContent=val});
 document.querySelectorAll('[data-ww57-ph]').forEach(el=>{el.placeholder=t(el.dataset.ww57Ph)});
 document.querySelectorAll('.ww57-lang').forEach(b=>{b.textContent=lang==='en'?'中文':'English';b.setAttribute('aria-label',t('languageChange'))});
 updateActionLabels();localizeTeleport();localizeQuestion();localizeOther();updateHUD();
};
function switchLang(){lang=lang==='en'?'zh':'en';try{localStorage.setItem('wildlife_language_v57',lang)}catch(_){}bridge()?.refreshLabels();localize();updateAuth()}
function languageButton(){const b=document.createElement('button');b.type='button';b.className='ww57-lang';b.onclick=switchLang;return b}
const welcome=$('authWelcome');
const wl=document.createElement('div');wl.id='ww57-welcome';wl.innerHTML=`<div class="ww59-shell">
 <header class="ww59-header"><div class="ww59-logo"><span class="ww59-leaf">✦</span><span>WILDLIFE <b>WORLD</b><small>3D ADVENTURE</small></span></div><div id="ww57-welcomeLanguage"></div></header>
 <div class="ww59-content"><section class="ww59-hero"><div class="ww59-kicker"><span class="ww59-spark">✦</span> <span data-ww57-t="badgeWorld"></span> <span class="ww59-spark">✦</span></div><h1>WILDLIFE<span>WORLD</span></h1><div class="ww59-tagline" data-ww57-t="eyebrow"></div><p data-ww57-t="welcomeIntro"></p><div class="ww59-stats"><div><strong>80<span>+</span></strong><small data-ww57-t="badgeSpecies"></small></div><i></i><div><strong>10</strong><small data-ww57-t="badgeHabitats"></small></div><i></i><div><strong>10<span> / ROOM</span></strong><small data-ww57-t="badgePlayers"></small></div></div></section>
 <section class="ww59-playPanel"><div class="ww59-panelStamp" aria-hidden="true">🐾</div><div class="ww59-panelKicker" data-ww57-t="welcomeSub"></div><h2 data-ww57-t="ready"></h2><div id="ww57-authChoices" class="ww57-choiceArea"></div><button id="ww57-toggleAdvanced" class="ww57-btn secondary" type="button" data-ww57-t="account"></button><div id="ww57-authForm"></div><p class="ww59-panelNote" data-ww57-t="tip"></p></section></div>
 <footer class="ww59-footer"><span class="ww59-footerMain">🌍 WILDLIFE WORLD</span><span>✦</span><span data-ww57-t="homeSub"></span><span class="ww59-footerEnd">DESKTOP · iPAD · PHONE</span></footer>
 </div>`;
welcome.insertBefore(wl,welcome.firstChild);
$('ww57-welcomeLanguage').appendChild(languageButton());
const authChoices=$('authChoices'),authForm=$('authForm');
$('ww57-authChoices').appendChild(authChoices);$('ww57-authForm').appendChild(authForm);
$('ww57-toggleAdvanced').onclick=()=>{authChoices.classList.toggle('advanced');$('ww57-toggleAdvanced').textContent=authChoices.classList.contains('advanced')?t('back'):t('account')};
const guest=authChoices.querySelector('[data-auth-choice="visitor"] strong');
const authName=authChoices.querySelector('[data-auth-choice="visitor"]');
function updateAuth(){if(guest)guest.textContent=t('guest');const formTitle=$('authFormTitle');if(formTitle&&formTitle.textContent.includes('Account'))formTitle.textContent=lang==='zh'?'探險家帳號':'Explorer Account'}
const oldSwitch=switchLang;document.querySelectorAll('.ww57-lang').forEach(b=>b.onclick=()=>{oldSwitch();updateAuth()});
const home=$('home');const hub=document.createElement('div');hub.id='ww57-home';
hub.innerHTML=`<div class="ww57-homeTop"><span class="ww57-homeLogo">🐾 WILDLIFE WORLD</span><div id="ww57-homeLanguage"></div></div><div class="ww57-homeHero"><div><span class="ww57-heroKicker" data-ww57-t="homeSub"></span><h1 data-ww57-t="hero"></h1><p data-ww57-t="heroDesc"></p></div><div class="ww57-heroEmoji" aria-hidden="true">🌎</div></div><div class="ww57-homeGrid"><article class="ww57-tile"><h2>🌳 <span data-ww57-t="exploreHead"></span></h2><p data-ww57-t="exploreDesc"></p><button id="ww57-explore" class="ww57-btn gold" data-ww57-t="explore"></button></article><article class="ww57-tile"><h2>🐾 <span data-ww57-t="questHead"></span></h2><p data-ww57-t="questDesc"></p><div class="ww57-mode"><button id="ww57-junior" aria-pressed="true" type="button" data-ww57-t="junior"></button><button id="ww57-senior" aria-pressed="false" type="button" data-ww57-t="senior"></button></div><button class="ww57-btn" id="ww57-startQuest" data-ww57-t="startQuest"></button></article><article class="ww57-tile"><h2>🌐 <span data-ww57-t="friendsHead"></span></h2><p data-ww57-t="friendsDesc"></p><div class="ww57-roomRow"><input id="ww57-homeCode" aria-label="Room code" inputmode="numeric" maxlength="5" autocomplete="off" value="10001" placeholder="10001"><button id="ww57-homeJoin" class="ww57-btn" data-ww57-t="join"></button></div></article><article class="ww57-tile"><h2>⭐ <span data-ww57-t="ranger"></span></h2><p data-ww57-t="progressInfo"></p><div class="ww57-shortcuts"><button id="ww57-homeProgress" data-ww57-t="ranger"></button><button id="ww57-homeClothes" data-ww57-t="wardrobe"></button><button id="ww57-homeRanks" data-ww57-t="ranks"></button></div></article></div><div class="ww57-homeStrip"><div class="ww57-status" data-ww57-t="homeStats"></div><button id="ww57-changeUser" class="ww57-btn secondary" data-ww57-t="accountLabel"></button></div>`;
home.insertBefore(hub,home.firstChild);$('ww57-homeLanguage').appendChild(languageButton());
function setMode(m){mode=m;for(const [id,val] of [['ww57-junior','junior'],['ww57-senior','senior']])$(id).setAttribute('aria-pressed',String(mode===val))}
$('ww57-junior').onclick=()=>setMode('junior');$('ww57-senior').onclick=()=>setMode('senior');
$('ww57-explore').onclick=()=>{const b=document.querySelector('#home [data-mode="explore"]');if(b)b.click()};
$('ww57-startQuest').onclick=()=>act(mode==='junior'?'questJunior':'questSenior');
$('ww57-homeCode').addEventListener('input',()=>{$('ww57-homeCode').value=$('ww57-homeCode').value.replace(/\D/g,'').slice(0,5)});
function homeJoin(){const code=$('ww57-homeCode').value.trim();if(!/^\d{5}$/.test(code)){alert(t('noRoom'));return};act(code[0]==='2'?'questSenior':'questJunior');$('v48CodeInput').value=code;act('v48JoinCode')}
$('ww57-homeJoin').onclick=homeJoin;$('ww57-homeCode').onkeydown=e=>{if(e.key==='Enter')homeJoin()};
$('ww57-homeProgress').onclick=()=>{act('progressOpenBtn');requestAnimationFrame(localizeOther)};$('ww57-homeClothes').onclick=()=>{act('costumeLaunchHome');requestAnimationFrame(localizeOther)};$('ww57-homeRanks').onclick=()=>act('questRankHome');$('ww57-changeUser').onclick=()=>act('sessionLogout');
// Single, clean room join panel: original controls remain in DOM and continue handling networking.
const join=$('questLobbyModal');const j=document.createElement('div');j.id='ww57-join';
j.innerHTML=`<div class="ww57-welcomeHead"><div class="ww57-mark">🌐 WILDLIFE WORLD · ONLINE</div><div id="ww57-joinLanguage"></div></div><h2 data-ww57-t="joinTitle"></h2><p class="ww57-muted" data-ww57-t="joinDefault"></p><div class="ww57-codeChoices"><button id="ww57-codeJunior"><strong>10001</strong><span data-ww57-t="junior"></span></button><button id="ww57-codeSenior"><strong>20001</strong><span data-ww57-t="senior"></span></button></div><label for="ww57-customCode" class="ww57-muted" data-ww57-t="roomCode"></label><div class="ww57-roomRow"><input id="ww57-customCode" inputmode="numeric" maxlength="5" pattern="[0-9]{5}" placeholder="10001" autocomplete="off"><button id="ww57-customJoin" class="ww57-btn" data-ww57-t="join"></button></div><div id="ww57-joinStatus" aria-live="polite"></div><div class="ww57-divider"></div><div class="ww57-roomRow"><button id="ww57-offline" class="ww57-btn gold" data-ww57-t="offlinePlay"></button><button id="ww57-joinBack" class="ww57-btn secondary" data-ww57-t="back"></button></div><p class="ww57-muted" data-ww57-t="onlineSoon"></p>`;
join.appendChild(j);$('ww57-joinLanguage').appendChild(languageButton());
const clickRoom=(code)=>{const b=join.querySelector('[data-join-code="'+code+'"]');if(b)b.click();else{$('v48CodeInput').value=code;act('v48JoinCode')}};
$('ww57-codeJunior').onclick=()=>clickRoom('10001');$('ww57-codeSenior').onclick=()=>clickRoom('20001');
$('ww57-customCode').addEventListener('input',e=>{e.target.value=e.target.value.replace(/\D/g,'').slice(0,5)});
$('ww57-customJoin').onclick=()=>{const code=$('ww57-customCode').value.trim();if(!/^\d{5}$/.test(code)){$('ww57-joinStatus').textContent=t('noRoom');return};$('v48CodeInput').value=code;act('v48JoinCode')};
$('ww57-customCode').onkeydown=e=>{if(e.key==='Enter')act('ww57-customJoin')};
$('ww57-joinBack').onclick=()=>act('questCancel');$('ww57-offline').onclick=()=>act('questOfflinePlay');

// v63: Visible server diagnostics, because a published homepage alone does not mean multiplayer is online.
const diag=document.createElement('section');diag.id='ww63-connection';
diag.innerHTML=`<div class="ww63-diagActions"><button id="ww63-testOnline" type="button" data-ww57-t="testOnline"></button><a id="ww63-serverStatus" href="#" target="_blank" rel="noopener noreferrer" data-ww57-t="serverStatus"></a></div><p id="ww63-diagResult" role="status" aria-live="polite"></p>`;
j.appendChild(diag);
function multiplayerOrigin(){
 const preferred=String(window.WILDLIFE_SERVER_URL||'').trim();
 const host=location.hostname.toLowerCase();
 const value=preferred||((host.endsWith('.onrender.com')||host==='localhost'||host==='127.0.0.1')?location.origin:host.endsWith('.netlify.app')?'https://wildlife-world.onrender.com':'');
 if(!value)throw Error('No server URL. Open the deployed website, not a local file.');
 const u=new URL(value,location.href);
 if(!/^https?:$/.test(u.protocol)&&!/^wss?:$/.test(u.protocol))throw Error('Invalid server URL.');
 if(u.protocol==='wss:')u.protocol='https:';
 if(u.protocol==='ws:')u.protocol='http:';
 if(location.protocol==='https:'&&u.protocol!=='https:')throw Error('Online requires HTTPS.');
 return u.origin;
}
function serverLink(){try{const url=multiplayerOrigin()+'/api/status';$('ww63-serverStatus').href=url;return url}catch(e){$('ww63-serverStatus').removeAttribute('href');return null}}
function diagMsg(en,zh){$('ww63-diagResult').textContent=lang==='zh'?zh:en}
$('ww63-testOnline').onclick=async()=>{
 const btn=$('ww63-testOnline');if(btn.disabled)return;
 btn.disabled=true;
 try{
  const origin=multiplayerOrigin();serverLink();
  diagMsg('⏳ Checking '+origin+' — free hosting may take up to 95 seconds to wake.','⏳ 正在檢查 '+origin+'，免費伺服器啟動可能需要 95 秒。');
  const ctl=new AbortController();const timer=setTimeout(()=>ctl.abort(),98000);
  let response;
  try{response=await fetch(origin+'/api/status',{cache:'no-store',signal:ctl.signal})}finally{clearTimeout(timer)}
  if(!response.ok)throw Error('HTTP '+response.status+' at /api/status. This may be an old deployment or a wrong Root Directory.');
  const data=await response.json();
  if(data.online!==true)throw Error('The server is responding but multiplayer is not ready.');
  if(Number(data.version)<63)throw Error('Server version '+(data.version||'?')+' is outdated. Deploy the v63 Render ZIP first.');
  diagMsg('🟢 API online (v'+data.version+'). Testing live multiplayer…','🟢 伺服器正常（v'+data.version+'），正在測試多人連線…');
  await new Promise((resolve,reject)=>{
   const url=origin.replace(/^http/,'ws')+'/ws';let ws;
   try{ws=new WebSocket(url)}catch(e){reject(e);return}
   let finished=false;const end=(error)=>{if(finished)return;finished=true;clearTimeout(timeout);try{ws.close()}catch(_){};error?reject(error):resolve()};
   const timeout=setTimeout(()=>end(new Error('WebSocket timed out. Check Render service logs.')),15000);
   ws.addEventListener('open',()=>end(null),{once:true});ws.addEventListener('error',()=>end(new Error('WebSocket blocked or unreachable. Make sure the game is on Render Web Service, not just Netlify.')),{once:true});
   ws.addEventListener('close',()=>{if(!finished)end(new Error('WebSocket closed during connection.'))},{once:true});
  });
  diagMsg('✅ Online server and WebSocket both work (v'+data.version+'). Tap a room code to join.','✅ 網絡伺服器及多人連線均正常（v'+data.version+'）。請點選房間號碼加入。');
 }catch(e){
  diagMsg('⚠️ '+e.message+'  Use the Server Status link for details.','⚠️ '+e.message+'  請按「查看伺服器狀態」取得更多資訊。');
 }finally{btn.disabled=false}
};
serverLink();

// Status updates only on server events, never per animation frame.
new MutationObserver(()=>{const raw=$('questLobbyMessage').textContent||'';if(raw===oldStatus)return;oldStatus=raw;const status=$('ww57-joinStatus');if(lang==='zh'){
 if(/offline|unavailable|not respond|server.*offline|Error/i.test(raw))status.textContent='⚠️ 伺服器暫時未能連接，請檢查 Render 是否已啟動。';
 else if(/joining|connecting|wait|waking|checking|ready/i.test(raw))status.textContent='⏳ 正在連線…';
 else status.textContent='點選房間，或輸入五位數字房間號碼。'
 }else status.textContent=raw.replace(/\s*\/\s*[^/]*[\u3400-\u9fff][^/]*$/u,'');
}).observe($('questLobbyMessage'),{childList:true,characterData:true,subtree:true});
// In-world UI: preserve existing renderer and move wired buttons to one dock.
const game=$('game');const top=document.createElement('div');top.id='ww57-top';
top.innerHTML=`<div class="ww57-hudStats"><span>🐾 <b id="ww57-rescueValue">0/12</b></span><span>⏱ <b id="ww57-timeValue">--</b></span></div><div class="ww57-topSpacer"></div><button class="ww57-quick" id="ww57-mapBtn" data-ww57-t="map"></button><button class="ww57-quick" id="ww57-menuBtn" data-ww57-t="menu"></button>`;
game.appendChild(top);
const dock=document.createElement('div');dock.id='ww57-actionDock';game.appendChild(dock);
for(const id of ['horseToggle','jump','rescue']){const el=$(id);if(el)dock.appendChild(el)}
const hint=document.createElement('div');hint.id='ww57-hint';hint.dataset.ww57T='hint';game.appendChild(hint);
const menu=document.createElement('div');menu.id='ww57-menu';menu.hidden=true;menu.innerHTML=`<div class="ww57-menuBox" role="dialog" aria-modal="true" aria-labelledby="ww57-menuTitle"><div class="ww57-menuHead"><h2 id="ww57-menuTitle" data-ww57-t="menuTitle"></h2><button class="ww57-close" id="ww57-closeMenu" aria-label="Close">×</button></div><div class="ww57-menuItems"><button id="ww57-menuMap"><span>🗺️</span><strong data-ww57-t="map"></strong></button><button id="ww57-menuProgress"><span>⭐</span><strong data-ww57-t="ranger"></strong></button><button id="ww57-menuCostumes"><span>👕</span><strong data-ww57-t="wardrobe"></strong></button><button id="ww57-menuRanks"><span>🏆</span><strong data-ww57-t="ranks"></strong></button><button id="ww57-menuAdmin" type="button"><span>⚙️</span><strong data-ww57-t="adminMenu"></strong></button></div><div class="ww57-menuFooter"><div id="ww57-menuLanguage"></div><button class="ww57-btn secondary" id="ww57-help" data-ww57-t="tutorial"></button><button class="ww57-btn secondary" id="ww57-leave" data-ww57-t="leave"></button></div><p id="ww57-helpText" class="ww57-muted" hidden data-ww57-t="helpControls"></p></div>`;
game.appendChild(menu);$('ww57-menuLanguage').appendChild(languageButton());
const bridge=()=>window.__wildlifeV57Bridge;
function openMenu(){menu.hidden=false;menuOpen=true;bridge()?.pause(true)}
function closeMenu(){menu.hidden=true;menuOpen=false;bridge()?.pause(false)}
$('ww57-menuBtn').onclick=openMenu;$('ww57-closeMenu').onclick=closeMenu;
menu.onclick=e=>{if(e.target===menu)closeMenu()};
function openExtra(id){closeMenu();act(id);requestAnimationFrame(localizeOther)}
$('ww57-menuMap').onclick=()=>openExtra('teleportLaunch');$('ww57-mapBtn').onclick=()=>act('teleportLaunch');
$('ww57-menuProgress').onclick=()=>openExtra('progressOpenBtn');$('ww57-menuCostumes').onclick=()=>openExtra('costumeLaunchGame');$('ww57-menuRanks').onclick=()=>openExtra('questRanksBtn');
// Only authenticated local administrators see this control. Reuse existing gated Admin handler.
$('ww57-menuAdmin').onclick=()=>{if(!document.body.classList.contains('role-admin'))return;openExtra('adminEverywhere')};
$('ww57-leave').onclick=()=>{closeMenu();act('exitGame')};
$('ww57-help').onclick=()=>{$('ww57-helpText').hidden=!$('ww57-helpText').hidden};
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&menuOpen){closeMenu();e.stopPropagation()}},{capture:true});
let previousHorse='';function updateActionLabels(){const horse=$('horseToggle');const mounted=!!bridge()?.state()?.mounted;
 if(horse){const h=mounted?'dismount':'riding';if(previousHorse!==h||horse.textContent!==t(h)){horse.textContent=t(h);previousHorse=h}}
 if($('jump').textContent!==t('jump'))$('jump').textContent=t('jump');
 const b=$('rescue');if(b){const label=t('rescue');const name=bridge()?.state()?.nearestEmoji||'';const next=label+(name?' '+name:'');if(b.textContent!==next)b.textContent=next}
}
function updateHUD(){const count=$('count')?.textContent||'0 / 12',timer=$('timer')?.textContent||'∞';$('ww57-rescueValue').textContent=count;$('ww57-timeValue').textContent=timer}
// Only watch changing counters and action labels; do not observe the giant WebGL DOM.
for(const id of ['count','timer']){const el=$(id);if(el)new MutationObserver(updateHUD).observe(el,{childList:true,characterData:true,subtree:true})}
// The game's core now writes localized button text directly, avoiding per-frame mutation observers.
// Dynamic question uses existing two-language data, but exposes only selected text.
function localizeQuestion(){const heading=$('questionAnimal');if(!heading)return;const raw=heading.textContent||'';
 if(raw.includes(' · ')){heading.dataset.ww57Both=raw}
 const full=heading.dataset.ww57Both||raw;const parts=full.split(' · ');
 if(parts.length>1){const text=lang==='en'?parts.slice(0,-1).join(' · '):parts[0].trim().split(/\s+/)[0]+' '+parts[parts.length-1];if(heading.textContent!==text)heading.textContent=text}
 const kick=$('questionKicker');if(kick)kick.textContent=lang==='en'?'🐾 RESCUE QUESTION':'🐾 動物救援問題';
}

const toastEl=$('toast');
if(toastEl){let lastToastFull='';new MutationObserver(()=>{
 const raw=toastEl.textContent||'';
 if(raw.includes(' / '))lastToastFull=raw;
 const full=lastToastFull||raw;
 if(!full.includes(' / '))return;
 const parts=full.split(' / ');
 let content=lang==='en'?parts[0]:parts.slice(1).join(' / ');
 if(content!==raw)toastEl.textContent=content;
}).observe(toastEl,{childList:true,characterData:true,subtree:true});}

const q=$('questionModal');new MutationObserver((ms)=>{if(ms.some(m=>m.target.id==='questionAnimal'||m.target.id==='options'))localizeQuestion()}).observe(q,{childList:true,subtree:true});
function localizeTeleport(){const modal=$('teleportModal');if(!modal)return;
 const title=modal.querySelector('h2'),desc=modal.querySelector('.teleporter-dialog>p'),close=$('teleportClose');
 if(title)title.textContent=lang==='en'?'🗺️ Choose a Habitat':'🗺️ 選擇生態區';if(desc)desc.textContent=t('teleportDesc');if(close)close.textContent=t('close');
 for(const b of modal.querySelectorAll('.tp-destination')){
  const names=b.querySelectorAll('small:not(.rescue-count)');if(names.length>1)names[1].style.display='none';
  const count=b.querySelector('.rescue-count');if(count){const number=(count.textContent.match(/\d+/)||['0'])[0];const s='🐾 '+number+(lang==='en'?' available':' 隻可救援');if(count.textContent!==s)count.textContent=s}
 }
 const modeLabel=$('teleportMode');if(modeLabel)modeLabel.textContent=lang==='en'?'🌍 Travel anywhere':'🌍 前往任何生態區';
}
const tp=$('teleportModal');if(tp)new MutationObserver((ms)=>{if(ms.some(m=>m.target.classList?.contains('rescue-count'))){localizeTeleport()}}).observe(tp,{childList:true,subtree:true});
function localizeOther(){const p=$('progressModal');if(p){const h=p.querySelector('h2'),small=p.querySelector('.dialog>small'),last=p.querySelector('.dialog>p:last-of-type');if(h)h.textContent=lang==='en'?'⭐ Ranger Progress':'⭐ 探險家進度';if(small)small.textContent=lang==='en'?'🐾 WILDLIFE RANGER':'🐾 動物守護者';if(last)last.textContent=lang==='en'?'Rescue animals to earn XP and unlock outfits.':'救援動物獲得經驗值，升級解鎖服裝。';const b=$('progressCloseBtn');if(b)b.textContent=t('close');const titles=p.querySelectorAll('h3');for(const n of titles)n.textContent=lang==='en'?'⚡ Short Missions':'⚡ 簡單任務';const summary=$('progressSummary');if(summary&&summary.textContent.includes(' / ')){const seg=summary.textContent.split(' / ');summary.textContent=lang==='en'?seg[0]:seg.slice(1).join(' / ')}}
 const cos=$('costumeModal');if(cos){const title=cos.querySelector('.dialog h2'),b=$('costumeSave'),reset=$('costumeReset');if(title)title.textContent=lang==='en'?'👕 Wardrobe':'👕 服裝';if(b)b.textContent=lang==='en'?'💾 Save Outfit':'💾 儲存服裝';if(reset)reset.textContent=lang==='en'?'Reset':'還原';
 const whint=cos.querySelector('.wardrobe-hint');if(whint)whint.textContent=lang==='en'?'Mix shirts, jackets, hats, shoes and accessories.':'自由配搭上衣、外套、帽子、鞋和飾物。';
 const preview=cos.querySelector('.wardrobe-preview-box>small');if(preview)preview.textContent=lang==='en'?'LIVE OUTFIT':'即時裝扮預覽';
 const presets={'explorer':['🧭 Explorer','🧭 探險家'],'safari':['🦁 Safari','🦁 草原'],'arctic':['❄️ Arctic','❄️ 冰雪'],'royal':['👑 Royal','👑 皇家'],'rainbow':['🌈 Rainbow','🌈 彩虹'],'random':['🎲 Random Outfit','🎲 隨機造型']};for(const [key,values] of Object.entries(presets)){const b=cos.querySelector('[data-outfit-preset="'+key+'"]');if(b)b.textContent=values[lang==='en'?0:1]}
 const description=cos.querySelector('#questShopBanner small');if(description)description.textContent=lang==='en'?'Choose clothes, shoes and accessories for your explorer.':'為探險家選擇衣服、鞋子和裝飾。'}
 const result=$('resultModal');if(result&&!result.hidden){const h=$('resultHeading');if(h)h.textContent=lang==='en'?'🏆 Rescue Complete!':'🏆 救援完成！';$('newAdventure').textContent=t('goHome');$('showRankings').textContent=t('ranks');for(const [i,key] of [['rRescued','animals'],['rTime','time'],['rCoins','coins']]){const lab=$(i)?.parentElement?.firstChild;if(lab?.nodeType===3)lab.textContent=t(key)+' '}}
 const rank=$('boardModal');if(rank){const h=rank.querySelector('h2');if(h)h.textContent=t('ranks');if($('closeBoard'))$('closeBoard').textContent=t('close')}
 const qr=$('questRanksModal');if(qr){const h=qr.querySelector('h2');if(h)h.textContent=t('ranks');const b=$('questRankClose');if(b)b.textContent=t('close')}
}
// A lightweight timer handles rare dynamic-state updates only; actual 3D renderer remains untouched.
setInterval(()=>{const gameVisible=game&&!game.hidden;if(gameVisible)updateHUD();if(tp&&!tp.hidden)localizeTeleport();if(q&&!q.hidden)localizeQuestion();},700);
// Fix original UI defaults and account labels (static content only).
localize();updateAuth();
window.__wildlifeV57UI=()=>({version:57,language:lang,mode,menuOpen,gameScreen:game.hidden?'home':'game',hasBridge:!!bridge(),rescueButton:!!$('rescue'),teleporter:!!$('teleportModal'),roomEntry:!!$('ww57-join')});
})();
