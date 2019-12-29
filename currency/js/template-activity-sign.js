var INDEXAPP = new Vue({
  el: '#app',
  // components: {
  //   userInfo: templateView.userInfo,
  //   empForm: templateView.empForm,
  //   empWriting: templateView.emp_writing,
  //   empGuest: templateView.emp_guest,
  //   empVideo: templateView.empVideo,
  //   empImg: templateView.empImg,
  //   empCarouselImg: templateView.empCarouselImg
  // },
  data: {
    showPage: 1, //默认扫码签到
    returnTimer: null,
    messageQue: [],
    userName: 'ssssssss',
    count: 0
  },
  watch: {
    // messageQue(newVal, oldVal) {
    //   setTimeout(function () {
    //     that.showPage = 2
    //   }, 1000)
    // }
  },
  methods: {
    geSearchVal: function (searchName) {
      var url = location.search; //获取url中"?"符后的字串 
      var theRequest = new Object();
      var searchVal = '';
      if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for (var i = 0; i < strs.length; i++) {
          theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
        }
      }
      for (key in theRequest) {
        if (key === searchName) {
          searchVal = theRequest[key]
        }
      }
      return searchVal;
    },
    sleep: function (sleepTime) {
      var start = new Date().getTime();
      while (true) {
        if (new Date().getTime() - start > sleepTime) {
          break;
        }
      }
    }
  },
  created: function () {
    var that = this;
    // 获取页面search参数
    var deviceNumber = this.geSearchVal("deviceNumber")

    //实现化WebSocket对象，指定要连接的服务器地址与端口  建立连接
    //等同于socket = new WebSocket("ws://localhost:8888/api/websocket/25");
    var socketUrl = "wss://bs.yunshicloud.com/api/websocket/5dea74006282c959b1ddedd1/5dea74006282c959b1ddedd1";
    // var socketUrl = "wss://alpha-jk.yunshicloud.com/api/websocket/"+deviceNumber;
    socketUrl = socketUrl.replace("https", "wss").replace("http", "ws");
    chapterDiscussScoket = new WebSocket(socketUrl);
    //打开事件
    chapterDiscussScoket.onopen = function () {
      console.log("websocket已打开");
      heartbeatIntervalId = setInterval(function () {
        if (that.count > 10) {
          clearInterval(heartbeatIntervalId)
        }
        // console.log(that.count)
        var obj = {
          "c_timestamp": 1577451559954,
          "msg": that.count,
          "type": "msg",
          "uname": "CHO"
        }
        obj = JSON.stringify(obj);
        chapterDiscussScoket.send(obj);
      },100);
    };
    //获得消息事件
    chapterDiscussScoket.onmessage = function (msg) {
      // console.log('开始处理接收到的消息: ' + msg.data);
      //发现消息进入    开始处理前端触发逻辑
      console.log("获取消息")
      var messageData = JSON.parse(msg.data)
      console.log(messageData.msg, msg.data)

      that.messageQue.push(msg.data)

      // if (that.count >= 20) {
      //   that.showPage = 1
      //   that.count += 1

        if (that.returnTimer) {
          clearTimeout(that.returnTimer)
        }
        that.returnTimer = setTimeout(function () {
          that.showPage = 1
        }, 5000)

      // } else {
        if (that.count % 2 === 1) {
          that.sleep(1000);
          that.showPage = 2
          that.count += 1
          that.userName = messageData.msg
        } else {
          that.sleep(1000);
          that.showPage = 3
          that.count += 1
          that.userName = messageData.msg
        }
      // }

      // if(that.messageQue.length!==0){
      //   that.messageQue.push(time)
      // }else{
      //   that.returnTimer = setTimeout(function () {
      //     that.showPage = 1;
      //   }, 5000)
      // }

      // if(that.returnTimer){
      //   clearTimeout(that.returnTimer);
      // }

      if (msg.data == 1) {
        console.log("无效设备")
        console.log("无效码")
        console.log("报名成功")
        console.log("报名失败")
        console.log("已报名")
      } else if (msg.data == 2) {
        console.log("签到成功")
      } else if (msg.data == 3) {
        console.log("签到失败")
      } else if (msg.data == 4) {
        console.log("签到完成")
      }
    };
    //关闭事件
    chapterDiscussScoket.onclose = function () {

    };
    //发生了错误事件
    chapterDiscussScoket.onerror = function () {
      console.log("websocket发生了错误");

    }



  },
  mounted: function () {

  }
})