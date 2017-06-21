'use strict'

var path = require('path');
var util = require('./libs/utils');
var wechat_file = path.join(__dirname, './config/wechat.txt');

var config = {
	wechat:{
		appID:'wxe8e12fe4b27a8c3c',
		appSecret:'e7b4adb249943b652b9417cbf769ad92',
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


module.exports = config;