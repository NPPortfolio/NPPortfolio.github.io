var geometryCreator = {

    // Eventually it will be cleaner to put the sphere creation in here as well, for now it is only the cursor geometry
    // because the sphere doesn't change (and the class itself makes it when the sphere is created)

    // These functions also repeat a lot of code and should be combined into one somehow

    createCircle: function (radius, num_segments) {

        let angle = (2 * Math.PI) / num_segments;

        let indices = [];
        let vertices = [];

        for (var i = 0; i < num_segments; i++) {

            vertices.push(Math.cos(angle * i) * radius, Math.sin(angle * i) * radius, 0.0)
            indices.push(i);
        }

        return [vertices, indices];
    },

    createStar: function (radius, num_segments) {

        let angle = (2 * Math.PI) / num_segments;

        let indices = [];
        let vertices = [];

        let r_ = radius;

        for (var i = 0; i < num_segments; i++) {

            if (i % 2) r_ /= 2;

            vertices.push(Math.cos(angle * i) * r_, Math.sin(angle * i) * r_, 0.0)
            indices.push(i);

            r_ = radius;
        }

        return [vertices, indices];
    },

    createRandomCursor: function (radius, num_segments) {

        let angle = (2 * Math.PI) / num_segments;

        let indices = [];
        let vertices = [];

        for (var i = 0; i < num_segments; i++) {

            let pos = [Math.cos(angle * i) * radius, Math.sin(angle * i) * radius, 0.0];
            pos = vec3.multiplyByConstant(pos, Math.random());
            vertices.push(pos[0], pos[1], 0.0);
            indices.push(i);

        }

        return [vertices, indices];

    },

    // loosely following songho webgl sphere tutorial
    // TODO: rename the lat and long normals to avoid confusion, because they are plane normals
    createCubeSphere(radius, num_segments) {

        // note: creates the indices first, then populates the vertices array using the index_cube coordinates

        let indices = [];

        // 2 * (num_segments+1 * num_segments+1) two faces including edges
        // + (num_segments -1 * 4 * (num_segments)); the num_segments - 1 rings going from one of the two planes to the other
        // reduces down to
        let num_total_vertices = 6 * (num_segments * num_segments) + 2;

        let vertices = new Array(num_total_vertices * 3).fill(null);

        let index_cube = [];
        let running_index_counter = 0;

        // Javascript wont let you create a 3d array of fixed size, so you have to take the time to iterate
        // Through the whole thing and construct the array
        for (let x = 0; x <= num_segments; x++){

            let y_array = [];

            for(let y = 0; y <= num_segments; y++){

                let z_array = [];
                for(let z = 0; z <= num_segments; z++){


                    // For the cube sphere you only care about the outer shell
                    // you might not even need to push null
                    let inMiddle = (inTheMiddle(x, 0, num_segments) && inTheMiddle(y, 0, num_segments) && inTheMiddle(z, 0, num_segments));
                    if(inMiddle){
                        z_array.push(null);
                    }

                    else{

                        // Prevent overwriting a vertex with a new index
                        if(vertices[running_index_counter * 3] === null){
                            z_array.push(running_index_counter);
                            let v = vertexFromXYZIndex(x, y, z);
                            vertices[running_index_counter * 3] = v[0];
                            vertices[running_index_counter * 3 + 1] = v[1];
                            vertices[running_index_counter * 3 + 2] = v[2];

                            running_index_counter++;
                        }
                    }
                }
                y_array.push(z_array);
            }

            index_cube.push(y_array);
        }

        // now that the vertices are created you can use the structure of the indexd cube to triangulate the 6 faces a lot easier
        // This part is very hard coded and there are definitely some other better ways to populate the triangle list,  TODO later maybe

        // front and back faces
        for(let x = 0; x < num_segments; x++){
            for(let y = 0; y < num_segments; y++){

                // from the front (z = radius)
                let anchor_front = index_cube[x][y][num_segments];
                let front_tl = index_cube[x][y + 1][num_segments];
                let front_tr = index_cube[x + 1][y + 1][num_segments];
                let front_br = index_cube[x + 1][y][num_segments];

                indices.push(front_tl, anchor_front, front_tr);
                indices.push(front_tr, anchor_front, front_br);

                let anchor_back = index_cube[num_segments - x][y][0];
                let back_tl = index_cube[num_segments - x][y+1][0];
                let back_tr = index_cube[num_segments - x -1][y+1][0];
                let back_br = index_cube[num_segments - x -1][y][0];

                indices.push(back_tl, anchor_back, back_tr);
                indices.push(back_tr, anchor_back, back_br);
            }
        }

        // top and bottom faces
        for(let x = 0; x < num_segments; x++){
            for(let z = 0; z < num_segments; z++){

                let anchor_bottom = index_cube[x][0][z];
                let bottom_tl = index_cube[x][0][z + 1];
                let bottom_tr = index_cube[x + 1][0][z + 1];
                let bottom_br = index_cube[x+1][0][z];

                indices.push(bottom_tl, anchor_bottom, bottom_tr);
                indices.push(bottom_tr, anchor_bottom, bottom_br);

                let anchor_top = index_cube[num_segments - x][num_segments][z];
                let top_tl = index_cube[num_segments - x][num_segments][z + 1];
                let top_tr = index_cube[num_segments - x - 1][num_segments][z + 1];
                let top_br = index_cube[num_segments - x - 1][num_segments][z];

                indices.push(top_tl, anchor_top, top_tr);
                indices.push(top_tr, anchor_top, top_br);
            }
        }

        // left and right faces
        for(let y = 0; y < num_segments; y++){
            for(let z = 0; z < num_segments; z++){
                
                let anchor_left = index_cube[0][y][z];
                let left_tl = index_cube[0][y+1][z];
                let left_tr = index_cube[0][y+1][z+1];
                let left_br = index_cube[0][y][z+1];

                indices.push(left_tl, anchor_left, left_tr);
                indices.push(left_tr, anchor_left, left_br);

                let anchor_right = index_cube[num_segments][y][num_segments - z];
                let right_tl = index_cube[num_segments][y+1][num_segments - z];
                let right_tr = index_cube[num_segments][y+1][num_segments - z - 1];
                let right_br = index_cube[num_segments][y][num_segments - z - 1];

                indices.push(right_tl, anchor_right, right_tr);
                indices.push(right_tr, anchor_right, right_br);
            }
        }

        return [vertices, indices];
        
        function inTheMiddle(x, a, b){

            if(x > a && x < b){
                return true;
            }

            return false;
        }

        // the indices line up with the vertex coordinates in world space
        function vertexFromXYZIndex(x, y, z){

            let shift = Math.floor(num_segments/2);

            let x_ = x - shift;
            let y_ = y - shift;
            let z_ = z - shift;

            // you can also use two normals and lat and long angles to make each quad roughly the same size, todo later
            let xyz = vec3.multiplyByConstant(vec3.normalize([x_, y_, z_]), radius);

            return xyz;
        }
    }
}