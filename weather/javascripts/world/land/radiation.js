importScripts('/poc/weather/javascripts/geometry/scale.js');
importScripts('/poc/weather/javascripts/geometry/hull.js');
importScripts('/poc/weather/javascripts/physics/constants.js');
importScripts('/poc/weather/javascripts/world/atmosphere/atmosphere.js');

(function () {

    var root = this,
        LRad = (root.LRad = {});

    // Mesh parameters
    var N = Scl.N, M = Scl.M, L = Scl.L;


    // Height parameters
    var Height = 30000;
    var dh = Height / L / 2;

    H.$.scalar('lrad', H.$.everywhere(0))();
    var lrad = H.lrad;
    LRad.lrad = lrad;

    LRad.evolve = function (delta, lndtmp) {
        H.$.scalar('lradnew', function (h, lng, lat) {
            var lt  = lndtmp(lng, lat),
                r   = lt * lt * lt * lt * C.StefanBoltzmann;
            var k = Math.ceil(h / dh / 2);
            if (k > 0 && k <= 1) {
                return r * 0.1;
            } else {
                return 0;
            }
        })();
        lrad = null;
    };

    LRad.step = function () {
        H.$.scalar('lrad', H.lradnew)();
        lrad = H.lrad;
        delete LRad.lrad;
        LRad.lrad = lrad;
    };

})();
