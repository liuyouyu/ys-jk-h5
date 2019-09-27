var CONTENTVAR = {
  title: ''
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
      datePick: datePick
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
        // mcMethod.query.request({
        //
        // })
        console.log('点击提交按钮')
        var jsonObj = {};
        for (var i = 0; i < this.fields.length; i++) {
          if (this.fields[i].category === '') {
            //自定义信息项
          } else {
            // console.log(this.fields[i].category);
            console.log(this.fields[i]['modelKey']);
            console.log(this.model[this.fields[i]['modelKey']]);
            jsonObj[this.fields[i].category] = this.model[this.fields[i]['modelKey']]
          }
        }
        jsonObj['activityId'] = mcMethod.info.activityId
        jsonObj['PortraitInfoCustomize'] = {
          title: CONTENTVAR.title,
          type: '',
          value: ''
        }
        mcMethod.query.request({
          data: jsonObj,
          url: mcMethod.url.savePortraitInfo,
          callback: function (data) {
            console.log(data);
          }
        })
        console.log(jsonObj);
        // for (var i = 0; i < this.model.length; i++) {
        //   this.$refs['form'].validate(this.model[i], (result) => {
        //     console.log(result);
        //   })
        // }
        // for (var i = 0; i < this.fields.length; i++) {
        //   if (this.fields[i]['rules'] && this.fields[i]['rules']['required']) {
        //     if (this.$refs[this.fields[i]['modelKey']].constructor === Array) {
        //       var modelKeyList = this.$refs[this.fields[i]['modelKey']];
        //       for (var j = 0; j < modelKeyList.length; j++) {
        //         console.log(modelKeyList[j]);
        //         modelKeyList[j].validate(function (data) {
        //           console.log('校验:', data)
        //         })
        //       }
        //     }
        //     // console.log(this.$refs[this.fields[i]['modelKey']]);
        //
        //   }
        // }
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
            if (item.required) {
              console.log(item.required);
              obj['rules'] = {
                required: true
              };
            } else {
              obj['rules'] = {
                required: false
              };
            }
            this.model[item.key] = '';
            switch (item.type) {
              case 'input':
                obj['type'] = 'input';
                break;
              case 'radio':
                obj['type'] = 'radio-group';
                obj['props'] = {
                  options: item.subitems
                }
                break;
              case 'date':
                // obj['date'] = 'date';
                //日期
                break;
              case 'number':
                //数字
                obj['type'] = 'input';
                break;
              case 'textarea':
                //多行输入框
                obj['type'] = 'textarea';
                break;
              case 'select':
                //下拉选择框
                obj['type'] = 'select';
                obj['props'] = {
                  options: item.subitems
                }
                break;
              case 'checkbox':
                //多选按钮框
                obj['type'] = 'checkbox-group';
                obj['props'] = {
                  options: item.subitems
                }
                break;
              default:
            }
            
            this.fields.push(obj)
          }
          // console.log(this.fields);
          // console.log(this.model);
        }
      },
      handleDatePick(data) {
        this.model[data.modelKey] = data.date
      },
      getCode() {
        var phone = this.model.userPhone;
        if (!(/^1(3|4|5|6|7|8|9)\d{9}$/.test(phone))) {
          console.log('手机验证码失败!')
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
            phone: phone
          },
          callback: function (data) {
            if (data.code == 0) {
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
      codeChange(){//验证验证码
      
      
      }
    },
    mounted: function () {
      console.log(this.dataInfo);
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
          console.log('watch:', this.dataDetail);
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
      console.log('嘉宾》》》》', this.dataInfo);
      this.guestInfo = this.dataInfo;
    },
    watch: {
      dataInfo: function (newVal, oldVal) {
        if (newVal) {
          console.log('嘉宾信息', newVal);
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
              // console.log(data.data);
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
                console.log(self.guestData);
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
          console.log(data);
        },
        errorCallback: function (err) {
          console.log(err);
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
