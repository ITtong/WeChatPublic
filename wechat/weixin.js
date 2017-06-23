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
			var data = yield wechatApi.uploadMaterial('image', __dirname + '/static/image/2.jpg')

			console.log(data)
			reply = {
				type:'image',
				media_id:data.media_id
			}
			console.log(reply)
		} else if(content === '6') {
			var data = yield wechatApi.uploadMaterial('image', __dirname + '/static/image/2.jpg', {type:'image'})

			console.log(data)
			reply = {
				type:'image',
				media_id:data.media_id
			}
			console.log(reply)
		} else if (content === '7') {
			var data = yield wechatApi.uploadMaterial('video', __dirname+'/static/video/2.mp4', {type:'video', description:'{"title":"Really a nice place", "introduction":"nothing is esay"}'})
			console.log(data)
			reply = {
				type:'video',
				title:'回复视频内容',
				description:'打个篮球玩玩',
				media_id:data.media_id
			}
		} else if(content === '8') {
			var picData = yield wechatApi.uploadMaterial('image', __dirname+'/static/image/2.jpg',{})

			var media = {
				articles:[
					{
						title:'哈哈哈哈1',
						thumb_media_id:picData.media_id,
						author:'TongShuo',
						digest:'没有摘要',
						show_cover_pic:1,
						content:'没有内容啊···真的没有啊！',
						content_source_url:'https://www.baidu.com'
					},{
						title:'哈哈哈哈2',
						thumb_media_id:picData.media_id,
						author:'TongShuo',
						digest:'没有摘要',
						show_cover_pic:1,
						content:'没有内容啊···真的没有啊！',
						content_source_url:'https://www.baidu.com'
					}
				]
			}

			data = yield wechatApi.uploadMaterial('news', media, {})
			
			data = yield wechatApi.fetchMaterial(data.media_id, 'news',{})
			console.log(22222222222222222222)
			console.log(data)
			console.log(data.news_item)

			var items = data.news_item
			var news = []

			items.forEach(function (item) {
				news.push({
					title:item.title,
					description:item.digest,
					pic_url:picData.url,
					url:item.url
				})
			})

			reply = news
		}
		this.body = reply
	}
}