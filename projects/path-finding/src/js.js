var width = 500
var height = 500
var canvas = document.querySelector('canvas')
var ctx = canvas.getContext('2d')
canvas.width = width
canvas.height = height

//-----------------------------------------------------------
// Objects
//-----------------------------------------------------------
class ObjectBase {
   create({ x, y, size }) {
      this.x = x
      this.y = y
      this.size = size
   }

   draw() {}
}

class ObjectGrid {
   draw() {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'

      var size = width / 10
      for (var y = 0; y < height; y += size) {
         ctx.beginPath()
         ctx.moveTo(0, y + 0.5)
         ctx.lineTo(width, y + 0.5)
         ctx.stroke()
      }

      for (var x = 0; x < width; x += size) {
         ctx.beginPath()
         ctx.moveTo(x + 0.5, 0)
         ctx.lineTo(x + 0.5, height)
         ctx.stroke()
      }
   }
}

class ObjectBlock extends ObjectBase {
   draw() {
      ctx.fillStyle = '#000'
      ctx.fillRect(this.x, this.y, this.size, this.size)
   }
}

class ObjectStart extends ObjectBase {
   draw() {
      ctx.fillStyle = '#F22'
      ctx.fillRect(this.x, this.y, this.size, this.size)

      // find end
      // var endObject = objects.find(o => o.constructor === ObjectEnd)
      // var sx = this.x + this.size/2
      // var sy = this.y + this.size/2
      // var ex = endObject.x + endObject.size/2
      // var ey = endObject.y + endObject.size/2

      // ctx.strokeStyle = 'rgba(0, 0, 0, 1)'
      // ctx.beginPath()
      // ctx.moveTo(sx, sy)
      // ctx.lineTo(ex, ey)
      // ctx.stroke()

      // loop
      var cols = width/this.size
      var rows = height/this.size
      var graph = {
         nodes: [],
         size: this.size,
         width: width,
         height: height,
         cols,
         rows,
      }

      for (var y = 0; y < rows; y++) {
         for (var x = 0; x < cols; x++) {
            var i = y*cols + x
            var mx = x * graph.size
            var my = y * graph.size            

            graph.nodes.push({ 
               x, 
               y,
               mx,
               my,
               i,
               object: objects.find(o => o.x == mx && o.y === my)
            })
         }
      }

      function getNodeIndexFromXY(graph, x, y) {
         var cols = graph.cols
         var rows = graph.rows
         var ix = x / graph.size
         var iy = y / graph.size
         var i = iy*cols + ix

         return i
      }


      function cursePasses(graph, x, y) {
         var i = getNodeIndexFromXY(graph, x, y)
         // console.log(graph, i)
         var parentNode = graph.nodes[i]
         var dirs = [[1,0], [0,1], [-1,0], [0,-1]]

         // multi passing
         var checked = [parentNode]
         var passes = [
            [{node: parentNode, parent: null}]
         ]

         // single pass
         var curPass = passes[0]

         var donePassing = false
         var maxPass = 100

         // single node
         while (maxPass > 0 && !donePassing) {
            maxPass -= 1
            var nextPass = []

            for (var nodeData of curPass) {
               var node = nodeData.node
               for (var dir of dirs) {

                  var cx = node.x*graph.size + dir[0]*graph.size
                  var cy = node.y*graph.size + dir[1]*graph.size

                  if (cx < 0 || cx > (graph.width - graph.size)) continue
                  if (cy < 0 || cy > (graph.height - graph.size)) continue

                  var ic = getNodeIndexFromXY(graph, cx, cy)

                  var fnode = graph.nodes[ic]
                  if (!fnode) continue
                  if (checked.find(n => fnode.i === n.i)) {
                     continue
                  }
                  if (fnode?.object?.constructor === ObjectBlock) {
                     continue
                  }

                  if (fnode?.object?.constructor === ObjectEnd) {
                     donePassing = true
                  }


                  checked.push(fnode)
                  nextPass.push({ node: fnode, parent: nodeData })
               }
            }

            passes.push(nextPass)
            if (nextPass.length == 0) break
            curPass = nextPass
         }

         return passes
      }

      // player node
      var passes = cursePasses(graph, this.x, this.y)
      console.log(passes)


      // draw path
      
      var startNode = passes[passes.length-1].find(n => n.node?.object?.constructor === ObjectEnd)
      console.log(startNode)
      var parent = startNode.parent

      var passI = 0
      while (parent) {
         var node = parent.node
         var x = node.x * this.size
         var y = node.y * this.size
         ctx.fillStyle = `rgba(${255 - passI * 30}, 0, 0, 1)`
         ctx.fillRect(x+1, y+1, graph.size-2, graph.size-2)
         ctx.font = '12px monospace'
         ctx.textAlign = 'center'
         ctx.textBaseline = 'middle'
         ctx.fillStyle = 'white'

         parent = parent.parent
         passI += 1
      }

      // draw pass result (naive)
      // var passI = 0
      // for (var pass of passes) {
      //    passI += 1

      //    for (var nodeData of pass) {
      //       var node = nodeData.node
      //       var x = node.x * this.size
      //       var y = node.y * this.size
      //       ctx.fillStyle = `rgba(${255 - passI * 30}, 0, 0, 1)`
      //       ctx.fillRect(x+1, y+1, this.size-2, this.size-2)
      //       ctx.font = '12px monospace'
      //       ctx.textAlign = 'center'
      //       ctx.textBaseline = 'middle'
      //       ctx.fillStyle = 'white'


      //       if (node?.object?.constructor === ObjectStart) {
      //          ctx.fillText('start', x+this.size/2, y+this.size/2)

      //       } else if (node?.object?.constructor === ObjectEnd) {
      //          ctx.fillText('end', x+this.size/2, y+this.size/2)
      //       } else {
      //          ctx.fillText(passI, x+this.size/2, y+this.size/2)
      //       }
      //    }
      // }
   }
}

class ObjectEnd extends ObjectBase {
   draw() {
      ctx.fillStyle = 'teal' 
      ctx.fillRect(this.x, this.y, this.size, this.size)
   }
} 

//-----------------------------------------------------------
// Engine kind of
//-----------------------------------------------------------
var objects = []
objects.push(new ObjectGrid())

loadMap(`
----------
t---------
xxxxxx----
o----x----
----------
xxxxxx----
----------
----------
----------
----------
`)

loop()

function loop() {
   setTimeout(loop, 5000/1)
   ctx.clearRect(0, 0, width, height)

   for (var object of objects) {
      object.draw()
   }
}



//-----------------------------------------------------------
// Load map
//-----------------------------------------------------------
function loadMap(map) {
   var mapArr = map.split('\n').filter(l => l)
   // console.log('generating map', map, mapArr)
   var mapRows = mapArr.length
   var mapCols = mapArr[0].length
   var size = width / mapRows
   for (var y = 0; y < mapCols; y++) {
      for (var x = 0; x < mapRows; x++) {
         var code = mapArr[y][x]
         if (code == '-') continue

         var xPos = x * size
         var yPos = y * size

         if (code == 'x') { 
            var newObject = new ObjectBlock()
            newObject.create({x: xPos, y: yPos, size: size })
            objects.push(newObject)
         }

         if (code == 'o') { 
            var newObject = new ObjectStart()
            newObject.create({x: xPos, y: yPos, size: size })
            objects.push(newObject)
         }

         if (code == 't') {
            var newObject = new ObjectEnd()
            newObject.create({x: xPos, y: yPos, size: size })
            objects.push(newObject)
         }
      }
   }
}