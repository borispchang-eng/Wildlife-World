'use strict';
// Small RFC 6455 text WebSocket implementation using Node's built-in modules.
// Supports masked browser frames, short and extended lengths, close and ping/pong.
const crypto=require('node:crypto');
const {EventEmitter}=require('node:events');
const GUID='258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
class WebSocket extends EventEmitter{
 static OPEN=1;
 constructor(socket,initial){super();this.socket=socket;this.readyState=1;this.buffer=Buffer.alloc(0);this.closed=false;socket.on('data',data=>this.feed(data));socket.on('error',e=>{this.emit('error',e);this.end();});socket.on('close',()=>this.end());socket.on('end',()=>this.end());if(initial?.length)this.feed(initial);}
 end(){if(this.closed)return;this.closed=true;this.readyState=3;this.emit('close');}
 frame(opcode,payload=Buffer.alloc(0)){if(this.readyState!==1)return;const n=payload.length;let head;if(n<126){head=Buffer.from([128|opcode,n]);}else if(n<65536){head=Buffer.alloc(4);head[0]=128|opcode;head[1]=126;head.writeUInt16BE(n,2);}else{head=Buffer.alloc(10);head[0]=128|opcode;head[1]=127;head.writeBigUInt64BE(BigInt(n),2);}this.socket.write(Buffer.concat([head,payload]));}
 send(str){this.frame(1,Buffer.from(String(str),'utf8'));}
 close(){if(this.readyState!==1)return;this.frame(8);this.socket.end();this.end();}
 feed(data){if(this.readyState!==1)return;this.buffer=Buffer.concat([this.buffer,data]);if(this.buffer.length>16384){this.close();return;}while(this.buffer.length>=2){const b=this.buffer,opcode=b[0]&15,fin=!!(b[0]&128),masked=!!(b[1]&128);let n=b[1]&127,offset=2;if(n===126){if(b.length<4)return;n=b.readUInt16BE(2);offset=4;}else if(n===127){if(b.length<10)return;const nBig=b.readBigUInt64BE(2);if(nBig>BigInt(4096)){this.close();return;}n=Number(nBig);offset=10;}if(!masked||!fin||n>4096){this.close();return;}if(b.length<offset+4+n)return;const mask=b.subarray(offset,offset+4);const payload=Buffer.from(b.subarray(offset+4,offset+4+n));this.buffer=b.subarray(offset+4+n);for(let i=0;i<payload.length;i++)payload[i]^=mask[i%4];if(opcode===1){this.emit('message',payload);}else if(opcode===8){this.close();return;}else if(opcode===9){this.frame(10,payload);}else if(opcode!==10){this.close();return;}}}
}
class WebSocketServer extends EventEmitter{
 constructor({server}){super();server.on('upgrade',(req,socket,head)=>{const key=req.headers['sec-websocket-key'];if(req.headers.upgrade?.toLowerCase()!=='websocket'||typeof key!=='string'||!/^[-A-Za-z0-9+/]{22}==$/.test(key)){socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');socket.destroy();return;}const accept=crypto.createHash('sha1').update(key+GUID).digest('base64');socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);const ws=new WebSocket(socket,head);this.emit('connection',ws);});}
}
module.exports={WebSocketServer,WebSocket};
