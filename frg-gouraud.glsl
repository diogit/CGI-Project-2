precision mediump float;

varying vec4 fColor;
void main() {
    // Since all the work is done at the vertex shader, 
    // simply pass along the interpolated color
    gl_FragColor = fColor;
}
