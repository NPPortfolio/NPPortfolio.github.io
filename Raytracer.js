class Raytracer {


    constructor() {

        // This object is a test for defining variables that are used in functions that are called very frequently
        // so you cut down on allocation and garbage collection.

        // The final value to add to the original ray which defines the intersection position
        this.final_t = null;

        // Will hold the final t value, the hit triangle's normal, and the hit triangle's v0 index for use in the Mesh BFS
        this.hit_data = [[0, 0, 0], [0, 0, 0], 0];

        // Garbage collection test
        this.triangle = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        this.v0 = this.triangle[0];
        this.v1 = this.triangle[1];
        this.v2 = this.triangle[2];
        this.v0v1 = [0, 0, 0];
        this.v0v2 = [0, 0, 0];
        this.tn = [0, 0, 0];
        this.pvec = [0, 0, 0];
        this.tvec = [0, 0, 0];
        this.qvec = [0, 0, 0];
        this.P = [0, 0, 0];
        this.ray_times_t = [0, 0, 0];

        this.bbox_t = 0.0;
        this.inv_ray_vector = [0, 0, 0];

        this.ret = [0, 0, 0];

        this.ray_bbox_coords = [0, 0, 0];
        this.ray_cell_coords = [0, 0, 0];
        this.ray_cell_indices = [0, 0, 0];

        this.ray_times_bbox_t = [0, 0, 0];

        // The cell index to stop testing the ray at. If the ray goes negative along a direction it is -1
        // If it goes positive, it is the dimension of the grid on that axis
        this.exit = [0, 0, 0];

        // The number to increment or decrement the cell index based on the ray's direction
        this.step = [0, 0, 0];

        // The t values for each direction that the ray takes to reach the next cell (in that dimension)
        this.delta_t = [0, 0, 0];

        this.next_crossing_t = [0, 0, 0];

        this.cell_array_index = 0;

        this.map = [2, 1, 2, 1, 2, 2, 0, 0];

        this.v0_index = 0;
    }

    intersectRayWithASGrid(ray_origin, ray_vector, grid) {

        this.hit_data[0][0] = 0;
        this.hit_data[0][1] = 0;
        this.hit_data[0][2] = 0;
        this.hit_data[1][0] = 0;
        this.hit_data[1][1] = 0;
        this.hit_data[1][2] = 0;

        // Tells the calling function that no triangle was hit
        this.hit_data[2] = -1;

        this.bbox_t = this.rayBoxIntersect(ray_origin, ray_vector, grid);

        //inv_ray_vector = vec3.oneOverThis(ray_vector);

        vec3.oneOverThisFill(ray_vector, this.inv_ray_vector);

        this.final_t = Number.POSITIVE_INFINITY;

        // If the ray doesn't intersect the grid return
        if (this.bbox_t === null) {
            return null;
        }

        // The overflow buffer has to be checked first because it isn't even in the grid
        for (let i = 0; i < grid.overflow.length; i++) {

            grid.mesh.populateAllocatedTriangle(grid.overflow[i], this.triangle);
            this.ret = this.rayTriangleIntersect(ray_origin, ray_vector, false);

            if (this.ret == false) continue;

            // This section first checks if the triangle is closer than the closest intersected triangle found so far
            // If it is, the function sends back a lot of things to the mouse handler, including the index of the hit triangle's v0, the normal of the triangle, and the position
            // on the triangle that the ray hit. This is very messy and is sent to the mouse handler for positioning the cursor, but one of the major things to work on if this was
            // a work environment would be to separate things in to a much neater system... TODO probably write this in a read me
            if (this.ret[2] < this.final_t) {
                this.final_t = this.ret[2];

                //hit_data = [ret[0], ret[1], grid.mesh.getTriangleV0Index(grid.overflow[i])];

                this.hit_data[0][0] = this.ret[0][0];
                this.hit_data[0][1] = this.ret[0][1];
                this.hit_data[0][2] = this.ret[0][2];

                this.hit_data[1][0] = this.ret[1][0];
                this.hit_data[1][1] = this.ret[1][1];
                this.hit_data[1][2] = this.ret[1][2];

                this.hit_data[2] = grid.mesh.getTriangleV0Index(grid.overflow[i]);
            }

        }

        vec3.multiplyByConstantTest(ray_vector, this.bbox_t, this.ray_times_bbox_t);

        vec3.addTest2(ray_origin, this.ray_times_bbox_t, this.ray_bbox_coords);

        vec3.subtractTest2(this.ray_bbox_coords, grid.min_bound, this.ray_cell_coords);

        // could also have cell coords to cell indices function
        grid.worldToCellIndices(this.ray_bbox_coords, this.ray_cell_indices);

        for (let i = 0; i < 3; i++) {

            if (ray_vector[i] < 0) {

                this.delta_t[i] = -grid.cell_size[i] * this.inv_ray_vector[i];
                // +0 to index means cell the ray is in, which is always the next cell to intersect when going negative
                this.next_crossing_t[i] = this.bbox_t + (this.ray_cell_indices[i] * grid.cell_size[i] - this.ray_cell_coords[i]) * this.inv_ray_vector[i];
                this.exit[i] = -1;
                this.step[i] = -1;
            }

            else {

                this.delta_t[i] = grid.cell_size[i] * this.inv_ray_vector[i];
                // +1 to index means cell one along the given dimension
                this.next_crossing_t[i] = this.bbox_t + ((this.ray_cell_indices[i] + 1) * grid.cell_size[i] - this.ray_cell_coords[i]) * this.inv_ray_vector[i];
                this.exit[i] = grid.resolution[i];
                this.step[i] = 1;
            }
        }

        // Starting at the cell the ray hit, Walk through the cells along the ray and test for triangle intersection if
        // they contain geometry
        while (true) {

            this.cell_array_index = grid.getCellArrayIndexXYZ(this.ray_cell_indices);

            // more potential allocation saving TODO
            let triangle_index_array = grid.cells[this.cell_array_index];

            if (triangle_index_array.length != 0) {

                for (let i = 0; i < triangle_index_array.length; i++) {

                    grid.mesh.populateAllocatedTriangle(triangle_index_array[i], this.triangle);

                    //let tri_test = grid.mesh.getTriangleVertexPositions(triangle_index_array[i]);
                    // get the triangle from the mesh and run ray triangle intersect
                    this. ret = this.rayTriangleIntersect(ray_origin, ray_vector, false);
                    //let ret = rayTriangleIntersect(ray_origin, ray_vector, grid.mesh.getTriangleVertexPositions(triangle_index_array[i]), false);

                    if (this.ret == false) continue;

                    // This section first checks if the triangle is closer than the closest intersected triangle found so far
                    // If it is, the function sends back a lot of things to the mouse handler, including the index of the hit triangle's v0, the normal of the triangle, and the position
                    // on the triangle that the ray hit. This is very messy and is sent to the mouse handler for positioning the cursor, but one of the major things to work on if this was
                    // a work environment would be to separate things in to a much neater system... TODO probably write this in a read me


                    // This is the same code as above, move into it's own function maybe

                    if (this.ret[2] < this.final_t) {

                        this.final_t = this.ret[2];

                        //hit_data = [ret[0], ret[1], grid.mesh.getTriangleV0Index(triangle_index_array[i])];

                        this.hit_data[0][0] = this.ret[0][0];
                        this.hit_data[0][1] = this.ret[0][1];
                        this.hit_data[0][2] = this.ret[0][2];

                        this.hit_data[1][0] = this.ret[1][0];
                        this.hit_data[1][1] = this.ret[1][1];
                        this.hit_data[1][2] = this.ret[1][2];

                        this.hit_data[2] = grid.mesh.getTriangleV0Index(triangle_index_array[i]);
                    }
                }
            }

            // Some bit setting to determine which axis to test for the next t value
            // Create a number from 0 to 7 in binary, with largest bit 1 meaning x < y, 2nd largest x < z, 3rd largest y < z
            let k = ((this.next_crossing_t[0] < this.next_crossing_t[1]) << 2) +
                ((this.next_crossing_t[0] < this.next_crossing_t[2]) << 1) +
                ((this.next_crossing_t[1] < this.next_crossing_t[2]));

            //let map = [2, 1, 2, 1, 2, 2, 0, 0];
            let axis = this.map[k];

            if (this.final_t < this.next_crossing_t[axis]) break;
            this.ray_cell_indices[axis] += this.step[axis];
            if (this.ray_cell_indices[axis] == this.exit[axis]) break;
            this.next_crossing_t[axis] += this.delta_t[axis];
        }

        return this.hit_data;
    }

    rayTriangleIntersect(ray_origin, ray_vector, double_sided) {

        vec3.subtractTest2(this.v1, this.v0, this.v0v1);
        vec3.subtractTest2(this.v2, this.v0, this.v0v2);

        // Used in return for circle
        vec3.crossTest(this.v0v1, this.v0v2, this.tn);

        // This is the normalize that doesn't allocate an array to return, working on preventing garbage collection
        vec3.normalizeTest(this.tn);

        vec3.crossTest(ray_vector, this.v0v2, this.pvec);
        let det = vec3.dot(this.v0v1, this.pvec);


        // When you want to test the triangles as double sided a negative determinant is allowed
        if (double_sided && (Math.abs(det) < 0.001)) {
            return false;
        }

        if (!double_sided && (det < 0.001)) {
            return false;
        }


        let invDet = 1 / det;


        //let tvec = vec3.subtract(ray_origin, v0);
        vec3.subtractTest2(ray_origin, this.v0, this.tvec);
        let u = (vec3.dot(this.tvec, this.pvec)) * invDet;
        if (u < 0 || u > 1) return false;

        //let qvec = vec3.cross(tvec, v0v1);
        vec3.crossTest(this.tvec, this.v0v1, this.qvec);
        let v = (vec3.dot(ray_vector, this.qvec)) * invDet;
        if (v < 0 || (u + v) > 1) return false;

        // The distance of the triangle from the ray
        let t = (vec3.dot(this.v0v2, this.qvec)) * invDet;

        // Triangle is behind ray
        if (t < 0) return false;

        vec3.multiplyByConstantTest(ray_vector, t, this.ray_times_t);
        //P = vec3.add(ray_origin, ray_times_t);
        vec3.addTest2(ray_origin, this.ray_times_t, this.P);
        //P = vec3.add(ray_origin, vec3.multiplyByConstant(ray_vector, t));

        // more possible performance saving TODO
        // could pass defined variables to fill but need to check for min t
        return [this.P, this.tn, t];
    }

    // Scratch a pixel code, this is an unoptimized algorithm but it is only called once per frame, for testing keep it for now
    rayBoxIntersect(ray_origin, ray_vector, grid) {

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
}