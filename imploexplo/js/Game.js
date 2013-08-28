var theGame;
function Game()
{
	theGame = this;

	this.levelData = {};
	this.levels = ["101", "102", "103", "104", "105", "106", "108", "202", "204"];
	this.levelId = 0;

	$.getJSON('levels/levels.json', function (data) {
		for (var i in data.levels) {
			theGame.levelData[data.levels[i].id] = data.levels[i];
		}
	});

	this.startTime = 0;
	this.endTime = 0;

	this.betweenLevel = false;
	this.timer = null;

	this.cc = new CharacterController();
}

Game.prototype.reset = function() {
	this.levelId = 0;
	this.betweenLevel = false;
};

Game.prototype.init = function(levelID)
{
	Globals.world = new b2World(new b2Vec2(0,50), true);
	this.level = new Level();

	this.level.load(this.levelData[levelID]);

	this.implo = this.level.implo;
	this.explo = this.level.explo;

	if (Globals.gameMode == Globals.GameMode.ONLINE) {
		if (playingAs === 'implo') {
			this.cc.p1 = this.implo;
			this.cc.p2 = this.explo;
		} else if (playingAs === 'explo') {
			this.cc.p2 = this.implo;
			this.cc.p1 = this.explo;
		}
	} else {
		this.cc.p1 = this.implo;
		this.cc.p2 = this.explo;
	}

	this.addContactListner();
	this.startTime = new Date().getTime();
};

Game.prototype.update = function()
{
	if (this.betweenLevel) {
		this.timer.update();

		if (this.timer.HasTimePassed()) {
			this.betweenLevel = false;
			$('#timeContainer').hide();
			$('#canvasContainer').show();
			this.init(this.levels[this.levelId]);
		}
	} else {
		Globals.world.Step(1/60, 10, 10);

		Globals.world.ClearForces();

		if (this.explo.currentColour == this.explo.colours.END &&
			this.implo.currentColour == this.implo.colours.END) {

			this.endTime = new Date().getTime();
			var timeTaken = this.endTime - this.startTime;

			this.levelId++;
			if (this.levelId >= this.levels.length) {
				$('#menu').show();
				$('#canvasContainer').hide();
				this.levelId = 0;
				gameOver = true;
				running = false;
				socket.emit('game_over');
			} else {
				$('.tutorial').each(function () {
					$(this).hide();
				});
				$('#timeContainer').show();
				$('#canvasContainer').hide();
				$('#time').text(timeTaken / 1000 + ' seconds');
				this.betweenLevel = true;
				this.timer = new Timer(1.5);
				$('#timeContainer').fadeOut(2000);
			}
		}

		this.level.update();
		this.cc.update();
	}
};

//Draws all of the game entities
Game.prototype.draw = function() {
	Globals.context.clearRect(0, 0, Globals.canvasWidth, Globals.canvasHeight);
	this.level.draw();
	if (this.cc.touchable) {
		this.cc.draw();
	}
};

//Wraps draw and update into one function
Game.prototype.run = function() {
	this.update();
	this.draw();
};

Game.prototype.addContactListner = function(callbacks)
{
	var listener = new Box2D.Dynamics.b2ContactListener();

	listener.BeginContact = function(contact)
	{
		if (contact.GetFixtureA().GetUserData() !== null)
		{
			if (contact.GetFixtureA().GetUserData().name == "foot")
			{
				if (contact.GetFixtureA().GetBody().GetUserData().name == "explo")
				{
					if (contact.GetFixtureB().GetBody().GetUserData()._this instanceof Spike) {
						theGame.explo.dead = true;
					} else if (contact.GetFixtureB().GetBody().GetUserData()._this instanceof Platform ||
								contact.GetFixtureB().GetBody().GetUserData()._this instanceof Implo) {
						theGame.explo.canJump = true;
						theGame.explo.baseEntity.externalForceApplied = false;
					}
				}
				if (contact.GetFixtureA().GetBody().GetUserData().name == "implo")
				{
					if (contact.GetFixtureB().GetBody().GetUserData()._this instanceof Spike) {
						theGame.implo.dead = true;
					} else if (contact.GetFixtureB().GetBody().GetUserData()._this instanceof Platform ||
								contact.GetFixtureB().GetBody().GetUserData()._this instanceof Explo) {
						theGame.implo.canJump = true;
						theGame.implo.baseEntity.externalForceApplied = false;
					}
				}
			}
		}

		if (!theGame.cc.touchable) {
			if (contact.GetFixtureB().GetBody().GetUserData()._this instanceof TutorialObject) {
				if (contact.GetFixtureA().GetBody().GetUserData().name == "implo") {
					switch (contact.GetFixtureB().GetBody().GetUserData()._this.type) {
						case "move":
							theGame.cc.showMoveTut('implo');
							break;
						case "jump":
							theGame.cc.showJumpTut('implo');
							break;
						case "implode":
							theGame.cc.showAbilityTut('implo');
							break;
					}
				} else if (contact.GetFixtureA().GetBody().GetUserData().name == "explo") {
					switch (contact.GetFixtureB().GetBody().GetUserData()._this.type) {
						case "move":
							theGame.cc.showMoveTut('explo');
							break;
						case "jump":
							theGame.cc.showJumpTut('explo');
							break;
						case "explode":
							theGame.cc.showAbilityTut('explo');
							break;
					}
				}
			}
		}

		if (contact.GetFixtureB().GetBody().GetUserData()._this instanceof ImploEnd)
		{
			if (contact.GetFixtureB().GetBody().GetUserData().type == "imploEndOn") {
				if (contact.GetFixtureA().GetBody().GetUserData().name == "implo")
				{
					theGame.implo.currentColour = theGame.implo.colours.END;
				}
			}
		}

		if (contact.GetFixtureB().GetBody().GetUserData()._this instanceof ExploEnd)
		{
			if (contact.GetFixtureB().GetBody().GetUserData().type == "exploEndOn") {
				if (contact.GetFixtureA().GetBody().GetUserData().name == "explo")
				{
					theGame.explo.currentColour = theGame.explo.colours.END;
				}
			}
		}
    };

    listener.EndContact = function(contact)
    {
		if (contact.GetFixtureA().GetUserData() !== null)
		{
			if (contact.GetFixtureB().GetBody().GetUserData()._this instanceof ImploEnd)
			{
				if (contact.GetFixtureB().GetBody().GetUserData().type == "imploEndOff") {
					if (contact.GetFixtureA().GetBody().GetUserData().name == "implo")
					{
						theGame.implo.currentColour = theGame.implo.colours.NORMAL;
					}
				}
			}

			if (contact.GetFixtureB().GetBody().GetUserData()._this instanceof ExploEnd)
			{
				if (contact.GetFixtureB().GetBody().GetUserData().type == "exploEndOff") {
					if (contact.GetFixtureA().GetBody().GetUserData().name == "explo")
					{
						theGame.explo.currentColour = theGame.explo.colours.NORMAL;
					}
				}
			}

			if (!theGame.cc.touchable) {
				if (contact.GetFixtureB().GetBody().GetUserData()._this instanceof TutorialObject) {
					if (contact.GetFixtureA().GetBody().GetUserData().name == "implo") {
						switch (contact.GetFixtureB().GetBody().GetUserData()._this.type) {
						case "move":
							theGame.cc.hideMoveTut('implo');
							break;
						case "jump":
							theGame.cc.hideJumpTut('implo');
							break;
						case "implode":
							theGame.cc.hideAbilityTut('implo');
							break;
						}
					} else if (contact.GetFixtureA().GetBody().GetUserData().name == "explo") {
						switch (contact.GetFixtureB().GetBody().GetUserData()._this.type) {
						case "move":
							theGame.cc.hideMoveTut('explo');
							break;
						case "jump":
							theGame.cc.hideJumpTut('explo');
							break;
						case "explode":
							theGame.cc.hideAbilityTut('explo');
							break;
						}
					}
				}
			}
		}
    };

    Globals.world.SetContactListener(listener);
};