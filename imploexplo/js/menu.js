jQuery(function($)
{
    // Navigation buttons
    $('#goto_local').click(function () {
        moveMenu($('#main'), $('#local'), -1, 0);
    });

    $('.start_local').click(function () {
        $('#menu').hide();
        $('#canvasContainer').show();
        startLocal();
    });
});

function startLocal () {
    Globals.gameMode = Globals.GameMode.LOCAL;
    game.reset();
    game.init("101");
    gameOver = false;
    if ( !running ) { run(); }
}

function moveMenu (current, next, xDir, yDir) {
    if (xDir == 1) {
        current.fadeOut().css('margin-left', 400);
        next.fadeIn(1200).css('margin-left', 0);
    } else if (xDir == -1) {
        current.fadeOut().css('margin-left', -400);
        next.fadeIn(1200).css('margin-left', 0);
    }
    if (yDir == 1) {
        current.fadeOut().css('margin-top', -400);
        next.fadeIn(1200).css('margin-top', 0);
    } else if (yDir == -1) {
        current.fadeOut().css('margin-top', 400);
        next.fadeIn(1200).css('margin-top', 0);
    }
}