function ObjectMeteor(options) {
   this.pos = options.pos
   this.radius = options.radius || 50

   this.vertices = []
   var pointCount = 10 + Math.ceil(Math.random() * 15)
   var pointsAngle = Math.PI*2 / pointCount
   var start = Math.PI*2 * Math.random()

   for (var i = 0; i < pointCount; i++) {
      var radius = this.radius + (Math.random() * 6 - 3)
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
         relative: this.pos
      })
   }
}
