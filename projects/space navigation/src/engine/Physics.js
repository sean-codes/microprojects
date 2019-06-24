function Physics() {
   this.unique = 0
   this.objects = []

   this.add = (info) => {
      var physicsObject = {
         id: this.unique++,
         type: info.type,
         radius: info.radius,
         pos: info.pos.clone(),
         solid: info.solid,
         speed: info.speed ? info.speed.clone() : new Vector(0, 0),
         bounceWith: JSON.parse(JSON.stringify(info.bounceWith || '[]')),
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

            var combinedRadius = object_0.radius + object_1.radius
            var distance = object_0.pos.distance(object_1.pos)

            if (distance < combinedRadius) {
               object_0.manifold.colliding = true
               object_1.manifold.colliding = true
               object_0.manifold.objectTypes[object_1.type] = true
               object_1.manifold.objectTypes[object_0.type] = true

               var overlap = (combinedRadius - distance)
               var direction = object_0.pos.direction(object_1.pos)

               object_1.solid
                  ? object_0.pos.min(direction.clone().scale(overlap))
                  : object_1.pos.add(direction.clone().scale(overlap))

               if (bounceWith.includes(object_1.type)) {
                  var combinedSpeed = object_0.speed.length() + object_1.speed.length()
                  var tangent = new Vector(-direction.y, direction.x)

                  var o0Eo0 = tangent.clone().scale(object_0.speed.dot(tangent))
                  var o0Eo1 = direction.clone().scale(object_0.speed.dot(direction))
                  var o1Eo0 = direction.clone().scale(object_1.speed.dot(direction))
                  var o1Eo1 = tangent.clone().scale(object_1.speed.dot(tangent))

                  object_0.speed = o0Eo0.add(o1Eo0)
                  object_1.speed = o0Eo1.add(o1Eo1)
               }
            }
         }
      }
   }

   this.objectMove = (object) => {
      object.pos.x += object.speed.x
      object.pos.y += object.speed.y

      // reflect if outside
      if (object.pos.x < 0 || object.pos.x > engine.draw.width) {
         object.pos.x -= (object.pos.x < 0 ? object.pos.x : object.pos.x - engine.draw.width)
         object.speed.x = -object.speed.x
      }

      if (object.pos.y < 0 || object.pos.y > engine.draw.height) {
         object.pos.y -= (object.pos.y < 0 ? object.pos.y : object.pos.y - engine.draw.height)
         object.speed.y = -object.speed.y
      }
   }

   this.objectResetManifold = (object) => {
      object.manifold = {
         colliding: false,
         objectTypes: {}
      }
   }
}
