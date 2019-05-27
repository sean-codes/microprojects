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
   draw: new Draw({ canvas: canvas, fullscreen: true }),
   objects: new Objects(),

   init: (vars) => {
      var { width, height } = engine.draw

      engine.objects.create({
         type: 'ship',
         pos: new Vector(width * 0.75, height * 0.75)
      })

      engine.objects.create({
         type: 'point',
         pos: new Vector(width * 0.25, height * 0.5)
      })

      engine.objects.create({
         type: 'meteor',
         pos: new Vector(width * 0.5, height * 0.5)
      })
   },

   step: (vars) => {
      engine.draw.clear()
      engine.objects.step()
      engine.mouse.step()
   }
})

engine.start()

// ---------------------------------------------------------------------------//
// -----------------------------| Game Objects |------------------------------//
// ---------------------------------------------------------------------------//
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
      var circle = Math.PI*2
      var shapeDirection = this.pos.clone().min(pos).direction()
      var direction = this.direction

      // im sure there is a rigth way to do this :]
      var leftAmount = shapeDirection - direction
      if (leftAmount > 0) leftAmount = leftAmount - circle

      var rightAmount = shapeDirection - direction
      if (rightAmount < 0) rightAmount = rightAmount + circle

      var turn = Math.abs(rightAmount) > Math.abs(leftAmount) ? leftAmount : rightAmount
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


      var closest = meteor.pos.closestPointOnLine([ point.pos, this.pos ])
      var shouldAvoid = closest.distance(meteor.pos) < meteor.radius

      engine.draw.settings({
         lineWidth: 2,
         strokeStyle: shouldAvoid ? '#F22' : '#49a'
      })
      engine.draw.line({ points: [ point.pos, this.pos ]})
      engine.draw.circle({
         pos: closest,
         radius: 5
      })

      this.turnTowards(point.pos)
      this.moveTowards(point.pos)

      engine.draw.settings({ strokeStyle: 'white', lineWidth: 5 })
      engine.draw.shape({
         relative: this.pos,
         points: this.points
      })
   }
}

function ObjectPoint(options) {
   this.pos = options.pos

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
   }
}

function ObjectMeteor(options) {
   this.pos = options.pos
   this.radius = 100

   this.step = () => {
      engine.draw.settings({ strokeStyle: 'red', lineWidth: 5 })
      engine.draw.circle({ pos: this.pos, radius: this.radius })
   }
}

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
}

// ---------------------------------------------------------------------------//
// ------------------------------| Libraries |--------------------------------//
// ---------------------------------------------------------------------------//
function Engine(o) {
   this.mouse = o.mouse
   this.draw = o.draw
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
      this.ctx.beginPath()
      this.ctx.arc(o.pos.x, o.pos.y, o.radius, 0, Math.PI*2)
      this.ctx.closePath()
      o.fill && this.ctx.fill();
      (o.stroke || !o.fill) && this.ctx.stroke()
   }
   this.rect = (o) => {
      o.fill && this.ctx.fillRect(o.pos.x, o.pos.y, o.width || o.size, o.height || o.size);
      (o.stroke || !o.fill) && this.ctx.strokeRect(o.pos.x, o.pos.y, o.width || o.size, o.height || o.size)
   }
   this.shape = (o) => {
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

function Vector(x, y) {
   this.x = x || 0
   this.y = y || 0
   this.clone = () =>  new Vector(this.x, this.y)
   this.add = (v) => { this.x+=v.x; this.y+=v.y; return this }
   this.min = (v) => { this.x-=v.x; this.y-=v.y; return this }
   this.scale = (s)  =>{ this.x*=s; this.y*=s; return this }
   this.unit = () => this.scale(1/this.length())
   this.distance = (v) => this.clone().min(v).length()
   this.direction = () => Math.atan2(this.y, this.x) + Math.PI
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
