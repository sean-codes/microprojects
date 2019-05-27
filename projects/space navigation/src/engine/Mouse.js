function Mouse(o) {
   this.element = o.element
   this.down = false
   this.held = false
   this.up = false

   this.step = () => {
      this.down = false
      this.up = false
   }

   this.element.addEventListener('mousedown', (e) => {
      this.pos = new Vector(e.clientX, e.clientY)
      this.down = true
      this.held = true
   })

   this.element.addEventListener('mouseup', (e) => {
      this.pos = new Vector(e.clientX, e.clientY)
      this.held = false
      this.up = true
   })

   this.element.addEventListener('mousemove', (e) => {
      this.pos = new Vector(e.clientX, e.clientY)
   })

   this.element.addEventListener('mouseout', (e) => {
      this.held = false
      this.up = true
   })
}
