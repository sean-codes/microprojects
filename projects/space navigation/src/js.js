console.clear()

// ---------------------------------------------------------------------------//
// ------------------------------| Game Engine |------------------------------//
// ---------------------------------------------------------------------------//
var engine = new Engine({
   mouse: new Mouse({ element: canvas }),
   draw: new Draw({ canvas: canvas, fullscreen: true }),
   objects: new Objects(),
   math: new HandyMath(),

   init: (vars) => {
      var { width, height } = engine.draw

      engine.objects.create({
         type: 'ship',
         pos: new Vector(width * 0.75, height * 0.75)
      })

      engine.objects.create({
         type: 'point',
         pos: new Vector(width * 0.25, height * 0.5)
      })

      engine.objects.create({
         type: 'meteor',
         pos: new Vector(width * 0.5, height * 0.5)
      })
   },

   step: (vars) => {
      engine.draw.clear()
      engine.objects.step()
      engine.mouse.step()
   }
})

engine.start()
