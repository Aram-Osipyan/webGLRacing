import fragShaderSource from './object_fragment_shader.frag'
import vertexShaderSource from './objectVertexShader.vert'
import Vector3 from "./Vector3";
import Vertex from "./Vertex";
import Transform from "./transform";

class Object{
    /**
    * @type {WebGL2RenderingContext}
    * */
    gl;
    /**
     * @type {WebGLProgram}
     */
    program;
    uniformLocations;
    textureHandle;

    /**
     * @type {Array.<Vertex>}>}
     */
    vertices = [];
    indices;

    /**
     * @type {Transform}
     */
    transform;
    constructor(textureUrl, mesh, gl) {
        this.transform = new Transform(new Vector3(0,0,0), new Vector3(1,1,1), new Vector3(0,0,0))
        this.gl = gl;
        this.InitShader();
        this.InitTexture(textureUrl);
        this.SetupMesh(mesh);
        this.gl.enable(this.gl.DEPTH_TEST)
    }

    InitShader() {
        let VS = this.getShader(this.gl.VERTEX_SHADER, vertexShaderSource)
        let FS = this.getShader(this.gl.FRAGMENT_SHADER, fragShaderSource)

        if (!this.gl.getShaderParameter(FS, this.gl.COMPILE_STATUS)) {
            console.log(this.gl.getShaderInfoLog(FS), 'fragment');
        }

        if (!this.gl.getShaderParameter(VS, this.gl.COMPILE_STATUS)) {
            console.log(this.gl.getShaderInfoLog(VS), 'vertex');
        }

        this.program = this.gl.createProgram()
        this.gl.attachShader(this.program, VS)
        this.gl.attachShader(this.program, FS)

        this.gl.linkProgram(this.program)
        this.gl.useProgram(this.program)




        this.uniformLocations = {
            position: this.gl.getUniformLocation(this.program, 'position'),
            rotation: this.gl.getUniformLocation(this.program, 'rotation'),
            scale: this.gl.getUniformLocation(this.program, 'scale'),
            texture: this.gl.getUniformLocation(this.program, 'textureData'),
            lightPos: this.gl.getUniformLocation(this.program, 'lightPos'),
            viewVec: this.gl.getUniformLocation(this.program, 'view'),
            gWorld: this.gl.getUniformLocation(this.program, 'gWorld'),
            gView: this.gl.getUniformLocation(this.program, 'gView'),
        }
    }

    InitTexture(textureUrl) {
        const gl = this.gl;
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            width,
            height,
            border,
            srcFormat,
            srcType,
            pixel
        );

        const image = new Image();
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            gl.texImage2D(
                gl.TEXTURE_2D,
                level,
                internalFormat,
                srcFormat,
                srcType,
                image
            );

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        };
        image.src = textureUrl;

        return this.texture;
    }

    SetupMesh(mesh) {
        const gl = this.gl;
        this.ReadVectorsFromFile(mesh);

        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ibo = gl.createBuffer();


        gl.bindVertexArray(this.vao);

        // bind vbo
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        const verData = [];
        for (const item of this.vertices) {
            verData.push(item.position.x);
            verData.push(item.position.y);
            verData.push(item.position.z);

            verData.push(item.normal.x);
            verData.push(item.normal.y);
            verData.push(item.normal.z);

            verData.push(item.texCoords.x);
            verData.push(item.texCoords.y);
            //verData.push(item.texCoords.z);
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verData), gl.STATIC_DRAW);

        // bind ibo
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);


        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT,0);

        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT,3 * Float32Array.BYTES_PER_ELEMENT);

        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 8 * Float32Array.BYTES_PER_ELEMENT,6 * Float32Array.BYTES_PER_ELEMENT);

        //gl.bindVertexArray(0);
    }

    ReadVectorsFromFile(meshFile){
        const infile = meshFile.split(' ').join('\n').split('\n');
        const positions = [];
        const normals = [];
        const uvs = [];
        //console.log(meshFile, 'meshFile')
        //console.log(infile, 'infile')
        for (let index = 0; index < infile.length;) {
            const descr = infile[index++];
            //console.log(descr, 'descr');
            if (descr === "v")
            {
                const x = parseFloat(infile[index++]);
                const y = parseFloat(infile[index++]);
                const z = parseFloat(infile[index++]);
                positions.push(new Vector3(x,y,z));
            }
            else if (descr === "vt")
            {
                const x = parseFloat(infile[index++]);
                const y = parseFloat(infile[index++]);
                uvs.push(new Vector3(x,y,0));
            }
            else if (descr === "vn")
            {
                const x = parseFloat(infile[index++]);
                const y = parseFloat(infile[index++]);
                const z = parseFloat(infile[index++]);
                normals.push(new Vector3(x,y,z));
            }
            else if (descr === "f")
            {
                // get triangle
                for (let i = 0; i < 3; i++)
                {
                    const tr = infile[index++].split('/');

                    // read vertex index
                    const p_ind = parseInt(tr[0]);
                    // read uv index
                    const uv_ind = parseInt(tr[1]);
                    // read normal index
                    const n_ind = parseInt(tr[2]);

                    this.vertices.push(new Vertex( positions[p_ind - 1],normals[n_ind - 1],uvs[uv_ind - 1] ));
                }
            }
        }

        this.indices = new Array(this.vertices.length);

        for (let i = 0; i < this.indices.length; i++)
        {
            this.indices[i] = i;
        }
        console.log(this.vertices.length, 'this.vertices.length')
    }

    getShader(type, src) {
        let shader = this.gl.createShader(type)
        this.gl.shaderSource(shader, src)
        this.gl.compileShader(shader)
        return shader
    }

    /**
     *
     * @param lightpos {Vector3}
     * @param view {Vector3}
     * @param perspective_projection {(number)[]}
     * @param cameraPos {Vector3}
     * @param cameraFront {Vector3}
     * @param cameraUp {Vector3}
     */
    draw(lightpos, view, perspective_projection, cameraPos, cameraFront, cameraUp){
        const gl = this.gl;
        const cameraView = this.calculate_lookAt_matrix(
            cameraPos,
            new Vector3(cameraPos.x + cameraFront.x, cameraPos.y + cameraFront.y, cameraPos.z + cameraFront.z),
            cameraUp);
        gl.useProgram(this.program);
        gl.uniform3f(this.uniformLocations.viewVec, view.x, view.y, view.z);
        gl.uniform3f(this.uniformLocations.scale, this.transform.scale.x, this.transform.scale.y, this.transform.scale.z)
        gl.uniform3f(this.uniformLocations.rotation, this.transform.rotation.x, this.transform.rotation.y, this.transform.rotation.z)
        gl.uniform3f(this.uniformLocations.position, this.transform.position.x, this.transform.position.y, this.transform.position.z)

        gl.uniformMatrix4fv(this.uniformLocations.gWorld, false, new Float32Array(perspective_projection))
        gl.uniformMatrix4fv(this.uniformLocations.gView, false, new Float32Array(cameraView))

        // bind texture
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.texture)
        gl.uniform1i(this.uniformLocations.texture, 0);
        gl.bindVertexArray(this.vao);

        gl.drawElements(gl.TRIANGLES, this.indices.length, gl.UNSIGNED_INT, 0);
        //gl.bindVertexArray(0);
    }

    /**
     *
     * @param position {Vector3}
     * @param target {Vector3}
     * @param worldUp {Vector3}
     * @returns {(number)[]}
     */
    calculate_lookAt_matrix(position, target, worldUp) {
        // 1. Position = known
        // 2. Calculate cameraDirection
        /**
         * @type {Vector3}
         */
        const zaxis = Vector3.normalize(new Vector3(position.x - target.x, position.y - target.y, position.z - target.z));
        // 3. Get positive right axis vector
        /**
         * @type {Vector3}
         */
        const xaxis = Vector3.normalize(Vector3.cross(Vector3.normalize(worldUp), zaxis));
        // 4. Calculate camera up vector
        /**
         * @type {Vector3}
         */
        const yaxis = Vector3.cross(zaxis, xaxis);

        // Create translation and rotation matrix
        // In JavaScript we access elements as mat[row][col] due to row-major layout
        const translation = [0, 0, 0, -position.x, 0, 0, 0, -position.y, 0, 0, 0, -position.z, 0, 0, 0, 0];
        const rotation = [xaxis.x, xaxis.y, xaxis.z,
                        0,
                        yaxis.x, yaxis.y, yaxis.z,
                        0,
                        zaxis.x, zaxis.y, zaxis.z, 0, 0, 0, 0, 0];

        const res = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
        res[3] = rotation[0] * translation[3] + rotation[1] * translation[7] + rotation[2] * translation[11];
        res[7] = rotation[4] * translation[3] + rotation[5] * translation[7] + rotation[6] * translation[11];
        res[11] = rotation[8] * translation[3] + rotation[9] * translation[7] + rotation[10] * translation[11];

        const viewMatrix = [
            xaxis.x, yaxis.x, zaxis.x, 0,
            xaxis.y, yaxis.y, zaxis.y, 0,
            xaxis.z, yaxis.z, zaxis.y, 0,
            -Vector3.dot(xaxis, position), -Vector3.dot(yaxis, position), -Vector3.dot(zaxis, position),  1
        ];
        // Return lookAt matrix as combination of translation and rotation matrix
        return viewMatrix; // Remember to read from right to left (first rotation then translation)
    }
}

export default Object;