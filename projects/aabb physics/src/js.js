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
      bounce: 0.9
   })
   // create it
   console.log('up')
})
var settings = {
   gravity: 5
}
var objects = []

var size = 50

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
      bounce: 0.5
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
      bounce: 0.5
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
      bounce: 0.5
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
      bounce: 0.5
   })
   y+=size
}

// create a block to collide
// setInterval(() => {
   for(var i = 0; i < 0; i++) {
      objects.push({
         id: objects.length,
         size: { w: size, h: size },
         pos: {x: Math.random()*ctx.canvas.width, y:Math.random()*ctx.canvas.height },
         speed: { x:2, y:3 },
         weight: 1,
         name: 'move',
         bounce: 0.9
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
      ctx.fillText(Math.round(object.speed.x*100)/100 + ', ' + Math.round(object.speed.y*100)/100, object.pos.x, Math.round(object.pos.y)+10)
      ctx.fillText( Math.round(object.pos.x*100)/100 + ', ' + Math.round(object.pos.y*100)/100, object.pos.x, Math.round(object.pos.y)+20)
      if(object.weight) {
         object.pos.x += object.speed.x
         object.pos.y += object.speed.y

         //if(object.speed.y < settings.gravity) object.speed.y += 0.1
         //object.speed.x *= 0.98
         // object.speed.x *= 0.995
         // object.speed.y *= 0.995
      }

      // check for collisions and solve
      collision(object)
      keepInsideCanvas(object)
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

      // get the total speed of the collision
      var force = {
         x: Math.abs(object.speed.x)+Math.abs(other.speed.x),
         y: Math.abs(object.speed.y)+Math.abs(other.speed.y)
      }

      // get the absorbtion
      var totalWeigth = object.weight+other.weight
      var avgWeight = totalWeight / 2

      var absorb = {
         object: Math.min(object.weight/avgWeight, 1),
         other: Math.min(other.weight/avgWeight, 1)
      }

      console.log(absorb.object, absorb.other)
      // trade forces or reflec them (dampen here)
      if(smallestCollision.axis.x) {
         var collisionDirection = Math.sign(object.speed.x) == Math.sign(other.speed.x) ? 1 : -1

         var objSpeed = force.x * absorb.object * Math.sign(object.speed.x) * collisionDirection
         var othSpeed = force.x * absorb.other * Math.sign(other.speed.x) * collisionDirection
         console.log(objSpeed, othSpeed)
         object.speed.x = objSpeed
         other.speed.x = othSpeed
         // apply friction
         // object.speed.y *= other.bounce
         // other.speed.y *= object.bounce
      }

      if(smallestCollision.axis.y) {
         var collisionDirection = Math.sign(object.speed.y) == Math.sign(other.speed.y) ? 1 : -1

         console.log(collisionDirection)
         var objSpeed = force.y * absorb.object.y * Math.sign(object.speed.y) * collisionDirection
         var othSpeed = force.y * absorb.other.y * Math.sign(other.speed.y) * collisionDirection
         object.speed.y = objSpeed
         other.speed.y = othSpeed
         // apply friction
         // object.speed.x *= other.bounce
         // other.speed.x *= object.bounce
      }

      object.pos.x += (smallestCollision.axis.x * smallestCollision.depth) * absorb.object.x
      object.pos.y += (smallestCollision.axis.y * smallestCollision.depth) * absorb.object.y

      other.pos.x -= (smallestCollision.axis.x * smallestCollision.depth) * absorb.other.x
      other.pos.y -= (smallestCollision.axis.y * smallestCollision.depth) * absorb.other.y
      //console.log(object, other, smallestCollision.axis.y * smallestCollision.depth)
      //clearInterval(loop)

      // get surface area

      // looop collisions or only use the one with most surface area
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
