#version 300 es

uniform vec3 position; //= vec3(0,0,0);
uniform vec3 rotation;
uniform vec3 scale; //= vec3(1,1,1);
uniform mat4 gWorld;
uniform mat4 gView;

layout (location = 0)in vec3 coord;
layout (location = 1)in vec3 normal;
layout (location = 2)in vec2 uv;

out vec2 textcoord;
out float constant;
out vec3 Normal;
out vec3 FragPos;

void main() {
    mat4 rotate_matr = mat4(
        1,  0,                0,            0,
        0,cos(rotation.r),-sin(rotation.r),0,
        0,sin(rotation.r),cos(rotation.r),0,
        0,0,                0,              1)
    *  mat4(
        cos(rotation.y),    0,  sin(rotation.y),    0,
        0,                  1,      0,   0,
        -sin(rotation.y),   0,  cos(rotation.y),    0,
        0,                  0,                 0,  1)
    *  mat4(
        cos(rotation.z),    -sin(rotation.z),  0,    0,
        sin(rotation.z),  cos(rotation.z),  0,   0,
        0,                          0,      1,      0,
        0,              0,                  0,      1);

    vec4 pos = vec4(coord,1);
    pos = pos *
    mat4(
        scale.x,0,0,0,
        0,scale.y,0,0,
        0,0,scale.z,0,
        0,0,0,1); // scale
    pos = rotate_matr*pos; // rotate
    pos = pos + vec4(position,0); // position

    pos = gWorld*gView* pos;

    gl_Position = pos;//vec4(pos.r,pos.g-0.2,pos.b,pos.a);
    textcoord = uv;
    constant = 1.0;
    FragPos = pos.rgb;
    vec4 n = vec4(normal,1)*rotate_matr;
    Normal = n.rgb;
}