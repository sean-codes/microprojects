function ObjectMeteor(options) {
   this.vertices = []
   var pointCount = 10 + Math.ceil(Math.random() * 15)
   var pointsAngle = Math.PI*2 / pointCount
   var start = Math.PI*2 * Math.random()

   this.physics = engine.physics.add({
      type: 'metoer',
      pos: options.pos,
      radius: options.radius || 50,
      speed: new Vector(1, 1)
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

      console.log(this.physics.pos)
      engine.draw.shape({
         points: this.vertices,
         relative: this.physics.pos
      })
   }
}
