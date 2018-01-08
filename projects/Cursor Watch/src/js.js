class CursorWatch {
   constructor(input) {
      this.input = input
      this.fake = document.createElement('div')
      this.data = { position: 0, x: 0, y: 0 }
      this.oldPosition = 0
      this.listeners = []
      this.listen()
   }

   on(type, callback) {
      this.listeners.push({ type: type, callback: callback })
   }

   fire(type) {
      for(var listener of this.listeners) {
         if(listener.type == type) {
            listener.callback(this.data)
         }
      }
   }

   listen() {
      this.interval = setInterval(() => {
         this.updateCursorPosition()
         if(this.oldPosition != this.data.position) {
            this.change()
         }
      }, 1000/30)

      this.input.addEventListener('scroll', () => { this.change() })
   }

   change() {
      this.updateCursorPosition()
      this.updateFake()
      this.updateCursorXYPosition()
      this.fire('change')
   }

   updateCursorPosition() {
      this.data.position = this.input.selectionStart
   }

   updateCursorXYPosition() {
      var cursor = this.fake.querySelector('cursor')
      var cursorBox = cursor.getBoundingClientRect()
      // var fakeBox = this.fake.getBoundingClientRect()
      // var inputBox = this.input.getBoundingClientRect()

      this.data.x = cursor.offsetLeft + this.input.offsetLeft// - this.input.scrollLeft
      this.data.y = cursor.offsetTop + this.input.offsetTop - this.input.scrollTop
   }

   updateFake() {
      this.fake.style.cssText = document.defaultView.getComputedStyle(this.input, "").cssText;
      //this.fake.style.visibility = "hidden"
      var text = this.input.value.split('')
      text.splice(this.data.position, 0, '<cursor style="display:inline-block">|</cursor>')
      this.fake.innerHTML = text.join('')
      document.body.appendChild(this.fake)

      this.fake.scrollTop = this.input.scrollTop
      this.fake.style.left = this.input.offsetLeft + 'px'
      this.fake.style.top = this.input.offsetTop + 'px'
      this.fake.style.pointerEvents = "none"
      this.fake.style.visibility = "hidden"
      this.fake.style.position = "fixed"
   }
}

// User
var textarea = document.querySelector('textarea')
var dataarea = document.querySelector('pre')
var crosshair = document.querySelector('crosshair')

var cursorWatch = new CursorWatch(textarea)
cursorWatch.on('change', function(data) {
   dataarea.innerHTML = JSON.stringify(data, null, '\t')
   crosshair.style.transform = `translateX(${data.x}px) translateY(${data.y}px)`
})
