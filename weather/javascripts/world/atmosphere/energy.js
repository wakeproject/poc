importScripts('/poc/weather/javascripts/geometry/scale.js');
importScripts('/poc/weather/javascripts/geometry/hull.js');
importScripts('/poc/weather/javascripts/physics/constants.js');
importScripts('/poc/weather/javascripts/world/atmosphere/atmosphere.js');

(function () {

    var root = this,
        Enrg = (root.Enrg = {});

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

    H.$.scalar('heat', H.$.everywhere(0))();
    var heat = H.heat;
    Enrg.heat = heat;

    H.$.scalar('kinetic', H.$.everywhere(0))();
    var kinetic = H.kinetic;

    H.$.scalar('kineticold', H.$.everywhere(0))();
    var kineticold = H.kineticold;

    function recalculate(density, temperature) {
        Enrg.U = H.$.total(function (h, lng, lat) {
            return density(h, lng, lat) * h;
        });
        Enrg.K = H.$.total(kinetic);
        Enrg.H = H.$.total(function (h, lng, lat) {
            return 718 * density(h, lng, lat) * temperature(h, lng, lat);
        });
        Enrg.total = Enrg.U + Enrg.K + Enrg.H;
    }

    Enrg.init = function (density, temperature) {
        recalculate(density, temperature);
    };

    Enrg.evolve = function (delta, density, wnd, temperature, pressure, radiationL, radiationA, temperature) {
        H.$.scalar('heatnew', function (h, lng, lat) {
            var wind    = wnd(h, lng, lat),
                m       = density(h, lng, lat) * H.$.dV(lat),
                G       = V3.build(0, 0, - m * g),
                k1      = kinetic(h, lng, lat) * H.$.dV(lat),
                k2      = kineticold(h, lng, lat) * H.$.dV(lat),
                pleft   = pressure(h, lng - da, lat),
                pright  = pressure(h, lng + da, lat),
                pbefore = pressure(h, lng, lat - da),
                pafter  = pressure(h, lng, lat + da),
                ptop    = pressure(h + dh, lng, lat),
                pbottom = pressure(h - dh, lng, lat),
                r       = radiationL(h, lng, lat) * H.$.dA_h(lat) * delta.dt;
                ri      = radiationA(h - dh, lng, lat) * H.$.dA_h(lat) * delta.dt;
                ro      = radiationA(h + dh, lng, lat) * H.$.dA_h(lat) * delta.dt;

            // resistance
            var dxy = wnd(h, lng + da, lat).y - wnd(h, lng - da, lat).y,
                dxz = wnd(h, lng + da, lat).z - wnd(h, lng - da, lat).z,
                dyx = wnd(h, lng, lat + da).x - wnd(h, lng, lat - da).x,
                dyz = wnd(h, lng, lat + da).z - wnd(h, lng, lat - da).z,
                dzx = wnd(h + dh, lng, lat).x - wnd(h - dh, lng, lat).x,
                dzy = wnd(h + dh, lng, lat).y - wnd(h - dh, lng, lat).y;

            var rx = 0.0000187 * (dyx * H.$.dA_lat(lat) + dzx * H.$.dA_h(lat)),
                ry = 0.0000187 * (dxy * H.$.dA_lng() + dzy * H.$.dA_h(lat)),
                rz = 0.0000187 * (dxz * H.$.dA_lng() + dyz * H.$.dA_lat(lat));

            var A1 = wind.x * ((pleft - pright) * H.$.dA_lng()  + rx) * delta.dt
                     wind.y * ((pbefore * H.$.dA_lat(lat - da) - pafter * H.$.dA_lat(lat + da)) + ry) * delta.dt +
                     wind.z * ((pbottom - ptop) * H.$.dA_h(lat) + rz) * delta.dt;

            var A2 = V3.inner(G, wind) * delta.dt;

            return r + ri - ro + A1 + A2 + (k1 - k2);
        })();

        heat = null;
        kineticold = null;

        H.$.scalar('kineticnew', function (h, lng, lat) {
            var wind    = wnd(h, lng, lat),
                m       = density(h, lng, lat),
                k       = V3.inner(wind, wind) * m / 2;
            return k;
        })();
    };

    Enrg.step = function () {
        H.$.scalar('heat', H.heatnew)();
        delete Enrg.heat;
        Enrg.heat = H.heat;
        heat = H.heat;

        H.$.scalar('kineticold', kinetic)();
        kineticold = H.kineticold;

        H.$.scalar('kinetic', H.kineticnew)();
        delete kinetic;
        kinetic = H.kinetic;
    };

    Enrg.fix = function (prgs, delta, density, atmtmp, lndtmp, radiationA, Wnd, AtmTmp) {
        var input = S.$.total(function(lng, lat) {
            var lt  = lndtmp(lng, lat),
                r   = lt * lt * lt * lt * C.StefanBoltzmann;
            return r;
        });
        var output = S.$.total(function(lng, lat) {
            return radiationA(Height, lng, lat);
        });

        var total = Enrg.total + (input - output) * delta.dt;
        //var ratio = Math.abs(input - output) / total * delta.dt;
        //throw ratio + ":" + total + ":" + input + ":" + output;
        recalculate(density, atmtmp);
        var factor = Math.abs(total / Enrg.total);
        if (factor > 1.01 || factor < 1 / 1.01) {//fix system error on condition
            factor = Math.sqrt(factor);
            H.$.vector('wndnew', function (h, lng, lat) {
                return V3.expand(Wnd.wnd(h, lng, lat), factor);
            })();
            H.$.vector('wnd', H.wndnew)();
            delete Wnd.wnd;
            Wnd.wnd = H.wnd;
        }
    }

})();
