
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
          'phone':self.model.userPhone,
          'name': self.submitName,
        }
        if(this.userinfocachekey != null) {
          jsonObj['gender'] = this.userinfocachekey.sex // 性别
          jsonObj['wxOpenId'] = this.userinfocachekey.openid // 微信openId
          jsonObj['wxHeadImgUrl'] = this.userinfocachekey.headimgurl // 微信头像
        }
        mcMethod.query.request({
          data: jsonObj,
          url: mcMethod.url.createPortrait,
          callback: function (data) {
            console.log('申请VIP',data)
            if (data.code == 0) {
              this.$createDialog({
                type: 'alert',
                content: '恭喜您，申请成功！',
                icon: 'cubeic-ok',
                confirmBtn: {
                  text: '确定',
                  active: true,
                  disabled: false,
                  href: 'javascript:;'
                },
                onConfirm: () => {
                  self.$parent.queryPortraitInfoById(data.data);
                }
              }).show()
              self.alreadySubmit = false
            }else {
              var toast = self.$createToast({
                txt: '领取失败!',
                time: '2000',
                type: 'txt',
              })
              toast.show()
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
    portraitQRcodeUrl: '',//二维码链接
    QRCodeMsg: '',
    isExpireFlag: true,//VIP申请
    vipName: '',
    gender: ''
  },
  methods: {
    //立即申请
    handleApply(){
      this.isApplyFlag = false
    },
    //根据潜客id查询潜客信息
    queryPortraitInfoById: function(id){
      var self = this
      var jsonObj = {
        'id': id
      }
      mcMethod.query.request({
        data: jsonObj,
        url: mcMethod.url.queryPortraitInfoById,
        callback: function (data) {
          if(data.code == 0 && JSON.stringify(data.data) != {}){
              //已有贵宾卡
              if(data.data.guestExists == true){
                self.vipCardFlag = true
                self.isApplyFlag = false
                self.vipName = data.data.portraitInfo.uuserName
                self.portraitQRcodeUrl = data.data.portraitQRcodeUrl
                self.portraitQRcodeUrl = data.data.portraitQRcodeUrl
                self.getQRCode(self.portraitQRcodeUrl)
              }else {
                self.isExpireFlag = false;
                var toast = self.$createToast({
                  txt: 'VIP卡已失效',
                  time: '2000',
                  type: 'txt',
                })
                toast.show()
              }
            // self.queryAuthorizeTenantInfo()
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
    queryPortraitInfoByOpenid: function(id){
      var self = this
      var jsonObj = {
        'openid': id
      }
      mcMethod.query.request({
        data: jsonObj,
        url: mcMethod.url.queryPortraitInfoByOpenid,
        callback: function (data) {
          if(data.code == 0 && JSON.stringify(data.data) != {}){
            //已有贵宾卡
            if(data.data.guestExists == true){
              console.log('申请贵宾卡',data);
              self.vipCardFlag = true
              self.isApplyFlag = false
              self.vipName = data.data.portraitInfo.uuserName
              self.portraitQRcodeUrl = data.data.portraitQRcodeUrl
              self.getQRCode(self.portraitQRcodeUrl)
            }else {
              self.vipCardFlag = false
              self.isApplyFlag = true
            }
            // self.queryAuthorizeTenantInfo()
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
    //生成二维码
    getQRCode: function (ewmUrl){
      var self = this;
      console.log('获取生成二维码',self.portraitQRcodeUrl);
      self.$nextTick(function () {
        var qrcode = new QRCode(document.getElementById("qrcode"), {
          width : 100,
          height : 100
        });
        qrcode.makeCode(ewmUrl);
      })

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
    console.log('用户授权信息',this.userInfoCacheKey);
    // this.userInfoCacheKey = {
    //   auth: "yes",
    //   city: "海淀",
    //   country: "中国",
    //   ctime: 1577683299845,
    //   headimgurl: "http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLT0RMjKNehHtDAyxfSeDTbfVR7YndcydMpJrjQ4mKymDJbgrLu2t3OQWhb3hv8iaKQgp9cAULiaStw/132",
    //   language: "zh_CN",
    //   nickname: "💋、 M",
    //   openid: "o6MrawbFTDdP0ritphk2eMIOdQ5I",
    //   privilege: Array(0),
    //   province: "北京",
    //   sex: 2,
    //   unionid: "oIMTwwPV1j8ktFlxuPpe7lGkLTYE"
    // }
    console.log('mcMethod.info.userId',mcMethod.info.userId);
    if (mcMethod.info.userId != '' && mcMethod.info.userId != undefined && mcMethod.info.userId != null ){//活动模板
      this.queryPortraitInfoById(mcMethod.info.userId)
    }else {
      var openid = this.userInfoCacheKey.openid
      this.queryPortraitInfoByOpenid(openid)
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