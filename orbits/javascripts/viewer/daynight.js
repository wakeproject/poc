$(function () {
    var root = this,
        viewers = root.viewers || {},
        DNV = (viewers.DNV = {});
    root.viewers = viewers;

    var canvas  = document.getElementById("map-dn"),
        context = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 512;

    var N = Scl.N, M = Scl.M;

    DNV.paint = function (data) {
        context.clearRect(0, 0, 640, 512);
        for (var i = 0; i < N; i++) {
            for (var j = 0; j <= M; j++) {
                var measure = data.map[i][j],
                    blue = measure[1],
                    yellow = measure[2];

                blue = blue * 2048;
                blue = blue > 255 ? 255 : blue;
                var hexB = Math.round(blue).toString(16);
                if (hexB.length === 1) {
                    hexB = '0' + hexB;
                }

                yellow = yellow * 8192;
                yellow = yellow > 255 ? 255 : yellow;
                var hexY = Math.round(yellow).toString(16);
                if (hexY.length === 1) {
                    hexY = '0' + hexY;
                }

                var fill = "#" + hexY + hexY + hexB;
                context.fillStyle = fill;
                context.fillRect(5 * i, 4 * j, 5, 4);
            }
        }
    };

});