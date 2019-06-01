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

      var ship = engine.objects.find('ship')
      if (
         ship.physics.pos.distance(this.pos) < 35 ||
         this.pos.x < 0 || this.pos.x > engine.draw.width ||
         this.pos.y < 0 || this.pos.y > engine.draw.height
      ) {
         this.pos = new Vector(
            engine.draw.width*0.1 + engine.draw.width*0.8 * Math.random(),
            engine.draw.height*0.1 + engine.draw.height*0.8 * Math.random()
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
