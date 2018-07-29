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
		'    P     C         ',
		'                    ',
		'          C       BB',
		'B               BBBB',
		'BBBBBBBBBBBBBBBBBBBB',
	],
	link: {
		B: { type: 'block', size: { x: 20, y: 20 } },
		C: { type: 'crate', size: { x: 40, y: 40 } },
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
		for(var object of this.objects){
			this.objectTypes[object.type].draw(object)
			this.ctx.textBaseline = 'middle'
			this.ctx.textAlign = 'center'
			this.ctx.fillStyle = '#000'
			this.draw.fillText(object.id, object.x+object.size.x/2, object.y+object.size.y/2)
		}
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
		fillRect: function(x, y, w, h) { game.ctx.fillRect(Math.round(x), Math.round(y), Math.round(w)+0.5, Math.round(h)+0.5) },
		strokeRect: function(x, y, w, h) { game.ctx.strokeRect(Math.round(x)+0.5, Math.round(y)+0.5,Math.round(w)-1, Math.round(h)-1) },
		fillText: function(text, x, y) { game.ctx.fillText(text, x, y) },
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
				game.script.physics.init(object, {
					type: 'block',
					wall: { cord: 'y', direction: -1 }
				})
			},
			step: function(object) {

			},
			draw: function(object) {
				game.ctx.fillStyle = '#2266ccaa'
				game.draw.fillRect(object.x, object.y, object.size.x, object.size.y)
				game.draw.strokeRect(object.x, object.y, object.size.x, object.size.y)
			}
		},
		crate: {
			create: function(object) {
				game.script.physics.init(object, {
					type: 'ghost',
					wall: { cord: 'y', direction: -1 }
				})
			},
			step: function(object) {

			},
			draw: function(object) {
				game.ctx.fillStyle = '#ff8822aa'
				game.draw.fillRect(object.x, object.y, object.size.x, object.size.y)
				game.draw.strokeRect(object.x, object.y, object.size.x, object.size.y)
			}
		},
		player: {
			create: function(object) {
				game.script.physics.init(object, {
					type: 'ghost',
					wall: { cord: 'y', direction: -1 }
				})
			},
			step: function(object) {
				game.script.physics.air(object)
				game.script.physics.gravity(object)
				game.script.physics.move(object)

				if(object.physics.manifold.bottom) console.log('bottom')

				for(var move of [
					{ x: -1, y: 0, required: game.keys.down[37] },
					{ x: 1, y: 0, required: game.keys.down[39] },
					{ x: 0, y: -14, required: game.keys.down[38] && object.physics.manifold.bottom },
				]) {
					if(move.required) {
						object.physics.speed.y += move.y

						if(Math.abs(object.physics.speed.x + move.x) < 3)
							object.physics.speed.x += move.x
					}
				}
			},
			draw: function(object) {
				game.ctx.fillStyle = '#7766AAaa'
				game.draw.fillRect(object.x, object.y, object.size.x, object.size.y)
				game.draw.strokeRect(object.x, object.y, object.size.x, object.size.y)

				game.draw.fillText(object.physics.speed.x, object.x, object.y-20)
			}
		}
	},
	script: {
		physics: {
			settings: {
				gravity: { x: 0, y: 1, max: { x: 0, y: 5 }},
				air: { x: 0.95, y: 0.95 }
			},
			axisList: [ // Going to use these for extra information
				{ cord: 'x', greater: 'right', lessThan: 'left' },
				{ cord: 'y', greater: 'bottom', lessThan: 'top' }],
			init: function(object, options={}) {
				object.physics = {
					type: options.type || 'solid',
					wall: options.wall,
					speed: { x: 0, y: 0 },
					moved: { x: 0, y: 0 },
					manifold: this.clearManifold
				}
			},
			clearManifold: function(object) {
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
				object.physics.manifold = this.clearManifold()

				for(var axis of this.axisList) {
					var direction = Math.sign(object.physics.speed[axis.cord])
					var depth = Math.round(object.physics.speed[axis.cord])
					object[axis.cord] += depth

					var collisions = game.script.collision.check(object)
					var solidCollision = collisions.some((other) => other.physics.type == 'block')

					if(!solidCollision) {
						// check the walls
						var objectWall = object.physics.speed[axis.cord] > 0
							? object[axis.cord] + object.size[axis.cord]
							: object[axis.cord]

						for(var other of collisions) {
							if(!other.physics.wall || axis.cord != other.physics.wall.cord || direction == other.physics.wall.direction) continue
							otherWall = object.physics.speed[axis.cord] > 0
								? other[axis.cord]
								: other[axis.cord] + other.size[axis.cord]

							solidCollision = object.physics.speed[axis.cord] > 0
								? objectWall > otherWall && (objectWall - depth) <= otherWall
								: objectWall + depth < otherWall

							if(solidCollision) break
						}
					}

					// its over
					if(solidCollision){
						object[axis.cord] -= depth
						lessOrGreater = (object.physics.speed[axis.cord] > 0) ? axis.greater : axis.lessThan
						object.physics.manifold[lessOrGreater] = true
						object.physics.speed[axis.cord] = 0
						continue
					}
				}
			},
			gravity: function(object) {
				for(var axis of this.axisList) {
					//if(Math.abs(object.physics.speed[axis.cord]) < this.settings.gravity.max[axis.cord])
			   	object.physics.speed[axis.cord] += this.settings.gravity[axis.cord]
				}
			},
			air: function(object) {
				for(var axis of this.axisList){
					object.physics.speed[axis.cord] *= this.settings.air[axis.cord]
					if(Math.abs(object.physics.speed[axis.cord]) < 0.01) object.physics.speed[axis.cord] = 0
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
