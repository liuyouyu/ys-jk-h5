Vue.component('catalogue', {

  template : `
    <div v-if= 'isShow' class='catalogue'>
    <div class='catalogue-tit'><span></span>推荐内容</div>
    <div v-for='item in catalogueData' class='c-item background'>
      <div @click='openDetail(item.url)' class='c-box'>
        <div v-if='item.thumbnail' class='c-img'>
          <img :src="item.thumbnail" alt="图片丢了"/>
        </div>
        <div class='c-info' :style="item.thumbnail?'':'width:73%'" >
          <div class='c-title'>{{item.title}}</div>
          <div class='c-author'>{{item.utime}}</div>
        </div>
      </div>
      </div>
    </div>
  `,

  props:{
    isshow:{  //是否显示推荐内容
      type: Boolean, default: true
    },
    showlist:{  //接收显示条数
      type: String, default: '8'
    }
  },

  data() {
    return {
      isShow: this.isshow,  // 是否显示重新赋值
      showList: this.showlist,  // 显示条数重新赋值
      catalogueData:[]  // 请求的数据
    }
  },

  mounted() {
    console.log('推荐内容组件',this.isshow);
    this.getCatalogue()
  },

  methods: {
    getCatalogue() {
      _this = this
      $.ajax({
        type: 'GET',
        url: 'http://test-cdapi.yunshicloud.com/api/release/catalogue/v1/queryCatalogue',
        data: {
          // companyId:'5e4bdb4eb2584b9d9d00d4044232d52a',
          companyId:'7674F33E470D459E',
          versionId:'1',
          serviceCode:'cloudemp',
          pageSize:_this.showList,
          pageNumber:'1'
        },
        contentType: "application/json ; charset=utf-8",
        dataType: "json",
        success: function (data) {
          console.log('文稿信息',data.data);
          _this.catalogueData = data.data
        },
        error: function (err) {
          console.log('错误',err);
        }
      });
    },
    openDetail(url){  // 如果没有地址不跳转文章详情
      if(url){
        window.location.href = url
      }else{
        return
      }
    }
  },

})