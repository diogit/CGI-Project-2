var gl;
var canvas;
var program, program1, program2;


var mModelView;
var mModelViewLoc;
var mNormals;
var mNormalsLoc;
var mProjection;
var mProjectionLoc;
var paintWhite;
var paintWhiteLoc;

var model, drawMode, projection, modelSelect, drawModeSelect, projectionSelect, obl_l, obl_a, axo_gamma, axo_theta, per_d;

function load_file() {
    var selectedFile = this.files[0];
    var reader = new FileReader();
    var id=this.id == "vertex" ? "vertex-shader-2" : "fragment-shader-2";
    reader.onload = (function(f){
        var fname = f.name;
        return function(e) {
            console.log(fname);
            console.log(e.target.result);
            console.log(id);
            document.getElementById(id).textContent = e.target.result;
            if (!(document.getElementById("vertex-shader-2").textContent == "" || document.getElementById("fragment-shader-2").textContent == "")){
				program2 = initShaders(gl, "vertex-shader-2", "fragment-shader-2");
				if (program2 != -1){
					reset_program(program2);
            		program = program2;
				}            	
            }            
        }
    })(selectedFile);
    reader.readAsText(selectedFile);
}

function reset_program(prg) {
    mModelViewLoc = gl.getUniformLocation(prg, "mModelView");
    mNormalsLoc = gl.getUniformLocation(prg, "mNormals");
    mProjectionLoc = gl.getUniformLocation(prg, "mProjection");
    paintWhiteLoc = gl.getUniformLocation(prg, "paintWhite");
    program = prg;
}

window.onload = function init() {
    // Get the canvas
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if(!gl) { alert("WebGL isn't available"); }

    // Setup the contexts and the program
    gl = WebGLUtils.setupWebGL(canvas);
    program1 = initShaders(gl, "vertex-shader", "fragment-shader");
    
    gl.enable(gl.DEPTH_TEST);

    model = "cube";
    drawMode = "wireframe";
    projection = "oblique";

    //Init sliders
    document.getElementById("obl_l").value = (obl_l = 1);
    document.getElementById("obl_a").value = (obl_a = 45);
    document.getElementById("axo_gamma").value = (axo_gamma = ((Math.asin(Math.sqrt(Math.tan(radians(42))*Math.tan(radians(7))))) * 180.0)/Math.PI);
    document.getElementById("axo_theta").value = (axo_theta = ((Math.atan(Math.sqrt(Math.tan(radians(42))/Math.tan(radians(7))))-(Math.PI/2)) * 180.0)/Math.PI);
	document.getElementById("per_d").value = (per_d = 2);

    // Add event listeners
    (modelSelect = document.getElementById("Model")).addEventListener("change", onModelSelect);
    (drawModeSelect = document.getElementById("DrawMode")).addEventListener("change", onDrawModeSelect);
    (projectionSelect = document.getElementById("Projection")).addEventListener("change", onPojectionSelect);
    document.getElementById("obl_l").addEventListener("input", onOblLSlide);
    document.getElementById("obl_a").addEventListener("input", onOblASlide);
    document.getElementById("axo_gamma").addEventListener("input", onAxoGammaSlide);
    document.getElementById("axo_theta").addEventListener("input", onAxoThetaSlide);
    document.getElementById("per_d").addEventListener("input", onPerDSlide);

    document.getElementById("vertex").onchange = load_file;
    document.getElementById("fragment").onchange = load_file;

    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    aspect = canvas.width / canvas.height;
    gl.viewport(0,0,canvas.width, canvas.height);

    cubeInit(gl);
    sphereInit(gl);
    pyramidInit(gl);
    torusInit(gl);

    window.onresize = function() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        aspect = canvas.width / canvas.height;
    }

    mModelView = mat4();
    mNormals = transpose(inverse(mModelView));
    mProjection = mat4();

    reset_program(program1);

    render();
}

function drawObject(gl, program) 
{
	switch(model){
	case "cube":
		switch (drawMode){
		case "wireframe":
            gl.uniform1i(paintWhiteLoc, 1);
			cubeDrawWireFrame(gl, program);
			break;
		case "filled":
            gl.uniform1i(paintWhiteLoc, 0);
			cubeDrawFilled(gl, program);
			break;
        case "mixed":
            gl.uniform1i(paintWhiteLoc, 1);
            cubeDrawWireFrame(gl, program);
            gl.uniform1i(paintWhiteLoc, 0);
            cubeDrawFilled(gl, program);
            break;
		}
		break;
	case "sphere":
		switch (drawMode){
		case "wireframe":
            gl.uniform1i(paintWhiteLoc, 1);
			sphereDrawWireFrame(gl, program);
			break;
		case "filled":
            gl.uniform1i(paintWhiteLoc, 0);
			sphereDrawFilled(gl, program);
			break;
        case "mixed":
            gl.uniform1i(paintWhiteLoc, 1);
            sphereDrawWireFrame(gl, program);
            gl.uniform1i(paintWhiteLoc, 0);
            sphereDrawFilled(gl, program);
            break;
		}
		break;
	case "pyramid":
		switch (drawMode){
		case "wireframe":
            gl.uniform1i(paintWhiteLoc, 1);
			pyramidDrawWireFrame(gl, program);
			break;
		case "filled":
            gl.uniform1i(paintWhiteLoc, 0);
			pyramidDrawFilled(gl, program);
			break;
        case "mixed":
            gl.uniform1i(paintWhiteLoc, 1);
            pyramidDrawWireFrame(gl, program);
            gl.uniform1i(paintWhiteLoc, 0);
            pyramidDrawFilled(gl, program);
            break;
		}
		break;
	case "torus":
		switch (drawMode){
		case "wireframe":
            gl.uniform1i(paintWhiteLoc, 1);
			torusDrawWireFrame(gl, program);
			break;
		case "filled":
            gl.uniform1i(paintWhiteLoc, 0);
			torusDrawFilled(gl, program);
			break;
        case "mixed":
            gl.uniform1i(paintWhiteLoc, 1);
            torusDrawWireFrame(gl, program);
            gl.uniform1i(paintWhiteLoc, 0);
            torusDrawFilled(gl, program);
            break;
		}
		break;
	}
}

function render() 
{
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

    //Prevent deformation on resize
    if (canvas.width/canvas.height < 1){
    	mProjection = ortho(-1, 1, -1/aspect, 1/aspect, -10, 10);
    } else {
    	mProjection = ortho(-aspect, aspect, -1, 1, -10, 10);
    }
    
    gl.uniformMatrix4fv(mProjectionLoc, false, flatten(mProjection));

    // Top view
    gl.viewport(0,0,canvas.width/2, canvas.height/2);
    mModelView = rotateX(90);
    mNormals = transpose(inverse(mModelView));
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
    gl.uniformMatrix4fv(mNormalsLoc, false, flatten(mNormals));
    drawObject(gl, program);

    // Other view
    gl.viewport(canvas.width/2,0,canvas.width/2, canvas.height/2);
    switch(projection){
    	case "oblique":
    		mModelView = mat4(1, 0, -obl_l*Math.cos(radians(obl_a)), 0, 0, 1, -obl_l*Math.sin(radians(obl_a)), 0, 0, 0, 1, 0, 0, 0, 0, 1);
            mNormals = mat4();
    		break;
		case "axonometric":
			mModelView = mult(rotateX(axo_gamma), rotateY(axo_theta));
            mNormals = transpose(inverse(mModelView));
    		break;
		case "perspective":
    		mModelView = mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -1/per_d, 1);
            mNormals = mat4();
    		break;
    }
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
    gl.uniformMatrix4fv(mNormalsLoc, false, flatten(mNormals));
    drawObject(gl, program);

    // Front view
    gl.viewport(0,canvas.height/2,canvas.width/2, canvas.height/2);
    mModelView = mat4();
    mNormals = transpose(inverse(mModelView));
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
    gl.uniformMatrix4fv(mNormalsLoc, false, flatten(mNormals));
    drawObject(gl, program);

    // Side view
    gl.viewport(canvas.width/2,canvas.height/2,canvas.width/2, canvas.height/2);
    mModelView = rotateY(90);
    mNormals = transpose(inverse(mModelView));
    gl.uniformMatrix4fv(mModelViewLoc, false, flatten(mModelView));
    gl.uniformMatrix4fv(mNormalsLoc, false, flatten(mNormals));
    drawObject(gl, program);

    window.requestAnimationFrame(render);
}

function onModelSelect(event){
	model = modelSelect.value;
	console.log("[Model Select] model: "+model); //DEBUG
}

function onDrawModeSelect(event){
	drawMode = drawModeSelect.value;
	console.log("[Draw Mode Select] drawMode: "+drawMode); //DEBUG
}

function onPojectionSelect(event){
    document.getElementById(projection+"Div").style.display = "none";
    projection = projectionSelect.value;
    document.getElementById(projection+"Div").style.display = "block";
	console.log("[Projection Select] projection: "+projection); //DEBUG
}

function onOblLSlide(event){
	obl_l = event.target.value;
	console.log("[Obl_L Slide] obl_l: "+obl_l); //DEBUG
}

function onOblASlide(event){
	obl_a = event.target.value;
	console.log("[Obl_A Slide] obl_a: "+obl_a); //DEBUG
}

function onAxoGammaSlide(event){
	axo_gamma = event.target.value;
	console.log("[Axo_Gamma Slide] axo_gamma: "+axo_gamma); //DEBUG
}

function onAxoThetaSlide(event){
	axo_theta = event.target.value;
	console.log("[Axo_Theta Slide] axo_theta: "+axo_theta); //DEBUG
}

function onPerDSlide(event){
	per_d = event.target.value;
	console.log("[Per_D Slide] per_d: "+per_d); //DEBUG
}