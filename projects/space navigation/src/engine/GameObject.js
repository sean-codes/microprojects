// ---------------------------------------------------------------------------//
// -----------------------------| Game Objects |------------------------------//
// ---------------------------------------------------------------------------//
function Objects() {
   this.id = 0
   this.list = []
   this.objectTypes = {
      ship: ObjectShip,
      point: ObjectPoint,
      meteor: ObjectMeteor
   }

   this.create = (options) => {
      var objectType = this.objectTypes[options.type]
      var object = new objectType(options)

      this.list.push({
         id: this.id++,
         type: options.type,
         object: object
      })
   }

   this.step = () => {
      for (var o of this.list) {
         o.object.step()
      }
   }

   this.find = (objectType) => {
      var listObject = this.list.find(o => o.type == objectType)
      if (listObject) return listObject.object
   }

   this.all = (objectType) => {
      var objects = this.list.reduce((sum, num) => {
         num.type == objectType && sum.push(num.object)
         return sum
      }, [])

      return objects
   }
}
