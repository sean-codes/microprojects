//For the demo only
setTimeout(function(){
   document.getElementById('downloads').classList.add('demo')
}, 1000)
document.body.addEventListener('click', function(){
   document.getElementById('downloads').classList.remove('demo')
});
