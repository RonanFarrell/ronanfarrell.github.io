var carCon;
function CharacterController () {
	carCon = this;

	this.keysHeld = {
		a: false,
		d: false,
		left: false,
		right: false
	};

	this.p1 = null;
	this.p2 = null;

	this.p1Dir = 0;
	this.p2Dir = 0;

	this.touchable = 'createTouch' in document;

	if (this.touchable) {
		this.touches = [];
		this.touchCanvas = document.createElement("canvas");
		this.touchCanvas.width = window.innerWidth;
		this.touchCanvas.height = window.innerHeight;
		this.touchCanvas.addEventListener( 'touchstart', this.onTouchStart, false );
		this.touchCanvas.addEventListener( 'touchmove', this.onTouchMove, false );
		this.touchCanvas.addEventListener( 'touchend', this.onTouchEnd, false );
		document.body.appendChild(this.touchCanvas);
		this.touchCanvasContext = this.touchCanvas.getContext('2d');

		this.leftTouchId = -1;
		this.leftTouchStart = new b2Vec2(0, 0);
		this.leftTouchPos = new b2Vec2(0, 0);
		this.leftDir = 0;

		this.rightTouchId = -1;
		this.rightTouchStart = new b2Vec2(0, 0);
		this.rightTouchPos = new b2Vec2(0, 0);
		this.swipeDistance = 40;

	} else {

		$('body').append('<div id="tutA" class="tutorial">A</div>');
		$('body').append('<div id="tutD" class="tutorial">D</div>');
		$('body').append('<div id="tutW" class="tutorial">W</div>');
		$('body').append('<div id="tutS" class="tutorial">S</div>');

		$('body').append('<div id="tutLeft" class="tutorial arrow left"></div>');
		$('body').append('<div id="tutRight" class="tutorial arrow right"></div>');
		$('body').append('<div id="tutUp" class="tutorial arrow"></div>');
		$('body').append('<div id="tutDown" class="tutorial arrow down"></div>');

		$('.tutorial').each(function () {
			$(this).hide();
		});

		$(window).keydown(function (e) {
			switch (e.which) {
				case 37:
					e.preventDefault();
					carCon.keysHeld.left = true;
					break;
				case 39:
					e.preventDefault();
					carCon.keysHeld.right = true;
					break;
				case 38:
					e.preventDefault();
					carCon.p1.jump();
					break;
				case 40:
					e.preventDefault();
					if (Globals.gameMode == Globals.GameMode.ONLINE) {
						if (carCon.p1 instanceof Implo) {
							if (carCon.p1.canImplode) {
								socket.emit('implode');
							}
						} else if (carCon.p1 instanceof Explo) {
							if (carCon.p1.canExplode) {
								socket.emit('explode');
							}
						}
					}
					carCon.p1.uniqueAbility(carCon.p2);
					break;
				case 65:
					carCon.keysHeld.a = true;
					break;
				case 68:
					carCon.keysHeld.d = true;
					break;
				case 87:
					if (Globals.gameMode != Globals.GameMode.ONLINE) {
						carCon.p2.jump();
					}
					break;
				case 83:
					if (Globals.gameMode != Globals.GameMode.ONLINE) {
						carCon.p2.uniqueAbility(carCon.p1);
					}
					break;
			}
		});

		$(window).keyup(function (e) {
			switch (e.which) {
				case 37:
					carCon.keysHeld.left = false;
					break;
				case 39:
					carCon.keysHeld.right = false;
					break;
				case 65:
					carCon.keysHeld.a = false;
					break;
				case 68:
					carCon.keysHeld.d = false;
					break;
			}
		});
	}
}

CharacterController.prototype.update = function() {
	if (this.touchable) {
		this.p1Dir = this.leftDir;

		for (var i in this.touches) {
			var touch = this.touches[i];

			if (touch.identifier == this.rightTouchId) {
				if ((touch.clientY - this.rightTouchStart.y) < -this.swipeDistance) {
					this.p1.jump();
				} else if ((touch.clientY - this.rightTouchStart.y) > this.swipeDistance) {
					if (Globals.gameMode == Globals.GameMode.ONLINE) {
						if (this.p1 instanceof Implo) {
							if (this.p1.canImplode) {
								socket.emit('implode');
							}
						} else if (this.p1 instanceof Explo) {
							if (this.p1.canExplode) {
								socket.emit('explode');
							}
						}
					}
					this.p1.uniqueAbility(this.p2);
				}
			}
		}

	} else {
		if (this.keysHeld.left) {
			this.p1Dir = -1;
		} else if (this.keysHeld.right) {
			this.p1Dir = 1;
		} else if (!this.keysHeld.left && !this.keysHeld.right) {
			this.p1Dir = 0;
		}
		var x = convertToPixels(this.p1.getX()) + $('#canvasContainer').offset().left;
		var y = convertToPixels(this.p1.getY()) + $('#canvasContainer').offset().top;
		$('#tutLeft').offset({ top: y - 15, left: x - 50});
		$('#tutRight').offset({ top: y - 15, left: x + 20});
		$('#tutUp').offset({ top: y - 50, left: x - 15});
		$('#tutDown').offset({ top: y - 50, left: x - 15});
		if (Globals.gameMode != Globals.GameMode.ONLINE) {
			if (this.keysHeld.a) {
				this.p2Dir = -1;
			} else if (this.keysHeld.d) {
				this.p2Dir = 1;
			} else if (!this.keysHeld.a && !this.keysHeld.d) {
				this.p2Dir = 0;
			}
			this.p2.move(this.p2Dir);

			x = convertToPixels(this.p2.getX()) + $('#canvasContainer').offset().left;
			y = convertToPixels(this.p2.getY()) + $('#canvasContainer').offset().top;
			$('#tutA').offset({ top: y - 15, left: x - 50});
			$('#tutD').offset({ top: y - 15, left: x + 20});
			$('#tutW').offset({ top: y - 50, left: x - 15});
			$('#tutS').offset({ top: y - 50, left: x - 15});
		} else {
			// $('#tutA').remove();
			// $('#tutD').remove();
			// $('#tutS').remove();
			// $('#tutW').remove();
		}
	}

	this.p1.move(this.p1Dir);
};

CharacterController.prototype.draw = function() {
	if (this.touchable) {
		this.touchCanvasContext.clearRect(0, 0, this.touchCanvas.width, this.touchCanvas.height);
		if (this.leftTouchId > -1) {
			drawCircle(this.leftTouchStart.x, this.leftTouchStart.y, 35, 6, this.p1.colours.NORMAL, this.touchCanvasContext);
			drawCircle(this.leftTouchStart.x, this.leftTouchStart.y, 60, 2, this.p1.colours.NORMAL, this.touchCanvasContext);
			drawCircle(this.leftTouchPos.x, this.leftTouchPos.y, 40, 2, this.p1.colours.NORMAL, this.touchCanvasContext);
		} if (this.rightTouchId > -1) {
			drawCircle(this.rightTouchPos.x, this.rightTouchPos.y, 40, 2, this.p1.colours.NORMAL, this.touchCanvasContext);
		}
	}
};

CharacterController.prototype.onTouchStart = function(e) {

	for (var i in e.changedTouches) {
		var touch = e.changedTouches[i];

		if (carCon.leftTouchId < 0 && touch.clientX < carCon.touchCanvas.width / 2) {
			carCon.leftTouchId = touch.identifier;
			carCon.leftTouchStart.Set(touch.clientX, touch.clientY);
			carCon.leftTouchPos.Set(carCon.leftTouchStart);
		} else if (carCon.rightTouchId < 0 && touch.clientX > carCon.touchCanvas.width / 2) {
			carCon.rightTouchId = touch.identifier;
			carCon.rightTouchStart.Set(touch.clientX, touch.clientY);
			carCon.rightTouchPos.Set(touch.clientX, touch.clientY);
		}
	}

	carCon.touches = e.touches;
};

CharacterController.prototype.onTouchMove = function(e) {
	e.preventDefault();

	for (var i in e.changedTouches) {
		var touch = e.changedTouches[i];

		if (touch.identifier == carCon.leftTouchId) {
			carCon.leftTouchPos.Set(touch.clientX, carCon.leftTouchStart.y);
			var diff = carCon.leftTouchPos.x - carCon.leftTouchStart.x;
			carCon.leftDir = 0;

			if (Math.abs(diff) >= 20) {
				carCon.leftDir = diff / Math.abs(diff);
			}
		} else if (touch.identifier == carCon.rightTouchId) {
			carCon.rightTouchPos.Set(carCon.rightTouchStart.x, touch.clientY);
		}
	}
};

CharacterController.prototype.onTouchEnd = function(e) {
	carCon.touches = e.touches;

	for (var i in e.changedTouches) {
		var touch = e.changedTouches[i];

		if (touch.identifier == carCon.leftTouchId) {
			carCon.leftTouchId = -1;
			carCon.leftDir = 0;
		} else if (touch.identifier == carCon.rightTouchId) {
			carCon.rightTouchId = -1;
		}
	}
};

CharacterController.prototype.hideMoveTut = function(player) {
	if (player === this.p1.name) {
		$('#tutLeft').fadeOut();
		$('#tutRight').fadeOut();
	} else {
		$('#tutA').fadeOut();
		$('#tutD').fadeOut();
	}
};

CharacterController.prototype.hideJumpTut = function(player) {
	if (player === this.p1.name) {
		$('#tutUp').fadeOut();
	} else {
		$('#tutW').fadeOut();
	}
};

CharacterController.prototype.hideAbilityTut = function(player) {
	if (player === this.p1.name) {
		$('#tutDown').fadeOut();
	} else {
		$('#tutS').fadeOut();
	}
};

CharacterController.prototype.showMoveTut = function(player) {
	if (player === this.p1.name) {
		$('#tutLeft').fadeIn();
		$('#tutRight').fadeIn();
	} else {
		$('#tutA').fadeIn();
		$('#tutD').fadeIn();
	}
};

CharacterController.prototype.showJumpTut = function(player) {
	if (player === this.p1.name) {
		$('#tutUp').fadeIn();
	} else {
		$('#tutW').fadeIn();
	}
};

CharacterController.prototype.showAbilityTut = function(player) {
	if (player === this.p1.name) {
		$('#tutDown').fadeIn();
	} else {
		$('#tutS').fadeIn();
	}
};