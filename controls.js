// Input handling (mouse/touch/buttons)

// State for the current input
let inputState = {
  fw: false, bk: false, lt: false, rt: false, run: false, jump: false,
  place: false, break: false
};

export function getInputState() { return inputState; }

export function setupControls(camera, player) {
  // Pointer-lock mouse-aim (desktop)
  document.body.addEventListener('click', ()=>{ document.body.requestPointerLock?.(); });
  document.addEventListener('pointerlockchange', ()=>{
    if(document.pointerLockElement){
      window.addEventListener('mousemove', onMouseMove);
    }else{
      window.removeEventListener('mousemove', onMouseMove);
    }
  });
  function onMouseMove(e){
    player.yaw   -= e.movementX*0.0025;
    player.pitch -= e.movementY*0.0025;
    player.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, player.pitch));
  }
  // Keyboard (WASD/Shift/Space)
  window.addEventListener('keydown',e=>{
    if(e.code==='KeyW') inputState.fw=true;
    if(e.code==='KeyS') inputState.bk=true;
    if(e.code==='KeyA') inputState.lt=true;
    if(e.code==='KeyD') inputState.rt=true;
    if(e.code==='ShiftLeft'||e.code==='ShiftRight') inputState.run=true;
    if(e.code==='Space') inputState.jump=true;
    if(e.code==='KeyE') inputState.place=true;
    if(e.code==='KeyQ') inputState.break=true;
  });
  window.addEventListener('keyup',e=>{
    if(e.code==='KeyW') inputState.fw=false;
    if(e.code==='KeyS') inputState.bk=false;
    if(e.code==='KeyA') inputState.lt=false;
    if(e.code==='KeyD') inputState.rt=false;
    if(e.code==='ShiftLeft'||e.code==='ShiftRight') inputState.run=false;
    if(e.code==='Space') inputState.jump=false;
    if(e.code==='KeyE') inputState.place=false;
    if(e.code==='KeyQ') inputState.break=false;
  });
  // Mobile buttons
  document.getElementById('btn-place').ontouchstart = e=>{ e.preventDefault(); inputState.place=true; };
  document.getElementById('btn-place').ontouchend   = e=>{ inputState.place=false; };
  document.getElementById('btn-break').ontouchstart = e=>{ e.preventDefault(); inputState.break=true; };
  document.getElementById('btn-break').ontouchend   = e=>{ inputState.break=false; };
  document.getElementById('btn-jump').ontouchstart  = e=>{ e.preventDefault(); inputState.jump=true; };
  document.getElementById('btn-jump').ontouchend    = e=>{ inputState.jump=false; };
  // TODO: Add virtual joystick for movement on mobile for even better controls!
}