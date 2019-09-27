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
        model: {},
        fields: [],
        options: {
          scrollToInvalidField: true,
          layout: 'standard' // classic fresh
        }
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
        // for (var i = 0; i < this.model.length; i++) {
        //   this.$refs['form'].validate(this.model[i], (result) => {
        //     console.log(result);
        //   })
        // }
        for (var i = 0; i < this.fields.length; i++) {
          if (this.fields[i]['rules'] && this.fields[i]['rules']['required']) {
            if (this.$refs[this.fields[i]['modelKey']].constructor === Array) {
              var modelKeyList = this.$refs[this.fields[i]['modelKey']];
              for (var j = 0; j < modelKeyList.length; j++) {
                console.log(modelKeyList[j]);
                modelKeyList[j].validate(function (data) {
                  console.log('校验:', data)
                })
              }
            }
            // console.log(this.$refs[this.fields[i]['modelKey']]);
            
          }
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
      }
    },
    mounted: function () {
    
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
      console.log('第一次赋值:',this.dataInfo);
    },
    watch: {
      dataInfo: function (newVal, oldVal) {
        if (newVal){
          this.dataDetail = newVal
          console.log('watch:',this.dataDetail);
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
    empWriting: templateView.emp_writing
  },
  data: {
    activityDetails: [],
    activityForm: {},
    activityGuestInfo: [],
    activityInfo: {},
    writingList: [],
    sendAuthCode: true,/*布尔值，通过v-show控制显示‘获取按钮’还是‘倒计时’ */
    auth_time: 0, /*倒计时 计数器*/
  },
  methods: {
    queryActivityById: function () {
      var self = this;
      mcMethod.query.request({
        queryType: 'GET',
        url: mcMethod.url.queryActivityById,
        address: {
          activityId: '5d8d6edc0de8b30007524549'
        },
        callback: function (data) {
          if (data.code === 0 && data.data) {
            // console.log(data.data);
            //基础信息
            if (data.data.activityInfo) {
              self.activityInfo = data.data.activityInfo
            }
            if (data.data.activityForm) {
              self.activityForm = data.data.activityForm
            } else {
              self.activityForm = ''
            }
            if (data.data.activityDetails && data.data.activityDetails.length > 0) {
              self.writingList = data.data.activityDetails;
            }
          }
        }
      })
    },
    getCode() {
      this.sendAuthCode = false;
      this.auth_time = 60;
      var auth_timetimer = setInterval(() => {
        this.auth_time--;
        if (this.auth_time <= 0) {
          this.sendAuthCode = true;
          clearInterval(auth_timetimer);
        }
      }, 1000);
    }
  },
  created: function () {
    this.queryActivityById()
  },
  mounted: function () {
  
  }
})
