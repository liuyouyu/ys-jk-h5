//设置接口常用参数
function setUrlV2(url) {
    if (!apiHost) {
        var apiHost = config.apiHost;
    }
    var url = apiHost + url + '?companyId=COMPANYID&userId=USERID&serviceCode=SERVICECODE&productId=PRODUCTID';
    var appCode = 'XYWZ';
    try {
        if (USER_INFO_CACHE_KEY && sessionStorage.getItem(USER_INFO_CACHE_KEY)) {
            var ua = JSON.parse(sessionStorage.getItem(USER_INFO_CACHE_KEY));
            if (ua.userinfo && ua.userinfo.appcode) {
                appCode = ua.userinfo.appcode.toLocaleUpperCase()
            }
        }
    } catch(e){
		console.log(e)
	}
    url += '&appCode=' + appCode;
    return dazzleUtil.replaceUrlCommonParam(url);
}

/**
 * 
 * @param {*} item 统计的详情内容
 * @param {*} type 类型
 * @param {*} pageId 页面id
 */
function addSeeNumCommon(item, type, pageId) {
    var obj = {};
    var docType = '';
    var source = '';
    var mthContent = 'mthContent';
    var content = 'content';
    switch (type) {
        case 'article': // 文章
            source = item.contentType || 'normal'; // 来源
            obj.beCountName = encodeURIComponent(item.title || '');
            obj.docid = item.docid || '';
            obj.docUserId = item.userid || item.cuserId || '';
            obj.companyid = item.companyid || item.companyId || '';
            obj.userName = encodeURIComponent(item.author || '');
            if (!item.hasOwnProperty('articleType')) {
                item.articleType = 1;
            }
            switch (item.articleType) {
                case 0: // 动态
                    docType = content;
                    obj.type = mthContent
                    break;
                case 1: // 文章
                    docType = 'article';
                    if (item.contentType && item.contentType == 'official') { // 媒体号
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
        case 'ugc': // ugc
            source = 'ugc'; // 来源
            docType = 'ugc';
            obj.beCountName = encodeURIComponent(item.title || '');
            obj.docid = item.docid || '';
            obj.docUserId = item.cuserId || '';
            obj.companyid = item.companyId || '';
            obj.userName = encodeURIComponent(item.cuserName || '');
            obj.type = 'ugc';
            break;
    }
    var that = this;
    var params= {}
    var url = setUrlV2('api/xy/toc/'+ docType +'/v1/addActionLogByPv');
    url += '&source=' + source;
    url += '&beCountName=' + obj.beCountName;
    url += '&docId=' + obj.docid;
    url += '&type=' + obj.type;
    url += '&fingerprint=effective';
    url += '&docUserId=' + obj.docUserId;
    url += '&docCompanyId=' + obj.companyid;
    url += '&userName=' + obj.userName;
    url += '&pageId=' + pageId;
    url += '&token=token';
    $.ajax({
		url: url,
		type: 'GET',
		dataType: 'json',
		success: function(res){},
		error: function(){}
	});
}