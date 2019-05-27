function ObjectMeteor(options) {
   this.pos = options.pos
   this.radius = 50

   this.step = () => {
      engine.draw.settings({ strokeStyle: 'red', lineWidth: 5 })
      engine.draw.circle({ pos: this.pos, radius: this.radius })
   }
}
