//查询这个字段是否存在 不存在返回默认图片地址
Vue.filter('checkImg', function(value) {
    if (!value) {
        return 'common/img/default_img.png';
    }
    return value;
});

//检查字符串是否存在 不存在返回 ''
Vue.filter('checkStrNull', function(value) {
    if (!value) {
        return '';
    }
    return value;
});

//截取格式化实现  2018-01-02 03:04:05  只截取 01-02
Vue.filter('getTime', function(value) {
    if (value) {
        return value.substring(5, 7) + '-' + value.substring(8, 10);
    }
    return '';
});

//截取格式化实现  2018-01-02 03:04:05  只截取 2018-01-02 03:04
Vue.filter('getTimeYMDHI', function(createDate) {
    if (!createDate) {
        return '';
    }
    return createDate.substr(0, 16)
});

//截取格式化实现  2018-01-02 03:04:05  只截取 03-04
Vue.filter('getTimeHM', function(createDate) {
    if (!createDate) {
        return '';
    }
    createDate = createDate.substr(0, 19)
    createDate = createDate.replace(/-/g, "/");
    if (!createDate) {
        return new Date(createDate).Format('hh:mm');
    }
    var nowDate = new Date();
    var date = new Date(createDate);

    var cY = parseInt(date.Format('yyyy'));
    var cM = parseInt(date.Format('MM'));
    var cd = parseInt(date.Format('dd'));

    var nY = parseInt(nowDate.Format('yyyy'));
    var nM = parseInt(nowDate.Format('MM'));
    var nd = parseInt(nowDate.Format('dd'));

    if (cY < nY) {
        //去年
        return date.Format('yyyy-MM-dd');
    } else if (cM < nM || cd < nd) {
        //不是这个月或不是今天
        return date.Format('MM-dd');
    } else {
        //今天
        return date.Format('hh:mm');
    }
});

//判断是否是空  返回0 或者 原值
Vue.filter('checkReadNum', function(value) {
    if (typeof value == undefined || value == '' || value == null) {
        return 0;
    }
    return value;
});

//截取字符串  如果长度超过len，就把多余的部分用...表示
Vue.filter('intercept', function(value, len) {
    if (value && value.length > len) {
        return value.slice(0, len) + '...';
    }
    return value;
});

//获取跳转文章详情页的url 获取整个文章对象（item）
Vue.filter('getJumpUrl', function(value) {
    if (value.isNew) {
        var isNew = value.isNew;
    } else {
        var isNew = 'no';
    }
    return document.location.protocol + '//' + window.location.host + '/pages/details/details.html?docid=' + value.docid +
        '&isNew=' + isNew +
        '&companyId=' + config.companyId +
        '&productId=' + config.productId;
});

//过滤词标
Vue.filter('checkCiBiao', function(value, ciBiao) {
    if (ciBiao && ciBiao.length) {
        return ciBiao;
    }
    return '';
});

//检查video路径是否存在
Vue.filter('checkVideoUrl', function(value) {
    if (value.videos && value.videos.length) {
        return value.videos[0].vh5url;
    }
    return '';
});

//跳到专题列表的连接 id:专题_id  src:3 专题类型
Vue.filter('jumpSpecialList', function(id, item, src) {
    //有外链先跳转到外链
    if (item.outerUrl) {
        return item.outerUrl;
    }
    if (id) {
        return document.location.protocol + '//' + window.location.host + '/pages/special/special.html?_id=' + id +
            '&src=' + 3 +
            '&companyId=' + config.companyId +
            '&productId=' + config.productId;
    }
    return '#';
});

//检查是否int 不是返回0
Vue.filter('checkInt', function(checkVal, baseVal) {
    if (isNaN(checkVal)) {
        return baseVal;
    }
    return checkVal + baseVal;
});

//2018-01-02 01-02-03  只取 年月日
Vue.filter('getYMD', function(val) {
    if (val) {
        return val.substr(0, 10);
    }
    return;
});
//2018-01-02 18：01：12   只取 年月日 时分秒
Vue.filter('getYMDHMS', function(val) {
    if (val) {
        return val.substr(0, 19);
    }
    return;
});
//2018-01-02 18：01：12   只取 年月日 时分
Vue.filter('getYMDHM', function(val) {
    if (val) {
        return val.substr(0, 16);
    }
    return;
});
//跳转到直播间 id 直播间_id
Vue.filter('jumpLiveDetail', function(id) {
    return 'pages/liveDetails/detail.html?_id=' + id +
        '&companyId=' + config.companyId +
        '&productId=' + config.productId;
});
//截取时间
Vue.filter('subStringTime', function(time) {
    if (time !== '' && time !== null) {
        time = time.substring(0, 10);
        time = time.replace(/-/, '-').replace(/-/, '-') + "";
        return time;
    }
});

Vue.filter('timeFmt', function(time_str) {
    if (time_str && time_str.length > 19) { // 兼容ios
        time_str = time_str.substr(0, 19);
    }
    var now = new Date();
	var date = new Date(Date.parse(time_str.replace(/-/g, "/")));
	var inter = parseInt((now.getTime() - date.getTime()) / 1000 / 60);
	if (inter == 0) {
		return "刚刚"; // 计算时间间隔，单位为分钟
	} else if (inter < 60) {
		return inter.toString() + "分钟前"; // 多少分钟前
	} else if (inter < 60 * 24) {
		return parseInt(inter / 60).toString() + "小时前"; // 多少小时前
	} else {
		var month = date.getMonth() + 1;
		var strDate = date.getDate();
		var hours = date.getHours();
		var minites = date.getMinutes();
		if (month >= 1 && month <= 9) {
			month = "0" + month;
		}
		if (strDate >= 0 && strDate <= 9) {
			strDate = "0" + strDate;
		}
		if (hours >= 0 && hours <= 9) {
			hours = "0" + hours;
		}
		if (minites >= 0 && minites <= 9) {
			minites = "0" + minites;
		}
		if (now.getFullYear() == date.getFullYear()) {
			return month + "-" + strDate + " " + hours + ":" + minites; 
		} else {
			var year = date.getFullYear().toString().substring(2, 3);
			return year + "-" + month + "-" + strDate + " " + hours + ":"
					+ minites;
		}
	}
});

//详情页 显示pv
Vue.filter('adjustShowPv',function(value){
    if(value>10000){
        return value/10000+'万'
    }else{
        return value
    }
})
