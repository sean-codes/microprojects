'use strict';

// Setup
var ctx = document.querySelector('canvas').getContext('2d');
ctx.canvas.width = window.innerWidth;
ctx.canvas.height = window.innerHeight;
var width = ctx.canvas.clientWidth;
var height = ctx.canvas.clientHeight;
var centerX = width / 2;
var centerY = height / 2;
ctx.canvas.addEventListener('click', function (e) {
   var i = 100;while (i--) {
      positions.push(new Pos({ x: e.clientX, y: e.clientY }));
   }
});
// Rough
function Pos(pos) {
   this.speed = Math.random() * 2 - 1;
   this.y = pos ? pos.y : centerY;
   this.x = pos ? pos.x : centerX;
   this.color = randomColor();
   this.walkx = new Walker({ radius: 40, wander: true });
   this.walky = new Walker({ radius: 40, wander: true });
   this.move = function () {
      this.x += this.walkx.step() * this.speed;
      this.y += this.walky.step() * this.speed;
      if (this.x < 0 || this.y < 0 || this.x > width || this.y > height) this.dead = true;
   };

   this.draw = function () {
      ctx.beginPath();
      ctx.globalAlpha = 0.2;
      ctx.arc(this.x, this.y, 0.9, 0, 2 * Math.PI);
      ctx.fillStyle = this.color;
      ctx.fill();
   };
}

// Send it
var positions = [];

var i = 100;while (i--) {
   positions.push(new Pos());
}setInterval(function () {
   ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
   //ctx.fillRect(0, 0, width, height)
   var _iteratorNormalCompletion = true;
   var _didIteratorError = false;
   var _iteratorError = undefined;

   try {
      for (var _iterator = positions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
         var pos = _step.value;

         if (pos.dead) continue;
         pos.move();
         pos.draw();

         if (positions.length < 1000 && !Math.floor(Math.random() * 500)) positions.push(new Pos(pos));
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
}, 1000 / 60);

// Util
function Walker(options) {
   this.step = function () {
      this.direction = Math.sign(this.target);
      this.value += this.direction;
      this.target ? this.target -= this.direction : this.value ? this.wander ? this.target = this.newTarget() : this.target = -this.value : this.target = this.newTarget();
      return this.direction;
   };

   this.newTarget = function () {
      return Math.round(Math.random() * (this.radius * 2) - this.radius);
   };

   this.start = 0;
   this.value = 0;
   this.radius = options.radius;
   this.target = this.newTarget();
   this.direction = Math.sign(this.target);
   this.wander = options.wander;
}

function randomColor() {
   return ['#6ae5ab', '#88e3b2', '#36b89b', '#7bd7ec', '#66cbe1'][Math.floor(Math.random() * 5)];
}