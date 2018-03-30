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

// Hi! This is very much experimental! Lots of comments and parts laying around!!
var ctx = document.querySelector('canvas').getContext('2d')
ctx.canvas.width = 600
ctx.canvas.height = 300

var draw = new Draw(ctx)

// Make a grid give each a x/y velocity
var zoneSize = 10;

var fields = VectorField({
	width: ctx.canvas.width,
	height: ctx.canvas.height,
	fieldSize: 10
})

ctx.canvas.addEventListener('click', function() {
   fields = fakeNoise()
})

var particles = []
var i = 	10000; while(i--) {
   particles.push({
      pos: new Vector(ctx.canvas.width/2, ctx.canvas.height/2),
      direction: new Vector(Math.random()*10-5, Math.random()*10-5),
      color: ['#2caff0', '#43cd7a', '#a884ff'][Math.floor(Math.random()*3)]
   })
}

/**
* returns a flow field
* @param {object} options - a set of options to adjust the fields
* @param {number} options.fieldSize - the size of each field
* @param {number} options.chaos - amount of chaos
* @param {number} options.duration - amount of iterations to move gravities
* @param {number} options.spinMin - minimum amount to spin
* @param {number} options.spinMax - maximum amount to spin
* @param {number} options.sizeMin - minimum amount to size
* @param {number} options.sizeMax - maximum amount to size
* @param {number} options.speedMin - minimum amount of speed
* @param {number} options.speedMax - maximum amount to speed
*/

function VectorField(options) {

	// Setup the options
	var options = options || {}
	options.width = options.width || 100
	options.height = options.height || 100
	options.fieldSize = options.fieldSize || 10
	options.chaos = options.chaos || 1
	options.duration = options.duration || 5000
	options.spinMin = options.spinMin || 0
	options.spinMax = options.spinMax || 0.5
	options.sizeMin = options.sizeMin || 15
	options.sizeMax = options.sizeMax || 15
	options.speedMin = options.speedMin || 0.1
	options.speedMax = options.speedMax || 5

	// Create the grid of fields
   var fields = []
   for(var x = 0; x <= Math.ceil(options.width/options.fieldSize); x++) {
      fields[x] = []
      for(var y = 0; y <= Math.ceil(options.height/options.fieldSize); y++) {
         fields[x][y] = {
            pos: new Vector(x*zoneSize, y*zoneSize),
            center: new Vector(x*zoneSize+zoneSize/2, y*zoneSize+zoneSize/2),
            direction: new Vector(0, 0),
            size: zoneSize
         }
      }
   }

   var gravities = []
   var count = 1; while(count--) {
      gravities.push({
         pos: new Vector(options.width/2, options.height/2),
         direction: new Vector((Math.random()*6-3), (Math.random()*6-3)),
         size: Math.random()*40 + 15,
         spin: (Math.random()-0.5)*0.1,
         speed: Math.random()*3
      })
   }

   var duration = 30000; while(duration--) {
      for(var gravity of gravities) {
         gravity.pos.add(gravity.direction)
         var direction = Math.atan2(gravity.direction.y, gravity.direction.x)
         var speed = gravity.direction.length()
         direction += gravity.spin || 0.01
         gravity.direction.x = Math.cos(direction)
         gravity.direction.y = Math.sin(direction)
         gravity.direction.scale(gravity.speed)
         if(Math.random() > 0.99) {
            gravity.spin = (Math.random()-0.5)*0.1
            gravity.speed = Math.random()*2 + 1
            gravity.size = Math.random()*40 + 10
         }
         if(gravity.pos.x < 0) gravity.pos.x = ctx.canvas.width-gravity.size
         if(gravity.pos.y < 0) gravity.pos.y = ctx.canvas.height-gravity.size
         if(gravity.pos.x+gravity.size > ctx.canvas.width) gravity.pos.x = 0
         if(gravity.pos.y+gravity.size > ctx.canvas.height) gravity.pos.y = 0



			var x = gravity.pos.x; while(x < gravity.pos.x + gravity.size) {
				var y = gravity.pos.y; while(y < gravity.pos.y + gravity.size) {
					var fieldCol = Math.floor(x / zoneSize)
					var fieldRow = Math.floor(y / zoneSize)
					var field = fields[fieldCol][fieldRow]
					field.direction.x = gravity.direction.x
					field.direction.y = gravity.direction.y

					y += gravity.size/10
				}
				x += gravity.size/10
			}
      }
   }
   return fields
}

// Loop
loop()

function loop() {
	setTimeout(function() { loop() }, 1000/60)
   draw.clear()

   // Particles
   draw.set({ fillStyle: 'rgba(255, 255, 255, 0.1)' })
   for(var particle of particles) {
      draw.set({ fillStyle: particle.color+'33' })
      draw.fillRect(particle.pos.x, particle.pos.y, 3, 3)

      particle.pos.add(particle.direction)
      if(particle.pos.x < 0) particle.pos.x = ctx.canvas.width
      if(particle.pos.y < 0) particle.pos.y = ctx.canvas.height
      if(particle.pos.x > ctx.canvas.width) particle.pos.x = 0
      if(particle.pos.y > ctx.canvas.height) particle.pos.y = 0

      // please hold
      var fieldCol = Math.floor(particle.pos.x / zoneSize)
      var fieldRow = Math.floor(particle.pos.y / zoneSize)
      var field = fields[fieldCol][fieldRow]
      var pull = field.direction.clone().min(particle.direction).scale(0.015)
		// var pull = {
		// 	x: (field.direction.x-particle.direction.x)*0.015,
		// 	y: (field.direction.y-particle.direction.y)*0.015
		// }
      particle.direction.add(pull) // Make this variable
   }
}

// Librairies
function Draw(ctx) {
	this.ctx = ctx
	this.canvas = ctx.canvas

	this.set = function(options) {
		for(var option in options) {
			this.ctx[option] = options[option]
		}
	}
	this.fillRect = function(x, y, width, height) {
		this.ctx.fillRect(x, y, width, height)
	}
	this.strokeRect = function(x, y, width, height) {
		this.ctx.strokeRect(x, y, width, height)
	}
	this.fillCircle = function(x, y, radius) {
		this.ctx.beginPath()
		this.ctx.arc(x, y, radius, 0, Math.PI*2)
		this.ctx.fill()
	}
	this.strokeCircle = function(x, y, radius) {
		this.ctx.beginPath()
		this.ctx.arc(x, y, radius, 0, Math.PI*2)
		this.ctx.stroke()
	}
	this.fillText = function(x, y, text) {
		this.ctx.fillText(text, x, y)
	}
	this.strokeText = function(x, y, text) {
		this.ctx.strokeText(text, x, y)
	}
	this.line = function(x1, y1, x2, y2) {
		this.ctx.beginPath()
		this.ctx.moveTo(x1, y1)
		this.ctx.lineTo(x2, y2)
		this.ctx.stroke()
	}
	this.clear = function() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
	}
}

function Vector(x, y) {
   this.x = x || 0
   this.y = y || 0
   this.add = function(v){ this.x+=v.x; this.y+=v.y; return this }
   this.fastAdd = function(v){ return { x: this.x+v.x, y:this.y+v.y } }
   this.min = function(v){ this.x-=v.x; this.y-=v.y; return this }
   this.fastMin = function(v){ return { x: this.x-v.x, y:this.y-v.y } }
   this.scale = function(s) { this.x*=s; this.y*=s; return this }
	this.fastScale = function(s){ return { x: this.x*s, y:this.y*s } }
   this.clone = function(){ return new Vector(this.x, this.y) }
   this.unit = function() { return this.scale(1/this.length()) }
   this.distance = function(v) { return this.clone().min(v).length() }
   this.direction = function() { return Math.atan2(this.y, this.x) }
   this.dot = function() { return this.x*this.x+this.y*this.y; }
   this.length = function() {
      return Math.sqrt(this.x*this.x + this.y*this.y) }
   this.sizeDir = function(r, d) {
      this.x += Math.cos(d) * r
      this.y += Math.sin(d) * r
      return this }
}
