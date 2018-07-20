console.clear()

var ctx = document.querySelector('canvas').getContext('2d')
ctx.canvas.width = ctx.canvas.getBoundingClientRect().width
ctx.canvas.height = ctx.canvas.getBoundingClientRect().height

var map = {
   grid: { x: 20, y: 20},
   visual: [
      '                    ',
      '                    ',
      '                    ',
      '            O       ',
      '            O       ',
      'x    OO      h    OO',
      'x    OOFFFFFFFFFFFOO',
      '     OOOOOOOOOOOOOOO',
      '_    OOOOOOOOOOOOOOO',
      '                    ',
      '                    ',
      '     X A            ',
      '                x   ',
      '           O  h    O',
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
         type: 'platform', height: 20, width:80, vSpeed: 1, hSpeed: 0, pull: []
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
         type: 'box', height: 40, width:40, vSpeed:0, hSpeed:0
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
					game.objects.push(object)
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

      this.loop = setInterval(this.loop.bind(this), 1000/60)
   },
   loop: function() {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height)

      // Run object steps
      for(var object of this.objects) {
         this.objectTypes[object.type].step.call(object)
      }

      var count = 0
      for(var object of this.objects) {
         this.objectTypes[object.type].draw.call(object)

         // draw id
         game.ctx.fillStyle = '#000b'
         game.ctx.textAlign = 'center'
         game.ctx.textBaseline = 'middle'
         game.ctx.fillText(object.id, object.x+object.width/2, object.y+object.height/2)
      }
   },
	draw: {
		// for testing floor/ceil locking draws
		fillRect: function(x, y, w, h) { game.ctx.fillRect(Math.round(x), Math.round(y), w, h)},
		strokeRect: function(x, y, w, h) { game.ctx.strokeRect(Math.round(x), Math.round(y), w, h)}
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
               { x:  0, y: -10, down: game.keys[38], require: response.bottom }
            ]) {
               if(move.require && move.down) {
                  this.hSpeed += move.x;
                  this.vSpeed += move.y
                  // throttling
                  var max = { hSpeed: 3.5, vSpeed: 10 }
                  if(Math.abs(this.hSpeed) > max.hSpeed) this.hSpeed = Math.sign(this.hSpeed) * max.hSpeed
                  if(Math.abs(this.vSpeed) > max.vSpeed) this.vSpeed = Math.sign(this.vSpeed) * max.vSpeed
               }
            }
         },
         draw: function() {
            // draw
            game.draw.strokeRect(this.x, this.y, this.width, this.height)
            game.ctx.fillStyle = '#465a'
            game.draw.fillRect(this.x, this.y, this.width, this.height)
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
            game.draw.strokeRect(this.x, this.y, this.width, this.height)
            game.ctx.fillStyle = '#F22a'
            game.draw.fillRect(this.x, this.y, this.width, this.height)
         }
      },
		box: {
			create: function() {
				this.physics = 'empty'
				this.wall = { x: 0, y: -1 }
				game.script.physics.init(this)
			},
			step: function() {
				game.script.physics.step(this)
			},
			draw: function() {
				// draw
				game.ctx.strokeRect(this.x, this.y, this.width, this.height)
				game.ctx.fillStyle = '#1bca'
				game.ctx.fillRect(this.x, this.y, this.width, this.height)
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
            game.ctx.strokeRect(this.x, this.y, this.width, this.height)
            game.ctx.fillStyle = '#960a'
            game.ctx.fillRect(this.x, this.y, this.width, this.height)
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
            }
            this.lastX = this.x
            this.lastY = this.y
         },
         draw: function() {
            // draw
            game.ctx.strokeRect(this.x, this.y, this.width, this.height)
            game.ctx.fillStyle = '#a5aa'
            game.ctx.fillRect(this.x, this.y, this.width, this.height)
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
				object.pull = []
			},
			step: function(object) {
				return this['step_' + object.physics](object)
			},
			step_empty: function(object) {
				this.gravity(object)

				var response = { x: [], y: [] }

				// vertical/horizontal
				for(var axis of [{ cord: 'y', speed: 'vSpeed'},{ cord: 'x', speed: 'hSpeed'}]) {
					object[axis.cord] += object[axis.speed]
					response[axis.cord] = this.collisions(object, ['lock', 'solid'])
					if(response[axis.cord].length) {
						object[axis.cord] -= object[axis.speed]
						object[axis.speed] = 0
					}
				}

				return response
			},
         step_solid: function(object) {
            this.gravity(object)
            var response = this.move(object)

				if(response.left || response.right) {
					object.hSpeed = 0
				}

            if(response.top || response.bottom) {
					// match vspeed down
					object.vSpeed = response.y.collisions[0].other.vSpeed
					if(object.vSpeed < 0) object.vSpeed = 0

					// match hspeed
					var target = response.y.collisions[0].other.hSpeed || 0
               var current = object.hSpeed
               object.hSpeed += (target - current) * 0.25
            }

				return response
         },
         step_lock: function(object) {
            // ( and the axis loop )
				for(var axis of [{ cord: 'x', speed: 'hSpeed'}, { cord: 'y', speed: 'vSpeed'}]) {
					// the one line
					this.push([object], axis.cord, object[axis.speed])
            }
				this.pull(object)
         },
			pull: function(object) {
				while(object.pull.length) {
					var pull = object.pull.shift()
					var savePose = pull.other[pull.cord]
					// pull.other[pull.cord] = pull.other[pull.cord]+pull.other[pull.size]/2 <= object[pull.cord]+object[pull.size]/2
					// 	? object[pull.cord] - pull.other[pull.size]
					// 	: object[pull.cord] + object[pull.size]

					pull.other[pull.cord] += pull.speed

					var pullCollisions = this.collisions(pull.other, ['lock', 'solid'])
					if(pullCollisions.length) {
						console.log('failed', pull.other.id, pull.speed)
						pull.other[pull.cord] -= pull.speed
						//pull.other[pull.cord] = savePose
						continue
					}

					this.pull(pull.other)
				}
			},
			push: function(softObjects, cord, speed, transaction=[]) {
				// step 1. move the first object. add to transaction
				for(var collision of softObjects) {
					transaction.push(collision)
					collision[cord] += speed

					// step 2. check collisions
					var softCollisions = this.collisions(collision, ['lock', 'solid'])
					if(collision.x < 0 || collision.x + collision.width > game.width) {
						for(var failed of transaction) failed[cord] -= speed
						break
					}

					if(softCollisions.length) {
						// step 3. check collision type
						var soft = softCollisions.some((e) => ['solid'].includes(e.other.physics))
						var hard = softCollisions.some((e) => ['lock'].includes(e.other.physics))

						// step 4. fail and revert
						if(hard) {
							// revert! we failed!
							for(var failed of transaction) failed[cord] -= speed
							break
						}

						// step 5. recurse here
						this.push(softCollisions.map((e) => e.other), cord, speed, transaction)
					}
				}
			},
         gravity: function(object) {
            // Gravity
            if(object.vSpeed < this.setting.gravity.y){
               object.vSpeed += this.setting.gravity.accel
            }
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

				var axisList = [
					{ cord: 'x', size: 'width', speed: 'hSpeed', greater: 'right', lessthan: 'left' },
					{ cord: 'y', size: 'height', speed: 'vSpeed', greater: 'bottom', lessthan: 'top' },
				]

				for(var axis of axisList){
	            object[axis.cord] += object[axis.speed]
	            response[axis.cord].collisions = this.collisions(object, ['lock', 'solid'])

	            var depth = 0
	            if(response[axis.cord].collisions.length) {
                  for(var collision of response[axis.cord].collisions) {
							// if we are moving in the same direction and collide pull the next step
							var sameDirection = (Math.sign(collision.other[axis.speed]) == Math.sign(object[axis.speed]))
							var goingFaster = Math.abs(object[axis.speed]) > Math.abs(collision.other[axis.speed])
							if(sameDirection && goingFaster){
								collision.other.pull.push({ other: object, cord: axis.cord, dir: axis.speed, speed: collision.other[axis.speed], size: axis.size })
							}
							// console.log(object.pull)
							// clearTimeout(game.loop)
	                  if(collision.depth[axis.cord] > depth) {
	                     depth = collision.depth[axis.cord]
	                     object[axis.cord] = (object[axis.cord] + object[axis.size]/2) < (collision.other[axis.cord] + collision.other[axis.size]/2)
	                        ? collision.other[axis.cord] - object[axis.size]
	                        : collision.other[axis.cord] + collision.other[axis.size]
	                  }

							// transfering speed upwards or left/right
							if(collision.other.physics == 'solid') {
								if(axis.cord == 'x' || (axis.cord == 'y' && object[axis.speed] < 0)) {
									collision.other[axis.speed] = object[axis.speed]
								}
							}

	                  // not using these yet
	                  if(object[axis.cord] + object[axis.size] <= collision.other[axis.cord]) response[axis.greater] = collision
	                  if(collision.other[axis.cord] + collision.other[axis.size] >= object[axis.cord]) response[axis.lessthan] = collision
	               }
	            }
				}

            this.stayInside(object)
            return response
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
