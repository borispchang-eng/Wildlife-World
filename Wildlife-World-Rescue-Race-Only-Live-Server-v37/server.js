'use strict';
// Wildlife World v27 demo server. No third-party runtime dependencies.
// WebSocket framing follows RFC6455 for ordinary unfragmented text/control messages.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const PORT = Number(process.env.PORT || 3000);
const ROOT = path.resolve(__dirname, 'public');
const RANK_PATH = process.env.RANK_PATH || path.join(__dirname, 'world-rankings.json');
const MAX_USERS = 10;
const MAPS = [
  ['valley','Green Valley'],['snow','Snowy Coast'],['desert','Desert Oasis'],
  ['twilight','Twilight Wetlands'],['safari','Safari Grasslands'],['coast','Coral Coast'],
  ['jungle','Jungle Falls'],['highland','Misty Highlands'],['canyon','Sunset Canyon']
];
// Public rooms are always available. Private rooms exist while occupied.
const PUBLIC_CODES={'10001':'WORLD-1','10002':'WORLD-2','10003':'WORLD-3','10004':'WORLD-4'};
const PUBLIC_CODES_REVERSE=Object.fromEntries(Object.entries(PUBLIC_CODES).map(([code,id])=>[id,code]));
const rooms=new Map();
for(let i=1;i<=4;i++)rooms.set('WORLD-'+i,{code:'WORLD-'+i,name:'World '+i,map:MAPS[(i-1)%MAPS.length],private:false});
const roomMembers=(room)=>room?[...clients].filter(c=>c.joined&&!c.race&&c.roomCode===room.code):[];
const getRoom=(code)=>rooms.get(code);
const pickPublicRoom=()=>[...rooms.values()].filter(r=>!r.private&&roomMembers(r).length<MAX_USERS).sort((a,b)=>roomMembers(a).length-roomMembers(b).length)[0];
const clients = new Set();

// Exactly two participants compete to rescue the most animals in 90 seconds.
// Server owns the countdown, score totals, and end-of-round decision.
const RACE_CODE='12345', RACE_DURATION_MS=Math.max(1000,Number(process.env.RACE_DURATION_MS)||90000), RACE_MAX_RESCUES=12;
const raceMembers=()=>[...clients].filter(c=>c.joined&&c.race&&c.roomCode===RACE_CODE);
let raceActive=false,raceStartAt=0,raceEndTimer=null,raceEnded=false;
let rescueRaceRanks=[];
const RACE_RANK_PATH=process.env.RACE_RANK_PATH||path.join(__dirname,'rescue-race-rankings.json');
try{const data=JSON.parse(fs.readFileSync(RACE_RANK_PATH,'utf8'));if(Array.isArray(data))rescueRaceRanks=data}catch(_){}
function raceLeaders(){return rescueRaceRanks.sort((a,b)=>b.wins-a.wins||b.animals-a.animals).slice(0,20)}
function storeRaceWinner(c,score){let r=rescueRaceRanks.find(x=>x.name===c.name);if(!r){r={name:c.name,wins:0,animals:0,played:0};rescueRaceRanks.push(r)}r.wins++;r.animals+=score;r.played++;try{fs.writeFileSync(RACE_RANK_PATH,JSON.stringify(raceLeaders(),null,2))}catch(_){}}
function raceSettle(reason='time',forcedWinnerSlot=null){
 if(raceEnded||!raceActive)return;
 raceEnded=true;raceActive=false;clearTimeout(raceEndTimer);raceEndTimer=null;
 const players=raceMembers();if(!players.length)return;
 const p1=players.find(c=>c.raceSlot===1),p2=players.find(c=>c.raceSlot===2);
 const s1=p1?.raceRescues?.size||0,s2=p2?.raceRescues?.size||0;
 const winnerSlot=forcedWinnerSlot||((s1===s2)?0:(s1>s2?1:2)),winner=winnerSlot===1?p1:winnerSlot===2?p2:null;
 if(winner&&p1&&p2)storeRaceWinner(winner,winner.raceRescues.size);
 const data={type:'race_result',winnerSlot,winnerName:winner?.name||'',scores:{one:s1,two:s2},reason,leaders:raceLeaders()};
 for(const c of players)send(c,data);
}
function raceLeave(c){
 if(!c.race)return;
 const others=raceMembers().filter(x=>x!==c);
 if(raceActive&&!raceEnded&&others.length===1){
   // If a player disconnects mid-round, finish early and announce the remaining explorer.
   raceSettle('opponent_left',others[0].raceSlot);
 }
 c.race=false;c.joined=false;c.roomCode=null;
 if(!others.length){raceActive=false;raceEnded=false;raceStartAt=0;clearTimeout(raceEndTimer);raceEndTimer=null;}
}
function raceJoin(c,msg){
 if(String(msg.roomCode||'').trim()!==RACE_CODE){send(c,{type:'error',message:'Race code is 12345 / 比賽房間是12345'});return}
 const players=raceMembers();
 if(raceEnded&&players.length){send(c,{type:'error',message:'The last race is ending. Wait for the racers to leave. / 上一場比賽正結束，請稍候'});return}
 if(players.length>=2){send(c,{type:'error',message:'Rescue room full (2/2) / 雙人救援房間已滿'});return}
 c.joined=true;c.race=true;c.roomCode=RACE_CODE;c.name=safeName(msg.name);
 c.raceSlot=players.some(p=>p.raceSlot===1)?2:1;c.raceRescues=new Set();c.x=c.raceSlot===1?-3:3;c.z=10;
 send(c,{type:'race_wait',count:players.length+1,max:2,slot:c.raceSlot,roomCode:RACE_CODE});
 if(players.length===1){
  raceActive=true;raceEnded=false;raceStartAt=Date.now()+3000;
  raceEndTimer=setTimeout(()=>raceSettle('time'),RACE_DURATION_MS+3000);
  const allPlayers=raceMembers();
  for(const p of allPlayers){const op=allPlayers.find(q=>q!==p);send(p,{type:'race_start',slot:p.raceSlot,countdownMs:3000,durationMs:RACE_DURATION_MS,endAt:raceStartAt+RACE_DURATION_MS,opponent:{name:op.name,x:op.x,z:op.z,score:0}})}
 }
}
function raceMessage(c,msg){
 if(msg.type==='race_position'){
  const now=Date.now();if(now-c.lastPosition<90)return;c.lastPosition=now;
  if(Number.isFinite(+msg.x)&&Number.isFinite(+msg.z)){c.x=Math.max(-67,Math.min(67,+msg.x));c.z=Math.max(-67,Math.min(67,+msg.z));}
  for(const p of raceMembers())if(p!==c)send(p,{type:'race_position',name:c.name,x:c.x,z:c.z,score:c.raceRescues.size});
 }else if(msg.type==='race_rescue'){
  const now=Date.now(),id=Number(msg.animalId);
  if(!raceActive||raceEnded||now<raceStartAt||now>=raceStartAt+RACE_DURATION_MS)return;
  if(!Number.isInteger(id)||id<0||id>=RACE_MAX_RESCUES||c.raceRescues.has(id))return;
  c.raceRescues.add(id);
  const players=raceMembers(),scores={one:players.find(q=>q.raceSlot===1)?.raceRescues.size||0,two:players.find(q=>q.raceSlot===2)?.raceRescues.size||0};
  for(const p of players)send(p,{type:'race_score',scores,name:c.name,animalId:id});
  if(players.length===2&&players.every(p=>p.raceRescues.size===RACE_MAX_RESCUES))raceSettle('all_rescued');
 }
}

let leaderboard = [];
try{leaderboard=JSON.parse(fs.readFileSync(RANK_PATH,'utf8'));if(!Array.isArray(leaderboard)) leaderboard=[]}catch(_){leaderboard=[]}
function safeName(x){return String(x||'Explorer').replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,18)||'Explorer'}
function saveRanks(){try{fs.writeFileSync(RANK_PATH,JSON.stringify(leaderboard.slice(0,100),null,2))}catch(err){console.warn('Rank write failed: '+err.message)}}
function getRows(){return leaderboard.filter(r=>Number.isFinite(r.elapsed)&&r.elapsed>0).sort((a,b)=>a.elapsed-b.elapsed||b.score-a.score).slice(0,50)}
function joined(){return [...clients].filter(c=>c.joined)}
function send(c,m){if(!c.socket.destroyed)try{const data=Buffer.from(JSON.stringify(m));const header=data.length<126?Buffer.from([129,data.length]):data.length<65536?Buffer.from([129,126,data.length>>8,data.length&255]):Buffer.from([129,127,0,0,0,0,(data.length/0x1000000)>>>0,(data.length>>16)&255,(data.length>>8)&255,data.length&255]);c.socket.write(Buffer.concat([header,data]))}catch(_){}}
function all(m,except=null){for(const c of joined())if(c!==except)send(c,m)}
function presence(){for(const c of joined()){if(c.race)continue;const players=roomMembers(getRoom(c.roomCode));send(c,{type:'players',players:players.filter(p=>p!==c).map(({id,name,x,z,yaw})=>({id,name,x,z,yaw})),count:players.length,max:MAX_USERS})}}
function forget(c){if(!clients.has(c))return;if(c.race)raceLeave(c);clients.delete(c);try{c.socket.destroy()}catch(_){}presence();for(const [code,r] of rooms)if(r.private&&roomMembers(r).length===0)rooms.delete(code)}
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webmanifest':'application/manifest+json','.ico':'image/x-icon','.json':'application/json; charset=utf-8'};
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost');
 if(u.pathname==='/api/status'||u.pathname==='/api/race-rankings'){
   const body=JSON.stringify(u.pathname==='/api/race-rankings'?{rows:raceLeaders()}:u.pathname==='/api/status'?{online:true,mode:'rescue-race-only',players:raceMembers().length,maxPerRoom:2,worlds:0,raceRoom:{code:RACE_CODE,count:raceMembers().length,max:2}}:u.pathname==='/api/rooms'?{rooms:[...rooms.values()].filter(r=>!r.private).map(r=>({code:PUBLIC_CODES_REVERSE[r.code]||r.code,name:r.name,count:roomMembers(r).length,max:MAX_USERS}))}:{rows:getRows()});
   res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Cache-Control':'no-store'});res.end(body);return;
 }
 let requested;
 try{requested=decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname)}catch(_){res.writeHead(400);res.end();return}
 const file=path.resolve(ROOT,'.'+requested);
 if(!file.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return}
 fs.readFile(file,(err,data)=>{
   if(err){res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');return}
   res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data)
 });
});
server.on('upgrade',(req,socket,head)=>{
 if(new URL(req.url,'http://localhost').pathname!=='/ws'){socket.destroy();return}
 const key=req.headers['sec-websocket-key'];
 if(!key||!/^[-_a-zA-Z0-9+/=]{20,30}$/.test(key)){socket.destroy();return}
 const hash=crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
 socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+hash+'\r\n\r\n');
 const c={id:crypto.randomBytes(5).toString('hex'),socket,joined:false,name:'Explorer',x:0,z:10,yaw:0,buffer:Buffer.alloc(0),started:Date.now(),lastPosition:0,lastFinish:0};clients.add(c);
 socket.on('data',chunk=>{
   c.buffer=Buffer.concat([c.buffer,chunk]);if(c.buffer.length>128*1024){forget(c);return}
   while(c.buffer.length>=2){
     const b=c.buffer,opcode=b[0]&15,masked=!!(b[1]&128);let len=b[1]&127,n=2;
     if(len===126){if(b.length<4)return;len=b.readUInt16BE(2);n=4}
     else if(len===127){if(b.length<10)return;const l=b.readBigUInt64BE(2);if(l>65536n){forget(c);return}len=Number(l);n=10}
     if(!masked){forget(c);return}if(b.length<n+4+len)return;
     const mask=b.subarray(n,n+4);n+=4;const payload=Buffer.from(b.subarray(n,n+len));for(let i=0;i<len;i++)payload[i]^=mask[i%4];c.buffer=b.subarray(n+len);
     if(opcode===8){forget(c);return}if(opcode===9){socket.write(Buffer.from([0x8a,payload.length,...payload]));continue}if(opcode!==1)continue;
     let msg;try{msg=JSON.parse(payload.toString('utf8'))}catch(_){continue}
     if(!msg||typeof msg!=='object')continue;
     if(msg.type==='race_join'&&!c.joined){raceJoin(c,msg);continue}
     if((msg.type==='join'||msg.type==='create')&&!c.joined){send(c,{type:'error',message:'World Servers and private rooms are no longer available. Join Rescue Race 12345 instead. / 目前只提供雙人救援房間12345。'});continue}
     if(false){
       let code=String(msg.roomCode||'').trim(),room;
       if(msg.type==='create'){
         if(!/^\d{4,8}$/.test(code)){send(c,{type:'error',message:'Use a 4–8 digit server code / 請使用 4–8 位數字'});continue}
         if(code===RACE_CODE||PUBLIC_CODES[code]||rooms.has(code)){send(c,{type:'error',message:'That code is already in use. Choose another / 號碼已被使用'});continue}
         room={code,name:'Private '+code,map:MAPS[Math.floor(Math.random()*MAPS.length)],private:true};rooms.set(code,room);
       }else{
         if(!code)room=pickPublicRoom();else room=getRoom(PUBLIC_CODES[code]||code);
         if(!room){send(c,{type:'error',message:'Room not found or all world servers full / 找不到房間或所有世界已滿'});continue}
       }
       if(roomMembers(room).length>=MAX_USERS){send(c,{type:'error',message:'Room full (10/10) / 伺服器已滿'});continue}
       c.joined=true;c.roomCode=room.code;c.name=safeName(msg.name);c.started=Date.now();
       send(c,{type:'welcome',id:c.id,room:room.name,roomCode:room.private?room.code:(PUBLIC_CODES_REVERSE[room.code]||''),mapId:room.map[0],mapName:room.map[1],count:roomMembers(room).length,max:MAX_USERS,players:roomMembers(room).filter(p=>p!==c).map(({id,name,x,z,yaw})=>({id,name,x,z,yaw})),rankings:getRows()});presence();continue;
     }
     if(!c.joined)continue;
     if(c.race){if(msg.type==='leave'){forget(c);return}raceMessage(c,msg);continue;}
     if(msg.type==='position'){
       const now=Date.now();if(now-c.lastPosition<70)continue;c.lastPosition=now;
       for(const k of ['x','z','yaw'])if(Number.isFinite(Number(msg[k])))c[k]=Math.max(k==='yaw'?-6.4:-67,Math.min(k==='yaw'?6.4:67,Number(msg[k])));
       presence();
     }else if(msg.type==='leaderboard'){send(c,{type:'rankings',rows:getRows()})}
     else if(msg.type==='finish'){
       const now=Date.now();if(now-c.lastFinish<1500)continue;
       const score=Number(msg.score),rescued=Number(msg.rescued),elapsed=Number(msg.elapsed);
       // This is a friendly school/demo leaderboard, not a cheat-resistant competitive service.
       if(!Number.isInteger(score)||score<4||score>6||rescued!==6||!Number.isFinite(elapsed)||elapsed<1||elapsed>36000)continue;
       c.lastFinish=now;
       const record={name:c.name,score,rescued:6,elapsed:Math.round(elapsed*100)/100,date:new Date().toISOString()};
       leaderboard.push(record);leaderboard=getRows().slice(0,100);saveRanks();
       const rows=getRows(),rank=1+rows.filter(r=>r.elapsed<record.elapsed).length;
       send(c,{type:'rankSaved',rank,rows});all({type:'rankings',rows});
     }else if(msg.type==='leave'){forget(c);return}
   }
 });
 socket.setTimeout(150000);
 socket.on('end',()=>forget(c));socket.on('timeout',()=>forget(c));
 socket.on('close',()=>forget(c));socket.on('error',()=>forget(c));if(head.length)socket.emit('data',head)
});
server.listen(PORT,'0.0.0.0',()=>console.log(`Wildlife World multiplayer server ready on http://localhost:${PORT} (capacity ${MAX_USERS})`));
