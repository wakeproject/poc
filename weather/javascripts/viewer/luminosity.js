$(function () {
    var root = this,
        viewers = root.viewers || {},
        LV = (viewers.LV = {});
    root.viewers = viewers;

    var ts = [];
    for (var i = 0;i < 10000;i++) {
        ts.push(- 7.961783 + 0.0007961783 * i);
    }
    var ls = [];
    for (var j = 0;j < 10000;j++) {
        ls.push(1);
    }
    var twos = [];
    for (j = 0;j < 10000;j++) {
        twos.push(2);
    }
    var ones = [];
    for (j = 0;j < 10000;j++) {
        ones.push(1);
    }
    var zeros = [];
    for (j = 0;j < 10000;j++) {
        zeros.push(0);
    }

    var l  = Raphael("lum", 700, 80), g = l.g;

    LV.paint = function (data) {
        $("#factor").html(data.l);

        ts.shift();
        ls.shift();
        ts.push(data.lyear);
        ls.push(data.l);
        l.clear();
        g.linechart(0, 0, 700, 80, ts, [ls, zeros, ones, twos]).hoverColumn(function () {
            this.set = l.set(
                g.disc(this.x, 2 * (this.y[0] - 0.5)),
                g.disc(this.x, this.y[1]),
                g.disc(this.x, this.y[2]),
                g.disc(this.x, this.y[3])
                );
        }, function () {
            this.set.remove();
        });
    };

});
