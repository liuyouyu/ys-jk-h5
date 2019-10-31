Vue.prototype.TYPE_MODULE = [
    '轮播图', // 0
    '自定义图片', // 1
    '滚动公告区', // 2
    '左文右图', // 3
    '横版多图', // 4
    '大图列表', // 5
    '小视频播放', // 6
    'sitelink', // 7 站内连接 电视+
    'outerUrl', // 8 站外链接
    '多图列表', // 9
    '小图列表', // 10
    '图集', // 11
    '小视频播放新', // 12
    '文章列表', // 13
    '新版图集', // 14
    "应急广播", // 15
    "imagesNew", // 16 多来来源轮播
];

Vue.prototype.SRC = [
    '0', //文本
    '1', //文章
    '2', //直播
    '3', //专题
    '4', //词标
    '9', // h5链接 5
];

//直播统计类型
Vue.prototype.STATICTIC_PV_LIVE = {
    type: '', //被统计对象类型
    countType: 'pv', //统计类型
    countTwType: 'twPv' // 图文pv统计类型
};

//直播间 图文点赞统计类型
Vue.prototype.LIVE_TW_LIKE_TYPE = 'liveTw';

//直播评论评论的commontType 类型
Vue.prototype.LIVE_COMMENT = {
    commentType: 'videoLive'
}

// 媒体号stype
Vue.prototype.MTH_STYPE = 'mthContent';

//默认数据
Vue.prototype.DEFAULT_DATA = {
    bottomMap: 'common/img/default_img.png',
    sysColor: '#db0e10',
    loadingGifUrl: 'common/img/loading.gif',
}

//计算浏览器uv的md5
Vue.prototype.FP = 'effective';

// 评论的源类型 创建评论的时候会用到
Vue.prototype.COMMENT_SOURCE_TYPE = {
    article: 0, // 文章
    acitonArticle: 1, // 动态
    live: 2, // 直播间
    ugc: 3 // ugc
}

// 评论的粉丝类型
Vue.prototype.COMMENT_USER_TYPE = 0;

// 埋点页面id
Vue.prototype.PAGE_ID = {
    articleDetails: 'articleDetails', // 文稿详情
    articleList: 'articleList', // 文章按图集样式展示详情页 视频类型列表页
    imageDetails: 'imageDetails', // 文章按图集样式展示详情页
    videoDetails: 'videoDetails', // 视频类型详情页
    imageDetails: 'imageDetails', // 图集详情页
    circleHomePage: 'circleHomePage', // 圈子个人主页
    circleShowList: 'circleShowList', // 圈子秀列表页
    officialHomePage: 'officialHomePage', // 媒体号个人主页
    dynamicDetails: 'dynamicDetails', // 动态详情页
    liveDetails: 'liveDetails', // 直播详情页
    ugcList: 'ugcList', // UGC列表页
    ugcDetails: 'ugcDetails', // UGC详情页
    focusList: 'focusList', // 关注列表页
    commodityDetails: 'commodityDetails', //商品详情页 
}