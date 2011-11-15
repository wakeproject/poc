(function () {

    var root = this,
        Atm = (root.Atm = {});

    // Light reflect
    Atm.reflectionRatio = 0.20;
    // Light absorb for short
    Atm.absortRatioShort = 0.20;
    // Light absorb for long
    Atm.absortRatioLong = 0.95;

    Atm.radRatioTop = 0.25;
    Atm.radRatioBottom = 0.75;

})();
