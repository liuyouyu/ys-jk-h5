
var CONTENTVAR = {
  title: '',
  rexPhone: /^1(2|3|4|5|6|7|8|9)\d{9}$/,
  regEmail: /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/,
  isActivityTemplateId: 0, //当前页面是否是模板，是:1 不是: 0
  ispvSum: '',//当前模板状态 0草稿，1已发布，2已结束
}
var datePick = {
  props: {
    tit:'',
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
    dateValue(newVal, oldVal){
      if (newVal) {
        console.log('shuju',newVal);
        this.$emit('modelkey', {
          date: this.dateValue,
          modelkey: this.modelKey
        })
      }
    }
  }
}

var templateView = {
  'userInfo': {
    props: {
      dataInfo: {
        type: Object,
        default: {}
      }
    },
    template: '#emp_user_info',
    data: function () {
      return {
        userInfo: ''
      }
    },
    methods: {},
    mounted: function () {
    },
    watch: {
      dataInfo: function (newVal, oldVal) {
        if (newVal) {
          this.userInfo = newVal
        }
      }
    },
    computed: {
      timeInfo: function () {
        return moment(this.userInfo.startTime).format('YYYY-MM-DD HH:mm') + ' - ' + moment(this.userInfo.endTime).format('YYYY-MM-DD HH:mm')
        // return moment. userInfo.startTime
      }
    }
  },
  'empForm': {
    props: {
      dataInfo: {
        type: Object,
        default: {}
      },
      isdisable: {
        type: Boolean,
        default: true
      },
      userinfocachekey: {
        type: Object,
        default: {}
      }
    },
    components: {
      datePicks: datePick
    },
    template: '#emp_form',
    data: function () {
      return {
        formList: '',
        selected: [],
        validity: {},
        model: {
          userPhone: '',
          userCode: ''
        },
        valid: undefined,
        fields: [],
        options: {
          scrollToInvalidField: true,
          layout: 'standard' // classic fresh
        },
        sendAuthCode: true,/*布尔值，通过v-show控制显示‘获取按钮’还是‘倒计时’ */
        auth_time: 0, /*倒计时 计数器*/
        valueCode: '',
        //手机验证相关信息
        phoneCodeKey: '',
        isPhone: false,
        isLink: 0,//0不跳转 ； 1 跳转
        islinkUrl: {},
        birData:'',
        isSubmit: true , // 控制提交

        iswaring:false,
        phoneWaring:false , // 手机号不正确警告
        emailWaring:false , // 邮箱不正确警告
        alreadySubmit: true,// 表单是否提交
      }
    },
    methods: {
      showPicker() {
        this.picker.show()
      },
      selectHandler(selectedVal, selectedIndex, selectedTxt) {
        this.selected = selectedTxt
        this.$emit('input', selectedVal)
      },
      submitHandler(e) {
        console.log(this.fields,'this.fields');
        for (var i = 0; i < this.fields.length; i++) {
          if (this.fields[i]['type']) {
            if (this.fields[i]['rules'] && this.fields[i]['rules']['required']) {
              if (this.$refs[this.fields[i]['modelKey']] && this.$refs[this.fields[i]['modelKey']].constructor === Array) {
                var modelKeyList = this.$refs[this.fields[i]['modelKey']];
                for (var j = 0; j < modelKeyList.length; j++) {
                  var vaildItem = modelKeyList[j].validate()
                  Promise.all([vaildItem]).then((vaildItem) => {
                    // console.log('当前》》》》》', vaildItem);
                  })
                }
                var val = this.model[this.fields[i]['modelKey']]
                if(val!=''){
                  console.log(val,'数据不为空',this.model,this.fields[i]);
                  if(this.fields[i].category == "email"){
                    if (!CONTENTVAR.regEmail.test(val)||val==''){
                      var toast = this.$createToast({
                        txt: '请输入有效邮箱!',
                        type: 'txt',
                      })
                      toast.show()
                      this.emailWaring = true
                      return
                    }else{
                      continue
                    }
                  }
                }else{
                  console.log(val,'数据空',this.model,this.fields[i]);
                  var toast = this.$createToast({
                    txt: '请输入'+this.fields[i].props.placeholder + '!',
                    type: 'txt',
                  })
                  toast.show()
                  return
                }

              }
              // console.log(this.$refs[this.fields[i]['modelKey']]);
            }else {

            }
          } else {//type类型为undefined的 目前有date
            if (this.fields[i]['rules'] && this.fields[i]['rules']['required']) {
              if (this.birData == ''){
                this.iswaring = true
              }else {
                this.iswaring = false
              }
            }
          }
          // if(this.fields[i].category == "email"){
          //   var val = this.model[this.fields[i]['modelKey']]
          //   if(val !== "") {
          //     if (!CONTENTVAR.regEmail.test(val)){
          //       const toast = this.$createToast({
          //         txt: '请输入有效邮箱!',
          //         type: 'txt',
          //       })
          //       toast.show()
          //       return
          //     }
          //   }
          // }
        }
        var self = this;
        if (!CONTENTVAR.rexPhone.test(this.model.phone)){
          var toast = self.$createToast({
            txt: '请输入有效手机号!',
            type: 'txt',
          })
          toast.show()
          this.phoneWaring = true
        }
        if(this.model.userCode == '' && this.isPhone == true){
          var toast = self.$createToast({
            txt: '请输入验证码!',
            type: 'txt',
          })
          toast.show()
          this.phoneWaring = false
        }
        mcMethod.query.request({
          url: mcMethod.url.validateCode2,
          queryType: 'GET',
          address: {
            validateCode: self.model.userCode,
            phone: self.model.phone,
            codeKey: self.phoneCodeKey
          },
          callback: function (data) {
            if (data.code == 0 && data.data.result) { //短信校验成功后走相关提交接口的逻辑，再次之前需要校验字段的相关东西
              self.getFromData()
            } else {
              if(self.model.userCode != ''){
                var toast = self.$createToast({
                  txt: '验证码错误!',
                  type: 'txt'
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
        for (var i = 0; i < this.model.length; i++) {
          this.$refs['form'].validate(this.model[i], (result) => {
            console.log(result);
          })
        }

        // console.log(this.model,'this.model<<<<<<<<<,');
        // console.log('submit')
      },
      validateHandler(result) {
        // console.log(result.validity,"result??????????")
        this.validity = result.validity
        this.valid = result.valid
        // console.log('validity', result.validity, result.valid, result.dirty, result.firstInvalidFieldIndex)
      },
      init() {
        if (this.formList
            && this.formList.items
            && this.formList.items.length > 0) {
          var fromData = this.formList.items
          for (var i = 0; i < fromData.length ; i ++){
            if(fromData[i].category == "link"){
              this.islinkUrl = fromData[i]
              fromData.splice(i,1)
              this.isLink = 1
            }
          }
          // console.log(this.islinkUrl,"??????????this.islinkUrl");
          for (var i = 0; i < this.formList.items.length; i++) {
            var item = this.formList.items[i];
            //解析from表单
            var obj = {};
            //绑定的key
            obj['modelKey'] = item.key;
            // obj['label'] = item.title+item.category;
            obj['category'] = item.category;
            obj['props'] = {
              placeholder: item.typeTitle
            };
            if (item.required === true) {
              obj['rules'] = {
                required: true
              };
            } else {
              obj['rules'] = {
                required: false
              };
            }
            if (item.category == 'phone') {
              obj['rules']['required'] = false
            }
            switch (item.type) {
              case 'input':
                this.model[item.key] = '';
                obj['type'] = 'input';
                break;
              case 'radio':
                this.model[item.key] = '';
                obj['type'] = 'select';
                obj['props'] = {
                  options: item.subitems,
                  placeholder: item.typeTitle
                }
                break;
              case 'date':
                this.model[item.key] = '';
                // obj['type'] = 'date';
                // obj['date'] = 'date';
                //日期
                break;
              case 'number':
                this.model[item.key] = '';
                //数字
                obj['type'] = 'input';

                break;
              case 'textarea':
                this.model[item.key] = '';
                //多行输入框
                obj['type'] = 'textarea';
                break;
              case 'select':
                this.model[item.key] = '';
                //下拉选择框
                obj['type'] = 'select';
                obj['props'] = {
                  options: item.subitems
                }
                break;
              case 'checkbox':
                this.model[item.key] = [];
                //多选按钮框
                obj['type'] = 'checkbox-group';
                obj['props'] = {
                  options: item.subitems
                }
                break;
              default:
                // obj['type'] = 'input';
            }
            this.fields.push(obj)
            if(obj.category == 'phone'){
              this.fields.push({
                category:'verification',
                // label:'验证码',
                modelKey:'I_66666'
              })
            }
            switch(item.category){
              case 'name' : obj.props.placeholder ='姓名';break;
              case 'phone' : obj.props.placeholder ='手机号';break;
              case 'verification' : obj.props.placeholder ='验证码';break;
              case 'email' : obj.props.placeholder ='邮箱';break;
              case 'gender' : obj.props['placeholder'] ='性别';break;
              case 'age' : obj.props.placeholder ='年龄';break;
              case 'birthday' : obj.props.placeholder ='出生年月';break;
              case 'salary' : obj.props.placeholder ='月收入';break;
              case 'city' : obj.props.placeholder ='所在城市';break;
              case 'wechat' : obj.props.placeholder ='微信';break;
              case 'qq' : obj.props.placeholder ='QQ';break;
            }

          }

        }
      },
      handleDatePick(data) {
        console.log('当前选中的日期:>>>>>>>', data);
        this.model[data.modelKey] = data.date
        this.birData = this.model[data.modelKey]
        console.log(this.birData,"????????");

      },
      getCode() {
        var phone = this.model.phone;
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
      codeChange(val) {//验证验证码
        console.log(val,"?????????");
      },
      //获取当前数据
      getFromData() {
        var self = this;
        var jsonObj = {};
        var openid = '';
        var unionid = '';
        if(self.userinfocachekey != null){
          openid = self.userinfocachekey.openid
          unionid = self.userinfocachekey.unionid
          console.log(openid,unionid, '提交时获取openid，unionid');
          jsonObj['wxOpenId'] = openid
          jsonObj['unionId'] = unionid
        }
        jsonObj['PortraitInfoCustomize'] = []
        // {
        //   title: CONTENTVAR.title,
        //   value: ''
        // }
        // console.log(self.fields,"这是表单信息");
        for (var i = 0; i < self.fields.length; i++) {
          if (self.fields[i].category === '') {
            //自定义信息项
            var key = self.fields[i]['modelKey'];
            var val = self.model[self.fields[i]['modelKey']];
            var obj = {};
            obj[key] = val;
            jsonObj['PortraitInfoCustomize'].push(obj);
          } else {
            var category = self.fields[i].category;
            var modelKey = self.model[self.fields[i]['modelKey']];
            var categoryVal = '';
            //处理传给后台的信息
            switch (category) {
              case 'gender':
                if (modelKey === '女') {
                  categoryVal = 2
                } else if (modelKey === '男') {
                  categoryVal = 1
                }
                break;
              case 'marital':
                if (modelKey === '未婚') {
                  categoryVal = 0
                } else if (modelKey === '已婚') {
                  categoryVal = 1
                }
                break;
              case 'age':
                if (modelKey === '15岁以下') {
                  categoryVal = 15
                } else if (modelKey === '16~20岁') {
                  categoryVal = 20
                } else if (modelKey === '21~25岁') {
                  categoryVal = 25
                } else if (modelKey === '26~30岁') {
                  categoryVal = 30
                } else if (modelKey === '31~40岁') {
                  categoryVal = 40
                } else if (modelKey === '40岁以上') {
                  categoryVal = 40
                }
                break;
              case 'salary':
                if (modelKey === '少于3000') {
                  categoryVal = 3000
                } else if (modelKey === '3000~5000') {
                  categoryVal = 5000
                } else if (modelKey === '5000~10000') {
                  categoryVal = 10000
                } else if (modelKey === '10000~20000') {
                  categoryVal = 20000
                } else if (modelKey === '20000以上') {
                  categoryVal = 20000
                }
                break;
              case 'birthday':
                categoryVal = self.birData
                break;
              default:
                categoryVal = modelKey
            }
            jsonObj[self.fields[i].category] = categoryVal
          }
        }
        jsonObj['activityId'] = mcMethod.info.activityId;
        //手机号重新赋值
        jsonObj['phone'] = self.model.phone;

        // 新增  增加渠道id 渠道名称 用户微信openid 微信头像 微信名称等数据
        var wxInfo = xyAuth.getCacheUserInfo()

        // jsonObj['wxOpenId'] = wxInfo.wxOpenId || ''
        jsonObj['wxHeadImgUrl'] = wxInfo.headimgurl || ''
        jsonObj['wxName'] = wxInfo.nickname || ''
        // jsonObj['wxExt'] = {}
        var channelInfo = {
          'channelName':xyAuth.getRequestValue('ffChannelCall') || '',
          'channelId':xyAuth.getRequestValue('ffChannelId') || '',
          'authorizeId':xyAuth.getRequestValue('authorizeId') || '',
          'authorizeName':xyAuth.getRequestValue('authorizeCall') || '',
        }
        for (var k in channelInfo) {              // 去除对象内多余的空值key
          if (channelInfo[k] === '') {
            delete channelInfo[k]
          }
        }
        if(JSON.stringify(channelInfo) != '{}') {
          jsonObj['channelList'] = channelInfo
        }


        console.log('发送的表单数据',jsonObj);

        mcMethod.query.request({
          data: jsonObj,
          url: mcMethod.url.savePortraitInfo,
          callback: function (data) {
            console.log(data,"提交之后返回数据");
            if (data.code == 0) {
              var toast = self.$createToast({
                txt: '参与成功!',
                type: 'txt',
                time: '2000',
                // $events: {
                //   timeout: () => {
                //     console.log(self.islinkUrl,self.islinkUrl.typetitle != undefined,self.islinkUrl.typetitle != '',"111111111")
                //   }
                // }
              })
              toast.show();
              if(JSON.stringify(self.islinkUrl) != {} && self.islinkUrl.typetitle != undefined && self.islinkUrl['typetitle'] != ''){
                console.log("2222222")
                var url = self.islinkUrl.typetitle
                self.islinkUrl = {}
                window.location.href = url
              }else {
                console.log("3333333----------------------333333")
                // location.reload();
                self.alreadySubmit = false;
              }
            }else {
              var toast = self.$createToast({
                txt: '参与失败!',
                time: '2000',
                type: 'txt',
              })
              toast.show()
            }
          }
        })

      },
      handlePhoneChange(val){
        if (CONTENTVAR.rexPhone.test(val)){
          this.isPhone = true
          // this.iswaring = false
          this.phoneWaring = false
        }else{
          this.phoneWaring = true
        }
      }
    },
    mounted: function () {
      this.alreadySubmit = true;
      if (CONTENTVAR.isActivityTemplateId === 1){
        this.isSubmit = false
      }else {
        this.isSubmit = true
      }
      this.formList = this.dataInfo
      this.init()
      console.log(this.fields,'this.fields');
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
    },
    watch: {
      dataInfo: function (newVal, oldVal) {
        if (newVal) {
          this.formList = newVal
          this.init();
        }
      }
    }
  },
  'emp_writing': {
    template: '#emp_writing',
    props: {
      dataInfo: {
        type: Object,
        default: {}
      }
    },
    data: function () {
      return {
        dataDetail: ''
      }
    },
    mounted() {
      this.dataDetail = this.dataInfo;
    },
    watch: {
      dataInfo: function (newVal, oldVal) {
        if (newVal) {
          this.dataDetail = newVal
        }
      }
    }
  },
  'emp_guest': {
    template: '#emp_guest',
    props: {
      dataInfo: {
        type: Object,
        default: {}
      }
    },
    data: function () {
      return {
        guestInfo: ''
      }
    },
    mounted() {
      this.guestInfo = this.dataInfo;
      console.log('嘉宾信息》》》', this.dataInfo)
    },
    watch: {
      dataInfo: function (newVal, oldVal) {
        if (newVal) {
          console.log('嘉宾信息》》》',newVal)
          this.guestInfo = newVal
        }
      }
    }
  },
  'empVideo': {
    template: '#emp_video',
    props: {
      dataInfo: {
        type: Object,
        default: {}
      },
      videoindex: {
        type: Number,
        default: 0
      }
    },
    data: function () {
      return {
        videoDetails:''
      }
    },
    mounted() {
      this.videoDetails = this.dataInfo;
      var player = larkplayer('my-video'+this.videoindex, {
        controls:false,
        playsinline:true,
      })
    },
    watch: {
      dataInfo: function (newVal, oldVal) {
        if (newVal) {
          this.videoDetails = newVal
        }
      }
    }
  },
  'empImg': {
    template: '#emp_img',
    props: {
      dataInfo: {
        type: Object,
        default: {}
      }
    },
    data: function () {
      return {
        picDetail:''
      }
    },
    mounted() {
      this.picDetail = this.dataInfo;
    },
    watch: {
      dataInfo: function (newVal, oldVal) {
        if (newVal) {
          this.picDetail = newVal
        }
      }
    }
  },
  'empCarouselImg': {
    template: '#emp_carouselImg',
    props: {
      dataInfo: {
        type: Object,
        default: {}
      }
    },
    data: function () {
      return {
        imgDetails:'',
        scrollOptions:{
          eventPassthrough:'vertical'
        }
      }
    },
    mounted() {
      this.imgDetails = this.dataInfo;
      // Vue.use(VueLazyload)
    },
    watch: {
      dataInfo: function (newVal, oldVal) {
        if (newVal) {
          this.imgDetails = newVal
        }
      }
    }
  }
}
var INDEXAPP = new Vue({
  el: '#app',
  components: {
    userInfo: templateView.userInfo,
    empForm: templateView.empForm,
    empWriting: templateView.emp_writing,
    empGuest: templateView.emp_guest,
    empVideo: templateView.empVideo,
    empImg: templateView.empImg,
    empCarouselImg: templateView.empCarouselImg
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
  },
  methods: {
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
              document.title = data.data.activityInfo.title
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
        channelName:xyAuth.getRequestValue('channelName') || '',
        channelId:xyAuth.getRequestValue('channelId') || '',
        authorizeId:xyAuth.getRequestValue('authorizeId') || '',
        authorizeName:xyAuth.getRequestValue('authorizeName') || '',
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
    if (mcMethod.info.activityTemplateId != '' && mcMethod.info.activityId == ''){//活动模板
      CONTENTVAR.isActivityTemplateId = 1
      this.findActivityTemplateById()
    }else {//正式访问的
      CONTENTVAR.isActivityTemplateId = 0
      this.queryActivityById()
    }
  },
  mounted: function () {
    this.userInfoCacheKey = JSON.parse(localStorage.getItem('_user'))
    console.log(this.userInfoCacheKey, '获取全局用户信息数据')
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