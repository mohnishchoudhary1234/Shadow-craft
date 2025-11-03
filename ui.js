export function updateHUD(player, world) {
  const hud = document.getElementById('hud');
  hud.innerHTML =
    `Position: <b>${player.pos.map(x => x.toFixed(1)).join(', ')}</b><br>` +
    `On Ground: <b>${player.onGround ? 'YES' : 'NO'}</b><br>` +
    `Yaw/Pitch: <b>${(player.yaw*57.2958).toFixed(1)}, ${(player.pitch*57.2958).toFixed(1)}</b>`;
}