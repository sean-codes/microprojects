// Autoreload Injected by microprojects
if (!window.frameElement) {
   var lastChange = 0
   var xhttp = new XMLHttpRequest()

   xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
         var data = JSON.parse(this.responseText)

         if(lastChange && data.changed !== lastChange){
            console.log('Changes Detected. Reloading Project...')
            location.reload()
            return
         }

         lastChange = data.changed
         setTimeout(function() {
            xhttp.open("GET", "/microprojects/reload.json", true)
            xhttp.send()
         }, 500)
      }
   }

   xhttp.open("GET", "/microprojects/reload.json", true)
   xhttp.send();
}
