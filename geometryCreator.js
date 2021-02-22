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

        return [indices, vertices];
    },

    createStar: function (radius, num_segments){

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

        return [indices, vertices];
    },

    createRandomCursor: function (radius, num_segments){

        let angle = (2 * Math.PI) / num_segments;

        let indices = [];
        let vertices = [];
        
        for (var i = 0; i < num_segments; i++) {

            let pos = [Math.cos(angle * i) * radius, Math.sin(angle * i) * radius, 0.0];
            pos = vec3.multiplyByConstant(pos, Math.random());
            vertices.push(pos[0], pos[1], 0.0);
            indices.push(i);

        }

        return [indices, vertices];

    }
}