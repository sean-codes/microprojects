var test = require('tape')
var CursorWatch = require('../src/js.js')


// Figure out how this works
// 1. Setup the HTML.
var textarea = document.createElement('textarea')
textarea.value = 'test'
document.body.appendChild(textarea)

// User
var cursorWatch = new CursorWatch(textarea, function() {
   //onsole.log('textarea changed')
})



test('textarea exists', t => {
   t.pass('query select textarea', document.querySelector('textarea').length)
   t.end()
})

test('textarea is focused', t => {
   textarea.focus()
   t.equals(document.activeElement, textarea, 'document.activeElement equals textarea')
   t.end()
})
