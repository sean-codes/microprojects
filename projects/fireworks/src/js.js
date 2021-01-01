const ctx = canvas.getContext('2d')
const eraseCanvas = document.createElement('canvas')
const eraseCtx = eraseCanvas.getContext('2d')


class Engine {
    constructor() {
      this.objects = []
      setInterval(() => this.render(), 1000/60)
    }
    
    explodeRocket(pos) {
      const color = ['#E0777D', '#4C86A8', '#FFF'][Math.floor(Math.random()*3)]
      for (var i = 0; i < 100; i++) {
        this.addParticle(pos, color)
      }
    }
    
    addRocket() {
      const xPos = Math.random() * canvas.width
      const yPos = canvas.height
      const speed = Math.random() * 4 + 1
      const dir = Math.PI * 2 * 0.75 + (Math.random() - 0.5) 
      
      this.objects.push(new Rocket(
        new Vector(xPos, yPos),
        new Vector(Math.cos(dir)*speed, Math.sin(dir)*speed),
      ))
    }
    
    addParticle(pos, color) {
      const speed = Math.random()*5
      const dir = Math.random() * Math.PI*2
      const vel = new Vector(Math.cos(dir)*speed, Math.sin(dir)*speed)
      this.objects.push(new Particle(pos, vel, color))
    }
    
    render() {
      // ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      // ctx.fillRect(0, 0, canvas.width, canvas.height)
      eraseCtx.clearRect(0,0,canvas.width,canvas.height);
      eraseCtx.globalAlpha = .75;
      eraseCtx.drawImage(canvas,0,0);
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(eraseCanvas,0,0);
      
      for (var object of this.objects) {
        object.life-- 
        object.render()
        
        if (!object.life && object instanceof Rocket) {
          this.explodeRocket(object.pos)
        }
      }
      
      
      this.objects = this.objects.filter(p => {
        if (p.life > 0) {
          return true 
        }
      })
      
      if (Math.random() < 0.05) this.addRocket()
    }
}

class Rocket {
  constructor(pos, vel) {
    this.pos = pos.clone()
    this.vel = vel.clone()
    this.life = 60 + Math.floor(Math.random()*(canvas.height/2))
  }
  
  render() {
    this.pos.add(this.vel)
    
    ctx.globalAlpha = 1
    ctx.fillStyle = '#444'
    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, 4, 0, Math.PI*2)
    ctx.fill()
  }
}

class Particle {
  constructor(pos, vel, color) {
    this.pos = pos.clone()
    this.vel = vel.clone()
    this.gravity = new Vector(0, 0.1)
    this.life = 80
    this.color = color
  }
  
  render() {
    this.pos.add(this.vel)
    this.vel.add(this.gravity)
    
    ctx.fillStyle = this.color
    ctx.globalAlpha = this.life / 80
    
    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, 4, 0, Math.PI*2)
    ctx.fill()
  }
}

class Vector {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
  
  add(v) {
    this.x += v.x
    this.y += v.y
    return this
  }
  
  clone() {
    return new Vector(this.x, this.y)
  }
}

function resize() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  eraseCanvas.width = canvas.width
  eraseCanvas.height = canvas.height
}

window.onresize = resize
resize()

new Engine
