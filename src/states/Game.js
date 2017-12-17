import Draw from './../utils/Draw'
import Utils from './../../shared/Utils'
import Events from './../../shared/Events'

import Phaser from 'phaser'
import io from 'socket.io-client'

import User from '../objects/User'

export default class extends Phaser.State {

	init () {
		this.users;
		// this.gameUID;
	}
 
	preload () {
		console.log('preload game')
	}

	create () {
		// create new browser session and UUID if none exists
		// this.gameUID = (!localStorage.getItem('gameUID')) ? Utils.generateUID() : localStorage.getItem('gameUID');
		// localStorage.setItem('gameUID', this.gameUID)

		this.background = Draw.randomBackground(game, this.game.width, this.game.height, 100);

		this.game.physics.startSystem(Phaser.Physics.ARCADE);
		this.game.world.setBounds(0, 0, this.game.width, this.game.height);
		this.users = [];

		this.socket = io('http://' + window.location.hostname + ':8000');

		// this.game.camera.follow(this.user.head);
	
		this.socket.on(Events.CONNECT, e => this._onConnect(e))

		this.socket.on(Events.REGISTER, e => this._onRegister(e))

		this.socket.on(Events.NEW_CLIENT_USER, e => this._onNewClientUser(e))

		this.socket.on(Events.NEW_USER, e => this._onNewUser(e))
		
		this.socket.on(Events.MOVE_USER, e => this._onMoveUser(e))

		this.socket.on(Events.REMOVE_USER, e => this._onRemoveUser(e))

		this.socket.on(Events.DISCONNECT, e => this._onDisconnect(e))
	}

	update () {
		if (this.user) this.user.update(true);

		for (var i = 0; i < this.users.length; i++) {
			if (this.users[i].alive) {
				this.users[i].update()
				this.game.physics.arcade.collide(user, this.users[i].user, this._handleUserColision)
			}
		}
	}

	render () {
		/*if (__DEV__) {
			this.game.debug.spriteInfo(this.user.head, 32, 32)
		}*/
	}

	_onConnect (data) {
		console.log('_onConnect')

		this.users.forEach(function(user) { user.kill() })
		this.users = [];
		
		this.socket.emit(Events.REGISTER, { key: Utils.getQuery('key')})
	}

	_onRegister (data) {
		console.log('_onRegister')

		let domCallout = document.getElementById('callout');		

		if (!data.isSecondaryDevice) {
			
			let callout = '';
    		domCallout.value = callout + window.location.hostname + ':8000?key=' + data.key;

		} else {

			let callout = 'isSecondaryDevice';
			domCallout.value = callout;

			let userData = {
				id: Utils.generateUID(),
				x: Math.random() * this.game.world.width,
				y: Math.random() * this.game.world.height,
				color: Utils.randomHex()
			}

			this.socket.emit(Events.NEW_USER, userData)

			this.user = new User({ ...userData, game: this.game, socket: this.socket })
		}
	}

	_onNewUser (data) {
		console.log('_onNewUser', data)

		let duplicate = this.users.find(function(user){
			return user.id == data.id;
		})
		if (duplicate) return

		this.users.push(new User({
		  	id: data.id,
		  	x: data.x,
		 	y: data.y,
		  	color: data.color,
		  	game: this.game,
			socket: this.socket
		}))
	}

	_onMoveUser (data) {
		// console.log('_onMoveUser', data) + '\n';

		let user = this.users.find(function(user){
			return user.id == data.id;
		})

		if (!user) {
			console.log('user not found: ', data.id)
			return
		}

		user.moveUser(data.x, data.y)
	}

	_onRemoveUser (data) {
		console.log('_onRemoveUser', data);
		
		let user = this.users.find(function(user){
			return user.id == data.id;
		})
	
		if (!user) {
			console.log('user not found: ', data.id)
			return
		}
		
		this.users.splice(this.users.indexOf(user), 1)
	}

	_handleUserColision (me, them) {
		console.log('_handleUserColision', me, them)
	}

	_onDisconnect (data) {
		let user = this.users.find(function(user){
			return user.id == data.id;
		})
		this.users.splice(this.users.indexOf(user), 1)

		// user.disconnected = true;
		// setTimeout(function () {
		// 		if (user.disconnected) user.delete();
		// }, 1000);
	}
}