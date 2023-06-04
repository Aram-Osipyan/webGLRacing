#version 300 es
precision mediump float;
in vec2 textcoord;
in float constant;
in vec3 Normal;
in vec3 FragPos;

out vec4 FragColor;

uniform sampler2D textureData;
uniform vec3 lightPos;
uniform vec3 view;

void main() {
    vec3 lightColor = vec3(1,1,1);
    vec3 objectColor = texture(textureData, textcoord).rgb;
    // ambient
    float ambient = 0.5;

    // diffuse
    vec3 norm = normalize(Normal);
    vec3 lightDir = view;
    float diffuse = max(dot(norm, lightDir), 0.0);
    //vec3 diffuse = diff * lightColor;

    vec3 result = (ambient + diffuse) * lightColor * objectColor;

    FragColor = vec4(result, 1.0);
}