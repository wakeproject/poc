importScripts('/poc/orbits/javascripts/geometry/vector3.js');

(function () {

    var root = this,
        P = (root.P = {});

    P.R = 7000000;

    // Polar unit vector
    var ax = 0.423, ay = 0, az = 0.906; // fixed vector
    var polar = V3.build(ax, ay, az);
    P.polar = polar;

    // Base unit vector for long = 0, lat = 0
    var bx = 0,  by = 1, bz = 0; // change over lday
    var base = V3.build(bx, by, bz);
    function equiZero(lday) {// lday: local time
        var phi = - 2 * Math.PI * (lday - Math.floor(lday));
        var cos = Math.cos(phi),
            sin = Math.sin(phi);
        //by Rodrigues' rotation formula
        return V3.add(V3.expand(base, cos), V3.expand(V3.cross(polar, base), sin));
    }
    P.equiZero = equiZero;

    // The normal unit vector for any point on the surface
    function vector(lng, lat, lday) {
        var equo = equiZero(lday);
        var cos = Math.cos(lng),
            sin = Math.sin(lng);
        var temp = V3.add(V3.expand(equo, cos), V3.expand(V3.cross(polar, equo), sin));

        var axis = V3.cross(polar, temp);
        cos = Math.cos(lat);
        sin = Math.sin(lat);
        var vec = V3.add(V3.expand(temp, cos), V3.expand(V3.cross(axis, temp), sin));
        return vec;
    }
    P.norm = vector;

    function cut(val) {
        return val > 0 ? val : 0;
    }

    P.evolve = function (progress, delta, orbit) {
        progress("calculating day and night on planet...");
        return {
            light1: function (lng, lat) {
                return orbit.l1 * cut(V3.inner(vector(lng, lat, delta.lday), orbit.u31));
            },
            light2: function (lng, lat) {
                return orbit.l2 * cut(V3.inner(vector(lng, lat, delta.lday), orbit.u32));
            },
            light: function (lng, lat) {
                return orbit.l1 * cut(V3.inner(vector(lng, lat, delta.lday), orbit.u31))
                     + orbit.l2 * cut(V3.inner(vector(lng, lat, delta.lday), orbit.u32));
            }
        };
    };

})();
