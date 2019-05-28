function ObjectShip(options) {
   this.pos = options.pos
   this.speed = 0
   this.speedMax = 5
   this.angle = Math.PI*2 * 0.75

   this.turnAccel = 0.01
   this.turnSpeed = 0
   this.turnMax = Math.PI*2 * 0.025

   this.radius = 25
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

      this.pos.add(amount)
   }

   this.turnTowards = (pos) => {
      var angleToPos = this.pos.clone().min(pos).angle()
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

   this.posTarget = (pos) => {
      var posShip = this.pos
      var avoidBy = this.radius + (20 * (this.speed/this.speedMax*2))

      var meteors = engine.objects.all('meteor')

      var avoid = {
         object: undefined,
         distanceShipToMeteor: 9999999,
         posClosest: undefined,
         avoidDistance: 0
      }

      for (var meteor of meteors) {
         var avoidDistance = avoidBy + meteor.radius
         var posClosest = meteor.pos.closestPointOnLine([ pos, this.pos ])

         var distanceClosestToMeteor = posClosest.distance(meteor.pos)
         var distanceShipToMeteor = this.pos.distance(meteor.pos)

         if (distanceClosestToMeteor < avoidDistance && distanceShipToMeteor < avoid.distanceShipToMeteor) {
            avoid.object = meteor
            avoid.distanceShipToMeteor = distanceShipToMeteor
            avoid.distanceClosestToMeteor = distanceClosestToMeteor
            avoid.posClosest = posClosest
            avoid.avoidDistance = avoidDistance
         }
      }

      if (avoid.object) {
         var meteor = avoid.object
         var distanceClosestToMeteor = avoid.distanceClosestToMeteor
         var distanceShipToMeteor = avoid.distanceShipToMeteor
         var posClosest = avoid.posClosest
         var avoidDistance = avoid.avoidDistance

         engine.draw.circle({ pos: posClosest, radius: 5, set: { lineWidth: 1, strokeStyle: '#f22' }})
         // we need to navigate around
         var directionMeteorToClosest = meteor.pos.direction(posClosest)
         var posAvoid = posClosest.clone().add(directionMeteorToClosest.clone().scale(meteor.radius - distanceClosestToMeteor + avoidBy))
         // console.log(posAvoid)
         engine.draw.circle({ pos: posAvoid, radius: 5, set: { lineWidth: 1, strokeStyle: '#465' }})
         // not really sure how to calculate. lets leave

         if (distanceClosestToMeteor > meteor.radius) {
            return posAvoid
         }

         // get first point
         var angleShipTo = posClosest.direction(this.pos)

         var directionShipToAvoid = posShip.direction(posAvoid)
         var directionShipToClosest = posShip.direction(posClosest)
         var angleShipToAvoid = directionShipToAvoid.angle()
         var angleShipToClosest = directionShipToClosest.angle()
         var turn = engine.math.angleToAngle(angleShipToAvoid, angleShipToClosest)

         var distancClosestToAvoid = posClosest.distance(posAvoid)
         var offset = 1 - distanceClosestToMeteor / meteor.radius

         var ninty = Math.PI*2 * (turn < 0 ? 0.25 : -0.25)
         var nintyOffset = ninty * offset

         var offsetDirection = new Vector(
            Math.cos(nintyOffset) * directionMeteorToClosest.x - Math.sin(nintyOffset) * directionMeteorToClosest.y,
            Math.sin(nintyOffset) * directionMeteorToClosest.x + Math.cos(nintyOffset) * directionMeteorToClosest.y
         )

         // console.log(directionMeteorToClosest.length())
         var targetPos = meteor.pos.clone().add(offsetDirection.scale(meteor.radius + avoidBy))
         // console.log(targetPos.x, targetPos.y)
         engine.draw.circle({ pos: targetPos, radius: 5, set: { lineWidth: 1, strokeStyle: '#FFF' }})
         return targetPos
      }


      return pos
   }

   this.step = () => {
      var point = engine.objects.find('point')
      var meteor = engine.objects.find('meteor')

      var posTarget = this.posTarget(point.pos)//point.pos
      var turn = this.turnTowards(posTarget)
      var pointingRight = Math.abs(turn) < Math.PI*2 * 0.1
      // console.log(point.pos)

      if (pointingRight && point.pos.distance(this.pos) > this.speed / this.speedMax * 150 + 20) {
         this.jet()
      }

      this.spin()
      this.move()

      engine.draw.settings({ strokeStyle: 'white', lineWidth: 5 })
      engine.draw.shape({
         relative: this.pos,
         points: this.points
      })
   }
}
