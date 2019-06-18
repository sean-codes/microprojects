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

      // engine.objects.create({
      //    type: 'meteor',
      //    pos: new Vector(width * 0.25, height * 0.5)
      // })
      //
      // engine.objects.create({
      //    type: 'meteor',
      //    pos: new Vector(width * 0.5, height * 0.5),
      //    radius: 75
      // })
      //
      // engine.objects.create({
      //    type: 'meteor',
      //    pos: new Vector(width * 0.75, height * 0.5)
      // })

      for (var i = 0; i < 5; i++) {
         engine.objects.create({
            type: 'meteor',
            pos: new Vector(width * Math.random(), height * Math.random()),
            radius: 50 + Math.random() * 50
         })
      }

      for (var i = 0; i < 2; i++) {
         engine.objects.create({
            type: 'ship',
            pos: new Vector(width * Math.random(), height * Math.random())
         })
      }


      for (var i = 0; i < 3; i++) {
         engine.objects.create({
            type: 'point',
            pos: new Vector(width * Math.random(), height * Math.random())
         })
      }
   },

   step: (vars) => {
      engine.physics.resolve()
      engine.draw.clear()
      engine.objects.step()
      engine.mouse.step()
   }
})

engine.start()

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

function ObjectPoint(options) {
   this.pos = options.pos.clone()
   this.timer = 120
   this.radius = 10

   this.physics = engine.physics.add({
      pos: this.pos,
      radius: this.radius,
      type: 'point',
      collideWith: [ 'meteor' ]
   })

   this.step = () => {
      engine.draw.settings({ strokeStyle: '#4a5'})

      engine.draw.circle({
         pos: this.physics.pos,
         radius: 10,
         stroke: true
      })

      if (engine.mouse.held) {
         this.physics.pos = engine.mouse.pos.clone()
      }

      if (this.physics.manifold.objectTypes.ship) {
         this.physics.pos = new Vector(
            engine.draw.width*0.1 + engine.draw.width*0.8 * Math.random(),
            engine.draw.height*0.1 + engine.draw.height*0.8 * Math.random()
         )
      }
   }
}

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
      if (distanceToPos < 100) return pos

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

   this.text = (o) => {
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.font = "bold 24px monospace"
      o.set && this.settings(o.set)
      this.ctx.fillText(o.text, o.pos.x, o.pos.y)
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
   this.unique = 0
   this.objects = []

   this.add = (info) => {
      var physicsObject = {
         id: this.unique++,
         type: info.type,
         radius: info.radius,
         pos: info.pos.clone(),
         solid: info.solid,
         speed: info.speed ? info.speed.clone() : new Vector(0, 0),
         bounceWith: JSON.parse(JSON.stringify(info.bounceWith || '[]')),
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

            var combinedRadius = object_0.radius + object_1.radius
            var distance = object_0.pos.distance(object_1.pos)

            if (distance < combinedRadius) {
               object_0.manifold.colliding = true
               object_1.manifold.colliding = true
               object_0.manifold.objectTypes[object_1.type] = true
               object_1.manifold.objectTypes[object_0.type] = true

               var overlap = (combinedRadius - distance)
               var direction = object_0.pos.direction(object_1.pos)

               object_1.solid
                  ? object_0.pos.min(direction.clone().scale(overlap))
                  : object_1.pos.add(direction.clone().scale(overlap))

               if (bounceWith.includes(object_1.type)) {
                  var combinedSpeed = object_0.speed.length() + object_1.speed.length()
                  var tangent = new Vector(-direction.y, direction.x)
                  var obj0VelDotTangnet = object_0.speed.unit().dot(tangent)
                  var obj0VelDotDirection = object_0.speed.unit().dot(direction)

                  object_0.speed = tangent.clone().scale(obj0VelDotTangnet).unit().scale(combinedSpeed/2)
                  object_1.speed = direction.clone().scale(obj0VelDotDirection).unit().scale(combinedSpeed/2)
               }
            }
         }
      }
   }

   this.objectMove = (object) => {
      object.pos.x += object.speed.x
      object.pos.y += object.speed.y

      // reflect if outside
      if (object.pos.x < 0 || object.pos.x > engine.draw.width) {
         object.pos.x -= (object.pos.x < 0 ? object.pos.x : object.pos.x - engine.draw.width)
         object.speed.x = -object.speed.x
      }

      if (object.pos.y < 0 || object.pos.y > engine.draw.height) {
         object.pos.y -= (object.pos.y < 0 ? object.pos.y : object.pos.y - engine.draw.height)
         object.speed.y = -object.speed.y
      }
   }

   this.objectResetManifold = (object) => {
      object.manifold = {
         colliding: false,
         objectTypes: {}
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
