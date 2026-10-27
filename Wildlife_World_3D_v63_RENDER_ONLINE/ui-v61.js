/* v61 Quest Hub — restore the requested classic two-room landing page.
 * Game renderer, online rooms, account system and original quest handlers remain intact. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const panel=$('questHomePanel');if(!panel)return;
// Remove Free Explore as a user-facing game mode. Practice or offline rescue quests remain available.
document.querySelectorAll('#home [data-mode="explore"]').forEach(n=>n.remove());
const oldExplore=$('ww57-explore');if(oldExplore)oldExplore.remove();
const top=document.createElement('div');top.className='v61-top';
top.innerHTML='<div class="v61-brand"><span class="v61-brandIcon">🌿</span><span>WILDLIFE WORLD <small>3D</small></span></div><div class="v61-topRight"><span class="v61-eyebrow" id="v61-eyebrow"></span><button id="v61-lang" type="button" aria-label="Switch language"></button></div>';
panel.insertBefore(top,panel.firstChild);
const copy={en:{eyebrow:'RESCUE ADVENTURE · 10 HABITATS',title:'Choose Your Quest',subtitle:'Choose a challenge, explore ten wild habitats and rescue animals with friends.',junior:'JUNIOR QUEST',senior:'SENIOR QUEST',jdetail:'ROOM J · Up to 10 explorers · 8 minutes',sdetail:'ROOM S · Up to 10 explorers · 6 minutes',heading:'🏆 RANKS · ⭐ LEVELS · ⚡ MISSIONS',ranks:'Online Rankings',ranksSub:'Junior & Senior',rescues:'rescue goals left',level:'Level',token:'tokens',goalSub:'Rescue & level up',bRanks:'🏆 RANKINGS',bProgress:'⭐ LEVELS & MISSIONS',bDaily:'🎁 Daily Gift',bCostumes:'👕 Costumes',bSwitch:'↪ Switch Player',switchLabel:'中文',habitats:['❄️ Snowy Coast','⛰️ Misty Highlands','🌿 Green Valley','🌌 Twilight Wetlands','🧊 Arctic Tundra','🏜️ Desert Oasis','🦁 Safari Grasslands','🌴 Jungle Falls','🌊 Coral Coast','🌄 Sunset Canyon']},zh:{eyebrow:'動物救援冒險 · 10 個生態區',title:'選擇你的任務',subtitle:'選擇任務難度，探索十種自然生態，與朋友一同救援動物。',junior:'初級任務',senior:'高級任務',jdetail:'初級房間 · 最多 10 人 · 8 分鐘',sdetail:'高級房間 · 最多 10 人 · 6 分鐘',heading:'🏆 排行榜 · ⭐ 等級 · ⚡ 任務',ranks:'線上排行榜',ranksSub:'初級及高級',rescues:'個救援目標待完成',level:'等級',token:'代幣',goalSub:'救援動物並提升等級',bRanks:'🏆 排行榜',bProgress:'⭐ 等級與任務',bDaily:'🎁 每日禮物',bCostumes:'👕 服裝',bSwitch:'↪ 更換玩家',switchLabel:'English',habitats:['❄️ 冰雪海岸','⛰️ 迷霧高地','🌿 翠綠山谷','🌌 暮光濕地','🧊 北極苔原','🏜️ 沙漠綠洲','🦁 野生草原','🌴 叢林瀑谷','🌊 珊瑚海岸','🌄 夕照峽谷']}};
const j=$('questJunior'),s=$('questSenior');
if(j)j.innerHTML='<span class="questIcon" aria-hidden="true">🌱 🐼</span><strong id="v61-juniorTitle"></strong><small id="v61-juniorDetail"></small>';
if(s)s.innerHTML='<span class="questIcon" aria-hidden="true">⚡ 🦁</span><strong id="v61-seniorTitle"></strong><small id="v61-seniorDetail"></small>';
const stats=$('earthHomeStats');
if(stats&&stats.children[0])stats.children[0].innerHTML='<span aria-hidden="true">🏆</span><strong id="v61-rankLabel"></strong><span id="v61-rankSub"></span>';
if(stats&&stats.children[2])stats.children[2].innerHTML='<span aria-hidden="true">⚡</span><strong id="earthHomeMission"></strong><span id="v61-goalSub"></span>';
const ids=['questRankHome','questProgress','questDaily','questCostumes','questMenuLogout'];
const set=(id,value)=>{const n=$(id);if(n&&n.textContent!==value)n.textContent=value};
const mode=()=>document.documentElement.dataset.ww57Lang==='zh'?'zh':'en';
function progress(){try{const p=JSON.parse(localStorage.getItem('wildlife_ranger_profile_v34')||'{}');return p&&typeof p==='object'?p:{}}catch(_){return {}}}
function paint(){const L=copy[mode()];
 set('v61-eyebrow',L.eyebrow);set('v61-lang',L.switchLabel);
 const h=panel.querySelector(':scope > h1');if(h&&h.textContent!==L.title)h.textContent=L.title;
 const sub=panel.querySelector(':scope > .questSubtitle');if(sub&&sub.textContent!==L.subtitle)sub.textContent=L.subtitle;
 set('v61-juniorTitle',L.junior);set('v61-seniorTitle',L.senior);set('v61-juniorDetail',L.jdetail);set('v61-seniorDetail',L.sdetail);
 const names=panel.querySelectorAll('.questWorldStrip span');names.forEach((n,i)=>{if(L.habitats[i]&&n.textContent!==L.habitats[i])n.textContent=L.habitats[i]});
 const header=panel.querySelector('.questBottomHeading');if(header&&header.textContent!==L.heading)header.textContent=L.heading;
 set('v61-rankLabel',L.ranks);set('v61-rankSub',L.ranksSub);set('v61-goalSub',L.goalSub);
 [['questRankHome','bRanks'],['questProgress','bProgress'],['questDaily','bDaily'],['questCostumes','bCostumes'],['questMenuLogout','bSwitch']].forEach(([id,key])=>set(id,L[key]));
 const p=progress(),xp=Math.max(0,Number(p.xp)||0),lv=Math.min(50,1+Math.floor(Math.sqrt(xp/100))),remaining=Math.max(0,3-Math.min(3,Number(p.missionRescues)||0));
 set('earthHomeLevel',L.level+' '+lv);set('earthHomeXP',xp+' XP · '+(Number(p.tokens)||0)+' '+L.token);
 set('earthHomeMission',remaining+' '+L.rescues);
}
$('v61-lang').onclick=()=>{$('ww57-homeLanguage')?.querySelector('.ww57-lang')?.click();paint()};
// Keep progress live after rescues and daily gifts, without touching WebGL animation loops.
let last='';setInterval(()=>{if(!$('home').hidden){const p=progress();const key=mode()+':'+p.xp+':'+p.tokens+':'+p.missionRescues;
 if(key!==last){last=key;paint()}}},500);
// Original v46 refreshes English progress labels regularly; normalize when those values change.
for(const id of ['earthHomeLevel','earthHomeXP','earthHomeMission']){const el=$(id);if(el){new MutationObserver(()=>{
 if(mode()!=='zh')return;
 const p=progress(),L=copy.zh,xp=Math.max(0,Number(p.xp)||0),lv=Math.min(50,1+Math.floor(Math.sqrt(xp/100))),left=Math.max(0,3-Math.min(3,Number(p.missionRescues)||0));
 const v=id==='earthHomeLevel'?L.level+' '+lv:id==='earthHomeXP'?xp+' XP · '+(Number(p.tokens)||0)+' '+L.token:left+' '+L.rescues;
 if(el.textContent!==v)el.textContent=v;
 }).observe(el,{childList:true,characterData:true,subtree:true})}}
new MutationObserver(paint).observe(document.documentElement,{attributes:true,attributeFilter:['data-ww57-lang']});
// The underlying five login modes and code-based Junior/Senior multiplayer flow are unchanged.
paint();
window.__wildlifeV61UI=()=>({version:63,lang:mode(),exploreVisible:!!document.querySelector('#home [data-mode="explore"]'),junior:!!$('questJunior'),senior:!!$('questSenior'),habitats:panel.querySelectorAll('.questWorldStrip span').length});
})();
