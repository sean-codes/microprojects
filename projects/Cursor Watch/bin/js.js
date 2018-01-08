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
   function CursorWatch(input) {
      _classCallCheck(this, CursorWatch);

      this.input = input;
      this.fake = document.createElement('div');
      this.data = { position: 0, x: 0, y: 0 };
      this.oldPosition = 0;
      this.listeners = [];
      this.listen();
   }

   _createClass(CursorWatch, [{
      key: "on",
      value: function on(type, callback) {
         this.listeners.push({ type: type, callback: callback });
      }
   }, {
      key: "fire",
      value: function fire(type) {
         var _iteratorNormalCompletion = true;
         var _didIteratorError = false;
         var _iteratorError = undefined;

         try {
            for (var _iterator = this.listeners[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
               var listener = _step.value;

               if (listener.type == type) {
                  listener.callback(this.data);
               }
            }
         } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
         } finally {
            try {
               if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
               }
            } finally {
               if (_didIteratorError) {
                  throw _iteratorError;
               }
            }
         }
      }
   }, {
      key: "listen",
      value: function listen() {
         var _this = this;

         this.interval = setInterval(function () {
            _this.updateCursorPosition();
            if (_this.oldPosition != _this.data.position) {
               _this.change();
            }
         }, 1000 / 30);

         this.input.addEventListener('scroll', function () {
            _this.change();
         });
      }
   }, {
      key: "change",
      value: function change() {
         this.updateCursorPosition();
         this.updateFake();
         this.updateCursorXYPosition();
         this.fire('change');
      }
   }, {
      key: "updateCursorPosition",
      value: function updateCursorPosition() {
         this.data.position = this.input.selectionStart;
      }
   }, {
      key: "updateCursorXYPosition",
      value: function updateCursorXYPosition() {
         var cursor = this.fake.querySelector('cursor');
         var cursorBox = cursor.getBoundingClientRect();
         // var fakeBox = this.fake.getBoundingClientRect()
         // var inputBox = this.input.getBoundingClientRect()

         this.data.x = cursor.offsetLeft + this.input.offsetLeft; // - this.input.scrollLeft
         this.data.y = cursor.offsetTop + this.input.offsetTop - this.input.scrollTop;
      }
   }, {
      key: "updateFake",
      value: function updateFake() {
         this.fake.style.cssText = document.defaultView.getComputedStyle(this.input, "").cssText;
         //this.fake.style.visibility = "hidden"
         var text = this.input.value.split('');
         text.splice(this.data.position, 0, '<cursor style="display:inline-block">|</cursor>');
         this.fake.innerHTML = text.join('');
         document.body.appendChild(this.fake);

         this.fake.scrollTop = this.input.scrollTop;
         this.fake.style.left = this.input.offsetLeft + 'px';
         this.fake.style.top = this.input.offsetTop + 'px';
         this.fake.style.pointerEvents = "none";
         this.fake.style.visibility = "hidden";
         this.fake.style.position = "fixed";
      }
   }]);

   return CursorWatch;
}();

// User


var textarea = document.querySelector('textarea');
var dataarea = document.querySelector('pre');
var crosshair = document.querySelector('crosshair');

var cursorWatch = new CursorWatch(textarea);
cursorWatch.on('change', function (data) {
   dataarea.innerHTML = JSON.stringify(data, null, '\t');
   crosshair.style.transform = "translateX(" + data.x + "px) translateY(" + data.y + "px)";
});