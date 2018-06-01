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
			offset: { x: undefined, y: undefined },
			legal: { x: undefined, y: undefined }
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

      for(var itemID in this.items) {
			var item = this.items[itemID]
			item.id = itemID
			item.inventory = this

         var itemHTML = document.createElement('item')
			itemHTML.style.width = item.w * (this.size.w / this.slots.w) + 'px'
			itemHTML.style.height = item.h * (this.size.h / this.slots.h) + 'px'
			itemHTML.style.setProperty('--xpos', item.x * (this.size.w / this.slots.w) + 'px')
			itemHTML.style.setProperty('--ypos', item.y * (this.size.h / this.slots.h) + 'px')
			itemHTML.innerHTML = `<icon style="background: ${item.color}"><content>${item.content}</content></icon>`
			// listen
			itemHTML.addEventListener('mousedown', function(e) {
				if(this.inventory.held.html) {
					this.inventory.drop()
				}
				e.target.classList.add('held')
				this.inventory.held.item = this
				this.inventory.held.html = e.target
				this.inventory.held.offset.x = e.offsetX
				this.inventory.held.offset.y = e.offsetY
				this.inventory.held.x = this.inventory.held.item.x * this.inventory.slotSize
				this.inventory.held.y = this.inventory.held.item.y * this.inventory.slotSize
				this.inventory.held.legal.x = this.inventory.held.item.x
				this.inventory.held.legal.y = this.inventory.held.item.y
				console.log('grabbing item', e, this.inventory.held)
			}.bind(item))

         this.html.inventory.appendChild(itemHTML)
      }

		this.html.inventory.addEventListener('mousemove', function(e) {
			if(this.held.html) {
				this.held.x = e.clientX - this.html.inventory.offsetLeft - this.held.offset.x
				this.held.y = e.clientY - this.html.inventory.offsetTop - this.held.offset.y

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

				if(this.isLegal()) {
					console.log('is legal', x, y)
					this.held.legal.x = x / this.slotSize
					this.held.legal.y = y / this.slotSize
				}
			}
		}.bind(this))


		document.body.addEventListener('mouseup', function() {
			this.drop()
		}.bind(this))


		this.drop = function() {
			console.log('dropping item')
			this.held.html.classList.remove('held')
			this.held.item.x = this.held.legal.x
			this.held.item.y = this.held.legal.y
			this.held.html.style.setProperty('--xpos', this.held.legal.x*this.slotSize+'px')
			this.held.html.style.setProperty('--ypos', this.held.legal.y*this.slotSize+'px')
			//this.held.html.style.transform = `translateX(${x + 'px'}) translateY(${y+ 'px'})`;
			this.held.html = undefined
		}

		// going to pump this through an interval/timeout/animationframe
		// this way if the mousemove is called (1000/60)+ times a second it does not overload
		setInterval(function() {
			if(this.held.html) {
				this.held.html.style.setProperty('--xpos', this.held.x+'px')
				this.held.html.style.setProperty('--ypos', this.held.y+'px')
			}
		}.bind(this), 1000/60)
   }

   this.isLegal = function() {
		// stop
		// i stole it from above. relax
		var xover = this.held.x % this.slotSize
		var yover = this.held.y % this.slotSize

		var x = this.held.x + (xover < this.slotSize/2 ? -xover : this.slotSize - xover)
		var y = this.held.y + (yover < this.slotSize/2 ? -yover : this.slotSize - yover)

		// Outside inventory
		if(this.held.item.x*this.slotSize < 0) return false
		if(this.held.item.y*this.slotSize < 0) return false
		if(this.held.item.x*this.slotSize+this.held.item.w*this.slotSize > this.size.w) return false
		if(this.held.item.y*this.slotSize+this.held.item.h*this.slotSize > this.size.h) { console.log('wtf'); return false}

		// Collisions with another
		for(var item of this.items) {
			// physics in a ui
			console.log(item.id, this.held.item.id)
			var collisionParameters = [
				item.id != this.held.item.id,
				this.held.item.x*this.slotSize + this.held.item.w*this.slotSize > item.x*this.slotSize,
				this.held.item.y*this.slotSize + this.held.item.h*this.slotSize > item.y*this.slotSize,
				this.held.item.x*this.slotSize < item.x*this.slotSize + item.w*this.slotSize,
				this.held.item.y*this.slotSize < item.y*this.slotSize + item.h*this.slotSize ]

			// seemed like an interesting manuever
			console.log(collisionParameters)
			if(collisionParameters.every(item => item )) {
				return false
			}
		}

		return true
   }

   this.init(options)
}

new Inventory({
   selector: document.querySelector('inventory'),
	size: { w: 300, h: 300 },
   slots: { w: 4, h: 4 },
   items: [
      { x:0, y:0, w:1, h:1, content: "1x1", color: '#ffd54f' },
      { x:2, y:0, w:1, h:2, content: "1x2", color: '#66bb6a' },
      //{ x:0, y:2, w:1, h:1, content: "1x1", color: '#e53935' },
      //{ x:0, y:3, w:3, h:1, content: "3x1", color: '#9575cd' },
   ]
})
