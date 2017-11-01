//Globals
var canvas, ctx, img, old_scale;
old_scale = 0;
//Load the Image
img = new Image();
img.src = "https://s32.postimg.org/91lvd9akl/axe.png";
img.x_off = document.getElementById('xof').value;
img.y_off = document.getElementById('yof').value;


//Rotate
document.body.onload = function(){
  //Get the Canvas
  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true; 
  setInterval(draw, 10);
}

function draw(){
  //Coords
  x = Number(document.getElementById('xco').value);
  y = Number(document.getElementById('yco').value);
  
  //Offsets
  img.x_off = Number(document.getElementById('xof').value);
  img.y_off = Number(document.getElementById('yof').value);
  
  //Angle/Scale
  angle = document.getElementById('rot').value;
  scale = Number(document.getElementById('sca').value);
  if(scale !== old_scale){
    //reset scale and set scale
    canvas.width = canvas.width;
    ctx.imageSmoothingEnabled = false; 
    ctx.scale(scale, scale);
  }
  old_scale = scale;
  draw_image_rotated(img, x, y, angle);
}

function draw_image_rotated(img, x, y, angle){
  ctx.clearRect(0, 0, 300, 300);
	//Save the current coordinate system 
  
  //Draw the xoff/yoff DEBUG ONLY
  ctx.setLineDash([2, 2]);  

  ctx.beginPath();
  ctx.moveTo(x-40,y);
  ctx.lineTo(x+40,y);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(x,y-40);
  ctx.lineTo(x,y+40);
  ctx.stroke();
  
	ctx.save(); 
 
	//Move to the pos
	ctx.translate(x, y);
 
	//Rotate at that point
	ctx.rotate(angle * Math.PI/180);
 
	//Draw the image 
	ctx.drawImage(img, -(img.x_off), -(img.y_off));
 
	//Restore the canvas
	ctx.restore(); 
}

//Style Codepen Display Functions
function update_range(ele){
  var l = document.getElementById("l_" + ele.id);
  l.innerHTML = ele.value;
}