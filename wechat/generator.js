'use strict'


var sha1 = require('sha1');
var getRawBody = require('raw-body');
var Wechat = require('./accessToken');
var conversion = require('./conversion');
var count = require('../libs/count');
var reply = require('./reply');
var path = require('path');
var viewCountPath = path.join(__dirname, '../config/count.txt')

module.exports = function (opts, handler) {
	var wechat = new Wechat(opts)

	return function *(next) {
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

				yield handler.call(this, next)

				reply.call(this)
			}
		}
		yield* next;
	}
}

