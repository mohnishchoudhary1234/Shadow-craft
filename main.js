import * as THREE from "https://cdn.skypack.dev/three@0.140.2";
import { VoxelWorld } from "./voxelWorld.js";
import { setupControls, getInputState } from "./controls.js";
import { updateHUD } from "./ui.js";

const worldWidth = 32, worldHeight = 16, worldDepth = 32;

// Set up THREE scene/camera/renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x88ccff);
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// Light
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(10, 30, 10);
scene.add(sun);

// Voxel World
const world = new VoxelWorld(worldWidth, worldHeight, worldDepth);
scene.add(world.mesh);

// Player
let player = {
  pos: [16, 8, 16],
  velocity: [0, 0, 0],
  yaw: 0, pitch: 0,
  speed: 5, jumpVel: 6, onGround: false
};

// Controls (incl. mobile buttons)
setupControls(camera, player);

// Handle resizing
window.addEventListener('resize', ()=>{
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}, false);

// Raycaster for block interaction
const raycaster = new THREE.Raycaster();

function getBlockTarget() {
  camera.updateMatrixWorld();
  raycaster.setFromCamera({x:0,y:0}, camera);
  let intersects = raycaster.intersectObject(world.mesh, false);
  if(intersects.length){
    // figure out the block coord and face, place/break accordingly
    let p = intersects[0].point, f = intersects[0].face.normal;
    let block = p.clone().addScaledVector(f, -0.5).floor();
    let target = p.clone().addScaledVector(f, 0.01).floor();
    return { block, target, face:f };
  }
  return null;
}

// Main game loop
let lastTime = performance.now();
function animate(t) {
  let dt = Math.min((t-lastTime)/1000, 0.05);
  lastTime = t;

  // Controls/state
  let inp = getInputState();
  let [x,z] = [Math.sin(player.yaw), Math.cos(player.yaw)];
  let move = [0,0], speed = inp.run ? player.speed*2 : player.speed;
  if(inp.fw) move[1] += 1;
  if(inp.bk) move[1] -= 1;
  if(inp.lt) move[0] -= 1;
  if(inp.rt) move[0] += 1;

  // Normalize
  let len = Math.hypot(move[0],move[1]);
  if(len>0) { move[0]/=len; move[1]/=len; }
  // Set horizontal velocity
  let vx = z*move[1] + x*move[0], vz = x*move[1] - z*move[0];
  player.velocity[0] = vx*speed; // X
  player.velocity[2] = vz*speed; // Z

  // Gravity/jump
  player.velocity[1] -= 12*dt;
  let below = [Math.floor(player.pos[0]), Math.floor(player.pos[1]-0.1), Math.floor(player.pos[2])];
  player.onGround = world.get(below[0],below[1],below[2]) !== 0;
  if(player.onGround) {
    player.velocity[1] = Math.max(player.velocity[1],0);
    if(inp.jump) player.velocity[1]=player.jumpVel;
  }
  // Move & block collision
  let newpos = [...player.pos];
  for(let axis=0;axis<3;++axis){
    newpos[axis] += player.velocity[axis]*dt;
    let x=Math.floor(newpos[0]), y=Math.floor(newpos[1]), z=Math.floor(newpos[2]);
    if(axis === 1 && player.velocity[axis]<0) y -= 1; // tighter Y check
    if(world.get(x,y,z)!==0){
      newpos[axis]=player.pos[axis];
      player.velocity[axis]=0;
    }
  }
  player.pos = newpos;

  // Camera follow & angle
  camera.position.set(...player.pos);
  let cy = Math.sin(player.pitch);
  let cz = Math.cos(player.pitch);
  camera.lookAt(
    player.pos[0]+Math.sin(player.yaw)*cz,
    player.pos[1]+cy,
    player.pos[2]+Math.cos(player.yaw)*cz
  );

  // Interact: Place/Break
  if(inp.place||inp.break){
    let tgt = getBlockTarget();
    if(tgt){
      if(inp.place) world.set(tgt.target.x, tgt.target.y, tgt.target.z, 1);
      if(inp.break) world.set(tgt.block.x, tgt.block.y, tgt.block.z, 0);
      world.updateMesh();
    }
  }

  // UI
  updateHUD(player, world);

  // Sun angle (day/night)
  sun.position.set(
    20*Math.sin(t/6000),
    30*Math.cos(t/6000)+15,
    20*Math.cos(t/6000)
  );

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate(performance.now());