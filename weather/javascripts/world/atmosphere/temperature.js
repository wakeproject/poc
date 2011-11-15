importScripts('/poc/weather/javascripts/geometry/scale.js');
importScripts('/poc/weather/javascripts/geometry/hull.js');
importScripts('/poc/weather/javascripts/physics/constants.js');
importScripts('/poc/weather/javascripts/world/atmosphere/atmosphere.js');

(function () {

    var root = this,
        AtmTmp = (root.AtmTmp = {});

    // Mesh parameters
    var N = Scl.N, M = Scl.M, L = Scl.L;


    // Length parameters
    var R = 7000000;
    var da = 2 * Math.PI / N / 2;
    var dl = 2 * Math.PI * R / N / 2;

    // Height parameters
    var Height = 30000;
    var dh = Height / L / 2;

    H.$.scalar('atmtmp', function (h, lng, lat) {
        return 278.15 - 0.006 * h - 80 * (1 - Math.cos(lat)) + 10 * Math.cos(lng);
    })();
    var atmtmp = H.atmtmp;
    AtmTmp.atmtmp = atmtmp;
    AtmTmp.bottom = function (lng, lat) {
        return AtmTmp.atmtmp(0, lng, lat);
    };

    AtmTmp.evolve = function (delta, density, wnd, temperature, heat) {
        delete AtmTmp.bottom;

        H.$.scalar('atmtmpnew', function (h, lng, lat) {
            var t = atmtmp(h, lng, lat),
                m = density(h, lng, lat) * H.$.dV(lat),
                q = heat(h, lng, lat);

            var mleft   = wnd(h, lng - da, lat).x * delta.dt * H.$.dA_lng() * density(h, lng - da, lat),
                mright  = wnd(h, lng + da, lat).x * delta.dt * H.$.dA_lng() * density(h, lng + da, lat),
                mbefore = wnd(h, lng, lat - da).y * delta.dt * H.$.dA_lat(lat - da) * density(h, lng, lat - da),
                mafter  = wnd(h, lng, lat + da).y * delta.dt * H.$.dA_lat(lat + da) * density(h, lng, lat + da),
                mbottom = wnd(h - dh, lng, lat).z * delta.dt * H.$.dA_h(lat) * density(h - dh, lng, lat),
                mtop    = wnd(h + dh, lng, lat).z * delta.dt * H.$.dA_h(lat) * density(h + dh, lng, lat);

            var ileft   = mleft * temperature(h, lng - da, lat),
                iright  = mright * temperature(h, lng + da, lat),
                ibefore = mbefore * temperature(h, lng, lat - da),
                iafter  = mright * temperature(h, lng, lat + da),
                ibottom = mbottom * temperature(h - dh, lng, lat),
                itop    = mtop * temperature(h + dh, lng, lat),
                di      = 718 * (ileft - iright + ibefore - iafter + ibottom - itop);

            return (t * m * 718 + di + q) / (m + mleft - mright + mbefore - mafter + mbottom - mtop) / 718;
        })();

        atmtmp = null;
    };

    AtmTmp.step = function () {
        H.$.scalar('atmtmp', H.atmtmpnew)();
        atmtmp = H.atmtmp;
        delete AtmTmp.atmtmp;
        AtmTmp.atmtmp = atmtmp;

        AtmTmp.bottom = function (lng, lat) {
            return AtmTmp.atmtmp(11, lng, lat);
        };
    };

})();
