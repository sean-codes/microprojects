window.onresize = init
window.onload = init
var roundTime = 10000
var startTime = Date.now()
var spiralSquish = Math.PI * 1
var spiralWidth = Math.PI * 0.5
var ctx = canvas.getContext('2d')
var interval = setInterval(render, 1000/60)


function init() {
   canvas.width = canvas.clientWidth
   canvas.height = canvas.clientHeight
   // render()
}

function render() {
   var currTime = Date.now()
   ctx.clearRect(0, 0, canvas.width, canvas.height)
   var centerX = canvas.width/2
   var centerY = canvas.height/2

   var resolution = 20
   var space = canvas.width / resolution
   var pi2 = Math.PI*2

   for (var x = space/2; x < canvas.width; x+= space) {
      for (var y = space/2; y < canvas.height; y+= space) {
         /// uhhhh.......?
         var distanceFromCenter = findDistanceFromCenter(x, y, centerX, centerY)
         var angleOffset = distanceFromCenter / (canvas.width / 1) // adjust later


         // ok sean... angle ratio is something...
         // this is sort of a number 0-1 that the timeing function can use
         // its the initial start time?
         var angle = findAngle(y - centerY, x - centerX)
         var angleRatio = angle / pi2 - angleOffset

         if (angleRatio < 0) angleRatio = 1 + angleRatio

         // now how the heck do we combine with ratio time
         var ratioTime = (currTime % roundTime) / roundTime

         var glow = angleRatio - ratioTime
         if (glow < 0) glow = 1 + glow

         var maxSize = space/2
         var size = space/2

         ctx.fillStyle = `rgba(0, 0, 0, ${glow})`
         // draw
         ctx.beginPath()
         ctx.arc(x, y, size, 0, Math.PI*2)
         ctx.fill()

         // debug
         var dx = Math.cos(angle) * distanceFromCenter
         var dy = Math.sin(angle) * distanceFromCenter
         ctx.fillStyle = 'red'
         ctx.fillRect(centerX + dx, centerY + dy, 5, 5)
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
