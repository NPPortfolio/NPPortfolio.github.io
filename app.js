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
        //gl_FragColor = vec4(0.0, 0.7, 0.7, 1.0);
        gl_FragColor.rgb *= light;
    }
`;

state = new glState("glCanvas");
state.initShaderProgram(vsSource, fsSource);

camera = new Camera();

camera.lookAt([0, 0, 16, 1], [0, 0, 0, 1], [0, 1, 0, 0]);
camera.perspective(1.5, state.canvas.clientWidth / state.canvas.clientHeight, 0.1, 100);

state.camera = camera;


// There should be a cleaner way to create the geometry and set the data
let cursor_data = geometryCreator.createCircle(1, 16);
C = new Cursor(cursor_data[0], cursor_data[1]);

let data = geometryCreator.createCubeSphere(8, 96);
S = new Mesh(data[0], data[1]);

AS = new AccelerationStructure(S);

// clean later
C.setRed(document.getElementById("red").value);
C.setGreen(document.getElementById("green").value);
C.setBlue(document.getElementById("blue").value);

updateColorSelectCanvas();

draw_list = [S, C];

state.draw_list = draw_list;

state.init(draw_list);
state.draw(draw_list);


/*
// Something weird going on here with firefox console, shows test 0 0 on both logs when first loading page,
// but after refreshing is correct
let v = [0, 0, 0];
console.log(v);

function dummy(v1) {
    v1[0] = "test";
}

dummy(v);
console.log(v);
*/


// more allocation for garbage collection

var ismousedown;
var isrightmousedown;

var delta_x = 0;
var delta_y = 0;

var last_x = 0;
var last_y = 0;

let ndc_x = 0;
let ndc_y = 0;

var mouse_x;
var mouse_y;

let mouseWorldDirectionTest = [0, 0, 0, 0];

let mouseWorldDirectionTest2 = [0, 0, 0];
mouseWorldDirection = [0, 0, 0];

function mouseHandler(e) {

    let rect = state.canvas.getBoundingClientRect();

    ndc_x = ((2 * (e.clientX - rect.left)) / rect.width) - 1;
    ndc_y = - (((2 * (e.clientY - rect.top)) / rect.height) - 1);

    delta_x = ndc_x - last_x;
    delta_y = ndc_y - last_y;

    last_x = ndc_x;
    last_y = ndc_y;

    // mouseWorldDirection = ([ndc_x, ndc_y, -1, 1.0]);
    mouseWorldDirectionTest[0] = ndc_x;
    mouseWorldDirectionTest[1] = ndc_y;
    mouseWorldDirectionTest[2] = -1;
    mouseWorldDirectionTest[3] = 1.0;

    //mouseWorldDirection = m4.multiplyVec3(camera.inverse_projection_matrix, mouseWorldDirection, 0);
    m4.multiplyVec3Test(camera.inverse_projection_matrix, mouseWorldDirectionTest, mouseWorldDirectionTest2);
    mouseWorldDirectionTest2[2] = -1.0;
    mouseWorldDirectionTest2[3] = 0.0;
    //mouseWorldDirection = vec3.normalize(m4.multiplyVec3(camera.inverse_view_matrix, mouseWorldDirection, 0));
    m4.multiplyVec3Test(camera.inverse_view_matrix, mouseWorldDirectionTest2, mouseWorldDirection);
    vec3.normalizeTest(mouseWorldDirection);

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
            let ret = intersectRayWithASGrid(camera.position, mouseWorldDirection, AS);
            //console.timeEnd("raytrace");

            if (ret === null || ret[2] == -1) {
                //console.log("Circle position null");

                // testing the acceleration grid update in here, a more complex system would take into account a lot of things to sneak in a grid
                // update while the user isnt doing anything (or not even need to update)
                AS = AS.updateGridIfNeeded();
            }

            else {

                // Set the cursors position and normal to the hit triangle's
                // could also just set normal to the camera position
                C.setOrientation(ret[0], ret[1]);
                S.closest_index = ret[2];

                if (ismousedown && !isrightmousedown) {
                    //console.time("applyCursor");
                    S.applyCursor(C);
                    //console.timeEnd("applyCursor");
                }

                else {
                    AS = AS.updateGridIfNeeded();
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

    //console.time("draw");
    state.draw(draw_list);
    //console.timeEnd("draw");
}

function buttonHandler(id) {

    switch (id) {

        case "cursor_circle":
            C.setData(geometryCreator.createCircle(1, 16));
            break;

        case "cursor_star":
            C.setData(geometryCreator.createStar(1.5, 10));
            break;

        case "cursor_random":
            C.setData(geometryCreator.createRandomCursor(2, 10));
            break;

        
        // Hardcoded, new system is next step of project
        // The ! isn't exactly right either because firefox keeps the state of the checkboxes when refreshing, while
        // the code sets sculpt to true and color to false
        case "cursor_sculpt":
            S.sculpt = !S.sculpt;
            break;
        
        case "cursor_color":
            S.color = !S.color;
            break;


        // old system maybe needed later

        /*
    // TODO: there is a much better way to do this than manually set the flags for what the cursor function changes, need to package that info with
    // the function itself somehow, but not sure how to handle that yet
    case "cursor_sculpt":
        C.cursor_function = C.move_along_normal;
        C.position_update_flag = true;
        C.color_update_flag = false;
        break;

    case "cursor_color":
        C.cursor_function = C.set_color;
        C.position_update_flag = false;
        C.color_update_flag = true;
        break;
        */

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

// need to set these because firefox doesn't when refreshing page
document.getElementById("cursor_sculpt").checked = true;
document.getElementById("cursor_color").checked = false;





// In order to cut down on allocation all of the variables that the ray-grid intersection uses are defined out here in global space
// This is obviously very messy and a major task moving forward in general is finding ways to define very frequently used variables only once
// in a clean way in their appropriate scope, whether that is as class members or some sort of predefined package with a function



// The final value to add to the original ray which defines the intersection position
let final_t = null;

// Will hold the final t value, the hit triangle's normal, and the hit triangle's v0 index for use in the Mesh BFS
let hit_data = [[0, 0, 0], [0, 0, 0], 0];

// Garbage collection test
let triangle = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
let v0 = triangle[0];
let v1 = triangle[1];
let v2 = triangle[2];
let v0v1 = [0, 0, 0];
let v0v2 = [0, 0, 0];
let tn = [0, 0, 0];
let pvec = [0, 0, 0];
let tvec = [0, 0, 0];
let qvec = [0, 0, 0];
let P = [0, 0, 0];
let ray_times_t = [0, 0, 0];

let bbox_t = 0.0;
let inv_ray_vector = [0, 0, 0];

let ret = [0, 0, 0];

let ray_bbox_coords = [0, 0, 0];
let ray_cell_coords = [0, 0, 0];
let ray_cell_indices = [0, 0, 0];

let ray_times_bbox_t = [0, 0, 0];

// The cell index to stop testing the ray at. If the ray goes negative along a direction it is -1
// If it goes positive, it is the dimension of the grid on that axis
let exit = [0, 0, 0];

// The number to increment or decrement the cell index based on the ray's direction
let step = [0, 0, 0];

// The t values for each direction that the ray takes to reach the next cell (in that dimension)
let delta_t = [0, 0, 0];

let next_crossing_t = [0, 0, 0];

let cell_array_index = 0;

let map = [2, 1, 2, 1, 2, 2, 0, 0];

let v0_index = 0;

function intersectRayWithASGrid(ray_origin, ray_vector, grid) {


    //hit_data = [[0, 0, 0], [0, 0, 0], 0];
    // garbage collection testing

    hit_data[0][0] = 0;
    hit_data[0][1] = 0;
    hit_data[0][2] = 0;
    hit_data[1][0] = 0;
    hit_data[1][1] = 0;
    hit_data[1][2] = 0;

    // Tells the calling function that no triangle was hit
    hit_data[2] = -1;

    bbox_t = rayBoxIntersect(ray_origin, ray_vector, grid);

    //inv_ray_vector = vec3.oneOverThis(ray_vector);

    vec3.oneOverThisFill(ray_vector, inv_ray_vector);

    final_t = Number.POSITIVE_INFINITY;

    // If the ray doesn't intersect the grid return
    if (bbox_t === null) {
        return null;
    }

    // The overflow buffer has to be checked first because it isn't even in the grid
    for (let i = 0; i < grid.overflow.length; i++) {

        grid.mesh.populateAllocatedTriangle(grid.overflow[i], triangle);
        ret = rayTriangleIntersect(ray_origin, ray_vector, false);

        if (ret == false) continue;

        // This section first checks if the triangle is closer than the closest intersected triangle found so far
        // If it is, the function sends back a lot of things to the mouse handler, including the index of the hit triangle's v0, the normal of the triangle, and the position
        // on the triangle that the ray hit. This is very messy and is sent to the mouse handler for positioning the cursor, but one of the major things to work on if this was
        // a work environment would be to separate things in to a much neater system... TODO probably write this in a read me
        if (ret[2] < final_t) {
            final_t = ret[2];

            //hit_data = [ret[0], ret[1], grid.mesh.getTriangleV0Index(grid.overflow[i])];

            hit_data[0][0] = ret[0][0];
            hit_data[0][1] = ret[0][1];
            hit_data[0][2] = ret[0][2];

            hit_data[1][0] = ret[1][0];
            hit_data[1][1] = ret[1][1];
            hit_data[1][2] = ret[1][2];

            hit_data[2] = grid.mesh.getTriangleV0Index(grid.overflow[i]);
        }

    }

    vec3.multiplyByConstantTest(ray_vector, bbox_t, ray_times_bbox_t);

    vec3.addTest2(ray_origin, ray_times_bbox_t, ray_bbox_coords);

    vec3.subtractTest2(ray_bbox_coords, grid.min_bound, ray_cell_coords);

    // could also have cell coords to cell indices function
    grid.worldToCellIndices(ray_bbox_coords, ray_cell_indices);

    for (let i = 0; i < 3; i++) {

        if (ray_vector[i] < 0) {

            delta_t[i] = -grid.cell_size[i] * inv_ray_vector[i];
            // +0 to index means cell the ray is in, which is always the next cell to intersect when going negative
            next_crossing_t[i] = bbox_t + (ray_cell_indices[i] * grid.cell_size[i] - ray_cell_coords[i]) * inv_ray_vector[i];
            exit[i] = -1;
            step[i] = -1;
        }

        else {

            delta_t[i] = grid.cell_size[i] * inv_ray_vector[i];
            // +1 to index means cell one along the given dimension
            next_crossing_t[i] = bbox_t + ((ray_cell_indices[i] + 1) * grid.cell_size[i] - ray_cell_coords[i]) * inv_ray_vector[i];
            exit[i] = grid.resolution[i];
            step[i] = 1;
        }
    }

    // Starting at the cell the ray hit, Walk through the cells along the ray and test for triangle intersection if
    // they contain geometry
    while (true) {

        cell_array_index = grid.getCellArrayIndexXYZ(ray_cell_indices);

        // more potential allocation saving TODO
        let triangle_index_array = grid.cells[cell_array_index];

        if (triangle_index_array.length != 0) {

            for (let i = 0; i < triangle_index_array.length; i++) {

                grid.mesh.populateAllocatedTriangle(triangle_index_array[i], triangle);

                //let tri_test = grid.mesh.getTriangleVertexPositions(triangle_index_array[i]);
                // get the triangle from the mesh and run ray triangle intersect
                ret = rayTriangleIntersect(ray_origin, ray_vector, false);
                //let ret = rayTriangleIntersect(ray_origin, ray_vector, grid.mesh.getTriangleVertexPositions(triangle_index_array[i]), false);

                if (ret == false) continue;

                // This section first checks if the triangle is closer than the closest intersected triangle found so far
                // If it is, the function sends back a lot of things to the mouse handler, including the index of the hit triangle's v0, the normal of the triangle, and the position
                // on the triangle that the ray hit. This is very messy and is sent to the mouse handler for positioning the cursor, but one of the major things to work on if this was
                // a work environment would be to separate things in to a much neater system... TODO probably write this in a read me


                // This is the same code as above, move into it's own function maybe

                if (ret[2] < final_t) {

                    final_t = ret[2];

                    //hit_data = [ret[0], ret[1], grid.mesh.getTriangleV0Index(triangle_index_array[i])];

                    hit_data[0][0] = ret[0][0];
                    hit_data[0][1] = ret[0][1];
                    hit_data[0][2] = ret[0][2];

                    hit_data[1][0] = ret[1][0];
                    hit_data[1][1] = ret[1][1];
                    hit_data[1][2] = ret[1][2];

                    hit_data[2] = grid.mesh.getTriangleV0Index(triangle_index_array[i]);
                }
            }
        }

        // Some bit setting to determine which axis to test for the next t value
        // Create a number from 0 to 7 in binary, with largest bit 1 meaning x < y, 2nd largest x < z, 3rd largest y < z
        let k = ((next_crossing_t[0] < next_crossing_t[1]) << 2) +
            ((next_crossing_t[0] < next_crossing_t[2]) << 1) +
            ((next_crossing_t[1] < next_crossing_t[2]));

        //let map = [2, 1, 2, 1, 2, 2, 0, 0];
        let axis = map[k];

        if (final_t < next_crossing_t[axis]) break;
        ray_cell_indices[axis] += step[axis];
        if (ray_cell_indices[axis] == exit[axis]) break;
        next_crossing_t[axis] += delta_t[axis];
    }

    return hit_data;




    // This is defined inside of the ray grid intersect to save on allocation for now

    function rayTriangleIntersect(ray_origin, ray_vector, double_sided) {

        vec3.subtractTest2(v1, v0, v0v1);
        vec3.subtractTest2(v2, v0, v0v2);

        // Used in return for circle
        vec3.crossTest(v0v1, v0v2, tn);

        // This is the normalize that doesn't allocate an array to return, working on preventing garbage collection
        vec3.normalizeTest(tn);

        vec3.crossTest(ray_vector, v0v2, pvec);
        let det = vec3.dot(v0v1, pvec);


        // When you want to test the triangles as double sided a negative determinant is allowed
        if (double_sided && (Math.abs(det) < 0.001)) {
            return false;
        }

        if (!double_sided && (det < 0.001)) {
            return false;
        }


        let invDet = 1 / det;


        //let tvec = vec3.subtract(ray_origin, v0);
        vec3.subtractTest2(ray_origin, v0, tvec);
        let u = (vec3.dot(tvec, pvec)) * invDet;
        if (u < 0 || u > 1) return false;

        //let qvec = vec3.cross(tvec, v0v1);
        vec3.crossTest(tvec, v0v1, qvec);
        let v = (vec3.dot(ray_vector, qvec)) * invDet;
        if (v < 0 || (u + v) > 1) return false;

        // The distance of the triangle from the ray
        t = (vec3.dot(v0v2, qvec)) * invDet;

        // Triangle is behind ray
        if (t < 0) return false;

        vec3.multiplyByConstantTest(ray_vector, t, ray_times_t);
        //P = vec3.add(ray_origin, ray_times_t);
        vec3.addTest2(ray_origin, ray_times_t, P);
        //P = vec3.add(ray_origin, vec3.multiplyByConstant(ray_vector, t));

        // more possible performance saving TODO
        // could pass defined variables to fill but need to check for min t
        return [P, tn, t];
    }

}

// Scratch a pixel code, this is an unoptimized algorithm but it is only called once per frame, for testing keep it for now
function rayBoxIntersect(ray_origin, ray_vector, grid) {

    let temp = null;
    let box_max = grid.max_bound;
    let box_min = grid.min_bound;

    let tmin_x = (box_min[0] - ray_origin[0]) / ray_vector[0];
    let tmax_x = (box_max[0] - ray_origin[0]) / ray_vector[0];

    if (tmin_x > tmax_x) {
        //swap(tmin_x, tmax_x);
        temp = tmin_x;
        tmin_x = tmax_x;
        tmax_x = temp;
    }

    let tmin_y = (box_min[1] - ray_origin[1]) / ray_vector[1];
    let tmax_y = (box_max[1] - ray_origin[1]) / ray_vector[1];

    if (tmin_y > tmax_y) {
        //swap(tmin_y, tmax_y);
        temp = tmin_y;
        tmin_y = tmax_y;
        tmax_y = temp;
    }

    // Eventually you want the min and max of each dimension for the overall min and max tvalue, initially it is the x values
    let tmin = tmin_x;
    let tmax = tmax_x;

    // Ray misses the box
    if ((tmin > tmax_y) || (tmin_y > tmax))
        return null;

    if (tmin_y > tmin)
        tmin = tmin_y;

    if (tmax_y < tmax)
        tmax = tmax_y;

    let tmin_z = (box_min[2] - ray_origin[2]) / ray_vector[2];
    let tmax_z = (box_max[2] - ray_origin[2]) / ray_vector[2];

    if (tmin_z > tmax_z) {
        //swap(tmin_z, tmax_z);
        temp = tmin_z;
        tmin_z = tmax_z;
        tmax_z = temp;
    }

    // Ray misses the box
    if ((tmin > tmax_z) || (tmin_z > tmax))
        return null;

    if (tmin_z > tmin)
        tmin = tmin_z;

    if (tmax_z < tmax)
        tmax = tmax_z;

    return tmin;
}








// Winding number algorithm for 2d inside outside test, taken from point in polygon wikipedia page footnote 6

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

//garbage collection workaround
let v1_winding = [0, 0, 0];
let v2_winding = [0, 0, 0];
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

    //let v2 = [0, 0, 0];
    //let v1 = [0, 0, 0];

    for (let i = 0; i < vertices.length; i += 3) {

        v1_winding[0] = vertices[i];
        v1_winding[1] = vertices[i + 1];
        v1_winding[2] = vertices[i + 2];
        //  = [vertices[i], vertices[i + 1], vertices[i + 2]];

        if (i == vertices.length - 3) {
            //v2 = [vertices[0], vertices[1], vertices[2]];
            v2_winding[0] = vertices[0];
            v2_winding[1] = vertices[1];
            v2_winding[2] = vertices[2];
        }
        else {
            //v2 = [vertices[i + 3], vertices[i + 4], vertices[i + 5]];
            v2_winding[0] = vertices[i + 3];
            v2_winding[1] = vertices[i + 4];
            v2_winding[2] = vertices[i + 5];
        }

        if (v1_winding[1] <= P[1]) {
            if (v2_winding[1] > P[1]) {
                if (isLeft(v1_winding, v2_winding, P) > 0) wn++;
            }
        }

        else {
            if (v2_winding[1] <= P[1]) {
                if (isLeft(v1_winding, v2_winding, P) < 0) wn--;
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

function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}






















// old

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

/**
function rayTriangleIntersect(ray_origin, ray_vector, triangle, double_sided) {

    let v0 = triangle[0];
    let v1 = triangle[1];
    let v2 = triangle[2];

    let v0v1 = [0, 0, 0];
    let v0v2 = [0, 0, 0];

    //let v0v1 = vec3.subtract(v1, v0);
    //let v0v2 = vec3.subtract(v2, v0);

    vec3.subtractTest(v1, v0, v0v1);
    vec3.subtractTest(v2, v0, v0v2);




    let tn = [0, 0, 0];



    // Used in return for circle
    //let tn = vec3.normalize(vec3.cross(v0v1, v0v2));
    //let tn = vec3.cross(v0v1, v0v2);

    vec3.crossTest(v0v1, v0v2, tn);
    // This is the normalize that doesn't allocate an array to return, working on preventing garbage collection
    vec3.normalizeTest(tn);

    let pvec = [0, 0, 0];

    //let pvec = vec3.cross(ray_vector, v0v2);

    vec3.crossTest(ray_vector, v0v2, pvec);
    let det = vec3.dot(v0v1, pvec);


    // When you want to test the triangles as double sided a negative determinant is allowed
    if (double_sided && (Math.abs(det) < 0.001)) {
        return false;
    }

    if (!double_sided && (det < 0.001)) {
        return false;
    }


    let invDet = 1 / det;


    let tvec = [0, 0, 0];
    //let tvec = vec3.subtract(ray_origin, v0);
    vec3.subtractTest(ray_origin, v0, tvec);
    let u = (vec3.dot(tvec, pvec)) * invDet;
    if (u < 0 || u > 1) return false;

    let qvec = [0, 0, 0];
    //let qvec = vec3.cross(tvec, v0v1);
    vec3.crossTest(tvec, v0v1, qvec);
    let v = (vec3.dot(ray_vector, qvec)) * invDet;
    if (v < 0 || (u + v) > 1) return false;

    // The distance of the triangle from the ray
    t = (vec3.dot(v0v2, qvec)) * invDet;



    // Triangle is behind ray
    if (t < 0) return false;

    let P = vec3.add(ray_origin, vec3.multiplyByConstant(ray_vector, t));

    return [P, tn, t];
}


// not used when you use the acceleration structure
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

/**
 function intersectRayWithMesh(ray_origin, ray_vector, vertices, indices, double_sided) {

    let hit = null;
    let min_t = null;
    //console.time("Moller");

    let v0 = [0, 0, 0];
    let v1 = [0, 0, 0];
    let v2 = [0, 0, 0];

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

            hit = [ret[0], ret[1], x]
        }
    }

    //console.timeEnd("Moller");

    return hit;
}
*/