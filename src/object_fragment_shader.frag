precision mediump float;

uniform vec4 u_diffuse;
uniform vec3 u_lightDirection;
uniform sampler2D u_texture;

varying vec2 textcoord;
varying float constant;
varying vec3 Normal;
varying vec3 FragPos;
void main () {
    vec3 lightColor = vec3(1,1,1);
    vec3 objectColor = texture2D(u_texture, textcoord).rgb;
    // ambient
    float ambient = 0.5;

    // diffuse
    vec3 norm = normalize(Normal);
    vec3 lightDir = vec3(1,1,0);
    float diffuse = max(dot(norm, lightDir), 0.0);
    //vec3 diffuse = diff * lightColor;

    vec3 result = (ambient + diffuse) * lightColor * objectColor;

    gl_FragColor = vec4(result, 1.0);
}