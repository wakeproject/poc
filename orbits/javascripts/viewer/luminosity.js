$(function () {
    var root = this,
        viewers = root.viewers || {},
        LV = (viewers.LV = {});
    root.viewers = viewers;

    var canvas  = document.getElementById("lum"),
        context = canvas.getContext("2d");
    canvas.width = 1165;
    canvas.height = 80;

    var ls = [];
    for (var j = 0; j < 11650; j++) {
        ls.push(null);
    }

    var N = 1165, M = 80;

    LV.paint = function (data) {
        ls.shift();
        ls.push(data.l);

        $("#factor").html(data.l);
        context.clearRect(0, 0, 1165, 80);
        for (var i = 0; i < N; i++) {
            context.fillStyle = "#ffff00";
            context.fillRect(i, 79, 1, 1);
            context.fillStyle = "#0000ff";
            context.fillRect(i, 40, 1, 1);
            context.fillStyle = "#ff0000";
            context.fillRect(i, 1, 1, 1);

            var measure = 0, cnt = 0;
            for (var k = 0; k < 10; k++) {
                var l = ls[10 * i + k];
                if (l) {
                    measure += ls[10 * i + k];
                    cnt++;
                }
            }
            if (cnt === 0) cnt = 1;
            var value = 80 - Math.floor(measure / cnt / 2 * 80);

            context.fillStyle = "#000000";
            context.fillRect(i, value, 2, 2);
        }

    };

});
