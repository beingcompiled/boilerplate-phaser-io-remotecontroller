const Utils = require('./shared/Utils');
const Events = require('./shared/Events');

const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');

const isDev = process.env.NODE_ENV !== 'production';
const port = isDev ? 8000 : process.env.PORT;
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const _ = require('lodash');

var User = require('./server/User');
var users;

/*


	INIT


*/


function init () {

	users = []
	
	setEventHandlers()
}

/*


	GAME EVENT HANDLERS


*/

var setEventHandlers = function () {
	
	// io.set({transports: ['websocket'], upgrade: false}); // force webSocket ONLY and never use HTTP polling
	
	io.on('connection', onSocketConnection)
}

function onSocketConnection (client) {
	console.log('onSocketConnection client.id' + '\n')

	client.on(Events.REGISTER_SESSION, onRegisterSession)

	client.on(Events.NEW_USER, onNewUser)

	client.on(Events.MOVE_USER, onMoveUser)

	client.on(Events.SOCKET_DISCONNECT, onClientDisconnect)

	this.emit(Events.CLIENT_CONNECT)
}

function onRegisterSession (data) {
	console.log('onRegisterSession ', data)

	var duplicate = _.find(users, function(o) { return o.id == data.id });

	if (!duplicate) {

		console.log('create new user')

		this.emit(Events.NEW_CLIENT_USER, data)

	} else {

		console.log('user already exists')

		this.emit(Events.NEW_CLIENT_USER, {
			id: data.id,
			x: duplicate.getX(),
			y: duplicate.getY(),
			color: duplicate.getColor()
		})
	}
}

function onNewUser (data) {
	console.log('onNewUser: ', data)

	this.broadcast.emit(Events.NEW_USER, data);

	// Send existing users to the new user
	for (var i = 0; i < users.length; i++) {
		var existingUser = users[i]
		this.emit(Events.NEW_USER, {
			id: existingUser.id, 
			x: existingUser.getX(), 
			y: existingUser.getY(),
			color: existingUser.getColor()
		})
	}

	var duplicate = _.find(users, function(o) { return o.id == data.id });

	if (!duplicate) {

		var newUser = new User(data.id, data.x, data.y, data.color)
		users.push(newUser);
	}

	console.log('users: ', users.map( function(o) { return o.id; } ))
}

function onMoveUser(data) {
	// console.log('onMoveUser', data)
		
	var user = _.find(users, function(o) { return o.id == data.id });
	
	if (!user) {
		console.log('User not found: ' + data.id)
		return
	}
	
	user.setX(data.x)
	user.setY(data.y)
	
	// Broadcast updated position to connected clients
	this.broadcast.emit(Events.MOVE_USER, {id: user.id, x: user.getX(), y: user.getY()})
}

function onClientDisconnect (data) {
	console.log('User has disconnected: ' + data.id)

	var removeUser = _.find(users, function(o) { return o.id == data.id });

	if (!removeUser) {
		console.log('User not found: ' + data.id)
		return
	}

	users.splice(users.indexOf(removeUser), 1)

	this.broadcast.emit(Events.REMOVE_USER, {id: data.id})
}


/*


	SERVER

	
*/

server.listen(port, '0.0.0.0', function onStart(err) {
	if (err) console.log(err)

	console.log('==> Listening on port %s. Open http://localhost:%s/ in your browser.', port, port)

	init()
});


if (isDev) {
	const compiler = webpack(config);
	const middleware = webpackMiddleware(compiler, {
		publicPath: config.output.publicPath,
		contentBase: 'src',
		stats: {
			colors: true,
			hash: false,
			timings: true,
			chunks: false,
			chunkModules: false,
			modules: false
		}
	});

	app.use(middleware);
	app.use(webpackHotMiddleware(compiler));
	app.get('*', function response(req, res) {
		res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
		res.end();
	});

} else {
	
	app.use(express.static(__dirname + '/dist'));
	app.get('*', function response(req, res) {
		res.sendFile(path.join(__dirname, 'dist/index.html'));
	});
}