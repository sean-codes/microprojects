// Hi! This is very much experimental! Lots of comments and parts laying around!!
var ctx = document.querySelector('canvas').getContext('2d')
ctx.canvas.width = 600
ctx.canvas.height = 300

var draw = new Draw(ctx)

// Make a grid give each a x/y velocity
var zoneSize = 10;

var fields = []
function init() {
	fields = VectorField({
		width: ctx.canvas.width,
		height: ctx.canvas.height,
		fieldSize: 5,
		turn: Math.PI*2 / 4,
		spinMin: -0.05,
		spinMax: 0.05,
		times: [60, 120]
	})
}

init()
ctx.canvas.addEventListener('click', function() {
	init()
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
* @param {number} options.gravities - amount of gravities
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
	options.gravities = options.gravities || 1
	options.duration = options.duration || 15000
	options.spinMin = options.spinMin || -0.05
	options.spinMax = options.spinMax || 0.05
	options.turn = options.turn || 0
	options.sizeMin = options.sizeMin || 10
	options.sizeMax = options.sizeMax || 50
	options.grow = options.grow || 0.03
	options.speedMin = options.speedMin || 2
	options.speedMax = options.speedMax || 2
	options.times = options.times || [90, 120]

	// Create the grid of fields
	this.render = function() {
		var fields = []
		for(var x = 0; x <= Math.ceil(options.width/options.fieldSize); x++) {
			fields[x] = []
			for(var y = 0; y <= Math.ceil(options.height/options.fieldSize); y++) {
				fields[x][y] = new this.Field(x, y)
			}
		}

		var gravities = []
	   var count = options.gravities; while(count--) {
	      gravities.push(new this.Gravity(options))
	   }

	   var duration = options.duration; while(duration--) {
	      for(var gravity of gravities) {
				gravity.move()
				var x = gravity.pos.x; while(x < gravity.pos.x + gravity.size && x > 0 && x < options.width) {
					var y = gravity.pos.y; while(y < gravity.pos.y + gravity.size && y > 0 && y < options.height) {
						var fieldCol = Math.floor(x / zoneSize)
						var fieldRow = Math.floor(y / zoneSize)
						var field = fields[fieldCol][fieldRow]

						field.direction = new Vector(Math.cos(gravity.direction), Math.sin(gravity.direction)).scale(gravity.speed)
						//field.direction.x = gravity.direction.x
						//field.direction.y = gravity.direction.y

						y += gravity.size/10
					}
					x += gravity.size/10
				}
			}
		}

		return fields
	}

	this.Field = function(x, y) {
		this.pos = new Vector(x*zoneSize, y*zoneSize)
		this.center = new Vector(x*zoneSize+zoneSize/2, y*zoneSize+zoneSize/2)
		this.direction = new Vector(0, 0)
		this.size = zoneSize
	}

	this.Gravity = function() {
		this.pos = new Vector(options.width/2, options.height/2)
		this.direction = 0
		this.size= 0

	   this.change = function() {
	      this.spin = Math.random()*(options.spinMax-options.spinMin) + options.spinMin
	      this.speed = Math.random()*(options.speedMax-options.speedMin) + options.speedMin
	      this.direction += options.turn*Math.sign(Math.random()-0.5)
	      this.targetSize = Math.random()*(options.sizeMax-options.sizeMin) + options.sizeMin
	      this.timer = options.times[Math.floor(Math.random()*options.times.length)]
	   }

	   this.change()

	   this.move = function() {
	      this.direction += this.spin
	      this.pos.add(new Vector(Math.cos(this.direction), Math.sin(this.direction)).scale(this.speed))
	      this.size -= (this.size - this.targetSize)*options.grow
	      if(this.pos.x + this.size < 0) this.pos.x = options.width
	      if(this.pos.y + this.size < 0) this.pos.y = options.height
	      if(this.pos.x > options.width) this.pos.x = 0 - this.size
	      if(this.pos.y > options.height) this.pos.y = 0 - this.size

	      if(!this.timer--) {
	         this.change()
	      }
	   }
	}

	return this.render()
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
	console.log("Sean is a maniac who likes fluffy cats")
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
