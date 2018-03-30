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

class CursorWatch {
   constructor(input, callback) {
      this.input = input
      this.callback = callback
      this.fake = document.createElement('div')
      this.data = { position: 0, lastPosition: -1, x: 0, y: 0 }
      this.listeners = []
      this.listen()
   }

   listen() {
      this.interval = setInterval(() => this.updateCursorPosition(), 1000/15)
      this.input.addEventListener('scroll', () => this.change())
   }

   updateCursorPosition() {
      this.data.position = this.input.selectionStart
      if(this.data.lastPosition != this.data.position) this.change()
      this.data.lastPosition = this.data.position
   }

   change() {
      this.updateFake()
      this.updateCursorXYPosition()
      this.callback && this.callback()
   }

   updateCursorXYPosition() {
      var cursor = this.fake.querySelector('cursor')
      var inputBox = this.input.getBoundingClientRect()
      this.data.x = cursor.offsetLeft - this.input.scrollLeft
      this.data.y = cursor.offsetTop - this.input.scrollTop
   }

   updateFake() {
      this.fake.style.cssText = document.defaultView.getComputedStyle(this.input, "").cssText;
      this.fake.style.left = this.input.offsetLeft + 'px'
      this.fake.style.top = this.input.offsetTop + 'px'
      this.fake.style.pointerEvents = "none"
      this.fake.style.visibility = "hidden"
      this.fake.style.position = "fixed"

      var text = this.input.value.split('')
      text.splice(this.data.position, 0, '<cursor style="display:inline-block">|</cursor>')
      this.fake.innerHTML = text.join('')
      document.body.appendChild(this.fake)
   }
}


if(typeof module != 'undefined'){
   module.exports = CursorWatch;
}
