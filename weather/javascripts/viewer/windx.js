$(function () {
    var root = this,
        viewers = root.viewers || {},
        WDXV = (viewers.WDXV = {});
    root.viewers = viewers;

    var canvas  = document.getElementById("map-wdx"),
        context = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 512;

    var cnvsGray  = document.getElementById("grs-wdx"),
        ctxGray = cnvsGray.getContext("2d");
    cnvsGray.width = 640;
    cnvsGray.height = 512;

    var N = Scl.N, M = Scl.M;

    var array = [];
    WDXV.paint = function (data) {
        context.clearRect(0, 0, 640, 512);
        for (var i = 0; i < N; i++) {
            array[i] = [];
            for (var j = 0; j <= M; j++) {
                var measure = data.map[i][j],
                    wdx = measure[6],
                    fill = "#000000";

                array[i][j] = wdx;

                if (wdx > 20 || wdx < -20) {
                    fill = "#ffffff";
                } else {
                    var hight = 20 + wdx;
                    var low = wdx;
                    hight = Math.floor(hight / 40.0 * 255).toString(16);
                    low  = Math.floor(low / 40.0 * 255).toString(16);
                    fill = "rgb(" + hight + ", 88, " + low + ")";
                }
                context.fillStyle = fill;
                context.fillRect(5 * i, 4 * j, 5, 4);

                if (i === 0 && j === 50) {
                    $("#wdx1").html(wdx);
                }
                if (i === 150 && j === 50) {
                    $("#wdx2").html(wdx);
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
