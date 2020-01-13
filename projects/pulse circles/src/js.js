window.onresize = function() {
   canvas.width = canvas.clientWidth
   canvas.height = canvas.clientHeight
}

window.onload = () => {
   window.onresize()
   setInterval(() => {
      var ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      var maxSize = canvas.width/20
      ctx.lineWidth = canvas.width / 250

      for (var x = 0; x < canvas.width; x += maxSize) {
         for (var y = 0; y < canvas.height; y += maxSize) {
            var centerX = x + maxSize/2
            var centerY = y + maxSize/2
            var xFromCenter = canvas.width/2 - centerX
            var yFromCenter = canvas.height/2 - centerY
            var angleFromCenter = Math.atan2(xFromCenter, yFromCenter) + Math.PI
            var distanceFromCenter = distancePoints(centerX, centerY, canvas.width/2, canvas.height/2)

            // not sure how this works. i figured as further away. we pulse slower
            // then i punched in a bunch of random guess and this looked ok!
            var pulseTime = 5000 + (distanceFromCenter / 30000000)
            var pulse = Date.now() % pulseTime / pulseTime
            var pulseAngle = Math.PI * 2 * pulse

            var deltaFromPulse = Math.abs(angleDelta(angleFromCenter, pulseAngle))
            var minSize = 0.1
            var closeEnough = canvas.width / 275
            var size = Math.max(minSize, deltaFromPulse < closeEnough ? 1 - deltaFromPulse / closeEnough : minSize)
            hue = 270
            ctx.strokeStyle = `hsla(${hue}, ${size*100}%, 50%, 1)`

            ctx.beginPath(centerX, centerY)
            ctx.arc(centerX, centerY, maxSize/2 * size, 0, Math.PI*2)
            ctx.stroke()
         }
      }
   }, 1000/60)
}

function distancePoints(p1x, p1y, p2x, p2y) {
  const a2 = (p1x - p2x) * (p1x - p2x)
  const b2 = (p1y - p2y) * (p1y - p2y)

  return Math.sqrt(a2 + b2)
}

function angleDelta(a1, a2) {
  let right = a2 - a1; let left = a1 - a2
  if (right < 0) right = Math.PI*2 + right
  if (left < 0) left = Math.PI*2 + left
  return right > left ? -left : right
}
