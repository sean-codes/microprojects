// Autoreload Injected by microprojects
if (!window.frameElement) {
   var lastChange = 0
   var xhttp = new XMLHttpRequest()

   // find root of project
   var urlSplit = window.location.pathname.split('/')
   var urlRoot = urlSplit.slice(0, urlSplit.indexOf('microprojects') + 1).join('/')
   var reloadLocation = urlRoot + '/reload.json'

   // var reloadFileLocation = window.location.pathname.
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
            xhttp.open("GET", reloadLocation, true)
            xhttp.send()
         }, 500)
      }
   }

   xhttp.open("GET", reloadLocation, true)
   xhttp.send();
}
