class ObjectBullet {
   constructor(options) {
      this.pos = options.pos
      this.vel = options.vel
   }

   step() {
      this.pos.add(this.vel)
   }
}
