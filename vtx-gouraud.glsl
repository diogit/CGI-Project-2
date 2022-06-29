const vec4 lightPosition = vec4(0.0, 1.8, 1.3, 1.0);

const vec3 materialAmb = vec3(1.0, 0.0, 0.0);
const vec3 materialDif = vec3(1.0, 0.0, 0.0);
const vec3 materialSpe = vec3(1.0, 1.0, 1.0);
const float shininess = 6.0;

const vec3 lightAmb = vec3(0.2, 0.2, 0.2);
const vec3 lightDif = vec3(0.7, 0.7, 0.7);
const vec3 lightSpe = vec3(1.0, 1.0, 1.0);

vec3 ambientColor = lightAmb * materialAmb;
vec3 diffuseColor = lightDif * materialDif;
vec3 specularColor = lightSpe * materialSpe;

attribute vec4 vPosition; 
attribute vec4 vNormal;

uniform mat4 mModelView;       // model-view transformation
uniform mat4 mNormals;  // model-view transformation for normals
uniform mat4 mProjection;     // projection matrix

varying vec4 fColor;

void main()
{
    // position in camera frame
    vec3 posC = (mModelView * vPosition).xyz;
    
    // Normalized vector pointing to light at vertex
    vec3 L;

    if(lightPosition.w == 0.0) 
        L = normalize(lightPosition.xyz);
    else 
        L = normalize(lightPosition.xyz - posC);
        
    // Notice: since lightPosition is not transformed by mModelView,
    // its coordinates are already in camera frame 
    // (otherwise the above GLSL 4 lines would be meaningless)

    // Eye is at origin in camera frame, thus E = -posC (for perspective projection only)
    // vec3 V = normalize(-posC);
    
    // However, we will use a distante observer positioned along the +Z axis (parallel projection)
    vec3 V = vec3(0,0,1);
    
    // Compute the halfway vector for Phong-Blinn model
    vec3 H = normalize(L+V);

    // normal vectors are trasnformed to camera frame using a mNormals, 
    // a matrix derived from mModelView (see .js code)
    vec3 N = normalize( (mNormals * vNormal).xyz);

    // compute diffuse reflection, don't let the vertex be illuminated from behind...
    float diffuseFactor = max( dot(L,N), 0.0 );
    vec3 diffuse = diffuseFactor * diffuseColor;

    // compute specular reflection
    float specularFactor = pow(max(dot(N,H), 0.0), shininess);
    vec3 specular = specularFactor * specularColor;
    
    // specular reflection should be 0 if normal is pointing away from light source
    if( dot(L,N) < 0.0 ) {
        specular = vec3(0.0, 0.0, 0.0);
    }

    // Compute final position in clip coordinates
    gl_Position = mProjection * mModelView * vPosition;
    
    // add all 3 components from the illumination model (ambient, diffuse and specular)
    fColor = vec4(ambientColor + diffuse + specular, 1.0);
}

