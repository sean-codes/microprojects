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

      this.data = {
         position: 0,
         cordinates: { x: 0, y: 0 }
      };

      this.listen();
      this.listeners = [];
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

         this.input.addEventListener('keyup', function () {
            _this.change();
         });
         this.input.addEventListener('mouseup', function () {
            _this.change();
         });
         this.input.addEventListener('touchstart', function () {
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
         var fakeBox = this.fake.getBoundingClientRect();

         this.data.cordinates = {
            x: cursorBox.left - fakeBox.left,
            y: cursorBox.top - fakeBox.top
         };
      }
   }, {
      key: "updateFake",
      value: function updateFake() {
         this.fake.style.cssText = document.defaultView.getComputedStyle(this.input, "").cssText;
         this.fake.style.visibility = "hidden";
         this.fake.style.pointerEvents = "none";
         var text = this.input.value.split('');
         text.splice(this.data.position, 0, '<cursor style="display:inline">|</cursor>');
         this.fake.innerHTML = text.join('');
         document.body.appendChild(this.fake);
      }
   }]);

   return CursorWatch;
}();

// User


var textarea = document.querySelector('textarea');
var dataarea = document.querySelector('pre');

var cursorWatch = new CursorWatch(textarea);
cursorWatch.on('change', function (data) {
   dataarea.innerHTML = JSON.stringify(data, null, '\t');
});