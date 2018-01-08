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

//For Demo only
var links = document.getElementsByClassName('link');
for (var i = 0; i <= links.length; i++) {
   addClass(i);
}function addClass(id) {
   setTimeout(function () {
      if (id > 0) links[id - 1].classList.remove('hover');
      links[id].classList.add('hover');
   }, id * 750);
}