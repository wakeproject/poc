importScripts('/poc/orbits/javascripts/geometry/scale.js');
importScripts('/poc/orbits/javascripts/geometry/vector3.js');

(function () {

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this,
        S = (root.S = {}),
        $ = (S.$ = {});

    // Mesh parameters
    var N = Scl.N, M = Scl.M;

    // initialize Mesh
    var STORE2 = [];
    for (var i = 0; i < N; i++) {
        var measures = [];
        for (var j = 0; j <= M; j++) {
            measures.push({});
        }
        STORE2.push(measures);
    }

    function stepdown(src, target) {
        for (var i = 0; i < N; i++) {
            for (var j = 0; j <= M; j++) {
                STORE2[i][j][target] = STORE2[i][j][src];
            }
        }
    }

    function specialize(combine, transform, name, f) {
        var fun = function () {
            var i, j, lng, lat;
            var args = Array.prototype.slice.call(arguments);
            for (j = 0; j <= M; j++) {
                lat = Math.PI / 2 - Math.PI / M * j;
                if (j !== 0 && j !== M) {
                    for (i = 0; i < N; i++) {
                        lng = - Math.PI + 2 * Math.PI / N * i;
                        args.unshift(lat);
                        args.unshift(lng);
                        STORE2[i][j][name] = f.apply(this, args);
                        args.shift();
                        args.shift();
                    }
                } else {
                    var val;
                    val = undefined;
                    for (i = 0; i < N; i++) {
                        lng = - Math.PI + 2 * Math.PI / N * i;
                        args.unshift(lat);
                        args.unshift(lng);
                        val = combine(val, f.apply(this, args), lng, i, 1 / N);
                        args.shift();
                        args.shift();
                    }
                    for (i = 0; i < N; i++) {
                        lng = - Math.PI + 2 * Math.PI / N * i;
                        STORE2[i][j][name] = transform(val, lng, i, N);
                    }
                }
            }
        };
        fun.name = name;
        fun.f = f;
        return fun;
    }

    function clear(name) {
        for (var i = 0; i < N; i++) {
            for (var j = 0; j <= M; j++) {
                delete STORE2[i][j][name];
            }
        }
    }

    function avg(lbn, rbn, lan, ran, ratioLng, ratioLat) {
        return (ratioLng * rbn + (1 - ratioLng) * lbn) * (1 - ratioLat) +
               (ratioLng * ran + (1 - ratioLng) * lan) * ratioLat;
    }

    function circle(rng, lmt) {
        if (rng < 0) return lmt + rng;
        if (rng >= lmt) return lmt - rng;
        return rng;
    }

    function confine(rng, lmt) {
        if (rng < 0) return 0;
        if (rng >= lmt) return lmt;
        return rng;
    }

    function scombine(val, combined, lng, index, ratio) {
        val = val || 0;
        return val + ratio * combined;
    }

    function stransform(val, lng, index, N) {
        return val;
    }

    function sget(name) {
        var fun = function (lng, lat) {
            var n = (Math.PI + lng) / (2 * Math.PI) * N,
                m = M - (Math.PI / 2 + lat) / (Math.PI) * M,
                left = circle(Math.floor(n), N),
                right = circle(left + 1, N),
                before = confine(Math.floor(m), M),
                after = confine(before + 1, M),
                ratioLng = n - left,
                ratioLat = m - before;

            if (ratioLng < 0) ratioLng =  - ratioLng;
            if (m < 0 || m > M) ratioLat = 0;

            var lbn = STORE2[left][before][name],
                rbn = STORE2[right][before][name],
                lan = STORE2[left][after][name],
                ran = STORE2[right][after][name];

            return avg(lbn, rbn, lan, ran, ratioLng, ratioLat);
        };
        fun.name = name;
        return fun;
    }

    function vcombine(val, combined, lng, index, ratio) {
        val = val || V3.zero();

        var x = val.x + ratio * (combined.x * Math.cos(lng) - combined.y * Math.sin(lng)),
            y = val.y + ratio * (combined.x * Math.sin(lng) + combined.y * Math.cos(lng)),
            z = val.z + ratio * combined.z;

        return V3.build(x, y, z);
    }

    function vtransform(val, lng, index, N) {
        val = val || V3.zero();

        var x = val.x * Math.cos(lng) + val.y * Math.sin(lng),
            y = - val.x * Math.sin(lng) + val.y * Math.cos(lng),
            z = val.z;

        return V3.build(x, y, z);
    }

    function vget(name) {
        var fun = function (lng, lat) {
            var n = (Math.PI + lng) / (2 * Math.PI) * N,
                m = M - (Math.PI / 2 + lat) / (Math.PI) * M,
                left = circle(Math.floor(n), N),
                right = circle(left + 1, N),
                before = confine(Math.floor(m), M),
                after = confine(before + 1, M),
                ratioLng = n - left,
                ratioLat = m - before;

            if (ratioLng < 0) ratioLng =  - ratioLng;
            if (ratioLat < 0) ratioLat =  - ratioLat;

            var lbn = STORE2[left][before][name],
                rbn = STORE2[right][before][name],
                lan = STORE2[left][after][name],
                ran = STORE2[right][after][name];

            return V3.build(
                avg(lbn.x, rbn.x, lan.x, ran.x, ratioLng, ratioLat),
                avg(lbn.y, rbn.y, lan.y, ran.y, ratioLng, ratioLat),
                avg(lbn.z, rbn.z, lan.z, ran.z, ratioLng, ratioLat)
            );
        };
        fun.name = name;
        return fun;
    }

    function expand(op, name, factor, field) {
        var f = function () {
            var ctx = this, args = arguments;
            return op(ctx, factor, field.f, args);
        };
        return $.scalar(name, f);
    }

    function add(op, init, name /* f1, f2, ... */) {
        var fileds = Array.prototype.slice.call(arguments);
        var o = fileds.shift(),
            i = fileds.shift(),
            n = fileds.shift();
        var f = function () {
            var self = this;
            var args = arguments;
            return fileds.map(function (field, index, array) {
                return field.f.apply(self, args);
            }).reduce(function (prev, cur, index, array) {
                return o(prev, cur);
            }, i);
        };
        return $.scalar(n, f);
    }

    $.scalar = function (name, f) {
        S[name] = sget(name);
        return specialize(scombine, stransform, name, f);
    };

    $.vector = function (name, f) {
        S[name] = vget(name);
        return specialize(vcombine, vtransform, name, f);
    };

    $.sexpand = function (name, factor, s) {
        return expand(function (ctx, factor, f, args) {
            return factor * f.apply(ctx, args);
        }, name, factor, s);
    };

    $.vexpand = function (name, factor, v) {
        return expand(function (ctx, factor, f, args) {
            return V3.expand(factor, f.apply(ctx, args));
        }, name, factor, v);
    };

    $.sadd = function (name /* s1, s2, s3, ... */) {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(0);
        args.unshift(function (prev, cur) {
            return prev + cur;
        });
        return add.apply(this, args);
    };

    $.vadd = function (name /* s1, s2, s3, ... */) {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(V3.zero());
        args.unshift(function (prev, cur) {
            return V3.add(prev, cur);
        });
        return add.apply(this, args);
    };

    $.grad = function (name, s) {
        var f = function (lng, lat /* , ... */) {
        };
        $.vector(name, f);
    };

    $.everywhere = function (c) {
        return function (lng, lat) {
            return c;
        };
    };

    $.stepdown = stepdown;
    $.clear = clear;

    $.pack = function (/* f1, f2, ... */ ) {
        var fileds = Array.prototype.slice.call(arguments),
            packs  = [];
        for (var i = 0; i < N; i++) {
            packs[i] = [];
            var lng = - Math.PI + 2 * Math.PI / N * i;
            for (var j = 0; j <= M; j++) {
                packs[i][j] = [];
                var lat = Math.PI / 2 - Math.PI / M * j;
                fileds.forEach(function (f, index, array) {
                        packs[i][j][index] = f(lng, lat);
                });
            }
        }
        return packs;
    };

    $.load = function (packs) {
    }

    S.equi = V3.build(1, 0, 0);
    S.polar = V3.build(0, 0, 1);

    S.unitR = function (lng, lat) {
        return V3.build(
            Math.cos(lat) * Math.cos(lng),
            Math.cos(lat) * Math.sin(lng),
            Math.sin(lat)
        );
    };
    S.unitLat = function (lng, lat) {
        return V3.build(
            - Math.sin(lat) * Math.cos(lng),
            - Math.sin(lat) * Math.sin(lng),
            Math.cos(lat)
        );
    };
    S.unitLng = function (lng, lat) {
        return V3.build(
            - Math.sin(lng),
            Math.sin(lng),
            0
        );
    };

    // Length parameters
    var R = 7000000;
    var da = 2 * Math.PI / N / 2;
    var dl = 2 * Math.PI * R / N / 2;

    function dA(lat) {
        if (Math.abs(Math.PI / 2 - Math.abs(lat)) < da) {
            return 2 * Math.PI * dl * dl;
        } else {
            return 2 * (Math.cos(lat - da) + Math.cos(lat + da)) * dl * dl;
        }
    }
    $.dA = dA;

    function total(f) {
        var t = 0;
        for (var i = 0; i < N; i++) {
            var lng = - Math.PI + 2 * Math.PI / N * i;
            for (var j = 1; j <= M - 1; j++) {
                var lat = Math.PI / 2 - Math.PI / M * j;
                t += (f(lng, lat) * dA(lat));
            }
        }
        t += (f(0, - Math.PI / 2) * dA(- Math.PI / 2));
        t += (f(0, Math.PI / 2) * dA(Math.PI / 2));
        return t;
    }
    $.total = total;

})();

