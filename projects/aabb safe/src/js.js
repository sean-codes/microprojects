var game = {
	canvas: document.querySelector('canvas'),
	ctx: document.querySelector('canvas').getContext('2d'),
	width: 0,
	height: 0,
	objects: [],
	interval: undefined,
	init: function() {
		this.width = 400//this.canvas.getBoundingClientRect().width
		this.height = 300//this.canvas.getBoundingClientRect().height
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
		fillRect: function(x, y, w, h) { game.ctx.fillRect(Math.round(x), Math.round(y), Math.round(w)-0.5, Math.round(h)-0.5) },
		strokeRect: function(x, y, w, h) { game.ctx.strokeRect(Math.round(x)+0.5, Math.round(y)+0.5,w-1, h-1) },
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
		platform: {
			create: function(object) {
				game.script.physics.init(object, {
					type: 'block',
					speed: object.speed
				})
			},
			step: function(object) {
				game.script.physics.block(object)

				if(object.physics.moved.x == 0 && object.physics.moved.y == 0) {
					object.physics.speed.x *= -1
					object.physics.speed.y *= -1
				}
			},
			draw: function(object) {
				game.ctx.fillStyle = '#999999aa'
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
				if(object.physics.manifold.crush) console.log('crushed')
				game.script.physics.ghost(object)

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
				game.script.physics.ghost(object)

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

				game.draw.fillText(object.physics.speed.y, object.x, object.y-20)
			}
		}
	},
	script: {
		physics: {
			settings: {
				gravity: { x: 0, y: 0.25, max: { x: 0, y: 5 }},
				air: { x: 0.95, y: 0.95 }
			},
			axisList: [ // Going to use these for extra information
				{ cord: 'x', greater: 'right', lessThan: 'left' },
				{ cord: 'y', greater: 'bottom', lessThan: 'top' }],
			init: function(object, options={}) {
				object.physics = {
					type: options.type || 'solid',
					wall: options.wall,
					speed: options.speed || { x: 0, y: 0 },
					moved: { x: 0, y: 0 },
					manifold: this.clearManifold,
					pull: []
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
			ghost: function(object) {
				game.script.physics.air(object)
				game.script.physics.gravity(object)
				game.script.physics.move(object)
			},
			block: function(object) {
				for(var axis of this.axisList) {
					if(object.physics.speed[axis.cord]) game.script.physics.push(object, axis, object.physics.speed[axis.cord])
				}

				this.pull(object, {x:object.physics.moved.x, y:object.physics.moved.y})
			},
			pull: function(object, move) {
				while(object.physics.pull.length) {
					var pull = object.physics.pull.shift()
					var other = pull.object
					//console.log(`pulling ${object.id} - ${other.id} - ${move.y}`)
					other.x += move.x
					other.y += move.y
					if(!game.script.collision.check(other).some(other => other.physics.type == 'block')) {
						other.physics.moved.x += move.x
						other.physics.moved.y += move.y
						this.pull(other, move)
					} else {
						other.x -= move.x
						other.y -= move.y
					}
				}
			},
			push: function(object, axis, moved) {
				var direction = Math.sign(moved)

				// push the object
				object[axis.cord] += moved

				// check for collisions
				var collisions = game.script.collision.check(object)
				var solidCollision = collisions.some((other) => other.physics.type == 'block')
				var outside = game.script.physics.outside(object)

				//console.log(`attemping to axis=${axis.cord} push=${object.id} amount=${moved} solid=${solidCollision} collisions=${collisions.length}`)
				if(!solidCollision && !outside && (object.physics.type == 'block' || object.physics.wall)) {
					// attempt to push
					for(var other of collisions) {
						var objectWall = direction > 0
							? object[axis.cord] + object.size[axis.cord]
							: object[axis.cord]

						var otherWall = direction > 0
							? other[axis.cord]
							: other[axis.cord] + other.size[axis.cord]

						// if collision with wall attempt to push
						if(direction < 0 ? objectWall-moved >= otherWall : true) {
							// try and push. if it doesnt work it's a ghost doesnt really matter
							solidCollision = !game.script.physics.push(other, axis, moved) && object.physics.type == 'block'
						}

						if(solidCollision) break
					}
				}

				if(outside || solidCollision) {
					object[axis.cord] -= moved
					moved = 0
				}
				if(object.physics.moved.x || object.physics.moved.y) this.pull(object, { x:object.physics.moved.x, y:object.physics.moved.y })
				object.physics.moved[axis.cord] = moved
				return moved
			},
			move: function(object) {
				// reset collision
				object.physics.manifold = this.clearManifold()

				for(var axis of this.axisList) {
					var moved = object.physics.speed[axis.cord]
					var direction = Math.sign(moved)
					object[axis.cord] += moved

					var solidCollision = false
					var collisions = game.script.collision.check(object)
					var deepest = { other: undefined, depth: 0 }

					for(var other of collisions) {
						var objectWall = direction > 0
							? object[axis.cord] + object.size[axis.cord]
							: object[axis.cord]

						var otherWall = direction > 0
							? other[axis.cord]
							: other[axis.cord] + other.size[axis.cord]

						// if not a block consider skipping
						if(other.physics.type != 'block') {
							// skip no wall / no wall in direction
							if(!other.physics.wall) continue // a wall
							if(other.physics.wall.cord != axis.cord) continue // wall on this axis
							if(other.physics.wall.direction == direction) continue // needs to be coming towards
							if(direction > 0 ? objectWall-moved > otherWall : objectWall-moved < otherWall) continue
						}

						var depth = otherWall - objectWall

						if(Math.abs(depth) > Math.abs(deepest.depth)) {
							deepest.other = other
							deepest.depth = depth
						}
					}

					if(deepest.other) {
						// there is something wrong here
						//console.log(`${axis.cord} collision resolution  ${object.id} and ${other.id} (${deepest.depth}) ${object[axis.cord]} ~ ${object[axis.cord] + deepest.depth}`)
						object[axis.cord] += deepest.depth
						moved += deepest.depth

						// add collision to manifold
						lessOrGreater = (object.physics.speed[axis.cord] > 0) ? axis.greater : axis.lessThan
						object.physics.manifold[lessOrGreater] = true

						// reflect / stabalize here (we will simple ax for now)
						object.physics.speed[axis.cord] = 0

						// request pull next to other moved
						var otherHasMoved = deepest.other.physics.moved[axis.cord]
						var otherDirection = Math.sign(otherHasMoved)
						if(otherDirection == direction){ // this is going to bubble
							deepest.other.physics.pull.push({ axis, object, direction })
						}
					}

					object.physics.moved[axis.cord] = moved
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
			},
			outside: function(object) {
				return ( object.x < 0 || object.x+object.size.x > game.width
					|| object.y < 0 || object.y+object.size.y > game.height )
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
