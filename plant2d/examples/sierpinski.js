function app() {
     var canvas  = document.getElementById('painting'),
        ctx2d = canvas.getContext('2d');
    canvas.width = 960;
    canvas.height = 640;

    l.define('sierpinski')
    .context({
        posx: 300,
        posy: 500,
        angle: 0,
        length: 1
    })
    .operators({
        forward: function () {
            ctx2d.beginPath();
            ctx2d.moveTo(this.posx, this.posy);
            this.posx = this.posx + this.length * Math.cos(this.angle / 360 * Math.PI * 2);
            this.posy = this.posy + this.length * Math.sin(this.angle / 360 * Math.PI * 2);
            ctx2d.lineTo(this.posx, this.posy);
            ctx2d.closePath();
            ctx2d.stroke();
        }
    })
    .symbols({
        'A': function () {
            this.forward();
        },
        'B': function () {
            this.forward();
        }
    })
    .terminates({
        left: function (d) {
            this.angle = this.angle - 60;
        },
        right: function (d) {
            this.angle = this.angle + 60;
        }
    })
    .start('A')
    .rules(function (ctx) {
        return {
            'left': function () {
                return [ctx.t('left')];
            },
            'right': function () {
                return [ctx.t('right')];
            },
            'A': function () {
                return [
                    ctx.s('B'),
                    ctx.t('right'),
                    ctx.s('A'),
                    ctx.t('right'),
                    ctx.s('B')
                ];
            },
            'B': function () {
                return [
                    ctx.s('A'),
                    ctx.t('left'),
                    ctx.s('B'),
                    ctx.t('left'),
                    ctx.s('A')
                ];
            }
        };
    })
    .end();

   l('sierpinski')(8);
}

$(app);


