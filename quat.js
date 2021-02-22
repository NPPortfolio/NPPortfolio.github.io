var quat = {

    identity: function () {
        return [0, 0, 0, 1];
    },

    length: function (q) {
        return Math.sqrt(q[0] * q[0] + q[1] * q[1] + q[2] * q[2] + q[3] * q[3]);
    },

    normalize: function (q) {

        let l = this.length(q);
        return [q[0] / l, q[1] / l, q[2] / l, q[3] / l]
    },

    inverse: function (q) {
        return [-q[0], -q[1], -q[2], q[3]];
    },

    fromAxisAngle(q) {

        let x = Math.sin(q[3] / 2);
        return [q[0] * x, q[1] * x, q[2] * x, Math.cos(q[3] / 2)]

    },

    multiply: function (a, b) {

        let w = a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2];
        let x = a[0] * b[3] + a[3] * b[0] + a[1] * b[2] - a[2] * b[1];
        let y = a[1] * b[3] + a[3] * b[1] + a[2] * b[0] - a[0] * b[2];
        let z = a[2] * b[3] + a[3] * b[2] + a[0] * b[1] - a[1] * b[0];

        return [x, y, z, w];

    },

    // Not sure what this is
    // This returns the quaternion, not sure if it is even needed
    multiplyVector3: function (q, v) {

        let w = -q[0] * v[0] - q[1] * v[1] - q[2] * v[2];
        let x = q[3] * v[0] + q[1] * v[2] - q[2] * v[1];
        let y = q[3] * v[1] + q[2] * v[0] - q[0] * v[2];
        let z = q[3] * v[2] + q[0] * v[1] - q[1] * v[0];

        return [x, y, z, w];
    },

    quaternionBetweenVectors: function (v1, v2) {


        /*
        let q = new Array(4);

        let v1_l = vec3.length(v1);
        let v2_l = vec3.length(v2);

        // This is the axis to rotate v1 around to match v2;
        let axis = vec3.cross(v1, v2);

        q[0] = axis[0];
        q[1] = axis[1];
        q[2] = axis[2];

        // First, check if the two vectors to rotate between are parallel
        let dot = vec3.dot(v1, v2);

        // If they are pointing in the same direction, no need for rotation
        if (dot > 0.9999) {
            return [0, 0, 0, 1]
        }

        // If they are pointing in exact opposite directions, the shortest path doesn't exist so just pick one
        if (dot < -0.9999) {
            // Don't know about this.. 1?
            q[3] = 0;
            return this.normalize(q);
        }

        q[3] = Math.sqrt((v1_l * v1_l) * (v2_l * v2_l) + dot);

        return this.normalize(q);
        */

        // possible check for same direction and opposite direction vectors
        let axis = vec3.normalize(vec3.cross(v1, v2));

        let angle = Math.acos(vec3.dot(v1, v2));

        let s = Math.sin(angle / 2);

        return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(angle / 2)];

    },

    quaternionToMatrix4: function (q) {

        let len = this.length(q);
        if (len < 0.0001) return m4.identity();

        let s = 1 / (len * len);

        // Remember this is column major
        return [
            1 - 2 * s * (q[1] * q[1] + q[2] * q[2]), 2 * s * (q[0] * q[1] + q[2] * q[3]), 2 * s * (q[0] * q[2] - q[1] * q[3]), 0,
            2 * s * (q[0] * q[1] - q[2] * q[3]), 1 - 2 * s * (q[0] * q[0] + q[2] * q[2]), 2 * s * (q[1] * q[2] + q[0] * q[3]), 0,
            2 * s * (q[0] * q[2] + q[1] * q[3]), 2 * s * (q[1] * q[2] - q[0] * q[3]), 1 - 2 * s * (q[0] * q[0] + q[1] * q[1]), 0,
            0, 0, 0, 1
        ];

    },

    // Q is given in axis angle notation
    rotatePoint: function (q, p) {

        let p_ = [p[0], p[1], p[2], 1];

        let ret = quat.multiply(quat.multiply(q, p_), quat.inverse(q));
        return [ret[0], ret[1], ret[2]];
    },

    testRotate: function (q, p) {

        let u = [q[0], q[1], q[2]];

        let s = q[3];

        let p1 = vec3.multiplyByConstant(u, 2 * vec3.dot(u, p));
        let p2 = vec3.multiplyByConstant(p, (s * s - vec3.dot(u, u)));
        let p3 = vec3.multiplyByConstant(vec3.cross(u, p), 2 * s);

        return vec3.add(p1, vec3.add(p2, p3));
    }

}