var canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);
var ctx = canvas.getContext('2d');

var particleEmitters = [],
    inputManager = new InputManager(canvas, particleEmitters);

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i in particleEmitters) {
        particleEmitters[i].update(ctx);
    }
}

function run () {
    update();
    inputManager.draw(ctx);
    window.webkitRequestAnimationFrame(run);
}

run();