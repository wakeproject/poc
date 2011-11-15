importScripts('/poc/weather/javascripts/geometry/hull.js');

(function () {

    var root = this,
        Prs = (root.Prs = {});

    var R = 293;

    H.$.scalar('prs', function (h, lng, lat) {
        return 293 * Math.exp(- h / 10000) * (1 - 0.05 * Math.cos(6 * lat + h / 10000 * Math.PI / 2))
                   * (278.15 - 0.006 * h - 80 * (1 - Math.cos(lat)) + 10 * Math.cos(lng));
    })();
    Prs.prs = H.prs;
    Prs.bottom = function (lng, lat) {
        return Prs.prs(0, lng, lat);
    };

    Prs.evolve = function (delta, density, temperature) {
        delete Prs.bottom;

        H.$.scalar('prsnew', function (h, lng, lat) {
            return R * density(h, lng, lat) * temperature(h, lng, lat);
        })();
    };

    Prs.step = function () {
        H.$.scalar('prs', H.prsnew)();
        delete Prs.prs;
        Prs.prs = H.prs;

        Prs.bottom = function (lng, lat) {
            return Prs.prs(0, lng, lat);
        };
    };

})();
