importScripts('/poc/weather/javascripts/geometry/vector3.js');

(function () {

    var root = this,
        O = (root.O = {});

    //Geometry
    var r1, r2, alpha;

    //Mass
    var m1 = 1.29;
    var m2 = 0.93;
    var m3 = 0.00000000001;

    //Luminosity
    var L1 = 2.5;
    var L2 = 0.79;
    var l, l1, l2;

    //Initial position
    var x0 = 0,      y0 = 0;
    var x1 = +0.419, y1 = 0;
    var x2 = -0.581, y2 = 0;
    var x3 = 0,      y3 = 2.07;
    O.init = {
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        x3: x3,
        y3: y3
    };

    //Initial velocity
    var vx1 = 0, vy1 = +0.558;
    var vx2 = 0, vy2 = -0.774;
    var vx3 = 1.0, vy3 = 0;

    //Initial direction unit vector
    var u31x, u31y, u31z = 0;
    var u32x, u32y, u32z = 0;

    //evolve
    function evolve(progress, delta) {
        progress("calculating orbit...");
        var r12 = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        var r13 = Math.sqrt((x1 - x3) * (x1 - x3) + (y1 - y3) * (y1 - y3));
        var r23 = Math.sqrt((x2 - x3) * (x2 - x3) + (y2 - y3) * (y2 - y3));
        var r21 = r12;

        var a12 = m1 / r12 / r12;
        var a12x = a12 * (x1 - x2) / r12;
        var a12y = a12 * (y1 - y2) / r12;

        var a13 = m1 / r13 / r13;
        u31x = (x3 - x1) / r13;
        u31y = (y3 - y1) / r13;
        var a13x = - a13 * u31x;
        var a13y = - a13 * u31y;

        var a21 = m2 / r21 / r21;
        var a21x = a21 * (x2 - x1) / r21;
        var a21y = a21 * (y2 - y1) / r21;

        var a23 = m2 / r23 / r23;
        u32x = (x3 - x2) / r23;
        u32y = (y3 - y2) / r23;
        var a23x = - a23 * u32x;
        var a23y = - a23 * u32y;

        x1 = x1 + vx1 * delta.tao;
        y1 = y1 + vy1 * delta.tao;

        x2 = x2 + vx2 * delta.tao;
        y2 = y2 + vy2 * delta.tao;

        x3 = x3 + vx3 * delta.tao;
        y3 = y3 + vy3 * delta.tao;

        vx1 = vx1 + a21x * delta.tao;
        vy1 = vy1 + a21y * delta.tao;

        vx2 = vx2 + a12x * delta.tao;
        vy2 = vy2 + a12y * delta.tao;

        vx3 = vx3 + (a13x + a23x) * delta.tao;
        vy3 = vy3 + (a13y + a23y) * delta.tao;

        r1 = r13;
        r2 = r23;
        l1  = L1 / r1 / r1;
        l2  = L2 / r2 / r2;
        l  = l1 + l2;
    }

    O.evolve = function (progress, delta) {
        evolve(progress, delta);
        return {
            p1: V3.build(x1, y1, 0),
            p2: V3.build(x2, y2, 0),
            p3: V3.build(x3, y3, 0),
            v1: V3.build(vx1, vy1, 0),
            v2: V3.build(vx2, vy2, 0),
            v3: V3.build(vx3, vy3, 0),
            u31: V3.build(u31x, u31y, 0),
            u32: V3.build(u32x, u32y, 0),
            r1: r1,
            r2: r2,
            l1: l1,
            l2: l2,
            l: l
        };
    };

})();

