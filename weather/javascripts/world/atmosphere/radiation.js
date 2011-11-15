importScripts('/poc/weather/javascripts/geometry/scale.js');
importScripts('/poc/weather/javascripts/geometry/hull.js');
importScripts('/poc/weather/javascripts/physics/constants.js');
importScripts('/poc/weather/javascripts/world/atmosphere/atmosphere.js');

(function () {

    var root = this,
        ARad = (root.ARad = {});

    // Mesh parameters
    var N = Scl.N, M = Scl.M, L = Scl.L;


    // Length parameters
    var R = 7000000;
    var da = 2 * Math.PI / N / 2;
    var dl = 2 * Math.PI * R / N / 2;

    // Height parameters
    var Height = 30000;
    var dh = Height / L / 2;

    var escp = 0.90, escaption = [];
    for (var i = 0; i <= 20 * L; i++) {
        escaption[i] = [];
        for (var j = 0; j <= L; j++) {
            var k = 0, rate = 1;
            if (i === j) {
                escaption[i][j] = 1;
            } else
            if (j - i === 1) {
                escaption[i][j] = escp;
            } else if (i - j === 1) {
                escaption[i][j] = escp;
            } else {
                escaption[i][j] = 0;
            }
        }
    }

    H.$.scalar('arad', H.$.everywhere(0))();
    var arad = H.arad;
    ARad.arad = arad;

    ARad.evolve = function (delta, atmtmp) {
        H.$.scalar('aradnew', function (h, lng, lat) {
            var k = Math.floor(h / dh / 20);
            if (k < 0) return 0;
            if (k > 20 * L) k = 20 * L;

            var q = 0;
            for (var i = 0; i <= 20 * L; i++) {
                var height = i * dh * 20,
                    at  = atmtmp(height, lng, lat);
                if (escaption[i][k] !== 0) {
                    r = at * at * at * at * C.StefanBoltzmann;
                    q = q + r * escaption[i][k];
                }
            }
            return q;
        })();
        arad = null;
    };

    ARad.step = function () {
        H.$.scalar('arad', H.aradnew)();
        arad = H.arad;
        delete ARad.arad;
        ARad.arad = arad;
    };

})();
