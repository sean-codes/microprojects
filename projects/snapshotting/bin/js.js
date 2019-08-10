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
      this.loopInfo = {
         speed: 1000/30,
         deltaSpeed: 1000/60, // for matching a clients framerate
         delta: 1,
         frames: 0,
         last: Date.now(),
         interval: setInterval(this.loop.bind(this), 1000/30)
      }

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
               this.x += this.xSpeed * this.game.loopInfo.delta
               this.y += this.ySpeed * this.game.loopInfo.delta
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
      this.loopInfo.frames += 1
      this.loopInfo.delta = (Date.now() - this.loopInfo.last) / this.loopInfo.deltaSpeed
      this.loopInfo.last = Date.now()

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
