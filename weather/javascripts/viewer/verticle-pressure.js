$(function () {
    var root = this,
        viewers = root.viewers || {},
        VPRV = (viewers.VPRV = {});
    root.viewers = viewers;

    var canvas  = document.getElementById("vmap-vpr"),
        context = canvas.getContext("2d");
    canvas.width = 180;
    canvas.height = 512;

    var M = 100, L = 15;

    VPRV.paint = function (data) {
        context.clearRect(0, 0, 180, 512);
        for (var i = 0; i <= M; i++) {
            for (var j = 0; j <= L; j++) {
                var measure = data.verticle[i][j],
                    prs = measure[2],
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
                context.fillRect(12 * j, 5 * i, 12, 5);
            }
        }
    };

});
