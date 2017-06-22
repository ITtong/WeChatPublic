'use strict'

var config = require('../config');
var Wechat = require('./accessToken');

var wechatApi = new Wechat(config.wechat);

exports.reply = function *(next) {
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
		} else if(message.Event === 'LOCATION') {
			this.body = '您上报的位置是 :' + message.Latitude + '/' + message.Longitude + '-' + message.Precision
		} else if (message.Event === 'CLICK') {
			this.body = '您点击了菜单: '+ message.EventKey
		} else if (message.Event === 'SCAN') {
			console.log('关注后扫描二维码' + message.EventKey + ' ' + message.Ticket)
			this.body = '看到了你扫了一下哦'
		} else if (message.Event === 'VIEW') {
			this.body = '你点击了菜单中的链接:' + message.EventKey
		}
	} else  if(message.MsgType === 'text'){
		var content = message.Content;
		var reply = '额， 你说的 '+ content +'太复杂了'

		if(content === '1') {
			reply = '天下第一吃大米';
		} else if(content === '2') {
			reply = '天下第二吃豆腐';
		} else if(content === '3') {
			reply = '天下第三吃仙丹';
		} else if(content === '4') {
			reply = [
				{
					title:'技术改变生活',
					description:'这只是个描述',
					pic_url:'http://c5.xinstatic.com/f1/20170621/1529/594a206ecc60a587279.jpg',
					url:'https://www.baidu.com'
				}
			]
		} else if (content === '5') {
			var data = yield wechatApi.uploadMaterial('image', '../static/image/2.jpg')

			console.log(data)
			reply = {
				type:'image',
				media_id:data.media_id
			}
			console.log(reply)
		}
		this.body = reply
	}
}