function ObjectShip(options) {
   this.pos = options.pos
   this.speed = 5
   this.angle = Math.PI*2 * 0.75
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

      this.angle += amount
      if (this.angle > Math.PI*2) this.angle = this.angle - Math.PI*2
      if (this.angle < 0) this.angle = Math.PI*2 + this.angle
   }

   this.move = () => {
      var amount = new Vector(
         Math.cos(this.angle) * this.speed,
         Math.sin(this.angle) * this.speed
      )

      this.pos.add(amount)
   }

   this.turnTowards = (pos) => {
      var angleToPos = this.pos.clone().min(pos).angle()
      var turn = engine.math.angleToAngle(this.angle, angleToPos)

      // console.log(turn)
      if (Math.abs(turn) > this.turnSpeed) {
         this.spin(this.turnSpeed * Math.sign(turn))
      }
   }

   this.moveTowards = (pos) => {
      var distance = this.pos.distance(pos)
      // console.log(engine.keyboard.isDown('forward'))
      // if (engine.keyboard.isDown('forward')) this.move()
      if (distance > 100) this.move()
   }

   this.step = () => {
      var point = engine.objects.find('point')
      var meteor = engine.objects.find('meteor')
      var avoidBy = this.radius + 20

      var posTarget = point.pos

      // ship - point
      engine.draw.settings({ lineWidth: 2 })


      // turning
      var posClosest = meteor.pos.closestPointOnLine([ point.pos, this.pos ])
      var distance = posClosest.distance(meteor.pos)
      if (distance < avoidBy + meteor.radius) {
         var directionToAvoid = meteor.pos.direction(posClosest)

         if (distance > meteor.radius) {
            posTarget = meteor.pos.clone().add(directionToAvoid.scale(avoidBy + meteor.radius))
            var posLast = posTarget
            engine.draw.line({ points: [ posLast, this.pos ], set: { strokeStyle: '#f22' } })

         } else {
            var angleToAvoid = directionToAvoid.angle()

            var posAvoid = meteor.pos.clone().add(directionToAvoid.clone().scale(meteor.radius))
            var offset = (posClosest.distance(posAvoid) / meteor.radius)
            var directionToShip = posClosest.direction(this.pos)
            var angleToShip = directionToShip.angle()

            var ninty = Math.PI*2 * (engine.math.angleToAngle(angleToAvoid, angleToShip) > 0 ? 0.25 : -0.25)

            // engine.draw.line({ points: [ meteor.pos, this.pos ], set: { strokeStyle: '#999'} })
            engine.draw.circle({ pos: posClosest, radius: 5, set: { strokeStyle: '#f22'}  })
            engine.draw.circle({ pos: posAvoid, radius: 10, set: { strokeStyle: '#f22'}  })


            // pathing
            var enter = ninty * offset
            var leave = ninty * -offset
            var resolution = 10
            var step = distance < meteor.radius ? (leave - enter) / resolution : 0
            var posLast = this.pos
            var targetPos = undefined
            for (var i = 1; i < resolution; i++) {
               var curr = enter + (step * i)

               var direction = new Vector(
                  Math.cos(curr) * directionToAvoid.x - Math.sin(curr) * directionToAvoid.y,
                  Math.sin(curr) * directionToAvoid.x + Math.cos(curr) * directionToAvoid.y
               )

               var pos = direction.clone().scale(meteor.radius + avoidBy).add(meteor.pos)
               if (i == 1) posTarget = pos.clone()
               engine.draw.line({ points: [ posLast, pos ]})
               posLast = pos
               // engine.draw.circle({ pos: pos, radius: 5, set: { strokeStyle: '#FFF'}  })
            }
         }

         engine.draw.line({ points: [ posLast, point.pos ], set: { strokeStyle: '#FFF'} })
      } else {
         engine.draw.line({ points: [ point.pos, this.pos ], set: { strokeStyle: '#999'} })
      }

      engine.draw.circle({ pos: posTarget, radius: 8, set: { fillStyle: '#4b5'}, fill: true })

      this.turnTowards(posTarget)
      this.moveTowards(point.pos)

      engine.draw.settings({ strokeStyle: 'white', lineWidth: 5 })
      engine.draw.shape({
         relative: this.pos,
         points: this.points
      })
   }
}
