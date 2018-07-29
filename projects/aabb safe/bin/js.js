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

var map = {
	scale: { x: 20, y: 20 },
	visual: [
		'                    ',
		'                    ',
		'                    ',
		'                    ',
		'                    ',
		'                    ',
		'                    ',
		'                    ',
		'                    ',
		'                    ',
		'    P               ',
		'                    ',
		'                    ',
		'                    ',
		'BBBBBBBBBBBBBBBBBBBB',
	],
	link: {
		B: { type: 'block', size: { x: 20, y: 20 } },
		P: { type: 'player', size: { x: 20, y: 30 } },
	}
}

var game = {
	canvas: document.querySelector('canvas'),
	ctx: document.querySelector('canvas').getContext('2d'),
	width: 0,
	height: 0,
	objects: [],
	interval: undefined,
	init: function() {
		this.width = this.canvas.getBoundingClientRect().width
		this.height = this.canvas.getBoundingClientRect().height
		this.canvas.width = this.width; this.canvas.height = this.height

		this.mapLoad(map)
		this.keys.listen()
		this.interval = setInterval(this.loop.bind(this), 1000/60)
	},
	loop: function() {
		this.ctx.clearRect(0, 0, this.width, this.height)
		for(var object of this.objects) this.objectTypes[object.type].step(object)
		for(var object of this.objects) this.objectTypes[object.type].draw(object)
	},
	keys: {
		down: {},
		reset: function() {
			for(var keyCode in this.down) this.down[keyCode] = false
		},
		listen: function() {
			game.canvas.addEventListener('keydown', function(e) { game.keys.down[e.keyCode] = true })
			game.canvas.addEventListener('keyup', function(e) { game.keys.down[e.keyCode] = false })
			game.canvas.addEventListener('blur', function() { game.keys.reset() })
		}
	},
	draw: {
		fillRect(x, y, w, h) { game.ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w)-0.5, Math.floor(h)-0.5) },
		strokeRect(x, y, w, h) { game.ctx.strokeRect(Math.floor(x)+0.5, Math.floor(y)+0.5,Math.floor(w)-1, Math.floor(h)-1) },
		fillText(text, x, y) { game.ctx.fillText(text, x, y) },
	},
	mapLoad: function(map){
		for(var rowID in map.visual) {
			var row = map.visual[rowID].split('')
			for(var colID in row) {
				var obj = map.link[row[colID]]
				if(obj) {
					clone = JSON.parse(JSON.stringify(obj))
					clone.x = colID * map.scale.x
					clone.y = rowID * map.scale.y
					clone.id = this.objects.length
					this.objectTypes[clone.type].create(clone)
					this.objects.push(clone)
				}
			}
		}
	},
	objectTypes: {
		block: {
			create: function(object) {

			},
			step: function(object) {

			},
			draw: function(object) {
				game.ctx.fillStyle = '#2266ccaa'
				game.draw.fillRect(object.x, object.y, object.size.x, object.size.y)
				game.draw.strokeRect(object.x, object.y, object.size.x, object.size.y)
			}
		},
		player: {
			create: function(object) {
				game.script.physics.init(object)
			},
			step: function(object) {
				game.script.physics.gravity(object)
				game.script.physics.move(object)

				if(object.physics.manifold.bottom) console.log('bottom')
			},
			draw: function(object) {
				game.ctx.fillStyle = '#7766AAaa'
				game.draw.fillRect(object.x, object.y, object.size.x, object.size.y)
				game.draw.strokeRect(object.x, object.y, object.size.x, object.size.y)
			}
		}
	},
	script: {
		physics: {
			settings: {
				gravity: { x: 0, y: 1, max: { x: 0, y: 5 }}
			},
			axisList: [ // Going to use these for extra information
				{ cord: 'x', greater: 'right', lessThan: 'left' },
				{ cord: 'y', greater: 'bottom', lessThan: 'top' }],
			init: function(object) {
				object.physics = {
					speed: { x: 0, y: 0 },
					moved: { x: 0, y: 0 },
					manifold: this.clearManifold
				}
			},
			clearManifold: function() {
				return { // im making this up
					list: [],
					top: undefined,
					bottom: undefined,
					left: undefined,
					right: undefined
				}
			},
			move: function(object) {
				// reset collision
				for(var axis of this.axisList) {
					object[axis.cord] += object.physics.speed[axis.cord]

					// going to use this for depth
					var objectWall = object.physics.speed[axis.cord] > 0
						? object[axis.cord] + object.size[axis.cord]
						: object[axis.cord]

					var collisions = game.script.collision.check(object)
					if(collisions.length){
						object[axis.cord] -= object.physics.speed[axis.cord]

						var other = collisions[0] // going to attempt with a single
						lessOrGreater = (object.physics.speed[axis.cord] > 0) ? axis.greater : axis.lessThan
						object.physics.manifold[lessOrGreater] = other

						object.physics.speed[axis.cord] = 0
					}
				}
			},
			gravity: function(object) {
				for(var axis of this.axisList) {
					if(Math.abs(object.physics.speed[axis.cord]) < this.settings.gravity.max[axis.cord])
				   	object.physics.speed[axis.cord] += this.settings.gravity[axis.cord]
				}
			}
		},
		collision: {
			check: function(object) {
				collisions = []
				for(var other of game.objects) {
					if(other.id == object.id) continue // skip same

					if(object.x + object.size.x > other.x
						&& object.x < other.x + other.size.x
						&& object.y + object.size.y > other.y
						&& object.y < other.y + other.size.y
					) collisions.push(other) // add to collision list
				}

				return collisions
			}
		}
	}
}


game.init()
