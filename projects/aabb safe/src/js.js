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
					type: 'block'
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
				game.script.physics.ghost(object)

			},
			draw: function(object) {
				game.ctx.fillStyle = '#ff8822aa'
				game.draw.fillRect(object.x, object.y, object.size.x, object.size.y)
				game.draw.strokeRect(object.x, object.y, object.size.x, object.size.y)

				game.ctx.fillText(object.physics.speed.x, object.x+object.size.x+5, object.y)
			}
		},
		ghostplatform: {
			create: function(object) {
				game.script.physics.init(object, {
					type: 'ghost',
					speed: object.speed,
					wall: { cord: 'y', direction: -1 },
					pinned: true,
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
				game.ctx.fillStyle = '#1155DD99'
				game.draw.fillRect(object.x, object.y, object.size.x, object.size.y)
				game.draw.strokeRect(object.x, object.y, object.size.x, object.size.y)

				game.ctx.fillText(object.physics.speed.x, object.x+object.size.x+5, object.y)
			}
		},
		ladder: {
			create: function(object) {
				game.script.physics.init(object, {
					type: 'ghost'
				})
			},
			step: function(object) {
			},
			draw: function(object) {
				game.ctx.fillStyle = '#ff2222aa'
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
				//game.script.physics.

				var onLadder = object.physics.manifold.list.some(other => other.type == 'ladder')
				if(onLadder) {
					object.physics.skipGravity = true
					object.physics.speed.y = 0
					object.physics.speed.x = 0
				}
				for(var move of [
					{ x: -1, y: 0, required: game.keys.down[37] },
					{ x: 1, y: 0, required: game.keys.down[39] },
					{ x: 0, y: onLadder ? -1 : -14, required: game.keys.down[38] },
					{ x: 0, y: 1, required: game.keys.down[40] },
				]) {
					if(move.required) {
						if(onLadder || object.physics.manifold.bottom) {
							object.physics.speed.y = move.y
						}
						if(move.y > 0) object.physics.fallThrough = true
						if(Math.abs(object.physics.speed.x + move.x) < 3)
							if(move.x) object.physics.speed.x += move.x
					}
				}
				if(object.physics.manifold.crushed) console.log('play crushed')
				// run physics
				game.script.physics.ghost(object)
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
				gravity: { x: 0, y: 1, max: { x: 0, y: 5 }},
				air: { x: 0.95, y: 0.95 },
				accuracy: 0.001
			},
			axisList: [ // Going to use these for extra information
				{ cord: 'x', oCord: 'y', greater: 'right', lessThan: 'left' },
				{ cord: 'y', oCord: 'x', greater: 'bottom', lessThan: 'top' }],
			init: function(object, options={}) {
				object.physics = {
					type: options.type || 'block',
					wall: options.wall,
					gravity: options.gravity || this.settings.gravity,
					speed: options.speed || { x: 0, y: 0 },
					bounce: { x: 1, y: 0.75 },
					friction: { x: 0.8, y: 1 },
					moved: { x: 0, y: 0 },
					skipGravity: false,
					fallThrough: false,
					breakAir: false,
					manifold: this.clearManifold(),
					pull: []
				}
			},
			clearManifold: function(object) {
				return { // im making this up
					list: [],
					top: undefined,
					bottom: undefined,
					left: undefined,
					right: undefined,
					crushed: undefined
				}
			},
			ghost: function(object) {
				game.script.physics.move(object)
				game.script.physics.air(object)
				game.script.physics.gravity(object)
				object.physics.fallThrough = false
				object.physics.skipGravity = false
				object.physics.breakAir = false
			},
			block: function(object) {
				for(var axis of this.axisList) {
					object.physics.moved[axis.cord] = 0
					if(object.physics.speed[axis.cord]) game.script.physics.push(object, axis, object.physics.speed[axis.cord])
				}

				this.pull(object, {x:object.physics.moved.x, y:object.physics.moved.y})
			},
			pull: function(object) {
				var move = object.physics.moved
				if(!move.x && !move.y) return

				while(object.physics.pull.length) {
					var pull = object.physics.pull.shift()
					var other = pull.object

					other.x += move.x
					other.y += move.y
					if(!game.script.collision.check(other).some(other => other.physics.type == 'block')) {
						other.physics.moved.x += move.x
						other.physics.moved.y += move.y
						this.pull(other)
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

				var isABlockOrWallInDirection = (
					object.physics.type == 'block'
					|| (object.physics.wall
						&& object.physics.wall.cord == axis.cord
						&& object.physics.wall.direction == direction)
				)

				if(!solidCollision && !outside && isABlockOrWallInDirection) {
					// attempt to push
					for(var other of collisions) {
						var objectWall = direction > 0
							? object[axis.cord] + object.size[axis.cord]
							: object[axis.cord]

						var otherWall = direction > 0
							? other[axis.cord]
							: other[axis.cord] + other.size[axis.cord]

						// if collision with wall attempt to push
						var shouldPush = direction < 0
							? otherWall - (objectWall - moved) < 0.001 // fp
							: (objectWall - moved) - otherWall < 0.001 // this is clearly a gapping hole sean

						if(shouldPush) {
							// try and push. if it doesnt work it's a ghost doesnt really matter
							var pushed = game.script.physics.push(other, axis, moved)
							if(!pushed && object.physics.type == 'block') {
								other.physics.manifold.crushed = true
								solidCollision = true
							}
						}

						if(solidCollision) break
					}
				}

				if(outside || solidCollision) {
					object[axis.cord] -= moved
					moved = 0
				}

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
						object.physics.manifold.list.push(other)

						var objectWall = direction > 0
							? object[axis.cord] + object.size[axis.cord]
							: object[axis.cord]

						var otherWall = direction > 0
							? other[axis.cord]
							: other[axis.cord] + other.size[axis.cord]

						// if not a block consider skipping
						if(other.physics.type != 'block') {
							// skip no wall / no wall in direction
							if(object.physics.fallThrough) continue
							if(!other.physics.wall) continue // a wall
							if(other.physics.wall.cord != axis.cord) continue // wall on this axis
							if(other.physics.wall.direction == direction) continue // needs to be coming towards
							if(direction > 0 ? (objectWall - moved) - otherWall > 0.001 : objectWall-moved < otherWall) continue //fp :<
						}

						var depth = otherWall - objectWall

						if(Math.abs(depth) - Math.abs(deepest.depth) > 0.001) {
							deepest.other = other
							deepest.depth = depth
						}
					}

					if(deepest.other) {
						// there is something wrong here
						deepest.depth = deepest.depth // evil fp
						object[axis.cord] += deepest.depth
						moved += deepest.depth

						// add collision to manifold
						lessOrGreater = direction > 0 ? axis.greater : axis.lessThan
						object.physics.manifold[lessOrGreater] = true

						// reflect / stabalize here (we will simple ax for now)
						object.physics.speed[axis.cord] = moved * -object.physics.bounce[axis.cord]
						if((Math.abs(object.physics.speed[axis.cord]) - Math.abs(other.physics.moved[axis.cord])*2) < 0.001) {
							object.physics.speed[axis.cord] = 0//-other.physics.speed[axis.cord]*0.01
						}

						// apply friction
						var target = other.physics.moved[axis.oCord]//other.physics.friction[axis.oCord]
						var difference = (object.physics.speed[axis.oCord] - target)
						object.physics.breakAir = true
						object.physics.speed[axis.oCord] -= difference * (1-other.physics.friction[axis.oCord])

						// request pull next to other moved
						var otherHasMoved = deepest.other.physics.moved[axis.cord]
						var otherDirection = Math.sign(otherHasMoved)
						if(otherDirection == direction){ // this is going to bubble
							deepest.other.physics.pull.push({ axis, object, direction })
						}
					}

					object.physics.moved[axis.cord] = moved
				}

				if(!object.physics.moved.x && !object.physics.moved.y) {
					this.air(object)
				}
				// prevent bubbling
				this.pull(object)
			},
			gravity: function(object) {
				if(object.physics.skipGravity) return
				for(var axis of this.axisList) {
					//if(Math.abs(object.physics.speed[axis.cord]) < this.settings.gravity.max[axis.cord])
			   	object.physics.speed[axis.cord] += this.settings.gravity[axis.cord]
				}
			},
			air: function(object) {
				if(object.physics.breakAir) return
				for(var axis of this.axisList){
					// dont run if collisions
					object.physics.speed[axis.cord] *= this.settings.air[axis.cord]
					if(Math.abs(object.physics.speed[axis.cord]) < 0.001) {
						object.physics.speed[axis.cord] = 0
					}
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

					if((object.x + object.size.x) - other.x > 0.001
						&& (other.x + other.size.x) - object.x > 0.001
						&& (object.y + object.size.y) - other.y > 0.001
						&& (other.y + other.size.y) - object.y > 0.001
					) collisions.push(other) // add to collision list
				}

				return collisions
			}
		}
	}
}


game.init()
