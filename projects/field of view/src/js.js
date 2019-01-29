console.clear();

var scene = new Scene({
   canvas: canvas,

   init: function(vars) {
      vars.projectionPlane = [
         new Vector(this.canvas.centerX - 100, this.canvas.centerY),
         new Vector(this.canvas.centerX + 100, this.canvas.centerY)
      ]

      vars.points = [
         new Vector(this.canvas.centerX - 50, this.canvas.centerY - 50),
         new Vector(this.canvas.centerX + 50, this.canvas.centerY - 50),
         new Vector(this.canvas.centerX - 50, this.canvas.centerY - 150),
         new Vector(this.canvas.centerX + 50, this.canvas.centerY - 150),
      ]
   },

   render: function(vars, draw, debug) {
      draw.clear();

      draw.settings({
         lineWidth: 2,
         strokeStyle: "white",
         fillStyle: "#F44",
         font: "18px monospace"
      });

      // calculations
      var screenSize = vars.projectionPlane[0].distance(vars.projectionPlane[1])

      var focalLength = Math.round(Math.max(0, this.mouse.y - vars.projectionPlane[0].y)*10)/10 // distance from plane to eye
      if (!this.mouse.hasMoved) focalLength = 100

      var fov = Math.atan(screenSize/2 / focalLength) * 2
      var fovInDegrees = fov * (180 / Math.PI)
      var fovRounded = Math.round(fovInDegrees)

      // debug('screenSize: ' + screenSize)
      // debug('focal length: ' + focalLength)
      // debug('field of view: ' + fovRounded)

      // draw the projection plane / points
      draw.line(vars.projectionPlane[0], vars.projectionPlane[1])
      draw.line(
         new Vector(vars.projectionPlane[0].x, vars.projectionPlane[0].y-5),
         new Vector(vars.projectionPlane[0].x, vars.projectionPlane[0].y+5),
      )

      draw.line(
         new Vector(vars.projectionPlane[1].x, vars.projectionPlane[1].y-5),
         new Vector(vars.projectionPlane[1].x, vars.projectionPlane[1].y+5),
      )

      for (var point of vars.points) {
         draw.circle(point, 5);
      }

      draw.settings({ fillStyle: '#FFF' })
      draw.text(vars.projectionPlane[1].clone().add(new Vector(10, 2.5)), `screen / projeciton plane: ${screenSize}px`)

      // draw focal length
      focalTop = new Vector(vars.projectionPlane[0].x - 10, vars.projectionPlane[0].y)
      focalBottom = new Vector(vars.projectionPlane[0].x - 10, vars.projectionPlane[0].y + focalLength)
      draw.line(focalTop, focalBottom)

      var focalCenterDistance = focalTop.distance(focalBottom) / 2
      var focalTextPoint = focalTop.clone().add(new Vector(-150, focalCenterDistance))
      draw.translate(focalTextPoint)
      draw.rotate(-Math.PI/2)
      draw.text(new Vector(-80, 140), `focal length: ${focalLength}px`)
      draw.rotate(Math.PI/2)
      draw.translate(focalTextPoint.clone().scale(-1))
      var eye = new Vector(vars.projectionPlane[0].x + (vars.projectionPlane[1].x - vars.projectionPlane[0].x)/2, vars.projectionPlane[0].y + focalLength)

      draw.settings({ fillStyle: '#FFF' })
      draw.text(eye.clone().add(new Vector(10, 2.5)), `eye fov: ${fovRounded}deg`)

      var eyeToLeftDir = eye.direction(vars.projectionPlane[0])
      var eyeToRightDir = eye.direction(vars.projectionPlane[1])

      draw.settings({ strokeStyle: '#468', lineWidth: 1 })
      draw.line(eye, eye.clone().add(eyeToLeftDir.scale(1000)))
      draw.line(eye, eye.clone().add(eyeToRightDir.scale(1000)))

      draw.settings({ fillStyle: '#468', strokeStyle: '#FFF', lineWidth: 1 })
      draw.circle(eye, 5)

      // draw lines from points to eye
      for (var point of vars.points) {
         draw.settings({ strokeStyle: '#f44' })
         draw.line(point, eye)
      }
   }
});

// vector magic
function Vector(x, y) {
   this.x = x;
   this.y = y;

   this.clone = function() {
      return new Vector(this.x, this.y);
   };

   this.add = function(v2) {
      this.x += v2.x;
      this.y += v2.y;

      return this;
   };

   this.min = function(v2) {
      this.x -= v2.x;
      this.y -= v2.y;

      return this;
   };

   this.scale = function(s) {
      this.x *= s;
      this.y *= s;

      return this;
   };

   this.direction = function(v1) {
      return v1.clone().min(this).unit()
   }

   this.unit = function() {
      return this.scale(1 / this.length());
   };

   this.length = function() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
   };

   this.distance = function(v2) {
      return v2
         .clone()
         .min(this)
         .length();
   };

   this.dot = function(v2) {
      return this.x * v2.x + this.y * v2.y;
   };

   this.toString = function() {
      return `(${this.x}, ${this.y})`;
   };
}

// squishing boring down here
// it got a bit out of control
function Scene(options) {
   this.canvas = canvas;
   this.ctx = this.canvas.getContext("2d");
   this.vars = {};

   this.initialize = options.init;
   this.render = options.render;
   this.speed = options.speed || 1000 / 60;

   // drawing
   this.draw = {
      ctx: canvas.getContext("2d"),

      clear: function() {
         this.ctx.clearRect(
            0,
            0,
            this.ctx.canvas.width,
            this.ctx.canvas.height
         );
      },

      settings: function(settings) {
         for (var setting in settings) {
            this.ctx[setting] = settings[setting];
         }
      },

      line: function(pos1, pos2) {
         this.ctx.beginPath();
         this.ctx.moveTo(pos1.x, pos1.y);
         this.ctx.lineTo(pos2.x, pos2.y);
         this.ctx.stroke();
      },

      circle: function(pos, radius) {
         this.ctx.beginPath();
         this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
         this.ctx.fill();
         this.ctx.stroke();
      },

      // i like the position first. the x/y arent hard to find
      text: function(pos, text) {
         this.ctx.fillText(text, pos.x, pos.y);
      },

      rotate: function(rotation) {
         this.ctx.rotate(rotation)
      },

      translate: function(point) {
         this.ctx.translate(point.x, point.y)
      }
   };

   // mousing
   this.mouse = {
      hasMoved: false,
      x: 0,
      y: 0
   };

   this.canvas.addEventListener("mousemove", e => {
      // you caught me
      this.mouse.hasMoved = true
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
   });

   this.canvas.addEventListener("touchmove", e => {
      this.mouse.hasMoved = true
      this.mouse.x = e.touches[0].clientX
      this.mouse.y = e.touches[0].clientY
   })

   // debuging
   this.debug = {
      ctx: canvas.getContext("2d"),
      lines: [],

      add: function(text) {
         this.lines.push(text);
      },

      draw: function() {
         this.ctx.fillStyle = "#FFF";
         this.ctx.font = "12px monospace";

         for (var debugID = 0; debugID < this.lines.length; debugID++) {
            var x = 20;
            var y = 30 + debugID * 20;
            this.ctx.fillText(this.lines[debugID], x, y);
         }

         this.lines = [];
      }
   };

   // startup and render
   setInterval(
      function() {
         this.render(this.vars, this.draw, this.debug.add.bind(this.debug));
         this.debug.draw();
      }.bind(this),
      this.speed
   );

   window.onresize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      canvas.centerX = canvas.width / 2;
      canvas.centerY = canvas.height / 2;

      this.mouse.x = canvas.centerX;
      this.mouse.y = canvas.centerY;

      this.initialize && this.initialize(this.vars);
   };

   // init
   window.onresize();
}
