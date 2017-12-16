import Draw from './../utils/Draw'
import Phaser from 'phaser'
import io from 'socket.io-client'
import Events from './../../shared/Events'

export default class {
	constructor ({id, x, y, color, game, socket}) {
		
		this.id = id;

		this.game = game;
		this.socket = socket;
		
		this.cursors = this.game.input.keyboard.createCursorKeys();

		this.speed = 4;

		this.head = this.game.add.graphics(0, 0);
		this.head = Draw.circle(this.game, 20, color, color);

		this.text = this.game.add.text(0, -20, this.id, {font: "10px Arial", fill: "#ffffff"});
		this.text.x -= this.text.width >> 1;
		this.head.addChild(this.text);
		
		this.game.physics.enable(this.head, Phaser.Physics.ARCADE);
		
		this.head.body.collideWorldBounds = true;

		this.head.x = x;``
		this.head.y = y;
	}

	update (cursor) {
		
		if (cursor) {
			
			if (this.cursors.up.isDown) {
				this.head.y -= this.speed;
				this.socket.emit(Events.MOVE_USER, { id: this.id, x: this.head.x, y: this.head.y - this.speed })
			}
			if (this.cursors.down.isDown) {
				this.head.y += this.speed;
				this.socket.emit(Events.MOVE_USER, { id: this.id, x: this.head.x, y: this.head.y + this.speed })
			}
			if (this.cursors.left.isDown) {
				this.head.x -= this.speed;
				this.socket.emit(Events.MOVE_USER, { id: this.id, x: this.head.x - this.speed, y: this.head.y })
			}
			else if (this.cursors.right.isDown) {
				this.head.x += this.speed;
				this.socket.emit(Events.MOVE_USER, { id: this.id, x: this.head.x + this.speed, y: this.head.y })
			}
		}
	}

	moveUser (_x, _y) {
		this.head.x = _x;
		this.head.y = _y;
	}
}
