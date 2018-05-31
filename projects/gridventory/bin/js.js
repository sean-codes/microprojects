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
      this.size = options.initialSize

      // HTML
      this.html = {
         inventory: options.selector,
         rows: []
      }

      // Create Ruler
      var ruler = document.createElement('ruler')
      for(var i = 0; i < this.size.w*this.size.h; i++) {
         ruler.appendChild(document.createElement('box'))
      }

      this.html.inventory.appendChild(ruler)

      for(var item of this.items) {
         var itemHTML = document.createElement('item')
         this.html.inventory.appendChild(itemHTML)
      }
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
   initialSize: { w:4, h:4 },
   items: [
      { x:0, y:0, w:1, h:1, content: "3" },
      { x:2, y:0, w:1, h:1, content: "1" }
   ]
})
