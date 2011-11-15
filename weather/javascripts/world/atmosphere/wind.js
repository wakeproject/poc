importScripts('/poc/weather/javascripts/geometry/scale.js');
importScripts('/poc/weather/javascripts/geometry/vector3.js');
importScripts('/poc/weather/javascripts/geometry/hull.js');
importScripts('/poc/weather/javascripts/world/coriolis.js');

(function () {

    var root = this,
        Wnd = (root.Wnd = {});

    // Mesh parameters
    var N = Scl.N, M = Scl.M, L = Scl.L;


    // Length parameters
    var R = 7000000;
    var da = 2 * Math.PI / N / 2;
    var dl = 2 * Math.PI * R / N / 2;

    // Height parameters
    var Height = 30000;
    var dh = Height / L / 2;

    // Gravity
    var g = 10;

    H.$.vector('wnd', function (h, lng, lat) {
        var w = V3.build(
            2.5 * (Math.sin(6 * lat + h / 10000 * Math.PI / 2) - 1),
            0,
            0
        );
        return V3.add(w, V3.random(1));
    })();
    var wnd = H.wnd;
    Wnd.wnd = wnd;
    Wnd.wdx = function (lng, lat) {
        return Wnd.wnd(100, lng, lat).x;
    };
    Wnd.wdy = function (lng, lat) {
        return Wnd.wnd(100, lng, lat).y;
    };
    Wnd.wdz = function (lng, lat) {
        return Wnd.wnd(1000, lng, lat).z;
    };

    Wnd.evolve = function (delta, density, pressure) {
        delete Wnd.wdx;
        delete Wnd.wdy;
        delete Wnd.wdz;

        H.$.vector('wndnew', function (h, lng, lat) {
            var wind    = wnd(h, lng, lat),
                m       = density(h, lng, lat) * H.$.dV(lat),
                pleft   = pressure(h, lng - da, lat),
                pright  = pressure(h, lng + da, lat),
                pbefore = pressure(h, lng, lat - da),
                pafter  = pressure(h, lng, lat + da),
                pbottom = pressure(h - dh, lng, lat),
                ptop    = pressure(h + dh, lng, lat);

            // resistance
            var dxy = wnd(h, lng + da, lat).y - wnd(h, lng - da, lat).y,
                dxz = wnd(h, lng + da, lat).z - wnd(h, lng - da, lat).z,
                dyx = wnd(h, lng, lat + da).x - wnd(h, lng, lat - da).x,
                dyz = wnd(h, lng, lat + da).z - wnd(h, lng, lat - da).z,
                dzx = wnd(h + dh, lng, lat).x - wnd(h - dh, lng, lat).x,
                dzy = wnd(h + dh, lng, lat).y - wnd(h - dh, lng, lat).y;

            var rx = 0.0000187 * (dyx * H.$.dA_lat(lat) + dzx * H.$.dA_h(lat)) / m,
                ry = 0.0000187 * (dxy * H.$.dA_lng() + dzy * H.$.dA_h(lat)) / m,
                rz = 0.0000187 * (dxz * H.$.dA_lng() + dyz * H.$.dA_lat(lat)) / m;

            var crl = Crl.crl(lng, lat, wind);

            var x = wind.x + crl.x * delta.dt + (pleft - pright) * H.$.dA_lng() / m * delta.dt - rx * delta.dt;
            var y = wind.y + crl.y * delta.dt + (pbefore * H.$.dA_lat(lat - da) - pafter * H.$.dA_lat(lat + da)) / m * delta.dt  - ry * delta.dt;
            var z = wind.z + crl.z * delta.dt + (pbottom - ptop) * H.$.dA_h(lat) / m * delta.dt - g * delta.dt - rz * delta.dt;

            return V3.build(
                x, y,
                ((h > 1 && h < Height - 1) ? z : 0)
            );
        })();
        wnd = null;
    };

    Wnd.step = function () {
        H.$.vector('wnd', H.wndnew)();
        wnd = H.wnd;
        delete Wnd.wnd;
        Wnd.wnd = H.wnd;
        Wnd.wdx = function (lng, lat) {
            return Wnd.wnd(100, lng, lat).x;
        };
        Wnd.wdy = function (lng, lat) {
            return Wnd.wnd(100, lng, lat).y;
        };
        Wnd.wdz = function (lng, lat) {
            return Wnd.wnd(1000, lng, lat).z;
        };
    };

    Wnd.max = function () {
        return H.$.max(function(h, lng, lat) {
            return V3.value(wnd(h, lng, lat));
        });
    };

})();
