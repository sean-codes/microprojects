// ---------------------------------------------------------------------------//
// ------------------------------| Libraries |--------------------------------//
// ---------------------------------------------------------------------------//
function Engine(o) {
   this.mouse = o.mouse
   this.draw = o.draw
   this.objects = o.objects
   this.math = o.math
   this.init = o.init || function() {}
   this.step = o.step || function() {}
   this.speed = 1000/60
   this.interval = undefined
   this.vars = {}

   this.start = () => {
      this.init(this.vars)
      this.interval = setInterval(() => { this.step(this.vars) }, this.speed)
   }

   this.stop = () => {
      clearInterval(this.interval)
   }
}
