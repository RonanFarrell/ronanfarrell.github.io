var CREATE = {
	PLATFORM	: 1,
	IMPLO		: 2,
	EXPLO		: 3,
	IMPLO_END	: 4,
	EXPLO_END	: 5,
	SPIKE		: 6,
	TUT_MOVE	: 7,
	TUT_JUMP	: 8,
	TUT_IMPLODE : 9,
	TUT_EXPLODE : 10
};
var entity = CREATE.PLATFORM;

var tool_Create = true;
var tool_Select = false;
var tool_Remove = false;

var levelData = {};
var levelId;

var socket;
var url = '127.0.0.1';
var port = 8888;

function entityXY (x, y) {
	this.x = x;
	this.y = y;
}

function entityXYWH (x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}

function tutorialObj (entity, type) {
	this.entity = entity;
	this.type = type;
}

var numPlatforms	= 0;
var numSpikes		= 0;
var numTuts			= 0;

jQuery(function ($) {
	socket = io.connect( url + ":" + port );

	levelId = prompt("Level ID");

	$('#canvasContainer').hide();
	$('#stopTest').hide();

	createGrid(30);

	$('.entitySelect').click(function () {
		$('.entitySelect').each(function () {
			$(this).removeClass('active');
		});

		if ($(this).text() === 'Platform') {
			entity = CREATE.PLATFORM;
		} else if ($(this).text() === 'Implo') {
			entity = CREATE.IMPLO;
		} else if ($(this).text() === 'Explo') {
			entity = CREATE.EXPLO;
		} else if ($(this).text() === 'Implo End') {
			entity = CREATE.IMPLO_END;
		} else if ($(this).text() === 'Explo End') {
			entity = CREATE.EXPLO_END;
		} else if ($(this).text() === 'Spike') {
			entity = CREATE.SPIKE;
		} else if ($(this).text() === 'Tutorial Move') {
			entity = CREATE.TUT_MOVE;
		} else if ($(this).text() === 'Tutorial Jump') {
			entity = CREATE.TUT_JUMP;
		} else if ($(this).text() === 'Tutorial Implode') {
			entity = CREATE.TUT_IMPLODE;
		} else if ($(this).text() === 'Tutorial Explode') {
			entity = CREATE.TUT_EXPLODE;
		}

		$(this).addClass('active');
	});

	$('.tool').click(function () {
		$('.tool').each(function () {
			$(this).removeClass('active');
		});

		tool_Create = false;
		tool_Select = false;
		tool_Remove = false;

		if ($(this).text() === 'Create') {
			tool_Create = true;
		} else if ($(this).text() === 'Select') {
			tool_Select = true;
		} else if ($(this).text() === 'Remove') {
			tool_Remove = true;
		}

		$(this).addClass('active');
	});

	$('#toggleGrid').click(function () {
		if ($(this).hasClass('active')) {
			$('#gridContainer').hide();
			$(this).removeClass('active');
		} else {
			$('#gridContainer').show();
			$(this).addClass('active');
		}
	});

	$('#test').click(function () {
		StartTesting();
	});

	$('#stopTest').click(function () {
		$(this).hide();
		$('#test').show();
		$('#canvasContainer').hide();
		$('#gameEditorScreen').show();
	});

	$('#gameEditorScreen').click(function (e) {
		var x = e.pageX,
			y = e.pageY;

		if (tool_Create) {
			$('.gameEntity').each(function () { $(this).removeClass('currentEntity'); });

			switch (entity) {
				case CREATE.PLATFORM:
					CreatePlatform(x, y);
					break;
				case CREATE.IMPLO:
					CreateImplo(x, y);
					break;
				case CREATE.EXPLO:
					CreateExplo(x, y);
					break;
				case CREATE.IMPLO_END:
					CreateImploEnd(x, y);
					break;
				case CREATE.EXPLO_END:
					CreateExploEnd(x, y);
					break;
				case CREATE.SPIKE:
					CreateSpike(x, y);
					break;
				case CREATE.TUT_MOVE:
					CreateTutorial(x, y, 'move');
					break;
				case CREATE.TUT_JUMP:
					CreateTutorial(x, y, 'jump');
					break;
				case CREATE.TUT_IMPLODE:
					CreateTutorial(x, y, 'implode');
					break;
				case CREATE.TUT_EXPLODE:
					CreateTutorial(x, y, 'explode');
					break;
				default:
					break;
			}
		}

		if (tool_Remove) {
			$('.gameEntity').click(function () {
				$(this).remove();
			});
		}
	}); // end gameEditorScreen click
});

function createGrid(size) {
    var ratioW = Math.floor(900/size),
        ratioH = Math.floor(600/size);

    var parent = $('<div />', {
        class: 'grid',
        width: ratioW  * size,
        height: ratioH  * size
    }).addClass('grid').appendTo('#gridContainer');

    for (var i = 0; i < ratioH; i++) {
        for(var p = 0; p < ratioW; p++){
            $('<div />', {
                width: size - 1,
                height: size - 1
            }).appendTo(parent);
        }
    }

    $('#gridContainer').hide();
}

function CreatePlatform (x, y, w , h) {
	w = w || 30;
	h = h || 30;
	$( '#gameEditorScreen' ).append('<div id="platform'+numPlatforms+'" class="platform gameEntity currentEntity"></div>');
	$('#platform'+numPlatforms).draggable().resizable().offset({ top: y, left: x}).width(w).height(h);
	numPlatforms++;
}

function CreateImplo (x, y) {
	$('#implo').remove();
	$('#gameEditorScreen').append('<div id="implo" class="gameEntity implo currentEntity"></div>');
	$('#implo').offset({ top: y, left: x}).draggable();
}

function CreateExplo (x, y) {
	$('#explo').remove();
	$('#gameEditorScreen').append('<div id="explo" class="gameEntity explo currentEntity"></div>');
	$('#explo').offset({ top: y, left: x}).draggable();
}

function CreateImploEnd (x, y) {
	$('#imploEnd').remove();
	$('#gameEditorScreen').append('<div id="imploEnd" class="gameEntity imploEnd currentEntity"></div>');
	$('#imploEnd').offset({ top: y, left: x}).draggable();
}

function CreateExploEnd (x, y) {
	$('#exploEnd').remove();
	$('#gameEditorScreen').append('<div id="exploEnd" class="gameEntity exploEnd currentEntity"></div>');
	$('#exploEnd').offset({ top: y, left: x}).draggable();
}

function CreateSpike (x, y) {
	$('#gameEditorScreen').append('<div id="spike'+numSpikes+'" class="spike gameEntity currentEntity"></div>');
	$('#spike'+numSpikes).draggable().offset({ top: y, left: x});
	numSpikes++;
}

function CreateTutorial(x, y, type, w, h) {
	w = w || 30;
	h = h || 30;
	$('#gameEditorScreen').append('<div id="tut'+numTuts+'" class="tutorial gameEntity '+type+'"></div>');
	$('#tut'+numTuts).draggable().resizable().offset({ top: y, left: x}).width(w).height(h);
	numTuts++;
}

function SaveLevel () {
	levelData['id'] = levelId;

	levelData['platforms'] = [];
	$('.platform').each( function () { levelData['platforms'].push(SerialiseEntityXYWH($(this))); });

	levelData['spikes'] = [];
	$('.spike').each( function () { levelData['spikes'].push(SerialiseEntityXY($(this))); });

	levelData['tutorialObjects'] = [];
	$('.tutorial').each( function () {
		levelData['tutorialObjects'].push(SerialiseTutorialEntity($(this)));
	});

	levelData['implo'] = SerialiseEntityXY($('.implo'));
	levelData['explo'] = SerialiseEntityXY($('.explo'));
	levelData['imploEnd'] = SerialiseEntityXY($('.imploEnd'));
	levelData['exploEnd'] = SerialiseEntityXY($('.exploEnd'));

	socket.emit('saveLevel', levelId, JSON.stringify(levelData));
}

function SerialiseEntityXYWH (entity) {
	var id = entity.attr('id');
	var x = parseInt(document.getElementById(id).style.left, 10);
	var y = parseInt(document.getElementById(id).style.top, 10);
	var w = entity.width() / 2;
	var h = entity.height() / 2;
	return new entityXYWH(x + w, y + h, w, h);
}

function SerialiseEntityXY (entity) {
	var id = entity.attr('id');
	var x = parseInt(document.getElementById(id).style.left, 10);
	var y = parseInt(document.getElementById(id).style.top, 10);
	return new entityXY(x, y);
}

function SerialiseTutorialEntity (entity) {
	var obj = SerialiseEntityXYWH(entity);
	var type;
	if (entity.hasClass('move')) { type = 'move'; }
	else if (entity.hasClass('jump')) { type = 'jump'; }
	else if (entity.hasClass('implode')) { type = 'implode'; }
	else if (entity.hasClass('explode')) { type = 'explode'; }
	else { type = null; }
	return new tutorialObj(obj, type);
}

function StartTesting () {
	SaveLevel();
	$(this).hide();
	$('#gameEditorScreen').hide();
	$('#stopTest').show();
	$('#canvasContainer').show();

	$.getJSON('../levels/levels.json', function (data) {
		for (var i in data.levels) {
			theGame.levelData[data.levels[i].id] = data.levels[i];
		}
		game.init(levelId);
		if ( !running ) { run(); }
		Globals.gameMode = Globals.GameMode.LOCAL;
	});
}

function LoadLevel (data) {
	var offsetX = $('#gameEditorScreen').offset().left;
	var offsetY = $('#gameEditorScreen').offset().top;

	var i;
	if (data['platforms'] !== 'undefined') {
		for (i in data['platforms']) {
			var p = data['platforms'][i];
			CreatePlatform(p.x - p.w + offsetX, p.y - p.h + offsetY, p.w * 2, p.h * 2);
		}
	}

	if (data['tutorialObjects'] !== 'undefined') {
		for (i in data['tutorialObjects']) {
			var t = data['tutorialObjects'][i];
			CreateTutorial( t.entity.x - t.entity.w + offsetX,
							t.entity.y - t.entity.h + offsetY,
							t.type,
							t.entity.w * 2,
							t.entity.h * 2);
		}
	}

	if (data['spikes'] !== 'undefined') {
		for (i in data['spikes']) {
			var s = data['spikes'][i];
			CreateSpike(s.x, s.y);
		}
	}

	CreateImplo(data['implo'].x + offsetX, data['implo'].y + offsetY);
	CreateExplo(data['explo'].x + offsetX, data['explo'].y + offsetY);

	CreateImploEnd(data['imploEnd'].x + offsetY, data['imploEnd'].y + offsetY);
	CreateExploEnd(data['exploEnd'].x + offsetY, data['exploEnd'].y + offsetY);
}