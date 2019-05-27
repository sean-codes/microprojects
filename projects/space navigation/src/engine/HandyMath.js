function HandyMath() {
   this.angleToAngle = (a0, a1) => {
      var circle = Math.PI*2
      // im sure there is a rigth way to do this :]
      var leftAmount = a1 - a0
      if (leftAmount > 0) leftAmount = -circle + leftAmount

      var rightAmount = a1 - a0
      if (rightAmount < 0) rightAmount = rightAmount + circle

      return Math.abs(rightAmount) > Math.abs(leftAmount) ? leftAmount : rightAmount
   }
}
