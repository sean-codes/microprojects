var test = require('tape')

document.body.innerHTML = 'test me!';

test('document.body.innerHTML equals "test me!"', t => {
   t.equals('test me!', document.body.innerHTML, 'yay!')
   t.end()
})
