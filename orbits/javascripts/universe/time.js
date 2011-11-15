(function () {

    var root = this,
        T = (root.T = {});

    var ratio = 1 / Math.PI / 2 * 365 * 24 * 3600;

    var atime = 0;//Astronical time
    T.elapse = function (dt) {
        atime = atime + dt / ratio;
        return {
            tao: dt / ratio,
            dt:  dt,
            dld: dt / 3600 / 30,
            time: T.time(),
            year: T.year(),
            lday: T.lday(),
            lyear: T.lyear()
        };
    };

    //various time
    T.time = function () {
        return atime * ratio;
    };
    T.year = function () {
        return atime / Math.PI / 2;
    };
    T.lday = function () {
        return atime * ratio / 3600 / 30;
    };
    T.lyear = function () {
        return atime * ratio / 3600 / 30 / 500;
    };


})();
