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

new CSSettings({
   settings: [{
      label: 'perspective',
      style: 'perspective',
      suffix: 'px',
      input: { type: 'range', min: 0, max: 1000, value: 1000 },
      target: document.querySelector('.shape')
   }, {
      label: 'rotate X/Y',
      style: 'transform',
      input: { type: 'grid', min: -100, max: 100, step: 10, valueX: 0, valueY: 0 },
      target: document.querySelector('.cylinder'),
      create: function create() {
         new GridInput({ input: this.html.input });
      },
      value: function value() {
         var value = JSON.parse(this.html.input.value);
         return "rotateX(" + value.y + "deg) rotateY(" + -value.x + "deg)";
      }
   }]
});