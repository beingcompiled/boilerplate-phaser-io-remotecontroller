module.exports = {

	getRandomArbitrary: (min, max) => {
		return Math.random() * (max - min) + min;
	},

	centerGameObjects: (objects) => {
		objects.forEach(function (object) {
	    	object.anchor.setTo(0.5)
	    })
	},

	setResponsiveWidth: (sprite, percent, parent) => {
		let percentWidth = (sprite.texture.width - (parent.width / (100 / percent))) * 100 / sprite.texture.width
		sprite.width = parent.width / (100 / percent)
		sprite.height = sprite.texture.height - (sprite.texture.height * percentWidth / 100)
	},

	generateKey() {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for (var i = 0; i < 5; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	},

	generateUID: () => {
		var s = [];
		var hexDigits = "0123456789abcdef";
		for (var i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
		s[8] = s[13] = s[18] = s[23] = "-";

		var uuid = s.join("");
		return uuid;
	},

	randomHex: () => {
		return '0x' + Math.floor(Math.random()*16777215).toString(16);
	},

	getQuery(name) {
    	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    	var results = regex.exec(location.search);
    	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
	}
}