function ObjectPoint(options) {
   this.pos = options.pos
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

      var ship = engine.objects.find('ship')
      if (ship.pos.distance(this.pos) < 35) {
         this.pos = new Vector(
            engine.draw.width * Math.random(),
            engine.draw.height * Math.random()
         )
      }

      var meteors = engine.objects.all('meteor')
      for (var meteor of meteors) {
         var meteorPos = meteor.physics.pos
         var meteorRadius = meteor.physics.radius
         var distanceThisToMeteor = meteorPos.distance(this.pos)
         if (distanceThisToMeteor < meteorRadius) {
            this.pos.add(meteorPos.direction(this.pos).scale(distanceThisToMeteor))
         }
      }
   }
}
