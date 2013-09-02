var gravity = 0.4;
var numParticles = 0;
var numParticlesDisplay = document.getElementById('numParticles');

function Particle(x, y, xDir, yDir, r) {
    ++numParticles;
    numParticlesDisplay.textContent = 'Particles: ' + numParticles;

    this.x = x;
    this.y = y;
    this.r = r;

    // Add random elements to the particle movement direction
    this.xVel = xDir + (Math.random() *  4) - 2;
    this.yVel = yDir * ((Math.random() *  3) + 1);

    // Amount of time the particle should be alive for
    this.max_ttl = 60;
    this.ttl = this.max_ttl;

    // Generate a random colour for the particle
    var r = Math.floor(Math.random() *  255);
    var g = Math.floor(Math.random() *  255);
    var b = Math.floor(Math.random() *  255);
    this.colour = 'rgba('+r+','+g+','+b+',';
}

Particle.prototype.update = function() {
    this.ttl--;
    this.r *= 0.97;
    this.yVel += gravity;
    this.x += this.xVel;
    this.y += this.yVel;
};

Particle.prototype.draw = function(context) {
    context.beginPath();
    // Create a radial gradient with 3 stops
    var gradient = context.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
    // Particles should fade out the closer they are to death
    var opacity = this.ttl / this.max_ttl;
    gradient.addColorStop(0, this.colour + opacity +')');
    gradient.addColorStop(0.5, this.colour + opacity +')');
    gradient.addColorStop(1, this.colour + '0.0)');
    context.fillStyle = gradient;
    context.arc(this.x, this.y, this.r, 0, Math.PI*2, true);
    context.fill();
};


/*
    x, y The position of the emitter
    xDir, yDir The direction the particles should be emitted
 */
function ParticleEmmiter(x, y, xDir, yDir, timeBetweenParticles, particleRadius) {
    this.particles = [];
    this.x = x;
    this.y = y;

    this.xDir = xDir;
    this.yDir = yDir;

    this.frameCount = 0;
    this.timeBetweenParticles = timeBetweenParticles;
    this.particleRadius = particleRadius;
}

ParticleEmmiter.prototype.update = function(context) {

    this.frameCount++;

    // Check if it is time to create another particle
    if (this.frameCount % this.timeBetweenParticles === 0) {
        this.particles.push(new Particle(this.x, this.y, this.xDir, this.yDir, this.particleRadius));
    }

    // Overlapping circles are drawn lighter
    context.globalCompositeOperation = "lighter";
    for (var i in this.particles) {
        this.particles[i].update();
        this.particles[i].draw(context);

        // Remove dead particles
        if (this.particles[i].ttl < 0) {
            this.particles.splice(i, 1);
            --numParticles;
        }
    }
};