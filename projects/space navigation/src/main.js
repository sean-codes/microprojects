console.clear()

// ---------------------------------------------------------------------------//
// ------------------------------| Game Engine |------------------------------//
// ---------------------------------------------------------------------------//
var engine = new Engine({
   mouse: new Mouse({ element: canvas }),
   keyboard: new Keyboard({
      element: canvas,
      map: { forward: 38, left: 37, right: 39 }
   }),
   draw: new Draw({ canvas: canvas, fullscreen: true }),
   objects: new Objects(),
   math: new HandyMath(),
   physics: new Physics(),

   init: (vars) => {
      var { width, height } = engine.draw

      // engine.objects.create({
      //    type: 'meteor',
      //    pos: new Vector(width * 0.25, height * 0.5)
      // })
      //
      // engine.objects.create({
      //    type: 'meteor',
      //    pos: new Vector(width * 0.5, height * 0.5),
      //    radius: 75
      // })
      //
      // engine.objects.create({
      //    type: 'meteor',
      //    pos: new Vector(width * 0.75, height * 0.5)
      // })

      for (var i = 0; i < 5; i++) {
         engine.objects.create({
            type: 'meteor',
            pos: new Vector(width * Math.random(), height * Math.random()),
            radius: 50 + Math.random() * 50
         })
      }

      for (var i = 0; i < 2; i++) {
         engine.objects.create({
            type: 'ship',
            pos: new Vector(width * Math.random(), height * Math.random())
         })
      }

      for (var i = 0; i < 3; i++) {
         engine.objects.create({
            type: 'point',
            pos: new Vector(width * Math.random(), height * Math.random())
         })
      }
   },

   step: (vars) => {
      engine.physics.resolve()
      engine.draw.clear()
      engine.objects.step()
      engine.mouse.step()
   }
})

engine.start()
