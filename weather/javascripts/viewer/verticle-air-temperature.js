$(function () {
    var root = this,
        viewers = root.viewers || {},
        VATPV = (viewers.VATPV = {});
    root.viewers = viewers;

    var canvas  = document.getElementById("vmap-vatp"),
        context = canvas.getContext("2d");
    canvas.width = 180;
    canvas.height = 512;

    var M = 100, L = 15;

    VATPV.paint = function (data) {
        context.clearRect(0, 0, 180, 512);
        for (var i = 0; i <= M; i++) {
            for (var j = 0; j <= L; j++) {
                var measure = data.verticle[i][j],
                    temp = measure[1],
                    fill = "#000000";

                if (temp < 73.15) {
                    fill = "#ffffff";
                } else if (temp > 373.15) {
                    fill = "#ff0000";
                } else {
                    var hot = 10 * Math.sqrt((temp - 73.15) / 3);
                    var cold = 10 * Math.sqrt((373.15 - temp) / 3);
                    hot = Math.floor(hot * 2.55).toString(16);
                    cold  = Math.floor(cold * 2.55).toString(16);
                    fill = "#" + hot + '88' + cold;
                }
                context.fillStyle = fill;
                context.fillRect(12 * j, 5 * i, 12, 5);
            }
        }
    };

});
