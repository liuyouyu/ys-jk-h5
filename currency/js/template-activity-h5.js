
var CONTENTVAR = {
  title: '',
  rexPhone: /^1(2|3|4|5|6|7|8|9)\d{9}$/,
  isActivityTemplateId: 0, //当前页面是否是模板，是:1 不是: 0
  ispvSum: '',//当前模板状态 0草稿，1已发布，2已结束
}
var templateView = {
  'empWriteInfo': {
    template: '#emp_writeInfo',
    props: {
      userinfocachekey: {
        type: Object,
        default: {}
      }
    },
    data: function () {
      return {
        isSubmit: true , // 控制提交
        isPhone: false,
        submitName: '',
        model: {
          userPhone: '',
          userCode: ''
        },
        phoneWaring:false , // 手机号不正确警告
        sendAuthCode: true,/*布尔值，通过v-show控制显示‘获取按钮’还是‘倒计时’ */
        phoneCodeKey: '',
        auth_time: 0, /*倒计时 计数器*/
        valueCode: '',
        alreadySubmit: true
      }
    },
    methods: {
      handlePhoneChange(val){
        if (CONTENTVAR.rexPhone.test(val)){
          this.isPhone = true
          this.phoneWaring = false
        }else{
          this.phoneWaring = true
        }
      },
      getCode() {
        var phone = this.model.userPhone;
        if (!(CONTENTVAR.rexPhone.test(phone))) {
          var toast = this.$createToast({
            txt: '手机号码有误，请重填写',
            type: 'txt',
          })
          toast.show()
          return false;
        }
        var self = this;
        self.sendAuthCode = false;
        self.auth_time = 60;
        var auth_timetimer = setInterval(() => {
          self.auth_time--;
          if (self.auth_time <= 0) {
            self.sendAuthCode = true;
            clearInterval(auth_timetimer);
          }
        }, 1000);
        mcMethod.query.request({
          url: mcMethod.url.sendVerificationCode,
          queryType: 'GET',
          address: {
            phone: phone,
            vCode: ''
          },
          callback: function (data) {
            if (data.code == 0) {
              self.phoneCodeKey = data.data.codeKey
            }
          },
          errorCallback: function (err) {
            console.log(err);
          }
        })
      },
      getApplyData() {
        var self = this
        var jsonObj = {
          'gender': '',//性别
          'phone':self.model.userPhone,
          'name': self.submitName,
          'wxOpenId': '',//微信openId
          'wxHeadImgUrl': '',//微信头像
        }
        mcMethod.query.request({
          data: jsonObj,
          url: mcMethod.url.createPortrait,
          callback: function (data) {
            console.log('申请VIP',data)
            if (data.code == 0) {
              // this.$createDialog({
              //   type: 'alert',
              //   content: '恭喜您，领取成功！',
              //   icon: 'cubeic-ok',
              //   confirmBtn: {
              //     text: '确定',
              //     active: true,
              //     disabled: false,
              //     href: 'javascript:;'
              //   },
              //   onConfirm: () => {
              //     console.log('111')
              //   }
              // }).show()
              self.alreadySubmit = false
            }else if(data.code == 10019 ){
              // var toast = self.$createToast({
              //   txt: data.message,
              //   time: '2000',
              //   type: 'txt',
              // })
              // toast.show()
              self.alreadySubmit = false
            } else {
              // var toast = self.$createToast({
              //   txt: '提交失败!',
              //   time: '2000',
              //   type: 'txt',
              // })
              // toast.show()
            }
          }
        })
      },
      handleApplySubmint() {
        var self = this;
        var phone = this.model.userPhone;
        if(this.submitName == '') {
          var toast = self.$createToast({
            txt: '请输入姓名!',
            type: 'txt',
          })
          toast.show()
          return false;
        }
        if(this.model.userPhone == '') {
          var toast = self.$createToast({
            txt: '请输入手机号!',
            type: 'txt',
          })
          toast.show()
          return false;
        }
        if (!(CONTENTVAR.rexPhone.test(phone))) {
          var toast = this.$createToast({
            txt: '请输入有效手机号!',
            type: 'txt',
          })
          toast.show()
          return false;
        }
        if(this.model.userCode == ''){
          var toast = self.$createToast({
            txt: '请输入验证码!',
            type: 'txt',
          })
          toast.show()
          return false;
        }
        mcMethod.query.request({
          url: mcMethod.url.validateCode2,
          queryType: 'GET',
          address: {
            validateCode: self.model.userCode,
            phone: self.model.userPhone,
            codeKey: self.phoneCodeKey
          },
          callback: function (data) {
            if (data.code == 0 && data.data.result) { //短信校验成功后走相关提交接口的逻辑，再次之前需要校验字段的相关东西
              self.getApplyData()
            } else {
              if(self.model.userCode != ''){
                var toast = self.$createToast({
                  txt: '验证码错误!',
                  type: 'txt',
                })
                toast.show()
              }
            }
          },
          errorCallback: function (err) {
            var toast = self.$createToast({
              txt: '验证失败，请稍后再试!',
              type: 'txt',
            })
          }
        })
      }
    },
    mounted() {
      document.body.addEventListener('focusin', () => {
        var u = navigator.userAgent;
        var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        if (isiOS) {
          window.scrollTo(0, 0);
        }
      })
      document.body.addEventListener('focusout', () => {
        var u = navigator.userAgent;
        var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
        if (isiOS) {
          window.scrollTo(0, 0);
        }
      })
    }
  }
}
var INDEXAPP = new Vue({
  el: '#app',
  components: {
    empWriteInfo: templateView.empWriteInfo
  },
  data: {
    activityData:[],
    activityDetails: [],
    activityForm: {},
    activityGuestInfo: [],
    activityInfo: {},
    writingList: [],
    guestData: [],
    picData: [],//图片
    PicImgsData : [],//图集
    videoData : [],//视频
    isDisable: true,//判断是否提交
    userInfoCacheKey: '',//用户信息
    isApplyFlag: true,//资料填写flag
    vipCardFlag: false,//贵宾卡展示
  },
  methods: {
    //立即申请
    handleApply(){
      this.isApplyFlag = false
    },
    //根据潜客id查询潜客信息
    findPortraitInfiById: function(id){
      var self = this
      var jsonObj = {
        'id': id
      }
      mcMethod.query.request({
        data: jsonObj,
        url: mcMethod.url.findPortraitInfiById,
        callback: function (data) {
          if(data.code == 0 && JSON.stringify(data.data) != {}){
              //已有贵宾卡
              if(data.data.portraitInfoExists == true){
                this.vipCardFlag = true
              }else {
                this.vipCardFlag = false
              }
            self.queryAuthorizeTenantInfo()
          }else {
              var toast = self.$createToast({
                txt: '查询失败!',
                time: '2000',
                type: 'txt',
              })
              toast.show()
          }
        }
      })
    },
    //根据openid查询潜客信息
    findPortraitInfiByOpenid: function(id){
      var self = this
      var jsonObj = {
        'openid': id
      }
      mcMethod.query.request({
        data: jsonObj,
        url: mcMethod.url.findPortraitInfiByOpenid,
        callback: function (data) {
          if(data.code == 0 && JSON.stringify(data.data) != {}){
            //已有贵宾卡
            if(data.data.portraitInfoExists == true){
              this.vipCardFlag = true
            }else {
              this.vipCardFlag = false
            }
            self.queryAuthorizeTenantInfo()
          }else {
            var toast = self.$createToast({
              txt: '查询失败!',
              time: '2000',
              type: 'txt',
            })
            toast.show()
          }
        }
      })
    },
    queryActivityById: function () {
      var self = this;
      if (mcMethod.info.activityId) {
        mcMethod.query.request({
          queryType: 'GET',
          url: mcMethod.url.queryActivityById,
          address: {
            activityId: mcMethod.info.activityId
          },
          callback: function (data) {
            if (data.code === 0 && data.data != null) {
              self.activityData = data.data.modelExt
              console.log(self.activityData,'活动模板数据');
              document.title = data.data.activityInfo.title
              $("meta[name='og:description']").attr('content', data.data.activityInfo.synopsis)
              CONTENTVAR.ispvSum = data.data.activityStatus
              if(CONTENTVAR.ispvSum == 1) {
                self.pvSum()
              }
              if(data.data.activityStatus == "0" || data.data.activityStatus == "2" ) {
                self.isDisable = false
                if(data.data.activityStatus == 2){
                  self.$createDialog({
                    type: 'alert',
                    icon: 'cubeic-alert',
                    showClose: false,
                    title: '活动已结束',
                    onClose: () => {
                      this.$createToast({
                        type: 'warn',
                        time: 1000,
                        txt: '点击关闭按钮'
                      }).show()
                    }
                  }).show()
                }
              }
              //基础信息
              if (data.data.activityInfo) {
                console.log(data.data.activityInfo,'data.data.activityInfo');
                self.activityInfo = data.data.activityInfo
                console.log(data.data.activityInfo);
                CONTENTVAR.title = data.data.activityInfo.title
                self.queryAuthorizeTenantInfo()
              }
            }else if(data.code === 0 && data.data == null ){
              self.$createDialog({
                type: 'alert',
                icon: 'cubeic-alert',
                showClose: false,
                title: '活动已下架',
                onConfirm: () => {
                  WeixinJSBridge.call('closeWindow');//IOS
                  document.addEventListener('WeixinJSBridgeReady', function(){ WeixinJSBridge.call('closeWindow'); }, false) //安卓
                }
              }).show()
            }else {
            }
          }
        })
      } else {

      }
    },
    pvSum: function () {
      var channelInfo = {
        channelName:xyAuth.getRequestValue('ffChannelCall') || '',
        channelId:xyAuth.getRequestValue('ffChannelId') || '',
        authorizeId:xyAuth.getRequestValue('authorizeId') || '',
        authorizeName:xyAuth.getRequestValue('authorizeCall') || '',
      }
      for (var key in channelInfo) {              // 去除对象内多余的空值key
        if (channelInfo[key] === '') {
          delete channelInfo[key]
        }
      }
      var queryMap = {
        activityId: mcMethod.info.activityId,
      }
      Object.assign(queryMap,channelInfo)
      console.log(queryMap, '合并之后的对象');
      mcMethod.query.request({
        url: mcMethod.url.pvSum,
        queryType: 'GET',
        address: queryMap,
        callback: function (data) {
        }
      })
    },
    findActivityTemplateById: function () {
      var self = this;
      if (mcMethod.info.activityTemplateId) {
        mcMethod.query.request({
          queryType: 'GET',
          url: mcMethod.url.findActivityTemplateById,
          address: {
            id: mcMethod.info.activityTemplateId
          },
          callback: function (data) {
            if (data.code === 0 && data.data) {
              console.log(data.data,data.data.templateContent.activityInfo, "通过模板Id查找数据");
              document.title = data.data.templateContent.activityInfo.title
              $("meta[name='og:description']").attr('content', data.data.templateContent.activityInfo.synopsis)
              var data = data.data.templateContent
              self.activityData = data.modelExt
              //基础信息
              if (data.activityInfo) {
                self.activityInfo = data.activityInfo
                CONTENTVAR.title = data.activityInfo.title
              }
            }
          }
        })
      } else {

      }
    },
    // 获取用户登录授权后的信息
    getAuthUserInfo(){
      xyAuth.getAuthUserInfo()
    },
    // 微信分享
    queryAuthorizeTenantInfo: function () {
      var that = this;
      var url = CONFIG.apiHost + mcMethod.url.queryAuthorizeTenantInfo + "?companyId="+mcMethod.info.companyId+"&appCode="+mcMethod.info.appCode+"&userId="+mcMethod.info.userId+"&serviceCode="+mcMethod.info.serviceCode;
      url = dazzleUtil.replaceUrlCommonParam(url);
      axios.get(url).then(function(res) {
        var data = that.checkReturn(res);
        console.log('微信分享请求的data',data);
        if(data !== false && data.data && data.code == 0) {
          var _desc = that.activityInfo.synopsis
          var _posterUrl = that.activityInfo.eventPoster + '?x-oss-process=style/320w_100q.src'
          xyAuth.init({
            appId: data.data.appId,
            componentAppId: data.data.componentAppId,
            domain: CONFIG.apiHost
          });
          xyAuth.setShareInfo({
            title: $('title').text(),
            desc: _desc,
            imgUrl: _posterUrl
          });
          var code = xyAuth.getRequestValue("code");
          this.getAuthUserInfo(code);
        }
      }).catch(function(e) {
      });
    },
    //统一验证返回状态
    checkReturn: function(res) {
      if(res.status === 200) {
        if(res.data.code === 0 || res.data.code === 2) {
          return res.data;
        }
      }
      return false;
    },
  },
  created: function () {
    this.userInfoCacheKey = JSON.parse(localStorage.getItem('_user'))
    console.log(this.userInfoCacheKey, '全局获取用户信息包括openid, unioid');
    console.log('mcMethod.info.guestId',mcMethod.info.guestId);
    if (mcMethod.info.guestId != '' && mcMethod.info.guestId != undefined && mcMethod.info.guestId != null ){//活动模板
      this.findPortraitInfiById(mcMethod.info.guestId)
    }else {
      console.log('this.userInfoCacheKey',this.userInfoCacheKey);
      var openid = this.userInfoCacheKey.openid
      this.findPortraitInfiByOpenid(openid)
    }
  },
  mounted: function () {
    document.title = '会员中心'
    //微信内置浏览器浏览H5页面弹出的键盘遮盖文本框的解决办法
    window.addEventListener("resize", function () {
      if (document.activeElement.tagName == "INPUT" || document.activeElement.tagName == "TEXTAREA") {
        window.setTimeout(function () {
          document.activeElement.scrollIntoViewIfNeeded();
        }, 0);
      }
    })
  }
})