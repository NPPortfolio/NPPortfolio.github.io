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

    attribute vec4 aVertexPosition;

    uniform mat3 uMatrix;

    void main() {
        gl_Position = aVertexPosition;
        //vec4((uMatrix * vec3(aVertexPosition, 1)).xy, 1.0, 1.0);
    }
`;

// Fragment shader program
const fsSource = `
    void main() {
        gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
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

    var matrixLocation = gl.getUniformLocation(shaderProgram, "uMatrix");

     // Create a buffer to put positions in
    var positionBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var square = [
        -0.5, -0.5,
        -0.5, 0.5,
        0, 0.5
    ];

    //need to type the array instead of default javascript variable
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(square), gl.STATIC_DRAW);

    // Map the -1 +1 clip space to 0, canvas width, 0, canvas height
    gl.viewport = (0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(shaderProgram);

    gl.enableVertexAttribArray(vertexPositionLocation);


    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer

    // binds the current ARRAY_BUFFER to the attribute (vertexposition)
    gl.vertexAttribPointer(vertexPositionLocation, size, type, normalize, stride, offset);

    // This makes is so every 3 vertices form a triangle in the buffer
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 3;
    gl.drawArrays(primitiveType, offset, count);
    /*
    var x = m3.scaling(1, 1);

    //gl.uniformMatrix3fv(matrixLocation, false, x);

    

    var x = [8, 4, 6, 3, 1, 3, 1, 24, 6];
    var y = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    z = m3.multiply(x, y);

    console.log(z);
    */
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