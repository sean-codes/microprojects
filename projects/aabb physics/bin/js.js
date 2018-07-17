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
      ' x          O       ',
      '            O       ',
      ' x   OO           OO',
      '_    OOFFFFFFFFFFFOO',
      '     OOOOOOOOOOOOOOO',
      '     OOOOOOOOOOOOOOO',
      '             OOO    ',
      '             O O    ',
      '      X             ',
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
         type: 'platform', height: 20, width:80, vSpeed: 3, hSpeed: 0
      }),
      h: JSON.stringify({
         type: 'platform', height: 20, width:80, vSpeed: 0, hSpeed: 1
      }),
      F: JSON.stringify({
         type: 'fire', height: 20, width:20
      }),
      x: JSON.stringify({
         type: 'crate', height: 20, width:20, vSpeed:0, hSpeed:0
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
               game.objects.push(object)
            }
            x += map.grid.x
         }
         y += map.grid.y
         x = 0
      }

      // listen for keys
      ctx.canvas.addEventListener('keydown', e => game.keys[e.keyCode] = true)
      ctx.canvas.addEventListener('keyup', e => game.keys[e.keyCode] = false)

      setInterval(this.loop.bind(this), 1000/60)
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
         game.ctx.fillText(count++, object.x+object.width/2, object.y+object.height/2)
      }
   },
   objectTypes: {
      player: {
         step: function() {
            // the evil math
            var response = game.script.physics.player(this)

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
            game.ctx.strokeRect(this.x, this.y, this.width, this.height)
            game.ctx.fillStyle = '#465a'
            game.ctx.fillRect(this.x, this.y, this.width, this.height)
         }
      },
      block: {
         step: function() {

         },
         draw: function() {
            // draw
            game.ctx.strokeRect(this.x, this.y, this.width, this.height)
            game.ctx.fillStyle = '#222a'
            game.ctx.fillRect(this.x, this.y, this.width, this.height)
         }
      },
      fire: {
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
            game.ctx.strokeRect(this.x, this.y, this.width, this.height)
            game.ctx.fillStyle = '#F22a'
            game.ctx.fillRect(this.x, this.y, this.width, this.height)
         }
      },
      crate: {
         step: function() {
            game.script.physics.crate(this)
         },
         draw: function() {
            // draw
            game.ctx.strokeRect(this.x, this.y, this.width, this.height)
            game.ctx.fillStyle = '#960a'
            game.ctx.fillRect(this.x, this.y, this.width, this.height)
         }
      },
      platform: {
         step: function() {
            // more math
            game.script.physics.platform(this)
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
            gravity: { x: 0, y: 5, accel: 1 }
         },
         crate: function(object) {
            this.gravity(object)
            var response = this.move(object)
            if(response.top || response.bottom) {
               //console.log(response.y.collisions.length, response.y.collisions[0].other.type)
               object.vSpeed = (response.y.collisions[0].other.vSpeed || 0) + this.setting.gravity.accel
            }
         },
         player: function(object) {
            this.gravity(object)
            var vSpeed = object.vSpeed
            var hSpeed = object.hSpeed
            var response = this.move(object)

            if(response.top || response.bottom) {
               object.vSpeed = (response.y.collisions[0].other.vSpeed || 0) + this.setting.gravity.accel

               var target = response.y.collisions[0].other.hSpeed || 0
               var current = object.hSpeed

               object.hSpeed += (target - current) * 0.25
            }

            if(response.left || response.right) {
               object.hSpeed = 0
            }

            return response
         },
         platform: function(object) {
            // ( and the axis loop )
				for(var axis of [{ cord: 'x', speed: 'hSpeed'}, { cord: 'y', speed: 'vSpeed'}]) {
					// the one line
					this.push([object], axis.cord, object[axis.speed])
            }
         },
			push: function(softObjects, cord, speed, transaction=[]) {
				// step 1. move the first object. add to transaction
				for(var collision of softObjects) {
					transaction.push(collision)
					collision[cord] += speed

					// step 2. check collisions
					var softCollisions = this.collisions(collision, ['block', 'platform', 'crate', 'player'])

					if(softCollisions.length) {
						// step 3. check collision type
						var soft = softCollisions.some((e) => ['crate', 'player'].includes(e.other.type))
						var hard = softCollisions.some((e) => ['block'].includes(e.other.type))

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


            object.x += object.hSpeed
            response.x.collisions = this.collisions(object, ['block', 'platform', 'player', 'crate'])
            var xDepth = 0
            if(response.x.collisions.length) {
                  for(var collision of response.x.collisions) {
                  if(collision.depth.x > xDepth) {
                     xDepth = collision.depth.x
                     object.x = (object.x + object.width/2) < (collision.other.x + collision.other.width/2)
                        ? collision.other.x - object.width
                        : collision.other.x + collision.other.width
                  }

                  // not using these yet
                  if(object.hSpeed >= 0) response.right = collision
                  if(object.hSpeed <= 0) response.left = collision
               }
            }

            // might be able to merge this with above with an object loop
            object.y += object.vSpeed
            response.y.collisions = this.collisions(object, ['block', 'platform', 'player', 'crate'])
            var yDepth = 0
            if(response.y.collisions.length) {
               for(var collision of response.y.collisions) {
                  if(collision.depth.y > yDepth) {
                     yDepth = collision.depth.y
                     object.y = (object.y + object.height/2) < (collision.other.y + collision.other.height/2)
                        ? collision.other.y - object.height
                        : collision.other.y + collision.other.height
                  }

                  if(object.vSpeed >= 0) response.bottom = collision
                  if(object.vSpeed <= 0) response.top = collision
               }
            }

            this.stayInside(object)
            return response
         },
         collisions: function(object, typeList) {
            var collisions = []
            for(var other of game.objects) {

               if(object == other || !typeList.includes(other.type)) continue

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
