'use strict'

var Promise = require('bluebird');
var request = Promise.promisify(require('request'))
var fs = require('fs');


var prefix = 'https://api.weixin.qq.com/cgi-bin/'
var api = {
	accessToken: prefix+'token?grant_type=client_credential',
	temporaryUpload:{
		upload:prefix + 'media/upload?',
		fetch:prefix + 'media/get?'
	},
	permanentUpload:{
		upload:prefix + 'material/add_material?',
		uploadNews:prefix + 'material/add_news?',
		uploadNewsPic:prefix+'media/uploadimg?',
		fetch:prefix + 'material/get_material?',
		del:prefix + 'material/del_material?',
		updata:prefix + 'material/update_news?',
		count:prefix + 'material/get_materialcount?',
		materialList:prefix + 'material/batchget_material?'
	}
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

Wechat.prototype.uploadMaterial = function (type, material, permanent) {
	var that = this
	var form = {}
	var uploadUrl = api.temporaryUpload.upload

	if(permanent) {
		uploadUrl = api.permanentUpload.upload
		form = permanent
	}

	if(type === 'pic') {
		uploadUrl = api.permanentUpload.uploadNewsPic
	}

	if(type === 'news') {
		// 这时候，material需要传进来一个数组；
		uploadUrl = api.permanentUpload.uploadNews
		
		form = material
	} else {
		// 这时候是一个文件绝对路径；
		form.media = fs.createReadStream(material)
	}


	var appID = this.appID
	var appSecret = this.appSecret

	return new Promise (function (res, rej) {
		that
		.fetchAccessToken()

		.then(function (data) {
			
			var url = uploadUrl + 'access_token=' + data.access_token

			if(!permanent) {
				url += '&type=' + type
			} else {
				// 由于文档并没有说明access_token是在form中传还是在url中传，所以还是在form中带上；
				form.access_token = data.access_token
			}

			var options = {
				method:'POST',
				url:url,
				json:true
			}

			if(type === 'news') {
				options.body = form
			} else {
				options.formData = form
			}

			request(options)
			.then(function (response) {
				var _data = response.body;
				console.log(_data)
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


Wechat.prototype.fetchMaterial = function (mediaId, type, permanent) {
	var that = this
	var fetchUrl = api.temporaryUpload.fetch

	if(permanent) {
		fetchUrl = api.permanentUpload.fetch
		
	}

	return new Promise (function (res, rej) {
		that
		.fetchAccessToken()
		.then(function (data) {
			
			var url = fetchUrl + 'access_token=' + data.access_token

			
			var options = {
				method:'POST',
				url:url,
				json:true
			}
			if(permanent) {
				options.media_id=mediaId,
				options.access_token=data.access_token
			} else {
				if(type === 'video') {
					url = url.replace('https://','http://')
				}
				url += '&media_id=' + mediaId
			}

			if(type === 'news' || type === 'video') {
				console.log(444444444444444)
				console.log(options)
				request(options)
				.then(function (response) {
					var _data = response.body
					if(_data) {
						res(_data)
					} else {
						throw new Error('fetch material fails')
					}
				})
				.catch(function (err) {
					rej(err)
				})
			} else {
				res(url)
			}
		})
	})

}

Wechat.prototype.delMaterial = function (mediaId) {
	var that = this
	var delUrl = api.permanentUpload.del
	var form = {
		media_id:mediaId
	}

	return new Promise (function (res, rej) {
		that
		.fetchAccessToken()
		.then(function (data) {
			
			var url = delUrl + 'access_token=' + data.access_token + '&media_id=' + mediaId

			request({method:'POST', url:url, body:form, json:true})
			.then(function (response) {
				var _data = response.body

				if(_data) {
					res(_data)
				} else {
					throw new Error('Delete material fails')
				} 
			})

			res(url)
		})
	})

}

Wechat.prototype.updataMaterial = function (mediaId, news) {
	var that = this
	var updataUrl = api.permanentUpload.updata
	var obj = news
	obj.media_id = mediaId
	var form = obj

	return new Promise (function (res, rej) {
		that
		.fetchAccessToken()
		.then(function (data) {
			
			var url = updataUrl + 'access_token=' + data.access_token + '&media_id=' + mediaId

			request({method:'POST', url:url, body:form, json:true})
			.then(function (response) {
				var _data = response.body

				if(_data) {
					res(_data)
				} else {
					throw new Error('Updata material fails')
				} 
			})

			res(url)
		})
	})

}

Wechat.prototype.getCount = function () {
	var that = this
	var countUrl = api.permanentUpload.count

	return new Promise (function (res, rej) {
		that
		.fetchAccessToken()
		.then(function (data) {
			
			var url = countUrl + 'access_token=' + data.access_token

			request({method:'GET', url:url, json:true})
			.then(function (response) {
				var _data = response.body

				if(_data) {
					res(_data)
				} else {
					throw new Error('getCount material fails')
				} 
			})

			res(url)
		})
	})
}


Wechat.prototype.getMaterialList = function (options) {
	var that = this
	var getMaterialListUrl = api.permanentUpload.materialList

	options.type = options.type || 'image'
	options.offset = options.offset || 0
	options.count = options.count || 1
	
	return new Promise (function (res, rej) {
		that
		.fetchAccessToken()
		.then(function (data) {
			
			var url = getMaterialListUrl + 'access_token=' + data.access_token

			request({method:'POST', url:url, body:options, json:true})
			.then(function (response) {
				var _data = response.body

				if(_data) {
					res(_data)
				} else {
					throw new Error('getMaterialList material fails')
				} 
			})

			res(url)
		})
	})

}





module.exports = Wechat;