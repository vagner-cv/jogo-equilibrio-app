import './style.css';
import {Physics,STEP} from './physics';
import {Renderer} from './render';
const icons={pause:'<path d="M8 5v14M16 5v14"/>',sound:'<path d="M11 4 5 9H2v6h3l6 5zM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/>',mute:'<path d="M11 4 5 9H2v6h3l6 5zM16 9l6 6m0-6-6 6"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4 2c-1 .5-1.5 1-1.5 2M12 16h.01"/>'};
const svg=(s:string)=>`<svg viewBox="0 0 24 24" aria-hidden="true">${s}</svg>`;
document.querySelector('#app')!.innerHTML=`
<header class="topbar"><div class="brand"><span class="brand-mark">≋</span> EQUILÍBRIO</div><div class="top-note"><span class="status-dot"></span> UM ARCADE DE PRECISÃO</div></header>
<main class="layout">
<section class="intro"><div class="eyebrow">O desafio é encontrar</div><h1>O ponto<br>de <em>equilíbrio.</em></h1><p>Dois controles. Uma esfera.<br>Entre o movimento e a gravidade,<br>cada detalhe faz a diferença.</p><div class="rule"></div><div class="edition">INSPIRADO NOS ARCADES CLÁSSICOS</div></section>
<section class="game" aria-label="Jogo Equilíbrio">
<div class="game-top"><div class="game-name">EQUILÍBRIO<small>ARCADE DE PRECISÃO</small></div><div class="tools"><button id="sound" class="icon-button" aria-label="Ativar som" aria-pressed="false">${svg(icons.mute)}</button><button id="help" class="icon-button" aria-label="Como jogar">${svg(icons.help)}</button><button id="pause" class="icon-button" aria-label="Pausar jogo">${svg(icons.pause)}</button></div></div>
<div class="scoreboard"><div class="metric"><span class="metric-label">PONTUAÇÃO</span><strong id="score">00000</strong></div><div class="metric"><span class="metric-label">PRÓXIMO ALVO</span><strong id="target">01 <span style="font-size:11px;color:#85957c">/ 07</span></strong></div><div class="metric"><span class="metric-label">SUAS ESFERAS</span><strong class="lives" id="lives" aria-label="3 esferas restantes">● ● ●</strong></div></div>
<div class="board-wrap"><canvas class="board" id="board" width="800" height="1160" aria-label="Tabuleiro com sete alvos numerados. Use os dois controles abaixo para conduzir a esfera."></canvas><div class="overlay" id="overlay"><div class="dialog" id="dialog" role="dialog" aria-label="Equilíbrio — instruções e partida" aria-modal="true"></div></div><div class="toast" id="toast" role="status" aria-live="polite"></div></div>
<div class="target-strip"><strong id="hint">LEVE A ESFERA ATÉ O ALVO 01</strong><span>DEVAGAR É MAIS LONGE</span></div>
<div class="controls"><div class="control-group"><button class="joystick" id="left" aria-label="Controle esquerdo: arraste para cima ou para baixo"><span class="stick"></span></button><div class="control-label">ESQUERDA</div></div><div class="center-control">${svg('<path d="m5 9 7-4 7 4M5 15l7 4 7-4M12 5v14"/>')}ARRASTE PARA<br>CIMA OU PARA BAIXO</div><div class="control-group"><button class="joystick" id="right" aria-label="Controle direito: arraste para cima ou para baixo"><span class="stick"></span></button><div class="control-label">DIREITA</div></div></div><div class="mobile-best">RECORDE PESSOAL <span class="record">00000</span> · SEM LOGIN, SÓ EQUILÍBRIO</div>
</section>
<aside class="aside"><div class="eyebrow">Simples de começar</div><h2>Difícil de dominar.</h2><div class="step"><b>01</b><div><strong>Encontre o movimento</strong><p>Cada controle move uma ponta da barra. Suba os dois para elevar a esfera.</p></div></div><div class="step"><b>02</b><div><strong>Controle a inclinação</strong><p>Uma ponta mais alta faz a esfera rolar. Antecipe a inércia e vá com calma.</p></div></div><div class="step"><b>03</b><div><strong>Siga a luz</strong><p>Acerte o alvo iluminado, de 01 a 07. Os outros buracos custam uma esfera.</p></div></div><div class="best"><span>SEU RECORDE</span><strong class="record">00000</strong></div><p style="font-size:9px;color:#647b6a;line-height:1.9;margin-top:20px">NO COMPUTADOR<br>W / S · lado esquerdo &nbsp; ↑ / ↓ · lado direito<br>Espaço · pausar</p></aside>
</main><footer class="footer"><span>MENOS PRESSA. MAIS PRECISÃO.</span><span>FEITO PARA JOGAR COM AS DUAS MÃOS →</span></footer>`;
const $=<T extends HTMLElement=HTMLElement>(id:string)=>document.getElementById(id) as T;
const game=new Physics();const renderer=new Renderer($<HTMLCanvasElement>('board'));
let record=0;try{record=Number(localStorage.getItem('equilibrio.record'))||0;}catch{}
function saveRecord(){if(game.score>record){record=game.score;try{localStorage.setItem('equilibrio.record',String(record));}catch{}}document.querySelectorAll('.record').forEach(e=>e.textContent=String(record).padStart(5,'0'));}
saveRecord();
let muted=true, audio:AudioContext|undefined;
function enableAudio(){if(!muted){audio??=new AudioContext();void audio.resume().catch(()=>{});}}
function tone(success:boolean){if(muted||!audio)return;const ctx=audio;[0,1,2].forEach((n)=>{const osc=ctx.createOscillator(),gain=ctx.createGain(),t=ctx.currentTime+n*.09;osc.type='sine';osc.frequency.value=success?[523,659,784][n]:[180,140,100][n];gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.09,t+.01);gain.gain.exponentialRampToValueAtTime(.001,t+.22);osc.connect(gain).connect(ctx.destination);osc.start(t);osc.stop(t+.25);});}
$('sound').onclick=()=>{muted=!muted;$('sound').innerHTML=svg(muted?icons.mute:icons.sound);$('sound').setAttribute('aria-label',muted?'Ativar som':'Desativar som');$('sound').setAttribute('aria-pressed',String(!muted));enableAudio();};
function showDialog(kind:'ready'|'paused'|'help'|'over'|'won') {
  const helpOrigin=game.phase;
  const content={ready:['O equilíbrio<br>está nas suas mãos.','Conduza a esfera até o alvo iluminado.<br>Use os dois controles ao mesmo tempo.<br>Você tem três esferas para chegar ao topo.','COMEÇAR A JOGAR'],paused:['Respire.<br>Encontre seu centro.','A partida está pausada.<br>Continue de onde parou.','CONTINUAR'],help:['Dois dedos.<br>Um só equilíbrio.','Arraste cada joystick para cima ou para baixo para mover sua ponta da barra. Solte para parar.<br><br>Suba os dois juntos para elevar a esfera. Incline para rolar. Acerte apenas o alvo iluminado, na ordem de 01 a 07.','ENTENDI'],over:['Cada tentativa,<br>um novo equilíbrio.',`Você marcou ${game.score} pontos.<br>Mais uma chance de encontrar o caminho.`,'TENTAR NOVAMENTE'],won:['Você encontrou<br>o equilíbrio.',`Todos os sete alvos. ${game.score} pontos.<br>Precisão que merece uma nova partida.`,'JOGAR NOVAMENTE']}[kind];
  $('overlay').hidden=false;
  $('dialog').innerHTML=`<div class="seal">${kind==='won'?'✧':'≋'}</div><div class="eyebrow">${kind==='ready'?'UM PEQUENO DESAFIO À GRAVIDADE':kind==='over'?'FIM DE PARTIDA':kind==='won'?'PERCURSO COMPLETO':'EQUILÍBRIO'}</div><h2>${content[0]}</h2><p>${content[1]}</p><button class="primary" id="action">${content[2]} <span aria-hidden="true">→</span></button>${kind==='paused'?'<button class="secondary" id="restart">REINICIAR PARTIDA</button>':''}<small>${kind==='ready'?'SEM CADASTRO · SEM PRESSA · SÓ VOCÊ':'PRECISÃO É PRÁTICA'}</small>`;
  $('action').onclick=()=>{enableAudio();if(kind==='help'&&(helpOrigin==='ready'||helpOrigin==='over'||helpOrigin==='won')){showDialog(helpOrigin);return;}if(kind==='ready'||kind==='over'||kind==='won')game.start();else game.resume();$('overlay').hidden=true;clearControls();update();};
  if(kind==='paused')$('restart').onclick=()=>{game.start();$('overlay').hidden=true;clearControls();update();};
}
function pause(){if(game.phase==='playing'||game.phase==='falling'){game.pause();clearControls();showDialog('paused');}else if(game.phase==='paused'){game.resume();$('overlay').hidden=true;}}
$('pause').onclick=pause;
$('help').onclick=()=>{if(game.phase==='ready'||game.phase==='over'||game.phase==='won'){showDialog('help');return;}game.pause();clearControls();showDialog('help');};
const held=new Set<string>();const pointers=new Map<number,number>();
function clearControls(){held.clear();pointers.clear();game.input=[0,0];for(const id of ['left','right'])$(id).querySelector<HTMLElement>('.stick')!.style.transform='translateY(0)';}
for(const [i,id] of ['left','right'].entries()){
 const el=$(id),stick=el.querySelector<HTMLElement>('.stick')!;
 const move=(e:PointerEvent)=>{if(pointers.get(i)!==e.pointerId)return;const rect=el.getBoundingClientRect();const d=Math.max(-1,Math.min(1,(e.clientY-(rect.top+rect.height/2))/28));game.input[i]=Math.abs(d)<.12?0:d;stick.style.transform=`translateY(${d*22}px)`;};
 el.addEventListener('pointerdown',e=>{e.preventDefault();if(game.phase!=='playing'||pointers.has(i))return;pointers.set(i,e.pointerId);el.setPointerCapture(e.pointerId);move(e);});
 el.addEventListener('pointermove',move);
 const release=(e:PointerEvent)=>{if(pointers.get(i)!==e.pointerId)return;pointers.delete(i);game.input[i]=0;stick.style.transform='translateY(0)';};
 el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);el.addEventListener('lostpointercapture',release);
}
const keys=['KeyW','KeyS','ArrowUp','ArrowDown','Space'];
function keyboard(){if(game.phase!=='playing')return;game.input=[Number(held.has('KeyS'))-Number(held.has('KeyW')),Number(held.has('ArrowDown'))-Number(held.has('ArrowUp'))];for(const [i,id] of ['left','right'].entries())$(id).querySelector<HTMLElement>('.stick')!.style.transform=`translateY(${game.input[i]*22}px)`;}
window.addEventListener('keydown',e=>{if(!keys.includes(e.code)||e.target instanceof HTMLButtonElement&&e.code==='Space')return;e.preventDefault();if(e.code==='Space'){if(!e.repeat)pause();return;}held.add(e.code);keyboard();});
window.addEventListener('keyup',e=>{held.delete(e.code);if(keys.includes(e.code)&&e.code!=='Space')keyboard();});
window.addEventListener('blur',()=>{game.pause();clearControls();if(game.phase==='paused')showDialog('paused');});
document.addEventListener('visibilitychange',()=>{if(document.hidden){game.pause();clearControls();if(game.phase==='paused')showDialog('paused');}});
function update(){ $('score').textContent=String(game.score).padStart(5,'0');$('target').innerHTML=`${String(Math.min(7,game.target)).padStart(2,'0')} <span style="font-size:11px;color:#85957c">/ 07</span>`;$('lives').textContent=Array.from({length:3},(_,i)=>i<game.lives?'●':'○').join(' ');$('lives').setAttribute('aria-label',`${game.lives} esferas restantes`);$('hint').textContent=game.phase==='won'?'TODOS OS ALVOS CONCLUÍDOS':`LEVE A ESFERA ATÉ O ALVO ${String(game.target).padStart(2,'0')}`;saveRecord();}
let toastUntil=0;
function toast(message:string){$('toast').textContent=message;$('toast').classList.add('visible');toastUntil=performance.now()+1800;}
let prev=performance.now(),acc=0,lastPhase=game.phase;
function frame(now:number){acc+=Math.min((now-prev)/1000,.05);prev=now;
 while(acc>=STEP){game.step();acc-=STEP;if(game.event==='hit'||game.event==='miss'){const hit=game.event==='hit';clearControls();tone(hit);toast(hit?`ALVO ${String(game.target).padStart(2,'0')} · +${game.target*100} PONTOS`:'QUASE! RESPIRA E TENTA OUTRA VEZ.');}}
 if(game.phase!==lastPhase){update();if(game.phase==='over'||game.phase==='won'){clearControls();showDialog(game.phase);}lastPhase=game.phase;}
 if(now>toastUntil)$('toast').classList.remove('visible');renderer.draw(game,now/1000);requestAnimationFrame(frame);}
showDialog('ready');requestAnimationFrame(frame);
if('serviceWorker' in navigator&&import.meta.env.PROD)window.addEventListener('load',()=>{void navigator.serviceWorker.register('/sw.js').catch(()=>{});});
