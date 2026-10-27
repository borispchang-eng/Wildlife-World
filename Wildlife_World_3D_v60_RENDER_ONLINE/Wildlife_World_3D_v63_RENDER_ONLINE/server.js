'use strict';
// Wildlife World v59: one-site Node server + five-digit, 10-player private rooms.
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {WebSocketServer,WebSocket}=require('./tiny-websocket');
const PORT=Number(process.env.PORT||10000);
const LIMIT=10, WEB_ROOT=__dirname;
const rooms=new Map(),ranks={junior:[],senior:[]},sessions=new Map();
const safeName=x=>String(x||'Explorer').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,20)||'Explorer';
const bound=(x,a,b,def=0)=>Number.isFinite(Number(x))?Math.min(b,Math.max(a,Number(x))):def;
const newId=()=>Math.random().toString(36).slice(2,12);
const roomKey=(mode,code)=>mode+':'+code;
const safeCode=x=>/^\d{5}$/.test(String(x||''))?String(x):null;
function defaultMode(code){return code[0]==='2'?'senior':'junior';}
function getRoom(code){return rooms.get(roomKey(defaultMode(code),code));}
function listRooms(){const result=[{code:'10001',mode:'junior',count:0,max:LIMIT},{code:'20001',mode:'senior',count:0,max:LIMIT}];
 for(const r of rooms.values()){const known=result.find(x=>x.code===r.code);if(known)known.count=r.players.size;else result.push({code:r.code,mode:r.mode,count:r.players.size,max:LIMIT});}
 return result.sort((a,b)=>a.code.localeCompare(b.code));}
function respond(res,data,status=200){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'*'});res.end(JSON.stringify(data))}
function status(){return {online:true,name:'Wildlife World 3D Online Quest',version:63,build:'admin-in-menu-and-online-debug',maxPerRoom:LIMIT,rooms:listRooms(),time:new Date().toISOString()}}
const server=http.createServer((req,res)=>{
 const pathname=(req.url||'/').split('?')[0];
 if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type'});res.end();return}
 if(pathname==='/api/status'||pathname==='/health')return respond(res,status());
 if(pathname==='/api/rooms')return respond(res,{rooms:listRooms()});
 if(pathname==='/api/quest-rankings')return respond(res,{junior:ranks.junior.slice(0,20),senior:ranks.senior.slice(0,20)});
 if(pathname==='/api/leaderboard')return respond(res,{rows:[...ranks.junior,...ranks.senior].sort((a,b)=>b.score-a.score||a.elapsed-b.elapsed).slice(0,15)});
 if(req.method==='GET'&&(pathname==='/'||pathname==='/index.html'||pathname==='/PLAY_3D_OFFLINE.html')){
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
  return fs.createReadStream(path.join(WEB_ROOT,'index.html')).pipe(res);
 }
 if(req.method==='GET'&&['/ui-v57.css','/ui-v57.js','/ui-v59.css','/ui-v60.css','/ui-v60.js','/ui-v61.css','/ui-v61.js','/title-landscape.svg'].includes(pathname)){
  const filename=pathname.slice(1),ext=path.extname(filename);
  res.writeHead(200,{'Content-Type':ext==='.css'?'text/css; charset=utf-8':ext==='.svg'?'image/svg+xml':'application/javascript; charset=utf-8','Cache-Control':'public,max-age=300','X-Content-Type-Options':'nosniff'});
  return fs.createReadStream(path.join(WEB_ROOT,filename)).pipe(res);
 }
 if(req.method==='GET'&&pathname==='/server-config.js'){
  res.writeHead(200,{'Content-Type':'application/javascript; charset=utf-8','Cache-Control':'no-store'});
  return res.end('window.WILDLIFE_SERVER_URL=window.location.origin;');
 }
 return respond(res,{error:'Not found',hint:'Visit / or /api/status'},404);
});
const wss=new WebSocketServer({server});
function send(ws,msg){if(ws&&ws.readyState===WebSocket.OPEN)try{ws.send(JSON.stringify(msg))}catch(_){}}
function info(room){return [...room.players.values()].map(p=>({id:p.id,name:p.name,x:p.x,z:p.z,yaw:p.yaw,mounted:!!p.mounted}));}
function broadcast(room){if(!room)return;const players=info(room);for(const p of room.players.values())send(p.ws,{type:'quest_players',roomCode:room.code,count:players.length,players:players.filter(q=>q.id!==p.id)});}
function leave(p){if(!p.room)return;const room=p.room;room.players.delete(p.ws);p.room=null;if(room.players.size===0)rooms.delete(roomKey(room.mode,room.code));else broadcast(room);}
function onMessage(p,msg){if(!msg||typeof msg.type!=='string')return;
 switch(msg.type){
 case 'quest_join':{
  const code=safeCode(msg.roomCode);
  if(!code){send(p.ws,{type:'quest_error',message:'Enter a five-digit room code.'});return;}
  const mode=defaultMode(code),key=roomKey(mode,code);
  let room=rooms.get(key);
  if(room&&room.players.size>=LIMIT&&!room.players.has(p.ws)){send(p.ws,{type:'quest_error',message:'Room '+code+' is full (10/10). Try another code.'});return;}
  leave(p);
  if(!room){room={code,mode,players:new Map(),lastBroadcast:0};rooms.set(key,room);}
  p.room=room;p.name=safeName(msg.name);p.x=0;p.z=10;p.yaw=0;p.mounted=false;room.players.set(p.ws,p);
  send(p.ws,{type:'quest_welcome',mode,count:room.players.size,roomCode:code,yourId:p.id,players:info(room).filter(q=>q.id!==p.id)});
  broadcast(room);break;
 }
 case 'quest_position':{
  if(!p.room)return;
  p.x=bound(msg.x,-1100,1100,p.x);p.z=bound(msg.z,-550,550,p.z);p.yaw=bound(msg.yaw,-100,100,p.yaw);p.mounted=msg.mounted===true;
  const now=Date.now();if(now-p.room.lastBroadcast>260){p.room.lastBroadcast=now;broadcast(p.room);}break;
 }
 case 'quest_leaderboard':send(p.ws,{type:'quest_rankings',rows:p.room?ranks[p.room.mode].slice(0,15):[]});break;
 case 'quest_finish':{
  if(!p.room)return;const score=Math.floor(bound(msg.score,0,12)),rescued=Math.floor(bound(msg.rescued,0,12)),elapsed=Math.round(bound(msg.elapsed,1,3600)*10)/10;
  if(score<8||rescued<12){send(p.ws,{type:'quest_notice',message:'Rescue twelve animals (eight correct) to qualify.'});return;}
  const entry={name:p.name,roomCode:p.room.code,score,elapsed,at:new Date().toISOString()},list=ranks[p.room.mode];
  list.push(entry);list.sort((a,b)=>b.score-a.score||a.elapsed-b.elapsed);list.splice(50);
  send(p.ws,{type:'quest_rank_saved',rank:list.indexOf(entry)+1,rows:list.slice(0,15)});break;
 }
 default:break;
 }
}
wss.on('connection',ws=>{
 if(sessions.size>=200){send(ws,{type:'quest_error',message:'Server busy'});ws.close();return;}
 const p={ws,id:newId(),name:'Explorer',room:null,x:0,z:10,yaw:0,mounted:false};sessions.set(ws,p);
 ws.on('message',raw=>{try{if(raw.length>2048){ws.close();return;}onMessage(p,JSON.parse(raw.toString('utf8')))}catch(_){send(ws,{type:'quest_error',message:'Invalid message'});}});
 ws.on('close',()=>{leave(p);sessions.delete(ws)});
 ws.on('error',()=>{leave(p);sessions.delete(ws)});
});
server.listen(PORT,'0.0.0.0',()=>console.log('Wildlife World 3D v63 multiplayer live on port '+PORT));
