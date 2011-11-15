(function () {

    var root = this,
        Wal = (root.Wal = {});

    function power(n) {
        var p = 1;
        for (var i = 0; i < n; i++) {
            p = p * 2;
        }
        return p;
    }

    var N = 7, M = power(N);// 2 ^ 7 = 128
    Wal.N = N;
    Wal.M = M;

    // initialize matrix and sequence array
    var H = [], S = [];
    for (var i = 0; i < M; i++) {
        H[i] = [];
        S[i] = 0;
        for (var j = 0; j < M; j++) {
            H[i][j] = 0;
        }
    }

    function hadamard01(n) {
        var p = power(n - 1);
        for (i = 0; i < p; i++) {
            for (j = 0; j < p; j++) {
                H[i + p][j] = H[i][j];
            }
        }
    }

    function hadamard10(n) {
        var p = power(n - 1);
        for (i = 0; i < p; i++) {
            for (j = 0; j < p; j++) {
                H[i][j + p] = H[i][j];
            }
        }
    }

    function hadamard11(n) {
        var p = power(n - 1);
        for (i = 0; i < p; i++) {
            for (j = 0; j < p; j++) {
                H[i + p][j + p] = - H[i][j];
            }
        }
    }

    function hadamard00(n) {
        if (n === 1) {
            H[0][0] = 1;
        } else {
            hadamard00(n - 1);
            hadamard01(n - 1);
            hadamard10(n - 1);
            hadamard11(n - 1);
        }
    }

    function sequence() {
        for (j = 0; j < M; j++) {
            var counter = 0, last = 1;
            for (i = 0; i < M; i++) {
                if (H[i][j] * last < 1) {
                    counter++;
                }
                last = H[i][j];
            }
            S[counter] = j;
        }
    }

    hadamard00(N);
    sequence();

    function perform(result, array, start, len) {
        var half = Math.round(len / 2),
            end = start + half;
        for (i = start; i < end; i++) {
            var j = i + half;
            result[i] = array[i] + array[j];
            result[j] = array[i] - array[j];
        }
    }

    function loopPerform(array, len) {
        var result = [], times = Math.round(array.length / len);
        for (var i = 0; i < times; i++) {
            perform(result, array, len * i, len);
        }
        return result;
    }

    function perform2d(result, array, start, len) {
        var quarter = Math.round(len / 4),
            end = start + quarter;
        for (i = start; i < end; i++) {
            var j = i + quarter,
                k = j + quarter,
                l = k + quarter;
            result[i] = array[i] + array[j] + array[k] + array[l];
            result[j] = array[i] - array[j] + array[k] - array[l];
            result[k] = array[i] + array[j] - array[k] - array[l];
            result[l] = array[i] - array[j] - array[k] + array[l];
        }
    }

    function loopPerform2d(array, len) {
        var result = [], times = Math.round(array.length / len);
        for (var i = 0; i < times; i++) {
            perform2d(result, array, len * i, len);
        }
        return result;
    }

    function concat(array2d) {
        var result = [];
        for (var i = 0; i < M; i++) {
            for (var j = 0; j < M; j++) {
                var pos = i * M + j;
                result[pos] = array2d[i][j];
            }
        }
        return result;
    }

    function split(array) {
        var result = [];
        for (var i = 0; i < M; i++) {
            result[i] = [];
            for (var j = 0; j < M; j++) {
                var pos = i * M + j;
                result[i][j] = array[pos];
            }
        }
        return result;
    }

    // n < 128
    Wal.wal = function (n, i) {
        return H[S[n]][i];
    };

    Wal.wal2d = function (l, m, i, j) {
        return H[S[l]][i] * H[S[m]][j];
    };

    Wal.transform = function (array) {
        for (var len = M; len > 1;) {
            array = loopPerform(array, len);
            len = len / 2;
        }
        var factor = 1 / Math.sqrt(M);
        return array.map(function (val) {
            return val * factor;
        });
    };

    // size of array2d < 128 * 128
    Wal.transform2d = function (array2d) {
        var array = concat(array2d);
        for (var len = M * M; len > 1;) {
            array = loopPerform2d(array, len);
            len = len / 4;
        }

        array = array.map(function (val) {
            return val / M;
        });

        return split(array);
    };

})();
