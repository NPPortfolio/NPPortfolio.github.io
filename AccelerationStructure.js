// This class is made using the scratchapixel tutorial on Acceleration Structures,
// specifically the grid structure and 3D-DDA algorithm

class AccelerationStructure {


    constructor(mesh) {

        // shouldn't need this todo
        mesh.as = this;
        this.mesh = mesh;

        this.max_bound = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
        this.min_bound = [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];

        // Garbage collection

        this.min_tri_bound = [0, 0, 0];
        this.max_tri_bound = [0, 0, 0];

        this.min_tri_cell = [0, 0, 0];
        this.max_tri_cell = [0, 0, 0];

        this.xyz = [0, 0, 0];

        //this.max_tracked = 0;
        //this.min_tracked = 0;

        this.resolution = [1, 1, 1];

        this.cells = [];

        // This array will hold the triangles that were sculpted out of the bounds of the grid until the grid is created again;
        this.overflow = [];

        // Compute the bounding box

        for (let i = 0; i < mesh.getNumVertices(); i++) {

            let pos = mesh.getVertexPosition(i);

            this.min_bound = vec3.minimumSharedValues(this.min_bound, pos);
            this.max_bound = vec3.maximumSharedValues(this.max_bound, pos);
        }

        console.log(this.max_bound);
        console.log(this.min_bound);

        this.bound_size = (vec3.subtract(this.max_bound, this.min_bound));

        // Create the Grid
        // note: the resolution of the grid is given by a certain formula in the scratchapixel tutorial to try to
        // maximize the efficiency. The user tweak value is best between 3 and 5

        // Note: testing with lower values made a lot more sense, not sure why maybe due to the whole mesh being along the edges
        // of the grid (Huge space of nothing in the middle) where normal meshes are more evenly distributed
        let user_tweak = 0.1;
        let cuberoot = Math.cbrt((user_tweak * mesh.getNumTriangles()) / this.boundingBoxVolume());

        // For now the clamp is user set to limit the resolution, but could be set based on something else
        this.resolution[0] = clamp(Math.floor((this.max_bound[0] - this.min_bound[0]) * cuberoot), 1, 128);
        this.resolution[1] = clamp(Math.floor((this.max_bound[1] - this.min_bound[1]) * cuberoot), 1, 128);
        this.resolution[2] = clamp(Math.floor((this.max_bound[2] - this.min_bound[2]) * cuberoot), 1, 128);

        console.log(this.resolution);
        this.cell_size = vec3.divide(this.bound_size, this.resolution);


        //let num_cells = this.resolution[0] * this.resolution[1] * this.resolution[2];

        for (let x = 0; x < this.resolution[0]; x++) {
            for (let y = 0; y < this.resolution[1]; y++) {
                for (let z = 0; z < this.resolution[2]; z++) {
                    //let o = z * resolution[0] * resolution[1] + y * resolution[0] + x;

                    // This array of triangle indices is the cell
                    this.cells.push([]);

                }
            }
        }

        // Insert all of the mesh's triangles into their grid cell
        for (let i = 0; i < mesh.getNumTriangles(); i++) {
            // More garbage collection TODO
            this.insertTriangleIntoGrid(mesh.getTriangleVertexPositions(i), i);
        }

    }

    insertTriangleIntoGrid(tri, index) {

        this.computeTriangleBounds(tri);

        // This function changes the bounds value but it isn't used later, not a good practice though
        this.worldToCellIndices(this.min_tri_bound, this.min_tri_cell);
        this.worldToCellIndices(this.max_tri_bound, this.max_tri_cell);

        let grid_index = 0;

        let x = 0;
        let y = 0;
        let z = 0;

        for (z = this.min_tri_cell[2]; z <= this.max_tri_cell[2]; z++) {

            for (y = this.min_tri_cell[1]; y <= this.max_tri_cell[1]; y++) {

                for (x = this.min_tri_cell[0]; x <= this.max_tri_cell[0]; x++) {

                    this.xyz[0] = x;
                    this.xyz[1] = y;
                    this.xyz[2] = z;

                    grid_index = this.getCellArrayIndexXYZ(this.xyz);

                    if (this.cells[grid_index] === null) {

                        console.log("Tried to access a null cell at x:" + x + " y: " + y + " z: " + z);
                        continue; // Tutorial says create a new cell, not sure if its possible to be null in this setup
                    }

                    // You need to push the triangle index, not the vertex index
                    if(this.mesh.getTriangleCellCoords(index) != grid_index){
                        this.cells[grid_index].push(index);
                        this.mesh.setTriangleCellCoords(index, grid_index);
                    }
                }
            }
        }
    }


    computeTriangleBounds(tri){
        // TODO: fix the vec3 function for min of any size
        //let min_bound = [Math.min(tri[0][0], tri[1][0], tri[2][0]), Math.min(tri[0][1], tri[1][1], tri[2][1]), Math.min(tri[0][2], tri[1][2], tri[2][2])];
        //let max_bound = [Math.max(tri[0][0], tri[1][0], tri[2][0]), Math.max(tri[0][1], tri[1][1], tri[2][1]), Math.max(tri[0][2], tri[1][2], tri[2][2])];


        // with a loop you would have to allcoate some min and max value
        /*
        this.min_tri_bound[0] = Math.min(tri[0][0], tri[1][0], tri[2][0]);
        this.min_tri_bound[1] = Math.min(tri[0][1], tri[1][1], tri[2][1]);
        this.min_tri_bound[2] = Math.min(tri[0][2], tri[1][2], tri[2][2]);

        this.max_tri_bound[0] = Math.max(tri[0][0], tri[1][0], tri[2][0]);
        this.max_tri_bound[1] = Math.max(tri[0][1], tri[1][1], tri[2][1]);
        this.max_tri_bound[2] = Math.max(tri[0][2], tri[1][2], tri[2][2]);
        */

        this.minTest(tri[0][0], tri[1][0], tri[2][0], this.min_tri_bound, 0);
        this.minTest(tri[0][1], tri[1][1], tri[2][1], this.min_tri_bound, 1);
        this.minTest(tri[0][2], tri[1][2], tri[2][2], this.min_tri_bound, 2);

        this.maxTest(tri[0][0], tri[1][0], tri[2][0], this.max_tri_bound, 0);
        this.maxTest(tri[0][1], tri[1][1], tri[2][1], this.max_tri_bound, 1);
        this.maxTest(tri[0][2], tri[1][2], tri[2][2], this.max_tri_bound, 2);
    }

    maxTest(x, y, z, fill, index){

        if(x >= y && x >= z){
            fill[index] = x;
        }

        else if(y >= z){
            fill[index] = y;
        }

        else{
            fill[index] = z;
        }
    }

    minTest(x, y, z, fill, index){

        if(x <= y && x <= z){
            fill[index] = x;
        }

        else if(y <= z){
            fill[index] = y;
        }

        else{
            fill[index] = z;
        }

    }

    boundingBoxVolume() {
        return (this.max_bound[0] - this.min_bound[0]) * (this.max_bound[1] - this.min_bound[1]) * (this.max_bound[2] - this.min_bound[2])
    }

    getCellArrayIndexXYZ(xyz) {

        return xyz[2] * this.resolution[0] * this.resolution[1] + xyz[1] * this.resolution[0] + xyz[0];

    }

    updateTriangleInGrid(tri, tri_index) {

        if (this.isTriangleInBounds(tri)) {
            this.insertTriangleIntoGrid(tri, tri_index);
        }

        else {
            if (!this.mesh.isTriangleInOverflow(tri_index)) {
                this.overflow.push(tri_index);
                this.mesh.setTriangleInOverflow(tri_index, true);
            }
        }
    }

    isTriangleInBounds(tri) {

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {

                if (tri[i][j] < this.min_bound[j] || tri[i][j] > this.max_bound[j]) {
                    return false;
                }
            }
        }

        return true;

    }

    worldToCellIndices(world_xyz, fill) {

        // This shifts over the negative vertex values to line up with the all positive grid indices
        vec3.subtractTest(world_xyz, this.min_bound);

        for (let i = 0; i < 3; i++) {
            //world_xyz[i] = clamp(Math.floor(world_xyz[i] / this.cell_size[i]), 0, this.resolution[i] - 1);
            fill[i] = clamp(Math.floor(world_xyz[i] / this.cell_size[i]), 0, this.resolution[i] - 1);
        }

    }

    // TODO: move the grid creation into its own function so you dont remake the acceleration structure object, just the grid
    updateGridIfNeeded() {

        // If over 5 percent of the triangles are in the overflow array create a new grid
        if ((this.overflow.length / this.mesh.getNumTriangles()) > 0.05) {
            console.log("CREATING NEW ACCELERATION STRUCTURE");
            this.mesh.resetTriangleCellCoords();
            return new AccelerationStructure(this.mesh);
        }

        return this;
    }
}