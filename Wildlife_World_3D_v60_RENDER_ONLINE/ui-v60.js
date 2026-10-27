/* Wildlife World v60: restore all five real login modes on the cinematic page.
   Existing v59 auth/session handlers remain the single source of truth. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const choices={
   visitor:{en:['🌍 VISITOR','Play instantly. No account needed.'],zh:['🌍 遊客','立即遊玩，無需建立帳號。']},
   create:{en:['✨ CREATE ACCOUNT','Save an explorer on this device.'],zh:['✨ 建立帳號','在這部裝置儲存探險家資料。']},
   login:{en:['🔑 LOG IN','Continue with a saved explorer.'],zh:['🔑 登入帳號','使用已儲存的探險家帳號。']},
   admin:{en:['👑 ADMIN','Restricted game controls.'],zh:['👑 管理員','開啟受限制的遊戲設定。']},
   class:{en:['🏫 IN-CLASS GAME','Guest play; resets after each round.'],zh:['🏫 課堂遊戲','免登入；每回合結束後重置。']}
 };
 const words={
 en:{switchPlayer:'↩ Switch player',subtitle:'CHOOSE HOW TO PLAY',title:'Choose your adventure',note:'Accounts stay in this browser. Online rooms require a game server.',formCreate:'Create Explorer Account',formLogin:'Log In',formAdmin:'Administrator Access',name:'Explorer name',password:'Password',namePlaceholder:'Your explorer name',passPlaceholder:'Enter password',passCreate:'Choose a password',submitCreate:'CREATE ACCOUNT',submitLogin:'LOG IN',submitAdmin:'ENTER ADMIN',back:'← Back to choices',show:'SHOW',hide:'HIDE',hintCreate:'At least 8 characters. Saved only in this browser; not a shared online account.',hintLogin:'Use an account saved on this website and browser. Accounts do not automatically transfer between devices.',hintAdmin:'Administrator controls are local to the game. They are not secure server-side authentication.',saved:'Accounts saved in this browser',defaultError:'Unable to sign in'},
 zh:{switchPlayer:'↩ 更換玩家',subtitle:'選擇遊戲方式',title:'選擇你的冒險方式',note:'帳號只儲存在此瀏覽器。線上房間需要遊戲伺服器。',formCreate:'建立探險家帳號',formLogin:'登入帳號',formAdmin:'管理員登入',name:'探險家名稱',password:'密碼',namePlaceholder:'輸入探險家名稱',passPlaceholder:'輸入密碼',passCreate:'設定密碼',submitCreate:'建立帳號',submitLogin:'登入',submitAdmin:'進入管理員',back:'← 返回選項',show:'顯示',hide:'隱藏',hintCreate:'密碼至少 8 個字元。只儲存在此瀏覽器，不會同步到其他裝置。',hintLogin:'使用這個網站和瀏覽器已儲存的帳號，帳號不會自動轉移到其他裝置。',hintAdmin:'管理功能只在遊戲本機運作，並非伺服器級安全驗證。',saved:'已儲存在此瀏覽器的帳號',defaultError:'無法登入'}
 };
 const language=()=>document.documentElement.dataset.ww57Lang==='zh'?'zh':'en';
 const setText=(element,text)=>{if(element&&element.textContent!==text)element.textContent=text};
 const title=$('ww57-welcome')?.querySelector('.ww59-playPanel h2');
 const kicker=$('ww57-welcome')?.querySelector('.ww59-panelKicker');
 const note=$('ww57-welcome')?.querySelector('.ww59-panelNote');
 const switchButton=document.createElement('button');
 switchButton.type='button';switchButton.id='ww60-switchPlayer';switchButton.className='ww57-lang';
 const homeTop=$('ww57-homeLanguage');homeTop?.parentElement?.insertBefore(switchButton,homeTop);
 switchButton.addEventListener('click',()=>$('sessionLogout')?.click());
 let selected='';
 function formMode(){
  if($('authForm')?.hidden)return '';
  return selected;
 }
 function formatMessage(raw,lang){
  if(!raw.includes(' / '))return raw;
  const halves=raw.split(/\s+\/\s+/);
  if(halves.length<2)return raw;
  return lang==='zh'?halves.slice(1).join(' / '):halves[0];
 }
 function paint(){
  const lg=language(),v=words[lg];
  setText(kicker,v.subtitle);setText(title,v.title);setText(note,v.note);setText(switchButton,v.switchPlayer);
  for(const [id,pair] of Object.entries(choices)){
   const button=$('authChoices')?.querySelector(`[data-auth-choice="${id}"]`);
   if(!button)continue;
   setText(button.querySelector('strong'),pair[lg][0]);
   setText(button.querySelector('span'),pair[lg][1]);
   button.setAttribute('aria-label',pair[lg].join('. '));
  }
  const f=formMode();
  if(!f)return;
  setText($('authFormTitle'),f==='create'?v.formCreate:f==='admin'?v.formAdmin:v.formLogin);
  const nameLabel=document.querySelector('label[for="authName"]');
  const passwordLabel=document.querySelector('label[for="authPassword"]');
  setText(nameLabel,v.name);setText(passwordLabel,v.password);
  if($('authName'))$('authName').placeholder=v.namePlaceholder;
  if($('authPassword'))$('authPassword').placeholder=f==='create'?v.passCreate:v.passPlaceholder;
  setText($('authSubmit'),f==='create'?v.submitCreate:f==='admin'?v.submitAdmin:v.submitLogin);
  setText($('authBack'),v.back);
  setText($('authShowPassword'),$('authPassword').type==='text'?v.hide:v.show);
  setText($('authHint'),v['hint'+(f==='create'?'Create':f==='admin'?'Admin':'Login')]);
  setText($('savedExplorerBox')?.querySelector('.auth-account-hint'),v.saved);
 }
 document.addEventListener('click',event=>{
  const choice=event.target.closest?.('[data-auth-choice]');
  if(choice){selected=choice.dataset.authChoice;queueMicrotask(paint)}
  if(event.target.closest?.('#authBack')){selected='';queueMicrotask(paint)}
  if(event.target.closest?.('.ww57-lang,#authShowPassword'))queueMicrotask(paint);
 });
 // The original account handlers produce bilingual error strings. Only display selected language.
 const error=$('authMessage');
 if(error){let ignore=false;new MutationObserver(()=>{
  if(ignore)return;const current=error.textContent||'',formatted=formatMessage(current,language());
  if(current!==formatted){ignore=true;error.textContent=formatted;ignore=false}
 }).observe(error,{childList:true,characterData:true,subtree:true})}
 // Keep existing advanced toggle hidden: all five choices are available directly.
 const chooser=$('ww57-authChoices');chooser?.classList.remove('advanced');
 paint();
 window.__wildlifeV60UI=()=>({version:60,language:language(),fiveChoices:[...document.querySelectorAll('#ww57-authChoices [data-auth-choice]')].map(x=>x.dataset.authChoice),selected});
})();
