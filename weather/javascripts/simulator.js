importScripts('/poc/weather/javascripts/universe/time.js');
importScripts('/poc/weather/javascripts/universe/orbit.js');
importScripts('/poc/weather/javascripts/universe/planet.js');
importScripts('/poc/weather/javascripts/world/world.js');

var step = 0, prgs = 0;

function progress(msg) {
    postMessage({
        progress:  prgs,
        msg: msg
    });
    prgs++;
}

try {
    W.init(progress);
} catch (e) {
    progress("error: " + e);
}

function go() {
    var dt = 1;
    var delta = T.elapse(dt),
        orbit = O.evolve(progress, delta),
        input = P.evolve(progress, delta, orbit),
        scale  = W.evolve(progress, delta, input);
    dt = Math.min(scale.wind, scale.density);
    if(dt > 10) dt = 10;
    progress ("communicating...");
    postMessage({
        time:  T.time(),
        year: T.year(),
        lday: T.lday(),
        lyear: T.lyear(),
        x1:    orbit.p1.x,
        y1:    orbit.p1.y,
        x2:    orbit.p2.x,
        y2:    orbit.p2.y,
        x3:    orbit.p3.x,
        y3:    orbit.p3.y,
        l:     orbit.l,
        l1:    orbit.l1,
        l2:    orbit.l2,
        map:   W.map(delta, input),
        verticle:   W.verticle()
    });
    step++;
    prgs = 0;
    progress ("elapse " + dt + " seconds and waiting...");
}

setInterval(go, 20000);


