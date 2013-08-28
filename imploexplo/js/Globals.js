var Globals = (function () {
	var module = {};

	module.canvas = document.getElementById('surface');
	module.context = module.canvas.getContext('2d');
	module.canvasWidth = module.canvas.width;
	module.canvasHeight = module.canvas.height;

	module.worldScale = 30;
	module.world = null;

	module.GameState = {
		MENU : 1,
		RUNNING : 2
	};
	module.GameMode = {
		LOCAL : 1,
		ONLINE : 2
	};
	module.gameMode = null;
	module.gameState = module.GameState.MENU;

	return module;
}());

// Converts Box2d metres to pixels
function convertToPixels (num)
{
	return Math.floor(num * Globals.worldScale);
}

// Converts from pixels to Box2d metres
function convertToMetres(num)
{
	return num / Globals.worldScale;
}

// Function to draw a rectangle
function drawRect (x, y, w, h, colour, ctx)
{
	ctx = ctx || Globals.context;
	ctx.fillStyle = colour;
	ctx.fillRect(convertToPixels(x - (w / 2)),
						convertToPixels(y - (h / 2)),
						convertToPixels(w),
						convertToPixels(h));
}

function drawCircle(x, y, r, t, colour, ctx) {
	ctx.strokeStyle = colour;
	ctx.beginPath();
	ctx.lineWidth = t;
	ctx.arc(x, y, r, 0, Math.PI*2, true);
	ctx.stroke();
}

// Box2d Declerations
var b2Vec2				= Box2D.Common.Math.b2Vec2,
	b2PolygonShape		= Box2D.Collision.Shapes.b2PolygonShape,
	b2Body				= Box2D.Dynamics.b2Body,
	b2BodyDef			= Box2D.Dynamics.b2BodyDef,
	b2Fixture			= Box2D.Dynamics.b2Fixture,
	b2FixtureDef		= Box2D.Dynamics.b2FixtureDef,
	b2World				= Box2D.Dynamics.b2World;

function Timer (timePeriod) {
	this.timePeriod = timePeriod * 1000;
	this.dt = 0;
	this.time = new Date().getTime();
}

Timer.prototype.update = function() {
	var now = new Date().getTime();
	this.dt = now - this.time;

	this.time = now;
	this.timePeriod -= this.dt;
};

Timer.prototype.HasTimePassed = function() {
	return this.timePeriod < 0;
};

function playSound (file) {
	var audio = new Audio();
	audio.src = "audio/"+file+".wav";
	audio.play();
}