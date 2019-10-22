var dazzleUtil = {
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
    if (r != null)
      return decodeURIComponent(r[2]);
    return null;
  },
  /**
   * 替换请求地址上的公共参数
   * @param url
   * 		替换的的url
   * @options options
   * 		可选 替换的参数
   */
  replaceUrlCommonParam: function(url, options) {
    var productId = "";
    if (localStorage.dazzlecloudAppproductId) {
      productId = JSON.parse(localStorage.dazzlecloudAppproductId);
    } else if (config.productId) {
      productId = config.productId;
    }
    productId = config.productId;
    var seettings = {
      companyId: config.companyId || "",
      userId: xyAuth.getCacheUserInfo().openid || "",
      appCode: config.appCode || "",
      serviceCode: config.serviceCode || "",
      version: "v1",
      productId: productId
    };
    if (options) {
      seettings = $.extend(seettings, options);
    }
    url = url.replace("COMPANYID", seettings.companyId).replace("USERID", seettings.userId).replace("APPCODE", seettings.appCode)
      .replace("SERVICECODE", seettings.serviceCode).replace("VERSION", seettings.version).replace("PRODUCTID", seettings.productId);
    return url;
  },
  //图片处理
  imgCenter: function(imgObj) {
    if (!imgObj) {
      return;
    }
    //获取图片父元素的比例
    var parentBox = $(imgObj).parent();
    var parentWidth = $(parentBox).width();
    var parentHeight = $(parentBox).height();
    var parentProportion = parentWidth / parentHeight;
    //获取当前图片的比例
    var imgWidth = $(imgObj).width();
    var imgHeight = $(imgObj).height();
    var imgProportion = imgWidth / imgHeight;
    if (imgProportion >= parentProportion) {
      $(imgObj).css({
        "height": "100%"
      });
      imgWidth = $(imgObj).width();
      var left = (parentWidth - imgWidth) / 2;
      $(imgObj).css({
        "margin-left": left
      });
    } else if (imgProportion < parentProportion) {
      $(imgObj).css({
        "width": "100%"
      });
      imgHeight = $(imgObj).height();
      var top = (parentHeight - imgHeight) / 2;
      $(imgObj).css({
        "margin-top": top
      });
    }
  },
  /**
   * 调用app分享
   * @returns
   */
  appShare: function(shareJson) {
    if (shareJson.title && shareJson.desc && shareJson.link && shareJson.imgUrl) {
      var shareStr = JSON.stringify(shareJson);
      var ua = navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(ua)) {
        try {
          window.webkit.messageHandlers.appShare.postMessage(shareStr);
        } catch (e) {
          console.info("ios调用分享异常!");
        }
      } else if (/android/.test(ua)) {
        try {
          objFirsteye.appShare(shareStr);
        } catch (e) {
          console.info("安卓调用分享异常!");
        }
      }
    } else {
      console.info("调用app分享方法参数错误!");
    }
  },
  /**
   * 设置微信分享信息
   * globalShare  位置全局配置分享信息
   * defaultShare 默认分享信息
   * @returns
   */
  setWechatShareInfo: function(globalShare, defaultShare) {
    if (globalShare && defaultShare) {
      //没有分享信息设置直接设置为全局的分享信息
      if (!defaultShare.title && globalShare.shareTitle) {
        defaultShare.title = globalShare.shareTitle;
      }
      if (!defaultShare.desc && globalShare.shareDesc) {
        defaultShare.desc = globalShare.shareDesc;
      }
      if (!defaultShare.imgUrl && globalShare.shareUrl) {
        defaultShare.imgUrl = globalShare.shareUrl;
      }
      //全局设置开启,设置为全局的分享
      if (globalShare.shareTitleSwitch == "0" && globalShare.shareTitle) {
        defaultShare.title = globalShare.shareTitle;
      }
      if (globalShare.shareDescSwitch == "0" && globalShare.shareDesc) {
        defaultShare.desc = globalShare.shareDesc;
      }
      if (globalShare.shareUrlSwitch == "0" && globalShare.shareUrl) {
        defaultShare.imgUrl = globalShare.shareUrl;
      }
    }
    return defaultShare;
  },
  /**
   * 设置微信分享信息 用户专题文章列表和词表文章列表
   * 标题：直接取专题名称或者词表名称，没有就空着
   * 描述：取描述字段，没有的话取全局配置中的描述，还没有就空着
   * 图片：同描述
   * globalShare  位置全局配置分享信息
   * defaultShare 默认分享信息
   * @returns
   */
  setWechatShareInfoForCategory: function(globalShare, defaultShare) {
    var newShare = {}
    if (globalShare && defaultShare) {
      //没有分享信息设置直接设置为全局的分享信息
      if (!defaultShare.title) {
        newShare.shareTitle = '';
      } else {
        newShare.shareTitle = defaultShare.title;
      }
      if (!defaultShare.desc) {
        newShare.shareDesc = '';
      } else {
        newShare.shareDesc = defaultShare.desc;
      }
      if (!defaultShare.imgUrl) {
        newShare.shareUrl = '';
      } else {
        newShare.shareUrl = defaultShare.imgUrl;
      }
      //全局设置开启,设置为全局的分享
      if (globalShare.shareTitleSwitch == "0" && globalShare.shareTitle && defaultShare.title == '') {
        newShare.shareTitle = globalShare.shareTitle;
      }
      if (globalShare.shareDescSwitch == "0" && globalShare.shareDesc && defaultShare.desc == '') {
        newShare.shareDesc = globalShare.shareDesc;
      }
      if (globalShare.shareUrlSwitch == "0" && globalShare.shareUrl && defaultShare.imgUrl == '') {
        newShare.shareUrl = globalShare.shareUrl;
      }
    }
    return newShare;
  },
  // 图片预览
  initImgPreview: function(docDetailPage) {
    $(".rich_media_content img").on('click', function() {
      //如果是app,调用app的预览方法
      if(dazzleUtil.isApp()) {
        var index = $(".rich_media_content img").not(".video_poster,.video_play").index(this);
        docDetailPage.appPreviewImgs(index);
        return;
      }
      $("video.playing").hide();
      //获取当前图片的下标
      var nowIndex = $(".rich_media_content img").not(".video_poster,.video_play").index(this);
      var winPro = $(window).width() / $(window).height();
      var html = [];
      html.push("<div class='swiper-container'>");
      html.push("<div class='swiper-wrapper'>");
      $(".rich_media_content img").not(".video_poster,.video_play").each(function(i, item) {
        var nowSrc = $(item).attr("src");
        var bgPosition = 0;
        var imgPro = $(item).width() / $(item).height();
        if(imgPro < winPro) {
          bgPosition = "auto 100%";
        } else {
          bgPosition = "100% auto";
        }
        // style='background:url("+nowSrc+") no-repeat center center / "+bgPosition+";'
        nowSrc = nowSrc.replace(/@.*$/, "?x-oss-process=image/resize,w_540/auto-orient,1");
        html.push("<div class='swiper-slide'>");
        html.push("<div class='swiper-zoom-container'>");
        html.push("<img src=" + nowSrc + ">");
        html.push("</div>");
        html.push("</div>");
      });
      html.push("</div></div>");
      html.push("<div class='pagination'></div>");
      $(".img_preview_cont").html(html.join("")).fadeIn();
      var mySwiper = new Swiper('.swiper-container', {
        pagination: '.pagination',
        grabCursor: true,
        paginationClickable: true,
        initialSlide: nowIndex,
        zoom: true,
        minRatio: 2,
        zoomMax: 2,
        toggle: false
      });
    });

    //退出预览
    $(".img_preview_cont").click(function() {
      $(this).fadeOut().html("");
      $("video.playing").show();
    });
  },
  /**
   * 判断是否app
   */
  isApp: function() {
    var ua = navigator.userAgent.toLowerCase();
    if(/iphone|ipad|ipod/.test(ua)) {
      try {
        window.webkit.messageHandlers.isAppInner.postMessage("isApp");
        return true;
      } catch(e) {}
    } else if(/android/.test(ua)) {
      try {
        android.isAppInner("isApp");
        return true;
      } catch(e) {}
    }
    return false;
  },
  /**
   * 判断是否是iosApp
   */
  isIosApp: function(){
    if (this.isApp() && this.checkOpenDevice() == 'ios') {
      return true;
    }
    return false;
  },
  /**
   * 检查打开的设备
   * @param str
   */
  checkOpenDevice : function(){
    var ua = navigator.userAgent.toLowerCase();
    if(/iphone|ipad|ipod/.test(ua)) {
      return "ios";
    } else if(/android/.test(ua)) {
      return "android";
    }
    return "pc";
  },
  /**
   * 返回多少时间之前
   * @param time_str
   * 		时间字符串
   * @returns {String}
   */
  getTimeShow : function(time_str) {
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
  },
  /**
   * @return
   */
  getAppUa: function() {
    var ua = navigator.userAgent.toLowerCase();
    // ua = '#ys_app#{"userinfo":{"auth":"no","headimgUrl":"http://p.yntv.cdvcloud.com/CDVCLOUD/QMTNRK_YUNSHI/35DEF1C48760472297B3EC271E1DE6CE/5bd1685cc4d3e18ff01fdedfd0df36c3.png","nickname":"游客","userid":"1565166281292", "appcode":"JRMAS"},"version":"1.0.0"}#ys_app#';
    var arr = ua.split('#ys_app#');
    if (arr[1]) {
      console.log(arr[1],'arr[1]')
      return JSON.parse(arr[1]);
    }
    return {};
  }

};