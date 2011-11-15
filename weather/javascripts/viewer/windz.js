$(function () {
    var root = this,
        viewers = root.viewers || {},
        WDZV = (viewers.WDZV = {});
    root.viewers = viewers;

    var canvas  = document.getElementById("map-wdz"),
        context = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 512;

    var N = Scl.N, M = Scl.M;

    WDZV.paint = function (data) {
        context.clearRect(0, 0, 640, 512);
        for (var i = 0; i < N; i++) {
            for (var j = 0; j <= M; j++) {
                var measure = data.map[i][j],
                    wdz = measure[8],
                    fill = "#000000";

                if (wdz > 100 || wdz < -100) {
                    fill = "#ffffff";
                } else {
                    var hight = 100 + wdz;
                    var low = wdz;
                    hight = Math.floor(hight / 200.0 * 255).toString(16);
                    low  = Math.floor(low / 200.0 * 255).toString(16);
                    fill = "rgb(" + hight + ", 88, " + low + ")";
                }
                context.fillStyle = fill;
                context.fillRect(5 * i, 4 * j, 5, 4);

                if (i === 0 && j === 50) {
                    $("#wdz1").html(wdz);
                }
                if (i === 150 && j === 50) {
                    $("#wdz2").html(wdz);
                }
            }
        }
    };

});
