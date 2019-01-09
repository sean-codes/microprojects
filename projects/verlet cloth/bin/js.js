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

// setup
var canvas = document.querySelector('canvas')
canvas.width = canvas.clientWidth
canvas.height = canvas.clientHeight
var mouse = {
   down: false,
   pos: undefined
}

var ctx = canvas.getContext('2d')
var draw = new Draw(ctx)

// variables
var global = {
   gravity: { x: 0, y: 0.25 },
   friction: 0.98,
   bounce: 1,
   width: canvas.width,
   height: canvas.height
}

var points = []
var lines = []

var spaceBetweenPoints = 10

var numberOfHorizontalPoints = 50
var numberOfVerticalPoints = 20

// scene
var scene = new Scene({
   start: function() {
      points = []
      // handy numbers for creating the points / lines
      var xOff = (canvas.width / 2) - (spaceBetweenPoints * numberOfHorizontalPoints / 2)
      var yOff = 40 // (canvas.height/2) - (spaceBetweenPoints * numberOfVerticalPoints / 2)

      for (var x = 0; x < numberOfHorizontalPoints; x++) {
         for (var y = 0; y < numberOfVerticalPoints; y++) {
            var xPos = x * spaceBetweenPoints + xOff
            var yPos = y * spaceBetweenPoints + yOff
            var point = new VerletPoint(xPos, yPos)
            points.push(point)

            // pin top points
            if (y == 0) point.pin = true
         }
      }

      setUpLines(0, 0)
   },

   iterate: function() {
      draw.clear()

      // running separate due to kind of messing up the naming
      for (var line of lines) line.move()
      for (var point of points) point.move()

      for (var line of lines) line.draw()
      for (var point of points) point.draw()
   },

   speed: 1000 / 60 // 60 per second
})

scene.start()

function setUpLines(xHalf) {
   for (var x of [(numberOfHorizontalPoints/2 - 1) - xHalf, (numberOfHorizontalPoints/2) + xHalf]) {
      for (var y = 0; y < numberOfVerticalPoints; y++) {
         var pointID = x * numberOfVerticalPoints + y
         console.log(x / numberOfHorizontalPoints)
         // continue
         if (y > 0) {
            var line = new VerletLine(points[pointID], points[pointID - 1])
            line.color = `rgba(255, 50, ${Math.floor(x/numberOfHorizontalPoints*255)}, 0.75)`
            lines.push(line)
         }

         if (x > 0) {
            var line = new VerletLine(points[pointID], points[pointID - numberOfVerticalPoints])
            line.color = `rgba(255, 50, ${Math.floor(x/numberOfHorizontalPoints*255)}, 0.75)`
            lines.push(line)
         }
      }
   }

   xHalf += 1
   if(xHalf < numberOfHorizontalPoints/2) {
      setTimeout(function() {
         setUpLines(xHalf)
      }, 1000/60)
   }
}
// mouse
document.body.addEventListener('mousemove', function(e) {
   onMouseMove(e)
})

document.body.addEventListener('mousedown', function(e) {
   var rectCanvas = canvas.getBoundingClientRect()
   mouse.down = new Vector(e.clientX - rectCanvas.left, e.clientY - rectCanvas.top)
   canvas.classList.toggle('grab', false)
   canvas.classList.toggle('grabbing', true)

   for (var point of points) {
      if (point.hover) point.held = true
   }
})

document.body.addEventListener('mouseup', function(e) {
   mouse.down = false
   onMouseMove(e)
})

function onMouseMove(e) {
   var rectCanvas = canvas.getBoundingClientRect()
   var mx = Math.max(0, Math.min(canvas.width, e.clientX - rectCanvas.left))
   var my = Math.max(0, Math.min(canvas.height, e.clientY - rectCanvas.top))
   mouse.pos = new Vector(mx, my)

   if (mouse.down) {
      return
   }

   canvas.classList.toggle('grab', false)
   canvas.classList.toggle('grabbing', false)


   for (var point of points) {
      point.hover = false
      point.held = false
      if (mouse.pos.distance(point.pos) < 20) {
         point.hover = true
         canvas.classList.toggle('grab', true)
      }
   }
}

function VerletLine(p1, p2) {
   this.p1 = p1
   this.p2 = p2
   this.color = '#FFF'

   this.length = spaceBetweenPoints//this.p1.pos.distance(this.p2.pos)

   this.move = function() {
      this.constrain()
   }

   this.draw = function() {
      draw.set({ strokeStyle: this.color })
      draw.line(this.p1.pos, this.p2.pos)
   }

   this.constrain = function() {
      // pull / push to match length
      var distance = this.p1.pos.distance(this.p2.pos)
      var pull = (this.length - distance) / 2

      var direction = this.p1.pos.clone().min(this.p2.pos).unit()

      if (!this.p1.pin) this.p1.pos.add(direction.clone().scale(pull))
      if (!this.p2.pin) this.p2.pos.min(direction.clone().scale(pull))
   }
}

function VerletPoint(x, y) {
   this.pos = new Vector(x, y)
   this.old = new Vector(x-(Math.random()), y-(Math.random()*10-5))
   //this.old = this.pos.clone()
   this.hover = false
   this.held = false

   this.move = function() {
      if (this.pin) return
      if (this.held) {
         var distance = this.pos.distance(mouse.pos)
         var direction = this.pos.clone().min(mouse.pos).unit()

         this.pos.min(direction.scale(distance))
         this.old = this.pos.clone()
         return
      }

      var velocity = this.pos.clone().min(this.old).add(global.gravity)
      velocity.tame(100)
      velocity.scale(global.friction)

      this.old = this.pos.clone()

      this.pos.add(velocity)

      if (this.pos.x < 0 || this.pos.x > global.width) {
         this.pos.x = this.pos.x < 0 ? 0 : global.width
         this.old.x = this.pos.x + velocity.x * global.bounce
      }

      if (this.pos.y < 0 || this.pos.y > global.height) {
         this.pos.y = this.pos.y < 0 ? 0 : global.height
         this.old.y = this.pos.y + velocity.y * global.bounce
      }
   }

   this.draw = function() {
      draw.set({ fillStyle: 'rgba(255, 255, 255, 0.25)' })
      draw.rectangle(this.pos.x, this.pos.y, 1, 1)
   }
}

// imaginary drawing library
function Draw(ctx) {
   this.ctx = ctx

   this.set = function(settings) {
      for (var setting in settings) {
         this.ctx[setting] = settings[setting]
      }
   }

   this.rectangle = function(x, y, width, height) {
      this.ctx.fillRect(x - width / 2, y - height / 2, width, height)
   }

   this.line = function(p1, p2) {
      this.ctx.beginPath()
      this.ctx.moveTo(p1.x, p1.y)
      this.ctx.lineTo(p2.x, p2.y)
      this.ctx.stroke()
   }

   this.clear = function() {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)
   }
}

// imaginary vector library
function Vector(x, y) {
   this.x = x
   this.y = y

   this.add = function(v) {
      this.x += v.x
      this.y += v.y

      return this
   }

   this.distance = function(oV) {
      return this.clone().min(oV).length()
   }

   this.length = function() {
      return Math.sqrt((this.x * this.x) + (this.y * this.y))
   }

   this.unit = function() {
      return this.scale(1 / this.length())
   }

   this.tame = function(max) {
      if (this.length() > max) {
         this.unit().scale(max)
      }
   }

   // would have been cool to combo scale -1
   this.min = function(v) {
      this.x -= v.x
      this.y -= v.y

      return this
   }

   this.scale = function(multiplier) {
      this.x *= multiplier
      this.y *= multiplier

      return this
   }

   this.clone = function() {
      return new Vector(this.x, this.y)
   }

   this.toString = function() {
      return '(' + this.x + ', ' + this.y + ')'
   }
}

function Scene(options) {
   this.speed = options.speed
   this.running = false

   this.start = function() {
      options.start()
      !this.running && this.iterate()
   }

   this.iterate = function() {
      setTimeout(function() {
         this.running = true
         this.iterate()
      }.bind(this), this.speed)

      options.iterate()
   }
}
