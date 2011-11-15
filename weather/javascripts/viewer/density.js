$(function () {
    var root = this,
        viewers = root.viewers || {},
        DNSV = (viewers.DNSV = {});
    root.viewers = viewers;

    var canvas  = document.getElementById("map-dnst"),
        context = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 512;

    var N = Scl.N, M = Scl.M;

    DNSV.paint = function (data) {
        context.clearRect(0, 0, 640, 512);
        for (var i = 0; i < N; i++) {
            for (var j = 0; j <= M; j++) {
                var measure = data.map[i][j],
                    dnst = measure[9],
                    fill = "#000000";

                if (dnst < 0) {
                    fill = "#000000";
                } else if (dnst > 2) {
                    fill = "#ffffff";
                } else {
                    var hight = dnst;
                    var low = 2 - dnst;
                    hight = Math.floor(hight / 2.0 * 255).toString(16);
                    low  = Math.floor(low / 2.0 * 255).toString(16);
                    fill = "#" + hight + '88' + low;
                }
                context.fillStyle = fill;
                context.fillRect(5 * i, 4 * j, 5, 4);

                if (i === 0 && j === 50) {
                    $("#dnst1").html(dnst/1.225);
                }
                if (i === 150 && j === 50) {
                    $("#dnst2").html(dnst/1.225);
                }
            }
        }
    };

});
