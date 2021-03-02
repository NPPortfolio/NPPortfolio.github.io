// Vertex shader program
const vsSource = `

    precision lowp float;
    attribute vec3 a_vertexPosition;
    attribute vec4 a_texCoord;
    attribute vec3 a_vertexNormal;

    uniform mat4 u_modelMatrix;
    uniform mat4 u_viewProjectionMatrix;

    varying vec4 v_texCoord;
    varying vec3 v_vertexNormal;

    void main() {
        v_texCoord = a_texCoord;
        v_vertexNormal = a_vertexNormal;
        gl_Position = u_viewProjectionMatrix * u_modelMatrix * vec4(a_vertexPosition, 1.0);
    }
`;

// Fragment shader program
const fsSource = `

    precision lowp float;

    varying vec4 v_texCoord;
    varying vec3 v_vertexNormal;

    uniform sampler2D u_texture;

    uniform vec4 u_color;

    uniform vec3 u_lightDirection;

    void main() {
        //gl_FragColor = texture2D(u_texture, v_texCoord);
        //gl_FragColor = vec4(v_texCoord, 1.0);

        vec3 normal = normalize(v_vertexNormal);

        float dot = dot(normal, normalize(u_lightDirection));

        // remember to put this back to 0
        float light = max(0.0, dot);

        gl_FragColor = v_texCoord;
        gl_FragColor.rgb *= light;
    }
`;

// Mozilla tutorial code
// Initialize a shader program, so WebGL knows how to draw our data
function initShaderProgram(vsSource, fsSource) {

    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

// Mozilla tutorial code
// creates a shader of the given type, uploads the source and compiles it
function loadShader(type, source) {

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

function bufferData(buffer_name, data) {

    let buffer = attributeBuffers[buffer_name];
    if (buffer === null) {
        console.log("Buffer: " + buffer_name + " not found");
        return null;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
}

function bufferIndexData(buffer_name, data) {
    let buffer = indexBuffers[buffer_name];
    if (buffer === null) {
        console.log("Buffer: " + buffer_name + " not found");
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
}

function enableAttribArray(buffer_name, location_name, size, type, normalize, stride, offset) {

    let buffer = attributeBuffers[buffer_name];
    let location = attributeLocations[location_name];

    if (buffer === null) {
        console.log("Buffer: " + buffer_name + " not found");
        return 1;
    }

    if (location === null) {
        console.log("Location: " + location_name + " not found");
        return 1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffers[buffer_name]);
    gl.enableVertexAttribArray(attributeLocations[location_name]);
    // binds the current ARRAY_BUFFER to the attribute (vertexposition)
    gl.vertexAttribPointer(attributeLocations[location_name], size, type, normalize, stride, offset);
    return 0;
}

function setTexture(texture_name, data) {

    tex = textures[texture_name];
    if (tex === null) {
        console.log("Texture: " + texture_name + " not found");
        return;
    }

    gl.bindTexture(gl.TEXTURE_2D, tex);
    // todo: this only accepts 2 by 2 textures, change this to get width and height of the texture, maybe using the data dimensions or a texture object
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

/*
// Just one pixel for now
function modifyTexture(x, y, r, g, b, a) {

    gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([r, g, b, a]));
}
*/


canvas = document.getElementById("glCanvas");
gl = canvas.getContext("webgl");

if (gl === null) {
    alert("Unable to initialize webgl, your browser may not support it");
    //return null;
}

shaderProgram = initShaderProgram(vsSource, fsSource);

if (shaderProgram === null) {
    alert("Shader initialization failed");
    //return null;
}

gl.useProgram(shaderProgram);

// This disables the right click menu for the canvas, so the rmb can be used for camera panning
canvas.oncontextmenu = function (e) {
    e.preventDefault();
};



// A bunch of arrays for holding the locations of the shader program variables
// In a more complex system these could be populated automatically by looking at the shader programs
uniformLocations = {
    modelMatrixLocation: gl.getUniformLocation(shaderProgram, "u_modelMatrix"),
    viewProjectionMatrixLocation: gl.getUniformLocation(shaderProgram, "u_viewProjectionMatrix"),
    colorLocation: gl.getUniformLocation(shaderProgram, "u_color"),
    lightDirectionLocation: gl.getUniformLocation(shaderProgram, "u_lightDirection"),
}

uniformBuffers = {

}

attributeLocations = {

    vertexPositionLocation: gl.getAttribLocation(shaderProgram, "a_vertexPosition"),
    vertexNormalLocation: gl.getAttribLocation(shaderProgram, "a_vertexNormal"),
    texCoordLocation: gl.getAttribLocation(shaderProgram, "a_texCoord"),

}

attributeBuffers = {
    vertexPositionBuffer: gl.createBuffer(),
    vertexNormalBuffer: gl.createBuffer(),
    texCoordBuffer: gl.createBuffer()
}

indexBuffers = {
    indexBuffer: gl.createBuffer(),
}

textures = {
    //texture: gl.createTexture()
}

camera = new Camera();

camera.lookAt([0, 0, 16, 1], [0, 0, 0, 1], [0, 1, 0, 0]);
camera.perspective(1.5, canvas.clientWidth / canvas.clientHeight, 0.1, 100);

S = new Sphere(8, 128, 128);
C = new Cursor(1, 16);

// clean later
C.setRed(document.getElementById("red").value);
C.setGreen(document.getElementById("green").value);
C.setBlue(document.getElementById("blue").value);

updateColorSelectCanvas();

C.view_matrix = m4.identity();
C.cursor_function = cursorFunctions.moveAlongNormal;

draw_list = [S, C];

init(draw_list);
draw(draw_list);



// In order to initialize the attribute buffers, we need to buffer all of the vertices and indices combined
// so we can then buffer in sub data
function init(draw_list) {

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffers.indexBuffer);

    // Not sure where to put this
    gl.uniform4fv(uniformLocations.colorLocation, [0.0, 1.0, 0.0, 1.0]);

    let combined_vertices = new Array();
    let combined_indices = new Array();
    let combined_normals = new Array();
    let combined_colors = new Array();

    let index_offset = 0;

    for (let i = 0; i < draw_list.length; i++) {

        // Note: you have to use Array.from because javascript concat does not work with typed arrays
        // You could also write your own concat function, but this is a one time step so it shouldn't affect performance
        combined_vertices = combined_vertices.concat(Array.from(draw_list[i].getVertices()));
        combined_normals = combined_normals.concat(Array.from(draw_list[i].getVertexNormals()));
        combined_colors = combined_colors.concat(Array.from(draw_list[i].getColors()));


        // The indices can't be simply combined because they have to have an offset based on the objects before them
        for (let j = 0; j < draw_list[i].getIndices().length; j++) {
            combined_indices.push(draw_list[i].getIndices()[j] + index_offset);
        }

        index_offset += draw_list[i].getVertices().length / 3;

    }

    // The custom buffer functions use glBufferData instead of BufferSubData, which is slower but more simple for a one time at start function
    bufferData("vertexPositionBuffer", new Float32Array(combined_vertices));
    bufferData("vertexNormalBuffer", new Float32Array(combined_normals));

    // This is not a texture yet but the name will eventually make sense when textures are added
    bufferData("texCoordBuffer", new Float32Array(combined_colors));

    bufferIndexData("indexBuffer", new Uint16Array(combined_indices));

    let ret = 0;

    ret += enableAttribArray("vertexPositionBuffer", "vertexPositionLocation", 3, gl.FLOAT, false, 0, 0);
    ret += enableAttribArray("vertexNormalBuffer", "vertexNormalLocation", 3, gl.FLOAT, false, 0, 0);
    ret += enableAttribArray("texCoordBuffer", "texCoordLocation", 4, gl.FLOAT, false, 0, 0);

    if (ret != 0) {
        // TODO: proper error checking
        console.log("Enabling the attribute arrays went wrong");
        return;
    }

    // Map the -1 +1 clip space to 0, canvas width, 0, canvas height
    gl.viewport = (0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.CULL_FACE);

    gl.clearColor(0, 0, 0, 0);
}

function draw(objList) {

    //console.time("draw");

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let v_offset = 0;
    let i_offset = 0;

    for (let i = 0; i < objList.length; i++) {

        let obj = objList[i];

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffers.indexBuffer);

        // There used to be code for only buffering the vertices that were changed here, for now the performance cost is not as important
        // as the other issues, so this could be a future thing to implement
        gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffers["vertexPositionBuffer"]);
        gl.bufferSubData(gl.ARRAY_BUFFER, v_offset, obj.getVertices());

        gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffers["vertexNormalBuffer"]);
        gl.bufferSubData(gl.ARRAY_BUFFER, v_offset, obj.getVertexNormals());

        gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffers["texCoordBuffer"]);
        gl.bufferSubData(gl.ARRAY_BUFFER, v_offset, obj.getColors());

        gl.uniformMatrix4fv(uniformLocations.modelMatrixLocation, false, obj.getModelMatrix());
        gl.uniformMatrix4fv(uniformLocations.viewProjectionMatrixLocation, false, camera.getVP());

        // Use the camera's current direction for the light source direction
        gl.uniform3fv(uniformLocations.lightDirectionLocation, camera.getDirection());

        let i_size = obj.getIndices().length;
        let v_size = obj.getVertices().length;

        // The * 2 is because the size of the unsigned short is 2 bytes
        gl.drawElements(obj.primitiveType, i_size, gl.UNSIGNED_SHORT, i_offset * 2);

        v_offset += v_size;
        i_offset += i_size;
    }
}




var ismousedown;
var isrightmousedown;

var delta_x = 0;
var delta_y = 0;

var last_x = 0;
var last_y = 0;

var mouse_x;
var mouse_y;

function mouseHandler(e) {

    var rect = canvas.getBoundingClientRect();

    ndc_x = ((2 * (e.clientX - rect.left)) / rect.width) - 1;
    ndc_y = - (((2 * (e.clientY - rect.top)) / rect.height) - 1);

    delta_x = ndc_x - last_x;
    delta_y = ndc_y - last_y;

    last_x = ndc_x;
    last_y = ndc_y;

    mouseWorldDirection = ([ndc_x, ndc_y, -1, 1.0]);

    mouseWorldDirection = m4.multiplyVec3(camera.inverse_projection_matrix, mouseWorldDirection, 0);
    mouseWorldDirection[2] = -1.0;
    mouseWorldDirection[3] = 0.0;
    mouseWorldDirection = vec3.normalize(m4.multiplyVec3(camera.inverse_view_matrix, mouseWorldDirection, 0));

    switch (e.type) {

        case "mousedown":

            switch (e.which) {
                case 1:
                    ismousedown = true;
                    break;

                case 3:
                    isrightmousedown = true;
                    break;
            }

            break;

        case "mouseup":

            switch (e.which) {
                case 1:
                    ismousedown = false;
                    break;

                case 3:
                    isrightmousedown = false;
                    break;
            }
            break;

        case "mousemove":

            //console.time("raytrace");
            let ret = intersectRayWithMesh(camera.position, mouseWorldDirection, S.getVertices(), S.getIndices(), S.getModelMatrix(), false);
            //console.timeEnd("raytrace");

            if (ret === null || ret[1] == 0) {

            }

            else {

                // Set the cursors position and normal the the hit triangle's
                C.setOrientation(ret[0], ret[1]);
                S.closest_index = ret[2];

                if (ismousedown && !isrightmousedown) {

                    S.applyCursor(C);

                }
            }

            // The middle and rmb functions are used whether the cursor hits the mesh or not

            if (isrightmousedown && !ismousedown) {
                camera.rotateAroundTarget(-delta_x * 4, delta_y * 4);
            }

            if (isrightmousedown && ismousedown) {
                camera.panAlongPlane(-delta_x * 16, -delta_y * 16);
            }

            break

        case "wheel":
            camera.zoom(-e.deltaY / 1);
            break;

    }

    draw(draw_list);
}

function buttonHandler(id) {

    switch (id) {

        case "cursor_circle":
            C.setData(geometryCreator.createCircle(2, 16));
            break;

        case "cursor_star":
            C.setData(geometryCreator.createStar(2, 10));
            break;

        case "cursor_random":
            C.setData(geometryCreator.createRandomCursor(2, 10));
            break;

        case "cursor_sculpt":
            C.cursor_function = cursorFunctions.moveAlongNormal;
            break;

        case "cursor_color":
            C.cursor_function = cursorFunctions.setColor;
            break;
    }

    init(draw_list);
    draw(draw_list);
}

document.getElementById("red").addEventListener("change", function () {
    C.setRed(document.getElementById("red").value);
    updateColorSelectCanvas();
});

document.getElementById("green").addEventListener("change", function () {
    C.setGreen(document.getElementById("green").value);
    updateColorSelectCanvas();
});

document.getElementById("blue").addEventListener("change", function () {
    C.setBlue(document.getElementById("blue").value);
    updateColorSelectCanvas();
});

function updateColorSelectCanvas() {

    scc_canvas = document.getElementById("selectedColorCanvas");
    scc_ctx = scc_canvas.getContext("2d");
    scc_ctx.fillStyle = 'rgb(' + document.getElementById("red").value + ', ' + 
                                 document.getElementById("green").value + ', ' + 
                                 document.getElementById("blue").value + ')';
    scc_ctx.fillRect(0, 0, scc_canvas.width, scc_canvas.height);

}


/**
 * Returns the closest triangle of a mesh that a given ray intersects. All of the calculations are done in the object's coordinate space
 * 
 * @param {*} ray_origin the position the ray starts in xyz coordinates
 * @param {*} ray_vector the direction vector that the array is heading
 * @param {*} vertices the list of vertices that define the mesh
 * @param {*} indices the list of indices that define the mesh
 * @param {*} double_sided boolean to determine if the triangle should be seen as double sided (if it isn't only triangles facing the ray will count)
 * 
 */
function intersectRayWithMesh(ray_origin, ray_vector, vertices, indices, double_sided) {

    let hit = [0, 0, 0];
    let min_t = null;
    //console.time("Moller");

    let v0 = [0, 0, 0, 1];
    let v1 = [0, 0, 0, 1];
    let v2 = [0, 0, 0, 1];

    let ret = [];
    let triangle = [v0, v1, v2];

    //console.log(vertices);

    // Loop through every triangle in the mesh
    for (let i = 0; i < indices.length; i += 3) {


        // Might even want to move these out of the loop
        // Each index points to the start of three values for a vertex (x y z)
        let v0_index = indices[i] * 3;
        let v1_index = indices[i + 1] * 3;
        let v2_index = indices[i + 2] * 3;


        // These are the same as using the getVertexByIndex() function in the drawableObject class, so it might be better to put this entire function in the class as well
        // The rayTriangleIntersect function should be outside of the class though, so the most clean way to do this is something to work on in the future
        v0[0] = vertices[v0_index];
        v0[1] = vertices[v0_index + 1];
        v0[2] = vertices[v0_index + 2];

        v1[0] = vertices[v1_index];
        v1[1] = vertices[v1_index + 1];
        v1[2] = vertices[v1_index + 2];

        v2[0] = vertices[v2_index];
        v2[1] = vertices[v2_index + 1];
        v2[2] = vertices[v2_index + 2];

        ret = rayTriangleIntersect(ray_origin, ray_vector, triangle, double_sided);

        if (!ret) continue;


        // This section first checks if the triangle is closer than the closest intersected triangle found so far
        // If it is, the function sends back a lot of things to the mouse handler, including the index of the hit triangle's v0, the normal of the triangle, and the position
        // on the triangle that the ray hit. This is very messy and is sent to the mouse handler for positioning the cursor, but one of the major things to work on if this was
        // a work environment would be to separate things in to a much neater system... TODO probably write this in a read me
        if (ret[2] < min_t || min_t === null) {
            hit[0] = ret[0];
            hit[1] = ret[1];
            min_t = ret[2];
            hit[2] = indices[i];
        }
    }

    //console.timeEnd("Moller");

    return hit;
}

/**
 * Tests whether a ray intersects with a triangle in the same 3d coordinate system
 * 
 * @param {*} ray_origin the position the ray starts in xyz coordinates
 * @param {*} ray_vector the direction vector that the array is heading
 * @param {*} triangle the triangle to test the ray against
 * @param {boolean} double_sided boolean to determine if the triangle should be seen as double sided (if it isn't only triangles facing the ray will count)
 * 
 * @return This return is messy because I need the triangle normal, the intersect position, and the distance from the ray for the mesh intersect algorithm
 *         I'm sure there is a way to clean these two functions up which is something I could consider doing to polish the project more, and would definitely want to do in a work environment
 */
function rayTriangleIntersect(ray_origin, ray_vector, triangle, double_sided) {

    let v0 = triangle[0];
    let v1 = triangle[1];
    let v2 = triangle[2];

    let v0v1 = vec3.subtract(v1, v0);
    let v0v2 = vec3.subtract(v2, v0);


    // Used in return for circle
    let tn = vec3.normalize(vec3.cross(v0v1, v0v2));


    let pvec = vec3.cross(ray_vector, v0v2);
    let det = vec3.dot(v0v1, pvec);


    // When you want to test the triangles as double sided a negative determinant is allowed
    if (double_sided && (Math.abs(det) < 0.001)) {
        return false;
    }

    if (!double_sided && (det < 0.001)) {
        return false;
    }


    let invDet = 1 / det;

    let tvec = vec3.subtract(ray_origin, v0);
    let u = (vec3.dot(tvec, pvec)) * invDet;
    if (u < 0 || u > 1) return false;

    let qvec = vec3.cross(tvec, v0v1);
    let v = (vec3.dot(ray_vector, qvec)) * invDet;
    if (v < 0 || (u + v) > 1) return false;

    // The distance of the triangle from the ray
    t = (vec3.dot(v0v2, qvec)) * invDet;



    // Triangle is behind ray
    if (t < 0) return false;

    let P = vec3.add(ray_origin, vec3.multiplyByConstant(ray_vector, t));

    return [P, tn, t];
}









// Winding number algorithm for 2d inside outside test, taken from point in polygon wikipedia page footnote 6
// TODO: optimize by removing array creation and other testing

/**
 * Tests if a point is to the left, right, or on an infinite line in 2d space
 * 
 * @param {Array} P0 The starting point of the infinite line P0P1
 * @param {Array} P1 The second point of the infinite line P0P1
 * @param {Array} P2 The point to test against the line
 * 
 * @return {number} >0 if P2 is left of P0P1
 *                  =0 if P2 is on P0P1
 *                  <0 if P2 is right of P0P1
 * 
 */
function isLeft(P0, P1, P2) {

    return ((P1[0] - P0[0]) * (P2[1] - P0[1]))
        - ((P2[0] - P0[0]) * (P1[1] - P0[1]));

}

/**
 * Returns the winding number of a point with respect to a 2d polygon
 * 
 * @param {Array} P The point in 2d space to test in the polygon (x, y)
 * @param {Array} vertices The vertices that define the polygon, where the last vertex is the same as the first
 * 
 * @return {number} The winding number of the point in the polygon (0 if it is outside the polygon), >0 if it is inside
 */
function windingNumber(P, vertices) {

    let wn = 0;

    for (let i = 0; i < vertices.length; i += 3) {

        let v1 = [vertices[i], vertices[i + 1], vertices[i + 2]];
        let v2 = 0;
        if (i == vertices.length - 3) {
            v2 = [vertices[0], vertices[1], vertices[2]];
        }
        else {
            v2 = [vertices[i + 3], vertices[i + 4], vertices[i + 5]];
        }

        if (v1[1] <= P[1]) {
            if (v2[1] > P[1]) {
                if (isLeft(v1, v2, P) > 0) wn++;
            }
        }

        else {
            if (v2[1] <= P[1]) {
                if (isLeft(v1, v2, P) < 0) wn--;
            }
        }
    }
    return wn;
}



// This is only needed to create the view matrix of the cursor that flattens the vertices then checks for inside-outside
function createViewMatrixPTU(position, target, up) {
    var c = m4.lookAt(position, target, up);
    // This is the inverse that puts the camera at the origin and moves everything else into coordinates relative to the camera
    return m4.inverse(c);
}

// function to test other functions
function check_expect(f, input, expected_out) {

    if (f(input) != expected_out) {
        return false;
    }

    return true;
};

// TODO: probably no longer needed
// Returns an arbitrary vector orthogonal to v
function orthogonalVector(v) {

    let v1 = [0, v[2], -v[1], 0];
    let v2 = [-v[2], 0, v[0], 0];
    let v3 = [-v[1], v[0], 0, 0];

    //There are very small optimizations for this, but this is more readable and shouldn't matter too much in performance
    let v1_m = vec3.length(v1);
    let v2_m = vec3.length(v2);
    let v3_m = vec3.length(v3);

    if (v1_m >= v2_m && v1_m >= v3_m) return v1;
    if (v2_m >= v1_m && v2_m >= v3_m) return v2;
    if (v3_m >= v1_m && v3_m >= v2_m) return v3;

}

function clamp(x, min, max){
    return Math.min(Math.max(x, min), max);
}