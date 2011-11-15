$(function () {
    var root = this,
        viewers = root.viewers || {},
        LTPV = (viewers.LTPV = {});
    root.viewers = viewers;

    var canvas  = document.getElementById("map-ltp"),
        context = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 512;

    var N = Scl.N, M = Scl.M;

    LTPV.paint = function (data) {
        context.clearRect(0, 0, 640, 512);
        for (var i = 0; i < N; i++) {
            for (var j = 0; j <= M; j++) {
                var measure = data.map[i][j],
                    temp = measure[3],
                    fill = "#000000";

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
                    $("#ltp1").html(temp - 273.15);
                }
                if (i === 150 && j === 50) {
                    $("#ltp2").html(temp - 273.15);
                }
            }
        }
    };

});
