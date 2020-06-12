window.onload = main;
// Matrix libraries (mostly) from webglfundamentals site for simplicity instead of external 3d matrix libraries
var m3 = {

    // This assumes that both matrices are 3x3, for a function that accepts all dimensions represented as a 1d array, the rows and columns of each matrix could be passed as well
    multiply: function (a, b) {

        var result = [];

        for(var a_row = 0; a_row < 3; a_row++){
            for(var b_col = 0; b_col < 3; b_col++){

                var a_index = (a_row *3)
                var b_index = b_col;

                result.push((a[a_index] * b[b_index]) + (a[a_index + 1] * b[b_index + 3]) + (a[a_index + 2] * b[b_index + 6]));

            }
        }

        return result;

    },

    translation: function (tx, ty) {
        return [
            1, 0, 0,
            0, 1, 0,
            tx, ty, 1,
        ];
    },

    rotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
            c, -s, 0,
            s, c, 0,
            0, 0, 1,
        ];
    },

    scaling: function (sx, sy) {
        return [
            sx, 0, 0,
            0, sy, 0,
            0, 0, 1,
        ];
    },
};

// Vertex shader program

const vsSource = `

    attribute vec2 aVertexPosition;
    attribute vec2 aTexCoord;

    //uniform mat3 uMatrix;

    varying vec2 vTexCoord;

    void main() {
        vTexCoord = aTexCoord;
        gl_Position = vec4(aVertexPosition, 0.0, 1.0);
    }
`;

// Fragment shader program
const fsSource = `

    precision mediump float;

    varying vec2 vTexCoord;

    uniform sampler2D uTexture;

    void main() {
        gl_FragColor = texture2D(uTexture, vTexCoord);
    }
`;

  
function main() {

    const canvas = document.getElementById("glCanvas");
    const gl = canvas.getContext("webgl");

    if (gl === null) {
        alert("Unable to initialize webgl, your browser may not support it");
        return;
    }

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    var vertexPositionLocation = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    var texCoordLocation = gl.getAttribLocation(shaderProgram, "aTexCoord");

    console.log(texCoordLocation);
    console.log(vertexPositionLocation);

    var matrixLocation = gl.getUniformLocation(shaderProgram, "uMatrix");
    var textureLocation = gl.getUniformLocation(shaderProgram, "uTexture");

    //Two triangles to form the paint image todo change the primitive type for a smaller array
    var square = new Float32Array([

        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,

        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0,
    ]);

    var texCoords = new Float32Array([
        0.0, 0.0,
        0.0, 1.0,
        1.0, 1.0,

        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0,
    ]);


    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, square, gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([
            255, 0, 0, 255,
            0, 255, 0, 255,
            0, 0, 255, 255,
            0, 0, 0, 255,
        ]));
        

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);








    // Map the -1 +1 clip space to 0, canvas width, 0, canvas height
    gl.viewport = (0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);





    // RENDER CODE

    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(vertexPositionLocation);
    // binds the current ARRAY_BUFFER to the attribute (vertexposition)
    gl.vertexAttribPointer(vertexPositionLocation, size, type, normalize, stride, offset);

    

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, size, type, normalize, stride, offset);

    // call this after filling all data for the shader variables but before using gluniform
    gl.useProgram(shaderProgram);

    // Tell the shader to use texture unit 0 for u_texture
    gl.uniform1i(textureLocation, 0);

    // This makes is so every 3 vertices form a triangle in the buffer
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
}

//
// creates a shader of the given type, uploads the source and
// compiles it.
//
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Mozilla tutorial code
// Initialize a shader program, so WebGL knows how to draw our data
//
function initShaderProgram(gl, vsSource, fsSource) {

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        gl.deleteProgram(shaderProgram);
        return null;
    }

    return shaderProgram;
}

/*
function drawScene(gl){


}
*/