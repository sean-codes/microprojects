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

// Hi! This is very much experimental! Lots of comments and parts laying around!!
var ctx = document.querySelector('canvas').getContext('2d');
ctx.canvas.width = 600;
ctx.canvas.height = 300;

var draw = new Draw(ctx);

// Make a grid give each a x/y velocity
var zoneSize = 40;

var fields = fakeNoise();
ctx.canvas.addEventListener('click', function () {
   fields = fakeNoise();
});

var particles = [];
var i = 30000;while (i--) {
   particles.push({
      pos: new Vector(ctx.canvas.width / 2, ctx.canvas.height / 2),
      direction: new Vector(Math.random() * 10 - 5, Math.random() * 10 - 5),
      color: ['#2caff0', '#43cd7a', '#a884ff'][Math.floor(Math.random() * 3)]
   });
}

function fakeNoise() {
   var fields = [];
   for (var x = 0; x <= Math.ceil(ctx.canvas.width / zoneSize); x++) {
      fields[x] = [];
      for (var y = 0; y <= Math.ceil(ctx.canvas.height / zoneSize); y++) {
         fields[x][y] = {
            pos: new Vector(x * zoneSize, y * zoneSize),
            center: new Vector(x * zoneSize + zoneSize / 2, y * zoneSize + zoneSize / 2),
            direction: new Vector(0, 0),
            size: zoneSize
         };
      }
   }

   var gravities = [];
   var count = 1;while (count--) {
      gravities.push({
         pos: new Vector(ctx.canvas.width / 2, ctx.canvas.height / 2),
         direction: new Vector(Math.random() * 6 - 3, Math.random() * 6 - 3),
         size: Math.random() * 40 + 15,
         spin: (Math.random() - 0.5) * 0.1,
         speed: Math.random() * 3
      });
   }

   var duration = 1000;while (duration--) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
         for (var _iterator = gravities[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var gravity = _step.value;

            gravity.pos.add(gravity.direction);
            var direction = Math.atan2(gravity.direction.y, gravity.direction.x);
            var speed = gravity.direction.length();
            direction += gravity.spin || 0.01;
            gravity.direction.x = Math.cos(direction);
            gravity.direction.y = Math.sin(direction);
            gravity.direction.scale(gravity.speed);
            if (Math.random() > 0.99) {
               gravity.spin = (Math.random() - 0.5) * 0.1;
               gravity.speed = Math.random() * 2 + 1;
               gravity.size = Math.random() * 40 + 10;
            }
            if (gravity.pos.x - gravity.size < 0) gravity.pos.x = ctx.canvas.width - gravity.size;
            if (gravity.pos.y - gravity.size < 0) gravity.pos.y = ctx.canvas.height - gravity.size;
            if (gravity.pos.x + gravity.size > ctx.canvas.width) gravity.pos.x = gravity.size;
            if (gravity.pos.y + gravity.size > ctx.canvas.height) gravity.pos.y = gravity.size;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
               for (var _iterator2 = fields[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                  var fieldrow = _step2.value;
                  var _iteratorNormalCompletion3 = true;
                  var _didIteratorError3 = false;
                  var _iteratorError3 = undefined;

                  try {
                     for (var _iterator3 = fieldrow[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                        var field = _step3.value;

                        var distance = gravity.pos.distance(field.pos);
                        if (distance < gravity.size) {
                           field.direction = gravity.direction.clone();
                        }
                     }
                  } catch (err) {
                     _didIteratorError3 = true;
                     _iteratorError3 = err;
                  } finally {
                     try {
                        if (!_iteratorNormalCompletion3 && _iterator3.return) {
                           _iterator3.return();
                        }
                     } finally {
                        if (_didIteratorError3) {
                           throw _iteratorError3;
                        }
                     }
                  }
               }
            } catch (err) {
               _didIteratorError2 = true;
               _iteratorError2 = err;
            } finally {
               try {
                  if (!_iteratorNormalCompletion2 && _iterator2.return) {
                     _iterator2.return();
                  }
               } finally {
                  if (_didIteratorError2) {
                     throw _iteratorError2;
                  }
               }
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

   return fields;
}

// Loop
setInterval(function () {
   draw.clear();

   // Particles
   draw.set({ fillStyle: 'rgba(255, 255, 255, 0.1)' });
   var _iteratorNormalCompletion4 = true;
   var _didIteratorError4 = false;
   var _iteratorError4 = undefined;

   try {
      for (var _iterator4 = particles[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
         var particle = _step4.value;

         //draw.set({ fillStyle: particle.color+'33' })
         draw.fillRect(particle.pos.x, particle.pos.y, 3, 3);

         particle.pos.add(particle.direction);
         if (particle.pos.x < 0) particle.pos.x = ctx.canvas.width;
         if (particle.pos.y < 0) particle.pos.y = ctx.canvas.height;
         if (particle.pos.x > ctx.canvas.width) particle.pos.x = 0;
         if (particle.pos.y > ctx.canvas.height) particle.pos.y = 0;

         // please hold
         var fieldCol = Math.floor(particle.pos.x / zoneSize);
         var fieldRow = Math.floor(particle.pos.y / zoneSize);
         //var field = fields[fieldCol][fieldRow]
         //var pull = field.direction.clone().min(particle.direction)
         //var pull = field.direction.fastMin(particle.direction.fastScale(0.05))
         //particle.direction.add(pull) // Make this variable
      }
   } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
   } finally {
      try {
         if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
         }
      } finally {
         if (_didIteratorError4) {
            throw _iteratorError4;
         }
      }
   }

   console.log(particles.length);
}, 1000 / 60);

// Librairies
function Draw(ctx) {
   this.ctx = ctx;
   this.canvas = ctx.canvas;

   this.set = function (options) {
      for (var option in options) {
         this.ctx[option] = options[option];
      }
   };
   this.fillRect = function (x, y, width, height) {
      this.ctx.fillRect(x, y, width, height);
   };
   this.strokeRect = function (x, y, width, height) {
      this.ctx.strokeRect(x, y, width, height);
   };
   this.fillCircle = function (x, y, radius) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();
   };
   this.strokeCircle = function (x, y, radius) {
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.stroke();
   };
   this.fillText = function (x, y, text) {
      this.ctx.fillText(text, x, y);
   };
   this.strokeText = function (x, y, text) {
      this.ctx.strokeText(text, x, y);
   };
   this.line = function (x1, y1, x2, y2) {
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
   };
   this.clear = function () {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
   };
}

function Vector(x, y) {
   this.x = x || 0;
   this.y = y || 0;
   this.add = function (v) {
      this.x += v.x;this.y += v.y;return this;
   };
   this.min = function (v) {
      this.x -= v.x;this.y -= v.y;return this;
   };
   this.fastMin = function (v) {
      return { x: this.x - v.x, y: this.y - v.y };
   };
   this.scale = function (s) {
      this.x *= s;this.y *= s;return this;
   };
   this.fastScale = function (s) {
      return { x: this.x * s, y: this.y * s };
   };
   this.clone = function () {
      return new Vector(this.x, this.y);
   };
   this.unit = function () {
      return this.scale(1 / this.length());
   };
   this.distance = function (v) {
      return this.clone().min(v).length();
   };
   this.direction = function () {
      return Math.atan2(this.y, this.x);
   };
   this.dot = function () {
      return this.x * this.x + this.y * this.y;
   };
   this.length = function () {
      return Math.sqrt(this.x * this.x + this.y * this.y);
   };
   this.sizeDir = function (r, d) {
      this.x += Math.cos(d) * r;
      this.y += Math.sin(d) * r;
      return this;
   };
}