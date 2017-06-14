'use strict'

var fs = require('fs');


module.exports = function (fpath) {
	return function *count(next) {
		if(!fpath) {
			this.body = 'the file path for count is not defined!'
			return false
		}
		fs.exists(fpath, function (exists) {
			if(!exists) {
				// 文件不存在
				fs.create.WriteStream(fpath);
			}
			fs.readFile(fpath, encoding, function (err, content) {
				if(err) {
					this.body = err
				}
				else {
					this.countNum = ++content
				}
			})
			fs.writeFile(fpath, this.countNum, function (err) {
				if(err) {
					this.body = err
				}else{
					console.log('success')
				}
			})
		})
	}
}
