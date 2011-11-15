importScripts('/poc/weather/javascripts/geometry/scale.js');
importScripts('/poc/weather/javascripts/geometry/hull.js');

(function () {

    var root = this,
        Dnst = (root.Dnst = {});

    // Mesh parameters
    var N = Scl.N, M = Scl.M, L = Scl.L;


    // Length parameters
    var R = 7000000;
    var da = 2 * Math.PI / N / 2;
    var dl = 2 * Math.PI * R / N / 2;

    // Height parameters
    var Height = 30000;
    var dh = Height / L / 2;

    function positive(val, h) {
        return val > 0.1 * Math.exp(- h / 10000) ? val : 0.1 * Math.exp(- h / 10000);
    }

    H.$.scalar('dnst', function (h, lng, lat) {
        return 1 * Math.exp(- h / 10000) * (1 - 0.05 * Math.cos(6 * lat + h / 10000 * Math.PI / 2));
    })();
    var dnst = H.dnst;
    Dnst.dnst = H.dnst;
    Dnst.bottom = function (lng, lat) {
        return Dnst.dnst(0, lng, lat);
    };

    Dnst.init = function () {
        Dnst.M = H.$.total(dnst);
    }

    Dnst.evolve = function (delta, wind) {
        delete Dnst.bottom;
        delete Dnst.verticle;

        H.$.scalar('dnstnew', function (h, lng, lat) {
            var density = dnst(h, lng, lat),
                dleft   = dnst(h, lng - da, lat),
                dright  = dnst(h, lng + da, lat),
                dbefore = dnst(h, lng, lat - da),
                dafter  = dnst(h, lng, lat + da),
                dtop    = dnst(h + dh, lng, lat),
                dbottom = dnst(h - dh, lng, lat),
                wleft   = wind(h, lng - da, lat),
                wright  = wind(h, lng + da, lat),
                wbefore = wind(h, lng, lat - da),
                wafter  = wind(h, lng, lat + da),
                wtop    = wind(h + dh, lng, lat),
                wbottom = wind(h - dh, lng, lat);

            var ddx = (dleft * wleft.x - dright * wright.x) * H.$.dA_lng() / H.$.dV(lat)  * delta.dt,
                ddy = (dbefore * wbefore.y * H.$.dA_lat(lat - da) - dafter * wafter.y * H.$.dA_lat(lat + da)) / H.$.dV(lat)  * delta.dt,
                ddz = (dbottom * wbottom.z - dtop * wtop.z) * H.$.dA_h(lat) / H.$.dV(lat)  * delta.dt;

            return positive(density + ddx + ddy + ddz, h);
        })();

        dnst = null;
    };

    Dnst.step = function () {
        delete Dnst.dnst;

        H.$.scalar('dnst', H.dnstnew)();
        dnst = H.dnst;
        Dnst.dnst = H.dnst;

        Dnst.bottom = function (lng, lat) {
            return Dnst.dnst(11, lng, lat);
        };
    };

    Dnst.fix = function (wind) {
        var factor = H.$.total(dnst) / Dnst.M;

        H.$.scalar('dnstnew', function (h, lng, lat) {
            return dnst(h, lng, lat) / factor;
        })();
        H.$.scalar('dnst', H.dnstnew)();
        dnst = H.dnst;
        Dnst.dnst = H.dnst;

        var timeScale = H.$.min(function (h, lng, lat) {
            var density = dnst(h, lng, lat),
                dleft   = dnst(h, lng - da, lat),
                dright  = dnst(h, lng + da, lat),
                dbefore = dnst(h, lng, lat - da),
                dafter  = dnst(h, lng, lat + da),
                dtop    = dnst(h + dh, lng, lat),
                dbottom = dnst(h - dh, lng, lat),
                wleft   = wind(h, lng - da, lat),
                wright  = wind(h, lng + da, lat),
                wbefore = wind(h, lng, lat - da),
                wafter  = wind(h, lng, lat + da),
                wtop    = wind(h + dh, lng, lat),
                wbottom = wind(h - dh, lng, lat);

            var limit = - density * H.$.dV(lat) / (
                     (dleft * wleft.x - dright * wright.x) * H.$.dA_lng() +
                     (dbefore * wbefore.y * H.$.dA_lat(lat - da) - dafter * wafter.y * H.$.dA_lat(lat + da)) +
                     (dbottom * wbottom.z - dtop * wtop.z) * H.$.dA_h(lat)
            );
            limit = limit > 0 ? limit : 50;
            return limit;
        });

        return timeScale;
    };

})();
