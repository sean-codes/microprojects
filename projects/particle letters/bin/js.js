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

// NOTE: this code is a bit upsidedown

var ctx = document.querySelector('canvas').getContext('2d')
var canvas = ctx.canvas
canvas.width = canvas.getBoundingClientRect().width
canvas.height = canvas.getBoundingClientRect().height

var draw = new Draw(ctx)
var mouse = new Mouse(canvas)

var particles = []
var densityInput = document.getElementById('density')

densityInput.addEventListener('input', function() {
	document.querySelector('[for=density]').innerHTML = 'density ('+densityInput.value+')'
	init()
})

init()
step()

function init() {
	draw.set({
		font: '125px monospace',
		textBaseline: 'middle',
		textAlign: 'center',
		fillStyle: '#FFF'
	})

	draw.clear()
	draw.fillText(canvas.width/2, canvas.height/2, 'INK')
	particles = scan(ctx, densityInput.value)
	for(var particle of particles) {
		particle.sx = particle.x
		particle.sy = particle.y
		particle.ax = Math.random()*25-13
		particle.ay = Math.random()*25-13
	}
}

function step() {
	draw.clear()
	window.requestAnimationFrame(step)
	var move = document.getElementById('move').value
	document.querySelector('[for=move]').innerHTML = 'move ('+move+')'
	var pull = document.getElementById('pull').value
	document.querySelector('[for=pull]').innerHTML = 'pull ('+pull+')'
	var dampen = document.getElementById('dampen').value
	document.querySelector('[for=dampen]').innerHTML = 'dampem ('+dampen+')'

	for(var particle of particles) {
		var distance = Math.sqrt(Math.pow(particle.y-mouse.y, 2) + Math.pow(particle.x-mouse.x, 2))
		var push = 1/distance * 6

		for(var ax of ['x', 'y']) {
			// Move
			particle[ax] += particle['a'+ax]
			// Move random
			particle['a'+ax] += (Math.random() - 0.5)*move
			// Pull to start
			particle['a'+ax] -= Math.sign(particle[ax]-particle['s'+ax])*pull
			// Dampen
			particle['a'+ax] *= dampen
			// Push from mouse
			particle['a'+ax] -= Math.sign(mouse[ax]-particle[ax]) * push
		}

		draw.fillCircle(particle.x, particle.y, 4)
	}
}

function scan(ctx, density) {
	var imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
	var pixels = []
	var rows = ctx.canvas.height/density
	var cols = ctx.canvas.width/density

	for(var row = 0; row < rows; row++) {
		for(var col = 0; col < cols; col++) {
			var pixelX = col*density+density/2
			var pixelY = row*density+density/2

			for(var rp = 0; rp < density; rp++) {
				for(var rc = 0; rc < density; rc++) {
					var pixelID = ((row*density+rp) * ctx.canvas.width + (col*density+rc))*4
					var [r,g,b,alpha] = [
						imageData.data[pixelID],
						imageData.data[pixelID+1],
						imageData.data[pixelID+2],
						imageData.data[pixelID+3]
					]

					if(alpha){
						 pixels.push({ x: pixelX, y: pixelY, info: { r:r, g:g, b:b, alpha:alpha } })
						 rp = density
						 rc = density
					 }
				}
			}
		}
	}
	//console.log('pixels', pixels)
	/*
	for(var i = 0; i < imageData.data.length; i+=4) {
		var x = (i/4) % imageData.width
		var y = Math.floor((i/4)/imageData.width) % imageData.height
		var [r,g,b,alpha] = [imageData.data[i],imageData.data[i+1],imageData.data[i+2], imageData.data[i+3]]

		// Loop all pixels and take the max
		// the block at pixel 0 and density 2 would be [0, 1, 4, 5]
		// Note: if the dpi doesn't line up with the col/row count. 💀
		// Center the pixel between
		//
		//  -------------------
		//  |  0   1   2   3  |
		//  |  4   5   6   7  |
		//  |  8   9  10  11  |
		//  -------------------

		var block = []
		for(var b = 1; b < density; b++) {
			r = Math.max(r, imageData.data[i+b])
			g = Math.max(g, imageData.data[i+b+1])
			b = Math.max(b, imageData.data[i+b+2])
			alpha = Math.max(b, imageData.data[i+b+3])
		}

		if(alpha) {
			pixels.push({ x:x, y:y, r:r, g:g, b:b, a:alpha, i:i })
		}
	}
	*/
	return pixels
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
	this.canvas.addEventListener('mouseleave', function(e) {
		this.x = -100
		this.y = -100
	}.bind(this))
}
