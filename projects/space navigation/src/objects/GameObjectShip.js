function ObjectShip(options) {
   this.speed = 0
   this.speedMax = 5
   this.angle = Math.PI*2 * 0.75

   this.turnAccel = 0.01
   this.turnSpeed = 0
   this.turnMax = Math.PI*2 * 0.025
   this.color = '#FFF'
   this.radius = 20

   this.physics = engine.physics.add({
      pos: options.pos,
      radius: this.radius,
      type: 'ship',
      collideWith: [ 'meteor' ]
   })

   this.points = [
      new Vector(0, -this.radius),
      new Vector(-(this.radius*0.75), this.radius * 0.75),
      new Vector(this.radius*0.75, this.radius * 0.75),
   ]

   this.spin = () => {
      var amount = this.turnSpeed
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
      this.speed = Math.max(0, this.speed - 0.1)

      var amount = new Vector(
         Math.cos(this.angle) * this.speed,
         Math.sin(this.angle) * this.speed
      )

      this.physics.pos.add(amount)
   }

   this.turnTowards = (pos) => {
      var angleToPos = this.physics.pos.clone().min(pos).angle()
      var turn = engine.math.angleToAngle(this.angle, angleToPos)

      // console.log(turn)
      this.turnSpeed -= Math.sign(this.turnSpeed) * (this.turnAccel*0.75)
      if (Math.abs(turn) > this.turnSpeed) {
         this.turnSpeed += Math.sign(turn) * this.turnAccel
         this.turnSpeed = Math.min(Math.max(this.turnSpeed, -this.turnMax), this.turnMax)
      }

      return turn
   }

   this.jet = () => {
      this.speed = Math.min(this.speed + 0.2, this.speedMax)
   }

   this.findTarget = (pos) => {
      var posShip = this.physics.pos

      // lets leave
      var distanceToPos = posShip.distance(pos)
      if (distanceToPos < this.physics.radius*3) return pos

      var avoidBy = this.radius + (20 * (this.speed/this.speedMax*2))
      var directionToPos = this.physics.pos.direction(pos)
      var meteors = engine.objects.all('meteor')
      var ships = engine.objects.all('ship')

      var avoid = {
         meteorId: undefined,
         distanceShipToMeteor: 9999999,
         posClosest: undefined,
         avoidDistance: 0
      }

      for (var meteorId in meteors) {
         var meteor = meteors[meteorId]
         var meteorPos = meteor.physics.pos
         var meteorRadius = meteor.physics.radius

         var avoidDistance = avoidBy + meteorRadius
         var posClosest = meteorPos.closestPointOnLine([ pos, this.physics.pos ])

         var distanceClosestToMeteor = posClosest.distance(meteorPos)
         var distanceShipToMeteor = this.physics.pos.distance(meteorPos)
         var directionShipToMeteor = this.physics.pos.direction(meteor.physics.pos)
         var shipDotMeteor = directionShipToMeteor.dot(directionToPos)

         if (shipDotMeteor > 0 && distanceClosestToMeteor < avoidDistance && distanceShipToMeteor < avoid.distanceShipToMeteor) {
            meteor.inPath = true
            avoid.meteorId = meteorId
            avoid.distanceShipToMeteor = distanceShipToMeteor
            avoid.distanceClosestToMeteor = distanceClosestToMeteor
            avoid.posClosest = posClosest.clone()
            avoid.avoidDistance = avoidDistance
         }
      }

      if (avoid.meteorId != undefined) {
         var meteor = meteors[avoid.meteorId]
         meteor.choice = true
         var meteorPos = meteor.physics.pos
         var distanceClosestToMeteor = avoid.distanceClosestToMeteor
         var distanceShipToMeteor = avoid.distanceShipToMeteor
         var posClosest = avoid.posClosest
         var avoidDistance = avoid.avoidDistance

         engine.draw.circle({ pos: posClosest, radius: 5, set: { lineWidth: 1, strokeStyle: '#f22' }})
         // we need to navigate around
         var directionMeteorToClosest = meteorPos.direction(posClosest)
         var posAvoid = posClosest.clone().add(directionMeteorToClosest.clone().scale(meteorRadius - distanceClosestToMeteor + avoidBy))
         // console.log(posAvoid)
         engine.draw.circle({ pos: posAvoid, radius: 5, set: { lineWidth: 1, strokeStyle: '#465' }})
         // not really sure how to calculate. lets leave

         if (distanceClosestToMeteor > meteorRadius) {
            return posAvoid
         }

         // get first point
         var angleShipTo = posClosest.direction(this.physics.pos)

         var directionShipToAvoid = posShip.direction(posAvoid)
         var directionShipToClosest = posShip.direction(posClosest)
         var angleShipToAvoid = directionShipToAvoid.angle()
         var angleShipToClosest = directionShipToClosest.angle()
         var turn = engine.math.angleToAngle(angleShipToAvoid, angleShipToClosest)

         var distancClosestToAvoid = posClosest.distance(posAvoid)
         var offset = 1 - distanceClosestToMeteor / meteorRadius

         var ninty = Math.PI*2 * (turn < 0 ? 0.25 : -0.25)
         var nintyOffset = ninty * offset

         var offsetDirection = new Vector(
            Math.cos(nintyOffset) * directionMeteorToClosest.x - Math.sin(nintyOffset) * directionMeteorToClosest.y,
            Math.sin(nintyOffset) * directionMeteorToClosest.x + Math.cos(nintyOffset) * directionMeteorToClosest.y
         )

         // console.log(directionMeteorToClosest.length())
         var targetPos = meteorPos.clone().add(offsetDirection.scale(meteorRadius + avoidBy))
         // console.log(targetPos.x, targetPos.y)
         engine.draw.circle({ pos: targetPos, radius: 10, set: { lineWidth: 3, strokeStyle: '#FFF' }})
         return targetPos
      }


      return pos
   }

   this.step = () => {
      var targetPoint = undefined
      var targetDistance = undefined

      var points = engine.objects.all('point')

      for (var point of points) {
         var distance = point.physics.pos.distance(this.physics.pos)
         if (!targetDistance || distance < targetDistance) {
            targetPoint = point
            targetDistance = distance
         }
      }


      var posTarget = this.findTarget(targetPoint.physics.pos)//point.pos
      var turn = this.turnTowards(posTarget)
      var pointingRight = Math.abs(turn) < Math.PI*2 * 0.1

      this.color = 'white'
      if (pointingRight && point.physics.pos.distance(this.physics.pos) > this.speed / this.speedMax * 150) {
         this.jet()
      } else {
         this.color = 'red'
      }

      this.spin()
      this.move()

      engine.draw.settings({ strokeStyle: this.color, lineWidth: 5 })
      engine.draw.shape({
         relative: this.physics.pos,
         points: this.points
      })

      engine.draw.settings({ fillStyle: '#FFF' })
      engine.draw.text({
         pos: this.physics.pos.clone().min({ x: 0, y: 48 }),
         text: Math.round(this.speed * 100) / 100
      })
   }
}
