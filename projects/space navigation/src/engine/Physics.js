function Physics() {
   this.objects = []

   this.add = (info) => {
      var physicsObject = {
         id: info.object.id,
         type: info.object.type,
         object: info.object,
         radius: info.radius,
         pos: info.object.pos.clone(),
         speed: info.object.speed ? cs.clone(info.object.speed) : { x: 0, y: 0 },
         collideWith: cs.clone(info.collideWith || []),
         bounceWith: cs.clone(info.bounceWith || []),
         manifold: {}
      }

      this.objectResetManifold(physicsObject)
      this.objects.push(physicsObject)
      return physicsObject
   }

   this.remove = (removeObject) => {
      this.objects = this.objects.filter(function(o) {
         return o.id !== removeObject.core.id
      })
   }

   this.resolve = () => {
      for (var object_0 of this.objects) {
         // reset manifold
         this.objectResetManifold(object_0)
         this.objectMove(object_0)

         for (var object_1 of this.objects) {
            if (object_0.id == object_1.id) continue

            var collideWith = object_0.collideWith
            var bounceWith = object_0.bounceWith
            var touchDistance = object_0.radius + object_1.radius

            if (collideWith.includes(object_1.type)) {
               // push them away
               var distance = cs.math.distance(object_0.pos, object_1.pos)
               if (distance < touchDistance) {
                  object_0.manifold.colliding = true
                  object_1.manifold.colliding = true

                  var direction = cs.math.direction(object_0.pos, object_1.pos)

                  object_0.pos.x -= cs.math.cos(direction) * (touchDistance - distance)
                  object_0.pos.y -= cs.math.sin(direction) * (touchDistance - distance)

                  if (bounceWith.includes(object_1.type)) {
                     speedX = object_0.speed.x
                     speedY = object_0.speed.y

                     object_0.speed.x = object_1.speed.x
                     object_0.speed.y = object_1.speed.y
                     object_1.speed.x = speedX
                     object_1.speed.y = speedY
                  }
               }
            }
         }
      }
   }

   this.objectMove = (object) => {
      object.pos.x += object.speed.x * cs.loop.delta
      object.pos.y += object.speed.y * cs.loop.delta

      // reflect if outside
      if (object.pos.x < 0 || object.pos.x > cs.room.width) {
         object.pos.x -= (object.pos.x < 0 ? object.pos.x : object.pos.x - cs.room.width)
         object.speed.x = -object.speed.x
      }

      if (object.pos.y < 0 || object.pos.y > cs.room.height) {
         object.pos.y -= (object.pos.y < 0 ? object.pos.y : object.pos.y - cs.room.height)
         object.speed.y = -object.speed.y
      }
   }

   this.objectResetManifold = (object) => {
      object.manifold = {
         colliding: false
      }
   }
}
