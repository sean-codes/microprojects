mouse_x = 0;
mouse_y = 0;

//The View
view = document.getElementById('view');
ctx_view = view.getContext('2d');

//The Surface
surface = document.getElementById('surface');
ctx_surface = surface.getContext('2d');

//Fill with Black
setInterval(function(){
  //ctx.clearRect(0, 0, 400, 200);
  ctx_surface.globalCompositeOperation = 'source-over'; 
  ctx_surface.fillStyle = "black";
  ctx_surface.fillRect(0, 0, 800, 400);
  ctx_surface.globalCompositeOperation = 'xor';
  draw_light(mouse_x, mouse_y, 200, 1);
  
  ctx_view.clearRect(0, 0, 800, 400);
  ctx_view.fillStyle="black";
  ctx_view.fillText("Hello World!",10,50);
  ctx_view.fillStyle="red";
  ctx_view.fillRect(50, 50,100,100);
  ctx_view.drawImage(surface, 0, 0);
}, 1000/60); 

function draw_light(x, y, rad, int){
  //Set Draw Style
  ctx_surface.globalCompositeOperation = 'xor';
  
  //Draw a circle
  var g = ctx_surface.createRadialGradient(x, y, 0, x, y, rad);
  g.addColorStop(1, 'transparent'); 
  g.addColorStop(0, 'black'); 
  ctx_surface.fillStyle = g;
  ctx_surface.beginPath();
  ctx_surface.arc(x, y, rad, 0, Math.PI*2, true); 
  ctx_surface.closePath(); 
  //Fill
  ctx_surface.fill();
 
}


//Extras
function set_mouse_pos(e){
  var rect = document.getElementById('view').getBoundingClientRect();
  mouse_x = e.clientX - rect.left;
  mouse_y = e.clientY - rect.top;
}