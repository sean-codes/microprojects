window.onresize = init
window.onload = init
var roundTime = 2500
var spiralSquish = Math.PI * 1
var spiralWidth = Math.PI * 0.5
var ctx = canvas.getContext('2d')
var interval = setInterval(render, 1000/60)


function init() {
   canvas.width = canvas.clientWidth
   canvas.height = canvas.clientHeight
   render()
}

function render() {
   var currTime = Date.now()
   ctx.clearRect(0, 0, canvas.width, canvas.height)
   var centerX = canvas.width/2
   var centerY = canvas.height/2

   var resolution = canvas.width / 25
   var space = canvas.width / resolution
   var pi2 = Math.PI*2

   for (var x = space/2; x <= canvas.width; x+= space) {
      for (var y = space/2; y <= canvas.height; y+= space) {
         /// uhhhh.......?
         var distanceFromCenter = findDistanceFromCenter(x, y, centerX, centerY)
         var angleOffset = distanceFromCenter / (canvas.width / 1) // adjust later


         // ok sean... angle ratio is something...
         // this is sort of a number 0-1 that the timeing function can use
         // its the initial start time?
         var angle = findAngle(y - centerY, x - centerX)
         var angleRatio = angle / pi2 + angleOffset

         if (angleRatio < 0) angleRatio = 1 + angleRatio
         if (angleRatio > 1) angleRatio = angleRatio - 1

         // now how the heck do we combine with ratio time
         var ratioTime = (currTime % roundTime) / roundTime

         var glow = angleRatio - ratioTime
         if (glow < 0) glow = 1 + glow
         // adjust glow to 0-1-0
         glow = glow < 0.5 ? glow/0.5 : (1-glow) / 0.5

         // okay intersting how do we figure out what step the shape is on?

         var offsetTime = angleRatio * roundTime
         var state = Math.floor(((currTime-offsetTime) % ((roundTime) * 2)) / roundTime)
         var corners = [3, 4, 5, 6, 20][Math.floor(((currTime-offsetTime) % ((roundTime) * 5)) / roundTime)]
         ctx.lineWidth = canvas.width/200
         ctx.fillStyle = ctx.strokeStyle = [
            `rgba(206, 166, 255, ${glow})`,
            `rgba(218, 102, 102, ${glow})`,
         ][state]
         var maxSize = space/2 * 0.8
         var size = maxSize * glow


         // draw
         ctx.beginPath()
         var turn = -pi2*0.25
         var cx = Math.cos(turn) * size
         var cy = Math.sin(turn) * size
         ctx.moveTo(x + cx, y + cy)
         var cornerAngle = pi2/corners
         for (var i = 1; i < corners; i++) {
           var angle = cornerAngle * i
           var cx = Math.cos(angle + turn) * size
           var cy = Math.sin(angle + turn) * size
           ctx.lineTo(x + cx, y + cy)
         }

         ctx.closePath()
         ctx.fill()
      }
   }
}

function findDistanceFromCenter(x, y, centerX, centerY) {
   // c2 = a^2+b^2
   return Math.sqrt(Math.pow(x-centerX, 2) + Math.pow(y-centerY, 2))
}

function findAngle(x, y) {
   return Math.atan2(y, x) + Math.PI
}


function angleDiff(a1, a2) {
   let right = a2 - a1
   if (right < 0) {
      right = Math.PI*2 + right
   }

   let left = a1 - a2
   if (left < 0) {
      left = Math.PI*2 + left
   }

   return right > left ? -left : right
}
