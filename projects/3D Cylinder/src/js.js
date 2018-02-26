new CSSettings({
   settings: [
      {
         label: 'perspective',
         style: 'perspective',
         suffix: 'px',
         input: { type: 'range', min: 0, max: 1000, value: 1000 },
         target: document.querySelector('.shape')
      },
      {
         label: 'rotate X/Y',
         style: 'transform',
         input: { type: 'grid', min:-100, max:100, step:10, valueX:0, valueY:0 },
         target: document.querySelector('.cylinder'),
         create: function() {
            new GridInput({ input: this.html.input });
         },
         value: function() {
            var value = JSON.parse(this.html.input.value)
            return `rotateX(${Math.floor(value.y)}deg) rotateY(${Math.floor(-value.x)}deg)`
         }
      },
   ]
})
