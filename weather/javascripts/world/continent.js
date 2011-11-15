(function () {

    var root = this,
        Ctn = (root.Ctn = {});

    Ctn.isContinent = function (lng, lat) {
        return Math.abs(2 + lng) < 1.2 && lat > - Math.PI / 9 && lat < 2 * Math.PI / 5
        || Math.abs(2 - lng) < 0.5 && lat > - 2 * Math.PI / 5 && lat < Math.PI / 3;
    };

})();
