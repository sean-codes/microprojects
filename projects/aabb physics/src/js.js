console.clear()

var ctx = document.querySelector('canvas').getContext('2d')
ctx.canvas.width = ctx.canvas.getBoundingClientRect().width
ctx.canvas.height = ctx.canvas.getBoundingClientRect().height

var map = {
   grid: { x: 20, y: 20},
   visual: [
      '    X A             ',
      '                    ',
      '      A             ',
      '                    ',
      '                    ',
      '      A   OO      OO',
      '          OOFFFFFFOO',
      'A   _     OOOOOOOOOO',
      '          OOOOOOOOOO',
      '                    ',
      '                    ',
      'A                   ',
		'                    ',
      '                    ',
      'OOOOOOOOOOOOOOOOOOOO',
   ],
   linkTo: {
      X: JSON.stringify({
         type: 'player', width: 20, height: 30, vSpeed: 0, hSpeed: 0
      }),
      O: JSON.stringify({
         type: 'block', height: 20, width:20
      }),
      _: JSON.stringify({
         type: 'platform', height: 20, width:80, vSpeed: -1, hSpeed: 0, pull: []
      }),
      h: JSON.stringify({
         type: 'platform', height: 20, width:80, vSpeed: 0, hSpeed: 1
      }),
      F: JSON.stringify({
         type: 'fire', height: 20, width:20
      }),
      x: JSON.stringify({
         type: 'crate', height: 20, width:20, vSpeed:0, hSpeed:0
      }),
      A: JSON.stringify({
         type: 'box', height: 20, width:40, vSpeed:0, hSpeed: 0, depth: 10
      })
   }
}

var game = {
   ctx: ctx,
   width: ctx.canvas.width,
   height: ctx.canvas.height,
   objects: [],
   keys: [],
   start: function() {
      // load map
      var x = 0; y = 0;
      for(var row of map.visual) {
         var columns = row.split('')
         for(var column of columns) {
            if(map.linkTo[column]) {
               var object = JSON.parse(map.linkTo[column])
               object.x = x
               object.y = y
					object.id = game.objects.length
					object.depth = object.depth || 0
					// find position to draw in right order (more depth = later drawn)
					for(var i = 0; i < game.objects.length; i++)
						if(object.depth > game.objects[i].depth) break

					game.objects.splice(i, 0, object)

					game.objectTypes[object.type].create.call(object)
            }
            x += map.grid.x
         }
         y += map.grid.y
         x = 0
      }

      // listen for keys
      ctx.canvas.addEventListener('keydown', e => game.keys[e.keyCode] = true)
      ctx.canvas.addEventListener('keyup', e => game.keys[e.keyCode] = false)

      this.loopInterval = setInterval(this.loop.bind(this), 1000/100)
   },
   loop: function() {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)

      // Run object steps
		for(var object of this.objects) {
			this.objectTypes[object.type].draw.call(object)

			// draw id
			game.ctx.fillStyle = '#000b'
			game.ctx.textAlign = 'center'
			game.ctx.textBaseline = 'middle'
			game.ctx.fillText(object.id, object.x+object.width/2, object.y+object.height/2)
		}

      for(var object of this.objects) {
         this.objectTypes[object.type].step.call(object)
      }

      var count = 0
   },
	draw: {
		// for testing floor/ceil locking draws
		fillRect: function(x, y, w, h) { game.ctx.fillRect(Math.round(x)+0.5, Math.round(y)+0.5, w-0.5, h-0.5)},
		strokeRect: function(x, y, w, h) { game.ctx.strokeRect(Math.round(x)+0.5, Math.round(y)+0.5, w-1, h-1)}
	},
   objectTypes: {
      player: {
			create: function() {
				this.physics = 'solid'
				game.script.physics.init(this)
			},
         step: function() {
            // the evil math
            var response = game.script.physics.step(this)

            // movement ( this is weird but I kind of like it )
            for(var move of [
               { x:  1, y:  0, down: game.keys[39], require: true },
               { x: -1, y:  0, down: game.keys[37], require: true },
               { x:  0, y: -8, down: game.keys[38], require: response.bottom }
            ]) {
               if(move.require && move.down) {
                  this.hSpeed += move.x;
                  this.vSpeed += move.y
                  // throttling
                  var max = { hSpeed: 3.5, vSpeed: 8 }
                  if(Math.abs(this.hSpeed) > max.hSpeed) this.hSpeed = Math.sign(this.hSpeed) * max.hSpeed
                  if(Math.abs(this.vSpeed) > max.vSpeed) this.vSpeed = Math.sign(this.vSpeed) * max.vSpeed
               }
            }
         },
         draw: function() {
            // draw
            game.ctx.fillStyle = '#465a'
            game.draw.fillRect(this.x, this.y, this.width, this.height)
				game.ctx.strokeStyle = '#000'
				game.draw.strokeRect(this.x, this.y, this.width, this.height)
         }
      },
      block: {
			create: function() {
				this.physics = 'lock'
				game.script.physics.init(this)
			},
         step: function() {
				// game.script.physics.step(this)
         },
         draw: function() {
            // draw
				game.ctx.strokeStyle = '#000'
            game.draw.strokeRect(this.x, this.y, this.width, this.height)
            game.ctx.fillStyle = '#222a'
            game.draw.fillRect(this.x, this.y, this.width, this.height)
         }
      },
		fire: {
			create: function() {
				this.physics = 'solid'
				game.script.physics.init(this)
			},
         step: function() {
            for(var player of game.script.physics.collisions(this, ['player'])) {
               player.other.vSpeed = -10
               setTimeout(function() {
                  player.other.x = 300; player.other.y = 200
               }, 250)
            }
         },
         draw: function() {
            // draw
            game.ctx.fillStyle = '#F22a'
            game.draw.fillRect(this.x, this.y, this.width, this.height)
				game.draw.strokeRect(this.x, this.y, this.width, this.height)
				game.ctx.strokeStyle = '#000'
         }
      },
		box: {
			create: function() {
				this.physics = 'solid'
				this.wall = { cord: 'y', direction: -1 }
				game.script.physics.init(this)
			},
			step: function() {
				game.script.physics.step(this)
			},
			draw: function() {
				// draw
            game.ctx.fillStyle = '#1bca'
            game.draw.fillRect(this.x, this.y, this.width, this.height)
				game.ctx.strokeStyle = '#000'
				game.draw.strokeRect(this.x, this.y, this.width, this.height)
			}
		},
      crate: {
			create: function() {
				this.physics = 'solid'
				game.script.physics.init(this)
			},
         step: function() {
            game.script.physics.step(this)
         },
         draw: function() {
            // draw
            game.ctx.fillStyle = '#960a'
            game.draw.fillRect(this.x, this.y, this.width, this.height)
				game.ctx.strokeStyle = '#000'
				game.draw.strokeRect(this.x, this.y, this.width, this.height)
         }
      },
      platform: {
			create: function() {
				game.script.physics.init(this, 'solid')
			},
         step: function() {
            // more math
            game.script.physics.step(this)
            if(!this.startY) this.startY = this.y
            // if stalled change direction
            if(
               (this.vSpeed && this.lastY == this.y) ||
               (this.hSpeed && this.lastX == this.x) ||
               this.y < this.startY
            ){
               this.vSpeed = -this.vSpeed
               this.hSpeed = -this.hSpeed

					//if(this.vSpeed > 0) setTimeout(function() { clearInterval(game.loopInterval) }, 50)
            }
            this.lastX = this.x
            this.lastY = this.y
         },
         draw: function() {
            // draw
            game.ctx.fillStyle = '#a5aa'
            game.draw.fillRect(this.x, this.y, this.width, this.height)
				game.ctx.strokeStyle = '#000'
				game.draw.strokeRect(this.x, this.y, this.width, this.height)
         }
      }
   },
   script: {
      physics: {
         setting: {
            gravity: { x: 0, y: 5, accel: 0.5 }
         },
			init: function(object) {
				object.physics = object.physics || 'lock'
				object.hSpeed = object.hSpeed || 0
				object.vSpeed = object.vSpeed || 0
				object.bounce = { x: 0, y: 0 }
				object.friction = { x: 0.5, y: 1 }
				object.pull = []
			},
			step: function(object) {
				return this['step_' + object.physics](object)
			},
         step_solid: function(object) {
            this.gravity(object)
            return this.move(object)
         },
         step_lock: function(object) {
            // ( and the axis loop )
				for(var axis of [{ cord: 'x', speed: 'hSpeed', size: 'width'}, { cord: 'y', speed: 'vSpeed', size: 'height'}]) {
					// the one line
					//object[axis.cord] += object[axis.speed]
					this.push([object], axis, object[axis.speed])
            }
				this.pull(object)
         },
			pull: function(object) {
				for(var id in object.pull) {
					var pull = object.pull[id]
					// not moving in the same direction anymore
					if(Math.sign(pull.other[pull.speed]) != Math.sign(object[pull.speed])) continue

					pull.other[pull.cord] += pull.amount
					var pullCollisions = pull.other.physics == 'empty'
						? this.collisions(pull.other, ['lock'])
						: this.collisions(pull.other, ['lock', 'solid'])

					if(pullCollisions.length) {
						pull.other[pull.cord] -= pull.amount
						continue
					}

					this.pull(pull.other)
				}

				object.pull = {}
			},
			push: function(softObjects, axis, speed, transaction=[]) {
				// step 1. move the first object. add to transaction
				for(var collision of softObjects) {
					transaction.push(collision)
					collision[axis.cord] += speed

					// if outside break
					if(collision.x < 0 || collision.x + collision.width > game.width) {
						for(var failed of transaction) failed[cord] -= speed
						return false
					}

					// step 2. check collisions
					var pushedCollisions = this.collisions(collision, ['lock', 'solid', 'empty'])

					if(pushedCollisions.length) {
						// step 3. check collision type
						//var empty =
						var soft = pushedCollisions.some((e) => ['solid', 'empty'].includes(e.other.physics))
						var hard = pushedCollisions.some((e) => ['lock'].includes(e.other.physics))

						// step 4. fail and revert
						if(hard) {
							// revert! we failed!
							for(var failed of transaction) failed[axis.cord] -= speed
							return false
						}

						// step 5. recurse here
						// remove emptys that are not onvery top
						var emptyRemoved = pushedCollisions.reduce((sum, num) => {
								// only push if greater
								var safe = speed < 0
									? (num.other[axis.cord] + num.other[axis.size]) + speed <= collision[axis.cord] - speed
									: (collision[axis.cord] + collision[axis.size]) - speed <= num.other[axis.cord] + speed

								if(safe) {
									//console.log('push')
									sum.push(num.other)
								}
							return sum
						}, [])
						if(!this.push(emptyRemoved, axis, speed, transaction)) {
							// something already killed transaction
							return false
						}
					}
				}
				return true
			},
         move: function(object) {
            var response = {
               x: { collisions: [] },
               y: { collisions: [] },
               bottom: false,
               top: false,
               left: false,
               right: false
            }

				var initial = { vSpeed: object.vSpeed, hSpeed: object.hSpeed }
				var axisList = [
					{ cord: 'x', oCord: 'y', size: 'width', speed: 'hSpeed', oSpeed: 'vSpeed', greater: 'right', lessthan: 'left', direction: Math.sign(object.hSpeed) },
					{ cord: 'y', oCord: 'x', size: 'height', speed: 'vSpeed', oSpeed: 'hSpeed', greater: 'bottom', lessthan: 'top', direction: Math.sign(object.vSpeed)  },
				]


				for(var axis of axisList){
					// move on the axis and check for a collision
	            object[axis.cord] += object[axis.speed]
					var axisCollisions = this.collisions(object, ['lock', 'solid', 'empty'])

					// if there is collision(s)
					if(axisCollisions.length) {
						var depth = 0 // for moving to deepest

						// loop each collision on this axis
						for(var collision of axisCollisions) {
							// for easier reading
							var other = collision.other

							if(other.wall) {
								// location of the walls
								var otherWall = other[axis.cord] + (other.wall.direction > 0 ? other[axis.size] : 0) + initial[axis.speed]
								var objectWall = object[axis.cord] + (other.wall.direction < 0 ? object[axis.size] : 0) - initial[axis.speed]

								// Need all this to be false!
								if(
									   (axis.cord != other.wall.cord) // need to be on same cord
									|| (axis.direction == other.wall.direction) // wall needs to be opposite
									|| (other.wall.direction < 0 ? objectWall > otherWall : objectWall < otherWall) // not already through
								) { continue }
							}

							if(object.wall) {
								// location of the walls
								if(
									   axis.direction == object.wall.direction
									|| axis.cord != object.wall.cord
									|| !(other.physics == 'lock' || other.wall)
									|| (other.wall && other.wall.direction == axis.direction)
								) { continue }
							}

							// This collision is not a drill! Resolve it! :]
							response[axis.cord].collisions.push(collision)

							// More accurate solution. Move to the deepest collision. Reflect
							if(collision.depth[axis.cord] >= depth) {
								depth = collision.depth[axis.cord]
								object[axis.cord] = (object[axis.cord] + object[axis.size]/2) < (other[axis.cord] + other[axis.size]/2)
		                        ? other[axis.cord] - object[axis.size]
		                        : other[axis.cord] + other[axis.size]

								// Reflect / Mirror other speed / Stabalize
								object[axis.speed] = (-initial[axis.speed] * object.bounce[axis.cord]) + (other[axis.speed] * object.bounce[axis.cord])
								// if(Math.abs(object[axis.speed]) < Math.abs(other[axis.speed])) object[axis.speed] = other[axis.speed] // stabalize
								// if(object[axis.speed] < 0 && object[axis.speed] >= -Math.abs(other[axis.speed]) && axis.cord == 'y') object[axis.speed] = 0 // more stable

								// Friction
								object[axis.oSpeed] = initial[axis.oSpeed] * other.friction[axis.oCord]

								// set (top, bottom, left, right) for user usage
								response[axis[axis.direction > 0 ? 'greater' : 'lessthan']] = other
							}

							// if moving in the same direction and faster. request the other pulls us along
							var isGoingSameDirection = Math.sign(initial[axis.speed]) == Math.sign(other[axis.speed])
							var isGoingFaster = Math.abs(initial[axis.speed]) > Math.abs(other[axis.speed])

							if(isGoingSameDirection && isGoingFaster) {
								other.pull[object.id] = { other: object, cord: axis.cord, speed: axis.speed, amount: other[axis.speed] }
							}

							// transfer speed to other
							if(collision.other.physics == 'solid') {
								other[axis.speed] = initial[axis.speed] * other.bounce[axis.cord]
								if(axis.cord == 'x') other[axis.oSpeed] = object[axis.oSpeed] * object.friction[axis.cord] // prevent transfer x from y
							}
						}
	            }
				}

            this.stayInside(object)
            return response
         },
			gravity: function(object) {
            // Gravity
            if(object.vSpeed < this.setting.gravity.y){
               object.vSpeed += this.setting.gravity.accel
            }
         },
         collisions: function(object, typeList) {
            var collisions = []
            for(var other of game.objects) {

               if(object.id == other.id || !typeList.includes(other.physics)) continue

               if(object.x >= other.x + other.width || object.x+object.width <= other.x ||
                  object.y >= other.y + other.height || object.y+object.height <= other.y) continue

               collisions.push({
                  other: other,
                  depth: {
                     x: object.hSpeed > 0 ? (object.x+object.width) - other.x : (other.x+other.width) - object.x,
                     y: object.vSpeed > 0 ? (object.y+object.height) - other.y : (other.y+other.height) - object.y
                  }
               })
            }

            return collisions
         },
         stayInside: function(object) {
            if(object.x < 0 || object.x+object.width > game.width) {
               object.x += object.x < 0 ? -object.x : game.width - (object.x+object.width)
               object.hSpeed *= -1
            }

            if(object.y < -100 || object.y+object.height > game.height) {
               object.y += object.y < 0 ? -object.y : game.height - (object.y+object.height)
               object.vSpeed *= -1
            }
         }
      }
   }
}

game.start()
