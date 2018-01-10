var test = require('tape')
var CursorWatch = require('../src/assets/cursorWatch.js')


// Figure out how this works
var textarea = document.createElement('textarea')
document.body.appendChild(textarea)
console.log(window.innerWidth)
var testme = 0
textarea.addEventListener('click', function() {
   testme = 1
})


test('textarea exists', t => {
   t.pass('query select textarea', document.querySelector('textarea').length)
   t.end()
})

test('textarea was clicked', t => {
      textarea.click()
   t.equals(testme, 1, 'testme is equal to 1')
})
