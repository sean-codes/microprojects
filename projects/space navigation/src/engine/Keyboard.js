function Keyboard(o) {
   this.element = o.element
   this.map = o.map ? JSON.parse(JSON.stringify(o.map)) : {}
   this.keys = {}


   this.isDown = (key) => {
      // console.log(key, this.map[key], this.keys)
      return this.keys[this.map[key]]
   }

   this.reset = () => {
      this.keys = {}
   }

   this.element.addEventListener('keydown', (e) => {
      console.log(e.keyCode)
      this.keys[e.keyCode] = true
   })

   this.element.addEventListener('keyup', (e) => {
      this.keys[e.keyCode] = false
   })

   this.element.addEventListener('blur', (e) => {
      this.reset()
   })
}
