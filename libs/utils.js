'use strict'

var fs = require('fs')
var tpl = require('../wechat/tpl');

exports.readFileAsync = function (fpath, encoding) {
	return new Promise (function (res, rej) {
		fs.readFile(fpath, encoding, function (err, content) {
			if(err) rej(err)
			else res(content)
		})
	})
}


exports.writeFileAsync = function (fpath, content) {
	return new Promise (function (res, rej) {
		fs.writeFile(fpath, content, function (err) {
			if(err) rej(err)
			else res()
		})
	})
}


exports.tpl = function (content, message) {
	var info = {}
	var type = 'text'
	var fromUserName = message.ToUserName
	var toUserName = message.FromUserName

	if (Array.isArray(content)) {
		type = 'news'
	}

	type = content.type || type
	info.content = content
	info.createTime = new Date().getTime()
	info.MsgType = type
	info.toUserName = toUserName
	info.fromUserName = fromUserName

	return tpl.compiled(info)
}