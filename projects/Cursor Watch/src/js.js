class CursorWatch {
   constructor(input) {
      this.input = input
      this.fake = document.createElement('div')
      this.data = { position: 0, x: 0, y: 0 }
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
      this.input.addEventListener('keyup', () => { this.change() })
      this.input.addEventListener('keydown', (e) => { if(e.repeat) this.change() })
      this.input.addEventListener('mouseup', () => { this.change() })
      this.input.addEventListener('touchstart', () => { this.change() })

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
      var fakeBox = this.fake.getBoundingClientRect()
      var inputBox = this.input.getBoundingClientRect()

      this.data.x = inputBox.left - this.input.scrollLeft + cursorBox.left - fakeBox.left
      this.data.y = inputBox.top - this.input.scrollTop + cursorBox.top - fakeBox.top
   }

   updateFake() {
      this.fake.style.cssText = document.defaultView.getComputedStyle(this.input, "").cssText;
      this.fake.style.visibility = "hidden"
      this.fake.style.pointerEvents = "none"
      var text = this.input.value.split('')
      text.splice(this.data.position, 0, '<cursor style="display:inline">|</cursor>')
      this.fake.innerHTML = text.join('')
      document.body.appendChild(this.fake)
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
