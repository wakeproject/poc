(function () {

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;
    root.V3 = {};

    function build(x, y, z) {
        return {
            x: x,
            y: y,
            z: z
        };
    }

    function zero() {
        return {
            x: 0,
            y: 0,
            z: 0
        };
    }

    function add(a, b) {
        return {
            x: a.x + b.x,
            y: a.y + b.y,
            z: a.z + b.z
        };
    }

    function expand(a, c) {
        return {
            x: a.x * c,
            y: a.y * c,
            z: a.z * c
        };
    }

    function inner(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }

    function cross(a, b) {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
    }

    function value(a) {
        return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
    }

    function unify(a) {
        var r = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
        return {
            x: a.x / r,
            y: a.y / r,
            z: a.z / r
        };
    }

    function random(r) {
        var rand = build(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
        );
        rand = unify(rand);
        return expand(rand, r);
    }

    root.V3.build = build;
    root.V3.zero = zero;
    root.V3.expand = expand;
    root.V3.add = add;
    root.V3.inner = inner;
    root.V3.cross = cross;
    root.V3.value = value;
    root.V3.unify = unify;
    root.V3.random = random;

})();

