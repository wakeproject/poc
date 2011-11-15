function app() {
     var canvas  = document.getElementById('painting'),
        ctx2d = canvas.getContext('2d');
    canvas.width = 960;
    canvas.height = 640;

    l.define('plant')
    .context({
        posx: 300,
        posy: 600,
        angle: 0,
        length: 1,
        thickness: 10,
        factor: 0.99,
        delta: 25
    })
    .operators({
        forward: function () {
            ctx2d.beginPath();
            ctx2d.moveTo(this.posx, this.posy);
            this.posx = this.posx + this.length * Math.sin(this.angle / 360 * Math.PI * 2);
            this.posy = this.posy - this.length * Math.cos(this.angle / 360 * Math.PI * 2);
            ctx2d.lineTo(this.posx, this.posy);
            ctx2d.closePath();
            ctx2d.lineWidth = this.thickness;
            ctx2d.stroke();
            this.thickness = this.thickness * 0.988888;
        },
        turn: function (d) {
            this.angle = this.angle + d;
        }
    })
    .symbols({
        'X': function () {
            this.length = this.factor * this.length;
        },
        'Forward': function () {
            this.forward();
        }
    })
    .terminates({
        'turnL': function () {
            this.turn(this.delta);
        },
        'turnR': function () {
            this.turn(-this.delta);
        }
    })
    .start('X')
    .rules(function (ctx) {
        return {
            'turnL': function () {
                return [ctx.t('turnL')()];
            },
            'turnR': function () {
                return [ctx.t('turnR')()];
            },
            'X': function () {
                return [
                    ctx.s('Forward'),
                    ctx.t('turnR')(),
                    [
                        [ctx.s('X')], ctx.t('turnL')(), ctx.s('X')
                    ],
                    ctx.s('Forward'),
                    ctx.t('turnL')(),
                    ctx.s('Forward'),
                    [
                        ctx.t('turnL')(),
                        ctx.s('Forward'),
                        [ctx.t('turnL')(), ctx.s('X')],
                        ctx.s('X')
                    ],
                    ctx.s('Forward'),
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

   l('plant')(7);
}

$(app);


