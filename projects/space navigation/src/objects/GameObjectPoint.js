function ObjectPoint(options) {
   this.pos = options.pos
   this.speed = new Vector(5, 8)
   this.timer = 120

   this.step = () => {
      engine.draw.settings({ strokeStyle: '#4a5'})

      engine.draw.circle({
         pos: this.pos,
         radius: 10,
         stroke: true
      })

      if (engine.mouse.held) {
         this.pos = engine.mouse.pos.clone()
      }

      if (this.pos.x < 0 || this.pos.x > engine.draw.width) {
         this.speed.x *= -1
      }
      if (this.pos.y < 0 || this.pos.y > engine.draw.height) {
         this.speed.y *= -1
      }
   }
}
