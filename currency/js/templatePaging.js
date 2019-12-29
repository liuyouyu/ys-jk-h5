
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
        bg: '',
        brands: [],
        brand: '',
        validity: {},
        valid: undefined,
        model: {
          name: '',
          phone: '',
          code: ''
        },
        fields: [
          {
            type: 'input',
            modelKey: 'name',
            label: '',
            props: {
              placeholder: '请输入姓名'
            },
            rules: {
              required: true
            }
          },
          {
            type: 'input',
            modelKey: 'phone',
            label: '',
            props: {
              placeholder: '请输入电话号码'
            },
            rules: {
              required: true
            },
            messages: {
              required: '请输入电话号码！'
            }
          },
          {
            modelKey: 'code',
            type: 'input',
            label: '',
            props: {
              placeholder: '请输入验证码'
            },
            rules: {
              required: true
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
          }
        ]
      }
    },
    mounted() {
      this.bg = this.activityInfo.pagingBg
      this.brands = this.data.brands
      console.log('表单页', this.activityInfo, this.data);
    },
    methods: {
      getCode() {
        var phone = this.model.phone
        mcMethod.query.request({
          queryType: 'GET',
          url: mcMethod.url.sendVerificationCode,
          address: {
            phone: phone,
            vCode: ''
          },
          callback(data) {
            console.log(data);
          }
        })
      },
      submitHandler(e) {
        e.preventDefault()
        var that = this
        console.log('submit', this)
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
            console.log('活动报名后', res);
            if(res.code === 0){
              that.$createDialog({
                type: 'alert',
                // icon: 'cubeic-alert',
                showClose: true,
                title: '恭喜您已经报名成功！',
                confirmBtn: {
                  text: that.data.successData.btnName || '确定',
                  active: true,
                  href:'http://'+ that.data.successData.skipUrl || 'javascript:;'
                },
                onClose: () => {
                }
              }).show()
            }
          }
        })
      },
      // 收集提交表单使用的参数
      getParamsObj() {
        var jsonObj = {}
        jsonObj['activityId'] = mcMethod.info.activityId;
        // 新增  增加渠道id 渠道名称 用户微信openid 微信头像 微信名称等数据
        var wxInfo = xyAuth.getCacheUserInfo()

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
        console.log(JSON.stringify(channelInfo) != '{}', '判断真假');
        if (JSON.stringify(channelInfo) != '{}') {
          jsonObj['channelList'] = channelInfo
        }
        return jsonObj
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
    userInfoCacheKey: '',
    templateType: "",//模板类型
    mySwiper: {},
    activeIndex: 0,
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
    this.userInfoCacheKey = JSON.parse(localStorage.getItem('_user'))
    //微信内置浏览器浏览H5页面弹出的键盘遮盖文本框的解决办法 
    window.addEventListener("resize", function () {
      if (document.activeElement.tagName == "INPUT" || document.activeElement.tagName == "TEXTAREA") {
        window.setTimeout(function () {
          document.activeElement.scrollIntoViewIfNeeded();
        }, 0);
      }
    })
    // this.init()
  }
})