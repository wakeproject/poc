importScripts('/poc/weather/javascripts/geometry/scale.js');
importScripts('/poc/weather/javascripts/geometry/vector3.js');

(function () {

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this,
        H = (root.H = {}),
        $ = (H.$ = {});

    // Mesh parameters
    var N = Scl.N, M = Scl.M, L = Scl.L;


    // initialize Mesh
    var STORE3 = [];
    for (var i = 0; i < N; i++) {
        STORE3[i] = [];
        for (var j = 0; j <= M; j++) {
            STORE3[i][j] = [];
            for (var k = 0; k <= L; k++) {
                STORE3[i][j][k] = {};
            }
        }
    }

    function stepdown(src, target) {
        for (var i = 0; i < N; i++) {
            for (var j = 0; j <= M; j++) {
                for (var k = 0; k <= L; k++) {
                    STORE3[i][j][k][target] = STORE3[i][j][k][src];
                }
            }
        }
    }

    // Length parameters
    var R = 7000000;
    var da = 2 * Math.PI / N / 2;
    var dl = 2 * Math.PI * R / N / 2;

    // Height parameters
    var Height = 30000;
    var dh = Height / L / 2;

    function dA_h(lat) {
        if (Math.abs(Math.PI / 2 - Math.abs(lat)) < da) {
            return 2 * Math.PI * dl * dl;
        } else {
            return 2 * (Math.cos(lat - da) + Math.cos(lat + da)) * dl * dl;
        }
    }

    function dA_lng() {
        return 4 * dl * dh;
    }

    function dA_lat(lat) {
        if(lat < - Math.PI / 2 || lat > Math.PI / 2) return 0;
        return Math.abs(4 * Math.cos(lat) * dl * dh);
    }

    function dV(lat) {
        return 2 * dA_h(lat) * dh;
    }

    $.dV = dV;
    $.dA_h = dA_h;
    $.dA_lng = dA_lng;
    $.dA_lat = dA_lat;

    function specialize(combine, transform, sew, name, f) {
        var fun = function () {
            var i, j, k, lng, lat, height;
            var args = Array.prototype.slice.call(arguments);
            for (j = 0; j <= M; j++) {
                lat = Math.PI / 2 - Math.PI / M * j;
                if (j !== 0 && j !== M) {
                    for (i = 0; i < N; i++) {
                        lng = - Math.PI + 2 * Math.PI / N * i;
                        for (k = 0; k <= L; k++) {
                            height = 1000 * k;
                            args.unshift(lat);
                            args.unshift(lng);
                            args.unshift(height);
                            STORE3[i][j][k][name] = f.apply(this, args);
                            args.shift();
                            args.shift();
                            args.shift();
                        }
                    }

                    for (k = 0; k <= L; k++) {
                        var left = STORE3[0][j][k][name],
                            right = STORE3[N - 1][j][k][name],
                            sewed = sew(left, right);
                        STORE3[0][j][k][name] = sewed;
                        STORE3[N - 1][j][k][name] = sewed;
                    }
                } else { // combine pole point together
                    for (k = 0; k <= L; k++) {
                        height = 1000 * k;
                        var val;
                        val = undefined;
                        for (i = 0; i < N; i++) {
                            lng = - Math.PI + 2 * Math.PI / N * i;
                            args.unshift(lat);
                            args.unshift(lng);
                            args.unshift(height);
                            val = combine(val, f.apply(this, args), lng, i, 1 / N);
                            args.shift();
                            args.shift();
                            args.shift();
                        }
                        for (i = 0; i < N; i++) {
                            lng = - Math.PI + 2 * Math.PI / N * i;
                            STORE3[i][j][k][name] = transform(val, lng, i, N);
                        }
                    }
                }
            }

        };
        fun.name = name;
        fun.isGrid = true;
        fun.f = f;
        return fun;
    }

    function clear(name) {
        for (var i = 0; i < N; i++) {
            for (var j = 0; j <= M; j++) {
                for (var k = 0; k <= L; k++) {
                    delete STORE3[i][j][k][name];
                }
            }
        }
    }

    function avg(lbtn, rbtn, lbbn, rbbn, latn, ratn, labn, rabn, ratioLng, ratioLat, ratioH) {
        var t = (ratioLng * rbtn + (1 - ratioLng) * lbtn) * (1 - ratioLat) +
               (ratioLng * ratn + (1 - ratioLng) * latn) * ratioLat;
        var b = (ratioLng * rbbn + (1 - ratioLng) * lbbn) * (1 - ratioLat) +
               (ratioLng * rabn + (1 - ratioLng) * labn) * ratioLat;
        return t * ratioH + b * (1 - ratioH);
    }

    function circle(rng, lmt) {
        if (rng < 0) return lmt + rng;
        if (rng >= lmt) return rng - lmt;
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

    function ssew(left, right) {
        return (left + right) / 2;
    }

    function sget(name) {
        var fun = function (h, lng, lat) {
            var n = (Math.PI + lng) / (2 * Math.PI) * N,
                m = M - (Math.PI / 2 + lat) / (Math.PI) * M,
                l = h / 1000,
                left = circle(Math.floor(n), N),
                right = circle(left + 1, N),
                before = confine(Math.floor(m), M),
                after = confine(before + 1, M),
                bottom = confine(Math.floor(l), L),
                top = confine(bottom + 1, L),
                ratioLng = n - left,
                ratioLat = m - before,
                ratioH   = l - bottom;

            if (ratioLng < 0) ratioLng =  - ratioLng;
            if (m < 0 || m > M) ratioLat = 0;
            if (l < 0 || l > L) ratioH = 0;

            var lbtn = STORE3[left][before][top][name],
                rbtn = STORE3[right][before][top][name],
                lbbn = STORE3[left][before][bottom][name],
                rbbn = STORE3[right][before][bottom][name],
                latn = STORE3[left][after][top][name],
                ratn = STORE3[right][after][top][name],
                labn = STORE3[left][after][bottom][name],
                rabn = STORE3[right][after][bottom][name];

            return avg(lbtn, rbtn, lbbn, rbbn, latn, ratn, labn, rabn, ratioLng, ratioLat, ratioH);
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

    function vsew(left, right) {
        return V3.build(
            (left.x + right.x) / 2,
            (left.y + right.y) / 2,
            (left.z + right.z) / 2
        );
    }

    function vget(name) {
        var fun = function (h, lng, lat) {
            var n = (Math.PI + lng) / (2 * Math.PI) * N,
                m = M - (Math.PI / 2 + lat) / (Math.PI) * M,
                l = h / 1000,
                left = circle(Math.floor(n), N),
                right = circle(left + 1, N),
                before = confine(Math.floor(m), M),
                after = confine(before + 1, M),
                bottom = confine(Math.floor(l), L),
                top = confine(bottom + 1, L),
                ratioLng = n - left,
                ratioLat = m - before,
                ratioH   = l - bottom;

            if (ratioLng < 0) ratioLng =  - ratioLng;
            if (m > M || m < 0) ratioLat =  0;
            if (ratioH < 0) ratioH = 0;

            var lbtn = STORE3[left][before][top][name],
                rbtn = STORE3[right][before][top][name],
                lbbn = STORE3[left][before][bottom][name],
                rbbn = STORE3[right][before][bottom][name],
                latn = STORE3[left][after][top][name],
                ratn = STORE3[right][after][top][name],
                labn = STORE3[left][after][bottom][name],
                rabn = STORE3[right][after][bottom][name];

            return V3.build(
                   avg(lbtn.x, rbtn.x, lbbn.x, rbbn.x, latn.x, ratn.x, labn.x, rabn.x, ratioLng, ratioLat, ratioH),
                   avg(lbtn.y, rbtn.y, lbbn.y, rbbn.y, latn.y, ratn.y, labn.y, rabn.y, ratioLng, ratioLat, ratioH),
                   avg(lbtn.z, rbtn.z, lbbn.z, rbbn.z, latn.z, ratn.z, labn.z, rabn.z, ratioLng, ratioLat, ratioH)
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
            var args = Array.prototype.slice.call(arguments);
            return fileds.map(function (field, index, array) {
                return field.f.apply(self, args);
            }).reduce(function (prev, cur, index, array) {
                return o(prev, cur);
            }, i);
        };
        return $.scalar(n, f);
    }

    $.scalar = function (name, f) {
        H[name] = sget(name);
        return specialize(scombine, stransform, ssew, name, f);
    };

    $.vector = function (name, f) {
        H[name] = vget(name);
        return specialize(vcombine, vtransform, vsew, name, f);
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

    $.vrot = function (name, f) {
        return $.scalar(name, function (h, lng, lat) {
            var ba = confine(Math.PI / 2 + lat - da, Math.PI) - Math.PI / 2,
                aa = confine(Math.PI / 2 + lat + da, Math.PI) - Math.PI / 2,
                la = circle(Math.PI + lng - da, 2 * Math.PI) - Math.PI,
                ra = circle(Math.PI + lng + da, 2 * Math.PI) - Math.PI,
                left = f(h, la, lat),
                right = f(h, ra, lat),
                before = f(h, lng, ba),
                after = f(h, lng, aa);

            var rot = - left.y * dl + before.x * dl * Math.cos(ba) +
                        right.y * dl - after.x * dl * Math.cos(aa),
                ds = 2 * (Math.cos(ba) + Math.cos(aa)) * dl * dl;
            return rot / ds;
        })();
    };

    $.everywhere = function (c) {
        return function (h, lng, lat) {
            return c;
        };
    };

    $.stepdown = stepdown;
    $.clear = clear;

    function total(f) {
        var t = 0;
        for (var k = 0; k <= L; k++) {
            var height = 1000 * k;
            for (var i = 0; i < N; i++) {
                var lng = - Math.PI + 2 * Math.PI / N * i;
                for (var j = 1; j <= M - 1; j++) {
                    var lat = Math.PI / 2 - Math.PI / M * j;
                    t += (f(height, lng, lat) * dV(lat));
                }
            }
            t += (f(height, 0, - Math.PI / 2) * dV(- Math.PI / 2)); // south pole
            t += (f(height, 0, Math.PI / 2) * dV(Math.PI / 2)); // north pole
        }
        return t;
    }
    $.total = total;

    $.max = function (f) {
        var t = -Infinity;
        for (var i = 0; i < N; i++) {
            var lng = - Math.PI + 2 * Math.PI / N * i;
            for (var j = 0; j <= M; j++) {
                var lat = Math.PI / 2 - Math.PI / M * j;
                for (var k = 0; k <= L; k++) {
                    var height = 1000 * k;
                    var val = f(height, lng, lat);
                    if(t < val) t = val;
                }
            }
        }
        return t;
    };

    $.min = function (f) {
        var t = Infinity;
        for (var i = 0; i < N; i++) {
            var lng = - Math.PI + 2 * Math.PI / N * i;
            for (var j = 0; j <= M; j++) {
                var lat = Math.PI / 2 - Math.PI / M * j;
                for (var k = 0; k <= L; k++) {
                    var height = 1000 * k;
                    var val = f(height, lng, lat);
                    if(t > val) t = val;
                }
            }
        }
        return t;
    };

    $.horizontal = function (lat/*, f1, f2, ... */ ) {
        var fileds = Array.prototype.slice.call(arguments),
            packs  = [];
        fileds.shift();
        for (var i = 0; i < N; i++) {
            packs[i] = [];
            var lng = - Math.PI + 2 * Math.PI / N * i;
            for (var j = 0; j <= L; j++) {
                packs[i][j] = [];
                var h = Height / L * j;
                fileds.forEach(function (f, index, array) {
                        packs[i][j][index] = f(h, lng, lat);
                });
            }
        }
        return packs;
    };

    $.verticle = function (lng /*, f1, f2, ... */ ) {
        var fileds = Array.prototype.slice.call(arguments),
            packs  = [];
        fileds.shift();
        for (var i = 0; i <= M; i++) {
            packs[i] = [];
            var lat = Math.PI / 2 - Math.PI / M * i;
            for (var j = 0; j <= L; j++) {
                packs[i][j] = [];
                var h = Height / L * j;
                fileds.forEach(function (f, index, array) {
                        packs[i][j][index] = f(h, lng, lat);
                });
            }
        }
        return packs;
    };

})();

