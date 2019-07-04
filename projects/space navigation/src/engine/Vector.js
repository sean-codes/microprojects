function Vector(x, y) {
   this.x = x || 0
   this.y = y || 0
   this.clone = () =>  new Vector(this.x, this.y)
   this.add = (v) => { this.x+=v.x; this.y+=v.y; return this }
   this.min = (v) => { this.x-=v.x; this.y-=v.y; return this }
   this.scale = (s)  =>{ this.x*=s; this.y*=s; return this }
   this.unit = () => this.scale(1/this.length())
   this.distance = (v) => this.clone().min(v).length()
   this.angle = () => Math.atan2(this.y, this.x) + Math.PI
   this.direction = (v1) => v1.clone().min(this).unit()
   this.dot = (v1) => this.x*v1.x+this.y*v1.y
   this.length = () => Math.sqrt(this.x*this.x + this.y*this.y)
   this.closestPointOnLine = (line) => {
      var lineLength = line[0].distance(line[1])
      var lineDirection = line[0].direction(line[1])
      var lineToPoint = this.clone().min(line[0])

      var dot = lineToPoint.dot(lineDirection) / lineLength
      dot = Math.min(Math.max(0, dot), 1)

      var closestPoint = line[0].clone().add(lineDirection.clone().scale(dot * lineLength))
      return closestPoint
   }
}
