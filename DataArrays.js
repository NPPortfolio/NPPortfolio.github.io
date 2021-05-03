class DataArrays{

    constructor(vertices, indices){

        this.positions = new Float32Array(vertices);
        //  Workaround for now, only works on a sphere like object
        // TODO cleanup
        this.normals = new Array(this.positions.length);
        for(let i = 0; i < this.normals.length; i++){
            this.normals[i] = this.positions[i];
        }
        this.normals = new Float32Array(this.normals);

        // can't use FLoat32Array with a length
        this.colors = new Array((this.positions.length/3) * 4);
        
        for(let i = 0; i < this.colors.length; i+=4){
            this.colors[i] = 0.0;
            this.colors[i + 1] = 0.5;
            this.colors[i + 2] = 0.5;
            this.colors[i + 3] = 1.0;   
        }
        
        this.colors = new Float32Array(this.colors);

        // Messy testing
        this.in_queue = new Array(this.positions.length/3);
        this.in_queue.fill(false);

        this.indices = indices;
    }

    getVertexPosition(i){
        return [this.positions[i * 3], this.positions[i * 3 + 1], this.positions[i * 3 + 2]];
    }

    getVertexPositionFill(i, fill){
        fill[0] = this.positions[i*3];
        fill[1] = this.positions[i*3 + 1];
        fill[2] = this.positions[i * 3 + 2];
    }

    getVertexNormal(i){
        return [this.normals[i * 3], this.normals[i * 3 + 1], this.normals[i * 3 + 2]];
    }

    getVertexColor(i){
        return [this.colors[i * 3], this.colors[i * 3 + 1], this.colors[i * 3 + 2], this.colors[i * 3 + 3]];
    }


    setVertexPosition(i, position){
        this.updateSliceFromIndex(i * 3, this.positions, position);
    }

    setVertexNormal(i, normal){
        this.updateSliceFromIndex(i * 3, this.normals, normal);
    }

    setVertexColor(i, color){
        this.updateSliceFromIndex(i * 4, this.colors, color);
    }


    addToVertexPosition(i, position){

        // cant use this function because you want to save on allocation by directly adding, not setting to a new array
        //this.updateSliceFromIndex(i * 3, this.positions, vec3.add(this.getVertexPosition(i), position));
        this.positions[i * 3] += position[0];
        this.positions[i * 3 + 1] += position[1];
        this.positions[i * 3 + 2] += position[2];

    }

    // TODO: can also make getSlice..., unsure what best method is right now
     
    updateSliceFromIndex(index, array, new_array){

        for(let i = 0; i < new_array.length; i++){
            array[index + i] = new_array[i];
        }
    }

    populateAllocatedVertexPosition(i, pos){
        pos[0] = this.positions[i * 3];
        pos[1] = this.positions[i * 3 + 1];
        pos[2] = this.positions[i * 3 + 2];
    }

    setInQueue(i, bool){
        this.in_queue[i] = bool;
    }
    clearInQueue(){
        this.in_queue.fill(false);
    }

}

class TriangulatedDataArrays extends DataArrays{

    constructor(vertices, indices){

        super(vertices, indices);

        this.triangle_lists = new Array(this.positions.length/3);
        this.edge_lists = new Array(this.positions.length/3);

        // when using fill([]), each spot in array references one array
        this.fillWithEmptyArrays(this.triangle_lists);
        this.fillWithEmptyArrays(this.edge_lists);

        this.triangle_in_overflow = new Array(this.indices.length/3).fill(false);
        this.triangle_cell_coords = new Array(this.indices.length/3);

        this.populateTriangleLists();
        this.populateEdgeLists();


    }

    addToVertexTriangleList(vertex_index, triangle_index){
        this.triangle_lists[vertex_index].push(triangle_index);
    }

    addToVertexEdgeList(vertex_index, added_vertex_index){
        this.edge_list[vertex_index].push(added_vertex_index);
    }


    getVertexTriangleList(i){
        return this.triangle_lists[i];
    }

    getVertexEdgeList(i){
        return this.edge_lists[i];
    }


    getTriangleIndices(i){
        return [this.indices[i*3], this.indices[i*3+1], this.indices[i*3+2]];
    }

    getTriangleV0Index(i){
        return this.indices[i * 3];
    }


    getTriangleVertexPositions(i){

        // Testing garbage collection with less readable code
        //let indices = this.getTriangleIndices(i);
        //return [this.getVertexPosition(indices[0]), this.getVertexPosition(indices[1]), this.getVertexPosition(indices[2])];

        return [this.getVertexPosition(this.indices[i * 3]), this.getVertexPosition(this.indices[i * 3 + 1]), this.getVertexPosition(this.indices[i * 3 + 2])];
    }

    populateAllocatedTriangle(i, triangle){
        triangle[0][0] = this.positions[this.indices[i * 3] * 3];
        triangle[0][1] = this.positions[this.indices[i * 3] * 3 + 1];
        triangle[0][2] = this.positions[this.indices[i * 3] * 3 + 2];

        triangle[1][0] = this.positions[this.indices[i * 3 + 1] * 3];
        triangle[1][1] = this.positions[this.indices[i * 3 + 1] * 3 + 1];
        triangle[1][2] = this.positions[this.indices[i * 3 + 1] * 3 + 2];

        triangle[2][0] = this.positions[this.indices[i * 3 + 2] * 3];
        triangle[2][1] = this.positions[this.indices[i * 3 + 2] * 3 + 1];
        triangle[2][2] = this.positions[this.indices[i * 3 + 2] * 3 + 2];
    }

    getTriangleCellCoords(tri_index){
        return this.triangle_cell_coords[tri_index];
    }


    isTriInOverflow(i){
        return this.triangle_in_overflow[i];
    }

    setTriInOverflow(i, bool){
        this.triangle_in_overflow[i] = bool;
    }

    setTriCellCoords(tri_index, coords){
        this.triangle_cell_coords[tri_index] = coords;
    }


    resetTriangleCellCoords(){
        this.triangle_cell_coords = new Array(this.indices.length/3);
    }

    // could combine with edge list function need to test for speed if it really matters
    populateTriangleLists(){

        let tri_index = 0;
        for(let i = 0; i < this.indices.length; i+=3){
            tri_index = Math.floor(i/3);
            this.triangle_lists[this.indices[i]].push(tri_index);
            this.triangle_lists[this.indices[i+1]].push(tri_index);
            this.triangle_lists[this.indices[i+2]].push(tri_index);
        }

    }

    populateEdgeLists(){

        for(let i = 0; i < this.indices.length; i+=3){

            this.edge_lists[this.indices[i]].push(this.indices[i+1]);
            this.edge_lists[this.indices[i+1]].push(this.indices[i+2]);
            this.edge_lists[this.indices[i+2]].push(this.indices[i]);
        }
    }

    fillWithEmptyArrays(array){

        for(let i = 0; i < array.length; i++){
            array[i] = [];
        }
    }
}