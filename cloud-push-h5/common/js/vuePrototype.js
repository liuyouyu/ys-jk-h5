Vue.prototype.setUrl = function(url, apiHost) {
	if (!apiHost) {
		apiHost = config.apiHost;
	}
	var url = apiHost + url + '?companyId=COMPANYID&userId=USERID&appCode=APPCODE&serviceCode=SERVICECODE&productId=PRODUCTID';
	return dazzleUtil.replaceUrlCommonParam(url);
}
Vue.prototype.addPvUv = function(beCountId, beCountName, type) {
	if(!type) {
		type = 'content'
	}
	var url = config.apiHost + 'api/xy/toc/v1/addPv';
	var param = {
		companyId: config.companyId,
		appCode: config.appCode,
		userId: xyAuth.getCacheUserInfo().openid,
		beCountId: beCountId,
		beCountName: encodeURIComponent(encodeURIComponent(beCountName)),
		fingerprint: this.FP,
		type: type,
		token: config.token,
		userName: encodeURIComponent(encodeURIComponent(xyAuth.getCacheUserInfo().nickname))
	};
	axios.get(url, {
		params: param
	}).then(function(res) {}).catch(function(e) {
		console.log(e);
	});
}

/**
 * 返回上一页 如果没有referrer就返回首页
 */
Vue.prototype.goBack = function() {
	var companyId = dazzleUtil.getRequestValue("companyId");
	var productId = dazzleUtil.getRequestValue("productId");
	var host = config.h5Host + 'index.html?companyId=' + companyId + '&productId=' + productId;
	(document.referrer === '' || document.referrer.length == 0) ? window.location.href = host : window.history.go(-1);
}

/**
 * 示例话懒加载
 * @param {str} imgUrl 默认底图
 */
Vue.prototype.newLazy = function(imgUrl) {
	Vue.use(VueLazyload, {
		preLoad: 1.3,
		error: imgUrl,
		loading: imgUrl,
		attempt: 5,
		adapter: {
			// loading: function loaded(_ref) {
			//     dazzleUtil.imgCenter(_ref.el);
			// },
			loaded: function loaded(_ref) {
				setTimeout(function(){
					dazzleUtil.imgCenter(_ref.el);
				}, 100)
			}
		},
		observer: true,
		observerOptions: {
			rootMargin: '0px',
			threshold: 0
		}
	});
}

//先从地址栏获取id  如果没有就从本地缓存获取
Vue.prototype.getDazLoadId = function() {
	if(sessionStorage.getItem('daz_load_id')) {
		return sessionStorage.getItem('daz_load_id');
	}
	return dazzleUtil.getRequestValue("id");
}

/**
 * 删除指定下标数组
 * @param {array} arr 
 * @param {string} index 
 */
Vue.prototype.remove = function(arr, index) {
	for(var i = 0; i < arr.length; i++) {
		var temp = arr[i];
		if(!isNaN(index)) {
			temp = i;
		}
		if(temp == index) {
			for(var j = i; j < arr.length; j++) {
				arr[j] = arr[j + 1];
			}
			arr.length = arr.length - 1;
		}
	}
	return arr;
}

// 根据src跳转到相应的地址
Vue.prototype.jumpToLinkBySrc = function(val) {
	var url = document.location.protocol + '//' + window.location.host + '/';
	var path = '';
	var query = {
		companyId: config.companyId,
		productId: config.productId
	}
	switch (Number(val.src)) {
		case Number(this.SRC[1]):
			if (val.contentType == 'normal') {
				path = 'pages/officialDetails/details.html';
			} else {
				path = 'pages/details/details.html';
			}
			query.docid = val.docid;
			if (val.isNew) {
				query.isNew = val.isNew;
			} else {
				query.isNew = 'no';
			}
			break;
		case Number(this.SRC[2]):
			query._id = val._id;
			if (val.template) {
				path = 'pages/newliveDetails/detail.html';
			} else {
				path = 'pages/liveDetails/detail.html';
			}
			break;
		case Number(this.SRC[3]): 
			if (val.outerUrl) {
				window.location.href = val.outerUrl;
				return;
			}
			var path = 'pages/special/special.html';
			query.src = this.SRC[3];
			query._id = val._id;
			break;
		case Number(this.SRC[5]):
			if (val.outerUrl) {
				url = val.outerUrl;
			} else {
				url = '';
			}
			break;
		default: 
			if (val.contentType == 'normal') {
				path = 'pages/officialDetails/details.html';
			} else {
				path = 'pages/details/details.html';
			}
			query.docid = val.docid;
			if (val.isNew) {
				query.isNew = val.isNew;
			} else {
				query.isNew = 'no';
			}
	}
	if (val.src == this.SRC[5]) {
		if (url) {
			window.location.href = url;
		} else {
			layer.msg('没有h5地址信息');
		}
	} else {
		url = url + path + '?';
		for (var i in query) {
			url += '&' + i + '=' + query[i];
		}
		window.location.href = url;
	}
}

/**
 * 跳转到文章详情页,在app环境下将跳转地址给app moduledata: 模块数据
 * value 列表的item
 */
Vue.prototype.jumpUrlToArticalDetailsApp = function(value, src, moduledata) {
	var isNew = 'no';
	var source = value.source || "";
	var detailPath = "details";
	var thumbnail = value.thumbnail || "";
	var title = value.title || "";
	//xySrc == 6 跳转到媒体号详情页面
	if(value.xySrc && value.xySrc == "6") {
		detailPath = "officialDetails";
		source = value.author || "";
	}
	// src=6 跳转到媒体号
	if (src && src !='' && src == 6) {
		detailPath = "officialDetails";
		source = value.author || "";
	}
	if (value.contentType && value.contentType == 'official') {
		detailPath = "officialDetails";
		source = value.author || "";
	}

	// 新版短视频模块 跳转到视频详情模块
	if (moduledata && moduledata.type && moduledata.type == this.TYPE_MODULE[12]) {
		if(value.contentType && value.contentType == 'official') { // 媒体号文稿
			detailPath = "officialVideoDetails";
			source = value.author || "";
		} else { // 普通文稿
			detailPath = "videoDetails";
		}
	}
	
	if(value.isNew) {
		isNew = value.isNew;
	}
	
	// 如果是外链
	if(value.srclink) {
		var srclink = value.srclink || "";
		if(dazzleUtil.isApp()){
			if(dazzleUtil.checkOpenDevice() == "ios") {
				try {
					var obj = {docid : value.docid,source:source};
					window.webkit.messageHandlers.openNewContentDetail.postMessage(JSON.stringify(obj));
				} catch(e) {}
			} else if(dazzleUtil.checkOpenDevice() == "android") {
				try {
					android.openCommonWeb(srclink,title)
				} catch(e) {}
			}
		} else {
			this.jumpOutUrl(value.docid, value.srclink);
		}
		return;
	}
	
	var url = document.location.protocol + '//' + window.location.host + '/pages/' + detailPath + '/details.html?docid=' + value.docid +
		'&isNew=' + isNew +
		'&companyId=' + config.companyId +
		'&productId=' + config.productId;
	if(moduledata && moduledata.companyid) {
		url = url + '&docCompanyId=' + moduledata.companyid;
	}
	if(dazzleUtil.isApp()) {
		url += "&thumbnail=" + thumbnail + "&title=" + title + "&source=" + source;
		url = encodeURIComponent(url);
		if(dazzleUtil.checkOpenDevice() == "ios") {
			try {
				var obj = {docid:value.docid,source:source};
				window.webkit.messageHandlers.openNewContentDetail.postMessage(JSON.stringify(obj));
			} catch(e) {}
		} else if(dazzleUtil.checkOpenDevice() == "android") {
			try {
				android.openNewContentDetail(url)
			} catch(e) {}
		}
	} else {
		window.location.href = url;
	}
}

/**
 * 跳转到文章详情页
 * value 列表的item
 */
Vue.prototype.jumpUrlToUrgentDetails = function(value) {
	var detailPath = "urgentDetail";
	var url = document.location.protocol + '//' + window.location.host + '/pages/' + detailPath + '/share.html?_id=' + value._id +
		'&companyId=' + config.companyId +
		'&productId=' + config.productId;
	window.location.href = url;
}

/**
 * 跳转到文章详情页
 * value 列表的item
 */
Vue.prototype.jumpUrlToArticalDetails = function(value) {
	if(value.srclink) {
		this.jumpOutUrl(value.docid, value.srclink);
		return;
	}
	if(value.isNew) {
		var isNew = value.isNew;
	} else {
		var isNew = 'no';
	}
	var detailPath = "details";
	//xySrc == 6 跳转到媒体号详情页面
	if(value.xySrc && value.xySrc == "6") {
		detailPath = "officialDetails";
	}
	var url = document.location.protocol + '//' + window.location.host + '/pages/' + detailPath + '/details.html?docid=' + value.docid +
		'&isNew=' + isNew +
		'&companyId=' + config.companyId +
		'&productId=' + config.productId;
	window.location.href = url;
}

/**
 * 外链跳转
 * id 被统计的id
 * outer 被统计的外链地址
 */
Vue.prototype.jumpOutUrl = function(id, outerUrl) {
	var url = config.statisticsApi + 'api/statistic/v1/addSupport?companyId=COMPANYID&appCode=APPCODE&userId=USERID';
	url += '&beCountId=' + id + 'wailian';
	url += '&beCountName=' + outerUrl;
	url += '&type=' + 'wailian';
	url += '&token=' + '6ED38431345A4E079D68';
	url = dazzleUtil.replaceUrlCommonParam(url);
	axios.get(url).then(function(res) {}).catch(function(e) {});
	setTimeout(function() {
		window.location.href = outerUrl;
	}, "500");
}

/**
 * 跳转到文章详情页
 * value 列表的item
 */
Vue.prototype.jumpUrlToLiveDetails = function(item) {
	var id = item._id;
	var router = '/pages/liveDetails/detail.html';
	if(item.template && item.template == 1) {
		var router = '/pages/newliveDetails/detail.html';
	}
	var url = document.location.protocol + '//' + window.location.host + router + '?_id=' + id +
		'&companyId=' + config.companyId +
		'&productId=' + config.productId;
	window.location.href = url;
}

/**
 * 跳转到词标
 * id 词标的_id
 */
Vue.prototype.jumpUrlToWorkMarkList = function(id) {
	var detailUrl = document.location.protocol + '//' + window.location.host + '/pages/workmark/workmark.html?_id=' + id +
		'&companyId=' + config.companyId +
		'&productId=' + config.productId;
	var requestUrl = config.apiHost + "api/xy/toc/v1/queryWordMarkById?companyId=COMPANYID&userId=USERID&appCode=APPCODE&productId=PRODUCTID&id=ID"
	requestUrl = dazzleUtil.replaceUrlCommonParam(requestUrl);
	requestUrl = requestUrl.replace("ID", id);
	axios.get(requestUrl).then(function(res) {
		if(res && res.data && res.data.code == 0) {
			var data = res.data;
			if(data.data.outerUrl) {
				window.location.href = data.data.outerUrl;
			} else {
				window.location.href = detailUrl;
			}
		}
	}).catch(function(e) {
		console.log(e);
		window.location.href = detailUrl;
	});
}

//跳转到词标，如果在app环境下，将地址给app
Vue.prototype.jumpUrlToWorkMarkListApp = function(cb) {
	cb = cb || {};
	var id = cb.cbid || "";
	var detailUrl = document.location.protocol + '//' + window.location.host + '/pages/workmark/workmark.html?_id=' + id +
		'&companyId=' + config.companyId +
		'&productId=' + config.productId;
	var requestUrl = config.apiHost + "api/xy/toc/v1/queryWordMarkById?companyId=COMPANYID&userId=USERID&appCode=APPCODE&productId=PRODUCTID&id=ID"
	requestUrl = dazzleUtil.replaceUrlCommonParam(requestUrl);
	requestUrl = requestUrl.replace("ID", id);
	axios.get(requestUrl).then(function(res) {
		if(res && res.data && res.data.code == 0) {
			var data = res.data;
			if(data.data.outerUrl) {
				detailUrl = data.data.outerUrl;
			}
		}
	}).catch(function(e) {
		console.log(e);
	});

	//在app环境中,调用app的跳转方法
	if(dazzleUtil.isApp() && cb && cb.cbid) {
		var cbname = cb.cbname || "";
		if(dazzleUtil.checkOpenDevice() == "ios") {
			try {
				var obj = {url : detailUrl,title: cbname};
				window.webkit.messageHandlers.openCommonWeb.postMessage(JSON.stringify(obj));
			} catch(e) {}
		} else if(dazzleUtil.checkOpenDevice() == "android") {
			try {
				android.openCommonWeb(detailUrl, cbname)
			} catch(e) {}
		}
	} else {
		window.location.href = detailUrl;
	}
}

//获取直播间状态 starTime:开始时间  endTime:结束时间
Vue.prototype.getLiveStatus = function(starTime, endTime) {
	starTime = this.getTs(starTime + ':000');
	endTime = this.getTs(endTime + ':000');
	nowTime = new Date().getTime();
	if(nowTime < starTime) {
		return '预告';
	} else if(nowTime > starTime && nowTime < endTime) {
		return '直播';
	} else {
		return '回看';
	}
}

/**
 * 根据格式化时间获取时间戳
 * tiem 2018-01-02 01:02:03
 * return 123456789
 */
Vue.prototype.getTs = function(time) {
	var arr = time.split(/[- :]/),
		_date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]),
		timeStr = Date.parse(_date)
	return timeStr
}

Vue.prototype.playVideFun = function(obj) {
	obj.addEventListener("ended", function() {
		obj.play();
		setTimeout(function() {
			obj.pause();
		}, 300);
	});
	obj.addEventListener("error", function() {
		layer.msg('正在努力获取直播!!!');
	});
	obj.play();
}

//获取计算uv的md5值 并赋值给FP
Vue.prototype.getFP = function() {
	var that = this;
	new Fingerprint2().get(function(result, components) {
		that.FP = result || that.FP;
	});
}

//获取图片压缩参数
Vue.prototype.setCompressImg = function(type) {
	if(!config.dazEnv || config.dazEnv == 'local') {
		return;
	}
	switch(type) {
		case 540: //占满一屏的
			return config.compressNum._540;
		case 320: //小图 类似于左图右文
			return config.compressNum._320;
		case 240:
			return config.compressNum._240;
		case 160:
			return config.compressNum._160;
	}
}

//检查字符串后三位是不是gif
Vue.prototype.checkStrLast3Gif = function(str) {
	if(str && str.substring(str.length - 3, str.length) == 'gif') {
		return true;
	}
	return false;
}

Vue.prototype.getThumbnail = function(val, type) {
	if(!val) {
		return '';
	}
	if(this.checkStrLast3Gif(val)) { //检查是不是gif图片 如果是直接return
		return val;
	}
	if(!type) {
		type = 540
	}
	// 判断图片地址是否已经存在参数
	if(val.indexOf("?") != -1) {
		return val + '&' + this.setCompressImg(type); //拼接压缩参数
	} else {
		return val + '?' + this.setCompressImg(type); //拼接压缩参数
	}
}

/**
 * 批量查询是否有点赞记录
 * @param {array} ids 需要查询的id
 * @param {function} fun  回调方法
 */
Vue.prototype.checkZanNums = function(ids, fun) {
	// pictextList
	if(!ids.length) {
		return false;
	}
	var that = this;
	var url = config.statisticsApi + 'COMPANYID/APPCODE/USERID/SERVICECODE/v1/pushUp/checkPushUpBatch';
	url = dazzleUtil.replaceUrlCommonParam(url);
	var _data = {
		"accessToken": "true",
		"timeStamp": new Date().getTime(),
		"beLikeIds": ids.toString()
	};
	axios.post(url, _data).then(function(res) {
		var data = that.checkReturn(res);
		if(data) {
			fun(data);
		}
	}).catch(function(e) {
		console.log(e);
	});
}

/**
 * 批量查询是否有pvuv数
 * @param {array} ids 查询的id
 * @param {function} fun 查询成功后的回调函数
 */
Vue.prototype.getPvUvNums = function(ids, fun) {
	var that = this;
	var url = this.setUrl('api/statistic/v1/queryPvUvNumBatch', config.statisticsApi);
	url += '&beCountIds=' + ids;
	url += '&token=' + config.token;
	axios.get(url).then(function(res) {
		var data = that.checkReturn(res);
		if(data) {
			fun(data);
		}
	}).catch(function(e) {
		console.log(e)
	});
}

/**
 * 批量查询是否有pvuv数 查询toc接口
 * @param {array} ids 查询的id
 * @param {function} fun 查询成功后的回调函数
 */
Vue.prototype.getPvUvNumsToc = function(ids, fun) {
	console.log(ids);
	var that = this;
	var url = config.apiHost + 'api/xy/toc/v1/queryPvUvNumBatch?companyId=COMPANYID&userId=USERID&appCode=APPCODE&productId=PRODUCTID';
	url = dazzleUtil.replaceUrlCommonParam(url);
	url += '&beCountIds=' + ids;
	url += '&token=' + config.token;
	axios.get(url).then(function(res) {
		if(res.status == 200 && res.data.code == 0) {
			fun(res.data);
		}
	}).catch(function(e) {
		console.log(e)
	});
}

/**
 * 批量获取点赞数量
 * @param {array} ids 查询id
 * @param {function} fun 
 */
Vue.prototype.getLikeNums = function(ids, fun) {
	if(!ids.length) {
		return false;
	}
	var that = this;
	var url = this.setUrl('api/statistic/v1/querySupportNumBatch', config.statisticsApi);
	url += '&beCountIds=' + ids;
	url += '&token=' + config.token;

	axios.get(url).then(function(res) {
		var data = that.checkReturn(res);
		if(data) {
			fun(data);
		}
	}).catch(function(e) {
		console.log(e)
	});
}

/**
 * 增加点赞数量
 * @param {string} id  统计的id
 * @param {string} type  统计类型
 * @param {function} fun  调用成功后的回调方法
 */
Vue.prototype.addZanNum = function(id, type, fun) {
	var that = this;
	var url = config.statisticsApi + "api/statistic/v1/addSupport";
	var paramJson = {
		companyId: config.companyId,
		appCode: config.appCode,
		userId: xyAuth.getCacheUserInfo().id,
		beCountId: id,
		beCountName: encodeURIComponent(this.liveInfo.roomName),
		type: type,
		token: config.token,
		userName: encodeURIComponent(xyAuth.getCacheUserInfo().nickname)
	};
	axios.get(url, {
		params: paramJson
	}).then(function(res) {
		var data = that.checkReturn(res);
		if(data) {
			if(type === that.LIVE_TW_LIKE_TYPE) {
				fun(data, id);
			} else {
				fun(data);
			}
		}
	}).catch(function(e) {
		console.log(e);
	});
}

/**
 * 获取点赞记录
 * @param {*} id 被统计id
 * @param {*} type 被统计类型
 * @param {*} fun 成功后的回调方法
 */
Vue.prototype.pushUpZanNum = function(id, type, fun) {
	var that = this;
	var url = config.statisticsApi + 'COMPANYID/APPCODE/USERID/SERVICECODE/v2/pushUp/createPushUp';
	url = dazzleUtil.replaceUrlCommonParam(url);
	url = url + '?roomId=' + id;
	var _data = {
		"accessToken": "true",
		"timeStamp": new Date().getTime(),
		"beLikeId": id,
		"beLikeName": encodeURIComponent(this.liveInfo.roomName),
		"beLikeType": type
	};
	axios.post(url, _data).then(function(res) {
		var data = that.checkReturn(res);
		if(data) {
			if(type === that.LIVE_TW_LIKE_TYPE) {
				fun(data, id);
			} else {
				fun(data);
			}
		}
	}).catch(function(e) {
		console.log(e);
	});
}

/**
 * 获取评论内容
 * @param {string} sid 被统计的sid
 * @param {int} pageSize 分页参数， 每页显示的条数
 * @param {int} currentPage 分页参数， 当前页参数
 * @param {function} fun 成功的回调方法
 */
Vue.prototype.getComment = function(sid, pid, pageSize, currentPage, fun, type) {
	var that = this;
	var url = config.commentUrl + 'COMPANYID/APPCODE/USERID/SERVICECODE/v2/comment/queryCommentByJson';
	url = dazzleUtil.replaceUrlCommonParam(url);
	var params = {};
	params.accessToken = config.token;
	params.timeStamp = new Date().getTime();
	params.accessToken = config.token;
	params.pageNum = pageSize;
	params.currentPage = currentPage;
	params.conditionParam = {
		pid: pid.toString(),
		isCache: 'yes'
	};
	params.userType = 'fans';
	params.sort = {
		ctime: -1
	};
	axios.post(url, params).then(function(res) {
		var data = that.checkReturn(res);
		if(type === 'tw') {
			fun(data, pid);
		} else {
			fun(data);
		}
	}).catch(function(e) {
		console.log(e)
	});
}

/**
 * 分割字符串
 * @param {str} val 需要分割的字符串
 * @return {obj}
 */
Vue.prototype.interceptVideoUrlAndThumburl = function(val) {
	var str = '---thumbUrl---';
	var obj = val.split(str);
	if(obj.length > 1) {
		return {
			video: obj[0],
			thumbUrl: obj[1]
		};
	}
	return {
		video: obj[0],
		thumbUrl: ''
	}
}

Vue.prototype.checkLiveRoomDesc = function (str) {
	if (!str || str == 'null') {
		return '';
	}
	return str;
}

Vue.prototype.showVideo = function() {
	$(this.$refs.detail_content).find('video').each(function() {
		if (!$(this)[0].paused) {
			$(this).show();
		}
	});
}

Vue.prototype.hideVideo = function() {
	$(this.$refs.detail_content).find('video').each(function() {
		console.log($(this)[0].paused, '$(this).play')
		if (!$(this)[0].paused) {
			$(this).hide();
		}
	});
}

// 设置观看人数
Vue.prototype.setLivePv = function(livePv) {
	var temp = 0;
	var count = Number(livePv);
	if (count < 10000) {
		temp = count;
	} else if (count < 99999999) {
		temp = (count / 10000).toFixed(2)
		temp = temp + '万';
	} else {
		temp = 9999.99 + '万';
	}

	return temp;
}