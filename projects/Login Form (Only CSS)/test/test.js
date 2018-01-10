var test = require('tape');

test('timing test', t => {
   document.body.innerHTML = 'tests'
   t.equals('test', document.body.innerHTML, 'yay!')
   t.end()
})
