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
      this.$emit('modelKey', {
        date: this.dateValue,
        modelKey: this.modelKey
      })
    },
    cancelHandle() {
    
    }
  },
  mounted() {
  
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
        valid: undefined,
        model: {
          userPhone: '',
          userCode: ''
        },
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
        isPhone: false
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
        for (var i = 0; i < this.fields.length; i++) {
          if (this.fields[i]['type']) {
            if (this.fields[i]['rules'] && this.fields[i]['rules']['required']) {
              console.log(this.$refs[this.fields[i]['modelKey']]);
              if (this.$refs[this.fields[i]['modelKey']] && this.$refs[this.fields[i]['modelKey']].constructor === Array) {
                var modelKeyList = this.$refs[this.fields[i]['modelKey']];
                for (var j = 0; j < modelKeyList.length; j++) {
                  var vaildItem = modelKeyList[j].validate(function (valid) {
                    console.log('当前的值:', valid);
                  })
                  Promise.all([vaildItem]).then((vaildItem) => {
                    console.log('当前》》》》》', vaildItem);
                  })
                  // console.log(modelKeyList[j]);
                }
              }
              // console.log(this.$refs[this.fields[i]['modelKey']]);
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
              const toast = self.$createToast({
                txt: '验证码错误!',
                type: 'txt',
              })
              toast.show()
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
        
        // console.log(this.model);
        // console.log('submit')
      },
      validateHandler(result) {
        this.validity = result.validity
        this.valid = result.valid
        // console.log('validity', result.validity, result.valid, result.dirty, result.firstInvalidFieldIndex)
      },
      init() {
        // console.log(this.formList);
        if (this.formList
          && this.formList.items
          && this.formList.items.length > 0) {
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
            if (item.required === 'true') {
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
        console.log('当前选中的日期:', data);
        this.model[data.modelKey] = data.date
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
      codeChange() {//验证验证码
      
      
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
              default:
                categoryVal = modelKey
            }
            jsonObj[self.fields[i].category] = categoryVal
          }
        }
        jsonObj['activityId'] = mcMethod.info.activityId;
        //手机号重新赋值
        jsonObj['phone'] = self.model.phone;
        
        
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
                    location.reload();
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
      console.log(this.dataInfo);
    },
    watch: {
      dataInfo: function (newVal, oldVal) {
        if (newVal) {
          console.log(newVal);
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
        type: Array,
        default: []
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
        type: Array,
        default: []
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
  }
}

var INDEXAPP = new Vue({
  el: '#app',
  components: {
    userInfo: templateView.userInfo,
    empForm: templateView.empForm,
    empWriting: templateView.emp_writing,
    empGuest: templateView.emp_guest
  },
  data: {
    activityDetails: [],
    activityForm: {},
    activityGuestInfo: [],
    activityInfo: {},
    writingList: [],
    
    guestData: []
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
              
              //基础信息
              if (data.data.activityInfo) {
                self.activityInfo = data.data.activityInfo
                CONTENTVAR.title = data.data.activityInfo.title
              }
              //form表单
              if (data.data.activityForm) {
                self.activityForm = data.data.activityForm
              } else {
                self.activityForm = ''
              }
              //文案信息
              if (data.data.activityDetails && data.data.activityDetails.length > 0) {
                self.writingList = data.data.activityDetails;
              }
              //嘉宾信息
              if (data.data.activityGuestInfo && data.data.activityGuestInfo.length > 0) {
                self.guestData = data.data.activityGuestInfo
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
