function app() {
     var canvas  = document.getElementById('painting'),
        ctx2d = canvas.getContext('2d');
    canvas.width = 640;
    canvas.height = 512;

    l.define('plant.a')
    .context({
        posx: 0,
        posy: 0,
        angle: 30,
        length: 50,
        factor: 0.83,
        delta: 23
    })
    .operators({
        forward: function () {
            ctx2d.beginPath();
            ctx2d.moveTo(this.posx, this.posy);
            this.posx = this.posx + this.length * Math.cos(this.angle / 360 * Math.PI * 2);
            this.posy = this.posy + this.length * Math.sin(this.angle / 360 * Math.PI * 2);
            this.length = this.factor * this.length;
            ctx2d.lineTo(this.posx, this.posy);
            ctx2d.closePath();
            ctx2d.stroke();
        },
        turn: function (d) {
            this.angle = this.angle + d;
        }
    })
    .symbols({
        'X': function () {
        },
        'Forward': function () {
            this.forward();
        }
    })
    .terminates({
        'turn': function (d) {
            this.turn(d);
        }
    })
    .start('X')
    .rules(function (ctx) {
        return {
            'X': function () {
                return [
                    ctx.s('Forward'),
                    ctx.t('turn')(-ctx.delta),
                    [
                        [ctx.s('X')], ctx.t('turn')(+ctx.delta), ctx.s('X')
                    ],
                    ctx.t('turn')(+ctx.delta),
                    ctx.s('Forward'),
                    [
                        ctx.t('turn')(+ctx.delta),
                        ctx.s('Forward'),
                        ctx.s('X')
                    ],
                    ctx.t('turn')(-ctx.delta),
                    ctx.s('X')
                ];
            },
            'Forward': function () {
                return [
                    ctx.s('Forward'),
                    ctx.s('Forward')
                ];
            }
        };
    })
    .end();

   t = l('plant.a');
   t()()()()()()();
}

$(app);


