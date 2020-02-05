var ctx = canvas.getContext('2d')
setInterval(render, 1000/60)


function render() {
   canvas.width = canvas.clientWidth // clearing with width/height
   canvas.height = canvas.clientHeight // might be illegal

   var currTime = Date.now()
   var roundTime = 2500
   var roundTimeOffset = 1
   var centerX = canvas.width/2
   var centerY = canvas.height/2
   var largestSize = canvas.width > canvas.height ? canvas.width : canvas.height
   var resolution = Math.max(largestSize/75, 30)
   var space = largestSize / resolution
   var maxSize = space/2 * 0.8
   var pi2 = Math.PI*2

   for (var x = space/2; x <= canvas.width; x+= space) {
      for (var y = space/2; y <= canvas.height; y+= space) {
         var distanceFromCenter = Math.sqrt(Math.pow(x-centerX, 2) + Math.pow(y-centerY, 2))
         var angleOffset = distanceFromCenter / (largestSize / roundTimeOffset)
         var angle = Math.atan2(y - centerY, x - centerX) + Math.PI
         var angleRatio = angle / pi2 + angleOffset

         if (angleRatio < 0) angleRatio = 1 + angleRatio
         if (angleRatio > 1) angleRatio = angleRatio - 1

         // overwhelmed
         var ratioTime = (currTime % roundTime) / roundTime
         var offsetTime = (angleRatio * roundTime)
         var state = Math.floor(((currTime-offsetTime) % ((roundTime) * 2)) / roundTime)
         var corners = [3, 4, 5, 6, 20][Math.floor(((currTime-offsetTime) % ((roundTime) * 5)) / roundTime)]

         // draw
         var opacity = angleRatio - ratioTime
         if (opacity < 0) opacity = 1 + opacity
         opacity = opacity < 0.5 ? opacity/0.5 : (1-opacity) / 0.5 // 0-1-0

         ctx.beginPath()
         var turn = -pi2*0.25
         for (var cornerId = 0; cornerId < corners; cornerId++) {
           var angle = pi2/corners * cornerId
           var cx = Math.cos(angle + turn) * (maxSize * opacity)
           var cy = Math.sin(angle + turn) * (maxSize * opacity)
           ctx[!cornerId ? 'moveTo' : 'lineTo'](x + cx, y + cy) // :|
         }

         ctx.closePath()
         ctx.fillStyle = ctx.strokeStyle = [
            `rgba(206, 166, 255, ${opacity})`,
            `rgba(218, 102, 102, ${opacity})`,
         ][state]
         ctx.fill()
      }
   }
}
