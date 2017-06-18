'use strict'

var ejs = require('ejs')
var heredoc = require('heredoc')

/*这里的ToUserName是发送给哪个微信公众号，
而FromUserName是由哪个开发者发送的，
这里正好与message中的相反，
message是公众号订阅时候由公众号发起的数据，
所以这里的FromUserName是公众号的OpenID，
ToUserName是开发者微信号*/

var tpl = heredoc(function () {/*
	<xml>
		<ToUserName><![CDATA[<%= toUserName %>]]></ToUserName>
		<FromUserName><![CDATA[<%= fromUserName %>]]></FromUserName>
		<CreateTime><%= createTime %></CreateTime>
		<MsgType><![CDATA[<%= MsgType %>]]></MsgType>
		<% if(MsgType === 'text') { %>
			<Content><![CDATA[<%= content %>]]></Content>
		<% } else if(MsgType === 'image') { %>
			<Image>
				<MediaId><![CDATA[<%= content.media_id %>]]></MediaId>
			</Image>
		<% } else if(MsgType === 'voice') { %>
			<Voice>
				<MediaId><![CDATA[<%= content.media_id %>]]></MediaId>
			</Voice>
		<% } else if(MsgType === 'video') { %>
			<Video>
				<MediaId><![CDATA[<%= content.media_id %>]]></MediaId>
				<Title><![CDATA[<%= content.title %>]]></Title>
				<Description><![CDATA[<%= content.description %>]]></Description>
			</Video>
		<% } else if(MsgType === 'music') { %>
			<Music>
				<Title><![CDATA[<%= content.title %>]]></Title>
				<Description><![CDATA[<%= content.description %>]]></Description>
				<MusicUrl><![CDATA[<%= content.music_url %>]]></MusicUrl>
				<HQMusicUrl><![CDATA[<%= content.hq_music_url %>]]></HQMusicUrl>
				<ThumbMediaId><![CDATA[<%= content.media_id %>]]></ThumbMediaId>
			</Music>
		<% } else if(MsgType === 'news') { %>
			<ArticleCount><%= content.length %></ArticleCount>
			<Articles>
			<% content.forEach(function(item){ %>
			<item>
				<Title><![CDATA[<%= item.title %>]]></Title> 
				<Description><![CDATA[<%= item.description %>]]></Description>
				<PicUrl><![CDATA[<%= item.pic_url %>]]></PicUrl>
				<Url><![CDATA[<%= item.url %>]]></Url>
			</item>
			<% }) %>
			</Articles>
		<% } %>
	</xml>
*/})


var compiled = ejs.compile(tpl);

exports = module.exports = {
	compiled:compiled
}