importScripts('/poc/orbits/javascripts/universe/time.js');
importScripts('/poc/orbits/javascripts/universe/orbit.js');
importScripts('/poc/orbits/javascripts/universe/planet.js');
importScripts('/poc/orbits/javascripts/world/world.js');

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
    var dt = 3600 * 30;
    var delta = T.elapse(dt),
        orbit = O.evolve(progress, delta),
        input = P.evolve(progress, delta, orbit);
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
        E:     orbit.E,
        map:   W.map(delta, input),
    });
    step++;
    prgs = 0;
    progress ("elapse " + dt + " seconds and waiting...");
}

setInterval(go, 50);


