// SI units: metres, seconds, radians. Render coordinates use y pointing down.
export const WIDTH = 1, HEIGHT = 1.45, RADIUS = .022, STEP = 1 / 240;
export const LEFT = .035, RIGHT = .965, MIN_Y = .075, MAX_Y = 1.36;
export interface Hole { x: number; y: number; r: number; target?: number }
export const holes: Hole[] = [
  {x:.30,y:1.18,r:.048,target:1},{x:.73,y:1.02,r:.048,target:2},
  {x:.37,y:.85,r:.048,target:3},{x:.76,y:.68,r:.048,target:4},
  {x:.25,y:.51,r:.048,target:5},{x:.64,y:.34,r:.048,target:6},
  {x:.40,y:.16,r:.048,target:7},
  ...[
    [.14,1.29],[.57,1.25],[.86,1.22],[.48,1.10],[.13,1.06],
    [.89,.92],[.55,.94],[.19,.90],[.66,.81],[.12,.72],[.46,.70],
    [.88,.57],[.53,.54],[.12,.42],[.37,.38],[.81,.36],
    [.16,.21],[.57,.20],[.86,.16]
  ].map(([x,y])=>({x,y,r:.040}))
];
export type Phase = 'ready'|'playing'|'paused'|'falling'|'over'|'won';
export class Physics {
  phase: Phase = 'ready'; previous: 'playing'|'falling' = 'playing';
  left = MAX_Y; right = MAX_Y; lv = 0; rv = 0;
  s = 0; speed = 0; angle = 0; spin = 0; x = .5; y = MAX_Y-RADIUS;
  input: [number,number] = [0,0]; lives = 3; target = 1; score = 0; elapsed = 0;
  fallTime = 0; captured: Hole|null = null; event: 'hit'|'miss'|'bounce'|null = null;
  resetRail() {
    this.left = this.right = MAX_Y; this.lv = this.rv = 0;
    this.s = this.speed = this.spin = this.angle = 0;
    this.input = [0,0]; this.x=.5; this.y=MAX_Y-RADIUS; this.captured=null;
  }
  start() { this.resetRail(); this.lives=3; this.target=1; this.score=0; this.elapsed=0; this.phase='playing'; }
  pause() { if(this.phase==='playing'||this.phase==='falling') {this.previous=this.phase;this.phase='paused';} this.input=[0,0]; }
  resume() { if(this.phase==='paused') this.phase=this.previous; }
  step(dt=STEP) {
    this.event=null;
    if(this.phase==='falling') {
      this.fallTime+=dt;
      if(this.fallTime>.85) {
        if(this.captured?.target===this.target) {
          this.score+=this.target*100;this.target++;
          if(this.target>7) {this.phase='won';return;}
        } else {this.lives--; if(this.lives===0){this.phase='over';return;}}
        this.resetRail();this.phase='playing';
      }
      return;
    }
    if(this.phase!=='playing') return;
    this.elapsed+=dt;
    const oldLv=this.lv,oldRv=this.rv,oldAngle=this.angle;
    // Motor acceleration limit, with smooth deceleration when a thumb is released.
    const approach=(v:number,target:number)=> v+Math.max(-1.8*dt,Math.min(1.8*dt,target-v));
    this.lv=approach(this.lv,this.input[0]*.24); this.rv=approach(this.rv,this.input[1]*.24);
    const oldLeft=this.left,oldRight=this.right;
    this.left=Math.max(MIN_Y,Math.min(MAX_Y,this.left+this.lv*dt));
    this.right=Math.max(MIN_Y,Math.min(MAX_Y,this.right+this.rv*dt));
    // Mechanical stops limit the tilt to 20 degrees.
    const maxDiff=(RIGHT-LEFT)*Math.tan(Math.PI/9);
    if(this.right-this.left>maxDiff){this.left=oldLeft;this.right=oldRight;}
    if(this.left-this.right>maxDiff){this.left=oldLeft;this.right=oldRight;}
    this.lv=(this.left-oldLeft)/dt;this.rv=(this.right-oldRight)/dt;
    this.angle=Math.atan2(this.right-this.left,RIGHT-LEFT);
    const omega=(this.angle-oldAngle)/dt;
    const centerAcc=((this.lv-oldLv)+(this.rv-oldRv))/(2*dt);
    // Solid sphere I=2/5 mr² => rolling acceleration 5/7 g sin(theta).
    // Include translational acceleration of the driven rail and centrifugal force.
    const accel=(5/7)*((9.81-centerAcc)*Math.sin(this.angle)+this.s*omega*omega);
    this.speed+=(accel-this.speed*.32)*dt;
    this.s+=this.speed*dt;this.spin+=this.speed*dt/RADIUS;
    const half=Math.hypot(RIGHT-LEFT,this.right-this.left)/2-RADIUS;
    if(Math.abs(this.s)>half){this.s=Math.sign(this.s)*half;this.speed*=-.32;this.event='bounce';}
    this.x=.5+this.s*Math.cos(this.angle)+RADIUS*Math.sin(this.angle);
    this.y=(this.left+this.right)/2+this.s*Math.sin(this.angle)-RADIUS*Math.cos(this.angle);
    for(const h of holes) {
      // The entire sphere must fit through the opening, not just touch its rim.
      if(Math.hypot(this.x-h.x,this.y-h.y)<h.r-RADIUS*.8) {
        this.captured=h;this.phase='falling';this.fallTime=0;
        this.event=h.target===this.target?'hit':'miss';this.input=[0,0];break;
      }
    }
  }
}
