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

console.log('demo')

function Inventory(options) {

   // Setup Rows and Items
   this.init = function(options) {
      this.items = options.items
      this.size = options.size
		this.slots = options.slots
		this.slotSize = options.size.w / this.slots.w

		this.held = {
			item: undefined,
			html: undefined,
			x: undefined, y: undefined,
			offset: { x: undefined, y: undefined }
		}

      // HTML
      this.html = {
         inventory: options.selector,
         rows: []
      }

      // Create Ruler
      var ruler = document.createElement('ruler')
      for(var i = 0; i < this.slots.w*this.slots.h; i++) {
         ruler.appendChild(document.createElement('box'))
      }

      this.html.inventory.appendChild(ruler)

      for(var item of this.items) {
			item.inventory = this
         var itemHTML = document.createElement('item')
			itemHTML.style.width = item.w * (this.size.w / this.slots.w) + 'px'
			itemHTML.style.height = item.h * (this.size.h / this.slots.h) + 'px'
			itemHTML.style.transform = `translateX(${item.x * (this.size.w / this.slots.w) + 'px'}) translateY(${item.y * (this.size.h / this.slots.h) + 'px'})`
			itemHTML.innerHTML = `<icon style="background: ${item.color}"></icon>`
			itemHTML.addEventListener('mousedown', function(e) {
				e.target.classList.add('held')
				this.inventory.held.item = this
				this.inventory.held.html = e.target
				this.inventory.held.offset.x = e.offsetX
				this.inventory.held.offset.y = e.offsetY
				this.inventory.held.x = this.inventory.held.item.x * this.inventory.slotSize
				this.inventory.held.y = this.inventory.held.item.y * this.inventory.slotSize
				console.log('grabbing item', e, this.inventory.held)
			}.bind(item))

         this.html.inventory.appendChild(itemHTML)
      }

		this.html.inventory.addEventListener('mousemove', function(e) {
			console.log('moving item')
			if(this.held.html) {
				this.held.x = e.clientX - this.html.inventory.offsetLeft - this.held.offset.x
				this.held.y = e.clientY - this.html.inventory.offsetTop - this.held.offset.y
			}
		}.bind(this))

		document.body.addEventListener('mouseup', function() {
			console.log('dropping item')
			// duplicate code again! why not just continue the trend :]
			// cmon I am in the middle of a mission can I please just code?
			// pls proceed <3
			var xover = this.held.x % this.slotSize
			var yover = this.held.y % this.slotSize

			// all over the place but that is a interesting offset nearest slot move
			var x = this.held.x + (xover < this.slotSize/2 ? -xover : this.slotSize - xover)
			var y = this.held.y + (yover < this.slotSize/2 ? -yover : this.slotSize - yover)

			this.held.item.x = x / this.slotSize
			this.held.item.y = y / this.slotSize
			this.held.html.classList.remove('held')
			this.held.html.style.transform = `translateX(${x + 'px'}) translateY(${y+ 'px'})`;
			this.held.html = undefined
		}.bind(this))


		// going to pump this through an interval/timeout/animationframe
		// this way if the mousemove is called (1000/60)+ times a second it does not overload
		setInterval(function() {
			if(this.held.html) {
				this.held.html.style.transform = `translateX(${this.held.x + 'px'}) translateY(${this.held.y + 'px'})`
			}
		}.bind(this), 1000/60)
   }

   this.defragment = function() {

   }

   this.addRow = function(position) {

   }

   this.addItem = function(item) {

   }

   this.init(options)
}

new Inventory({
   selector: document.querySelector('inventory'),
	size: { w: 300, h: 300 },
   slots: { w: 4, h: 4 },
   items: [
      { x:0, y:0, w:1, h:1, content: "3", color: '#ffd54f' },
      { x:2, y:0, w:1, h:2, content: "1", color: '#66bb6a' },
      { x:0, y:2, w:1, h:1, content: "1", color: '#e53935' },
      { x:0, y:3, w:3, h:1, content: "1", color: '#9575cd' },
   ]
})
