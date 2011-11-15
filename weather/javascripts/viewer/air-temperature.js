$(function () {
    var root = this,
        viewers = root.viewers || {},
        ATPV = (viewers.ATPV = {});
    root.viewers = viewers;

    var canvas  = document.getElementById("map-atp"),
        context = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 512;

    var cnvsGray  = document.getElementById("grs-atp"),
        ctxGray = cnvsGray.getContext("2d");
    cnvsGray.width = 640;
    cnvsGray.height = 512;

    var N = Scl.N, M = Scl.M;

    ATPV.paint = function (data) {
        context.clearRect(0, 0, 640, 512);
        ctxGray.clearRect(0, 0, 640, 512);

        var array = [];
        for (var i = 0; i < N; i++) {
            array[i] = [];
            for (var j = 0; j <= M; j++) {
                var measure = data.map[i][j],
                    temp = measure[4],
                    fill = "#000000";

                array[i][j] = temp;

                if (temp < 173.15) {
                    fill = "#ffffff";
                } else if (temp > 373.15) {
                    fill = "#ff0000";
                } else {
                    var hot = 10 * Math.sqrt((temp - 173.15) / 2);
                    var cold = 10 * Math.sqrt((373.15 - temp) / 2);
                    hot = Math.floor(hot * 2.55).toString(16);
                    cold  = Math.floor(cold * 2.55).toString(16);
                    fill = "#" + hot + '88' + cold;
                }
                context.fillStyle = fill;
                context.fillRect(5 * i, 4 * j, 5, 4);

                if (i === 0 && j === 50) {
                    $("#atp1").html(temp - 273.15);
                }
                if (i === 150 && j === 50) {
                    $("#atp2").html(temp - 273.15);
                }
            }
        }

        array = Wal.transform2d(array);
        array = Grs.colorify(Grs.grayscale(array).array);
        for (var i = 0; i < N; i++) {
            for (var j = 0; j <= M; j++) {
                ctxGray.fillStyle = array[i][j];
                ctxGray.fillRect(5 * i, 4 * j, 5, 4);
            }
        }

    };

});
