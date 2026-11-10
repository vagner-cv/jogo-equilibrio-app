import { Physics, holes, RADIUS, LEFT, RIGHT, HEIGHT } from './physics';
export class Renderer {
  ctx: CanvasRenderingContext2D;
  constructor(public canvas: HTMLCanvasElement) {this.ctx=canvas.getContext('2d')!;}
  draw(p:Physics,time:number) {
    const c=this.ctx, w=400, h=HEIGHT*w;
    if(this.canvas.width!==800){this.canvas.width=800;this.canvas.height=h*2;}
    c.setTransform(2,0,0,2,0,0);c.clearRect(0,0,w,h);
    const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#a78b52');bg.addColorStop(.3,'#c4a66b');bg.addColorStop(.65,'#ad925c');bg.addColorStop(1,'#796c42');
    c.fillStyle=bg;c.fillRect(0,0,w,h);
    // Brushed brass texture, drawn deterministically without image dependencies.
    c.lineWidth=.45;
    for(let y=0;y<h;y+=2){c.strokeStyle=`rgba(${y%6?255:30},${y%6?235:30},${y%6?170:20},${.02+(y%7)*.006})`;c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
    const light=c.createRadialGradient(140,80,0,200,250,470);light.addColorStop(0,'#fff1b424');light.addColorStop(1,'#1c271b55');c.fillStyle=light;c.fillRect(0,0,w,h);
    c.strokeStyle='#f7dda333';c.strokeRect(7.5,7.5,w-15,h-15);c.strokeStyle='#3b3c2144';c.strokeRect(10.5,10.5,w-21,h-21);
    c.font='8px -apple-system,sans-serif';c.textAlign='center';c.letterSpacing='2px';c.fillStyle='#3f432a88';c.fillText('PRECISION MECHANISM  /  Nº 001',200,24);c.letterSpacing='0px';
    for(const h of holes) {
      const x=h.x*w,y=h.y*w,r=h.r*w,active=h.target===p.target,done=!!h.target&&h.target<p.target;
      if(active){c.save();c.shadowColor='#ffe9a0';c.shadowBlur=12+Math.sin(time*3)*4;c.strokeStyle='#ffe9a0';c.lineWidth=1.6;c.beginPath();c.arc(x,y,r+5,0,Math.PI*2);c.stroke();c.restore();}
      c.beginPath();c.arc(x,y+1,r+1,0,Math.PI*2);c.fillStyle='#ead39880';c.fill();
      const rim=c.createLinearGradient(x-r,y-r,x+r,y+r);rim.addColorStop(0,'#53513b');rim.addColorStop(.5,'#8a784e');rim.addColorStop(1,'#dfc48a');c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=rim;c.fill();
      const inside=c.createRadialGradient(x+2,y+4,1,x,y,r);inside.addColorStop(0,'#101d19');inside.addColorStop(.75,'#142019');inside.addColorStop(1,'#383b28');c.beginPath();c.arc(x,y,r-2,0,Math.PI*2);c.fillStyle=inside;c.fill();
      c.beginPath();c.arc(x,y-1,r-2,.95*Math.PI,1.95*Math.PI);c.strokeStyle='#161e1890';c.lineWidth=2;c.stroke();
      if(h.target){c.fillStyle=active?'#ffe4a3':done?'#8e9d72':'#a3966e';c.font=`${active?'600':'400'} 12px ui-monospace,monospace`;c.fillText(done?'✓':String(h.target).padStart(2,'0'),x,y+4);}
      if(active){c.fillStyle='#303e27';c.font='600 7px -apple-system,sans-serif';c.fillText('ALVO',x,y-r-11);}
    }
    // Rail channels at the edges.
    for(const x of [LEFT*w,RIGHT*w]){c.fillStyle='#29342470';c.fillRect(x-3,29,6,h-46);c.fillStyle='#edd9a238';c.fillRect(x+2,29,1,h-46);}
    const ly=p.left*w,ry=p.right*w;
    c.save();c.shadowColor='#151c1890';c.shadowBlur=7;c.shadowOffsetY=5;
    c.lineCap='round';c.strokeStyle='#454d3f';c.lineWidth=9;c.beginPath();c.moveTo(LEFT*w,ly);c.lineTo(RIGHT*w,ry);c.stroke();c.restore();
    // Local gradient follows the rotating bar.
    c.save();c.translate(200,(ly+ry)/2);c.rotate(p.angle);const len=Math.hypot((RIGHT-LEFT)*w,ry-ly);const rail=c.createLinearGradient(0,-4,0,4);rail.addColorStop(0,'#f5f4d9');rail.addColorStop(.35,'#cfd9c6');rail.addColorStop(.55,'#7f9181');rail.addColorStop(1,'#344f43');c.fillStyle=rail;c.beginPath();c.roundRect(-len/2,-3.5,len,7,3.5);c.fill();c.restore();
    for(const [x,y] of [[LEFT*w,ly],[RIGHT*w,ry]]){c.fillStyle='#485e4d';c.beginPath();c.roundRect(x-5,y-8,10,16,3);c.fill();c.fillStyle='#bfc5a6';c.beginPath();c.arc(x,y,2.5,0,Math.PI*2);c.fill();}
    // Sphere descends into the backboard, with scale and opacity indicating depth.
    const falling=p.phase==='falling'||(p.phase==='paused'&&p.previous==='falling');
    const f=falling?Math.min(1,p.fallTime/.5):0;
    const bx=(falling&&p.captured?p.x+(p.captured.x-p.x)*f:p.x)*w;
    const by=(falling&&p.captured?p.y+(p.captured.y-p.y)*f:p.y)*w;
    const br=RADIUS*w*(1-f*.95);
    c.save();c.globalAlpha=1-f;c.fillStyle='#202d2270';c.beginPath();c.ellipse(bx+2,by+7,br*1.1,br*.5,0,0,Math.PI*2);c.fill();
    const ball=c.createRadialGradient(bx-br*.35,by-br*.45,0,bx,by,br);ball.addColorStop(0,'#fffef5');ball.addColorStop(.18,'#e6eddb');ball.addColorStop(.4,'#a7b7a6');ball.addColorStop(.62,'#445b51');ball.addColorStop(.78,'#203e35');ball.addColorStop(.96,'#b5c6b1');ball.addColorStop(1,'#596f5d');c.fillStyle=ball;c.beginPath();c.arc(bx,by,br,0,Math.PI*2);c.fill();
    c.translate(bx,by);c.rotate(p.spin);c.strokeStyle='#f4f4da48';c.lineWidth=.6;c.beginPath();c.ellipse(0,0,br*.48,br*.85,.3,0,Math.PI*2);c.stroke();c.restore();
    for(const [x,y] of [[18,17],[w-18,17],[18,h-17],[w-18,h-17]]){c.fillStyle='#4c5134';c.beginPath();c.arc(x,y,2.5,0,Math.PI*2);c.fill();c.strokeStyle='#c4ba7c';c.lineWidth=.7;c.beginPath();c.moveTo(x-1.5,y+1);c.lineTo(x+1.5,y-1);c.stroke();}
  }
}
