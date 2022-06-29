var torus_points = [];
var torus_normals = [];
var torus_faces = [];
var torus_edges = [];

var torus_points_buffer;
var torus_normals_buffer;
var torus_faces_buffer;
var torus_edges_buffer;

var TORUS_LATS=20;
var TORUS_LONS=30;
var TORUS_R=0.5;
var CIRCLE_R=0.25;

function torusInit(gl) {
    torusBuild(TORUS_LATS, TORUS_LONS, TORUS_R, CIRCLE_R);
    torusUploadData(gl);
}

// Generate points using polar coordinates
function torusBuild(nlat, nlon, torus_r, circle_r) 
{
    // Generate points
    var d_theta = 2*Math.PI / nlon;
    var d_alpha = 2*Math.PI / nlat;
    
    for (var i=0, theta=0; i<nlon; i++, theta+=d_theta){
        for(var j=0, alpha=0; j<nlat; j++, alpha+=d_alpha){
            var pt = vec3(Math.cos(theta)*(Math.cos(alpha)*circle_r+torus_r), Math.sin(alpha)*circle_r, Math.sin(theta)*(Math.cos(alpha)*circle_r+torus_r));
            torus_points.push(pt);
            //tangent vector with respect to big circle
            var t = vec3(-Math.sin(theta), 0, Math.cos(theta));
            //tangent vector with respect to little circle
            var s = vec3((-Math.sin(alpha))*Math.cos(theta), Math.cos(alpha), (-Math.sin(alpha))*Math.sin(theta));
            //normal is cross-product of tangents
            var n = vec3(-(t[1]*s[2]-t[2]*s[1]), -(t[2]*s[0]-t[0]*s[2]), -(t[0]*s[1]-t[1]*s[0]));

            torus_normals.push(normalize(n));
        }    
    }

    //Generate faces
    for (var i=0, theta=0; i<nlon; i++, theta+=d_theta){
        for(var j=0, alpha=0; j<nlat; j++, alpha+=d_alpha){
            //First triangle
            torus_faces.push(i*nlat+j);
            
            if (i<nlon-1){
                torus_faces.push(i*nlat+nlat+j);
            } else {
                torus_faces.push(j);
            }
            
            if (i<nlon-1 && j<nlat-1){
                torus_faces.push(i*nlat+nlat+j+1);
            } else if (i<nlon-1){
                torus_faces.push(i*nlat+nlat);
            } else if (j<nlat-1){
                torus_faces.push(j+1);
            } else {
                torus_faces.push(0);
            }

            

            //Second triangle
            torus_faces.push(i*nlat+j);
            
            if (i<nlon-1 && j<nlat-1){
                torus_faces.push(i*nlat+nlat+j+1);
            } else if (i<nlon-1){
                torus_faces.push(i*nlat+nlat);
            } else if (j<nlat-1){
                torus_faces.push(j+1);
            } else {
                torus_faces.push(0);
            }
            
            if (j<nlat-1){
                torus_faces.push(i*nlat+j+1);
            } else {
                torus_faces.push(i*nlat+0);
            }
        }
    }

    //Generate edges
    for (var i=0, theta=0; i<nlon; i++, theta+=d_theta){
        for(var j=0, alpha=0; j<nlat; j++, alpha+=d_alpha){
            //Circle edges
            torus_edges.push(i*nlat+j);
            if (j<nlat-1){
                torus_edges.push(i*nlat+j+1);
            } else {
                torus_edges.push(i*nlat+0);
            }

            //Edges that connect circles to eachother
            torus_edges.push(i*nlat+j);
            if (i<nlon-1){
                torus_edges.push(i*nlat+nlat+j);
            } else {
                torus_edges.push(j);
            }
        }
    }
}

function torusUploadData(gl)
{
    torus_points_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, torus_points_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(torus_points), gl.STATIC_DRAW);
    
    torus_normals_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, torus_normals_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(torus_normals), gl.STATIC_DRAW);
    
    torus_faces_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torus_faces_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(torus_faces), gl.STATIC_DRAW);
    
    torus_edges_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torus_edges_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(torus_edges), gl.STATIC_DRAW);
}

function torusDrawWireFrame(gl, program)
{    
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, torus_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, torus_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torus_edges_buffer);
    gl.drawElements(gl.LINES, torus_edges.length, gl.UNSIGNED_SHORT, 0);
}

function torusDrawFilled(gl, program)
{
    gl.useProgram(program);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, torus_points_buffer);
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, torus_normals_buffer);
    var vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torus_faces_buffer);
    gl.drawElements(gl.TRIANGLES, torus_faces.length, gl.UNSIGNED_SHORT, 0);
}

