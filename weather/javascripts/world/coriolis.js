importScripts('/poc/weather/javascripts/geometry/vector3.js');
importScripts('/poc/weather/javascripts/geometry/sphere.js');

(function () {

    var root = this,
        Crl = (root.Crl = {});

    var omiga = 2 * Math.PI / 3600 / 30;

    Crl.crl = function (lng, lat, vec) {
        return V3.expand(V3.build(
            vec.y * Math.sin(lat) - vec.z * Math.cos(lat),
            - vec.x * Math.sin(lat),
            vec.x * Math.cos(lat)
        ), 2 * omiga);
    };

})();
