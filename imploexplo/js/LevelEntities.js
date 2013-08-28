function StaticEntity(x, y, w, h, name)
{
	this.fixDef = new b2FixtureDef();
    this.fixDef.density = 1.0;
    this.fixDef.friction = 1.0;
    this.fixDef.restitution = 0.0;
	this.fixDef.shape = new b2PolygonShape();
	this.fixDef.shape.SetAsBox(w, h);

    this.bodyDef = new b2BodyDef();
	this.bodyDef.type = b2Body.b2_staticBody;
	this.bodyDef.position.x = x;
	this.bodyDef.position.y = y;

	this.physicsBody = Globals.world.CreateBody(this.bodyDef);

	this.physicsBody.CreateFixture(this.fixDef);

	this.physicsBody.SetUserData({name: name});
}

function KinematicEntity(x, y, w, h, name)
{
	this.fixDef = new b2FixtureDef();
    this.fixDef.density = 1.0;
    this.fixDef.friction = 0.0;
    this.fixDef.restitution = 0.0;
    this.fixDef.shape = new b2PolygonShape();
	this.fixDef.shape.SetAsBox(w, h);

    this.bodyDef = new b2BodyDef();
	this.bodyDef.type = b2Body.b2_kinematicBody;
	this.bodyDef.position.x = x;
	this.bodyDef.position.y = y;

	this.physicsBody = theWorld.CreateBody(this.bodyDef);

	this.physicsBody.CreateFixture(this.fixDef);
	this.physicsBody.SetUserData({name: name});
}

function Platform (x, y, w, h)
{
	this.x = convertToMetres(x);
	this.y = convertToMetres(y);

	this.w = convertToMetres(w);
	this.h = convertToMetres(h);

	this.baseEntity = new StaticEntity(this.x, this.y, this.w, this.h, "platform");
	this.baseEntity.physicsBody.SetUserData( {type: 'platform', _this: this });
}

Platform.prototype.draw = function(ctx)
{
	drawRect(this.x, this.y, this.w * 2, this.h * 2, "rgb(0, 0, 0)", ctx);
};

function ImploEnd ( x, y ) {
	this.x = x;
	this.y = y;

	var fixDef = new b2FixtureDef();
	var bodyDef = new b2BodyDef();
	bodyDef.type = b2Body.b2_staticBody;

	fixDef.shape = new b2PolygonShape();
	fixDef.shape.SetAsBox(0.5, 0.7);
	fixDef.isSensor = true;

	bodyDef.position.Set(convertToMetres(this.x + 15), convertToMetres(this.y + 15));

	this.physicsBody = Globals.world.CreateBody(bodyDef);
	this.physicsBody.CreateFixture(fixDef);

	this.physicsBody.SetUserData({type: "imploEndOff", _this: this});

	var fixDefOn = new b2FixtureDef();
	var bodyDefOn = new b2BodyDef();
	bodyDefOn.type = b2Body.b2_staticBody;

	fixDefOn.shape = new b2PolygonShape();
	fixDefOn.shape.SetAsBox(0.1, 0.1);
	fixDefOn.isSensor = true;

	bodyDefOn.position.Set(convertToMetres(this.x + 15), convertToMetres(this.y + 15));

	this.physicsBodyOn = Globals.world.CreateBody(bodyDefOn);
	this.physicsBodyOn.CreateFixture(fixDefOn);

	this.physicsBodyOn.SetUserData({type: "imploEndOn", _this: this});
}

ImploEnd.prototype.draw = function (ctx) {
	ctx = ctx || Globals.context;
	ctx.strokeStyle = "rgb(30, 144, 179)";
	ctx.strokeRect(this.x, this.y, 30, 30);
};

function ExploEnd ( x, y ) {
	this.x = x;
	this.y = y;

	var fixDef = new b2FixtureDef();
	var bodyDef = new b2BodyDef();
	bodyDef.type = b2Body.b2_staticBody;

	fixDef.shape = new b2PolygonShape();
	fixDef.shape.SetAsBox(0.5, 0.7);
	fixDef.isSensor = true;

	bodyDef.position.Set(convertToMetres(this.x + 15), convertToMetres(this.y + 15));

	this.physicsBody = Globals.world.CreateBody(bodyDef);
	this.physicsBody.CreateFixture(fixDef);

	this.physicsBody.SetUserData({type: "exploEndOff", _this: this});

	var fixDefOn = new b2FixtureDef();
	var bodyDefOn = new b2BodyDef();
	bodyDefOn.type = b2Body.b2_staticBody;

	fixDefOn.shape = new b2PolygonShape();
	fixDefOn.shape.SetAsBox(0.1, 0.1);
	fixDefOn.isSensor = true;

	bodyDefOn.position.Set(convertToMetres(this.x + 15), convertToMetres(this.y + 15));

	this.physicsBodyOn = Globals.world.CreateBody(bodyDefOn);
	this.physicsBodyOn.CreateFixture(fixDefOn);

	this.physicsBodyOn.SetUserData({type: "exploEndOn", _this: this});
}

ExploEnd.prototype.draw = function (ctx) {
	ctx = ctx || Globals.context;
	ctx.strokeStyle = "rgb(255, 116, 19)";
	ctx.strokeRect(this.x, this.y, 30, 30);
};

function Spike(x, y) {
	this.x = x;
	this.y = y;

	this.image = document.createElement('canvas');
	this.image.width = 60;
	this.image.height = 20;
	this.imageContext = this.image.getContext('2d');

	this.imageContext.beginPath();
	for (i = 0; i < 7; ++i) {
		var pathX = i * 10;
		var pathY = (i % 2) ? 0 : 20;
		this.imageContext.lineTo(pathX, pathY);
	}
	this.imageContext.closePath();
	this.imageContext.fill();

	var fixDef = new b2FixtureDef();
	var bodyDef = new b2BodyDef();
	b2BodyDef.type = b2Body.b2_staticBody;

	fixDef.shape = new b2PolygonShape();
	fixDef.shape.SetAsBox(1, 0.33);

	bodyDef.position.Set(convertToMetres(this.x + 30), convertToMetres(this.y + 10));

	this.physicsBody = Globals.world.CreateBody(bodyDef);
	this.physicsBody.CreateFixture(fixDef);

	this.physicsBody.SetUserData({type: "spike", _this: this});
}

Spike.prototype.draw = function(ctx) {
	ctx = ctx || Globals.context;
	ctx.drawImage(this.image, this.x, this.y);
};

function TutorialObject (object) {
	this.type = object.type;

	var fixDef = new b2FixtureDef();
	var bodyDef = new b2BodyDef();
	b2BodyDef.type = b2Body.b2_staticBody;

	var x = convertToMetres(object.entity.x);
	var y = convertToMetres(object.entity.y);
	var w = convertToMetres(object.entity.w);
	var h = convertToMetres(object.entity.h);

	fixDef.shape = new b2PolygonShape();
	fixDef.shape.SetAsBox(w, h);
	fixDef.isSensor = true;

	bodyDef.position.Set(x, y);

	this.physicsBody = Globals.world.CreateBody(bodyDef);
	this.physicsBody.CreateFixture(fixDef);

	this.physicsBody.SetUserData({type: "tutorial", _this: this});
}