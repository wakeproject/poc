importScripts('/poc/weather/javascripts/geometry/scale.js');
importScripts('/poc/weather/javascripts/geometry/sphere.js');
importScripts('/poc/weather/javascripts/physics/constants.js');
importScripts('/poc/weather/javascripts/world/continent.js');
importScripts('/poc/weather/javascripts/world/atmosphere/atmosphere.js');

(function () {

    var root = this,
        LndTmp = (root.LndTmp = {});

    // Mesh parameters
    var N = Scl.N, M = Scl.M;

    S.$.scalar('lndtmp', function (lng, lat) {
        return 273.15 - 60 * (1 - Math.cos(lat)) + 7 * Math.cos(lng);
    })();
    var lndtmp = S.lndtmp;
    LndTmp.lndtmp = lndtmp;

    LndTmp.evolve = function (delta, input, absb) {
        var k = delta.dt / 4200000;
        var ak = C.SunConst * k;
        var lk = C.StefanBoltzmann * k;

        S.$.scalar('lndtmpnew', function(lng, lat) {
            var add = input.light(lng, lat) * ak, // * (1 - Atm.reflectionRatio)
                lt = lndtmp(lng, lat),
                loss = lt * lt * lt * lt * lk;

            var abs = absb(0, lng, lat) / H.$.dA_h(lat) * delta.dt / 4200000;
            add += abs;

            if (Ctn.isContinent(lng, lat)) {// continent
                add = add * 5; // heat capacity of rock;
                loss = loss * 5;
                if (lt < 273.15 && lt > 272.15) {
                    add = add * 0.1; // melt of ice;
                    loss = loss * 0.1; // freeze of ice
                } else if (lt < 272.15) {
                    add = add * 0.1; // relection by ice;
                }
            } else {// sea
                if (lt < 273.15 && lt > 272.15) {
                    add = add * 0.1; // melt of ice;
                    loss = loss * 0.1; // freeze of ice
                } else if (lt < 272.15) {
                    add = add * 0.1 * 2; // relection by ice; and heat capacity;
                    loss = loss * 2; // heat capacity
                }
            }

            return lt + add - loss;
        })();
        lndtmp = null;
    };

    LndTmp.step = function () {
        S.$.scalar('lndtmp', S.lndtmpnew)();
        lndtmp = S.lndtmp;
        delete LndTmp.lndtmp;
        LndTmp.lndtmp = lndtmp;
    };

})();