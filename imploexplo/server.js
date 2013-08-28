var port	= 4444,
	http	= require('http'),
	express	= require('express'),
	server	= require('http'),
	UUID	= require('node-uuid'),
	app		= express(),
	server	= http.createServer(app),
	io		= require('socket.io').listen(server),
	request = require('request'),
	clients = {};

var session_url = 'http://localhost:4242/api/sessions/';

server.listen(process.env.PORT || port);

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.get('/*', function (req, res, next) {
	var file = req.params[0];
	res.sendfile(__dirname + '/' + file);
});


io.configure(function () {
	io.set('log level', 0);
	io.set('authorization', function (handshakeData, callback) {
		callback(null, true); // error first callback style
	});
});

io.sockets.on('connection', function (client) {
	client.userid = UUID();
	clients[client.userid] = client;
	console.log('socket.io:: player connected ' + client.userid);

	client.on('disconnect', function () {
		console.log('socket.io:: player disconnected ' + client.userid);

		if (client.session_id !== undefined) {
			request.del(session_url+client.session_id);
		}
		if (client.partnerUUID !== undefined) {
			if (clients[client.partnerUUID] !== undefined) {
				clients[client.partnerUUID].session_id = undefined;
				clients[client.partnerUUID].emit('partner_left');
			}
		}
		delete clients[client.userid];
	});

	client.on('leave_lobby', function () {
		if (client.session_id !== undefined) {
			request.del(session_url+client.session_id);
		}
	});

	client.on('quick_game', function (data) {
		request.post({
			headers: {'content-type' : 'application/x-www-form-urlencoded'},
			url:     session_url,
			body:    'user=hmm&UUID='+client.userid
		}, function (error, response, body) {
			var b = JSON.parse(body);
			client.session_id = b._id;
			if (b.player2UUID !== null) {
				if (clients[b.player1UUID] !== undefined) {
					client.partnerUUID = clients[b.player1UUID].userid;
					clients[b.player1UUID].partnerUUID = client.userid;

					client.emit('join', { player: b.player1, playingAs: 'implo' });
					clients[b.player1UUID].emit('join', { player: b.player2, playingAs: 'explo' });
				} else {
					console.log('oops!');
					request.del(session_url+client.session_id);
				}
			}
		});
	});

	client.on('game_over', function () {
		if (client.partnerUUID !== undefined) {
			client.partnerUUID = undefined;
		}
		if (client.session_id !== undefined) {
			request.del(session_url+client.session_id);
			client.session_id = undefined;
		}
	});

	addGameplayListeners(client);
});

function addGameplayListeners (client) {
	client.on('game_data', function (data) {
		if (clients[client.partnerUUID] !== undefined) {
			clients[client.partnerUUID].emit('game_data', data);
		}
	});

	client.on('implode', function() {
		if (clients[client.partnerUUID] !== undefined) {
			clients[client.partnerUUID].emit('implode');
		}
	});

	client.on('explode', function() {
		if (clients[client.partnerUUID] !== undefined) {
			clients[client.partnerUUID].emit('explode');
		}
	});
}