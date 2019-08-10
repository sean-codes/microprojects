console.clear()

// -----------------------------------------------------//
// controller
// -----------------------------------------------------//
var draw3d = new Draw3D(canvas)

var keys = []
canvas.addEventListener('keyup', function(e) { keys[e.keyCode] = false })
canvas.addEventListener('keydown', function(e) { keys[e.keyCode] = true })

var cube = new Cube(0, 0, 300, 40)
var grid = new Grid(0, 20, 300, 400)

// loop
setInterval(function() {
   draw3d.clear()
   draw3d.settings({ strokeStyle: '#555', lineWidth: 0.5 })
   grid.draw()
   draw3d.settings({ strokeStyle: '#5a8', lineWidth: 3 })
   cube.draw()

   if (keys[87]) { draw3d.moveCameraForward(2) } // up
   if (keys[83]) { draw3d.moveCameraForward(-2) } // down
   if (keys[65]) { draw3d.moveCameraSideways(-2) } //right
   if (keys[68]) { draw3d.moveCameraSideways(2) } // left
   if (keys[82]) { draw3d.moveCameraUp(-2) }
   if (keys[70]) { draw3d.moveCameraUp(2) }

   if (keys[39]) { draw3d.cameraYRotation += Math.PI/200 }
   if (keys[37]) { draw3d.cameraYRotation -= Math.PI/200 }
   if (keys[40]) { draw3d.cameraXRotation += Math.PI/200 }
   if (keys[38]) { draw3d.cameraXRotation -= Math.PI/200 }

}, 1000/60)


// -----------------------------------------------------//
// components
// -----------------------------------------------------//
function Grid(x, y, z, size) {
   this.center = new Vector(x, y, z)
   this.size = size
   this.lines = []
   this.space = 10
   this.count = this.size / this.space

   for (var i = 0; i <= this.count; i++) {
      var z = this.center.z - (this.size/2) + (i*(this.size/this.count))
      this.lines.push([
         new Vector(this.center.x-this.size/2, this.center.y, z),
         new Vector(this.center.x+this.size/2, this.center.y, z)
      ])
   }

   for (var i = 0; i <= this.count; i++) {
      var x = this.center.x - (this.size/2) + (i*(this.size/this.count))
      this.lines.push([
         new Vector(x, this.center.y, this.center.z-this.size/2),
         new Vector(x, this.center.y, this.center.z+this.size/2)
      ])
   }

   this.draw = function() {
      for (var line of this.lines) {
         draw3d.line(line)
      }
   }
}

function Cube(x, y, z, size) {
   this.points = [
      new Vector(x-size/2, y-size/2, z-size/2),
      new Vector(x+size/2, y-size/2, z-size/2),
      new Vector(x+size/2, y+size/2, z-size/2),
      new Vector(x-size/2, y+size/2, z-size/2),

      new Vector(x-size/2, y-size/2, z+size/2),
      new Vector(x+size/2, y-size/2, z+size/2),
      new Vector(x+size/2, y+size/2, z+size/2),
      new Vector(x-size/2, y+size/2, z+size/2),
   ]

   this.lines = [
      [this.points[0], this.points[1]],
      [this.points[1], this.points[2]],
      [this.points[2], this.points[3]],
      [this.points[3], this.points[0]],

      [this.points[4], this.points[5]],
      [this.points[5], this.points[6]],
      [this.points[6], this.points[7]],
      [this.points[7], this.points[4]],

      [this.points[4], this.points[0]],
      [this.points[5], this.points[1]],
      [this.points[6], this.points[2]],
      [this.points[7], this.points[3]],
   ]

   this.draw = function() {
      for (var line of this.lines) draw3d.line(line)
      for (var point of this.points) draw3d.point(point)
   }
}

function Draw3D() {
   this.canvas = canvas
   this.ctx = this.canvas.getContext('2d')
   this.canvas.width = canvas.offsetWidth
   this.canvas.height = canvas.offsetHeight
   this.camera = new Vector(12.57, -100, 193.61)
   this.cameraXRotation = 0.69
   this.cameraYRotation = -0.14

   this.origin = new Vector(canvas.width/2, canvas.height/2, 0)
   this.fov = 60

   this.moveCameraForward = function(amount) {
      draw3d.camera.z += Math.cos(this.cameraYRotation) * amount
      draw3d.camera.x += Math.sin(this.cameraYRotation) * amount
   }

   this.moveCameraSideways = function(amount) {
      draw3d.camera.z -= Math.sin(this.cameraYRotation) * amount
      draw3d.camera.x += Math.cos(this.cameraYRotation) * amount
   }

   this.moveCameraUp = function(amount) {
      this.camera.y += amount
   }

   this.point = function(point) {
      return
      var warpedPoint = this.warpAroundCamera(point)
      if (warpedPoint.z <= 0) {
         return
      }

      var pointProjected = this.project(warpedPoint)
      this.ctx.beginPath()
      this.ctx.arc(pointProjected.x, pointProjected.y, 2, 0, Math.PI*2)
      this.ctx.fill()
      this.ctx.stroke()
   }

   this.line = function(points) {
      // was not sure what to call this
      var warpedP1 = this.warpAroundCamera(points[0])
      var warpedP2 = this.warpAroundCamera(points[1])

      // might be criminal
      var fovInRadians = this.fov * (Math.PI/180)
      var screenSize = canvas.width
      var focalLength = (screenSize/2) / Math.tan(fovInRadians / 2)
      var scale = focalLength / (warpedP1.z)

      // left / right trim
      var xTrimP1 = (warpedP1.z * scale)
      var xTrimP2 = (warpedP1.z * scale)

      if (warpedP1.x <= -xTrimP1 && warpedP2.x <= -xTrimP2) return
      if (warpedP1.x >= xTrimP1 && warpedP2.x >= xTrimP2) return

      if (warpedP1.x < -xTrimP1) {
         var outside = -xTrimP1 - warpedP1.x
         var direction = warpedP2.clone().min(warpedP1).unit()
         warpedP1.add(direction.scale(outside * (1/direction.x)))
      }

      if (warpedP2.x < -xTrimP2) {
         var outside = -xTrimP2 - warpedP2.x
         var direction = warpedP1.clone().min(warpedP2).unit()
         warpedP2.add(direction.scale(outside * (1/direction.x)))
      }

      if (warpedP1.x > xTrimP1) {
         var outside = xTrimP1 - warpedP1.x
         var direction = warpedP1.clone().min(warpedP2).unit()
         warpedP1.add(direction.scale(outside * (1/direction.x)))
      }
      if (warpedP2.x > xTrimP2) {
         var outside = xTrimP2 - warpedP2.x
         var direction = warpedP2.clone().min(warpedP1).unit()
         warpedP2.add(direction.scale(outside * (1/direction.x)))
      }

      // top / bottom trim
      var yTrimP1 = (warpedP1.z * scale)
      var yTrimP2 = (warpedP1.z * scale)

      if (warpedP1.y <= -yTrimP1 && warpedP2.y <= -yTrimP2) return
      if (warpedP1.y >= yTrimP1 && warpedP2.y >= yTrimP2) return

      if (warpedP1.y < -yTrimP1) {
         var outside = -yTrimP1 - warpedP1.y
         var direction = warpedP2.clone().min(warpedP1).unit()
         warpedP1.add(direction.scale(outside * (1/direction.y)))
      }

      if (warpedP2.y < -yTrimP2) {
         var outside = -yTrimP2 - warpedP2.y
         var direction = warpedP1.clone().min(warpedP2).unit()
         warpedP2.add(direction.scale(outside * (1/direction.y)))
      }

      if (warpedP1.y > yTrimP1) {
         var outside = yTrimP1 - warpedP1.y
         var direction = warpedP1.clone().min(warpedP2).unit()
         warpedP1.add(direction.scale(outside * (1/direction.y)))
      }

      if (warpedP2.y > yTrimP2) {
         var outside = yTrimP2 - warpedP2.y
         var direction = warpedP2.clone().min(warpedP1).unit()
         warpedP2.add(direction.scale(outside * (1/direction.y)))
      }

      // front / back trim
      var trimTo = 10
      var trimFrom = 500
      if (warpedP1.z <= trimTo && warpedP2.z <= trimTo) return
      if (warpedP1.z >= trimFrom && warpedP2.z >= trimFrom) return

      if(warpedP1.z <= trimTo) {
         var fix = trimTo - warpedP1.z
         var direction = warpedP2.clone().min(warpedP1).unit()
         warpedP1.add(direction.scale(fix * (1/direction.z)))
      }

      if(warpedP2.z <= trimTo) {
         var fix = trimTo - warpedP2.z
         var direction = warpedP1.clone().min(warpedP2).unit()
         warpedP2.add(direction.scale(fix * (1/direction.z)))
      }

      if(warpedP1.z >= trimFrom) {
         var fix = trimFrom - warpedP1.z
         var direction = warpedP2.clone().min(warpedP1).unit()
         warpedP1.add(direction.scale(fix * (1/direction.z)))
      }

      if(warpedP2.z >= trimFrom) {
         var fix = trimFrom - warpedP2.z
         var direction = warpedP1.clone().min(warpedP2).unit()
         warpedP2.add(direction.scale(fix * (1/direction.z)))
      }

      if (warpedP1.z < 0 || warpedP2.z < 0 ) {
         console.log('something is broken!')
      }

      var projectedP1 = this.project(warpedP1)
      var projectedP2 = this.project(warpedP2)

      this.ctx.beginPath()
      this.ctx.moveTo(projectedP1.x, projectedP1.y)
      this.ctx.lineTo(projectedP2.x, projectedP2.y)
      this.ctx.stroke()
   }

   this.warpAroundCamera = function(point) {
      var warpedPoint = point.clone().min(this.camera)

      var savePoint = warpedPoint.clone()
      warpedPoint.x = savePoint.x*Math.cos(this.cameraYRotation) - savePoint.z*Math.sin(this.cameraYRotation)
      warpedPoint.z = savePoint.x*Math.sin(this.cameraYRotation) + savePoint.z*Math.cos(this.cameraYRotation)

      var savePoint = warpedPoint.clone()
      warpedPoint.y = savePoint.y*Math.cos(this.cameraXRotation) - savePoint.z*Math.sin(this.cameraXRotation)
      warpedPoint.z = savePoint.y*Math.sin(this.cameraXRotation) + savePoint.z*Math.cos(this.cameraXRotation)

      return warpedPoint
   }

   this.project = function(warpedPoint) {
      var projectedPoint = warpedPoint.clone()

      // determine focalLength
      var fovInRadians = this.fov * (Math.PI/180)
      var screenSize = canvas.width
      var focalLength = (screenSize/2) / Math.tan(fovInRadians / 2)

      if (projectedPoint.z <= 0) {
         projectedPoint.z = 0.01
         // scale = projectedPoint.z / focalLength
      }

      var scale = focalLength / (projectedPoint.z)
      // point is behind camera. move the z to 0 along its line
      projectedPoint.scale(scale)
      var pointMovedToOrigin = projectedPoint.add(this.origin)
      return pointMovedToOrigin
   }

   this.settings = function(settings) {
      for (var setting in settings) {
         this.ctx[setting] = settings[setting]
      }
   }

   this.clear = function() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
   }

   window.addEventListener('resize', function() {
      this.canvas.width = canvas.offsetWidth
      this.canvas.height = canvas.offsetHeight
      this.origin = new Vector(this.canvas.width/2, this.canvas.height/2, 0)
   }.bind(this))
}

function Vector(x, y, z) {
   this.x = x
   this.y = y
   this.z = z

   this.clone = function() {
      return new Vector(this.x, this.y, this.z)
   }

   this.unit = function() {
      return this.scale(1/this.length())
   }

   this.length = function() {
      return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z)
   }

   this.add = function(v2) {
      this.x += v2.x
      this.y += v2.y
      this.z += v2.z
      
      return this
   }

   this.min = function(v2) {
      this.x -= v2.x
      this.y -= v2.y
      this.z -= v2.z

      return this
   }

   this.scale = function(s) {
      this.x *= s
      this.y *= s
      this.z *= s

      return this
   }

   this.toString = function() {
      var x = Math.round(this.x * 100) / 100
      var y = Math.round(this.y * 100) / 100
      var z = Math.round(this.z * 100) / 100
      return `(${x}, ${y}, ${z})`
   }
}
