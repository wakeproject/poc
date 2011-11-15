$(function () {
    var root = this,
        viewers = root.viewers || {},
        WDYV = (viewers.WDYV = {});
    root.viewers = viewers;

    var canvas  = document.getElementById("map-wdy"),
        context = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 512;

    var cnvsGray  = document.getElementById("grs-wdy"),
        ctxGray = cnvsGray.getContext("2d");
    cnvsGray.width = 640;
    cnvsGray.height = 512;

    var N = Scl.N, M = Scl.M;

    var array = [];
    WDYV.paint = function (data) {
        context.clearRect(0, 0, 640, 512);
        for (var i = 0; i < N; i++) {
            array[i] = [];
            for (var j = 0; j <= M; j++) {
                var measure = data.map[i][j],
                    wdy = measure[7],
                    fill = "#000000";

                array[i][j] = wdy;

                if (wdy > 20 || wdy < -20) {
                    fill = "#ffffff";
                } else {
                    var hight = 20 + wdy;
                    var low = wdy;
                    hight = Math.floor(hight / 40.0 * 255).toString(16);
                    low  = Math.floor(low / 40.0 * 255).toString(16);
                    fill = "rgb(" + hight + ", 88, " + low + ")";
                }
                context.fillStyle = fill;
                context.fillRect(5 * i, 4 * j, 5, 4);

                if (i === 0 && j === 50) {
                    $("#wdy1").html(wdy);
                }
                if (i === 150 && j === 50) {
                    $("#wdy2").html(wdy);
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
