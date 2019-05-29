// Autoreload Injected by microprojects
if (!window.frameElement) {
   var lastChange = 0
   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
         var data = JSON.parse(this.responseText)
         if(lastChange && data.changed !== lastChange){
            window.location = window.location;
            return
         }
         lastChange = data.changed
         setTimeout(function() {
            xhttp.open("GET", "../../reload.json", true);
            xhttp.send()
         }, 500)
      }
   };
   xhttp.open("GET", "../../reload.json", true);
   xhttp.send();
}

console.clear()

// ---------------------------------------------------------------------------//
// ------------------------------| Game Engine |------------------------------//
// ---------------------------------------------------------------------------//
var engine = new Engine({
   mouse: new Mouse({ element: canvas }),
   keyboard: new Keyboard({
      element: canvas,
      map: { forward: 38, left: 37, right: 39 }
   }),
   draw: new Draw({ canvas: canvas, fullscreen: true }),
   objects: new Objects(),
   math: new HandyMath(),
   physics: new Physics(),

   init: (vars) => {
      var { width, height } = engine.draw

      engine.objects.create({
         type: 'meteor',
         pos: new Vector(width * 0.25, height * 0.5)
      })

      engine.objects.create({
         type: 'meteor',
         pos: new Vector(width * 0.5, height * 0.5),
         radius: 75
      })

      engine.objects.create({
         type: 'meteor',
         pos: new Vector(width * 0.75, height * 0.5)
      })

      engine.objects.create({
         type: 'ship',
         pos: new Vector(width * 0.75, height * 0.75)
      })

      engine.objects.create({
         type: 'point',
         pos: new Vector(width * 0.2, height * 0.5)
      })

   },

   step: (vars) => {
      engine.physics.resolve()
      engine.draw.clear()
      engine.objects.step()
      engine.mouse.step()
   }
})

engine.start()

function Draw(o) {
   this.canvas = o.canvas
   this.ctx = o.canvas.getContext('2d')
   this.width = this.canvas.width
   this.height = this.canvas.height

   this.settings = (o) => {
      for (var oName in o) this.ctx[oName] = o[oName]
   }
   this.clear = () => {
      this.ctx.clearRect(0, 0, this.width, this.height)
   }
   this.circle = (o) => {
      o.set && this.settings(o.set)
      this.ctx.beginPath()
      this.ctx.arc(o.pos.x, o.pos.y, o.radius, 0, Math.PI*2)
      this.ctx.closePath()
      o.fill && this.ctx.fill();
      (o.stroke || !o.fill) && this.ctx.stroke()
   }
   this.rect = (o) => {
      o.set && this.settings(o.set)
      o.fill && this.ctx.fillRect(o.pos.x, o.pos.y, o.width || o.size, o.height || o.size);
      (o.stroke || !o.fill) && this.ctx.strokeRect(o.pos.x, o.pos.y, o.width || o.size, o.height || o.size)
   }
   this.shape = (o) => {
      o.set && this.settings(o.set)
      var vertices = o.points
      var relative = o.relative || { x: 0, y: 0 }

      this.ctx.beginPath()
      this.ctx.moveTo(relative.x + vertices[0].x, relative.y + vertices[0].y)
      for (var i = 1; i < vertices.length; i++) {
         this.ctx.lineTo( relative.x + vertices[i].x, relative.y + vertices[i].y)
      }
      this.ctx.closePath(relative.x + vertices[0].x, relative.y + vertices[0].y)

      o.fill && this.ctx.fill()
      o.stroke || !o.fill && this.ctx.stroke()
   }
   this.line = (o) => {
      o.set && this.settings(o.set)
      this.ctx.beginPath()
      this.ctx.moveTo(o.points[0].x, o.points[0].y)
      this.ctx.lineTo(o.points[1].x, o.points[1].y)
      this.ctx.closePath()
      this.ctx.stroke()
   }

   if (o.fullscreen) {
      this.resize = () => {
         this.canvas.height = window.innerHeight
         this.canvas.width = window.innerWidth
         this.width = this.canvas.width
         this.height = this.canvas.height
      }

      window.onresize = this.resize.bind(this)
      this.resize()
   }
}

// ---------------------------------------------------------------------------//
// ------------------------------| Libraries |--------------------------------//
// ---------------------------------------------------------------------------//
function Engine(o) {
   this.math = o.math
   this.mouse = o.mouse
   this.keyboard = o.keyboard
   this.draw = o.draw
   this.physics = o.physics
   this.objects = o.objects
   this.init = o.init || function() {}
   this.step = o.step || function() {}
   this.speed = 1000/60
   this.interval = undefined
   this.vars = {}

   this.start = () => {
      this.init(this.vars)
      this.interval = setInterval(() => { this.step(this.vars) }, this.speed)
   }

   this.stop = () => {
      clearInterval(this.interval)
   }
}

// ---------------------------------------------------------------------------//
// -----------------------------| Game Objects |------------------------------//
// ---------------------------------------------------------------------------//
function Objects() {
   this.id = 0
   this.list = []
   this.objectTypes = {
      ship: ObjectShip,
      point: ObjectPoint,
      meteor: ObjectMeteor
   }

   this.create = (options) => {
      var objectType = this.objectTypes[options.type]
      var object = new objectType(options)

      this.list.push({
         id: this.id++,
         type: options.type,
         object: object
      })
   }

   this.step = () => {
      for (var o of this.list) {
         o.object.step()
      }
   }

   this.find = (objectType) => {
      var listObject = this.list.find(o => o.type == objectType)
      if (listObject) return listObject.object
   }

   this.all = (objectType) => {
      var objects = this.list.reduce((sum, num) => {
         num.type == objectType && sum.push(num.object)
         return sum
      }, [])

      return objects
   }
}

function HandyMath() {
   this.angleToAngle = (a0, a1) => {
      var circle = Math.PI*2
      // im sure there is a rigth way to do this :]
      var leftAmount = a1 - a0
      if (leftAmount > 0) leftAmount = -circle + leftAmount

      var rightAmount = a1 - a0
      if (rightAmount < 0) rightAmount = rightAmount + circle

      return Math.abs(rightAmount) > Math.abs(leftAmount) ? leftAmount : rightAmount
   }
}

function Keyboard(o) {
   this.element = o.element
   this.map = o.map ? JSON.parse(JSON.stringify(o.map)) : {}
   this.keys = {}


   this.isDown = (key) => {
      // console.log(key, this.map[key], this.keys)
      return this.keys[this.map[key]]
   }

   this.reset = () => {
      this.keys = {}
   }

   this.element.addEventListener('keydown', (e) => {
      console.log(e.keyCode)
      this.keys[e.keyCode] = true
   })

   this.element.addEventListener('keyup', (e) => {
      this.keys[e.keyCode] = false
   })

   this.element.addEventListener('blur', (e) => {
      this.reset()
   })
}

function Mouse(o) {
   this.element = o.element
   this.down = false
   this.held = false
   this.up = false

   this.step = () => {
      this.down = false
      this.up = false
   }

   this.element.addEventListener('mousedown', (e) => {
      this.pos = new Vector(e.clientX, e.clientY)
      this.down = true
      this.held = true
   })

   this.element.addEventListener('mouseup', (e) => {
      this.pos = new Vector(e.clientX, e.clientY)
      this.held = false
      this.up = true
   })

   this.element.addEventListener('mousemove', (e) => {
      this.pos = new Vector(e.clientX, e.clientY)
   })

   this.element.addEventListener('mouseout', (e) => {
      this.held = false
      this.up = true
   })
}

function Physics() {
   this.objects = []

   this.add = (info) => {
      var physicsObject = {
         id: info.object.id,
         type: info.object.type,
         object: info.object,
         radius: info.radius,
         pos: info.object.pos.clone(),
         speed: info.object.speed ? cs.clone(info.object.speed) : { x: 0, y: 0 },
         collideWith: cs.clone(info.collideWith || []),
         bounceWith: cs.clone(info.bounceWith || []),
         manifold: {}
      }

      this.objectResetManifold(physicsObject)
      this.objects.push(physicsObject)
      return physicsObject
   }

   this.remove = (removeObject) => {
      this.objects = this.objects.filter(function(o) {
         return o.id !== removeObject.core.id
      })
   }

   this.resolve = () => {
      for (var object_0 of this.objects) {
         // reset manifold
         this.objectResetManifold(object_0)
         this.objectMove(object_0)

         for (var object_1 of this.objects) {
            if (object_0.id == object_1.id) continue

            var collideWith = object_0.collideWith
            var bounceWith = object_0.bounceWith
            var touchDistance = object_0.radius + object_1.radius

            if (collideWith.includes(object_1.type)) {
               // push them away
               var distance = cs.math.distance(object_0.pos, object_1.pos)
               if (distance < touchDistance) {
                  object_0.manifold.colliding = true
                  object_1.manifold.colliding = true

                  var direction = cs.math.direction(object_0.pos, object_1.pos)

                  object_0.pos.x -= cs.math.cos(direction) * (touchDistance - distance)
                  object_0.pos.y -= cs.math.sin(direction) * (touchDistance - distance)

                  if (bounceWith.includes(object_1.type)) {
                     speedX = object_0.speed.x
                     speedY = object_0.speed.y

                     object_0.speed.x = object_1.speed.x
                     object_0.speed.y = object_1.speed.y
                     object_1.speed.x = speedX
                     object_1.speed.y = speedY
                  }
               }
            }
         }
      }
   }

   this.objectMove = (object) => {
      object.pos.x += object.speed.x * cs.loop.delta
      object.pos.y += object.speed.y * cs.loop.delta

      // reflect if outside
      if (object.pos.x < 0 || object.pos.x > cs.room.width) {
         object.pos.x -= (object.pos.x < 0 ? object.pos.x : object.pos.x - cs.room.width)
         object.speed.x = -object.speed.x
      }

      if (object.pos.y < 0 || object.pos.y > cs.room.height) {
         object.pos.y -= (object.pos.y < 0 ? object.pos.y : object.pos.y - cs.room.height)
         object.speed.y = -object.speed.y
      }
   }

   this.objectResetManifold = (object) => {
      object.manifold = {
         colliding: false
      }
   }
}

function Vector(x, y) {
   this.x = x || 0
   this.y = y || 0
   this.clone = () =>  new Vector(this.x, this.y)
   this.add = (v) => { this.x+=v.x; this.y+=v.y; return this }
   this.min = (v) => { this.x-=v.x; this.y-=v.y; return this }
   this.scale = (s)  =>{ this.x*=s; this.y*=s; return this }
   this.unit = () => this.scale(1/this.length())
   this.distance = (v) => this.clone().min(v).length()
   this.angle = () => Math.atan2(this.y, this.x) + Math.PI
   this.direction = (v1) => v1.clone().min(this).unit()
   this.dot = (v1) => this.x*v1.x+this.y*v1.y
   this.length = () => Math.sqrt(this.x*this.x + this.y*this.y)
   this.closestPointOnLine = (line) => {
      var lineLength = line[0].distance(line[1])
      var lineDirection = line[0].clone().min(line[1]).unit()
      var lineToPoint = line[0].clone().min(this)

      var dot = lineToPoint.dot(lineDirection) / lineLength
      dot = Math.min(Math.max(0, dot), 1)

      var closestPoint = line[0].clone().min(lineDirection.clone().scale(dot * lineLength))
      return closestPoint
   }
}

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
         var distanceThisToMeteor = meteor.pos.distance(this.pos)
         if (distanceThisToMeteor < meteor.radius) {
            this.pos.add(meteor.pos.direction(this.pos).scale(distanceThisToMeteor))
         }
      }
   }
}

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
