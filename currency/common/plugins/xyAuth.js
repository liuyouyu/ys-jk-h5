// 直播发布页面 添加下列代码，监听message，接收用户信息
window.addEventListener('message', function (params) {
	try{
    var obj = params.data;
    // console.log(obj,'监听到的message');
		if (obj.src === 'jh') {
			var auth = obj.auth;
			var userId = obj.userId;
			var headImgUrl = obj.headImgUrl;
			var userName = obj.userName;
			xyAuth.appAuth(auth, userId, headImgUrl, userName);
		}
	}catch(e){
		console.log(e)
	}
}, false);

if(!xyAuth) {
	var xyAuth = {
		//公众号appid
		appId: "",
		//第三方公众平台id
		componentAppId: "",
		//接口域名
		domain: CONFIG.apiHost,
		//微信授权链接
		authUrl: "https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=snsapi_userinfo&state=STATE&component_appid=COMPONENT_APPID#wechat_redirect",
		//分享信息
		shareInfo: {
		},
		/**
		 * 初始化方法
		 */
		init: function(param) {
			$("body").hide();
			xyAuth.appId = param.appId || "";
			xyAuth.componentAppId = param.componentAppId || "";
			xyAuth.domain = param.domain || "";
			xyAuth.setShareInfo(param);
      xyAuth.clearAuthUserInfo();
      console.log('是否在微信打开',xyAuth.isWechatApp());
			if(xyAuth.isWechatApp() && xyAuth.appId) {
				xyAuth.toWechatAuth();
				xyAuth.initWxShare();
			}else{
				$("body").show();
			}
		},
		/**
		 * 设置微信分享配置
		 * @param data
		 */
		setShareConfig: function(data) {
			wx.config({
				debug: false,
				appId: xyAuth.appId,
				timestamp: data.timestamp,
				nonceStr: data.nonceStr,
				signature: data.signature,
				jsApiList: [
					'onMenuShareTimeline',
					'onMenuShareAppMessage',
					'hideMenuItems',
					'hideOptionMenu',
					'startRecord', //开始录音
					'stopRecord', //停止录音
					'onVoiceRecordEnd', //监听录音自动停止接口
					'playVoice', //播放语音接口
					'pauseVoice', //暂停播放接口
					'stopVoice', //停止播放接口
					'onVoicePlayEnd', //监听语音播放完毕接口
					'uploadVoice', //上传语音接口
					'downloadVoice', //下载语音接口
					'translateVoice', //识别音频并返回识别结果
					'chooseImage', //拍照或从手机相册中选图接口
					'previewImage', //预览图片接口
					'uploadImage', //上传图片接口
					'downloadImage', //下载图片接口
					'getNetworkType', //获取网络状态接口
					'openLocation', //使用微信内置地图查看位置接口
					'getLocation', //获取地理位置接口
					'scanQRCode' //调起微信扫一扫接口
				]
			});
			wx.ready(function() {
				// 要隐藏的菜单项，所有menu项见附录3
				wx.hideMenuItems({
					menuList: ['menuItem:share:qq', //分享到qq
						'menuItem:share:weiboApp', //分享到微博
						'menuItem:share:QZone', //分享到qq空间
						'menuItem:copyUrl', //复制连接
						'menuItem:share:email', //邮件
						'menuItem:openWithQQBrowser', //在QQ浏览器中打开
						'menuItem:openWithSafari' //在Safari中打开
					],
					success: function(res) {},
					fail: function(res) {}
				});
				wx.onMenuShareAppMessage({
					title: xyAuth.shareInfo.title,
					imgUrl: xyAuth.shareInfo.imgUrl,
					link: xyAuth.shareInfo.link,
					desc: xyAuth.shareInfo.desc,
					success: function(res) {
						// xyAuth.addShareNum();
					}, // 已分享;
					cancel: function(res) {}, // 已取消
					fail: function(res) {}, // 失败
				});
				wx.onMenuShareTimeline({
					title: xyAuth.shareInfo.title,
					imgUrl: xyAuth.shareInfo.imgUrl,
					link: xyAuth.shareInfo.link,
					desc: xyAuth.shareInfo.desc,
					success: function(res) {
						// xyAuth.addShareNum();
					}, // 已分享;
					cancel: function(res) {}, // 已取消'
					fail: function(res) {}, // 失败
				});
			});
		},
		initWxShare: function(shareInfo) {
			var data = {
				"appId": xyAuth.appId,
				"componentAppId": xyAuth.componentAppId,
				"url": location.href
			};
			$.ajax({
				type: 'POST',
				headers: {
					"Content-Type": "application/json"
				},
				timeout: 5000,
				dataType: "json",
				data: JSON.stringify(data),
				url: xyAuth.domain + "api/ffWxCheck/v1/getWechatShareParam",
				cache: false,
				context: this,
				success: function(data) {
					if(data.code === 0) {
						var data = data.data;
						this.setShareConfig(data);
					} else {
						console.info("获取微信分享配置错误!");
					}
				},
				error: function() {
					console.info("获取微信分享配置错误!");
				}
			});
		},
		/**
		 * 跳转到微信授权
		 */
		toWechatAuth: function() {
			var code = xyAuth.getRequestValue("code");
			var state = xyAuth.getRequestValue("state");
			//缓存中有用户信息则不进行授权
			var userInfo = localStorage.getItem(xyAuth.userCacheId());
			if(userInfo) {
				$("body").show();
//				xyAuth.loginFansByWechat();
				return;
			}
			if(code && state) {
				//用户同意授权
				this.getAuthUserInfo(code);
				$("body").show();
			} else {
				//获取当前url
				var nowUrl = window.location.href;
				nowUrl = encodeURIComponent(window.location.href);
				//将微信授权链接替换参数
				this.authUrl = this.authUrl.replace(/APPID/, xyAuth.appId);
				this.authUrl = this.authUrl.replace(/COMPONENT_APPID/, xyAuth.componentAppId);
				this.authUrl = this.authUrl.replace(/REDIRECT_URI/, nowUrl);
				window.location.href = this.authUrl;
				//如果用户拒绝授权,也可以显示页面
				setTimeout(function(){
					$("body").show();
				},5000);
			}
			
		},
		/**
		 * 获取用户授权信息
		 */
		getAuthUserInfo: function(code) {
			var data = {
				"code": code,
				"appId": xyAuth.appId,
				"componentAppId": xyAuth.componentAppId
			};
			$.ajax({
				type: 'POST',
				headers: {
					"Content-Type": "application/json"
				},
				async: false,
				dataType: "json",
				data: JSON.stringify(data),
				url: xyAuth.domain + "api/ffWxCheck/v1/getAuthUserInfo",
				cache: false,
				context: this,
				success: function(data) {
					console.log(data,'获取微信授权用户信息')
					if(data.code === 0) {
						var data = data.data;
						var nowHref = this.clearUrlParam();
						history.replaceState({}, document.title, nowHref);
            this.setUserInfo(data);
            console.log('用户登录授权信息',data);
//						xyAuth.loginFansByWechat();
					} else {
						console.info("获取微信授权用户信息错误!");
					}
				},
				error: function() {
					console.info("获取微信授权用户信息错误!");
				}
			});
		},
		/**
		 * 将用户信息保存到缓存中
		 */
		setUserInfo: function(data) {
			if(data && data.openid) {
				data.ctime = new Date().getTime();
				data.auth = "yes";
				localStorage.setItem(xyAuth.userCacheId(), JSON.stringify(data));
			} else {
				localStorage.removeItem(xyAuth.userCacheId());
			}
		},
		/**
		 * 从缓存中获取用户信息
		 */
		getCacheUserInfo: function() {
			var userCacheId = this.userCacheId();
			var userInfo = localStorage.getItem(userCacheId);
			if(!userInfo) {
				userInfo = xyAuth.getTouristUser();
			}
			if(typeof userInfo == "string") {
				userInfo = JSON.parse(userInfo);
			}
			return userInfo;
		},
		/**
		 * 获取游客信息
		 */
		getTouristUser: function() {
			var touristUserKey = xyAuth.appId + "_touris";
			var userInfo = localStorage.getItem(touristUserKey);
			if(!userInfo) {
				var uuid = this.guid();
				userInfo = {
					"openid": uuid,
					"id": uuid,
					"headimgurl": "http://poss.yunshicloud.com/CDVCLOUD/QMTNRK_YUNSHI/794EF2CC796447B48AEB1044DDB1CA74/4f15613484983e03412b777f86859969.png",
					"nickname": "游客" + this.guid().substring(2, 7)
				};
				localStorage.setItem(touristUserKey, JSON.stringify(userInfo));
			}
			if(typeof userInfo == "string") {
				userInfo = JSON.parse(userInfo);
			}
			return userInfo;
		},
		guid: function() {
			var guid = "";
			for(var i = 0; i < 8; i++) {
				guid += (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
			}
			return guid;
		},
		/**
		 * 获取用户缓存id
		 */
		userCacheId: function() {
			var _userId = config.productId || '';
			return _userId + "_user";
			// return xyAuth.appId + "_user";
		},
		/**
		 * 清除当前链接上，微信授权的参数code和state
		 */
		clearUrlParam: function() {
			var code = xyAuth.getRequestValue("code");
			var state = xyAuth.getRequestValue("state");
			var appId = xyAuth.getRequestValue("appid");
			var nowHref = window.location.href;
			if(code) {
				nowHref = nowHref.replace("&code=" + code, "");
				nowHref = nowHref.replace("code=" + code, "");
			}
			if(state) {
				nowHref = nowHref.replace("&state=" + state, "");
				nowHref = nowHref.replace("state=" + state, "");
			}
			if(appId) {
				nowHref = nowHref.replace("&appid=" + appId, "");
				nowHref = nowHref.replace("appid=" + appId, "");
			}
			if(nowHref.lastIndexOf("?") == (nowHref.length - 1)) {
				nowHref = nowHref.substring(0, nowHref.lastIndexOf("?"))
			}
			return nowHref;
		},
		/**
		 * 设置分享信息
		 */
		setShareInfo: function(info) {
			try {
				info = info || {};
				info.title = info.title || $("title").text();
				info.imgUrl = info.imgUrl || "";
				info.link = info.link || window.location.href;
				info.desc = info.desc || $("title").text();
				xyAuth.shareInfo = info;
				wx.onMenuShareAppMessage({
					title: xyAuth.shareInfo.title,
					imgUrl: xyAuth.shareInfo.imgUrl,
					link: xyAuth.shareInfo.link,
					desc: xyAuth.shareInfo.desc,
					success: function(res) {}, // 已分享;
					cancel: function(res) {}, // 已取消
					fail: function(res) {}, // 失败
				});
				wx.onMenuShareTimeline({
					title: xyAuth.shareInfo.title,
					imgUrl: xyAuth.shareInfo.imgUrl,
					link: xyAuth.shareInfo.link,
					desc: xyAuth.shareInfo.desc,
					success: function(res) {}, // 已分享;
					cancel: function(res) {}, // 已取消'
					fail: function(res) {}, // 失败
				});
			} catch (error) {
				console.log(error, '设置微信分享失败')
			}
		},
		/**
		 * 获取链接中请求参数的值
		 * @param name
		 * 			参数名称
		 * @returns
		 */
		getRequestValue: function(name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
			var r = window.location.href.substr(
				window.location.href.indexOf("?") + 1).match(reg);
			if(r != null)
				return decodeURIComponent(r[2]);
			return null;
		},
		/**
		 * 是否在微信打开
		 */
		isWechatApp: function() {
			var ua = navigator.userAgent.toLowerCase();
			if(ua.match(/MicroMessenger/i) == "micromessenger") {
				return true;
			}
			return false;
		},
		/**
		 * 3小时清除一次用户授权信息
		 */
		clearAuthUserInfo: function() {
			var time = 3 * 60 * 60 * 1000;
			var userInfo = xyAuth.getCacheUserInfo();
			if(userInfo && userInfo.ctime) {
				var ctime = userInfo.ctime;
				var val = new Date().getTime() - ctime;
				if(val >= time) {
					localStorage.removeItem(xyAuth.userCacheId());
				}
			}
		},
		/**
		 * 将授权过的微信用户注册到粉丝系统
		 * */
		loginFansByWechat: function() {
			var user = this.getCacheUserInfo();
			if(!user && !user.auth) {
				console.error("注册粉丝错误!");
				return;
			}
			var sex = "未知";
			if(user.sex == 1) {
				sex = "男";
			} else if(user.sex == 2) {
				sex = "女";
			}
			var data = {
				"id": user.openid,
				"iconurl": user.headimgurl,
				"name": user.nickname,
				"sex": sex,
				"source": "wechat"
			};
			var url = xyAuth.domain + "api/xy/fans/v1/loginFansByWechat?companyId=COMPANYID&appCode=APPCODE&userId=USERID&serviceCode=SERVICECODE";
			url = dazzleUtil.replaceUrlCommonParam(url);
			$.ajax({
				type: 'POST',
				headers: {
					"Content-Type": "application/json"
				},
				dataType: "json",
				data: JSON.stringify(data),
				url: url,
				cache: false,
				async: false,
				context: this,
				success: function(data) {
					//重置用户缓存信息,增加粉丝系统的id和状态
					if(data.code == 0) {
						var fansData = data.data;
						user.id = fansData._id;
						user.status = fansData.status;
					} else {
						user.status = 0;
					}
					this.setUserInfo(user);
				},
				error: function() {
					console.info("注册到粉丝系统错误!");
				}
			});
		},
		/**
		 * app用户授权
		 * auth ：yes:登录，no：未登录
		 * userId : 用户唯一id
		 * headImgUrl： 用户头像
		 * nickName ：用户昵称
		 */
		appAuth: function(auth, userId, headImgUrl, nickName) {
			if(auth && userId && headImgUrl && nickName) {
				if(auth == "yes") {
					var userInfo = {
						_id: userId,
						thumbnail: headImgUrl,
						name: nickName
					};
					this.loginFansByApp(userInfo);
				} else {
					var user = {};
					user.id = userId;
					user.openid = userId;
					user.headimgurl = headImgUrl;
					user.nickname = nickName;
					localStorage.setItem(xyAuth.userCacheId(), JSON.stringify(user));
				}
				return true;
			} else {
				return false;
			}
		},
		/**
		 * 将授app用户注册到粉丝系统
		 * */
		loginFansByApp: function(param) {
			var apiUrl = xyAuth.domain + "api/xy/fans/v1/syncOldFans?companyId=COMPANYID&appCode=APPCODE&userId=USERID&serviceCode=SERVICECODE";
			url = dazzleUtil.replaceUrlCommonParam(apiUrl);
			$.ajax({
				type: 'POST',
				headers: {
					"Content-Type": "application/json"
				},
				dataType: "json",
				data: JSON.stringify(param),
				url: url,
				cache: false,
				context: this,
				success: function(data) {
					var user = this.getCacheUserInfo();
					//重置用户缓存信息
					if(data.code == 0) {
						var fansData = data.data || {};
						user.id = param._id;
						user.openid = param._id;
						user.status = fansData.status || '';
						user.headimgurl = fansData.thumbnail || '';
						user.nickname = fansData.name || '';
					} else {
						user.status = 0;
					}
					this.setUserInfo(user);
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {
					console.info("app注册到粉丝系统错误!");
					console.info(XMLHttpRequest.status);
					console.info(XMLHttpRequest.readyState);
					console.info(textStatus);
				}
			});
		},

		// 分享计数接口
		addShareNum: function() {
			if (!SHARE_ITEM) {
				return
			}
			try {
				if (!SHARE_ITEM.shareType) {
					return
				}
				var obj = {};
				var docType = '';
				var source = '';
				var mthContent = 'mthContent';
				var content = 'content';
				switch (SHARE_ITEM.shareType) {
					case '1': // 文章
						source = SHARE_ITEM.contentType || 'normal'; // 来源
						obj.beCountName = encodeURIComponent(SHARE_ITEM.title || '');
						obj.docid = SHARE_ITEM.docid || '';
						obj.docUserId = SHARE_ITEM.userid || SHARE_ITEM.cuserId || '';
						obj.companyid = SHARE_ITEM.companyid || SHARE_ITEM.companyId || '';
						obj.userName = encodeURIComponent(SHARE_ITEM.author || '');
						if(!SHARE_ITEM.hasOwnProperty('articleType')) {
							SHARE_ITEM.articleType = 1;
						}
						switch (SHARE_ITEM.articleType) {
							case 0: // 动态
								docType = content;
								obj.type = mthContent
								break;
							case 1: // 文章
								docType = 'article';
								if (SHARE_ITEM.contentType && SHARE_ITEM.contentType == 'official') { // 媒体号
									obj.type = mthContent;
								} else {
									obj.type = content;
								}
								break;
							case 2: // 图集
								docType = 'image';
								obj.type = mthContent
								break;
							case 3: // 视频
								docType = 'video';
								obj.type = mthContent;
								break;
						}
						break;
					case '2': // 直播
						source = 'dazzle'; // 来源
						docType = 'liveRoom';
						obj.beCountName = encodeURIComponent(SHARE_ITEM.roomName || '');
						obj.docid = SHARE_ITEM._id || '';
						obj.docUserId = SHARE_ITEM.cuserId || '';
						obj.companyid = SHARE_ITEM.companyId || '';
						obj.userName = encodeURIComponent(SHARE_ITEM.cuserName || '');
						obj.type = 'videoLive';
						break;
					case 'ugc': // ugc
						source = 'ugc'; // 来源
						docType = 'ugc';
						obj.beCountName = encodeURIComponent(SHARE_ITEM.title || '');
						obj.docid = SHARE_ITEM.docid || '';
						obj.docUserId = SHARE_ITEM.cuserId || '';
						obj.companyid = SHARE_ITEM.companyId || '';
						obj.userName = encodeURIComponent(SHARE_ITEM.cuserName || '');
						obj.type = 'ugc';
						break;
				}
				var that = this;
				var params= {}
				var url = CONFIG.apiHost + 'api/xy/toc/'+ docType +'/v1/addActionLogByShare' + "?companyId=COMPANYID&userId=USERID&serviceCode=SERVICECODE";
				url = dazzleUtil.replaceUrlCommonParam(url);
				url += '&appCode=' + 'XYWZ';
				url += '&source=' + source;
				url += '&beCountName=' + obj.beCountName;
				url += '&docId=' + obj.docid;
				url += '&type=' + obj.type;
				url += '&docUserId=' + obj.docUserId;
				url += '&docCompanyId=' + obj.companyid;
				url += '&userName=' + obj.userName;
				url += '&pageId=' + SHARE_ITEM.pageId;
				url += '&token=token';
				$.ajax({
					type: 'GET',
					url: url,
					cache: false,
					context: this,
					success: function(data) {
					},
					error: function(error) {
						console.log(error)
					}
				});
			} catch (error) {
				console.log(error)
			}
		}
	};

	var appUa = dazzleUtil.getAppUa();
	window.USER_INFO_CACHE_KEY = 'userAgent'; // 设置全局使用的用户信息可以 这个数据来自app
	if (appUa.userinfo) {
		sessionStorage.setItem(USER_INFO_CACHE_KEY, JSON.stringify(appUa))
		if (appUa.userinfo.auth) {
			var auth = appUa.userinfo.auth;
		} else {
			var auth = 'no';
		}
		if (appUa.userinfo.userid) {
			var userid = appUa.userinfo.userid;
		} else {
			var userid = xyAuth.guid();
		}
		if (appUa.userinfo.headimgUrl) {
			var headimgUrl = appUa.userinfo.headimgUrl;
		} else {
			var headimgUrl = "http://poss.yunshicloud.com/CDVCLOUD/QMTNRK_YUNSHI/794EF2CC796447B48AEB1044DDB1CA74/4f15613484983e03412b777f86859969.png";
		}
		if (appUa.userinfo.nickname) {
			var nickname = appUa.userinfo.nickname;
		} else {
			var nickname = "游客" + xyAuth.guid().substring(2, 7);
		}
		xyAuth.appAuth(auth, userid, headimgUrl, nickname);
	} else {
		sessionStorage.setItem('USER_INFO_CACHE_KEY', '')
	}
}
