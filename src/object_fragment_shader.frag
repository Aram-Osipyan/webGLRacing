precision mediump float;

varying vec3 v_normal;

uniform vec4 u_diffuse;
uniform vec3 u_lightDirection;
uniform sampler2D u_texture;

varying vec2 texCo;
void main () {
    vec3 normal = normalize(v_normal);
    float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
    gl_FragColor = texture2D(u_texture, texCo);
    //gl_FragColor = vec4(u_diffuse.rgb * fakeLight, u_diffuse.a);
}