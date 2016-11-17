// Stars

var Stars = {} ;

Stars.position;
Stars.color;
Stars.count = 400000;
Stars.shaderPrograms;
Stars.posBuffer;
Stars.posLocation;
Stars.colBuffer;
Stars.colLocation;

Stars.init = function(programs) {
	Stars.position = new Float32Array(Stars.count*4);
	Stars.color = new Float32Array(Stars.count*4);
	var universe = 5000;
			
	for(i=0; i < Stars.count; i++) {
		Stars.position[3*i] = 2*universe*Math.random()-universe;
		Stars.position[3*i+1] = 2*universe*Math.random()-universe;
		Stars.position[3*i+2] = 2*universe*Math.random()-universe;
		Stars.color[3*i] = 0.5*Math.random()+0.5;
		Stars.color[3*i+1] = 0.5*Math.random()+0.5;
		Stars.color[3*i+2] = 0.5*Math.random()+0.5;
	}
	
	Stars.shaderPrograms = programs;
	
	Stars.posBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, Stars.posBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, Stars.position, gl.STATIC_DRAW);
	Stars.posLocation = gl.getAttribLocation(Stars.shaderPrograms, "vPosition");
	gl.enableVertexAttribArray( Stars.posLocation );
	gl.vertexAttribPointer(Stars.posLocation, 3, gl.FLOAT, false, 0, 0);
	
	Stars.colBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, Stars.colBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, Stars.color, gl.STATIC_DRAW);
	Stars.colLocation = gl.getAttribLocation(Stars.shaderPrograms, "vColor");
	gl.enableVertexAttribArray( Stars.colLocation );
	gl.vertexAttribPointer(Stars.colLocation, 3, gl.FLOAT, false, 0, 0);
}

Stars.draw = function() {
	// reconnect buffers to attributes; assume simple shaders being used
	gl.bindBuffer(gl.ARRAY_BUFFER, Stars.posBuffer);
	gl.vertexAttribPointer(Stars.posLocation, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray( Stars.posLocation );
	gl.bindBuffer(gl.ARRAY_BUFFER, Stars.colBuffer);
	gl.enableVertexAttribArray( Stars.colLocation );
	gl.vertexAttribPointer(Stars.colLocation, 3, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.POINTS, 0,Stars.count);
}