function Entity(xPos, yPos)
{
	this.initialX = xPos;
	this.initialY = yPos;

	this.fixDef = new b2FixtureDef();
	this.fixDef.density = 1.0;
	this.fixDef.friction = 1.0;
	this.fixDef.restitution = 0.0;

	this.bodyDef = new b2BodyDef();
	this.bodyDef.type = b2Body.b2_dynamicBody;

	this.fixDef.shape = new b2PolygonShape();
	this.fixDef.shape.SetAsBox(0.5, 0.5);

	this.bodyDef.position.Set(convertToMetres(xPos) + 0.5, convertToMetres(yPos) + 0.5);
	this.physicsBody = Globals.world.CreateBody(this.bodyDef);

	this.physicsBody.CreateFixture(this.fixDef);

	this.physicsBody.SetFixedRotation(true);

	// Setup the foot sensor
	var vertices = [];
	vertices[0] = new b2Vec2(-0.2, 0.6);
	vertices[1] = new b2Vec2(0.2, 0.6);
	vertices[2] = new b2Vec2(0.2, 0.5);
	vertices[3] = new b2Vec2(-0.2, 0.5);

	this.fixDefSensor = new b2FixtureDef();
	this.fixDefSensor.shape = new b2PolygonShape();
	this.fixDefSensor.shape.SetAsArray(vertices);
	this.fixDefSensor.isSensor = true;

	this.footSensor = this.physicsBody.CreateFixture(this.fixDefSensor);
	this.footSensor.SetUserData({name: "foot"});

	this.maxSpeed = 8;
	this.force = 50;
	this.jumpForce = -19;

	this.canJump = true;
	this.moving = false;
	this.externalForceApplied = false;
}


Entity.prototype.move = function(direction)
{
	if (!this.externalForceApplied) {
		if (direction === 0) {
			if (this.moving) {
				this.stopMoving();
			}
		} else {
			this.physicsBody.GetFixtureList().m_next.m_friction = 0;
			this.physicsBody.ApplyForce(new b2Vec2(direction*this.calcForceToMove(), 0), this.physicsBody.GetWorldCenter());
			this.moving = true;
		}
	} else if (Math.abs(this.physicsBody.GetLinearVelocity().x) < 2) {
		if (direction === 0) {
			if (this.moving) {
				this.stopMoving();
			}
		} else {
			this.physicsBody.GetFixtureList().m_next.m_friction = 0;
			this.physicsBody.ApplyForce(new b2Vec2(direction*this.calcForceToMove(), 0), this.physicsBody.GetWorldCenter());
			this.moving = true;
		}
	}
};

// Function to make the entity jump.
Entity.prototype.jump = function()
{
	this.physicsBody.ApplyImpulse(new b2Vec2(0, this.jumpForce), this.physicsBody.GetWorldCenter());
};

// Stops the body moving when one of the movement keys is released
Entity.prototype.stopMoving = function()
{
	if (this.moving) {
		this.physicsBody.GetFixtureList().m_next.m_friction = 1;

		if (this.physicsBody.GetLinearVelocity().y < 0)
			this.physicsBody.SetLinearVelocity(new b2Vec2(0, 0));
		else
			this.physicsBody.SetLinearVelocity(new b2Vec2(0,this.physicsBody.GetLinearVelocity().y));
		this.moving = false;
	}
};

// Function that calculates how much force to apply based on the
// current velocity of the body
Entity.prototype.calcForceToMove = function()
{
	var xVel = Math.abs(this.physicsBody.GetLinearVelocity().x);
	var forceToApply = this.force * (this.maxSpeed - xVel);
	return forceToApply;
};

Entity.prototype.applyImpulse = function(impulse)
{
	this.physicsBody.ApplyImpulse(impulse, this.physicsBody.GetWorldCenter());
};

Entity.prototype.getVel = function()
{
	return this.physicsBody.GetLinearVelocity();
};
Entity.prototype.getPos = function()
{
	return this.physicsBody.GetWorldCenter();
};

Entity.prototype.respawn = function() {
	this.physicsBody.SetPosition(new b2Vec2(convertToMetres(this.initialX) + 0.5, convertToMetres(this.initialY) + 0.5));
};

// Implo

function Implo (xPos, yPos)
{
	this.name = 'implo';
	this.colours = {
		NORMAL : "rgb(30, 144, 179)",
		END : "rgb(200, 200, 200)"
	}; this.currentColour = this.colours.NORMAL;
	this.animStates = {
		NORMAL : 0,
		JUMPING_IN : 1,
		JUMPING_OUT : 2,
		IMPLODING_IN : 3,
		IMPLODING_OUT : 4
	};
	this.currentState = this.animStates.NORMAL;

	this.baseEntity = new Entity(xPos, yPos);
	this.baseEntity.physicsBody.SetSleepingAllowed(false);
	this.baseEntity.physicsBody.SetUserData({name: "implo", _this: this});

	this.i_width = 1;
	this.i_height = 1;
	this.normalWidth = this.i_width;
	this.normalHeight = this.i_height;
	this.minWidth = 0.7;
	this.maxHeight = 1.5;

	this.jumpInRate = 0.05;
	this.jumpOutRate = 0.02;

	this.implodeInRate = 0.10;
	this.implodeOutRate = 0.1;
	this.implodeWidth = 0.5;

	this.canJump = true;
	this.canImplode = true;
	this.implodeCooldown = null;
	this.cooldownTime = 0.7;
	this.dead = false;
}

Implo.prototype.move = function(direction)
{
	this.baseEntity.move(direction);
};

Implo.prototype.jump = function()
{
	if (this.canJump)
	{
		this.baseEntity.jump();
		this.canJump = false;
		this.currentState = this.animStates.JUMPING_IN;
	}
};

Implo.prototype.stopMoving = function()
{
	this.baseEntity.stopMoving();
};

Implo.prototype.getX = function()
{
	return this.baseEntity.physicsBody.GetWorldCenter().x;
};

Implo.prototype.getY = function()
{
	return this.baseEntity.physicsBody.GetWorldCenter().y;
};

Implo.prototype.applyImpulse = function(impulse)
{
	this.baseEntity.physicsBody.ApplyImpulse(impulse, this.baseEntity.physicsBody.GetWorldCenter());
};

Implo.prototype.draw = function()
{
	if (this.currentState == this.animStates.JUMPING_IN)
	{
		if (this.i_width > this.minWidth)
			this.i_width -= this.jumpInRate;
		if (this.i_height < this.maxHeight)
			this.i_height += this.jumpInRate;
		if (this.i_width <= this.minWidth && this.i_height >= this.maxHeight)
			this.currentState = this.animStates.JUMPING_OUT;
	}
	else if (this.currentState == this.animStates.JUMPING_OUT)
	{
		if (this.i_width < this.normalWidth)
			this.i_width += this.jumpOutRate;
		if (this.i_height > this.normalHeight)
			this.i_height -= this.jumpInRate;
		if (this.i_width >= this.normalWidth && this.i_height <= this.normalHeight)
		{
			this.i_width = this.normalWidth;
			this.i_height = this.normalHeight;
			this.currentState = this.animStates.NORMAL;
		}
	}
	if (this.currentState == this.animStates.IMPLODING_IN)
	{
		if (this.i_width > this.implodeWidth)
			this.i_width -= this.implodeInRate;
		if (this.i_height > this.implodeWidth)
			this.i_height -= this.implodeInRate;
		if (this.i_width <= this.implodeWidth && this.i_height <= this.implodeWidth)
			this.currentState = this.animStates.IMPLODING_OUT;
	}
	else if (this.currentState == this.animStates.IMPLODING_OUT)
	{
		this.i_width += this.implodeOutRate;
		this.i_height += this.implodeOutRate;
		if (this.i_width >= this.normalWidth)
		{
			this.i_width = this.normalWidth;
			this.i_height = this.normalHeight;
			this.currentState = this.animStates.NORMAL;
		}
	}
	drawRect(this.getX(), this.getY(), this.i_width, this.i_height, this.currentColour);
};

Implo.prototype.uniqueAbility = function(explo)
{
	if (this.canImplode) {
		this.canImplode = false;
		this.implodeCooldown = new Timer(this.cooldownTime);

		this.currentState = this.animStates.IMPLODING_IN;

		var myPos = new b2Vec2(this.getX(), this.getY());
		var exploPos = new b2Vec2(explo.getX(), explo.getY());

		myPos.Subtract(exploPos);

		var strength = 26;
		if (myPos.Length() < 10)
		{
			myPos.Normalize();
			myPos.Multiply(strength);

			if ( (Math.floor(this.getY()) - Math.floor(explo.getY())) < 0.5 )
				myPos.y = -14;

			explo.applyImpulse(myPos);
			explo.baseEntity.externalForceApplied = true;
		}
		playSound('implo');
	}
};

Implo.prototype.getVel = function() {
	return this.baseEntity.getVel();
};
Implo.prototype.getPos = function(){
	return this.baseEntity.getPos();
};

Implo.prototype.setState = function(state) {
	this.currentState = state;
};

Implo.prototype.update = function() {
	if (this.dead) {
		this.baseEntity.respawn();
		this.dead = false;
	}

	if (!this.canImplode) {
		this.implodeCooldown.update();
		this.canImplode = this.implodeCooldown.HasTimePassed();
	}
};
// End Implo

// Explo
function Explo (xPos, yPos)
{
	this.name = 'explo';

	this.colours = {
		NORMAL : "rgb(255, 116, 19)",
		END : "rgb(200, 200, 200)"
	}; this.currentColour = this.colours.NORMAL;

	this.NORMAL = 0;
	this.JUMPING_IN = 1;
	this.JUMPING_OUT = 2;
	this.EXPLODING_IN = 3;
	this.EXPLODING_OUT = 4;
	this.currentState = this.NORMAL;

	this.baseEntity = new Entity(xPos, yPos);
	this.baseEntity.physicsBody.SetSleepingAllowed(false);
	this.baseEntity.physicsBody.SetUserData({name: "explo", _this: this});

	this.canJump = true;

	this.e_width = 1;
	this.e_height = 1;
	this.normalWidth = this.e_width;
	this.normalHeight = this.e_height;
	this.minWidth = 0.7;
	this.maxWidth = 1.7;

	this.jumpInRate = 0.05;
	this.jumpOutRate = 0.02;
	this.anim_maxJumpHeight = 1.5;

	this.explodeInRate = 0.08;
	this.explodeOutRate = 0.08;

	this.dead = false;

	this.canExplode = true;
	this.explodeCooldown = null;
	this.cooldownTime = 0.7;
}

Explo.prototype.move = function(direction)
{
	this.baseEntity.move(direction);
};

Explo.prototype.jump = function()
{
	if (this.canJump)
	{
		this.baseEntity.jump();
		this.canJump = false;
		this.currentState = this.JUMPING_IN;
	}
};

Explo.prototype.stopMoving = function()
{
	this.baseEntity.stopMoving();
};

Explo.prototype.getX = function()
{
	return this.baseEntity.physicsBody.GetWorldCenter().x;
};

Explo.prototype.getY = function()
{
	return this.baseEntity.physicsBody.GetWorldCenter().y;
};

Explo.prototype.applyImpulse = function(impulse)
{
	this.baseEntity.physicsBody.ApplyImpulse(impulse, this.baseEntity.physicsBody.GetWorldCenter());
};

Explo.prototype.draw = function()
{
	if (this.currentState == this.JUMPING_IN)
	{
		if (this.e_width > this.minWidth)
			this.e_width -= this.jumpInRate;
		if (this.e_height < this.anim_maxJumpHeight)
			this.e_height += this.jumpInRate;
		if (this.e_width <= this.minWidth && this.e_height >= this.anim_maxJumpHeight)
		{
			this.currentState = this.JUMPING_OUT;
		}
	}
	else if (this.currentState == this.JUMPING_OUT)
	{
		if (this.e_width < this.normalWidth)
			this.e_width += this.jumpOutRate;
		if (this.e_height > this.normalHeight)
			this.e_height -= this.jumpInRate;
		if (this.e_width >= this.normalWidth && this.e_height <= this.normalHeight)
		{
			this.e_width = this.normalWidth;
			this.e_height = this.normalHeight;
			this.currentState = this.NORMAL;
		}
	}
	if (this.currentState == this.EXPLODING_IN)
	{
		this.e_width -= this.explodeInRate;
		this.e_height -= this.explodeInRate;
		if (this.e_width <= this.normalWidth)
		{
			this.e_width = this.normalWidth;
			this.e_height = this.normalHeight;
			this.currentState = this.NORMAL;
		}
	}
	else if (this.currentState == this.EXPLODING_OUT)
	{
		this.e_width += this.explodeOutRate;
		this.e_height += this.explodeOutRate;
		if (this.e_width >= this.maxWidth)
		{
			this.currentState = this.EXPLODING_IN;
		}
	}

	drawRect(this.getX(), this.getY(), this.e_width, this.e_height, this.currentColour);
};

Explo.prototype.uniqueAbility = function(implo)
{
	if (this.canExplode) {
		this.canExplode = false;
		this.explodeCooldown = new Timer(this.cooldownTime);

		this.currentState = this.EXPLODING_OUT;
		this.e_width = this.normalWidth;
		this.e_height = this.normalHeight;

		var myPos = new b2Vec2(this.getX(), this.getY());
		var imploPos = new b2Vec2(implo.getX(), implo.getY());

		imploPos.Subtract(myPos);

		var strength = 22;

		if (imploPos.Length() < 10)
		{
			imploPos.Normalize();
			imploPos.Multiply(strength);

			if ( (Math.floor(this.getY()) - Math.floor(implo.getY())) < 0.5)
			{
				imploPos.y = -14;
			}

			implo.applyImpulse(imploPos);
			implo.baseEntity.externalForceApplied = true;
		}
		playSound('explo');
	}
};

Explo.prototype.getVel = function() {
	return this.baseEntity.getVel();
};

Explo.prototype.getPos = function(){
	return this.baseEntity.getPos();
};

Explo.prototype.setState = function(state) {
	this.currentState = state;
};

Explo.prototype.update = function() {
	if (this.dead) {
		this.baseEntity.respawn();
		this.dead = false;
	}

	if (!this.canExplode) {
		this.explodeCooldown.update();
		this.canExplode = this.explodeCooldown.HasTimePassed();
	}
};
// End Explo