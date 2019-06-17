function ObjectPoint(options) {
   this.pos = options.pos.clone()
   this.timer = 120
   this.radius = 10

   this.physics = engine.physics.add({
      pos: this.pos,
      radius: this.radius,
      type: 'point',
      collideWith: [ 'meteor' ]
   })

   this.step = () => {
      engine.draw.settings({ strokeStyle: '#4a5'})

      engine.draw.circle({
         pos: this.physics.pos,
         radius: 10,
         stroke: true
      })

      if (engine.mouse.held) {
         this.physics.pos = engine.mouse.pos.clone()
      }

      if (this.physics.manifold.objectTypes.ship) {
         this.physics.pos = new Vector(
            engine.draw.width*0.1 + engine.draw.width*0.8 * Math.random(),
            engine.draw.height*0.1 + engine.draw.height*0.8 * Math.random()
         )
      }
   }
}
