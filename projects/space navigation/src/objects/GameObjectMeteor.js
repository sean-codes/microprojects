function ObjectMeteor(options) {
   this.vertices = []
   var pointCount = 10 + Math.ceil(Math.random() * 15)
   var pointsAngle = Math.PI*2 / pointCount
   var start = Math.PI*2 * Math.random()

   this.physics = engine.physics.add({
      type: 'meteor',
      pos: options.pos,
      radius: options.radius || 50,
      speed: new Vector(Math.random()*1-0.5, Math.random()*1-0.5),
      bounceWith: [ 'meteor' ],
      solid: true
   })

   for (var i = 0; i < pointCount; i++) {
      var radius = this.physics.radius + (Math.random() * 6 - 3)
      this.vertices.push({
         x: Math.cos(start + pointsAngle * i) * radius,
         y: Math.sin(start + pointsAngle * i) * radius
      })
   }

   this.step = () => {
      engine.draw.settings({
         strokeStyle: '#aaa',
         lineWidth: 5
      })

      engine.draw.shape({
         points: this.vertices,
         relative: this.physics.pos
      })

      // if (this.inPath) {
      //    engine.draw.circle({
      //       pos: this.physics.pos,
      //       radius: this.physics.radius,
      //       fill: true,
      //       set: { fillStyle: this.choice ? '#a11' : '#a8a' }
      //    })
      // }
      //
      // this.inPath = false
      // this.choice = false
   }
}
