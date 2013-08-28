function InputManager (canvas, particleEmitter) {
    canvas.addEventListener('mousedown', handleClick, false);
    canvas.addEventListener('mouseup', handleRelease, false);
    canvas.addEventListener('mousemove', handleMove, false);

    // Keep track of clicks
    var firstClick = -1,    // First click needs 3 states, inactive, inactive clicked, active
        secondClick = -1;

    // Inital click position, controls position of editor and size of particles
    var emmiterX = 0,
        emmiterY = 0,
        particleRadius = 20,
        minParticleRadius = 20,
        maxParticleRadius = 100;

    // Second click position, controls direction and frequency
    var sx = 0,
        sy = 0,
        sr = 10,
        minInterval = 10,
        maxInterval = 100;

    function handleClick (evt) {
        if (firstClick == -1) {
            emmiterX = evt.pageX;
            emmiterY = evt.pageY;
            firstClick = 1;
            particleRadius = 20;
        } else {
            sx = evt.pageX;
            sy = evt.pageY;
            sr = 10;
            secondClick = 1;
        }
    }

    function handleRelease (evt) {
        if (firstClick == 1) {
            firstClick = 0;
        } else if (secondClick == 1) {
            firstClick = -1;
            secondClick = -1;

            var xDir = (sx - emmiterX) * 0.1;
            var yDir = (sy - emmiterY) * 0.1;

            // Limit the maximum x direction
            xDir = xDir > 10 ? 10 : xDir;
            xDir = xDir < -10 ? -10 : xDir;

            // Limit the maximum y direction
            yDir = yDir > 5 ? 5 : yDir;
            yDir = yDir < -5 ? -5 : yDir;

            // Create a new particle emitter
            var particleInterval = Math.floor(sr/10);
            particleEmitter.push(new ParticleEmmiter(emmiterX, emmiterY, xDir, yDir, particleInterval, particleRadius));
        }
    }

    function handleMove (evt) {
        if (firstClick == 1 && secondClick == -1) {
            var fx = emmiterX - evt.pageX;
            var fy = emmiterY - evt.pageY;
            particleRadius = Math.floor(Math.sqrt(fx*fx + fy*fy));

            // Limit the radius of the circle that determines the particle interval
            particleRadius = particleRadius < minParticleRadius ? minParticleRadius : particleRadius;
            particleRadius = particleRadius > maxParticleRadius ? maxParticleRadius : particleRadius;
        }
        else if (secondClick) {
            var x = sx - evt.pageX;
            var y = sy - evt.pageY;
            sr = Math.floor(Math.sqrt(x*x + y*y));

            // Limit the radius of the circle that determines the particle interval
            sr = sr < minInterval ? minInterval : sr;
            sr = sr > maxInterval ? maxInterval : sr;
        }
    }

    this.draw = function (context) {
        context.strokeStyle = 'white';
        if (secondClick == 1) {
            context.beginPath();
            context.arc(sx, sy, sr, 0, Math.PI*2, true);
            context.stroke();
        }
        if (firstClick > -1) {
            context.beginPath();
            context.arc(emmiterX, emmiterY, particleRadius, 0, Math.PI*2, true);
            context.stroke();
        }
    };
}