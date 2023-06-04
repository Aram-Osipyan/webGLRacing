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

    /**
     *
     * @param textureUrl {url}
     * @param mesh
     * @param gl
     */
    constructor(textureUrl, mesh, gl) {
        this.transform = new Transform(new Vector3(0,0,0), new Vector3(1,1,1), new Vector3(0,0,0))
        this.gl = gl;
        //this.InitShader();

        this.SetupMesh(mesh);
        //this.InitTexture(textureUrl);

        this.registerTexture(textureUrl);
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
        //this.textureLocation = gl.getUniformLocation(this.meshProgramInfo.program, "u_texture");
        this.textureInfo = this.loadImageAndCreateTextureInfo(textureUrl)
        gl.bindTexture(gl.TEXTURE_2D, this.textureInfo.texture);

        // Tell the shader to get the texture from texture unit 0
        //gl.uniform1i(this.textureLocation, 0);


    }

    SetupMesh(mesh) {
        const gl = this.gl;
        this.meshProgramInfo = webglUtils.createProgramInfo(gl, [vertexShaderSource, fragShaderSource]);

        const data = this.parseOBJ(mesh);
        console.log(data);
        this.bufferInfo = webglUtils.createBufferInfoFromArrays(gl, data);

        this.cameraTarget = [0, 0, 0];
        this.cameraPosition = [0, 0, 4];
        this.zNear = 0.1;
        this.zFar = 50;

        gl.useProgram(this.meshProgramInfo.program);
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

    degToRad(deg) {
        return deg * Math.PI / 180;
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

        webglUtils.resizeCanvasToDisplaySize(gl.canvas);


        const fieldOfViewRadians = this.degToRad(60);
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const projection = m4.perspective(fieldOfViewRadians, aspect, this.zNear, this.zFar);

        const up = [0, 1, 0];
        // Compute the camera's matrix using look at.
        const camera = m4.lookAt(this.cameraPosition, this.cameraTarget, up);

        // Make a view matrix from the camera matrix.
        const view2 = m4.inverse(camera);

        const sharedUniforms = {
            u_lightDirection: m4.normalize([-1, 3, 5]),
            u_view: view2,
            u_projection: projection,
            position: this.transform.position.getArray(),
            rotation: this.transform.position.getArray(),
            scale: this.transform.scale.getArray(),
            u_texture : this.texture
        };

        gl.useProgram(this.meshProgramInfo.program);

        // calls gl.uniform
        webglUtils.setUniforms(this.meshProgramInfo, sharedUniforms);

        // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
        webglUtils.setBuffersAndAttributes(gl, this.meshProgramInfo, this.bufferInfo);

        // calls gl.uniform
        webglUtils.setUniforms(this.meshProgramInfo, {
            u_world: m4.yRotation(2),
            u_diffuse: [1, 0.7, 0.5, 1],
        });
        //gl.activeTexture(gl.TEXTURE0)
        //gl.bindTexture(gl.TEXTURE_2D, this.texture);
        // calls gl.drawArrays or gl.drawElements
        webglUtils.drawBufferInfo(gl, this.bufferInfo);
        /*
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
        //gl.bindVertexArray(0);*/
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

    parseOBJ(text) {
        // because indices are base 1 let's just fill in the 0th data
        const objPositions = [[0, 0, 0]];
        const objTexcoords = [[0, 0]];
        const objNormals = [[0, 0, 0]];

        // same order as `f` indices
        const objVertexData = [
            objPositions,
            objTexcoords,
            objNormals,
        ];

        // same order as `f` indices
        let webglVertexData = [
            [],   // positions
            [],   // texcoords
            [],   // normals
        ];

        function addVertex(vert) {
            const ptn = vert.split('/');

            ptn.forEach(
                /**
                 *
                 * @param objIndexStr {string}
                 * @param i
                 */
                (objIndexStr, i) => {
                    if (!objIndexStr) {
                        return;
                    }
                    const objIndex = parseInt(objIndexStr);
                    const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
                    webglVertexData[i].push(...objVertexData[i][index]);
                });
        }

        const keywords = {
            v(parts) {
                objPositions.push(parts.map(parseFloat));
            },
            vn(parts) {
                objNormals.push(parts.map(parseFloat));
            },
            vt(parts) {
                // should check for missing v and extra w?
                objTexcoords.push(parts.map(parseFloat));
            },
            f(parts) {
                const numTriangles = parts.length - 2;
                for (let tri = 0; tri < numTriangles; ++tri) {
                    addVertex(parts[0]);
                    addVertex(parts[tri + 1]);
                    addVertex(parts[tri + 2]);
                }
            },
        };

        const keywordRE = /(\w*)(?: )*(.*)/;
        const lines = text.split('\n');
        for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
            const line = lines[lineNo].trim();
            if (line === '' || line.startsWith('#')) {
                continue;
            }
            const m = keywordRE.exec(line);
            if (!m) {
                continue;
            }
            const [, keyword, unparsedArgs] = m;
            const parts = line.split(/\s+/).slice(1);
            const handler = keywords[keyword];
            if (!handler) {
                console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
                continue;
            }
            handler(parts, unparsedArgs);
        }

        return {
            position: webglVertexData[0],
            texcoord: webglVertexData[1],
            normal: webglVertexData[2],
        };
    }

    loadImageAndCreateTextureInfo(url) {
        const gl = this.gl;
        this.tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.tex);
        // Fill the texture with a 1x1 blue pixel.
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([0, 0, 255, 255]));

        // let's assume all images are not a power of 2
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        this.textureInfo = {
            width: 1,   // we don't know the size until it loads
            height: 1,
            texture: this.tex,
        };
        this.img = new Image();
        this.img.addEventListener('load', function() {
            textureInfo.width = img.width;
            textureInfo.height = img.height;

            gl.bindTexture(gl.TEXTURE_2D, textureInfo.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        });
        //requestCORSIfNotSameOrigin(img, url);
        this.img.src = url;

        return this.textureInfo;
    }

    handleTextureLoaded(image, texture) {
        const gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    }

    registerTexture(imgId) {
        console.log(imgId,'src')
        const gl = this.gl;
        let texture = this.texture = gl.createTexture();
        const image = document.getElementById(imgId)

        if (image.complete){
            this.handleTextureLoaded(image, texture);
        }

        this.meshProgramInfo.program.samplerUniform = gl.getUniformLocation(this.meshProgramInfo.program, "u_texture");
        gl.uniform1i(this.meshProgramInfo.program.samplerUniform,  0);
        return texture
    }

}

export default Object;