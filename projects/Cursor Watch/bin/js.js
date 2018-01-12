"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var CursorWatch = function () {
   function CursorWatch(input, callback) {
      _classCallCheck(this, CursorWatch);

      this.input = input;
      this.callback = callback;
      this.fake = document.createElement('div');
      this.data = { position: 0, lastPosition: -1, x: 0, y: 0 };
      this.listeners = [];
      this.listen();
   }

   _createClass(CursorWatch, [{
      key: "listen",
      value: function listen() {
         var _this = this;

         this.interval = setInterval(function () {
            return _this.updateCursorPosition();
         }, 1000 / 15);
         this.input.addEventListener('scroll', function () {
            return _this.change();
         });
      }
   }, {
      key: "updateCursorPosition",
      value: function updateCursorPosition() {
         this.data.position = this.input.selectionStart;
         if (this.data.lastPosition != this.data.position) this.change();
         this.data.lastPosition = this.data.position;
      }
   }, {
      key: "change",
      value: function change() {
         this.updateFake();
         this.updateCursorXYPosition();
         this.callback && this.callback();
      }
   }, {
      key: "updateCursorXYPosition",
      value: function updateCursorXYPosition() {
         var cursor = this.fake.querySelector('cursor');
         var inputBox = this.input.getBoundingClientRect();
         this.data.x = cursor.offsetLeft - this.input.scrollLeft;
         this.data.y = cursor.offsetTop - this.input.scrollTop;
      }
   }, {
      key: "updateFake",
      value: function updateFake() {
         this.fake.style.cssText = document.defaultView.getComputedStyle(this.input, "").cssText;
         this.fake.style.left = this.input.offsetLeft + 'px';
         this.fake.style.top = this.input.offsetTop + 'px';
         this.fake.style.pointerEvents = "none";
         this.fake.style.visibility = "hidden";
         this.fake.style.position = "fixed";

         var text = this.input.value.split('');
         text.splice(this.data.position, 0, '<cursor style="display:inline-block">|</cursor>');
         this.fake.innerHTML = text.join('');
         document.body.appendChild(this.fake);
      }
   }]);

   return CursorWatch;
}();

if (typeof module != 'undefined') {
   module.exports = CursorWatch;
}