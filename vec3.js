var vec3 = {

    add: function (a, b) {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    },

    addTest: function(a, b){
        a[0] += b[0];
        a[1] += b[1];
        a[2] += b[2];
    },

    addTest2: function(a, b, fill){
        fill[0] = a[0] + b[0];
        fill[1] = a[1] + b[1];
        fill[2] = a[2] + b[2];
    },

    subtract: function (a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    },

    subtractTest: function(a, b){
        a[0] -= b[0];
        a[1] -= b[1];
        a[2] -= b[2];
    },

    subtractTest2: function (a, b, result_array){
        result_array[0] = a[0] - b[0];
        result_array[1] = a[1] - b[1];
        result_array[2] = a[2] - b[2];
    },

    dot: function (a, b) {
        return (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2]);
    },

    cross: function (a, b) {
        return ([a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]]);
    },

    crossTest: function(a, b, result_array){
        result_array[0] = a[1] * b[2] - a[2] * b[1];
        result_array[1] = a[2] * b[0] - a[0] * b[2];
        result_array[2] = a[0] * b[1] - a[1] * b[0];
    },

    // The inverse of a vector is something else, weird name to avoid confusion 
    oneOverThis: function (v){
        return [1/v[0], 1/v[1], 1/v[2]];

    },

    oneOverThisFill: function (v, fill){
        fill[0] = 1/v[0];
        fill[1] = 1/v[1];
        fill[2] = 1/v[2];
    },

    // Returns the minimum vector that can be made from the two vectors, used in bounding box creation
    minimumSharedValues(a, b){
        return [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.min(a[2], b[2])];
    },

    maximumSharedValues(a, b){
        return [Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.max(a[2], b[2])];
    },

    // Note: I dont think this makes sense mathematically but is useful for the grid creation
    divide: function (a, b){
        return [a[0] / b[0], a[1] / b[1], a[2] / b[2]];
    },

    multiplyByConstant: function (v, c) {
        return [v[0] * c, v[1] * c, v[2] * c];
    },

    multiplyByConstantTest: function (v, c, fill){
        fill[0] = v[0] * c;
        fill[1] = v[1] * c;
        fill[2] = v[2] * c;
    },

    multiplyByConstantVector: function(v, vc){
        return [v[0] * vc[0], v[1] * vc[1], v[2] * vc[2]];
    },

    length: function (v) {
        return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    },

    normalize: function (v) {
        let length = this.length(v);
        // make sure we don't divide by 0.
        if (length > 0.00001) {
            return [v[0] / length, v[1] / length, v[2] / length];
        } else {
            return [0, 0, 0];
        }
    },

    normalizeTest: function(v){

        let length = this.length(v);

        if (this.length(v) > 0.001){
            v[0] = v[0]/length;
            v[1] = v[1]/length;
            v[2] = v[2]/length;
        }
    },




    // Triangle functions, eventually might move them to own header
    triangleNormal(tri){

        let v0 = tri[0];
        let v1 = tri[1];
        let v2 = tri[2];

        let v0v1 = this.subtract(v1, v0);
        let v0v2 = this.subtract(v2, v0);

        return this.normalize(this.cross(v0v1, v0v2));

    },

    triangleNormalTest(tri, fill, v0v1, v0v2, cross){

        this.subtractTest2(tri[1], tri[0], v0v1);
        this.subtractTest2(tri[2], tri[0], v0v2);
        this.crossTest(v0v1, v0v2, cross);

        this.normalizeTest(cross);

        fill[0] = cross[0];
        fill[1] = cross[1];
        fill[2] = cross[2];

    }

}