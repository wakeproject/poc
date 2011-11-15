(function () {

    var root = this,
        Grs = (root.Grs = {});

    function power(n) {
        var p = 1;
        for (var i = 0; i < n; i++) {
            p = p * 2;
        }
        return p;
    }

    var N = 16, M = power(N);

    function maxmin(array) {
        var init = {
            max: -Infinity,
            min: Infinity
        };
        return array.reduce(function (prev, curr) {
            return curr.reduce(function (accu, val) {
                if(accu.max < val) accu.max = val;
                if(accu.min > val) accu.min = val;
                return accu;
            }, prev);
        }, init);
    }

    function grayscale(array) {
        var result = maxmin(array),
            max = result.max,
            min = result.min,
            scale = max - min;

        return {
            max: max,
            min: min,
            scale: scale,
            array: array.map(function (row) {
                return row.map(function (elem) {
                    return Math.floor((elem - min) / scale * M);
                });
            })
        };
    }

    function colorify(array) {
        return array.map(function (row) {
            return row.map(function (elem) {
                return "#" + Math.floor(elem * 256).toString(16);
            });
        });
    }

    Grs.grayscale = grayscale;
    Grs.colorify = colorify;

})();
