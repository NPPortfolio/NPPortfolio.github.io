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

state = new glState("glCanvas");
state.initShaderProgram(vsSource, fsSource);

camera = new Camera();

camera.lookAt([0, 0, 16, 1], [0, 0, 0, 1], [0, 1, 0, 0]);
camera.perspective(1.5, state.canvas.clientWidth / state.canvas.clientHeight, 0.1, 100);

state.camera = camera;

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

state.draw_list = draw_list;

state.init(draw_list);
state.draw(draw_list);



var ismousedown;
var isrightmousedown;

var delta_x = 0;
var delta_y = 0;

var last_x = 0;
var last_y = 0;

var mouse_x;
var mouse_y;

function mouseHandler(e) {

    var rect = state.canvas.getBoundingClientRect();

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

    state.draw(draw_list);
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

    // Ideally you wouldn't initialize everything again and only change the cursor's data, shortcut for now
    state.init(draw_list);
    state.draw(draw_list);
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