const vec4 lightPosition = vec4(0.0, 1.8, 1.3, 1.0);

attribute vec4 vPosition;   // vertex position in modelling coordinates
attribute vec4 vNormal;     // vertex normal in modelling coordinates

uniform mat4 mModelView;    // model-view transformation
uniform mat4 mNormals;      // model-view transformation for normals
uniform mat4 mProjection;   // projection matrix

varying vec3 fNormal;       // normal vector in camera space (to be interpolated)
varying vec3 fLight;
varying vec3 fViewer;

void main(){
    // compute position in camera frame
    vec3 posC = (mModelView * vPosition).xyz;
    
    // compute normal in camera frame
    fNormal = (mNormals * vNormal).xyz;

    // compute light vector in camera frame
    if(lightPosition.w == 0.0) 
        fLight = normalize((mNormals * lightPosition).xyz);
    else 
        fLight = normalize((mNormals*lightPosition).xyz - posC);
    
    // Compute the view vector
    // fViewer = -fPosition; // Perspective projection
    fViewer = vec3(0,0,1); // Parallel projection only

    // Compute vertex position in clip coordinates (as usual)
    gl_Position = mProjection * mModelView * vPosition;
}

