var vec3 = {

    add: function (a, b) {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    },

    subtract: function (a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    },

    dot: function (a, b) {
        return (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2]);
    },

    cross: function (a, b) {
        return ([a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]]);
    },

    multiplyByConstant: function (v, c) {
        return [v[0] * c, v[1] * c, v[2] * c];
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

}