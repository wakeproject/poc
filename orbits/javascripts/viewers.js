$(function() {
    var viewers = this.viewers;
    var worker = new Worker('/poc/orbits/javascripts/simulator.js');
    worker.onmessage = function (event) {
        var data = event.data;

        if(data.msg) {
            $("#msg").html(data.msg);
        } else {
            $("#lyear").html(data.lyear);
            $("#lday").html(data.lday);
            $("#energy").html(data.E);

            viewers.OV.paint(data);
            viewers.LV.paint(data);
            viewers.DNV.paint(data);
        }
    };
});
