'use strict'

var util = require('../libs/utils');

module.exports = function replay () {
	var content = this.body
	var message = this.weixin;

	var xml = util.tpl(content, message)

	this.status = 200
	this.type = 'application/xml'
	this.body = xml
}

