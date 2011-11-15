importScripts('/poc/orbits/javascripts/geometry/sphere.js');

(function () {

    var root = this,
        W = (root.W = {});

    W.init = function (progress) {
        progress("initializing world...");
    };

    W.map = function (delta, input) {
        return S.$.pack(input.light, input.light1, input.light2);
    };

})();
