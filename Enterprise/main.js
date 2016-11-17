// interactive program that displays the enterprise with perspective projection

//Finished By:
//Muaawia Bin Arshad 

var canvas;
var gl;
var motiondirect;
var gouraudProgram, simpleProgram;

var clearColor = vec4(0.0, 0.0, 0.0, 1.0);
var currangle = 0;
var lookFrom = vec3(0.0, 0.0, -5.0);
var looksAt = vec3(0.0, 0.0, 0.0);
var lookUp = vec3(0.0, 1.0, 0.0);

var motionUp = 0;
var motionLeft = 0;
var buttonDown = 0;
var turntheta = 0;
var theta1 = 0;
var theta2 = 0;
var theta3 = 0;
var theta4 = 0;
var prevT = 0;
var spherical = vec3(0.0, 0.0, -0.5);
//var turntheta = 0;
var fieldOfView = 60;
var aspectRatio = 1;
var near = 1;
var far = 1000;

var lightPosition = vec4(2000, 10000, 10000, 1.0 );
var lightColor= vec4 (1.0, 1.0, 1.0, 1.0);

var materialColor= vec4 (0.5, 0.5, 0.8, 1.0);
var materialKa = 0.4;
var materialKd = 0.8;
var materialKs = 0.8;
var materialShininess = 30.0;

var modelMatrix, viewMatrix, projectionMatrix, normMatrix;
var modelViewMatrix, combinedMatrix, simpleCombinedMatrix;
var modelMatrixLoc, combinedMatrixLoc, normalMatrixLoc, eyeLoc;
var simpleCombinedMatrixLoc, simpleViewMatrixLoc;

// enterprise initial position/orientation
var currentSpeed = 0;
var currentPosition = vec3(0.0, 0.0, 0.0);
var currentDirection = vec3(0, 0.0, 1.0);

var mouseButtonDown = 0;

var currentTime = 0.0 ; // Realtime
var previousTime = 0.0 ;

window.onload = function init() {
    // initialie webgl to default values
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    setViewport(canvas);
    gl.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
    gl.enable(gl.DEPTH_TEST);


    // initialize simple shaders
	simpleProgram = initShaders( gl, "simple-vertex-shader", "simple-fragment-shader" );
	gl.useProgram( simpleProgram );

	simpleCombinedMatrixLoc = gl.getUniformLocation( simpleProgram, "combinedMatrix" );
	simpleViewMatrixLoc = gl.getUniformLocation( simpleProgram, "viewMatrix" );

	Stars.init(simpleProgram);

    //  initialize gouraud shaders
    gouraudProgram = initShaders( gl, "gouraud-vertex-shader", "gouraud-fragment-shader" );
    gl.useProgram( gouraudProgram );

    // initialize fragment shader lighting parameters
	eyeLoc = gl.getUniformLocation(gouraudProgram, "eye");
    gl.uniform3fv( eyeLoc,flatten(lookFrom) );
    gl.uniform4fv( gl.getUniformLocation(gouraudProgram, "lightPosition"),flatten(lightPosition) );
    gl.uniform4fv( gl.getUniformLocation(gouraudProgram, "lightColor"),flatten(lightColor) );
    gl.uniform4fv( gl.getUniformLocation(gouraudProgram, "materialColor"),flatten(materialColor) );
    gl.uniform1f( gl.getUniformLocation(gouraudProgram, "Ka"), materialKa);
    gl.uniform1f( gl.getUniformLocation(gouraudProgram, "Kd"),materialKd );
    gl.uniform1f( gl.getUniformLocation(gouraudProgram, "Ks"),materialKs );
    gl.uniform1f( gl.getUniformLocation(gouraudProgram, "shininess"),materialShininess );

    modelMatrixLoc = gl.getUniformLocation( gouraudProgram, "modelMatrix" );
    normalMatrixLoc = gl.getUniformLocation( gouraudProgram, "normalMatrix" );
    combinedMatrixLoc = gl.getUniformLocation( gouraudProgram, "combinedMatrix" );

	Enterprise.init(gouraudProgram);

	// set up interaction callback functions
	canvas.addEventListener('mousedown', function(event) {
		mouseButtonDown = 1;
	})
	canvas.addEventListener('mouseup', function(event) {
		mouseButtonDown = 0;
	})
	canvas.addEventListener('mousemove', function(event) {
		var rect = canvas.getBoundingClientRect();
		motionLeft = 0.5 - (event.clientX-rect.left)/rect.width;
		motionUp = (event.clientY-rect.top)/rect.height -0.5;
		if(mouseButtonDown == 0) {
			theta1 = motionLeft * -60;
			theta2 = motionUp * -60;
		//	if (motionLeft<0)
		//	{
		//	  currangle = 
		//	}
		//	else
		//	{
		//		currangle--;
		//	}
		} else {
			theta3 = motionLeft * 360;
			theta4 = motionUp * 180;
		}
	})
    document.addEventListener('keydown', function(event) {
		if(event.keyCode == 70) {// 'f'
		   currentSpeed++;
		}
		else if(event.keyCode == 83) { //'s'
			currentSpeed--;
			if(currentSpeed < 0)
				currentSpeed= 0;
		}
		else if(event.keyCode == 68) { //'d'
			currentSpeed= 0;
		}
	});

  canvas.resize = function (){
		setViewport(canvas);
		render();
	}

    currentTime = (new Date()).getTime() /1000 ;
    render();
}

function setViewport(canvas) {
	var c_w = window.innerWidth;  var c_h = window.innerHeight-50;
	canvas.width = c_w;   canvas.height = c_h;
	gl.viewport(0, 0, c_w, c_h);
	aspectRatio = (c_w*1.0)/c_h;
}

// Pre multiplies the model matrix with a translation matrix
// and replaces the model matrix with the result
function gTranslate(x,y,z) {
    modelMatrix = mult(translate(x,y,z), modelMatrix) ;
}

// Pre multiplies the model matrix with a rotation matrix
// and replaces the model matrix with the result
function gRotate(theta,x,y,z) {
    modelMatrix = mult(rotate(theta,[x,y,z]), modelMatrix) ;
}

// Pre multiplies the model matrix with a scaling matrix
// and replaces the model matrix with the result
function gScale(sx,sy,sz) {
    modelMatrix = mult(scale(sx,sy,sz), modelMatrix) ;
}


function render() {
   gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   // compute delta t
   var prePos = currentPosition;
   previousTime = currentTime;
   currentTime = (new Date()).getTime() /1000 ;
   var deltaT = currentTime - previousTime;  // in seconds
	
   turntheta = turntheta + theta1/100;
   var PositiveZ = Math.abs(turntheta % 360);
   if (PositiveZ < 90 || PositiveZ > 270)
   {
	   motiondirect = "Forward";
   }
   else{
	   motiondirect = "Backward";
   }
 //  if (turntheta > 180){turntheta = 180}
   //if (turntheta < -180) { turntheta = -180}
//turntheta = turntheta + theta1/60;
 //if	 (theta1 > 27){
 //turntheta =Math.min(90, turntheta + 0.5);
 /*f (theta1 >= 0)
 {
 turntheta = Math.min(90, turntheta + theta1/20)
 }//theta1++;
else{
	turntheta = Math.max(-90, turntheta + theta1/20)

}
 //console.log(turntheta);
 //} else
 //{
 //turntheta = theta1;
 //console.log(turntheta);
// }*/
// turntheta = theta1*3;
	//turntheta = turntheta + (theta1 / (2*deltaT));
	//turntheta = currangle*deltaT;
	
	currentDirection = vec3(Math.sin(-1 * radians(turntheta)), 0.0, Math.cos(radians(turntheta)));
	currentDirection = add(currentDirection, vec3(0.0, Math.sin(-1 * radians(theta2 * 2)), 0));
	currentDirection = normalize(currentDirection);

   // find new x-z position of enterprise
   var velocity = scale(deltaT*currentSpeed, currentDirection);
	currentPosition = add(currentPosition, velocity);

	modelMatrix = mat4();
	gRotate(theta1, 0.0,0.0,1.0);
	gRotate(theta2, 1.0, 0.0, 0.0);
	gRotate(-turntheta, 0.0,1.0,0.0);
	gTranslate(currentPosition);

//	if(mouseButtonDown != 0)
	spherical = vec3(5*Math.sin(radians(theta3 - turntheta))*Math.cos(radians(theta4)), 5*Math.sin(radians(theta4)), 5*Math.cos(radians(theta4))*Math.cos(radians(theta3 - turntheta)));	
//if(mouseButtonDown == 0){
//	spherical2 = vec3(5*Math.sin(radians((turntheta + theta3) * -1.0))*Math.cos(radians(theta4)), 5*Math.sin(radians(theta4)), 5*Math.cos(radians(theta4))*Math.cos(radians((turntheta + theta3) * -	1.0)));
//	spherical = mix(spherical, spherical2, 0.5);
//}
//	prevT = theta1;
	lookFrom = subtract(currentPosition, spherical);
	
	var jj = prePos;
//	if (mouseButtonDown == 0 )
//	{
//	lookFrom  = subtract(currentPosition, scale(5, currentDirection));	
//	}
	
		/*lookFrom  = scale(length(currentPosition) - 5, normalize(currentPosition));
	

	}*/
	// compute eye location/direction (try to stay reasonable distance away)
	looksAt = currentPosition;

   // set viewing parameters
   projectionMatrix = perspective(fieldOfView, aspectRatio, near, far);
   viewMatrix = lookAt(lookFrom, looksAt, lookUp);

   // update matrices in gouraud shader and redraw enterprise
   gl.useProgram( gouraudProgram );
   gl.uniform3fv( eyeLoc,flatten(lookFrom) );
   gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix) );
   normMatrix = normalMatrix(modelMatrix, false) ;
   gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(normMatrix) );
   modelViewMatrix = mult(viewMatrix, modelMatrix);
   combinedMatrix = mult(projectionMatrix, modelViewMatrix);
   gl.uniformMatrix4fv(combinedMatrixLoc, false, flatten(combinedMatrix) );
   Enterprise.draw();

   // update matrix in simple shader and redraw stars
   gl.useProgram( simpleProgram );
   simpleCombinedMatrix = mult(projectionMatrix, viewMatrix);
   gl.uniformMatrix4fv(simpleCombinedMatrixLoc, false, flatten(simpleCombinedMatrix) );
   gl.uniformMatrix4fv(simpleViewMatrixLoc, false, flatten(viewMatrix) );
	Stars.draw();

	// update info on screen
   	document.getElementById("ScreenInfo").innerHTML ="Current speed: " + currentSpeed +
   		",  Current Position: ("+ Math.round(currentPosition[0])+", "+ Math.round(currentPosition[1])+", "+ Math.round(currentPosition[2])+")"+	 "lookFrom="+Math.round(lookFrom[0])+" "+Math.round(lookFrom[1])+" "+Math.round(lookFrom[2]) + " turn:" + Math.round(turntheta) + "...MotionDirection" + motiondirect 
   		 ;
   		 //"spherical="+Math.round(spherical[0])+" "+Math.round(spherical[1])+" "+Math.round(spherical[2]) + "spherical2="+Math.round(spherical2[0])+" "+Math.round(spherical2[1])+" "+Math.round(spherical2[2]) 
    window.requestAnimFrame(render);
}