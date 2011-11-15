$(function () {
    var root = this,
        viewers = root.viewers || {},
        PRV = (viewers.PRV = {});
    root.viewers = viewers;

    var canvas  = document.getElementById("map-pr"),
        context = canvas.getContext("2d");
    canvas.width = 640;
    canvas.height = 512;

    var N = Scl.N, M = Scl.M;

    PRV.paint = function (data) {
        context.clearRect(0, 0, 640, 512);
        for (var i = 0; i < N; i++) {
            for (var j = 0; j <= M; j++) {
                var measure = data.map[i][j],
                    prs = measure[5],
                    fill = "#000000";

                if (prs > 200000) {
                    fill = "#ffffff";
                } else {
                    var hight = prs;
                    var low = 200000 - prs;
                    hight = Math.floor(hight / 200000.0 * 255).toString(16);
                    low  = Math.floor(low / 200000.0 * 255).toString(16);
                    fill = "#" + hight + '88' + low;
                }
                context.fillStyle = fill;
                context.fillRect(5 * i, 4 * j, 5, 4);

                if (i === 0 && j === 50) {
                    $("#prs1").html(prs/101629.61375);
                }
                if (i === 150 && j === 50) {
                    $("#prs2").html(prs/101629.61375);
                }
            }
        }
    };

});
