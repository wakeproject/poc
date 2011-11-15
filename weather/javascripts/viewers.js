$(function() {
    var ids = ["dn", "ltp", "atp", "pr", "wdx", "wdy", "wdz", "dnst", "vert"];
    ids.forEach(function (id, index, array) {
        $("#slc-" + id).click(function () {
            ids.forEach(function (another, index, array) {
                $("#map-" + another).css("z-index", 0);
                $("#slc-" + another).css("color", "black");
            });
            $("#map-" + id).css("z-index", 10);
            $("#slc-" + id).css("color", "blue");
        });
    });

    var viewers = this.viewers;
    var worker = new Worker('/poc/weather/javascripts/simulator.js');
    worker.onmessage = function (event) {
        var data = event.data;

        if(data.msg) {
            $("#msg").html(data.msg);
        } else {
            $("#lyear").html(data.lyear);
            $("#lday").html(data.lday);

            viewers.OV.paint(data);
            //viewers.LV.paint(data);
            viewers.DNV.paint(data);
            viewers.LTPV.paint(data);
            viewers.ATPV.paint(data);
            viewers.PRV.paint(data);
            viewers.WDXV.paint(data);
            viewers.WDYV.paint(data);
            viewers.WDZV.paint(data);
            viewers.DNSV.paint(data);

            //verticles
            viewers.VDNSV.paint(data);
            viewers.VATPV.paint(data);
            viewers.VPRV.paint(data);
        }
    };
});
