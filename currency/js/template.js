
var CONTENTVAR = {
  title: '',
  rexPhone: /^1(2|3|4|5|6|7|8|9)\d{9}$/
}
var datePick = {
  props: {
    modelKey: {
      type: String,
      default: ''
    }
  },
  template: '#datePick',
  data: function () {
    return {
      dateValue: ''
    }
  },
  methods: {
    showDatePicker() {
      if (!this.datePicker) {
        this.datePicker = this.$createDatePicker({
          title: '日期选择',
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
        linkUrl: {},
        birData:''
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
                console.log(this.$refs[this.fields[i]['modelKey']],'modelKeyList<<<<<<<<<');
                for (var j = 0; j < modelKeyList.length; j++) {
                  var vaildItem = modelKeyList[j].validate()
                  Promise.all([vaildItem]).then((vaildItem) => {
                    console.log('当前》》》》》', vaildItem);
                  })
                }
              }
              // console.log(this.$refs[this.fields[i]['modelKey']]);
            }else {

            }
          } else {//type类型为undefined的 目前有date
            // console.log('当前为日期类型')
            // console.log(this.model.modelKey);
            console.log('modelKey:', this.fields[i]['modelKey']);
            console.log('当前值:', this.model[this.fields[i]['modelKey']]);
            // if (){
            //
            // }
          }
        }
        var self = this;
        if (!CONTENTVAR.rexPhone.test(this.model.phone)){
          const toast = self.$createToast({
            txt: '请输入有效手机号!',
            type: 'txt',
          })
          toast.show()
        }
        if(this.model.userCode == '' && this.isPhone == true){
          const toast = self.$createToast({
            txt: '请输入验证码!',
            type: 'txt',
          })
          toast.show()
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
              console.log(1111111111)
              if(self.model.userCode != ''){
                const toast = self.$createToast({
                  txt: '验证码错误!',
                  type: 'txt',
                })
                toast.show()
              }
            }
          },
          errorCallback: function (err) {
            const toast = self.$createToast({
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
        
        console.log(this.model,'this.model<<<<<<<<<,');
        // console.log('submit')
      },
      validateHandler(result) {
        console.log(result.validity,"result??????????")
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
              this.linkUrl = fromData[i]
              fromData.splice(i,1)
              this.isLink = 1
            }
          }
          console.log(this.linkUrl,"??????????this.linkUrl");
          for (var i = 0; i < this.formList.items.length; i++) {
            var item = this.formList.items[i];
            //解析from表单
            var obj = {};
            //绑定的key
            obj['modelKey'] = item.key;
            obj['label'] = item.title;
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
                  options: item.subitems
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
          const toast = this.$createToast({
            txt: '手机号码有误，请重填写',
            type: 'txt',
          })
          toast.show()
          return false;
        }
        var self = this;
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
              self.sendAuthCode = false;
              self.auth_time = 60;
              var auth_timetimer = setInterval(() => {
                self.auth_time--;
                if (self.auth_time <= 0) {
                  self.sendAuthCode = true;
                  clearInterval(auth_timetimer);
                }
              }, 1000);
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
        jsonObj['PortraitInfoCustomize'] = []
        // {
        //   title: CONTENTVAR.title,
        //   value: ''
        // }
        console.log(self.fields,"这是表单信息");
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

        console.log(jsonObj,"jsonObj参数？？？？、、");
        mcMethod.query.request({
          data: jsonObj,
          url: mcMethod.url.savePortraitInfo,
          callback: function (data) {
            if (data.code == 0) {
              const toast = self.$createToast({
                txt: '提交成功!',
                type: 'txt',
                time: '2000',
                $events: {
                  timeout: () => {
                    if(self.linkUrl != {} && self.linkUrl.typetitle != ""){
                      var url = self.linkUrl.typetitle
                      window.location.href = url
                    }else {
                      location.reload();
                    }
                  }
                }
              })
              toast.show();
            }else {
            
            }
          }
        })
      },
      handlePhoneChange(val){
        if (CONTENTVAR.rexPhone.test(val)){
          this.isPhone = true
        }else{

        }
      }
    },
    mounted: function () {
      console.log(this.dataInfo,"表单数据");
      this.formList = this.dataInfo
      this.init()
    },
    watch: {
      dataInfo: function (newVal, oldVal) {
        if (newVal) {
          console.log(newVal,"监听from表单数据？？？？、、、");
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
      }
    },
    data: function () {
      return {
        videoDetails:''
      }
    },
    mounted() {
      this.videoDetails = this.dataInfo;
      console.log(this.videoDetails,"视频数据");
      console.log(document.getElementById('my-video'),"??????????");
      var payler = larkplayer('my-video', {
        controls: true,
      })
    },
    dataInfo: function (newVal, oldVal) {
      if (newVal) {
        this.videoDetails = newVal
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
    dataInfo: function (newVal, oldVal) {
      if (newVal) {
        this.picDetail = newVal
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
        imgDetails:''
      }
    },
    mounted() {
      this.imgDetails = this.dataInfo;
    },
    dataInfo: function (newVal, oldVal) {
      if (newVal) {
        this.imgDetails = newVal
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
    videoData : []//视频
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
            if (data.code === 0 && data.data) {
              console.log(data.data,"数据？？？？？？、、、、");
              self.activityData = data.data.modelExt
              //基础信息
              if (data.data.activityInfo) {
                self.activityInfo = data.data.activityInfo
                CONTENTVAR.title = data.data.activityInfo.title
              }
            }
          }
        })
      } else {
      
      }
      
    },
    pvSum: function () {
      mcMethod.query.request({
        url: mcMethod.url.pvSum,
        queryType: 'GET',
        address: {
          activityId: mcMethod.info.activityId
        },
        callback: function (data) {
        }
      })
    }
  },
  created: function () {
    this.pvSum()
    this.queryActivityById()
  },
  mounted: function () {
  
  }
})