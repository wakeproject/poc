importScripts('/poc/weather/javascripts/geometry/sphere.js');
importScripts('/poc/weather/javascripts/world/atmosphere/density.js');
importScripts('/poc/weather/javascripts/world/atmosphere/wind.js');
importScripts('/poc/weather/javascripts/world/atmosphere/pressure.js');
importScripts('/poc/weather/javascripts/world/atmosphere/temperature.js');
importScripts('/poc/weather/javascripts/world/atmosphere/energy.js');
importScripts('/poc/weather/javascripts/world/atmosphere/radiation.js');
importScripts('/poc/weather/javascripts/world/land/temperature.js');
importScripts('/poc/weather/javascripts/world/land/radiation.js');

(function () {

    var root = this,
        W = (root.W = {});

    W.init = function (progress) {
        progress("initializing density...");
        Dnst.init();
        progress("initializing energy...");
        Enrg.init(Dnst.dnst, AtmTmp.atmtmp);
        progress("initializing done...");
    };

    W.evolve = function (progress, delta, input) {
        progress("calculating energy...");
        Enrg.evolve(delta, Dnst.dnst, Wnd.wnd, AtmTmp.atmtmp, Prs.prs, LRad.lrad, ARad.arad);
        progress("calculating air temperature...");
        AtmTmp.evolve(delta, Dnst.dnst, Wnd.wnd, AtmTmp.atmtmp, Enrg.heat);
        progress("making ennergy grid...");
        Enrg.step();

        progress("calculating density...");
        Dnst.evolve(delta, Wnd.wnd);
        progress("calculating pressure...");
        Prs.evolve(delta, Dnst.dnst, AtmTmp.atmtmp);
        progress("calculating wind...");
        Wnd.evolve(delta, Dnst.dnst, Prs.prs);
        progress("making wind grid...");
        Wnd.step();
        progress("making dentisty grid...");
        Dnst.step();
        progress("making pressure grid...");
        Prs.step();

        progress("calculating land temperature...");
        LndTmp.evolve(delta, input, ARad.arad);
        progress("calculating land radiation...");
        LRad.evolve(delta, LndTmp.lndtmp);

        progress("making land radiation grid...");
        LRad.step();
        progress("making land temperature grid...");
        LndTmp.step();

        progress("calculating air radiation...");
        ARad.evolve(delta, AtmTmp.atmtmp);
        progress("making air radiation grid...");
        ARad.step();

        progress("making air temperature grid...");
        AtmTmp.step();

        progress("fix energy...");
        Enrg.fix(progress, delta, Dnst.dnst, AtmTmp.atmtmp, LndTmp.lndtmp, ARad.arad, Wnd, AtmTmp);

        progress("fix density...");
        var time = Dnst.fix(Wnd.wnd);

        progress("calculating scale...");
        return  {
            wind: 200 / Wnd.max(),
            density: time / 5
        };
    };

    W.map = function (delta, input) {
        return S.$.pack(input.light, input.light1, input.light2,
            LndTmp.lndtmp, AtmTmp.bottom,
            Prs.bottom, Wnd.wdx, Wnd.wdy, Wnd.wdz,
            Dnst.bottom
        );
    };

    W.verticle = function () {
        return H.$.verticle(- Math.PI, Dnst.dnst, AtmTmp.atmtmp, Prs.prs);
    };

})();
