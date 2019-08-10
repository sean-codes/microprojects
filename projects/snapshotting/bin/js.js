// Autoreload Injected by microprojects
if (!window.frameElement) {
   var lastChange = 0
   var xhttp = new XMLHttpRequest();
   xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
         var data = JSON.parse(this.responseText)
         if(lastChange && data.changed !== lastChange){
            window.location = window.location;
            return
         }
         lastChange = data.changed
         setTimeout(function() {
            xhttp.open("GET", "../../reload.json", true);
            xhttp.send()
         }, 500)
      }
   };
   xhttp.open("GET", "../../reload.json", true);
   xhttp.send();
}

const GAME_WIDTH = 200
const GAME_HEIGHT = 200

class Client {
   constructor() {
      this.interval = setInterval(this.step.bind(this), 1000/60)

      // setup canvas
      this.ctx = canvas.getContext('2d')
      this.ctx.canvas.width = GAME_WIDTH
      this.ctx.canvas.height = GAME_HEIGHT

      this.gameObjects = []
      this.gameObjectTypes = {
         player: class {
            constructor(game) {
               this.game = game
               this.x = GAME_WIDTH/2
               this.y = GAME_HEIGHT/2
               this.radius = 30
            }

            step() {
               this.game.ctx.clearRect(0, 0, this.game.ctx.canvas.width, this.game.ctx.canvas.height)
               this.game.ctx.beginPath()
               this.game.ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2)
               this.game.ctx.fill()
            }
         }
      }
   }

   receive(message) {
      if (message.func === 'snapshot') {
         var snapshot = message.data

         for (var snap of snapshot) {
            // find or create an object
            var object = this.gameObjects.find(o => o.id == snap.id)
            if (!object) {
               object = new this.gameObjectTypes[snap.type](this)
               object.id = snap.id
               this.gameObjects.push(object)
            }

            object.x = snap.x
            object.y = snap.y
         }
      }
   }

   step() {
      // draw events
      for (var gameObject of this.gameObjects) {
         gameObject.step()
      }
   }
}

class Server {
   constructor() {
      this.intervalSpeed = 1000/60
      this.interval = setInterval(this.loop.bind(this), this.intervalSpeed)
      this.loopInfo = { frames: 0, delta: 1000/60, last: Date.now() }

      this.snapshotInterval = 1000/10
      this.snapshotLast = Date.now()

      this.connections = []

      this.gameObjects = []
      this.gameObjectTypes = {
         player: class {
            constructor(game) {
               this.type = 'player',
               this.id = Date.now() * Math.random()
               this.game = game
               this.x = GAME_WIDTH / 2
               this.y = GAME_HEIGHT / 2
               this.xSpeed = 3
               this.ySpeed = 0
               this.radius = 30
            }

            step() {
               this.x += this.xSpeed
               this.y += this.ySpeed
               if (this.x < 0 || this.x > GAME_WIDTH) this.xSpeed *= -1
               if (this.y < 0 || this.y > GAME_HEIGHT) this.ySpeed *= -1
            }
         }
      }
   }

   connect(client) {
      var gameObject = new this.gameObjectTypes.player(this)

      this.gameObjects.push(gameObject)
      this.connections.push({ client, gameObject })
   }

   broadcast(data) {
      for (var connection of this.connections) {
         connection.client.receive(data)
      }
   }

   snapshot() {
      var snapshot = []
      for (var gameObject of this.gameObjects) {
         snapshot.push({
            id: gameObject.id,
            type: gameObject.type,
            x: gameObject.x,
            y: gameObject.y,
            xSpeed: gameObject.xSpeed,
            ySpeed: gameObject.ySpeed,
         })
      }

      this.broadcast({
         func: 'snapshot',
         data: snapshot
      })
   }

   loop() {
      this.loop.frames += 1
      this.loop.delta = (Date.now() - this.loop.last) / this.intervalSpeed
      this.loop.last = Date.now()

      // player steps
      for (var object of this.gameObjects) {
         object.step()
      }

      if (Date.now() - this.snapshotLast >= this.snapshotInterval) {
         this.snapshotLast = Date.now()
         this.snapshot()
      }

   }
}


var server = new Server()
server.connect(new Client())
