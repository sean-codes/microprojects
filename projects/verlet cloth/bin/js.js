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

var ctx = canvas.getContext('2d')
var draw = new Draw(ctx)

// variables
var global = {
   gravity: { x: 0, y: 0.5 },
   friction: 0.98,
   bounce: 0.85,
   width: canvas.width,
   height: canvas.height
}

var points = []
var lines = []

// scene
var scene = new Scene({
   start: function() {
      points = []
      // handy numbers for creating the points / lines
      var spaceBetweenPoints = 20

      var numberOfHorizontalPoints = 15
      var numberOfVerticalPoints = 10

      var xOff = (canvas.width/2) - (spaceBetweenPoints * numberOfHorizontalPoints / 2)
      var yOff = (canvas.height/2) - (spaceBetweenPoints * numberOfVerticalPoints / 2)

      for (var x = 0; x < numberOfHorizontalPoints; x++) {
         for (var y = 0; y < numberOfVerticalPoints; y++) {
            var xPos = x * spaceBetweenPoints + xOff
            var yPos = y * spaceBetweenPoints + yOff
            points.push(new VerletPoint(xPos, yPos))
         }
      }

      points[0].pin = true


      lines.push(new VerletLine(points[0], points[1]))
      lines.push(new VerletLine(points[1], points[3]))
      lines.push(new VerletLine(points[3], points[4]))
   },

   iterate: function() {
      draw.clear()

      // running separate due to kind of messing up the naming
      for (var point of points) point.iterate()
      for (var line of lines) line.iterate()
   },

   speed: 1000 / 60 // 60 per second
})

scene.start()


function VerletLine(p1, p2) {
   this.p1 = p1
   this.p2 = p2

   this.length = this.p1.pos.distance(this.p2.pos)

   this.iterate = function() {
      this.constrain()

      draw.line(this.p1.pos, this.p2.pos)
   }

   this.constrain = function() {
      // pull / push to match length
      var distance = this.p1.pos.distance(this.p2.pos)
      var pull = this.length - distance / 2

      var direction = this.p1.pos.clone().min(this.p2.pos).unit()

      !this.p1.pin && this.p1.pos.add(direction.clone().scale(pull))
      !this.p2.pin && this.p2.pos.min(direction.clone().scale(pull))
   }
}

function VerletPoint(x, y) {
   this.pos = new Vector(x, y)
   this.old = new Vector(x-(Math.random()*20-10), y-(Math.random()*20-10))

   this.iterate = function() {
      this.move()
      this.draw()
   }

   this.move = function() {
      if (this.pin) return

      var velocity = this.pos.clone().min(this.old).add(global.gravity)
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
      draw.set({ fillStyle: '#FFF' })
      draw.rectangle(this.pos.x, this.pos.y, 3, 3)
   }
}

// imaginary drawing library
function Draw(ctx) {
   this.ctx = ctx

   this.set = function(settings) {
      for(var setting in settings) {
         this.ctx[setting] = settings[setting]
      }
   }

   this.rectangle = function(x, y, width, height) {
      this.ctx.fillRect(x-width/2, y-height/2, width, height)
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
      return Math.sqrt((this.x*this.x) + (this.y*this.y))
   }

   this.unit = function() {
      return this.clone().scale(1 / this.length())
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
