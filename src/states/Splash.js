import Utils from './../../shared/Utils'
import Phaser from 'phaser'

export default class extends Phaser.State {
	init () {}

	preload () {
		this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
		this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
		Utils.centerGameObjects([this.loaderBg, this.loaderBar])

		this.load.setPreloadSprite(this.loaderBar)
	}

	create () {
		this.state.start('Game')
	}
}