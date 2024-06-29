var canvas = document.querySelector('canvas')
var ctx = canvas.getContext('2d')
var fps = 1000*5

var width = 500
var height = 500
canvas.width = width
canvas.height = height

//---------------------------------------------------------
// start
//---------------------------------------------------------
var engine = new Engine()

// map
var map = `
-------b--
-s--bbbb--
----b-----
----------
-bbbb-----
-b--------
-b--bbbb--
----be----
----bbb---
----------
`.trim().split('\n').map(r => r.split(''))
var space = height/map[0].length

for (var row in map) {
   for (var col in map[row]) {
      var key = map[row][col]
      var object = { b: ObjectBlock, s: ObjectStart, e: ObjectEnd }[key]

      object && engine.add(object, { x: col*space, y: row*space, size: space })
   }
}

engine.loop()

//---------------------------------------------------------
// objects
//---------------------------------------------------------
function ObjectStart(attr) {
   this.x = attr.x
   this.y = attr.y
   this.width = attr.size
   this.height = attr.size

   this.step = function(engine) {
      // not remotely optimized but should be sub 0.25ms (slow)
      var time = performance.now()

      ctx.fillStyle = 'green'
      ctx.fillRect(this.x, this.y, this.width, this.height)

      // pathfinding
      var grid = []
      for (var y = 0; y < height/space; y++) {
         var row = []
         for (var x = 0; x < width/space; x++) {
            var xPos = x*space
            var yPos = y*space
            var object = engine.objects.find(o => o.x == xPos && o.y == yPos)

            row.push({
               x: xPos,
               y: yPos,
               xi: x,
               yi: y,
               type: object?.type,
               checked: false
            })
         }
         grid.push(row)
      }

      var paths = [[{ type: this.type, x: this.x/space, y: this.y/space }]]
      var curPath = paths[0]

      var maxChecks = 20
      var stop = false
      while (maxChecks > 0 && !stop) {
         maxChecks -= 1

         var newPath = []
         for (var cell of curPath) {
            var dirs = [[1, 0], [-1, 0], [0, -1], [0, 1]]
            for (var dir of dirs) {
               var cellX = cell.x
               var cellY = cell.y
               var checkX = cell.x+dir[0]
               var checkY = cell.y+dir[1]
               var checkCell = grid?.[checkY]?.[checkX]

               if (checkCell && !checkCell.checked) {
                  checkCell.checked = true
                  
                  // skip blocks
                  if (checkCell.type == ObjectBlock) continue

                  // stop at end
                  if (checkCell.type == ObjectEnd) stop = true

                  newPath.push({
                     type: checkCell?.type,
                     x: checkX,
                     y: checkY,
                     parent: cell
                  })
               }
            }
         }

         paths.push(newPath)
         curPath = newPath
      }
      

      // draw path
      var steps = paths.length
      var end = paths.pop().find(c => c.type === ObjectEnd)
      while (end.parent) {
         ctx.fillStyle = 'orange'
         ctx.fillRect(end.x*space, end.y*space, space, space)
         end = end.parent

      }

      var timeToComplete = performance.now() - time
      console.log(`Performance | ${steps} steps | ${Math.floor(timeToComplete*100)/100}ms`)

      // draw all
      // for (var iPath in paths) {
      //    var path = paths[iPath]
      //    for (var cell of path) {
      //       ctx.fillStyle = 'green'
      //       ctx.fillRect(cell.x*space, cell.y*space, space, space)
      //       ctx.fillStyle = 'white'
      //       ctx.textAlign = 'center'
      //       ctx.textBaseline = 'middle'
      //       ctx.font = '12px monospace'
      //       ctx.fillText(iPath, cell.x*space+space/2, cell.y*space+space/2)
      //    }
      // }
   }
}

function ObjectEnd(attr) {
   this.x = attr.x
   this.y = attr.y
   this.width = attr.size
   this.height = attr.size

   this.step = function() {
      ctx.fillStyle = 'red'
      ctx.fillRect(this.x, this.y, this.width, this.height)
   }
}

function ObjectBlock(attr) {
   this.x = attr.x
   this.y = attr.y
   this.width = attr.size
   this.height = attr.size

   this.step = function() {
      ctx.fillStyle = 'black'
      ctx.fillRect(this.x, this.y, this.width, this.height)
   }
}

//---------------------------------------------------------
// engine
//---------------------------------------------------------
function Engine() {
   this.objects = []

   this.add = function(obj, attr) {
      var newObject = new obj(attr)
      newObject.type = obj
      this.objects.push(newObject)
   }

   this.loop = function() {
      setTimeout(() => this.loop(), fps)
      ctx.clearRect(0, 0, width, height)
      for (var object of this.objects) {
         object.step(this)
      }
   }
}