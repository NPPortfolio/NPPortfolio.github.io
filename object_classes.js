class Object {

    constructor() {

        this.translation = [0, 0, 0];
        this.rotation = [0, 0, 0];
        this.scale = [1, 1, 1];

        this.translation_matrix = m4.identity();
        this.rotation_matrix = m4.identity();
        this.scale_matrix = m4.identity();

        this.model_matrix = m4.identity();

    }

    translate(t) {

        this.translation = vec3.add(this.translation, t);

        this.translation_matrix = m4.translation(this.translation[0], this.translation[1], this.translation[2]);

    }

    rotate(r) {

        this.rotation = vec3.add(this.rotation, r);

        this.rotation_matrix = m4.zRotate(m4.yRotate(m4.xRotate(m4.identity(), this.rotation[0]), this.rotation[1]), this.rotation[2]);

    }

    scale(s) {

        // This could be made to be a multiplication instead of an add
        this.scale = vec3.add(this.scale, s)

        this.scale_matrix = m4.scaling(this.scale[0], this.scale[1], this.scale[2]);

    }

    setTranslation(t) {
        this.translation = t;
    }

    setTranslationMatrix(m) {
        this.translation_matrix = m;
    }

    setRotation(r) {
        this.rotation = r;
    }

    setRotationMatrix(m) {
        this.rotation_matrix = m;
    }

    setScale(s) {
        this.scale = s;
    }

    setScaleMatrix(m) {
        this.scale_matrix = m;
    }

    setModelMatrix(m) {
        this.model_matrix = m;
    }

    setModelMatrixTRS(t, r, s) {

        this.translation = t;
        this.rotation = r;
        this.scale = s;

        this.updateModelMatrix();
    }

    modifyModelMatrix(t, r, s) {

        this.translate(t);
        this.rotate(r);
        this.scale(s);

        this.updateModelMatrix();
    }

    updateModelMatrix() {

        /*
        let m = m4.identity();
        m = m4.multiply(m, this.translation_matrix);
        m = m4.multiply(m, this.rotation_matrix);
        m = m4.multiply(m, this.scale_matrix);

        this.model_matrix = m;
        */
        // this.model_matrix = m4.identity();
        m4.identityTest(this.model_matrix);
        m4.multiplyTest(this.model_matrix, this.translation_matrix);
        m4.multiplyTest(this.model_matrix, this.rotation_matrix);
        m4.multiplyTest(this.model_matrix, this.scale_matrix);

    }

    getModelMatrix() {
        return this.model_matrix;
    }

}

class DrawableObject extends Object {

    constructor(vertices, indices) {

        super();

        this.data = new DataArrays(vertices, indices);

    }

    // Maybe these should be private, check back in future
    getVertexPositions() {
        return this.data.positions;
    }

    getVertexNormals() {
        return this.data.normals;
    }

    getColors() {
        return this.data.colors;
    }

    getIndices() {
        return this.data.indices;
    }


    getVertexPosition(i) {
        return this.data.getVertexPosition(i);
    }

    getVertexPositionFill(i, fill) {
        this.data.getVertexPositionFill(i, fill);
    }

    getNumIndices() {
        return this.data.indices.length;
    }

    getNumVertices() {
        return this.data.positions.length / 3;
    }



    setVertexPositionByIndex(i, position) {
        this.data.setVertexPosition(i, position);
    }

    addVertexPositionByIndex(i, position) {
        this.data.addToVertexPosition(i, position);
    }

    setVertexColorByIndex(i, color) {
        this.data.setVertexColor(i, color);
    }

    setVertexNormalByIndex(i, normal) {
        this.data.setVertexNormal(i, normal);
    }
}

class Mesh extends DrawableObject {

    constructor(vertices, indices) {

        // Calling super wastes time creating a DataArray object when this constructor makes a triangulated one to replace it,
        // figure out how to restructure TODO
        super(vertices, indices);

        this.primitiveType = 4; //gl.TRIANGLES

        this.data = new TriangulatedDataArrays(vertices, indices);

        this.closest_index = 0;

        this.acceleration_structure = null;


        // Hardcoded variables to determine the cursor functions, big task moving forward is to set up a system for this
        this.sculpt = false;
        this.color = false;


        // These are all variables used in the updateNormals function, sloppily defined here to cut down on
        // allocation

        // The list of triangles by index that a given vertex is part of
        this.triangle_list = null;
        this.tri = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        this.tri_normal = [0, 0, 0];

        // Create these here to pass to the vec3 function to reduce allocation
        this.v0v1 = [0, 0, 0];
        this.v0v2 = [0, 0, 0];
        this.cross = [0, 0, 0];

        this.new_normal = [0, 0, 0];


        // BFS testing
        this.visited = new Array();
        this.queue = new Array();

        this.start_vertex_position = [0, 0, 0];

        this.distance = 0;

        // This is the one to test the size limit on
        this.current_vertex_edge_list = new Array();

        this.next_vertex_index = 0;
        this.next_vertex_position = [0, 0, 0];

        this.start_next_delta = [0, 0, 0];

        this.queue_index = null;

    }

    getTriangleVertexPositions(i) {
        return this.data.getTriangleVertexPositions(i);
    }

    // Garbage collection testing
    populateAllocatedTriangle(index, triangle) {
        this.data.populateAllocatedTriangle(index, triangle);
    }

    populateAllocatedVertexPosition(i, pos) {
        this.data.populateAllocatedVertexPosition(i, pos);
    }

    getTriangleV0Index(i) {
        // A little bit wasteful, but only happens once per frame
        return this.data.getTriangleV0Index(i);
    }

    getTriangleCellCoords(tri_index) {
        return this.data.getTriangleCellCoords(tri_index);
    }

    getNumTriangles() {
        return this.data.indices.length / 3;
    }

    setAccelerationStructure(as) {
        this.acceleration_structure = as;
    }


    getVertexEdgeList(i) {
        return this.data.getVertexEdgeList(i);
    }

    getVertexTriangleList(i) {
        return this.data.getVertexTriangleList(i);
    }


    isTriangleInOverflow(tri_index) {
        return this.data.isTriInOverflow(tri_index);
    }

    setTriangleInOverflow(tri_index, bool) {
        this.data.setTriInOverflow(tri_index, bool);
    }

    setTriangleCellCoords(tri_index, coords) {
        this.data.setTriCellCoords(tri_index, coords);
    }

    resetTriangleCellCoords() {
        this.data.resetTriangleCellCoords();
    }


    // Breadth first search from the given vertex index and the maximum distance to cover -> could also pass a function to test instead of distance
    BFS(start_index, max_distance) {

        /*
        let visited = new Array();
        let queue = new Array();

        visited.push(start_index);
        queue.push(start_index);

        let start_vertex_position = [0, 0, 0];
        this.populateAllocatedVertexPosition(start_index, start_vertex_position);

        let distance = null;

        let current_vertex_edge_list = null;

        let next_vertex_index = null;
        let next_vertex_position = [0, 0, 0];

        let start_next_delta = [0, 0, 0];

        let queue_index = null;

        while (queue.length != 0) {

            queue_index = queue.shift();

            current_vertex_edge_list = this.getVertexEdgeList(queue_index);

            for (let i = 0; i < current_vertex_edge_list.length; i++) {

                next_vertex_index = current_vertex_edge_list[i];
                this.populateAllocatedVertexPosition(next_vertex_index, next_vertex_position);
                //next_vertex_position = this.getVertexPosition(next_vertex_index);

                if (visited.includes(next_vertex_index)) {
                    continue;
                }

                vec3.subtractTest2(start_vertex_position, next_vertex_position, start_next_delta);

                distance = vec3.length(start_next_delta);

                if (distance < max_distance) {
                    visited.push(next_vertex_index);
                    queue.push(next_vertex_index);
                }
            }
        }

        return visited;
        */


        this.visited.length = 0;
        this.queue.length = 0;

        this.visited.push(start_index);
        this.queue.push(start_index);

        this.populateAllocatedVertexPosition(start_index, this.start_vertex_position);

        this.current_vertex_edge_list.length = 0;

        while (this.queue.length != 0) {

            this.queue_index = this.queue.shift();

            // here
            this.current_vertex_edge_list = this.getVertexEdgeList(this.queue_index);

            for (let i = 0; i < this.current_vertex_edge_list.length; i++) {

                // here small
                this.next_vertex_index = this.current_vertex_edge_list[i];
                this.populateAllocatedVertexPosition(this.next_vertex_index, this.next_vertex_position);
                //next_vertex_position = this.getVertexPosition(next_vertex_index);

                if (this.visited.includes(this.next_vertex_index)) {
                    continue;
                }

                vec3.subtractTest2(this.start_vertex_position, this.next_vertex_position, this.start_next_delta);

                this.distance = vec3.length(this.start_next_delta);

                if (this.distance < max_distance) {
                    //here
                    this.visited.push(this.next_vertex_index);
                    this.queue.push(this.next_vertex_index);
                }
            }
        }

        return this.visited;
    }


    updateNormals(changed_vertices) {

        for (let i = 0; i < changed_vertices.length; i++) {

            // the list of triangle indices the vertex is in
            this.triangle_list = this.getVertexTriangleList(changed_vertices[i]);

            this.new_normal[0] = 0;
            this.new_normal[1] = 0;
            this.new_normal[2] = 0;

            for (let j = 0; j < this.triangle_list.length; j++) {

                //let tri = this.getTriangleVertexPositions(triangle_list[j]);
                this.populateAllocatedTriangle(this.triangle_list[j], this.tri);
                // could store the normal instead of computing it
                // could also make a triangle function library
                vec3.triangleNormalTest(this.tri, this.tri_normal, this.v0v1, this.v0v2, this.cross);
                vec3.addTest(this.new_normal, this.tri_normal);
            }

            //new_normal = vec3.normalize(new_normal);
            vec3.normalizeTest(this.new_normal);

            this.setVertexNormalByIndex(changed_vertices[i], this.new_normal);

        }
    }

    updateAccelerationStructure(changed_vertices) {

        let triangle_list = [];
        let visited_triangles = [];

        let tri = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        // This is very similar to the normal update, maybe combine them somehow
        for (let i = 0; i < changed_vertices.length; i++) {

            triangle_list = this.getVertexTriangleList(changed_vertices[i]);

            for (let j = 0; j < triangle_list.length; j++) {

                let tri_index = triangle_list[j];

                // The triangle has already been updated in the acceleration structure this frame
                if (visited_triangles.includes(tri_index)) continue;

                // Pass the index over anyways because the AS grid stores it for use in raytracing
                this.populateAllocatedTriangle(tri_index, tri);
                this.as.updateTriangleInGrid(tri, tri_index);
                visited_triangles.push(tri_index);
            }
        }
    }

    handleChangedVertices(changed_vertices) {
        this.updateNormals(changed_vertices);
        this.updateAccelerationStructure(changed_vertices);
    }


    // Could have C as a class object
    applyCursor(C) {

        // This is only needed when testing points, saving some computation when the mouse isn't pressed
        C.activateProjectionMatrix();

        // In the future this value is the size of the cursor's boundingbox
        //console.time("BFS");
        let test_indices = this.BFS(this.closest_index, 2);
        //console.timeEnd("BFS");

        let changed_vertices = [];

        let point = [0, 0, 0];

        let delta_vector = [0, 0, 0];

        for (let i = 0; i < test_indices.length; i++) {

            let index = test_indices[i];

            //let point = this.getVertexPosition(test_indices[i]);
            this.getVertexPositionFill(test_indices[i], point);

            if (C.isPointInside(point)) {
                // TODO: need some sort of system to handle multiple different cursor functions at once
                changed_vertices.push(index);


                /*

                For each active function tied to this mesh






                */

                // Hardcoded, future work on this project is a system to handle this
                // also need to keep track of which functions update the normals and AS Grid
                if (this.sculpt) {
                    vec3.multiplyByConstantTest(C.normal, 1 / 64, delta_vector);
                    this.addVertexPositionByIndex(index, delta_vector);
                }

                if (this.color) {
                    this.setVertexColorByIndex(index, C.color);
                }
            }
        }

        this.handleChangedVertices(changed_vertices);
    }
}

class Cursor extends DrawableObject {

    constructor(vertices, indices) {
        super(vertices, indices);
        this.primitiveType = 2; //gl.LINE_LOOP

        this.view_matrix = m4.identity();
        this.position = [0, 0, 0];
        this.normal = [0, 0, 0];

        // An orientation quaternion that will be passed to the quat library functions to cut down on allocation
        this.orientation = [0, 0, 0, 0];

        this.color = [0, 0, 0, 1];

        this.cursor_function = null;

        this.target = [0, 0, 0];
        this.up = [0, 0, 0, 0];
        this.dummy = [0, 0, 0, 0];
        this.p_world = [0, 0, 0, 1];
        this.q_inv = [0, 0, 0, 0];

        this.positive_z = [0, 0, 1, 0];
        this.positive_y = [0, 1, 0, 0];

        // Temporary
        this.position_update_flag = false;
        this.color_update_flag = false;

        this.functions = [];
    }

    setData(data) {

        // The cursors aren't using the vertex normals, change later
        this.data = new DataArrays(data[0], data[1]);

        // Ideally you wouldn't initialize everything again and only change the cursor's data, shortcut for now
        // Maybe have pointer to state in class, or find way to send signal when vertex data updates
        state.init(draw_list);
        state.draw(draw_list);
    }

    setColor(color) {
        this.color = color;
    }

    setRed(r) {
        this.color[0] = this.clamp255(r) / 255;
    }

    setGreen(g) {
        this.color[1] = this.clamp255(g) / 255;
    }

    setBlue(b) {
        this.color[2] = this.clamp255(b) / 255;
    }

    setAlpha(a) {
        this.color[3] = this.clamp255(a) / 255;
    }

    clamp255(x) {
        return clamp(x, 0, 255);
    }

    setOrientation(position, normal) {

        this.normal = normal;
        this.position = position;

        // The cursor is defined in x y coordinates with no z value, so we rotate it with the [0, 0, 1] original normal
        //let q = quat.quaternionBetweenVectors([0, 0, 1], normal);
        //this.orientation = q;
        quat.quaternionBetweenVectorsTest(this.positive_z, normal, this.orientation);

        // TODO: this sets the matrices but not the arrays, need a better system, maybe update matrices
        // after setting arrays
        //this.scale_matrix = m4.scaling(1, 1, 1);
        m4.scalingFill(1, 1, 1, this.scale_matrix);
        //this.rotation_matrix = quat.quaternionToMatrix4(q);
        //this.rotation_matrix = quat.quaternionToMatrix4(this.orientation);
        quat.quaternionToMatrix4Fill(this.orientation, this.rotation_matrix);
        //this.translation_matrix = m4.translation(position[0], position[1], position[2]);
        m4.translationFill(position[0], position[1], position[2], this.translation_matrix);

        this.updateModelMatrix();

        // Also update the view matrix of the cursor now that you have q

        // The normal is facing out from the mesh so negate it when modifying vertices
        //let target = vec3.multiplyByConstant(normal, -1);
        vec3.multiplyByConstantTest(normal, -1, this.target);

        // The up vector of the defined vertices of the cursor is the positive y axis
        //let up = quat.rotatePoint(this.orientation, [0, 1, 0]);

        quat.rotatePointFill(this.orientation, this.positive_y, this.q_inv, this.dummy, this.up);

        //let x = quat.rotatePoint(this.orientation, this.positive_y);


        //this.view_matrix = m4.lookAt(position, target, up);

    }

    // The point of this funciton is to create the projection matrix only when the cursor is active
    activateProjectionMatrix() {
        m4.lookAtTest(this.position, this.target, this.up, this.view_matrix);
        // This is the inverse that puts the camera at the origin and moves everything else into coordinates relative to the camera
        this.view_matrix = m4.inverse(this.view_matrix);
    }

    setCursorViewMatrix(m) {
        this.cursor_view_matrix = m;
    }

    // p_world is the world coordiantes of the point to test
    isPointInside(p_world) {

        m4.multiplyVec3Test(this.view_matrix, p_world, this.p_world);

        if (windingNumber(this.p_world, this.data.positions) > 0) {
            return true;
        }

        return false;
    }
}

class Camera extends Object {

    constructor() {

        super();

        this.position = [0, 0, 0];
        this.target = [0, 0, 0];
        this.up = [0, 0, 0];

        this.xAxis = [0, 0, 0];
        this.yAxis = [0, 0, 0];
        this.zAxis = [0, 0, 0];

        this.direction = [0, 0, 0];

        this.view_matrix = m4.identity();
        this.inverse_view_matrix = m4.identity();

        this.projection_matrix = m4.identity();
        this.inverse_projection_matrix = m4.identity();

        this.vp = m4.identity();

        this.orientation = [0, 0, 0, 1];

    }

    // moves along the plane defined by the camera's target vector and up vector
    panAlongPlane(horizontal, vertical) {

        let horizontal_axis = vec3.normalize(vec3.cross(this.up, vec3.normalize(vec3.subtract(this.position, this.target))));
        let vertical_axis = vec3.normalize(vec3.cross(vec3.normalize(vec3.subtract(this.position, this.target)), horizontal_axis));

        let h = vec3.multiplyByConstant(horizontal_axis, horizontal);
        let v = vec3.multiplyByConstant(vertical_axis, vertical);

        this.position = vec3.add(this.position, h);
        this.position = vec3.add(this.position, v);

        // Because the camera is panning, you want the position-target vector to stay the same
        this.target = vec3.add(this.target, h);
        this.target = vec3.add(this.target, v);

        this.updateLookAt();
    }

    rotateAroundTarget(horizontal, vertical) {

        // TODO: create the axis using horizontal and vertical and apply one single rotation? maybe not
        // The axis angle quaternion to rotate the point around: (0, 0, 1) is z axis, horizontal is the angle

        let pos_minus_target = vec3.subtract(this.position, this.target);

        let dot = vec3.dot(this.up, vec3.normalize(pos_minus_target));

        if (dot > 0.997 && vertical < 0) {
            return;
        }

        if (dot < -0.997 && vertical > 0) {
            return;
        }

        let horizontal_axis = vec3.normalize(vec3.cross(this.up, vec3.normalize(pos_minus_target)));
        let vertical_axis = vec3.normalize(vec3.cross(vec3.normalize(pos_minus_target), horizontal_axis));

        // TODO combine them into one axis
        let q1 = quat.fromAxisAngle([vertical_axis[0], vertical_axis[1], vertical_axis[2], horizontal]);
        let q2 = quat.fromAxisAngle([horizontal_axis[0], horizontal_axis[1], horizontal_axis[2], vertical]);

        this.position = quat.rotatePoint(quat.normalize(q2), quat.rotatePoint(quat.normalize(q1), pos_minus_target));

        // Add back the displacement of the camera target after rotating it around the origin (position - target);
        this.position[0] += this.target[0];
        this.position[1] += this.target[1];
        this.position[2] += this.target[2];

        this.updateDirection();
        this.updateLookAt();

    }

    updateLookAt() {

        vec3.subtractTest2(this.position, this.target, this.zAxis);
        vec3.normalizeTest(this.zAxis);
        // Have to do this when subtracting a vector from a point so the normalization doesn't get messed up
        vec3.crossTest(this.up, this.zAxis, this.xAxis);
        vec3.normalizeTest(this.xAxis);

        vec3.crossTest(this.zAxis, this.xAxis, this.yAxis);
        vec3.normalizeTest(this.yAxis);


        //let xAxis = vec3.normalize(vec3.cross(this.up, zAxis));
        //let yAxis = vec3.normalize(vec3.cross(zAxis, xAxis));

        /*
        this.inverse_view_matrix = [
            xAxis[0], xAxis[1], xAxis[2], 0,
            yAxis[0], yAxis[1], yAxis[2], 0,
            zAxis[0], zAxis[1], zAxis[2], 0,
            this.position[0],
            this.position[1],
            this.position[2],
            1,
        ];
        */

        this.inverse_view_matrix[0] = this.xAxis[0];
        this.inverse_view_matrix[1] = this.xAxis[1];
        this.inverse_view_matrix[2] = this.xAxis[2];
        this.inverse_view_matrix[3] = 0;
        this.inverse_view_matrix[4] = this.yAxis[0];
        this.inverse_view_matrix[5] = this.yAxis[1];
        this.inverse_view_matrix[6] = this.yAxis[2];
        this.inverse_view_matrix[7] = 0;
        this.inverse_view_matrix[8] = this.zAxis[0];
        this.inverse_view_matrix[9] = this.zAxis[1];
        this.inverse_view_matrix[10] = this.zAxis[2];
        this.inverse_view_matrix[11] = 0;
        this.inverse_view_matrix[12] = this.position[0];
        this.inverse_view_matrix[13] = this.position[1];
        this.inverse_view_matrix[14] = this.position[2];
        this.inverse_view_matrix[15] = 1;

        // This is the inverse that puts the camera at the origin and moves everything else into coordinates relative to the camera
        this.view_matrix = m4.inverse(this.inverse_view_matrix);

        this.updateVP();

    }

    lookAt(position, target, up) {

        this.position = position;
        this.target = target;
        this.up = up;

        this.updateDirection();

        let zAxis = vec3.normalize(vec3.subtract(position, target));
        let xAxis = vec3.normalize(vec3.cross(up, zAxis));
        let yAxis = vec3.normalize(vec3.cross(zAxis, xAxis));

        this.inverse_view_matrix = [
            xAxis[0], xAxis[1], xAxis[2], 0,
            yAxis[0], yAxis[1], yAxis[2], 0,
            zAxis[0], zAxis[1], zAxis[2], 0,
            position[0],
            position[1],
            position[2],
            1,
        ];

        // This is the inverse that puts the camera at the origin and moves everything else into coordinates relative to the camera
        this.view_matrix = m4.inverse(this.inverse_view_matrix);
        this.updateVP();
    }

    perspective(fov_radians, aspect, near, far) {
        let f = Math.tan(Math.PI * 0.5 - 0.5 * fov_radians);
        let rangeInv = 1.0 / (near - far);

        this.projection_matrix = [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];

        this.inverse_projection_matrix = m4.inverse(this.projection_matrix);
        this.updateVP();
    }

    updateVP() {
        m4.multiplyFill(this.projection_matrix, this.view_matrix, this.vp);
    }

    getVP() {
        //return m4.multiply(this.projection_matrix, this.view_matrix);
        return this.vp;
    }

    getPosition() {
        return this.position;
    }

    getTarget() {
        return this.target;
    }

    getUp() {
        return this.up;
    }

    getDirection() {
        return this.direction;
    }

    updateDirection() {
        vec3.subtractTest2(this.position, this.target, this.direction);
        vec3.normalizeTest(this.direction);
    }

    setPosition(p) {
        this.position = p;
    }

    setTarget(t) {
        this.target = t;
    }

    setUp(u) {
        this.up = u;
    }

    zoom(amount) {
        //move the position towards the target by the amount, making sure to not go past the target

        let target_minus_position = vec3.subtract(this.target, this.position);

        //TODO: fix when the target - position is extremely small, need betted bounds

        // If the position is already very close to the target and you want to zoom in even more, don't allow it
        if (vec3.length(target_minus_position) <= amount && amount > 0) {
            return;
        }

        target_minus_position[3] = 0;

        target_minus_position = vec3.normalize(target_minus_position);

        this.position[0] += (target_minus_position[0] * amount);
        this.position[1] += (target_minus_position[1] * amount);
        this.position[2] += (target_minus_position[2] * amount);

        this.updateLookAt();
    }
}




// Might be useful later for something like a uv sphere

/*
class Sphere extends DrawableObject {

    constructor(radius, lat_strips, long_strips) {
        super();
        //this.createVertices(radius, lat_strips, long_strips);
        //this.createNormals();
        //this.createEdgeList();
        //this.createVertexTriangleList();
    }

    // Creates the array of individual vertices that make up the sphere as well as the indices in the index array that represent the triangles of the object
    createVertices(radius, lat_strips, long_strips) {

        var new_vertices = [];

        var new_indices = [];

        // Throw an error here
        if (radius == 0 || lat_strips < 2 || long_strips < 2) {
            return;
        }

        // The angle lengths between each vertex on a given latitude or longitude line in radians

        // Starting from the top of the sphere at 0, this angle goes down only the front half of the sphere
        var lat_increment = Math.PI / lat_strips;

        // Starting from the front of the sphere at 0, this angle wraps all the way around the equator of the sphere
        var long_increment = (2 * Math.PI) / long_strips;

        // Set up vertex array
        new_vertices.push(0.0, radius, 0.0);

        for (let lat_level = 1; lat_level < lat_strips; lat_level++) {
            for (let long_level = 0; long_level < long_strips; long_level++) {

                let v = this.toXYZ(radius, lat_level * lat_increment, long_level * long_increment);
                new_vertices.push(v[0], v[1], v[2]);
            }
        }

        new_vertices.push(0.0, -radius, 0.0);

        this.vertices = new Float32Array(new_vertices);




        // Set up index array by going through all of the newly created vertices

        // The top strip of the sphere, each triangle's first vertex is the top of the sphere
        for (let i = 1; i < long_strips; i++) {
            new_indices.push(0, i, i + 1);
        }

        // The indices for the last triangle in the top strip
        new_indices.push(0, long_strips, 1);

        // The middle strips of the sphere
        for (let lat_level = 1; lat_level < lat_strips - 1; lat_level++) {
            for (let long_level = 0; long_level < long_strips; long_level++) {

                // This is the index of the top left vertex in each square segment of the sphere
                // The 1 is added because of the top vertex on the sphere
                let i = 1 + (long_strips * (lat_level - 1)) + long_level;

                // If you add long_strips to i, the index will wrap around the entire sphere and move down
                // to the next latitude row
                let tl = i;
                let bl = i + long_strips;
                let tr = i + 1;
                let br = i + long_strips + 1;

                // If the square is the last one in the ring aroung the sphere,
                // the top right and bottom right indices are the first in the ring
                if (long_level == long_strips - 1) {

                    //This moves the two vertex indices up one ring in the sphere
                    tr -= long_strips;
                    br -= long_strips;
                }

                new_indices.push(tl, bl, tr);
                new_indices.push(tr, bl, br);
            }
        }

        // The bottom strip of the sphere, each triangle's second vertex is the bottom of the sphere
        for (let i = 0; i < long_strips; i++) {

            //This is the index of the vertex directly above the bottom of the sphere on the front of the sphere
            let offset = 1 + (long_strips * (lat_strips - 2));

            //This is the index of the bottom of the sphere
            let bottom = 1 + (long_strips * (lat_strips - 1));

            if (i == (long_strips - 1)) {
                new_indices.push(i + offset, bottom, offset);
            }

            else {
                new_indices.push(i + offset, bottom, i + offset + 1);
            }
        }
        this.indices = new Uint16Array(new_indices);
    }

    // Using the created vertex list of the mesh, creates the adjacent vertex normals for each vertex
    // This is done by adding up the normals of all faces the vertex is a part of, then normalizing
    createNormals() {

        let new_normals = [];

        let new_colors = [];

        let v0 = [];
        let v1 = [];
        let v2 = [];

        let v0v1 = [];
        let v0v2 = [];

        let cross = [];

        // The vertex normals are all set to [0, 0, 0] so the computed face normals can be added to them later
        for (let i = 0; i < this.vertices.length; i += 3) {
            new_normals.push(0, 0, 0);
            //new_colors.push(Math.random(), Math.random(), Math.random(), 1);
            new_colors.push(0, .3, .8, 1);
            // kluge right now for testing, set the colors here

        }

        for (let i = 0; i < this.indices.length; i += 3) {

            v0 = this.getVertexByIndex(this.indices[i]);
            v1 = this.getVertexByIndex(this.indices[i + 1]);
            v2 = this.getVertexByIndex(this.indices[i + 2]);

            v0v1 = vec3.subtract(v1, v0);
            v0v2 = vec3.subtract(v2, v0);

            cross = vec3.normalize(vec3.cross(v0v1, v0v2));

            // This is crap fix later
            new_normals[this.indices[i] * 3] += cross[0];
            new_normals[this.indices[i] * 3 + 1] += cross[1];
            new_normals[this.indices[i] * 3 + 2] += cross[2];

            new_normals[this.indices[i + 1] * 3] += cross[0];
            new_normals[this.indices[i + 1] * 3 + 1] += cross[1];
            new_normals[this.indices[i + 1] * 3 + 2] += cross[2];

            new_normals[this.indices[i + 2] * 3] += cross[0];
            new_normals[this.indices[i + 2] * 3 + 1] += cross[1];
            new_normals[this.indices[i + 2] * 3 + 2] += cross[2];
        }



        // This has to be fixed using some sort of pass by reference, the pass by value doesn't work well with the flat array of float32 or uint16
        for (let i = 0; i < new_normals.length; i += 3) {

            let v = [new_normals[i], new_normals[i + 1], new_normals[i + 2]];
            v = vec3.normalize(v);

            new_normals[i] = v[0];
            new_normals[i + 1] = v[1];
            new_normals[i + 2] = v[2];
        }

        this.vertex_normals = new Float32Array(new_normals);
        this.colors = new Float32Array(new_colors);
    }

    setData(data){

        this.indices = new Uint16Array(data[0]);
        this.vertices = new Float32Array(data[1]);
        this.vertex_normals = new Float32Array(data[1]);

        this.createEdgeList();
        this.createVertexTriangleList();
    }

    createEdgeList() {

        // index i in edge list contains the indices of all other vertices vertex i is connected to
        // used for the bfs when modifying vertices

        // I tried using fill([]); but when i pushed to one array they all updated
        for(let i = 0; i < this.vertices.length/3; i++){
            this.edge_list.push([]);
        }

        for (let i = 0; i < this.indices.length; i += 3) {

            let index1 = this.indices[i];
            let index2 = this.indices[i + 1];
            let index3 = this.indices[i + 2];

            this.edge_list[index1].push(index2);
            this.edge_list[index2].push(index3);
            this.edge_list[index3].push(index1);

        }
    }

    createVertexTriangleList() {

        // index i in the triangle list contains the indices of all of the triangles the vertex i is a part of
        // used when updating the vertex normals after a vertex's position has been modified

        // Same as the edge list, can't just use fill
        for(let i = 0; i < this.vertices.length/3; i++){
            this.vertex_triangle_list.push([]);
        }

        for (let i = 0; i < this.indices.length; i++) {
            this.vertex_triangle_list[this.indices[i]].push(Math.floor(i / 3));
        }
    }

     helper function to convert radius, latitude angle, longitude angle coordinates to x y z coordinates on the shell of the sphere
     *
     * lat_angle starts from the top of the sphere and ends at the bottom, from 0 to PI
     * long_angle starts from the front of the sphere and ends at the front, from 0 to 2*PI
     *
     * Returns [x, y, z] array in right hand coordinates (x right, y up, z towards camera)

    toXYZ(radius, lat_angle, long_angle) {
        return [(radius * Math.sin(lat_angle)) * Math.sin(long_angle),
        radius * Math.cos(lat_angle),
        (radius * Math.sin(lat_angle)) * Math.cos(long_angle)];
    }
}
*/
