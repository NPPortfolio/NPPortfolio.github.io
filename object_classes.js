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
        let m = m4.identity();
        m = m4.multiply(m, this.translation_matrix);
        m = m4.multiply(m, this.rotation_matrix);
        m = m4.multiply(m, this.scale_matrix);

        this.model_matrix = m;
    }

    getModelMatrix() {
        return this.model_matrix;
    }

}

class DrawableObject extends Object {

    constructor() {

        super();
        // Array containing one of each vertex in the object, the index array points to this to construct triangles
        // Each element in this array is another array of length 3 (a Vector3)
        this.vertices = [];
        //this.normals = new Array();
        this.indices = [];

        // This is an array of indices that represents the vertices that were changed since the last draw,
        // allowing for the buffering of sub data instead of all of the vertices again and again
        this.buffer_list = new Array();
        this.initBufferList();

        this.face_normals = new Array();
        this.vertex_normals = new Array();

        this.edge_list = [];

        // Vertex X has a list of triangle indices in this array to access?
        this.vertex_triangle_list = [];

        this.primitiveType = gl.TRIANGLES;
    }

    modifyVertex(index, f) {


        let ret = f(this.vertices())

        this.vertices[index * 3] *= 1.01;
        this.vertices[index * 3 + 1] *= 1.01;
        this.vertices[index * 3 + 1] *= 1.01;

        //console.log(v);
    }

    getVertexByIndex(i) {
        let index = i * 3;
        return [this.vertices[index], this.vertices[index + 1], this.vertices[index + 2]];
    }

    setVertex(index, v) {

        let i = index * 3;

        this.vertices[i] = v[0];
        this.vertices[i + 1] = v[1];
        this.vertices[i + 2] = v[2];
    }

    getVertices() {
        return this.vertices;
    }

    getIndices() {
        return this.indices;
    }

    getVertexNormals() {
        return this.vertex_normals;
    }

    getBufferList() {
        return this.buffer_list;
    }

    getEdgeList() {
        return this.edge_list;
    }

    setPrimitiveType(p) {
        this.primitiveType = p;
    }

    initBufferList() {

        // I think this is a setback of javascript, where instead of telling the buffer list how long to be
        // you have to push values into it while iterating the length of the vertex list. This is slow but is
        // only done once to tell the program to buffer all vertices when first drawing the object
        for (let i = 0; i < this.vertices.length; i++) {
            this.buffer_list.push(i);
        }
    }
}

class Sphere extends DrawableObject {

    constructor(radius, lat_strips, long_strips) {
        super();
        this.createVertices(radius, lat_strips, long_strips);
        this.createNormals();
        this.createEdgeList();
        this.createVertexTriangleList();
    }

    // TODO: Move these functions into the geometry creator
    /**
     * 
     * @param {*} radius 
     * @param {*} lat_strips 
     * @param {*} long_strips 
     * 
     */

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

        let v0 = [];
        let v1 = [];
        let v2 = [];

        let v0v1 = [];
        let v0v2 = [];

        let cross = [];

        // The vertex normals are all set to [0, 0, 0] so the computed face normals can be added to them later
        for (let i = 0; i < this.vertices.length; i += 3) {
            new_normals.push(0, 0, 0);
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



        // This has to be fixed using somemsort of pass by reference, the pass by value doesn't work well with the flat array of float32 or uint16
        for (let i = 0; i < new_normals.length; i += 3) {

            let v = [new_normals[i], new_normals[i + 1], new_normals[i + 2]];
            v = vec3.normalize(v);

            new_normals[i] = v[0];
            new_normals[i + 1] = v[1];
            new_normals[i + 2] = v[2];
        }

        this.vertex_normals = new Float32Array(new_normals);
    }

    createEdgeList() {

        for (let i = 0; i < this.indices.length; i++) this.edge_list[i] = [];

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

        for (let i = 0; i < this.vertices.length / 3; i++) this.vertex_triangle_list[i] = [];

        for (let i = 0; i < this.indices.length; i++) {
            this.vertex_triangle_list[this.indices[i]].push(Math.floor(i / 3));
        }
    }

    /**helper function to convert radius, latitude angle, longitude angle coordinates to x y z coordinates on the shell of the sphere
     * 
     * lat_angle starts from the top of the sphere and ends at the bottom, from 0 to PI
     * long_angle starts from the front of the sphere and ends at the front, from 0 to 2*PI
     * 
     * Returns [x, y, z] array in right hand coordinates (x right, y up, z towards camera)
     * */
    toXYZ(radius, lat_angle, long_angle) {
        return [(radius * Math.sin(lat_angle)) * Math.sin(long_angle),
        radius * Math.cos(lat_angle),
        (radius * Math.sin(lat_angle)) * Math.cos(long_angle)];
    }

    customBFS(start_index, max_distance) {

        let visited = new Array();
        let queue = new Array();

        visited.push(start_index);
        queue.push(start_index);

        let start_vertex = this.getVertexByIndex(start_index);

        let distance = [];
        let current_vertex = [];
        let current_v_index = 0;

        let queue_index = 0;

        let num_hit = 1;

        while (queue.length != 0) {

            queue_index = queue.shift();

            for (let i = 0; i < this.edge_list[queue_index].length; i++) {

                // This is the index of the next vertex in the bfs
                current_v_index = this.edge_list[queue_index][i];
                current_vertex = this.getVertexByIndex(current_v_index);

                distance = vec3.length(vec3.subtract(start_vertex, current_vertex));

                if (!visited.includes(current_v_index) && distance < max_distance) {
                    visited.push(current_v_index);
                    queue.push(current_v_index);
                    num_hit++;
                }
            }
        }

        return visited;
    }

    updateNormals(changed_vertices) {

        let current = [];

        for (let i = 0; i < changed_vertices.length; i++) {

            // the list of triangle indices the vertex is in
            current = this.vertex_triangle_list[changed_vertices[i]];

            let new_normal = [0, 0, 0];

            for (let j = 0; j < current.length; j++) {

                // current[j] is the index of the triangle that the vertex is in
                let indices_index = current[j] * 3;

                let v0 = this.getVertexByIndex(this.indices[indices_index]);
                let v1 = this.getVertexByIndex(this.indices[indices_index + 1]);
                let v2 = this.getVertexByIndex(this.indices[indices_index + 2]);

                let v0v1 = vec3.subtract(v1, v0);
                let v0v2 = vec3.subtract(v2, v0);

                let ret = vec3.cross(v0v1, v0v2);

                new_normal = vec3.add(new_normal, ret);

            }

            new_normal = vec3.normalize(new_normal);

            let normal_index = changed_vertices[i] * 3;
            this.vertex_normals[normal_index] = new_normal[0];
            this.vertex_normals[normal_index + 1] = new_normal[1];
            this.vertex_normals[normal_index + 2] = new_normal[2];

        }
    }
}

class Cursor extends DrawableObject {

    constructor(radius, num_segments) {
        super();
        this.primitiveType = gl.LINE_LOOP;
        this.setData(geometryCreator.createCircle(radius, num_segments));
        this.view_matrix = m4.identity();
        this.cursor_view_matrix = m4.identity();
    }

    setData(data){

        // The cursors aren't using the vertex normals, change later
        this.indices = new Uint16Array(data[0]);
        this.vertex_normals = new Float32Array(data[1]);
        this.vertices = new Float32Array(data[1]);
    }

    setOrientation(position, normal){


        // The cursor is defined in x y coordinates with no z value, so we rotate it with the [0, 0, 1] original normal
        let q = quat.quaternionBetweenVectors([0, 0, 1], normal);

        // TODO: this sets the matrices but not the arrays, need a better system, maybe update matrices
        // after setting arrays
        this.scale_matrix = m4.scaling(1, 1, 1);
        this.rotation_matrix = quat.quaternionToMatrix4(q);
        this.translation_matrix = m4.translation(position[0], position[1], position[2]);

        this.updateModelMatrix();

        // Also update the view matrix of the cursor now that you have q

        // The normal is facing out from the mesh so negate it when modifying vertices
        let target = vec3.multiplyByConstant(normal, -1);

        // The up vector of the defined vertices of the cursor is the positive y axis
        let up = quat.rotatePoint(q, [0, 1, 0]);
        
        // This is the inverse that puts the camera at the origin and moves everything else into coordinates relative to the camera
        this.view_matrix = m4.inverse(m4.lookAt(position, target, up));
    }

    setCursorViewMatrix(m) {
        this.cursor_view_matrix = m;
    }
}

class Camera extends Object {

    constructor() {

        super();

        this.position = [0, 0, 0];
        this.target = [0, 0, 0];
        this.up = [0, 0, 0];

        this.view_matrix = m4.identity();
        this.inverse_view_matrix = m4.identity();

        this.projection_matrix = m4.identity();
        this.inverse_projection_matrix = m4.identity();

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

        // I J K define the vector, w is angle to rotate around vector

        // Also have to add back the target to position when it works

        // Also you need to change up vector for more seamless rotation at top and bottom

        // TODO: creat the axis using horizontal and vertical and apply one single rotation ??? maybe not
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

        this.updateLookAt();

    }

    updateLookAt() {

        let zAxis = vec3.subtract(this.position, this.target);//vec4 subtract (position, vec4.add(this.position, this.direction));
        // Have to do this when subtracting a vector from a point so the normalization doesn;t get messed up
        zAxis = vec3.normalize(zAxis);
        let xAxis = vec3.normalize(vec3.cross(this.up, zAxis));
        let yAxis = vec3.normalize(vec3.cross(zAxis, xAxis));

        this.inverse_view_matrix = [
            xAxis[0], xAxis[1], xAxis[2], 0,
            yAxis[0], yAxis[1], yAxis[2], 0,
            zAxis[0], zAxis[1], zAxis[2], 0,
            this.position[0],
            this.position[1],
            this.position[2],
            1,
        ];

        // This is the inverse that puts the camera at the origin and moves everything else into coordinates relative to the camera
        this.view_matrix = m4.inverse(this.inverse_view_matrix);
    }

    lookAt(position, target, up) {

        this.position = position;
        this.target = target;
        this.up = up;

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
    }

    getVP() {
        return m4.multiply(this.projection_matrix, this.view_matrix);
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
        //move the position towards the target by the amount, making sure to no go past the target

        let target_minus_position = vec3.subtract(this.target, this.position);

        // If the position is already very close to the target and you want to zoom in even more, don't allow it
        if (vec3.length(target_minus_position) < amount && amount > 0) {
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
