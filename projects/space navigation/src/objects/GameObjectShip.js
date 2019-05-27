function ObjectShip(options) {
   this.pos = options.pos
   this.speed = 5
   this.direction = Math.PI*2 * 0.75
   this.turnSpeed = 0.05

   this.radius = 25
   this.points = [
      new Vector(0, -this.radius),
      new Vector(-(this.radius*0.75), this.radius * 0.75),
      new Vector(this.radius*0.75, this.radius * 0.75),
   ]

   this.spin = (amount) => {
      for (var point of this.points) {
         var x = point.x
         var y = point.y
         // cs-sc
         point.x = Math.cos(amount) * x - Math.sin(amount) * y
         point.y = Math.sin(amount) * x + Math.cos(amount) * y
      }

      this.direction += amount
      if (this.direction > Math.PI*2) this.direction = this.direction - Math.PI*2
      if (this.direction < 0) this.direction = Math.PI*2 + this.direction
   }

   this.move = () => {
      var amount = new Vector(
         Math.cos(this.direction) * this.speed,
         Math.sin(this.direction) * this.speed
      )

      this.pos.add(amount)
   }

   this.turnTowards = (pos) => {
      var shapeDirection = this.pos.clone().min(pos).angle()
      var turn = engine.math.angleToAngle(this.direction, shapeDirection)

      // console.log(turn)
      if (Math.abs(turn) > this.turnSpeed) {
         this.spin(this.turnSpeed * Math.sign(turn))
      }
   }

   this.moveTowards = (pos) => {
      var distance = this.pos.distance(pos)
      // if (distance > 100) this.move()
   }

   this.step = () => {
      // turning
      var point = engine.objects.find('point')
      var meteor = engine.objects.find('meteor')

      var posClosest = meteor.pos.closestPointOnLine([ point.pos, this.pos ])
      var directionToAvoid = meteor.pos.direction(posClosest)

      var posAvoid = meteor.pos.clone().add(directionToAvoid.clone().scale(meteor.radius))
      var offset = (posClosest.distance(posAvoid) / meteor.radius)
      var directionToShip = posClosest.direction(this.pos)
      // console.log(directionToShip.dot(directionToAvoid))
      var nighty = Math.PI*2 * (directionToShip.dot(posAvoid) > 0 ? 0.25 : -0.25)
      var directionHit = new Vector(
         Math.cos(nighty * offset) * directionToAvoid.x - Math.sin(nighty * offset) * directionToAvoid.y,
         Math.sin(nighty * offset) * directionToAvoid.x + Math.cos(nighty * offset) * directionToAvoid.y
      )
      var posHit = directionHit.clone().scale(meteor.radius).add(meteor.pos)

      var shouldAvoid = posClosest.distance(meteor.pos) < meteor.radius

      engine.draw.settings({ lineWidth: 2 })
      engine.draw.line({ points: [ point.pos, this.pos ], set: { strokeStyle: '#999'} })
      engine.draw.line({ points: [ meteor.pos, this.pos ], set: { strokeStyle: '#999'} })
      engine.draw.circle({ pos: posClosest, radius: 5, set: { strokeStyle: '#f22'}  })
      engine.draw.circle({ pos: posAvoid, radius: 10, set: { strokeStyle: '#f22'}  })
      engine.draw.circle({ pos: posHit, radius: 10, set: { strokeStyle: '#f22'}  })


      this.turnTowards(point.pos)
      this.moveTowards(point.pos)

      engine.draw.settings({ strokeStyle: 'white', lineWidth: 5 })
      engine.draw.shape({
         relative: this.pos,
         points: this.points
      })
   }
}
