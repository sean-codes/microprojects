var ctx = document.querySelector('canvas').getContext('2d')
var canvas = ctx.canvas
canvas.width = 500
canvas.height = 300
var draw = new Draw(ctx)
var mouse = new Mouse(canvas)

draw.set({
	font: '200px monospace',
	textBaseline: 'middle',
	textAlign: 'center',
	fillStyle: '#45a'
})

draw.strokeText(canvas.width/2, canvas.height/2, 'Demo')
var particles = []
scan(function(points) {
	particles = points
	particles.forEach(function(particle) {
		particle.sx = particle.x
		particle.sy = particle.y
		particle.ax = 0
		particle.ay = 0
	})
	step()
})

function step() {
	draw.clear()
	window.requestAnimationFrame(step)
	particles.forEach(function(particle) {
		var distance = Math.sqrt(Math.pow(particle.y-mouse.y, 2) + Math.pow(particle.x-mouse.x, 2))
		var push = 1/distance * 15

		for(var ax of ['x', 'y']) {
			// Move
			particle[ax] += particle['a'+ax]
			// Move random
			particle['a'+ax] += Math.random() - 0.5
			// Pull to start
			particle['a'+ax] -= Math.sign(particle[ax]-particle['s'+ax])*0.5
			// Dampen
			particle['a'+ax] *= 0.95

			// Push from mouse
			particle['a'+ax] -= Math.sign(mouse[ax]-particle[ax]) * push
		}


		draw.fillCircle(particle.x, particle.y, 4)
	})
}

function scan(done, points, y) {
	var points = typeof points == 'undefined' ? [] : points
	var y = typeof y == 'undefined' ? canvas.height : y
	if(!y) return done(points)

	var x = canvas.width; while(x--) {
		var [r,g,b,alpha] = ctx.getImageData(x, y, 1, 1).data
		if(alpha){
			points.push({ x:x, y:y, r:r, g:g, b:b, a:alpha })
		}
	}

	setTimeout(function() {
		scan(done, points, y-1)
	})
}
// function scan() {
// 	var points = []
// 	var x = canvas.width; while(x--) {
// 		var y = canvas.height; while(y--) {
// 			var [r,g,b,alpha] = ctx.getImageData(x, y, 1, 1).data
// 			if(alpha){
// 				points.push({ x:x, y:y, r:r, g:g, b:b, a:alpha })
// 			}
// 		}
// 	}
// 	return points
// }


function Draw(ctx) {
	this.ctx = ctx
	this.canvas = canvas

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

function Mouse(canvas) {
	this.x = 0
	this.y = 0
	this.canvas = canvas
	this.canvas.addEventListener('mousemove', function(e) {
		this.x = e.offsetX
		this.y = e.offsetY
	}.bind(this))
}
