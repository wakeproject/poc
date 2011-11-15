$(function () {
    var root = this,
        viewers = root.viewers || {},
        VDNSV = (viewers.VDNSV = {});
    root.viewers = viewers;

    var canvas  = document.getElementById("vmap-vdnst"),
        context = canvas.getContext("2d");
    canvas.width = 180;
    canvas.height = 512;

    var M = 100, L = 15;

    VDNSV.paint = function (data) {
        context.clearRect(0, 0, 180, 512);
        for (var i = 0; i <= M; i++) {
            for (var j = 0; j <= L; j++) {
                var measure = data.verticle[i][j],
                    dnst = measure[0],
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
                context.fillRect(12 * j, 5 * i, 12, 5);
            }
        }
    };

});
