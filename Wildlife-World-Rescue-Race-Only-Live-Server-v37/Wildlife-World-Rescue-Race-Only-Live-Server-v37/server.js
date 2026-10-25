'use strict';
// Wildlife World v41 Earth Quests • two independent 10-player rooms.
// Self-contained Node.js: no npm dependencies; compatible with Render and localhost.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const PORT=Number(process.env.PORT||3000),ROOT=path.join(__dirname,'public');
const CAP=10,ROOMS={junior:{name:'Junior Quest',code:'JUNIOR',max:CAP},senior:{name:'Senior Quest',code:'SENIOR',max:CAP}};
const clients=new Set(),RANKS_PATH=path.join(__dirname,'quest-rankings.json');
let ranks={junior:[],senior:[]};try{const old=JSON.parse(fs.readFileSync(RANKS_PATH,'utf8'));for(const m of Object.keys(ROOMS))if(Array.isArray(old[m]))ranks[m]=old[m].slice(0,100)}catch(_){}
const connected=mode=>[...clients].filter(c=>c.joined&&c.mode===mode);
const player=p=>({id:p.id,name:p.name,x:p.x,z:p.z,yaw:p.yaw});
const safeName=v=>String(v||'Visitor').replace(/[<>\x00-\x1f]/g,'').trim().slice(0,18)||'Visitor';
function send(c,m){if(c.socket.destroyed)return;try{const bytes=Buffer.from(JSON.stringify(m));const length=bytes.length;let hdr;if(length<126)hdr=Buffer.from([129,length]);else if(length<65536)hdr=Buffer.from([129,126,length>>8,length&255]);else{hdr=Buffer.alloc(10);hdr[0]=129;hdr[1]=127;hdr.writeBigUInt64BE(BigInt(length),2)}c.socket.write(Buffer.concat([hdr,bytes]))}catch(_) {}}
function publish(mode,m){for(const c of connected(mode))send(c,m)}
function presence(mode){const room=connected(mode);for(const p of room)send(p,{type:'quest_players',mode,count:room.length,max:CAP,players:room.filter(x=>x!==p).map(player)})}
function leave(c){if(!clients.has(c))return;clients.delete(c);const mode=c.mode;c.joined=false;try{c.socket.destroy()}catch(_){}if(mode&&ROOMS[mode])presence(mode)}
function join(c,m){const mode=String(m.mode||'').toLowerCase();if(!ROOMS[mode]){send(c,{type:'quest_error',message:'Choose Junior Quest or Senior Quest / 請選擇初級或高級任務'});return}
 const room=connected(mode);if(room.length>=CAP){send(c,{type:'quest_error',message:'This room is full (10/10). Try again when someone leaves. / 房間已滿，請稍後再試。'});return}
 c.joined=true;c.mode=mode;c.name=safeName(m.name);c.x=0;c.z=10;c.yaw=0;c.lastPosition=0;c.lastFinish=0;
 send(c,{type:'quest_welcome',mode,roomCode:ROOMS[mode].code,room:ROOMS[mode].name,mapId:'earth',count:room.length+1,max:CAP,players:room.map(player)});
 presence(mode);
}
function finish(c,m){const now=Date.now();if(now-c.lastFinish<4000)return;
 const score=Number(m.score),rescued=Number(m.rescued),time=Number(m.elapsed);
 if(!Number.isInteger(score)||score<0||score>6||!Number.isInteger(rescued)||rescued<0||rescued>6||score>rescued||!Number.isFinite(time)||time<2||time>(c.mode==='junior'?92:62))return;
 c.lastFinish=now;const entry={name:c.name,score,rescued,elapsed:Math.round(time*100)/100,date:new Date().toISOString()};
 ranks[c.mode].push(entry);ranks[c.mode].sort((a,b)=>b.score-a.score||a.elapsed-b.elapsed);ranks[c.mode]=ranks[c.mode].slice(0,100);
 try{fs.writeFileSync(RANKS_PATH,JSON.stringify(ranks,null,2))}catch(e){console.warn('Rankings are not persistent on this host:',e.message)}
 const rows=ranks[c.mode].slice(0,20),rank=ranks[c.mode].findIndex(r=>r===entry)+1;
 send(c,{type:'quest_rank_saved',mode:c.mode,rank,rows});publish(c.mode,{type:'quest_rankings',mode:c.mode,rows});
}
function onMessage(c,m){if(!m||typeof m!=='object')return;
 if(m.type==='quest_join'&&!c.joined){join(c,m);return}
 if(!c.joined)return;
 if(m.type==='leave'){leave(c);return}
 if(m.type==='quest_position'){
  const now=Date.now();if(now-c.lastPosition<90)return;c.lastPosition=now;
  for(const k of ['x','z','yaw'])if(Number.isFinite(Number(m[k])))c[k]=Math.max(k==='yaw'?-6.3:-67,Math.min(k==='yaw'?6.3:67,Number(m[k])));
  presence(c.mode);
 }else if(m.type==='quest_finish')finish(c,m);
 else if(m.type==='quest_leaderboard')send(c,{type:'quest_rankings',mode:c.mode,rows:ranks[c.mode].slice(0,20)});
}
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.ico':'image/x-icon','.json':'application/json; charset=utf-8'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/status'||url.pathname==='/api/quest-rankings'){
  const body=url.pathname==='/api/status'?{online:true,mode:'planet-earth-quests',maxPerRoom:CAP,rooms:Object.keys(ROOMS).map(mode=>({name:ROOMS[mode].name,mode,count:connected(mode).length,max:CAP})),worlds:2}:{junior:ranks.junior.slice(0,20),senior:ranks.senior.slice(0,20)};
  res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Cache-Control':'no-store'});res.end(JSON.stringify(body));return;
 }
 let requestPath;try{requestPath=decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname)}catch(_){res.writeHead(400);res.end();return}
 const file=path.resolve(ROOT,'.'+requestPath);if(!file.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data)})
});
server.on('upgrade',(req,socket,head)=>{
 if(new URL(req.url,'http://localhost').pathname!=='/ws'){socket.destroy();return}
 const key=req.headers['sec-websocket-key'];if(!key||typeof key!=='string'){socket.destroy();return}
 const hashed=crypto.createHash('sha1').update(key+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
 socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+hashed+'\r\n\r\n');
 const c={id:crypto.randomBytes(5).toString('hex'),socket,joined:false,mode:null,name:'Visitor',buffer:Buffer.alloc(0)};clients.add(c);
 socket.on('data',chunk=>{
  c.buffer=Buffer.concat([c.buffer,chunk]);if(c.buffer.length>128*1024){leave(c);return}
  while(c.buffer.length>=2){const b=c.buffer,opcode=b[0]&15,masked=!!(b[1]&128);let n=2,len=b[1]&127;
   if(len===126){if(b.length<4)return;len=b.readUInt16BE(2);n=4}
   else if(len===127){if(b.length<10)return;const l=b.readBigUInt64BE(2);if(l>65536n){leave(c);return}len=Number(l);n=10}
   if(!masked){leave(c);return}if(b.length<n+4+len)return;
   const mask=b.subarray(n,n+4);n+=4;const payload=Buffer.from(b.subarray(n,n+len));for(let i=0;i<len;i++)payload[i]^=mask[i%4];c.buffer=b.subarray(n+len);
   if(opcode===8){leave(c);return}if(opcode===9){socket.write(Buffer.from([0x8a,payload.length,...payload]));continue}if(opcode!==1)continue;
   let msg;try{msg=JSON.parse(payload.toString('utf8'))}catch(_){continue}onMessage(c,msg)
  }
 });
 socket.setTimeout(180000);for(const event of ['timeout','close','error','end'])socket.on(event,()=>leave(c));if(head.length)socket.emit('data',head);
});
server.listen(PORT,'0.0.0.0',()=>console.log(`Wildlife World Earth Quest server listening on port ${PORT}; Junior=10, Senior=10`));
