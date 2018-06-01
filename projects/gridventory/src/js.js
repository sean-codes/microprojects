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

      for(var itemID in this.items) {
			var item = this.items[itemID]
			item.id = itemID
			item.inventory = this
         item.html = document.createElement('item')
			item.html.style.width = item.w * (this.size.w / this.slots.w) + 'px'
			item.html.style.height = item.h * (this.size.h / this.slots.h) + 'px'
			item.html.style.setProperty('--xpos', item.x * (this.size.w / this.slots.w) + 'px')
			item.html.style.setProperty('--ypos', item.y * (this.size.h / this.slots.h) + 'px')
			item.html.innerHTML = `<icon style="background: ${item.color}"><content>${item.content}</content></icon>`
			// listen
			item.html.addEventListener('mousedown', function(e) {
				if(this.inventory.held.html) {
					this.inventory.drop()
				}
				this.inventory.html.inventory.classList.add('holding')
				e.target.classList.add('held')
				this.inventory.held.item = this
				this.inventory.held.html = e.target
				this.inventory.held.offset.x = e.offsetX
				this.inventory.held.offset.y = e.offsetY
				this.inventory.held.x = this.inventory.held.item.x * this.inventory.slotSize
				this.inventory.held.y = this.inventory.held.item.y * this.inventory.slotSize
				console.log('grabbing item', e, this.inventory.held)
			}.bind(item))

         this.html.inventory.appendChild(item.html)
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

				x = x / this.slotSize
				y = y / this.slotSize

				if(this.isLegal(this.held.item, {x: x, y: y} )) {
					this.held.item.x = x
					this.held.item.y = y
				}
			}
		}.bind(this))


		document.body.addEventListener('mouseup', function() { this.drop() }.bind(this))
		this.html.inventory.addEventListener('mouseleave', function() { this.drop() }.bind(this))


		this.drop = function() {
			if(!this.held.html) return
			console.log('dropping item')
			this.html.inventory.classList.remove('holding')
			this.held.html.classList.remove('held')
			this.held.item.x = this.held.item.x
			this.held.item.y = this.held.item.y
			this.held.html.style.setProperty('--xpos', this.held.item.x*this.slotSize+'px')
			this.held.html.style.setProperty('--ypos', this.held.item.y*this.slotSize+'px')
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

   this.isLegal = function(item, pos) {
		// stop
		// i stole it from above. relax
		var xover = pos.x % this.slotSize
		var yover = pos.y % this.slotSize

		var x = pos.x + (xover < this.slotSize/2 ? -xover : this.slotSize - xover)
		var y = pos.y + (yover < this.slotSize/2 ? -yover : this.slotSize - yover)

		// Outside inventory
		if(pos.x*this.slotSize < 0) return false
		if(pos.y*this.slotSize < 0) return false
		if(pos.x*this.slotSize+item.w*this.slotSize > this.size.w) return false
		if(pos.y*this.slotSize+item.h*this.slotSize > this.size.h) { console.log('wtf'); return false}

		// Collisions with another
		for(var otherItem of this.items) {
			// physics in a ui
			var collisionParameters = [
				item.id != otherItem.id,
				pos.x*this.slotSize + item.w*this.slotSize > otherItem.x*this.slotSize,
				pos.y*this.slotSize + item.h*this.slotSize > otherItem.y*this.slotSize,
				pos.x*this.slotSize < otherItem.x*this.slotSize + otherItem.w*this.slotSize,
				pos.y*this.slotSize < otherItem.y*this.slotSize + otherItem.h*this.slotSize ]

			// for the <3 of console.log
			// console.log(collisionParameters)
			if(collisionParameters.every(u=>u)) {
				// attempt to nudge out of the way
				var direction = {
					x: pos.x-item.x,
					y: pos.y-item.y
				}

				if(!this.nudge(otherItem, direction)) return false
			}
		}

		return true
   }

	this.nudge = function(item, direction) {
		console.log('nudging: ', item.content, direction)

		if(this.isLegal(item, { x: item.x+direction.x, y: item.y+direction.y })) {
			this.move(item, { x: item.x+direction.x, y: item.y+direction.y })
		}
		return false
	}

	this.move = function(item, pos) {
		// yayayay
		console.log('trying to move')
		item.x = pos.x
		item.y = pos.y
		item.html.style.setProperty('--xpos', pos.x*this.slotSize+'px')
		item.html.style.setProperty('--ypos', pos.y*this.slotSize+'px')
	}

	this.collision = function() {

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
