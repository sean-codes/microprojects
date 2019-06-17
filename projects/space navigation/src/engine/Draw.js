function Draw(o) {
   this.canvas = o.canvas
   this.ctx = o.canvas.getContext('2d')
   this.width = this.canvas.width
   this.height = this.canvas.height

   this.settings = (o) => {
      for (var oName in o) this.ctx[oName] = o[oName]
   }

   this.clear = () => {
      this.ctx.clearRect(0, 0, this.width, this.height)
   }

   this.circle = (o) => {
      o.set && this.settings(o.set)
      this.ctx.beginPath()
      this.ctx.arc(o.pos.x, o.pos.y, o.radius, 0, Math.PI*2)
      this.ctx.closePath()
      o.fill && this.ctx.fill();
      (o.stroke || !o.fill) && this.ctx.stroke()
   }

   this.rect = (o) => {
      o.set && this.settings(o.set)
      o.fill && this.ctx.fillRect(o.pos.x, o.pos.y, o.width || o.size, o.height || o.size);
      (o.stroke || !o.fill) && this.ctx.strokeRect(o.pos.x, o.pos.y, o.width || o.size, o.height || o.size)
   }

   this.shape = (o) => {
      o.set && this.settings(o.set)
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

   this.line = (o) => {
      o.set && this.settings(o.set)
      this.ctx.beginPath()
      this.ctx.moveTo(o.points[0].x, o.points[0].y)
      this.ctx.lineTo(o.points[1].x, o.points[1].y)
      this.ctx.closePath()
      this.ctx.stroke()
   }

   this.text = (o) => {
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.font = "bold 24px monospace"
      o.set && this.settings(o.set)
      this.ctx.fillText(o.text, o.pos.x, o.pos.y)
   }

   if (o.fullscreen) {
      this.resize = () => {
         this.canvas.height = window.innerHeight
         this.canvas.width = window.innerWidth
         this.width = this.canvas.width
         this.height = this.canvas.height
      }

      window.onresize = this.resize.bind(this)
      this.resize()
   }
}
