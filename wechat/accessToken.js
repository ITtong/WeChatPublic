'use strict'

var Promise = require('bluebird');
var request = Promise.promisify(require('request'))
var fs = require('fs');


var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var api = {
	accessToken: prefix+'token?grant_type=client_credential',
	upload:prefix + 'media/upload?'
}

function Wechat(opts) {
	var that = this
	this.appID = opts.appID
	this.appSecret = opts.appSecret
	this.getAccessToken = opts.getAccessToken
	this.saveAccessToken = opts.saveAccessToken
	this.fetchAccessToken()
}


Wechat.prototype.fetchAccessToken = function () {
	var that = this

	if(this.access_token && this.expires_in) {
		console.log(this)
		if(this.isValidAccessToken(this)) {

			return Promise.resolve(this)
		}
	}

	this.getAccessToken()
	.then(function (data) {
		try{
			data = JSON.parse(data)
		}
		catch (e){
			return that.updateAccessToken()
		}

		if(that.isValidAccessToken(data)) {
			
			return Promise.resolve(data)
		}
		else {
			
			return that.updateAccessToken()
		}
	})
	.then(function(data) {
		that.access_token = data.body.access_token
		that.expires_in = data.body.expires_in

		that.saveAccessToken(data)

		return Promise.resolve(data)
	})
}



Wechat.prototype.isValidAccessToken = function (data) {
	if(data.body) {
		if(!data || !data.body.access_token || !data.body.expires_in) {
			return false
		}
		var access_token = data.body.access_token;
		var expires_in = data.body.expires_in
	} else {
		if(!data || !data.access_token || !data.expires_in) {
			return false
		}
		var access_token = data.access_token ;
		var expires_in = data.expires_in;
	}
	
	var now = new Date().getTime()
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

Wechat.prototype.uploadMaterial = function (type, filepath) {
	var that = this
	var form = {
		media:fs.createReadStream(filepath)
	}

	var appID = this.appID
	var appSecret = this.appSecret

	return new Promise (function (res, rej) {
		that
		.fetchAccessToken()

		.then(function (data) {
			
			var url = api.upload + 'access_token=' + data.access_token + '&type=' + type
			request({method:'POST', url:url, formData:form, json:true})
			.then(function (response) {
				var _data = response.body;
				if(_data) {
					res(_data)
				}else{
					throw new Error('Upload material fails')
				}
			})
			.catch(function (err) {
				rej(err)
			})
		})
	})

}





module.exports = Wechat;