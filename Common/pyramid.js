pyramid_vertices = [
    vec3(-0.5, -0.5, +0.5),     // 0
    vec3(+0.5, -0.5, +0.5),     // 1
    vec3(+0.5, -0.5, -0.5),     // 2
    vec3(-0.5, -0.5, -0.5),     // 3
    vec3(0.0, 0.5, 0.0),  // 4
];

var pyramid_points = [];
var pyramid_normals = [];
var pyramid_faces = [];
var pyramid_edges = [];

var pyramid_points_buffer;
var pyramid_normals_buffer;
var pyramid_faces_buffer;
var pyramid_edges_buffer;

function pyramidInit(gl) {
    pyramidBuild();
    pyramidUploadData(gl);
}

function pyramidBuild()
{
    squareAddFace(0,1,2,3,vec3(0,-1,0));
	triangleAddFace(0,1,4,vec3(0,1,1));
	triangleAddFace(1,2,4,vec3(1,1,0));
	triangleAddFace(2,3,4,vec3(0,1,-1));
	triangleAddFace(3,0,4,vec3(-1,1,0));
}

function pyramidUploadData(gl)
{
    pyramid_points_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramid_points_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pyramid_points), gl.STATIC_DRAW);
    
    pyramid_normals_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramid_normals_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pyramid_normals), gl.STATIC_DRAW);
    
    pyramid_faces_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramid_faces_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(pyramid_faces), gl.STATIC_DRAW);
    
    pyramid_edges_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramid_edges_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(pyramid_edges), gl.STATIC_DRAW);
}

function pyramidDrawWireFrame(gl, program)
{    
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramid_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramid_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramid_edges_buffer);
    gl.drawElements(gl.LINES, pyramid_edges.length, gl.UNSIGNED_BYTE, 0);
}

function pyramidDrawFilled(gl, program)
{
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramid_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramid_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramid_faces_buffer);
    gl.drawElements(gl.TRIANGLES, pyramid_faces.length, gl.UNSIGNED_BYTE, 0);
}

function squareAddFace(a, b, c, d, n)
{
    var offset = pyramid_points.length;
    
    pyramid_points.push(pyramid_vertices[a]);
    pyramid_points.push(pyramid_vertices[b]);
    pyramid_points.push(pyramid_vertices[c]);
    pyramid_points.push(pyramid_vertices[d]);
    for(var i=0; i<4; i++)
        pyramid_normals.push(n);
  
    // Add 2 triangular faces (a,b,c) and (a,c,d)
    pyramid_faces.push(offset);
    pyramid_faces.push(offset+1);
    pyramid_faces.push(offset+2);
    
    pyramid_faces.push(offset);
    pyramid_faces.push(offset+2);
    pyramid_faces.push(offset+3);
    
    // Add first edge (a,b)
    pyramid_edges.push(offset);
    pyramid_edges.push(offset+1);
    
    // Add second edge (b,c)
    pyramid_edges.push(offset+1);
    pyramid_edges.push(offset+2);
	
	// Add third edge (c,d)
    pyramid_edges.push(offset+2);
    pyramid_edges.push(offset+3);
	
	// Add forth edge (d,a)
    pyramid_edges.push(offset+3);
    pyramid_edges.push(offset);
	
}

function triangleAddFace(a, b, c, n)
{
	var offset = pyramid_points.length;
	
	pyramid_points.push(pyramid_vertices[a]);
	pyramid_points.push(pyramid_vertices[b]);
	pyramid_points.push(pyramid_vertices[c]);
	for(var i=0; i<3; i++)
		pyramid_normals.push(n);
	
	//Add 1 triangular face (a,b,c)
	pyramid_faces.push(offset);
	pyramid_faces.push(offset+1);
	pyramid_faces.push(offset+2);
	
	// Add first edge (a,c)
	pyramid_edges.push(offset);
    pyramid_edges.push(offset+2);

    // Add second edge (c,b)
    pyramid_edges.push(offset+2);
    pyramid_edges.push(offset+1);
}