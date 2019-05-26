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

var draw = new Draw({ canvas: canvas, fullscreen: true })

var points = [
   new Vector(0, 0),
   new Vector(10, 0),
   new Vector(10, 0)
]

draw.settings({ fillStyle: 'red' })
draw.shape({ pos: new Vector(0, 0), points: points })



// @sean_codes - render loop
function Scene(o) {
   this.init = o.init || function() {}
   this.step = o.step || function() {}
}

// @sean_codes - micro draw lib
function Draw(o) {
   this.canvas = o.canvas
   this.ctx = o.canvas.getContext('2d')

   this.settings = (o) => {
      for (var oName in o) this.ctx[oName] = o[oName]
   }
   this.circle = (o) => {
      this.ctx.moveTo(o.pos.x, o.pos.y)
      this.ctx.arc(o.pos.x, o.pos.y, o.radius, 0, 6.28)
      o.fill && this.ctx.fill()
      o.stroke || !o.fill && this.ctx.stroke()
   }
   this.rect = (o) => {
      o.fill && this.ctx.fillRect(o.pos.x, o.pos.y, o.width || o.size, o.height || o.size)
      o.stroke || !o.fill && this.ctx.strokeRect(o.pos.x, o.pos.y, o.width || o.size, o.height || o.size)
   }
   this.shape = (o) => {
      var vertices = o.points
      var relative = o.relative || { x: 0, y: 0 }

      this.ctx.beginPath()
      this.ctx.moveTo(relative.x + vertices[0].x, relative.y + vertices[0].y)

      for (var i = 1; i < vertices.length; i++) {
         this.ctx.lineTo( relative.x + vertices[i].x, relative.y + vertices[i].y)
      }

      this.ctx.closePath(relative.x + vertices[0].x, relative.y + vertices[0].y)

      o.fill && this.ctx.fill()
      o.stroke || !o.fill && this.ctx.stroke()
   }

   if (o.fullscreen) {
      this.resize = () => {
         this.canvas.height = window.innerHeight
         this.canvas.width = window.innerWidth
      }

      window.onresize = this.resize.bind(this)
      this.resize()
   }
}

// @sean_codes - micro vector lib
function Vector(x, y) {
   this.x = x || 0
   this.y = y || 0
   this.clone = () =>  new Vector(this.x, this.y)
   this.add = (v) => { this.x+=v.x; this.y+=v.y; return this }
   this.min = (v) => { this.x-=v.x; this.y-=v.y; return this }
   this.scale = (s)  =>{ this.x*=s; this.y*=s; return this }
   this.unit = () => this.scale(1/this.length())
   this.distance = (v) => this.clone().min(v).length()
   this.direction = () => Math.atan2(this.y, this.x)
   this.dot = () => this.x*this.x+this.y*this.y
   this.length = () => Math.sqrt(this.x*this.x + this.y*this.y)
}
