var running		= false,
	game		= new Game(),
	playingAs,
	gameOver = false;

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function( callback ){
			window.setTimeout(callback, 1000 / 60);
};
})();

function run()
{
    running = true;
    game.update();
    game.draw();

    if (!gameOver) {
		window.requestAnimFrame(run);
	}
}

jQuery(function($)
{
	$(this).keydown(function (e) {
		switch (e.which) {
			case 37:
				$('#tutLeft').fadeOut();
				break;
			case 39:
				$('#tutRight').fadeOut();
				break;
			case 65:
				$('#tutA').fadeOut();
				break;
			case 68:
				$('#tutD').fadeOut();
				break;
		}
	});
});