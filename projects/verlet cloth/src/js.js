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
   gravity: { x: 0, y: 0.5 },
   friction: 0.95,
   bounce: 0.5,
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
      var spaceBetweenPoints = 10

      var numberOfHorizontalPoints = 30
      var numberOfVerticalPoints = 20

      var xOff = (canvas.width/2) - (spaceBetweenPoints * numberOfHorizontalPoints / 2)
      var yOff = 20 // (canvas.height/2) - (spaceBetweenPoints * numberOfVerticalPoints / 2)

      for (var x = 0; x < numberOfHorizontalPoints; x++) {
         for (var y = 0; y < numberOfVerticalPoints; y++) {
            var xPos = x * spaceBetweenPoints + xOff
            var yPos = y * spaceBetweenPoints + yOff
            points.push(new VerletPoint(xPos, yPos))
            // link them horizontally
            if (y > 0) {
               lines.push(new VerletLine(points[points.length - 1], points[points.length - 2]))
            }

            if (x > 0) {
               lines.push(new VerletLine(points[points.length-1], points[points.length - 1 - numberOfVerticalPoints]))
            }

            // pin top points
            if (y == 0) points[points.length - 1].pin = true
         }
      }

      points[0].pin = true
      points[points.length - numberOfVerticalPoints].pin = true


      // lines.push(new VerletLine(points[0], points[1]))
      // lines.push(new VerletLine(points[1], points[3]))
      // lines.push(new VerletLine(points[3], points[4]))
      // var xId = 0
      // var yId = 0

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

// mouse
canvas.addEventListener('mousemove', function(e) {
  onMouseMove(e)
})

canvas.addEventListener('mousedown', function(e) {
  mouse.down = new Vector(e.offsetX, e.offsetY)
  canvas.classList.toggle('grab', false)
  canvas.classList.toggle('grabbing', true)

  for (var point of points) {
    if (point.hover) point.held = true
  }
})

canvas.addEventListener('mouseup', function(e) {
  mouse.down = false
  onMouseMove(e)
})

function onMouseMove(e) {
  mouse.pos = new Vector(e.offsetX, e.offsetY)
  if (mouse.down) {
    return
  }

  canvas.classList.toggle('grab', false)
  canvas.classList.toggle('grabbing', false)


  for (var point of points) {
    point.hover = false
    point.held = false
    if (mouse.pos.distance(point.pos) < 10) {
      point.hover = true
      canvas.classList.toggle('grab', true)
    }
  }
}

function VerletLine(p1, p2) {
   this.p1 = p1
   this.p2 = p2

   this.length = this.p1.pos.distance(this.p2.pos)

   this.move = function() {
      this.constrain()

   }

   this.draw = function() {
     draw.set({ strokeStyle: '#FFF' })
     draw.line(this.p1.pos, this.p2.pos)
   }

   this.constrain = function() {
      // pull / push to match length
      var distance = this.p1.pos.distance(this.p2.pos)
      var pull = (this.length - distance) / 2

      var direction = this.p1.pos.clone().min(this.p2.pos).unit()

      !this.p1.pin && this.p1.pos.add(direction.clone().scale(pull))
      !this.p2.pin && this.p2.pos.min(direction.clone().scale(pull))
   }
}

function VerletPoint(x, y) {
   this.pos = new Vector(x, y)
   //this.old = new Vector(x-(Math.random()*20-10), y-(Math.random()*20-10))
   this.old = this.pos.clone()
   this.hover = false
   this.held = false

   this.iterate = function() {
      this.move()
      this.draw()
   }

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
      velocity
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
      if(this.hover) draw.rectangle(this.pos.x, this.pos.y, 3, 3)
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
