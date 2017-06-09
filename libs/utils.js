'use strict'

var fs = require('fs')

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
		fs.writeFile(fpath, content, function (err, content) {
			if(err) rej(err)
			else res()
		})
	})
}