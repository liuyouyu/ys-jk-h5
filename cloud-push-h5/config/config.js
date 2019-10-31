var config = {
    //环境变量 本地请填写local 预上线和线上填写online 测试填写test
    "dazEnv": "online",
    //"apiHost": 'http://cloudxyapi.yunshicloud.com/',
	//"apiHost": 'https://cloudapi.yunshicloud.com/',
    "apiHost": 'https://test-cdapi.yunshicloud.com/',
    //埋点文件地址
    "auxiliaryStatistics": 'https://cdn.yunshicloud.com/',
    //统计服务
    "statisticsApi": "https://wtinteractive.watonemt.com/",
    //h5域名
    "h5Host": 'https://wtmtydazzle.watonemt.com/',
    "companyId": dazzleUtil.getRequestValue("companyId"),
    "appCode": 'FF_YUNSHI',
    "serviceCode": 'YUNSHI_FF',
    "productId": dazzleUtil.getRequestValue('productId'),
    "token": 'TOKEN',
    'roleId': 'super',
    //图片的压缩参数
    'compressNum': {
        '_540': 'x-oss-process=style/540w_100q.src',
        '_320': 'x-oss-process=style/320w_100q.src',
        '_240': 'x-oss-process=style/240w_100q.src',
        '_160': 'x-oss-process=style/160w_100q.src'
    },
    'showPVFlag':true   // true 文稿详情也显示点赞数量 false 文稿详情也不显示文稿点赞数量 
    // 针对华通环境 H5详情页都不显示点赞数量 设置成false 默认为true
}