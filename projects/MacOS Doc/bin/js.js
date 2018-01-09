"use strict";

// Autoreload Injected by microprojects
if (!window.frameElement) {
   var lastChange = 0;
   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
         var data = JSON.parse(this.responseText);
         if (lastChange && data.changed !== lastChange) {
            window.location = window.location;
            return;
         }
         lastChange = data.changed;
         setTimeout(function () {
            xhttp.open("GET", "../../reload.json", true);
            xhttp.send();
         }, 500);
      }
   };
   xhttp.open("GET", "../../reload.json", true);
   xhttp.send();
}

//For the demo only
setTimeout(function () {
   document.getElementById('downloads').classList.add('demo');
}, 1000);
document.body.addEventListener('click', function () {
   document.getElementById('downloads').classList.remove('demo');
});