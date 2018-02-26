var ctx = document.querySelector('canvas').getContext('2d')
var canvas = ctx.canvas
var draw = new Draw(ctx)
monitorResize()

draw.set({
	font: '48px Arial',
	textBaselien('top')
})
draw.text(10, 10, 'hello')

function Draw(ctx) {
	this.ctx = ctx
	this.canvas = canvas

	this.set = function(options) {
		for(var option in options) {
			console.log(option)
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
	this.text = function(x, y, text) {
		this.ctx.fillText(text, x, y)
	}
}

function monitorResize() {
	var resize = function() {
		canvas.width = window.innerWidth
		canvas.height = window.innerHeight
	}

	window.onresize = resize
	resize()
}
