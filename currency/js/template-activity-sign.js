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
    showPage: 0, //默认扫码签到
    returnTimer: null,
    messageQue: [],
    messageQueIndex: -1,
    userName: 'xx(先生/女士)',
    count: 0,
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
    },
    reconnectionSocket: function () {
      var that = this;
      //自动重连
      //判断是否断开:   0 - 表示连接尚未建立。 1 - 表示连接已建立，可以进行通信。 2 - 表示连接正在进行关闭。 3 - 表示连接已经关闭或者连接不能打开。
      if (chapterDiscussScoket.readyState == 1) {
        clearTimeout(chapterDiscussSetTimeout);
        return;
      } else {
        if (chapterDiscussScoket.readyState == 3) {
          that.connectSocket()
        }
        chapterDiscussSetTimeout = setTimeout(function () {
          that.reconnectionSocket();
        }, 500);
      }
    },
    closeChapterDiscussScoket: function () {
      if (typeof (WebSocket) == "undefined") {
        console.log("您的浏览器不支持WebSocket");
      } else {
        try {
          if (undefined != chapterDiscussScoket) {
            chapterDiscussScoket.close();
          }
        } catch (e) {}
      }
    },
    connectSocket: function () {
      var that = this;
      // 获取页面search参数
      var deviceNumber = this.geSearchVal("deviceNumber")

      //实现化WebSocket对象，指定要连接的服务器地址与端口  建立连接
      //等同于socket = new WebSocket("ws://localhost:8888/api/websocket/25");
      // var socketUrl = "wss://bs.yunshicloud.com/api/websocket/5dea74006282c959b1ddedd1/5dea74006282c959b1ddedd1";
      // var socketUrl = "wss://alpha-jk.yunshicloud.com/api/websocket/" + deviceNumber;
      var socketUrl = CONFIG.cloudUrl +"websocket/" + deviceNumber;
      socketUrl = socketUrl.replace("https", "wss").replace("http", "ws");
      
      if (typeof (WebSocket) == "undefined") {
        alert("您的浏览器不支持websocket")
        return 
      }
      chapterDiscussScoket = new WebSocket(socketUrl);
      //打开事件
      chapterDiscussScoket.onopen = function () {
        // console.log("websocket已打开");
        // var count = 0;
        // heartbeatIntervalId = setInterval(function () {
        //   count += 1;
        //   if (count > 3) {
        //     clearInterval(heartbeatIntervalId)
        //   }
        //   // console.log(that.count)
        //   var obj = {
        //     "c_timestamp": 1577451559954,
        //     "msg": count,
        //     "type": "msg",
        //     "uname": "CHO"
        //   }
        //   obj = JSON.stringify(obj);
        //   // chapterDiscussScoket.send(obj);
        // }, 10);
      };
      //获得消息事件
      chapterDiscussScoket.onmessage = function (msg) {
        // console.log('开始处理接收到的消息: ' + msg.data);
        //发现消息进入    开始处理前端触发逻辑
        console.log("获取消息")
        var messageData = JSON.parse(msg.data)
        console.log(messageData.msg, msg.data)
        that.messageQueIndex+=1;
        that.messageQue.push(messageData.msg)

        // if (that.count >= 20) {
        //   that.showPage = 1
        //   that.count += 1

        if (that.returnTimer) {
          clearTimeout(that.returnTimer)
        }
        that.returnTimer = setTimeout(function () {
          that.showPage = 0
          that.userName= ''

          // 6s回待签到页面
        }, 6000)
        // } else {
        // if (that.count % 2 === 1) {
        //   that.sleep(5000);
        //   that.showPage = 2
        //   console.log(that.messageQue[that.messageQueIndex])
        //   that.userName =  messageData.msg
        //   // that.userName =  that.messageQue[that.messageQueIndex]
        // } else {
        //   that.sleep(5000);
        //   that.showPage = 3
        //   console.log(that.messageQue[that.messageQueIndex])

        //   that.userName = messageData.msg
        //   // that.userName = that.messageQue[that.messageQueIndex]
        // }
        if (messageData.statusCode === "0001") {
          that.showPage = 1
        } else if (messageData.statusCode === "0002") { 
          that.showPage = 2
        } else if (messageData.statusCode === "0003") {
          var  gender =messageData.gender==="男"?'先生':(messageData.gender==="女"?'女士':'(先生/女士)')
          that.userName=messageData.userName + gender
          that.showPage = 3
        } else if (messageData.statusCode === "0004") {
          that.showPage = 4
        } else if (messageData.statusCode === "0005") {
          that.showPage = 5
        } else if (messageData.statusCode === "0006") {
          that.showPage = 6
        } else if (messageData.statusCode === "0007") {
          var  gender =messageData.gender==="男"?'先生':(messageData.gender==="女"?'女士':'(先生/女士)')
          that.userName=messageData.userName + gender
          that.showPage = 7
        } else if (messageData.statusCode === "0008") {
          that.showPage = 8
        } else if (messageData.statusCode === "0009") {
          that.showPage = 9
        }
      };
      //关闭事件
      chapterDiscussScoket.onclose = function () {
        that.reconnectionSocket()
      };
      //发生了错误事件
      chapterDiscussScoket.onerror = function () {
        that.reconnectionSocket()
      }
      window.onbeforeunload = function () {
        that.closeChapterDiscussScoket()
      }
      window.unload = function () {
        that.closeChapterDiscussScoket()
      }

    }
  },
  created: function () {
    this.connectSocket()
  },
  mounted: function () {
  }
})