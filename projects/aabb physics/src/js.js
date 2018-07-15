var ctx = document.querySelector('canvas').getContext('2d')
ctx.canvas.width = ctx.canvas.getBoundingClientRect().width
ctx.canvas.height = ctx.canvas.getBoundingClientRect().height

var pointer = { down: false, pos: { x: 0, y: 0 }, move: { x: 0, y: 0 }}

ctx.canvas.addEventListener('mousedown', function(e) {
   console.log('down')
   console.log(e.layerX, e.layerY)
   pointer.down = true
   pointer.pos = { x: e.layerX, y: e.layerY }
   pointer.move = { x: e.layerX, y: e.layerY }
})

ctx.canvas.addEventListener('mousemove', function(e) {
   pointer.move = { x: e.layerX, y: e.layerY }
})
ctx.canvas.addEventListener('mouseup', function() {
   pointer.down = false

   objects.push({
      id: objects.length,
      size: { w: size, h: size },
      pos: { x: pointer.pos.x-size/2, y:pointer.pos.y-size/2 },
      speed: { x:(pointer.pos.x-pointer.move.x)/10, y:(pointer.pos.y-pointer.move.y)/10 },
      weight: 1,
      name: 'move',
      bounce: 0.25,
		friction: { x: 0.8, y: 1 }
   })
   // create it
   console.log('up')
})
var settings = {
   gravity: { x: 0, y: 2, pull: 0.25 }
}
var objects = []

var size = 20

// create a ground
var x = 0
var y = ctx.canvas.height - size
while(x<ctx.canvas.width){
   objects.push({
      id: objects.length,
      size: { w: size, h: size },
      pos: { x: x, y:y },
      speed: { x:0, y:0 },
      weight: 0,
      name: 'solid',
      bounce: 1,
		friction: { x: 0.8, y: 1 }
   })
   x+=size
}
var x = 0
var y = 0
while(x<ctx.canvas.width){
   objects.push({
      id: objects.length,
      size: { w: size, h: size },
      pos: { x: x, y:y },
      speed: { x:0, y:0 },
      weight: 0,
      name: 'solid',
      bounce: 1,
		friction: { x: 0.8, y: 1 }
   })
   x+=size
}

var x = 0
var y = size
while(y<ctx.canvas.height-size){
   objects.push({
      id: objects.length,
      size: { w: size, h: size },
      pos: { x: x, y:y },
      speed: { x:0, y:0 },
      weight: 0,
      name: 'solid',
      bounce: 1,
		friction: { x: 0.8, y: 1 }
   })
   y+=size
}

var x = ctx.canvas.width-size
var y = size
while(y<ctx.canvas.height-size){
   objects.push({
      id: objects.length,
      size: { w: size, h: size },
      pos: { x: x, y:y },
      speed: { x:0, y:0 },
      weight: 0,
      name: 'solid',
      bounce: 1,
		friction: { x: 0.8, y: 1 }
   })
   y+=size
}

// create a block to collide
// setInterval(() => {
   for(var i = 0; i < 100; i++) {
      objects.push({
         id: objects.length,
         size: { w: size, h: size },
         pos: {
				x: Math.min(Math.random()*ctx.canvas.width+size, ctx.canvas.width-size),
				y: Math.min(Math.random()*ctx.canvas.height+size, ctx.canvas.height-size) },
         speed: { x:2, y:3 },
         weight: 1,
         name: 'move',
         bounce: 0.05,
			friction: { x: 0.8, y: 1 }
      })
   }
// }, 200)

var loop = setInterval(function() {
   ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

   if(pointer.down) {
      ctx.beginPath()
      ctx.arc(pointer.pos.x, pointer.pos.y, 15, 0, Math.PI*2)
      ctx.stroke()

      ctx.beginPath()
      ctx.moveTo(pointer.pos.x, pointer.pos.y)
      ctx.lineTo(pointer.move.x, pointer.move.y)
      ctx.stroke()
   }
   for(var object of objects) {
      ctx.strokeRect(Math.round(object.pos.x), Math.round(object.pos.y), object.size.w, object.size.h)
      // ctx.fillText(Math.round(object.speed.x*100)/100 + ', ' + Math.round(object.speed.y*100)/100, object.pos.x, Math.round(object.pos.y)+10)
      // ctx.fillText( Math.round(object.pos.x*100)/100 + ', ' + Math.round(object.pos.y*100)/100, object.pos.x, Math.round(object.pos.y)+20)
		// ctx.fillText(object.weight, object.pos.x, object.pos.y + 30)
		// ctx.fillText(object.id, object.pos.x, object.pos.y + 40)
      if(object.weight) {
			var gravity = {
				x: Math.sign(settings.gravity.x - object.speed.x) * settings.gravity.pull,
				y: Math.sign(settings.gravity.y - object.speed.y) * settings.gravity.pull
			}

			object.speed.x += gravity.x
			object.speed.y += gravity.y

         //object.speed.x *= 0.98

			keepInsideCanvas(object)
			// global friction
			if(Math.abs(object.speed.x) < 0.001) object.speed.x = 0
			if(Math.abs(object.speed.y) < 0.001) object.speed.y = 0
			//move em
			object.pos.x += object.speed.x
			object.pos.y += object.speed.y
			collision(object)
			object.speed.x *= 0.99
			object.speed.y *= 0.99
      }

      // check for collisions and solve
   }


   // clearInterval(loop)
}, 1000/60)


function collision(object) {
   if(!object.weight) return
   var mostAreaCollision = undefined

   for(var other of objects) {
      if(object.id == other.id) continue

      if(
         (other.pos.x+other.size.w) - object.pos.x < 0 ||
         (object.pos.x+object.size.w) - other.pos.x < 0 ||
         (other.pos.y+other.size.h) - object.pos.y < 0 ||
         (object.pos.y+object.size.h) - other.pos.y < 0 ){ continue }

      var sides = [
         { axis: { x: 1, y: 0 }, depth: (other.pos.x+other.size.w) - object.pos.x },
         { axis: { x:-1, y: 0 }, depth: (object.pos.x+object.size.w) - other.pos.x },
         { axis: { x: 0, y: 1 }, depth: (other.pos.y+other.size.h) - object.pos.y },
         { axis: { x: 0, y:-1 }, depth: (object.pos.y+object.size.h) - other.pos.y }
      ].sort((a, b) => a.depth-b.depth)

      // var smallestCollision = sides.reduce((sum, num) => {
      //    return !sum || num.depth < sum.depth ? num : sum })

      // console.log(thereWasACollision)
      // console.log(smallestCollision)

      //console.log(sides)
      //clearInterval(loop)

      var thereWasACollision = sides[0].depth > 0
      //console.log(sides[0])
      if(thereWasACollision){ //smallestCollision.depth > 0){
         // multiply the two smallest sides to get the area
         var area  = sides[0].depth*sides[1].depth
         //console.log(area)
         if(!mostAreaCollision || area > mostAreaCollision.area) {
            mostAreaCollision = {
               side: sides[0],
               area: area,
               other: other
            }
         }
      }

   }

   if(mostAreaCollision) {
      //console.log('collision', smallestCollision)
      var smallestCollision = mostAreaCollision.side
      var other = mostAreaCollision.other
      //console.log(smallestCollision)
      //clearInterval(loop)

		var totalWeight = object.weight+other.weight
		var avgWeight = totalWeight/2
		var absorb = {
			object: object.weight / totalWeight,
			other: other.weight / totalWeight
		}

      // trade forces or reflec them (dampen here)
		for(var axis of ['x', 'y']){
	      if(smallestCollision.axis[axis]) {
				var objForce = other.weight ? other.speed[axis] : -object.speed[axis]
				var othForce = object.weight ? object.speed[axis] : -other.speed[axis]
				// console.log(axis, object.id, objForce)

	         object.speed[axis] = objForce*object.bounce * (!object.weight ? 0 : 1)
	         other.speed[axis] = othForce*other.bounce * (!other.weight ? 0 : 1)

	         // apply friction ( darn that is not looking to good)
				var frictionAxis = axis == 'x' ? 'y' : 'x'
	         object.speed[frictionAxis] *= other.friction[frictionAxis]
	         other.speed[frictionAxis] *= object.friction[frictionAxis]

				// move out
				object.pos[axis] += smallestCollision.axis[axis]*smallestCollision.depth * (!object.weight ? 0 : 1)
				other.pos[axis] -= smallestCollision.axis[axis]*smallestCollision.depth * (!other.weight ? 0 : 1)
	      }
		}
	}
}

function keepInsideCanvas(object) {
   if(object.pos.x < 0 || object.pos.x+object.size.w > ctx.canvas.width) {
      object.pos.x += object.pos.x < 0 ? -object.pos.x : ctx.canvas.width-(object.pos.x+object.size.w)
      object.speed.x *= -1
   }

   if(object.pos.y < 0 || object.pos.y+object.size.h > ctx.canvas.height) {
      object.pos.y += object.pos.y < 0 ? -object.pos.y : ctx.canvas.width-(object.pos.y+object.size.h)
      object.speed.y *= -1
   }
}
