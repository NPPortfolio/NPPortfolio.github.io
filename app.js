// Matrix library (mostly) from webglfundamentals site for simplicity instead of external 3d matrix libraries
// Important note: OpenGL uses column major vertices, so the first 4 values in an array are the first column and so on
var m4 = {

    multiply: function (a, b) {
        var a00 = a[0 * 4 + 0];
        var a01 = a[0 * 4 + 1];
        var a02 = a[0 * 4 + 2];
        var a03 = a[0 * 4 + 3];
        var a10 = a[1 * 4 + 0];
        var a11 = a[1 * 4 + 1];
        var a12 = a[1 * 4 + 2];
        var a13 = a[1 * 4 + 3];
        var a20 = a[2 * 4 + 0];
        var a21 = a[2 * 4 + 1];
        var a22 = a[2 * 4 + 2];
        var a23 = a[2 * 4 + 3];
        var a30 = a[3 * 4 + 0];
        var a31 = a[3 * 4 + 1];
        var a32 = a[3 * 4 + 2];
        var a33 = a[3 * 4 + 3];
        var b00 = b[0 * 4 + 0];
        var b01 = b[0 * 4 + 1];
        var b02 = b[0 * 4 + 2];
        var b03 = b[0 * 4 + 3];
        var b10 = b[1 * 4 + 0];
        var b11 = b[1 * 4 + 1];
        var b12 = b[1 * 4 + 2];
        var b13 = b[1 * 4 + 3];
        var b20 = b[2 * 4 + 0];
        var b21 = b[2 * 4 + 1];
        var b22 = b[2 * 4 + 2];
        var b23 = b[2 * 4 + 3];
        var b30 = b[3 * 4 + 0];
        var b31 = b[3 * 4 + 1];
        var b32 = b[3 * 4 + 2];
        var b33 = b[3 * 4 + 3];
        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    },

    multiplyVec3: function (m, p, last) {
        return [
            (m[0] * p[0]) + (m[4] * p[1]) + (m[8] * p[2]) + (m[12] * last),
            (m[1] * p[0]) + (m[5] * p[1]) + (m[9] * p[2]) + (m[13] * last),
            (m[2] * p[0]) + (m[6] * p[1]) + (m[10] * p[2]) + (m[14] * last),
            (m[3] * p[0]) + (m[7] * p[1]) + (m[11] * p[2]) + (m[15] * last)];
    },

    identity: function () {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ]
    },

    translation: function (tx, ty, tz) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            tx, ty, tz, 1,
        ];
    },

    xRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1,
        ];
    },

    yRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1,
        ];
    },

    zRotation: function (angleInRadians) {
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);

        return [
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    },

    scaling: function (sx, sy, sz) {
        return [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1,
        ];
    },

    // Simplified functions using the ones above
    translate: function (m, tx, ty, tz) {
        return this.multiply(m, this.translation(tx, ty, tz));
    },

    xRotate: function (m, angleInRadians) {
        return this.multiply(m, this.xRotation(angleInRadians));
    },

    yRotate: function (m, angleInRadians) {
        return this.multiply(m, this.yRotation(angleInRadians));
    },

    zRotate: function (m, angleInRadians) {
        return this.multiply(m, this.zRotation(angleInRadians));
    },

    scale: function (m, sx, sy, sz) {
        return this.multiply(m, this.scaling(sx, sy, sz));
    },



    // Important note: these values are from the coordinates of the camera
    // The near and far values are how near and far away from the camera to include in the bounding box
    orthographic: function (left, right, top, bottom, near, far) {
        return [
            2 / (right - left), 0, 0, -(right + left) / (right - left),
            0, 2 / (top - bottom), 0, -(top + bottom) / (top - bottom),
            0, 0, -2 / (far - near), -(far + near) / (far - near),
            0, 0, 0, 1,
        ]
    },

    perspective: function (fieldOfViewInRadians, aspect, near, far) {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        var rangeInv = 1.0 / (near - far);

        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    },

    lookAt: function (cameraPosition, target, up) {
        let zAxis = vec3.normalize(vec3.subtract(cameraPosition, target));
        let xAxis = vec3.normalize(vec3.cross(up, zAxis));
        let yAxis = vec3.normalize(vec3.cross(zAxis, xAxis));

        return [
            xAxis[0], xAxis[1], xAxis[2], 0,
            yAxis[0], yAxis[1], yAxis[2], 0,
            zAxis[0], zAxis[1], zAxis[2], 0,
            cameraPosition[0],
            cameraPosition[1],
            cameraPosition[2],
            1,
        ];

    },

    inverse: function (m) {
        var m00 = m[0 * 4 + 0];
        var m01 = m[0 * 4 + 1];
        var m02 = m[0 * 4 + 2];
        var m03 = m[0 * 4 + 3];
        var m10 = m[1 * 4 + 0];
        var m11 = m[1 * 4 + 1];
        var m12 = m[1 * 4 + 2];
        var m13 = m[1 * 4 + 3];
        var m20 = m[2 * 4 + 0];
        var m21 = m[2 * 4 + 1];
        var m22 = m[2 * 4 + 2];
        var m23 = m[2 * 4 + 3];
        var m30 = m[3 * 4 + 0];
        var m31 = m[3 * 4 + 1];
        var m32 = m[3 * 4 + 2];
        var m33 = m[3 * 4 + 3];
        var tmp_0 = m22 * m33;
        var tmp_1 = m32 * m23;
        var tmp_2 = m12 * m33;
        var tmp_3 = m32 * m13;
        var tmp_4 = m12 * m23;
        var tmp_5 = m22 * m13;
        var tmp_6 = m02 * m33;
        var tmp_7 = m32 * m03;
        var tmp_8 = m02 * m23;
        var tmp_9 = m22 * m03;
        var tmp_10 = m02 * m13;
        var tmp_11 = m12 * m03;
        var tmp_12 = m20 * m31;
        var tmp_13 = m30 * m21;
        var tmp_14 = m10 * m31;
        var tmp_15 = m30 * m11;
        var tmp_16 = m10 * m21;
        var tmp_17 = m20 * m11;
        var tmp_18 = m00 * m31;
        var tmp_19 = m30 * m01;
        var tmp_20 = m00 * m21;
        var tmp_21 = m20 * m01;
        var tmp_22 = m00 * m11;
        var tmp_23 = m10 * m01;

        var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
            (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
            (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
            (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
            (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

        var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

        return [
            d * t0,
            d * t1,
            d * t2,
            d * t3,
            d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
                (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
            d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
                (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
            d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
                (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
            d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
                (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
            d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
                (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
            d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
                (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
            d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
                (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
            d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
                (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
            d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
                (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
            d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
                (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
            d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
                (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
            d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
                (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
        ];
    },
}

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

var geometryCreator = {

    createSphere: function (radius, lat_strips, long_strips) {

        var new_vertices = new Array();
        var new_indices = new Array();

        // Throw an error here
        if (radius == 0 || lat_strips < 2 || long_strips < 2) {
            return [new_vertices, new_indices];
        }

        // The angle lengths between each vertex on a given latitude or longitude line in radians

        // Starting from the top of the sphere at 0, this angle goes down only the front half of the sphere
        var lat_increment = Math.PI / lat_strips;

        // Starting from the front of the sphere at 0, this angle wraps all the way around the equator of the sphere
        var long_increment = (2 * Math.PI) / long_strips;

        // Set up vertex array
        new_vertices.push([0.0, radius, 0.0]);

        for (let lat_level = 1; lat_level < lat_strips; lat_level++) {
            for (let long_level = 0; long_level < long_strips; long_level++) {

                let v = this.toXYZ(radius, lat_level * lat_increment, long_level * long_increment);
                new_vertices.push([v[0], v[1], v[2]]);
            }
        }

        new_vertices.push([0.0, -radius, 0.0]);

        // Set up index array by going through all of the newly created vertices

        // The top strip of the sphere, each triangle's first vertex is the top of the sphere
        for (let i = 1; i < long_strips; i++) {
            new_indices.push([0, i, i + 1]);
        }

        // The indices for the last triangle in the top strip
        new_indices.push([0, long_strips, 1]);

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

                new_indices.push([tl, bl, tr]);
                new_indices.push([tr, bl, br]);
            }
        }

        // The bottom strip of the sphere, each triangle's second vertex is the bottom of the sphere
        for (let i = 0; i < long_strips; i++) {

            //This is the index of the vertex directly above the bottom of the sphere on the front of the sphere
            let offset = 1 + (long_strips * (lat_strips - 2));

            //This is the index of the bottom of the sphere
            let bottom = 1 + (long_strips * (lat_strips - 1));

            if (i == (long_strips - 1)) {
                new_indices.push([i + offset, bottom, offset]);
            }

            else {
                new_indices.push([i + offset, bottom, i + offset + 1]);
            }
        }

        return [new_vertices, new_indices];
    },

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

    },

    /**helper function to convert radius, latitude angle, longitude angle coordinates to x y z coordinates on the shell of the sphere
 * 
 * lat_angle starts from the top of the sphere and ends at the bottom, from 0 to PI
 * long_angle starts from the front of the sphere and ends at the front, from 0 to 2*PI
 * 
 * Returns [x, y, z] array in right hand coordinates (x right, y up, z towards camera)
 * */
    toXYZ: function (radius, lat_angle, long_angle) {
        return [(radius * Math.sin(lat_angle)) * Math.sin(long_angle),
        radius * Math.cos(lat_angle),
        (radius * Math.sin(lat_angle)) * Math.cos(long_angle)];
    }
}

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
            this.edge_list[index3].push(index1); //.push(index2, index3);

        }
    }

    createVertexTriangleList() {

        for (let i = 0; i < this.vertices.length / 3; i++) this.vertex_triangle_list[i] = [];

        for (let i = 0; i < this.indices.length; i++) {
            this.vertex_triangle_list[this.indices[i]].push(Math.floor(i / 3));
        }
        console.log(this.vertex_triangle_list);
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

        //for(let i = 0; i < S.getVertices().length; i++){
        //visited[i] = false;
        //}
        visited.push(start_index);
        queue.push(start_index);

        //visited[start_index] = true;

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
                //this.modifyVertex(current_vertex);
                distance = vec3.length(vec3.subtract(start_vertex, current_vertex));

                if (!visited.includes(current_v_index) && distance < max_distance) {
                    visited.push(current_v_index);
                    queue.push(current_v_index);
                    num_hit++;
                }
            }
        }

        return visited;

        //console.log(num_hit);
        //console.log(visited);
    }

    updateNormals(change_vertices) {

        let current = [];

        for (let i = 0; i < change_vertices.length; i++) {

            // the list of triangle indices the vertex is in
            current = this.vertex_triangle_list[change_vertices[i]];

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

                //console.log("normal changed");

            }

            new_normal = vec3.normalize(new_normal);

            let normal_index = change_vertices[i] * 3;
            this.vertex_normals[normal_index] = new_normal[0];
            this.vertex_normals[normal_index + 1] = new_normal[1];
            this.vertex_normals[normal_index + 2] = new_normal[2];

        }
    }
}

// TODO: should be called Cursor
class Circle extends DrawableObject {

    constructor(radius, num_segments) {
        super();
        this.primitiveType = gl.LINE_LOOP;
        this.setData(geometryCreator.createCircle(radius, num_segments));

        this.cursor_view_matrix = m4.identity();
    }

    setData(data){

        // The cursors aren't using the vertex normals... ?
        this.indices = new Uint16Array(data[0]);
        this.vertex_normals = new Float32Array(data[1]);
        this.vertices = new Float32Array(data[1]);
    }

    // TODO ???
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

// Vertex shader program
const vsSource = `

    attribute vec3 a_vertexPosition;
    attribute vec3 a_texCoord;
    attribute vec3 a_vertexNormal;

    uniform mat4 u_modelMatrix;
    uniform mat4 u_viewProjectionMatrix;

    varying vec3 v_texCoord;
    varying vec3 v_vertexNormal;

    void main() {
        v_texCoord = a_texCoord;
        v_vertexNormal = a_vertexNormal;
        gl_Position = u_viewProjectionMatrix * u_modelMatrix * vec4(a_vertexPosition, 1.0);
    }
`;

// Fragment shader program
const fsSource = `

    precision mediump float;

    varying vec3 v_texCoord;
    varying vec3 v_vertexNormal;

    uniform sampler2D u_texture;

    uniform vec4 u_color;

    void main() {
        //gl_FragColor = texture2D(u_texture, v_texCoord);
        //gl_FragColor = vec4(v_texCoord, 1.0);

        vec3 normal = normalize(v_vertexNormal);

        float dot = dot(normal, normalize(vec3(0.7, 0.0, 0.7)));

        // remember to put this back to 0
        float light = max(0.0, dot);

        gl_FragColor = u_color;
        gl_FragColor.rgb *= light;
    }
`;

// Mozilla tutorial code
// Initialize a shader program, so WebGL knows how to draw our data
function initShaderProgram(vsSource, fsSource) {

    const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    // If creating the shader program failed, alert
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

// Mozilla tutorial code
// creates a shader of the given type, uploads the source and compiles it
function loadShader(type, source) {

    const shader = gl.createShader(type);

    // Send the source to the shader object
    gl.shaderSource(shader, source);

    // Compile the shader program
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function bufferData(buffer_name, data) {

    let buffer = attributeBuffers[buffer_name];
    if (buffer === null) {
        console.log("Buffer: " + buffer_name + " not found");
        return null;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
}

function bufferIndexData(buffer_name, data) {
    let buffer = indexBuffers[buffer_name];
    if (buffer === null) {
        console.log("Buffer: " + buffer_name + " not found");
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
}

function enableAttribArray(buffer_name, location_name, size, type, normalize, stride, offset) {

    let buffer = attributeBuffers[buffer_name];
    let location = attributeLocations[location_name];

    if (buffer === null) {
        console.log("Buffer: " + buffer_name + " not found");
        return 1;
    }

    if (location === null) {
        console.log("Location: " + location_name + " not found");
        return 1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffers[buffer_name]);
    gl.enableVertexAttribArray(attributeLocations[location_name]);
    // binds the current ARRAY_BUFFER to the attribute (vertexposition)
    gl.vertexAttribPointer(attributeLocations[location_name], size, type, normalize, stride, offset);
    return 0;
}

function setTexture(texture_name, data) {

    tex = textures[texture_name];
    if (tex === null) {
        console.log("Texture: " + texture_name + " not found");
        return;
    }

    gl.bindTexture(gl.TEXTURE_2D, tex);
    // todo: this only accepts 2 by 2 textures, change this to get width and height of the texture, maybe using the data dimensions or a texture object
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

/*
// Just one pixel for now
function modifyTexture(x, y, r, g, b, a) {

    gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([r, g, b, a]));
}
*/


canvas = document.getElementById("glCanvas");
gl = canvas.getContext("webgl");

if (gl === null) {
    alert("Unable to initialize webgl, your browser may not support it");
    //return null;
}

shaderProgram = initShaderProgram(vsSource, fsSource);

if (shaderProgram === null) {
    alert("Shader initialization failed");
    //return null;
}

gl.useProgram(shaderProgram);

// This disables the right click menu for the canvas, so the rmb can be used for camera panning
canvas.oncontextmenu = function (e) {
    e.preventDefault();
};



// A bunch of arrays for holding the locations of the shader program variables
// In a more complex system these could be populated automatically by looking at the shader programs
uniformLocations = {
    modelMatrixLocation: gl.getUniformLocation(shaderProgram, "u_modelMatrix"),
    viewProjectionMatrixLocation: gl.getUniformLocation(shaderProgram, "u_viewProjectionMatrix"),
    colorLocation: gl.getUniformLocation(shaderProgram, "u_color"),
}

uniformBuffers = {

}

attributeLocations = {

    vertexPositionLocation: gl.getAttribLocation(shaderProgram, "a_vertexPosition"),
    vertexNormalLocation: gl.getAttribLocation(shaderProgram, "a_vertexNormal"),
    texCoordLocation: gl.getAttribLocation(shaderProgram, "a_texCoord"),

}

attributeBuffers = {
    vertexPositionBuffer: gl.createBuffer(),
    vertexNormalBuffer: gl.createBuffer(),
    texCoordBuffer: gl.createBuffer()
}

indexBuffers = {
    indexBuffer: gl.createBuffer(),
}

textures = {
    //texture: gl.createTexture()
}

camera = new Camera();

camera.lookAt([0, 0, 16, 1], [0, 0, 0, 1], [0, 1, 0, 0]);
camera.perspective(1.5, canvas.clientWidth / canvas.clientHeight, 0.1, 100);

cvm = m4.identity();

S = new Sphere(8, 128, 128);
C = new Circle(1, 16);

draw_list = [S, C];

init(draw_list);
draw(draw_list);



// In order to initialize the attribute buffers, we need to buffer all of the vertices and indices combined
// so we can then buffer in sub data
function init(draw_list) {

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffers.indexBuffer);

    // Not sure where to put this
    gl.uniform4fv(uniformLocations.colorLocation, [0.0, 1.0, 0.0, 1.0]);

    let combined_vertices = new Array();
    let combined_indices = new Array();
    let combined_normals = new Array();

    let index_offset = 0;

    for (let i = 0; i < draw_list.length; i++) {

        // Note: you have to use Array.from because javascript concat does not work with typed arrays
        // You could also write your own concat function, but this is a one time step so it shouldn't affect performance
        combined_vertices = combined_vertices.concat(Array.from(draw_list[i].getVertices()));
        combined_normals = combined_normals.concat(Array.from(draw_list[i].getVertexNormals()));


        // The indices can't be simply combined because they have to have an offset based on the objects before them
        for (let j = 0; j < draw_list[i].getIndices().length; j++) {
            combined_indices.push(draw_list[i].getIndices()[j] + index_offset);
        }

        index_offset += draw_list[i].getVertices().length / 3;

    }

    // The custom buffer functions use glBufferData instead of BufferSubData, which is slower but more simple for a one time at start function
    bufferData("vertexPositionBuffer", new Float32Array(combined_vertices));
    bufferData("vertexNormalBuffer", new Float32Array(combined_normals));
    bufferData("texCoordBuffer", new Float32Array(combined_vertices));

    bufferIndexData("indexBuffer", new Uint16Array(combined_indices));

    let ret = 0;

    ret += enableAttribArray("vertexPositionBuffer", "vertexPositionLocation", 3, gl.FLOAT, false, 0, 0);
    ret += enableAttribArray("vertexNormalBuffer", "vertexNormalLocation", 3, gl.FLOAT, false, 0, 0);
    ret += enableAttribArray("texCoordBuffer", "texCoordLocation", 3, gl.FLOAT, false, 0, 0);

    if (ret != 0) {
        // TODO: proper error checking
        console.log("Enabling the attribute arrays went wrong");
        return;
    }

    // Map the -1 +1 clip space to 0, canvas width, 0, canvas height
    gl.viewport = (0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.CULL_FACE);

    gl.clearColor(0, 0, 0, 0);
}

function draw(objList) {

    //console.time("draw");

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let v_offset = 0;
    let i_offset = 0;

    for (let i = 0; i < objList.length; i++) {

        let obj = objList[i];

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffers.indexBuffer);

        // There used to be code for only buffering the vertices that were changed here, for now the performance cost is not as important
        // as the other issues, so this could be a future thing to implement
        gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffers["vertexPositionBuffer"]);
        gl.bufferSubData(gl.ARRAY_BUFFER, v_offset, obj.getVertices());

        gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffers["vertexNormalBuffer"]);
        gl.bufferSubData(gl.ARRAY_BUFFER, v_offset, obj.getVertexNormals());

        gl.uniformMatrix4fv(uniformLocations.modelMatrixLocation, false, obj.getModelMatrix());
        gl.uniformMatrix4fv(uniformLocations.viewProjectionMatrixLocation, false, camera.getVP());

        let i_size = obj.getIndices().length;
        let v_size = obj.getVertices().length;

        // The * 2 is because the size of the unsigned short is 2 bytes
        gl.drawElements(obj.primitiveType, i_size, gl.UNSIGNED_SHORT, i_offset * 2);

        v_offset += v_size;
        i_offset += i_size;
    }
}




var ismousedown;
var ismiddlemousedown;
var isrightmousedown;

// BIG TODO
// after the vertices are modified, you have to update the MeshVertices list so the mouse raytrace acts correctly

var delta_x = 0;
var delta_y = 0;

var last_x = 0;
var last_y = 0;

var mouse_x;
var mouse_y;

function mouseHandler(e) {

    var rect = canvas.getBoundingClientRect();

    ndc_x = ((2 * (e.clientX - rect.left)) / rect.width) - 1;
    ndc_y = - (((2 * (e.clientY - rect.top)) / rect.height) - 1);

    delta_x = ndc_x - last_x;
    delta_y = ndc_y - last_y;

    last_x = ndc_x;
    last_y = ndc_y;

    mouseWorldDirection = ([ndc_x, ndc_y, -1, 1.0]);

    mouseWorldDirection = m4.multiplyVec3(camera.inverse_projection_matrix, mouseWorldDirection, 0);
    mouseWorldDirection[2] = -1.0;
    mouseWorldDirection[3] = 0.0;
    mouseWorldDirection = vec3.normalize(m4.multiplyVec3(camera.inverse_view_matrix, mouseWorldDirection, 0));

    switch (e.type) {

        case "mousedown":

            switch (e.which) {
                case 1:
                    ismousedown = true;
                    break;

                case 2:
                    console.log("Middle button clicked");
                    ismiddlemousedown = true;
                    break;

                case 3:
                    //console.log("Right button clicked");
                    isrightmousedown = true;
                    break;
            }

            break;

        case "mouseup":

            switch (e.which) {
                case 1:
                    ismousedown = false;
                    break;

                case 2:
                    ismiddlemousedown = false;
                    break;

                case 3:
                    isrightmousedown = false;
                    break;
            }
            break;

        case "mousemove":

            //console.time("raytrace");
            let ret = intersectRayWithMesh(camera.position, mouseWorldDirection, S.getVertices(), S.getIndices(), S.getModelMatrix(), false);
            //console.timeEnd("raytrace");

            if (ret === null || ret[1] == 0) {
                console.log("circle position null");
            }

            else {

                let cursor_position = ret[0];
                let cursor_normal = ret[1];

                // This is set to the camera
                //cursor_normal = (vec4.subtract(camera.position);

                // TODO: this cant be 0,0,1, have to use camera position?? maybe not
                // I think you could also multiply each of the vertices by the quaternion itself,
                // don't know which is better
                let camera_normal = vec3.normalize(vec3.subtract(camera.position, camera.target));

                // the last parameter is either camera normal or cursor normal depending on whether you want to match triangles normal
                let test = quat.quaternionBetweenVectors([0, 0, 1, 0], cursor_normal);
                let qrot = quat.quaternionToMatrix4(test);

                //console.log(t1);
                //console.log(quat.rotatePoint(t1, [0, 0, 1]));
                //console.log(m4.multiplyVec3(qrot [0, 0, 1], 1));
                //console.log(quat.rotatePointAxisAngle([-1, 0, 0, Math.PI], [0, 0, 1]));

                C.setScaleMatrix(m4.scaling(1, 1, 1));
                C.setRotationMatrix(qrot);
                C.setTranslationMatrix(m4.translation(cursor_position[0], cursor_position[1], cursor_position[2]));
                C.updateModelMatrix();

                // negate the normal of the cursor to get the camera vector
                let cursor_target = vec3.multiplyByConstant(cursor_normal, -1);

                // The up vector of the cursor shouldnt matter for the polygon inside outside test, 
                // so you just need any vector orthogonal to the target normal
                //let cursor_up = orthogonalVector(cursor_target);
                let cursor_up = quat.rotatePoint(test, [0, 1, 0, 0]);
                cvm = createViewMatrixPTU(cursor_position, cursor_target, cursor_up);

                if (ismousedown && !isrightmousedown) {
                    //console.time("vertexModify");
                    //S.modifyVertices(vertexFunction, cvm);
                    //console.time("customBFS");
                    let x = S.customBFS(ret[2], 2);

                    let x1 = C.getVertices();

                    let normal_updates = new Array();

                    for (let i = 0; i < x.length; i++) {

                        if (windingNumber(m4.multiplyVec3(cvm, S.getVertexByIndex(x[i]), 1), x1) > 0) {

                            let moveAlongVector = function (vertex, normal) {
                                return [vertex[0] += normal[0] / 32, vertex[1] += normal[1] / 32, vertex[2] += normal[2] / 32];
                            }

                            S.setVertex(x[i], moveAlongVector(S.getVertexByIndex(x[i]), cursor_normal));
                            normal_updates.push(x[i])
                        }
                    }

                    S.updateNormals(normal_updates);
                    //console.timeEnd("customBFS");

                    //console.log(x);
                    //console.timeEnd("vertexModify");
                }
            }

            // The middle and rmb functions are used whether the cursor hits the mesh or not
            if (ismiddlemousedown) {
                //camera.rotateAroundTarget(delta_x/16, delta_y/16);
            }

            if (isrightmousedown && !ismousedown) {
                camera.rotateAroundTarget(-delta_x * 4, delta_y * 4);
            }

            if (isrightmousedown && ismousedown) {
                camera.panAlongPlane(-delta_x * 16, -delta_y * 16);
            }

            break

        case "wheel":
            camera.zoom(-e.deltaY / 1);//e.deltaY);
            break;

    }

    draw(draw_list);
}

function buttonHandler(id){
    
    switch(id){

        case "cursor_circle":
            C.setData(geometryCreator.createCircle(2, 16));
            break;
        
        case "cursor_star":
            C.setData(geometryCreator.createStar(2, 10));
            break;
        
        case "cursor_random":
            C.setData(geometryCreator.createRandomCursor(2, 10));
            break;
    }

    init(draw_list);
    draw(draw_list);
}





/**
 * Returns the closest triangle of a mesh that a given ray intersects. All of the calculations are done in the object's coordinate space
 * 
 * @param {*} ray_origin the position the ray starts in xyz coordinates
 * @param {*} ray_vector the direction vector that the array is heading
 * @param {*} vertices the list of vertices that define the mesh
 * @param {*} indices the list of indices that define the mesh
 * @param {*} double_sided boolean to determine if the triangle should be seen as double sided (if it isn't only triangles facing the ray will count)
 * 
 */
function intersectRayWithMesh(ray_origin, ray_vector, vertices, indices, double_sided) {

    let hit = [0, 0, 0];
    let min_t = null;
    //console.time("Moller");

    let v0 = [0, 0, 0, 1];
    let v1 = [0, 0, 0, 1];
    let v2 = [0, 0, 0, 1];

    let ret = [];
    let triangle = [v0, v1, v2];

    //console.log(vertices);

    // Loop through every triangle in the mesh
    for (let i = 0; i < indices.length; i += 3) {


        // Might even want to move these out of the loop
        // Each index points to the start of three values for a vertex (x y z)
        let v0_index = indices[i] * 3;
        let v1_index = indices[i + 1] * 3;
        let v2_index = indices[i + 2] * 3;


        // These are the same as using the getVertexByIndex() function in the drawableObject class, so it might be better to put this entire function in the class as well
        // The rayTriangleIntersect function should be outside of the class though, so the most clean way to do this is something to work on in the future
        v0[0] = vertices[v0_index];
        v0[1] = vertices[v0_index + 1];
        v0[2] = vertices[v0_index + 2];

        v1[0] = vertices[v1_index];
        v1[1] = vertices[v1_index + 1];
        v1[2] = vertices[v1_index + 2];

        v2[0] = vertices[v2_index];
        v2[1] = vertices[v2_index + 1];
        v2[2] = vertices[v2_index + 2];

        ret = rayTriangleIntersect(ray_origin, ray_vector, triangle, double_sided);

        if (!ret) continue;


        // This section first checks if the triangle is closer than the closest intersected triangle found so far
        // If it is, the function sends back a lot of things to the mouse handler, including the index of the hit triangle's v0, the normal of the triangle, and the position
        // on the triangle that the ray hit. This is very messy and is sent to the mouse handler for positioning the cursor, but one of the major things to work on if this was
        // a work environment would be to separate things in to a much neater system... TODO probably write this in a read me
        if (ret[2] < min_t || min_t === null) {
            hit[0] = ret[0];
            hit[1] = ret[1];
            min_t = ret[2];
            hit[2] = indices[i];
        }
    }

    //console.timeEnd("Moller");

    return hit;
}

/**
 * Tests whether a ray intersects with a triangle in the same 3d coordinate system
 * 
 * @param {*} ray_origin the position the ray starts in xyz coordinates
 * @param {*} ray_vector the direction vector that the array is heading
 * @param {*} triangle the triangle to test the ray against
 * @param {boolean} double_sided boolean to determine if the triangle should be seen as double sided (if it isn't only triangles facing the ray will count)
 * 
 * @return This return is messy because I need the triangle normal, the intersect position, and the distance from the ray for the mesh intersect algorithm
 *         I'm sure there is a way to clean these two functions up which is something I could consider doing to polish the project more, and would definitely want to do in a work environment
 */
function rayTriangleIntersect(ray_origin, ray_vector, triangle, double_sided) {

    let v0 = triangle[0];
    let v1 = triangle[1];
    let v2 = triangle[2];

    let v0v1 = vec3.subtract(v1, v0);
    let v0v2 = vec3.subtract(v2, v0);


    // Used in return for circle
    let tn = vec3.normalize(vec3.cross(v0v1, v0v2));


    let pvec = vec3.cross(ray_vector, v0v2);
    let det = vec3.dot(v0v1, pvec);


    // When you want to test the triangles as double sided a negative determinant is allowed
    if (double_sided && (Math.abs(det) < 0.001)) {
        return false;
    }

    if (!double_sided && (det < 0.001)) {
        return false;
    }


    let invDet = 1 / det;

    let tvec = vec3.subtract(ray_origin, v0);
    let u = (vec3.dot(tvec, pvec)) * invDet;
    if (u < 0 || u > 1) return false;

    let qvec = vec3.cross(tvec, v0v1);
    let v = (vec3.dot(ray_vector, qvec)) * invDet;
    if (v < 0 || (u + v) > 1) return false;

    // The distance of the triangle from the ray
    t = (vec3.dot(v0v2, qvec)) * invDet;



    // Triangle is behind ray
    if (t < 0) return false;

    let P = vec3.add(ray_origin, vec3.multiplyByConstant(ray_vector, t));

    return [P, tn, t];
}









// Winding number algorithm for 2d inside outside test, taken from point in polygon wikipedia page footnote 6

/**
 * Tests if a point is to the left, right, or on an infinite line in 2d space
 * 
 * @param {Array} P0 The starting point of the infinite line P0P1
 * @param {Array} P1 The second point of the infinite line P0P1
 * @param {Array} P2 The point to test against the line
 * 
 * @return {number} >0 if P2 is left of P0P1
 *                  =0 if P2 is on P0P1
 *                  <0 if P2 is right of P0P1
 * 
 */
function isLeft(P0, P1, P2) {

    return ((P1[0] - P0[0]) * (P2[1] - P0[1]))
        - ((P2[0] - P0[0]) * (P1[1] - P0[1]));

}

/**
 * Returns the winding number of a point with respect to a 2d polygon
 * 
 * @param {Array} P The point in 2d space to test in the polygon (x, y)
 * @param {Array} vertices The vertices that define the polygon, where the last vertex is the same as the first
 * 
 * @return {number} The winding number of the point in the polygon (0 if it is outside the polygon), >0 if it is inside
 */
function windingNumber(P, vertices) {

    let wn = 0;

    for (let i = 0; i < vertices.length; i += 3) {

        let v1 = [vertices[i], vertices[i + 1], vertices[i + 2]];
        let v2 = 0;
        if (i == vertices.length - 3) {
            v2 = [vertices[0], vertices[1], vertices[2]];
        }
        else {
            v2 = [vertices[i + 3], vertices[i + 4], vertices[i + 5]];
        }

        if (v1[1] <= P[1]) {
            if (v2[1] > P[1]) {
                if (isLeft(v1, v2, P) > 0) wn++;
            }
        }

        else {
            if (v2[1] <= P[1]) {
                if (isLeft(v1, v2, P) < 0) wn--;
            }
        }
    }
    return wn;
}



// This is only needed to create the view matrix of the cursor that flattens the vertices then checks for inside-outside
function createViewMatrixPTU(position, target, up) {
    var c = m4.lookAt(position, target, up);
    // This is the inverse that puts the camera at the origin and moves everything else into coordinates relative to the camera
    return m4.inverse(c);
}

// function to test other functions
function check_expect(f, input, expected_out) {

    if (f(input) != expected_out) {
        return false;
    }

    return true;
};

// TODO: probably no longer needed
// Returns an arbitrary vector orthogonal to v
function orthogonalVector(v) {

    let v1 = [0, v[2], -v[1], 0];
    let v2 = [-v[2], 0, v[0], 0];
    let v3 = [-v[1], v[0], 0, 0];

    //There are very small optimizations for this, but this is more readable and shouldn't matter too much in performance
    let v1_m = vec3.length(v1);
    let v2_m = vec3.length(v2);
    let v3_m = vec3.length(v3);

    if (v1_m >= v2_m && v1_m >= v3_m) return v1;
    if (v2_m >= v1_m && v2_m >= v3_m) return v2;
    if (v3_m >= v1_m && v3_m >= v2_m) return v3;

}