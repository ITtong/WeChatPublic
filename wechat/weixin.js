'use strict'

exports.reply = function* (next) {
	var message = this.weixin

	if(message.MsgType === 'event') {
		if(message.Event === 'subscribe') {
			if(message.EventKey) {
				console.log('扫描二维码');
			}

			this.body = '哈哈哈哈哈哈'
		} else if (message.Event === 'unsubscribe') {
			console.log('无情取关');

			this.body = ''
		}
	} else {

	}
}