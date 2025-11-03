import * as THREE from "https://cdn.skypack.dev/three@0.140.2";

export class VoxelWorld {
  constructor(w, h, d) {
    this.w = w; this.h = h; this.d = d;
    this.blocks = new Uint8Array(w*h*d).fill(0);
    this.generateTerrain();
    this.mesh = this.createMesh();
  }
  idx(x,y,z) { return x + this.w*(z + this.d*y); }
  get(x,y,z) {
    if(x<0||y<0||z<0||x>=this.w||y>=this.h||z>=this.d) return 0;
    return this.blocks[this.idx(x,y,z)];
  }
  set(x,y,z, val) {
    if(x<0||y<0||z<0||x>=this.w||y>=this.h||z>=this.d) return;
    this.blocks[this.idx(x,y,z)] = val;
  }
  generateTerrain() {
    for(let x=0; x<this.w; ++x)
      for(let z=0; z<this.d; ++z)
        for(let y=0; y<4+Math.floor(3*Math.sin(x*0.2)+3*Math.cos(z*0.23)); ++y)
          this.set(x,y,z, 1);
  }
  createMesh() {
    let g = new THREE.Geometry();
    let size=1.0, col=new THREE.Color();
    for(let x=0; x<this.w; ++x)
    for(let y=0; y<this.h; ++y)
    for(let z=0; z<this.d; ++z){
      let id = this.get(x,y,z);
      if(id) {
        let cube = new THREE.BoxGeometry(size, size, size);
        cube.translate(x+0.5, y+0.5, z+0.5);
        g.merge(cube);
      }
    }
    let m = new THREE.MeshLambertMaterial({ color: 0x6cbb47 });
    return new THREE.Mesh(g, m);
  }
  updateMesh() {
    let old = this.mesh;
    this.mesh = this.createMesh();
    if(old.parent) old.parent.add(this.mesh);
    if(old.parent) old.parent.remove(old);
  }
}