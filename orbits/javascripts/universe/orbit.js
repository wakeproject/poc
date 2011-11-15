importScripts('/poc/orbits/javascripts/geometry/vector3.js');

(function () {

    var root = this,
        O = (root.O = {});

    //Gravity constant
    var G = 4 * Math.PI * Math.PI / (365.24 * 24 * 3600) / (365.24 * 24 * 3600);

    //Geometry
    var r1, r2, alpha;

    //Mass
    var m1 = 1.29;
    var m2 = 1.1;

    //Luminosity
    var L1 = 2.7;
    var L2 = 1.5;
    var l, l1, l2;

    //Initial position
    var x0 = 0,      y0 = 0;
    var x1 = +0.419, y1 = 0;
    var x2 = -0.838, y2 = 0;
    var x3 = 0,      y3 = 3;

    //Initial velocity
    var v = Math.sqrt(G * (m1 + m2) / (x1 - x2)),
        v1 = m2 / (m1 + m2) * v,
        v2 = - m1 / (m1 + m2) * v;
    var vx1 = 0, vy1 = v1;
    var vx2 = 0, vy2 = v2;
    var vx3 = Math.sqrt(G * (m1 + m2) / y3), vy3 = 0;

    //Initial direction unit vector
    var u31x, u31y, u31z = 0;
    var u32x, u32y, u32z = 0;

    var K = (m1 * vy1 * vy1 + m2 * vy2 * vy2) / 2;
    var H = G * m1 * m2 / (x1 - x2);
    var E = H + K;
    var E0 = E;

    function transform(x1, y1, vx1, vy1, x2, y2, vx2, vy2, x3, y3, vx3, vy3) {
        var r12 = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        var r13 = Math.sqrt((x1 - x3) * (x1 - x3) + (y1 - y3) * (y1 - y3));
        var r23 = Math.sqrt((x2 - x3) * (x2 - x3) + (y2 - y3) * (y2 - y3));
        var r21 = r12;

        var a12 = G * m1 / r12 / r12;
        var a12x = a12 * (x1 - x2) / r12;
        var a12y = a12 * (y1 - y2) / r12;

        var a13 = G * m1 / r13 / r13;
        u31x = (x3 - x1) / r13;
        u31y = (y3 - y1) / r13;
        var a13x = - a13 * u31x;
        var a13y = - a13 * u31y;

        var a21 = G * m2 / r21 / r21;
        var a21x = a21 * (x2 - x1) / r21;
        var a21y = a21 * (y2 - y1) / r21;

        var a23 = G * m2 / r23 / r23;
        u32x = (x3 - x2) / r23;
        u32y = (y3 - y2) / r23;
        var a23x = - a23 * u32x;
        var a23y = - a23 * u32y;

        return {
            x1: vx1,
            y1: vy1,
            vx1: a21x,
            vy1: a21y,
            x2: vx2,
            y2: vy2,
            vx2: a12x,
            vy2: a12y,
            x3: vx3,
            y3: vy3,
            vx3: (a13x + a23x),
            vy3: (a13y + a23y)
        };
    }

    //evolve
    function evolve(progress, delta) {
        progress("calculating orbit...");

        var change;
        var k1x1, k1y1, k1vx1, k1vy1;
        var k1x2, k1y2, k1vx2, k1vy2;
        var k1x3, k1y3, k1vx3, k1vy3;

        change = transform(x1, y1, vx1, vy1, x2, y2, vx2, vy2, x3, y3, vx3, vy3);

        k1x1 = change.x1 * delta.dt;
        k1y1 = change.y1 * delta.dt;

        k1x2 = change.x2 * delta.dt;
        k1y2 = change.y2 * delta.dt;

        k1x3 = change.x3 * delta.dt;
        k1y3 = change.y3 * delta.dt;

        k1vx1 = change.vx1 * delta.dt;
        k1vy1 = change.vy1 * delta.dt;

        k1vx2 = change.vx2 * delta.dt;
        k1vy2 = change.vy2 * delta.dt;

        k1vx3 = change.vx3 * delta.dt;
        k1vy3 = change.vy3 * delta.dt;

        var k2x1, k2y1, k2vx1, k2vy1;
        var k2x2, k2y2, k2vx2, k2vy2;
        var k2x3, k2y3, k2vx3, k2vy3;

        change = transform(
            x1 + k1x1 / 2, y1 + k1y1 / 2, vx1 + k1vx1 / 2, vy1 + k1vy1 / 2,
            x2 + k1x2 / 2, y2 + k1y2 / 2, vx2 + k1vx2 / 2, vy2 + k1vy2 / 2,
            x3 + k1x3 / 2, y3 + k1y3 / 2, vx3 + k1vx3 / 2, vy3 + k1vy3 / 2
        );

        k2x1 = change.x1 * delta.dt;
        k2y1 = change.y1 * delta.dt;

        k2x2 = change.x2 * delta.dt;
        k2y2 = change.y2 * delta.dt;

        k2x3 = change.x3 * delta.dt;
        k2y3 = change.y3 * delta.dt;

        k2vx1 = change.vx1 * delta.dt;
        k2vy1 = change.vy1 * delta.dt;

        k2vx2 = change.vx2 * delta.dt;
        k2vy2 = change.vy2 * delta.dt;

        k2vx3 = change.vx3 * delta.dt;
        k2vy3 = change.vy3 * delta.dt;

        var k3x1, k3y1, k3vx1, k3vy1;
        var k3x2, k3y2, k3vx2, k3vy2;
        var k3x3, k3y3, k3vx3, k3vy3;

        change = transform(
            x1 + k2x1 / 2, y1 + k2y1 / 2, vx1 + k2vx1 / 2, vy1 + k2vy1 / 2,
            x2 + k2x2 / 2, y2 + k2y2 / 2, vx2 + k2vx2 / 2, vy2 + k2vy2 / 2,
            x3 + k2x3 / 2, y3 + k2y3 / 2, vx3 + k2vx3 / 2, vy3 + k2vy3 / 2
        );

        k3x1 = change.x1 * delta.dt;
        k3y1 = change.y1 * delta.dt;

        k3x2 = change.x2 * delta.dt;
        k3y2 = change.y2 * delta.dt;

        k3x3 = change.x3 * delta.dt;
        k3y3 = change.y3 * delta.dt;

        k3vx1 = change.vx1 * delta.dt;
        k3vy1 = change.vy1 * delta.dt;

        k3vx2 = change.vx2 * delta.dt;
        k3vy2 = change.vy2 * delta.dt;

        k3vx3 = change.vx3 * delta.dt;
        k3vy3 = change.vy3 * delta.dt;

        var k4x1, k4y1, k4vx1, k4vy1;
        var k4x2, k4y2, k4vx2, k4vy2;
        var k4x3, k4y3, k4vx3, k4vy3;

        change = transform(
            x1 + k3x1, y1 + k3y1, vx1 + k3vx1, vy1 + k3vy1,
            x2 + k3x2, y2 + k3y2, vx2 + k3vx2, vy2 + k3vy2,
            x3 + k3x3, y3 + k3y3, vx3 + k3vx3, vy3 + k3vy3
        );

        k4x1 = change.x1 * delta.dt;
        k4y1 = change.y1 * delta.dt;

        k4x2 = change.x2 * delta.dt;
        k4y2 = change.y2 * delta.dt;

        k4x3 = change.x3 * delta.dt;
        k4y3 = change.y3 * delta.dt;

        k4vx1 = change.vx1 * delta.dt;
        k4vy1 = change.vy1 * delta.dt;

        k4vx2 = change.vx2 * delta.dt;
        k4vy2 = change.vy2 * delta.dt;

        k4vx3 = change.vx3 * delta.dt;
        k4vy3 = change.vy3 * delta.dt;

        x1 = x1 + (k1x1 + 2 * k2x1 + 2 * k3x1 + k4x1) / 6;
        y1 = y1 + (k1y1 + 2 * k2y1 + 2 * k3y1 + k4y1) / 6;
        vx1 = vx1 + (k1vx1 + 2 * k2vx1 + 2 * k3vx1 + k4vx1) / 6;
        vy1 = vy1 + (k1vy1 + 2 * k2vy1 + 2 * k3vy1 + k4vy1) / 6;

        x2 = x2 + (k2x2 + 2 * k2x2 + 2 * k3x2 + k4x2) / 6;
        y2 = y2 + (k2y2 + 2 * k2y2 + 2 * k3y2 + k4y2) / 6;
        vx2 = vx2 + (k2vx2 + 2 * k2vx2 + 2 * k3vx2 + k4vx2) / 6;
        vy2 = vy2 + (k2vy2 + 2 * k2vy2 + 2 * k3vy2 + k4vy2) / 6;

        x3 = x3 + (k3x3 + 2 * k2x3 + 2 * k3x3 + k4x3) / 6;
        y3 = y3 + (k3y3 + 2 * k2y3 + 2 * k3y3 + k4y3) / 6;
        vx3 = vx3 + (k3vx3 + 2 * k2vx3 + 2 * k3vx3 + k4vx3) / 6;
        vy3 = vy3 + (k3vy3 + 2 * k2vy3 + 2 * k3vy3 + k4vy3) / 6;

        var r13 = Math.sqrt((x1 - x3) * (x1 - x3) + (y1 - y3) * (y1 - y3));
        var r23 = Math.sqrt((x2 - x3) * (x2 - x3) + (y2 - y3) * (y2 - y3));

        r1 = r13;
        r2 = r23;
        l1  = L1 / r1 / r1;
        l2  = L2 / r2 / r2;
        l  = l1 + l2;

        K = 0.5 * (
                m1 * (vy1 * vy1 + vx1 * vx1)
              + m2 * (vy2 * vy2 + vx2 * vx2)
            );
        H = G * m1 * m2 / Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
        E = H + K;

        var factor1 = E0 / E,
            factor2 = Math.sqrt(factor1);
        vx1 = vx1 * factor2;
        vy1 = vy1 * factor2;
        vx2 = vx2 * factor2;
        vy2 = vy2 * factor2;
        x1 = x1 / factor1;
        y1 = y1 / factor1;
        x2 = x2 / factor1;
        y2 = y2 / factor1;

        var errx = (m1 * x1 + m2 * x2) / (m1 + m2);
        var erry = (m1 * y1 + m2 * y2) / (m1 + m2);
        x1 = x1 - errx * (m1 + m2) / m1 / 2;
        y1 = y1 - erry * (m1 + m2) / m1 / 2;
        x2 = x2 - errx * (m1 + m2) / m2 / 2;
        y2 = y2 - erry * (m1 + m2) / m2 / 2;
/*
        var d = Math.sqrt(x1 * x1 + y1 * y1);
        var c = x1 / d, s = y1 / d;
        var nx1 = d,
            ny1 = 0,
            nx2 = x2 * c - y2 * s,
            ny2 = x2 * s + y2 * c,
            nx3 = x3 * c - y3 * s,
            ny3 = x3 * s + y3 * c,
            nvx1 = vx1 * c - vy1 * s,
            nvy1 = vx1 * s + vy1 * c,
            nvx2 = vx2 * c - vy2 * s,
            nvy2 = vx2 * s + vy2 * c,
            nvx3 = vx3 * c - vy3 * s,
            nvy3 = vx3 * s + vy3 * c;

        x1 = nx1;
        y1 = ny1;
        vx1 = nvx1;
        vy1 = nvy1;
        x2 = nx2;
        y2 = ny2;
        vx2 = nvx2;
        vy2 = nvy2;
        x3 = nx3;
        y3 = ny3;
        vx3 = nvx3;
        vy3 = nvy3;
*/
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
            l: l,
            E: E
        };
    };

})();

