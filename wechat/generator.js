'use strict'


var sha1 = require('sha1');
var getRawBody = require('raw-body');
var Wechat = require('./accessToken');
var conversion = require('./conversion');
var count = require('../libs/count');
var replay = require('./replay');
var path = require('path');
var viewCountPath = path.join(__dirname, '../config/count.txt')

module.exports = function (opts) {
	var wechat = new Wechat(opts)

	return function *(next) {
		//console.log(this.query)
		var token = opts.token
		var signature = this.query.signature
		var nonce = this.query.nonce
		var timestamp = this.query.timestamp
		var echostr = this.query.echostr
		var str = [token ,timestamp, nonce].sort().join('')
		var sha  = sha1(str)

		if(this.method === 'GET') {
			if (sha === signature) {
				this.body = echostr + ''
			}
			else {
				this.body = 'wrong'
			}
		}
		else if(this.method === 'POST') {
			if (sha !== signature) {
				this.body = 'wrong'
				return false
			}
			else {
				
				var data = yield getRawBody(this.req, {
					length:this.length,
					limit:'1mb',
					encoding:this.charset
				})

				var dataContent = yield conversion.parseXMLAsync(data)
				//console.log(dataContent)

				var message = conversion.formatMessage(dataContent.xml)

				console.log(message);


				this.weixin = message;

				//console.log(this.weixin);

				//replay.call(this);


				if(message.MsgType === 'event') {
					if(message.Event === 'subscribe') {
						count(viewCountPath, true);
						var now = new Date().getTime()
						
						console.log(111111111111111111111)
						console.log(this.weixin);

						this.status = 200
						this.type = 'application/xml'
						
						this.body = '<xml>'+
									'<ToUserName><![CDATA['+ message.FromUserName +']]></ToUserName>'+
									'<FromUserName><![CDATA['+ message.ToUserName +']]></FromUserName>'+
									'<CreateTime>'+ now +'</CreateTime>'+
									'<MsgType><![CDATA[text]]></MsgType>'+
									'<Content><![CDATA[Hi,欢迎您关注我~]]></Content>'+
									'</xml>'

						return
					}
					if(message.Event === 'unsubscribe') {
						count(viewCountPath, false)
					}
				}
			}
		}
		yield* next;
	}
}

