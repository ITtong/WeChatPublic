'use strict'

var Promise = require('bluebird');
var request = Promise.promisify(require('request'))


var prefix = 'https://api.weixin.qq.com/cgi-bin/token'
var api = {
	accessToken: prefix+'?grant_type=client_credential'
}

function Wechat(opts) {
	var that = this
	this.appID = opts.appID
	this.appSecret = opts.appSecret
	this.getAccessToken = opts.getAccessToken
	this.saveAccessToken = opts.saveAccessToken

	this.getAccessToken()
	.then(function (data) {
		try{
			data = JSON.parse(data)
		}
		catch (e){
			return that.updateAccessToken()
		}

		if(that.isValidAccessToken(data)) {
			Promise.resolve(data)
		}
		else {
			return that.updateAccessToken()
		}
	})
	.then(function(data) {
		that.access_token = data.body.access_token
		that.expires_in = data.body.expires_in

		that.saveAccessToken(data)
	})
}

Wechat.prototype.isValidAccessToken = function (data) {
	if(!data || !data.body.access_token || !data.body.expires_in) {
		return false
	}

	var access_token = data.body.access_token
	var expires_in = data.body.expires_in
	var now = (new Data().getTime())

	if(now < expires_in) {
		return true
	}
	else {
		return false
	}
}

Wechat.prototype.updateAccessToken = function () {
	var appID = this.appID
	var appSecret = this.appSecret

	var url = api.accessToken + '&appid=' + appID + '&secret=' + appSecret;

	return new Promise(function(res,rej) {
		request({url:url, json:true})
		.then(function (data) {
			var now = (new Date().getTime())
			var expires_in = now + (data.body.expires_in -20) * 1000

			data.body.expires_in = expires_in

			res(data)
		})
	})
	
}

module.exports = Wechat;