// Testing this object
var tape = require('tape');
var CursorWatch = require('../src/js.js');


// Figure out how this works
// 1. Setup the HTML.
var textarea = document.createElement('textarea')
textarea.value = 'tape'
document.body.appendChild(textarea)

tape('HTML is setup', t => {
   t.ok(document.querySelector('textarea'), 'query select textarea')

   textarea.focus()
   t.equals(document.activeElement, textarea, 'textarea is focused')

   var textBox = textarea.getBoundingClientRect()
   t.pass('texrarea width greater than 0', textBox.width > 0)

   t.end()
})

tape('Cursor watch does not have a callback', t => {
   var cursorWatch = new CursorWatch(textarea)
   t.ok(cursorWatch.callback == undefined, 'callback is undefined')
   t.end()
})


tape('Fakedisplay clones textarea', t => {
   var cursorWatch = new CursorWatch(textarea)
   cursorWatch.updateFake()
   var textBox = cursorWatch.input.getBoundingClientRect()
   var fakeBox = cursorWatch.fake.getBoundingClientRect()

   t.deepEqual(fakeBox, textBox, 'bounding client matches')
   t.end()
})

tape('Initial cursor positon', t => {
   var cursorWatch = new CursorWatch(textarea)
   cursorWatch.updateFake()
   cursorWatch.updateCursorXYPosition()

   t.equal(cursorWatch.data.x, 2, 'Initial XPos')
   t.equal(cursorWatch.data.y, 2, 'Initial YPos')
   t.end()
})

tape('Moved cursor position', test => {
   var cursorWatch = new CursorWatch(textarea, function(data) {
      test.equal(cursorWatch.data.position, 2, 'Cursor is at position 2')
      test.equal(cursorWatch.data.x, 12, 'Moved XPos')
      test.equal(cursorWatch.data.y, 2, 'Moved YPos')
      test.end()
   })

   cursorWatch.input.setSelectionRange(2, 2)
})
