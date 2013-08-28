function Level ()
{
	this.platforms = [];
	this.implo = null;
	this.explo = null;
	this.imploEnd = null;
	this.exploEnd = null;
	this.spikes = [];
	this.tutorialObjects = [];
	this.id = null;

	this.width = 900;
	this.height = 600;

	this.staticEntityImage = document.createElement('canvas');
	this.staticEntityImage.width = this.width;
	this.staticEntityImage.height = this.height;
	this.seiContext = this.staticEntityImage.getContext('2d');
}

Level.prototype.load = function(plevelData)
{
	this.id = plevelData.id;
	var i;
	for (i in plevelData['platforms']) {
		var p = plevelData['platforms'][i];
		var platform = new Platform(p.x, p.y, p.w, p.h);
		this.platforms.push(platform);
		platform.draw(this.seiContext);
	}

	if (plevelData['spikes'] !== 'undefined') {
		for (i in plevelData['spikes']) {
			var s = plevelData['spikes'][i];
			var spike = new Spike(s.x, s.y);
			this.spikes.push(spike);
			spike.draw(this.seiContext);
		}
	}

	if (plevelData['tutorialObjects'] !== 'undefined') {
		for (i in plevelData['tutorialObjects']) {
			this.tutorialObjects.push( new TutorialObject( plevelData['tutorialObjects'][i] ));
		}
	}

	this.implo = new Implo(plevelData['implo'].x, plevelData['implo'].y);
	this.explo = new Explo(plevelData['explo'].x, plevelData['explo'].y);
	this.imploEnd = new ImploEnd(plevelData['imploEnd'].x, plevelData['imploEnd'].y);
	this.exploEnd = new ExploEnd(plevelData['exploEnd'].x, plevelData['exploEnd'].y);
	this.imploEnd.draw(this.seiContext);
	this.exploEnd.draw(this.seiContext);
};

Level.prototype.update = function()
{
	this.implo.update();
	this.explo.update();
};

Level.prototype.draw = function()
{
	this.implo.draw();
	this.explo.draw();
	Globals.context.drawImage(this.staticEntityImage, 0, 0);
};