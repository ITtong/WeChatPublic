'use strict'

var Koa = require('koa');
var path = require('path');
var util = require('./libs/utils');
var wechat = require('./wechat/generator');
var count = require('./libs/count');
var wechat_file = path.join(__dirname, './config/wechat.txt');
var viewCountPath = path.join(__dirname, './config/count.txt')

var config = {
	wechat:{
		appID:'wxe8e12fe4b27a8c3c',
		appsecret:'e7b4adb249943b652b9417cbf769ad92',
		token:'73bluetravelpublic',
		getAccessToken:function () {
			return util.readFileAsync(wechat_file)
		},
		saveAccessToken:function (data) {
			data = JSON.stringify(data)
			return util.writeFileAsync(wechat_file,data)
		}
	},
	
}

var app = new Koa();
app.use(wechat(config.wechat))
app.use(count(viewCountPath))

app.listen(1234);
console.log('Listening:1234')
