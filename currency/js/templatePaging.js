
var CONTENTVAR = {
  title: '',
  rexPhone: /^1(2|3|4|5|6|7|8|9)\d{9}$/,
  regEmail: /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/,
  isActivityTemplateId: 0, //当前页面是否是模板，是:1 不是: 0
  ispvSum: '',//当前模板状态 0草稿，1已发布，2已结束
}
var datePick = {
  props: {
    tit: '',
    modelKey: {
      type: String,
      default: ''
    },
    isshowwaring: {
      type: Boolean,
      default: ''
    }
  },
  template: '#datePick',
  data: function () {
    return {
      dateValue: '',
    }
  },
  methods: {
    showDatePicker() {
      if (!this.datePicker) {
        this.datePicker = this.$createDatePicker({
          title: '请选择出生年月',
          min: new Date(1900, 1, 1),
          max: new Date(2100, 12, 31),
          value: new Date(),
          onSelect: this.selectHandle,
          onCancel: this.cancelHandle
        })
      }
      this.datePicker.show()
    },
    selectHandle(date, selectedVal, selectedText) {
      this.dateValue = moment(new Date(selectedVal[0], selectedVal[1] - 1, selectedVal[2])).format('YYYY-MM-DD')
      // this.isshowwaring = false
    },
    cancelHandle() {

    }
  },
  mounted() {

  },
  watch: {
    dateValue(newVal, oldVal) {
      if (newVal) {
        console.log('shuju', newVal);
        this.$emit('modelkey', {
          date: this.dateValue,
          modelkey: this.modelKey
        })
      }
    }
  }
}
// 组件模块
var templateView = {
  // 通用页组件
  emp_paging: {
    template: '#emp_paging',
    props: ['data', 'activityInfo', 'activeIndex', 'index'],
    data() {
      return {
        bg: this.activityInfo.pagingBg,
        pic: this.data.pic
      }
    },
    mounted() {
      console.log('通用页', this.activeIndex, this.index);
    }
  },
  // 表单页组件
  empPagingForm: {
    template: '#empPagingForm',
    props: ['data', 'activityInfo', 'activeIndex', 'index'],
    data() {
      return {
        bg: '',             // 背景图
        faceImg:'',         // 表单内容图
        brands: [],         // 意向品牌数组
        brand: '',
        validity: {},        
        valid: undefined,
        canGetCode: true,   // 是否可以获取验证码
        countDown: 60,      // 默认60s重新获取
        codeKey:'',         // 验证码校验码
        timer:'',
        portraitId:'',      // 报名成功后拿到的潜客id
        model: {
          name: '',
          sex:'',
          phone: '',
          code: ''
        },
        fields: [
          {
            type: 'input',
            modelKey: 'name',
            label: '',
            props: {
              placeholder: '您的姓名'
            },
            rules: {
              required: true,
              max:10,
            }
          },
          {
            modelKey: 'sex',
            type: 'radio-group',
            label: '',
            props: {
              options:['先生','女士'],
              placeholder: ''
            },
            rules: {
              required: true
            },
            messages: {
              required: '请选择您的性别！'
            }
          },
          {
            type: 'input',
            modelKey: 'phone',
            label: '',
            props: {
              placeholder: '您的电话'
            },
            rules: {
              required: true,
              type:'tel',
            },
            messages: {
              required: '请输入电话号码！',
              type:'请输入正确的电话号码！'
            }
          },
          {
            modelKey: 'code',
            type: 'input',
            label: '',
            props: {
              placeholder: '验证码'
            },
            rules: {
              required: true,
              type:'number',
            },
            messages: {
              required: '请输入验证码！'
            }
          },
          {
            modelKey: 'brand',
            type: 'select',
            label: '',
            props: {
              options:this.data.brands,
              placeholder: '请选择意向品牌'
            },
            rules: {
              required: true
            },
            messages: {
              required: '请选择意向品牌！'
            }
          },
        ],
        userInfoCacheKey: '',//存储微信授权信息
        alreadySubmit: true,//是否已提交
      }
    },
    mounted() {
      this.bg = this.activityInfo.pagingBg
      this.brands = this.data.brands
      this.faceImg = this.data.faceImg
      console.log('表单页', this.activityInfo, this.data);
    },
    methods: {
      getCode() {
        if(!this.checkStatus()){
          return
        }
        var that = this
        var phone = this.model.phone
        if(!(/^1[3456789]\d{9}$/.test(phone))){ 
          this.$createToast({
            type:'error',
            txt:'手机号码格式不正确！'
          }).show()
          return
        }
        mcMethod.query.request({
          queryType: 'GET',
          url: mcMethod.url.sendVerificationCode,
          address: {
            phone: phone,
            vCode: ''
          },
          callback(res) {
            // console.log(res);
            if(res.code === 0){ 
              that.codeKey = res.data.codeKey     // 存储校验码
              that.$createToast({
                type:'correct',
                txt:'发送成功，请注意接收'
              }).show()
              that.canGetCode = false
              if(that.timer === ''){
                that.timer = setInterval(() => {
                  that.countDown --
                  if(that.countDown <= 0) {
                    clearInterval(that.timer)
                    that.countDown = 60
                    that.canGetCode = true
                    that.timer = ''
                  }
                },1000)
              }
            }else{
              that.$createToast({
                type:'error',
                txt:'获取验证码失败'
              }).show()
            }
          }
        })
      },
      // 校验用户输入验证码
      checkCode(){
        var that = this
        if(this.codeKey === ''){
          this.$createToast({
            type:'error',
            txt:'验证码已过期，请重新获取'
          }).show()
        }
        mcMethod.query.request({
          url: mcMethod.url.validateCode2,
          queryType: 'GET',
          address: {
            validateCode: that.model.code,
            phone: that.model.phone,
            codeKey: that.codeKey
          },
          callback: function (data) {
            if (data.code == 0 && data.data.result) { //短信校验成功后走相关提交接口的逻辑，再次之前需要校验字段的相关东西
              that.savePortraitInfo()
            }else{
              that.$createToast({
                type:'error',
                txt:'验证码不正确'
              }).show()
            }
          },
          errorCallback: function (err) {
            that.$createToast({
              txt: '验证失败，请稍后再试!',
              type: 'txt',
            }).show()
          }
        })
      },
      checkStatus(){
        if(CONTENTVAR.ispvSum === '2'){
          this.$createDialog({
            type: 'alert',
            icon: 'cubeic-alert',
            showClose: false,
            title: '活动已结束',
            onClose: () => {
            }
          }).show()
          return false
        }else if(CONTENTVAR.ispvSum === '0'){
          this.$createDialog({
            type: 'alert',
            icon: 'cubeic-alert',
            showClose: false,
            title: '活动未发布',
            onClose: () => {
            }
          }).show()
          return false
        }else{
          return true
        }
      },
      submitHandler(e) {
        e.preventDefault()
        console.log('submit',CONTENTVAR.ispvSum)
        if(this.checkStatus()){
          this.checkCode()
        }
      },
      // 收集提交表单使用的参数
      getParamsObj() {
        var self = this
        var jsonObj = {}
        var openid = '';
        var unionid = '';
        self.userInfoCacheKey = JSON.parse(localStorage.getItem('_user'))
        console.log('获取到用户微信信息？？',self.userInfoCacheKey);
        if(self.userInfoCacheKey != null){
          openid = self.userInfoCacheKey.openid
          unionid = self.userInfoCacheKey.unionid
          console.log(openid,unionid, '提交时获取openid，unionid');
          jsonObj['wxOpenId'] = openid
          jsonObj['unionId'] = unionid
        }
        console.log('userId',mcMethod.info.userId);
        if(mcMethod.info.employeeId != '' && mcMethod.info.employeeId != undefined && mcMethod.info.employeeId != null){
          jsonObj['employeeId'] = mcMethod.info.employeeId
        }
        if(mcMethod.info.shareId != '' && mcMethod.info.shareId != undefined && mcMethod.info.shareId != null){
          jsonObj['shareId'] = mcMethod.info.shareId
        }
        jsonObj['activityId'] = mcMethod.info.activityId;
        // 新增  增加渠道id 渠道名称 用户微信openid 微信头像 微信名称等数据
        var wxInfo = xyAuth.getCacheUserInfo()
        console.log('微信信息',wxInfo);

        jsonObj['gender'] = this.model.sex === '男' ? '1' : '2'
        jsonObj['wxHeadImgUrl'] = wxInfo.headimgurl || ''
        jsonObj['wxName'] = wxInfo.nickname || ''
        var channelInfo = {
          'channelName': xyAuth.getRequestValue('ffChannelCall') || '',
          'channelId': xyAuth.getRequestValue('ffChannelId') || '',
          'authorizeId': xyAuth.getRequestValue('authorizeId') || '',
          'authorizeName': xyAuth.getRequestValue('authorizeCall') || '',
        }
        for (var k in channelInfo) {              // 去除对象内多余的空值key
          if (channelInfo[k] === '') {
            delete channelInfo[k]
          }
        }
        if (JSON.stringify(channelInfo) != '{}') {
          jsonObj['channelList'] = channelInfo
        }
        return jsonObj
      },
      savePortraitInfo(){
        var that = this
        var jsonObj = {
          name: this.model.name,
          phone: this.model.phone,
        }
        Object.assign(jsonObj,this.getParamsObj())    // 合并参数
        console.log('发送的表单数据',jsonObj);
        mcMethod.query.request({
          data: jsonObj,
          url: mcMethod.url.savePortraitInfo,
          callback: function (res) {
            if(res.code === 0){
              if(res.data.isParticipate == 'yes'){
                var toast = that.$createToast({
                  txt: '不能重复提交哦',
                  time: '2000',
                  type: 'txt',
                })
                toast.show()
                that.alreadySubmit = false
              }else{
              that.portraitId = res.data.id              // 获取潜客id
              that.$createDialog({
                type: 'alert',
                // icon: 'cubeic-alert',
                showClose: true,
                title: '恭喜您已经报名成功！',
                confirmBtn: {
                  text: that.data.successData.btnName || '前往查看您的贵宾卡',
                  active: true,
                  href: that.clearUrl(that.data.successData.skipUrl,that.portraitId) || 'javascript:;'
                },
             }, (createElement) => {
                return [
                  createElement('div', {
                    'class': {
                      'my-title': true
                    },
                    slot: 'title'
                  }, [
                    createElement('div', {
                      'class': {
                        'my-title-img': true
                      }
                    }),
                    createElement('p', '您的信息已提交成功'),
                    createElement('p', '编码'+res.data.participateInNumber),
                    createElement('p', '获得专属电子VIP卡!')
                  ])
                ]
              }).show()
            }
            }
          }
        })
      },
      clearUrl(url,portraitId){
        var urlArr = url.split('&')
        for(var i = 0; i < urlArr.length; i++){
          if(urlArr[i].indexOf('userId')!=-1){
            urlArr[i] = 'userId='+ portraitId
          }
        }
        return urlArr.join('&')
      },
      validateHandler(result) {
        this.validity = result.validity
        this.valid = result.valid
        console.log('validity', result)
      },
    }
  }
}
var INDEXAPP = new Vue({
  el: '#app',
  components: {
    emp_paging: templateView.emp_paging,
    empPagingForm: templateView.empPagingForm
  },
  data: {
    activityData: [],
    activityDetails: [],
    activityForm: {},
    activityGuestInfo: [],
    activityInfo: {},
    writingList: [],
    guestData: [],
    picData: [],//图片
    PicImgsData: [],//图集
    videoData: [],//视频
    isDisable: true,//判断是否提交

    templateType: "",//模板类型
    mySwiper: {},
    activeIndex: 0,
    activityId: '',//活动id
  },
  methods: {
    init() {
      let that = this
      this.$nextTick(() => {
        that.mySwiper = new Swiper('#pagingContent', {
          direction: 'vertical',
          on: {
            transitionEnd: function () {
              that.activeIndex = this.activeIndex
            },
          },
        })
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
              self.activityId = data.data.id
              self.activityData = data.data.modelExt
              self.templateType = data.data.activityTemplateId
              document.title = data.data.activityInfo.title
              $("meta[name='og:description']").attr('content', data.data.activityInfo.synopsis);
              CONTENTVAR.ispvSum = data.data.activityStatus
              if (CONTENTVAR.ispvSum == 1) {
                self.pvSum()
              }
              if (data.data.activityStatus == "0" || data.data.activityStatus == "2") {
                self.isDisable = false
                if (data.data.activityStatus == 2) {
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
                console.log('活动信息', data.data.activityInfo);
                console.log('组件信息', data.data.modelExt);
                self.activityInfo = data.data.activityInfo
                CONTENTVAR.title = data.data.activityInfo.title
                self.queryAuthorizeTenantInfo()
              }
            } else if (data.code === 0 && data.data == null) {
              self.$createDialog({
                type: 'alert',
                icon: 'cubeic-alert',
                showClose: false,
                title: '活动已下架',
                onConfirm: () => {
                  WeixinJSBridge.call('closeWindow');//IOS
                  document.addEventListener('WeixinJSBridgeReady', function () { WeixinJSBridge.call('closeWindow'); }, false) //安卓
                }
              }).show()
            } else {
            }
            // 初始化swiper
            self.init()
          }
        })
      } else {

      }
    },
    pvSum: function () {
      var channelInfo = {
        channelName: xyAuth.getRequestValue('ffChannelCall') || '',
        channelId: xyAuth.getRequestValue('ffChannelId') || '',
        authorizeId: xyAuth.getRequestValue('authorizeId') || '',
        authorizeName: xyAuth.getRequestValue('authorizeCall') || '',
      }
      for (var key in channelInfo) {              // 去除对象内多余的空值key
        if (channelInfo[key] === '') {
          delete channelInfo[key]
        }
      }
      var queryMap = {
        activityId: mcMethod.info.activityId,
      }
      Object.assign(queryMap, channelInfo)
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
              console.log(data.data, data.data.templateContent.activityInfo, "通过模板Id查找数据");
              document.title = data.data.templateContent.activityInfo.title
              $("meta[name='og:description']").attr('content', data.data.templateContent.activityInfo.synopsis)
              self.templateType = data.data.activityTemplateId
              var data = data.data.templateContent
              self.activityData = data.modelExt
              self.activityId = data.id
              //基础信息
              if (data.activityInfo) {
                self.activityInfo = data.activityInfo
                CONTENTVAR.title = data.activityInfo.title
              }
            }
                 // 初始化swiper
                 self.init()
          }
        })
      } else {

      }
    },
    // 获取用户登录授权后的信息
    getAuthUserInfo() {
      xyAuth.getAuthUserInfo()
    },
    // 微信分享
    queryAuthorizeTenantInfo: function () {
      var that = this;
      var url = CONFIG.apiHost + mcMethod.url.queryAuthorizeTenantInfo + "?companyId=" + mcMethod.info.companyId + "&appCode=" + mcMethod.info.appCode + "&userId=" + mcMethod.info.userId + "&serviceCode=" + mcMethod.info.serviceCode;
      url = dazzleUtil.replaceUrlCommonParam(url);
      axios.get(url).then(function (res) {
        var data = that.checkReturn(res);
        // console.log('微信分享请求的data',data);
        if (data !== false && data.data && data.code == 0) {
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

        }
      }).catch(function (e) {
      });
    },
    //统一验证返回状态
    checkReturn: function (res) {
      if (res.status === 200) {
        if (res.data.code === 0 || res.data.code === 2) {
          return res.data;
        }
      }
      return false;
    },
  },
  created: function () {
    if (mcMethod.info.activityTemplateId != '' && mcMethod.info.activityId == '') {//活动模板
      CONTENTVAR.isActivityTemplateId = 1
      this.findActivityTemplateById()
    } else {//正式访问的
      CONTENTVAR.isActivityTemplateId = 0
      this.queryActivityById()
    }
  },
  mounted: function () {
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