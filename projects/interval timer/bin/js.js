
const IntervalTimer = function(duration, rest) {
   this.ele = {
      buttonStop: document.getElementById('buttonStop'),
      buttonPause: document.getElementById('buttonPause'),
      buttonStart: document.getElementById('buttonStart'),
      buttonReset: document.getElementById('buttonReset'),
      counter: document.getElementById('counter'),
      inputDuration: document.getElementById('inputDuration'),
      inputRest: document.getElementById('inputRest'),
   }

   this.duration = duration
   this.rest = rest
   this.resting = false
   this.interval = undefined
   this.timer = {
      timeLeft: this.duration
   }

   this.ele.inputDuration.value = this.duration
   this.ele.inputRest.value = this.rest
   this.ele.counter.innerHTML = this.duration

   this.ele.inputDuration.addEventListener('input', (e) => {
      this.duration = e.target.value
      this.reset()
   })

   this.ele.inputRest.addEventListener('input', (e) => {
      this.rest = e.target.value
      this.reset()
   })

   this.ele.buttonPause.addEventListener('click', () => this.pause())
   this.ele.buttonStart.addEventListener('click', () => this.start())
   this.ele.buttonReset.addEventListener('click', () => this.reset())
   this.ele.buttonStop.addEventListener('click', () => this.stop())


   this.start = function() {
      if (this.timer.timeLeft) {
         this.timer.duration = this.timer.timeLeft * 1000
         this.timer.started = Date.now()
      }

      this.interval = setInterval(() => this.tick(), 100)
      this.ele.buttonPause.classList.remove('hide')
      this.ele.buttonStart.classList.add('hide')
   }

   this.switch = function() {
      this.resting = !this.resting
      this.timer = {
         started: Date.now(),
         duration: this.resting ? this.rest * 1000 : this.duration * 1000
      }

      this.ele.counter.classList.toggle('rest', this.resting)
   }

   this.tick = function() {
      const timeLeft = this.timer.duration - (Date.now() - this.timer.started)
      const secondsLeft = Math.ceil(timeLeft / 1000)
      this.ele.counter.innerHTML = secondsLeft
      this.timer.timeLeft = secondsLeft

      if (timeLeft < 200) this.switch()
   }

   this.reset = function() {
      this.resting = false
      this.timer = {
         started: Date.now(),
         duration: this.duration * 1000
      }

      this.ele.counter.innerHTML = this.duration
      this.ele.counter.classList.toggle('rest', this.resting)
   }

   this.pause = function() {
      clearInterval(this.interval)
      this.ele.buttonPause.classList.add('hide')
      this.ele.buttonStart.classList.remove('hide')
   }

   this.stop = function() {
      this.resting = false
      this.pause()
      this.reset()
   }
}

const intervalTimer = new IntervalTimer(45, 15)
