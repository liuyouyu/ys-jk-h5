// 查询评论
Vue.prototype.queryComments4Page = function(params, type, callBack) {
    params.backParam = {
        content: 1,
        ctime: 1,
        doCommentName: 1,
        doCommentId:1,
        pid:1,
        sid:1,
        articleType:1,
        commentLink:1,
        author:1,
        beCommentedId:1,
        beCommentedName:1,
        stype: 1,
        ptype: 1,
        commentId: 1,
        title: 1,
        doCommentPortrait: 1
    }
    if (!params.pageNum) {
        params.pageNum = 8;
    }
    params.accessToken = 'TOKEN';
    params.timeStamp = new Date().getTime();
    if (!params.conditionParam.isCache) {
        params.conditionParam.isCache = 'yes';
    }
    var that = this;
    var url = this.setUrl('api/xy/toCComment/v1/queryComments4Page');
    axios.post(url, params).then(function(res) {
        var resData = res.data;
        callBack(resData);
    }).catch(function(res) {
        callBack(false);
        console.log(res, '获取合作机构')
    });
}

// 创建评论 type: 0 文稿；1 动态；2 直播；3 UGC；
Vue.prototype.createComment = function(params, type, callBack) {
    var that = this;
    params.sourceType = type;
    params.userType = this.COMMENT_USER_TYPE;
    var url = this.setUrl('api/xy/toc/v1/createComment');
    axios.post(url, params).then(function(res) {
        if (res.status === 200) {
            if (res.data.code === 0) {
                callBack(res.data);
            } else if (res.data.code === 10021 || res.data.code === 10022 || res.data.code === 10023 || res.data.code === 10024) {
                layer.msg(res.data.message)
                callBack(false);
            } else {
                callBack(false);
                layer.msg('评论失败，请稍后重试');
            }
        } else {
            callBack(false);
        }
    }).catch(function(res) {
        callBack(false);
    });
}

Vue.prototype.setUrlV2 = function(url, apiHost) {
    if (!apiHost) {
        apiHost = config.apiHost;
    }
    var url = apiHost + url + '?companyId=COMPANYID&userId=USERID&serviceCode=SERVICECODE&productId=PRODUCTID';
    return dazzleUtil.replaceUrlCommonParam(url);
}

/**
 * 数据埋点
 * @param {*} item 统计的详情内容
 * @param {*} type 类型
 * @param {*} pageId 页面id
 */
Vue.prototype.addActionLogByPv = function(item, type, pageId) {
    if (!type) {
        return
    }
    console.log(item,"获取阅读量传递数据",pageId,'页面id');
    var obj = {};
    var docType = '';
    var source = '';
    var mthContent = 'mthContent';
    var content = 'content';
    var commodity = 'commodity';
    switch (type) {
        case this.SRC[1]: // 文章
            source = item.contentType || 'normal'; // 来源
            obj.beCountName = encodeURIComponent(item.title || '');
            obj.docid = item.docId || '';
            obj.docUserId = item.userId || item.cuserId || '';
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
                        obj.type = mthContent
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
        case this.SRC[2]: // 直播
            source = 'dazzle'; // 来源
            docType = 'liveRoom';
            obj.beCountName = encodeURIComponent(item.roomName || '');
            obj.docid = item._id || '';
            obj.docUserId = item.cuserId || '';
            obj.companyid = item.companyId || '';
            obj.userName = encodeURIComponent(item.cuserName || '');
            obj.type = 'videoLive';
        break;
        case 'ugc': // ugc
            source = 'ugc'; // 来源
            docType = 'liveRoom';
            obj.beCountName = encodeURIComponent(item.roomName || '');
            obj.docid = item._id || '';
            obj.docUserId = item.cuserId || '';
            obj.companyid = item.companyId || '';
            obj.userName = encodeURIComponent(item.cuserName || '');
            obj.type = 'videoLive';
        break;
        case 'goods': // 商品
            source = 'dazzle'; // 来源
            docType = commodity;
            obj.beCountName = encodeURIComponent(item.name || '');
            obj.docid = item.commodityId || '';
            obj.docUserId = config.userid || '';
            obj.companyid = item.companyId || '';
            obj.userName = encodeURIComponent(config.userName || '');
            obj.type = commodity;
        break;
    }
    var that = this;
    var params= {}
    var url = this.setUrlV2('api/xy/toc/'+ docType +'/v1/addActionLogByPv');
    url += '&appCode=' + 'XYWZ';
    url += '&source=' + source;
    url += '&beCountName=' + obj.beCountName;
    url += '&docId=' + obj.docid;
    url += '&type=' + obj.type;
    url += '&fingerprint=' + this.FP;
    url += '&docUserId=' + obj.docUserId;
    url += '&docCompanyId=' + obj.companyid;
    url += '&userName=' + obj.userName;
    url += '&pageId=' + pageId;
    url += '&token=token';
    axios.get(url).then(function(res) {
    }).catch(function(res) {
    });
}
