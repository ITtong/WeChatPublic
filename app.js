'use strict'

var Koa = require('koa');
var weixin = require('./wechat/weixin');
var wechat = require('./wechat/generator');
var config = require('./config');

var app = new Koa();

app.use(wechat(config.wechat,weixin.reply ))



app.listen(1234);
console.log('Listening:1234')
