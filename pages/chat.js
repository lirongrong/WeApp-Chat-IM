// pages/user/chat.js
var util = require('../utils/util.js');
var app = getApp();
//websocket心跳重连对象
let heartCheck = {
  timeout: 1000,//1s
  timeoutObj: null,
  serverTimeoutObj: null,
  //重置
  reset: function () {
    clearTimeout(this.timeoutObj);
    clearTimeout(this.serverTimeoutObj);
    return this;
  },
  //开始
  start: function () {
    wx.sendSocketMessage({
      data: "null",
    });
  }, 
}; 
//微信小程序新录音接口，录出来的是aac或者mp3，这里要录成mp3
const recorderManager = wx.getRecorderManager();
const options = {
  duration: 600000,//录音时长，这里设置的是最大值10分钟
  sampleRate: 44100,
  numberOfChannels: 1,
  encodeBitRate: 192000,
  format: 'mp3',
  //frameSize: 50 
};

//音频播放
const innerAudioContext = wx.createInnerAudioContext()

Page({ 
  data: {  
    taskId:'',
    userId:'',
    chatList:[],//聊天内容
    isShowModelUp:false,//底部弹框显示true,隐藏为false 
    isLuYin:false,//没有录音false,开始录音true
    luYinText:'按住说话',
    audioUrl:'',//录音文件地址
    isShowLuYin:false,//true为开始播放，false为取消播放
    inputValue:'',//输入框内容
    lockReconnect:false,//默认进来是断开链接的
    limit:0,//重连次数
  }, 
  onLoad: function (options) { 
    this.linkSocket(); 
  }, 
  //连接socket
  linkSocket:function(){
    let that = this;
    wx.connectSocket({
      //url: app.globalData.wsUrl + 'websocket?' + this.data.taskId + '&' + this.data.userId,
      url:app.globalData.wsUrl,
      success() {
        console.log('连接成功')
        wx.onSocketMessage((res) => {
          console.log(res.data);
          //收到消息
          that.pushChatList(0, {
            text: res.data
          });
        })
        wx.onSocketOpen(() => {
          console.log('WebSocket连接打开')
          heartCheck.reset().start()
        })
        wx.onSocketError(function (res) {
          console.log('WebSocket连接打开失败')
          that.reconnect()
        })
        wx.onSocketClose(function (res) {
          console.log('WebSocket已关闭！')
          that.reconnect()
        })
      }
    }) 
  }, 
  //断线重连
  reconnect() { 
    var that = this;
    if (that.lockReconnect) return;
    that.lockReconnect = true;
    clearTimeout(that.timer)
    if (that.data.limit < 12) {
      that.timer = setTimeout(() => {
        that.linkSocket();
        that.lockReconnect = false;
      }, 5000);
      that.setData({
        limit: that.data.limit + 1
      })
    } 
  }, 
  //打开底部弹框
  showModelUp:function(){ 
    var that=this; 
    if (that.data.isShowModelUp==false){
      that.setData({
        isShowModelUp: true, 
      })
    }else{
      that.setData({
        isShowModelUp: false, 
      })
    } 
  },
  //关闭底部弹框
  closeModelUp:function(){
    var that=this;
    that.setData({
      isShowModelUp:false, 
    })
  },
  //选择照片
  chooseImage:function(){
    var that=this;
    wx.chooseImage({ 
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) { 
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        console.log(res);
        that.pushChatList(1,{
          imgUrl: tempFilePaths,
        }) 
        //关闭弹窗
        that.closeModelUp();
        that.pageScrollToBottom();
      }
    })
  },
  //界面滚到最底端
  pageScrollToBottom: function () {
    wx.createSelectorQuery().select('#bottom').boundingClientRect(function (rect) {
      console.log(rect.top);
      console.log(rect.bottom);
      // 使页面滚动到底部
      wx.pageScrollTo({
        scrollTop: rect.bottom + 200
      })
    }).exec()
  },
  //预览图片
  previewImage:function(e){
    console.log(e);
    var url=e.currentTarget.dataset.src;
    var that=this;
    wx.previewImage({
      current: url[0], // 当前显示图片的http链接
      urls: url // 需要预览的图片http链接列表
    })
  },
  //拍摄
  paishe:function(){
    var that = this;
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        console.log(res);
        that.pushChatList(1,{
          imgUrl: tempFilePaths,
        })
        //关闭弹窗
        that.closeModelUp();
        that.pageScrollToBottom();
      }
    })
  },
  //发送位置
  getlocat: function () {
    var that = this
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude,
          markers: [{
            latitude: res.latitude,
            longitude: res.longitude,
            name: '时代一号',
            desc: '现在的位置'
          }], 
        })
        that.pushChatList(1,{
          map: true
        })
      }
    })
    that.closeModelUp();
    that.pageScrollToBottom();
  },
  //切换是否录音按钮
  btnRecord:function(){ 
    var that=this;
    if (that.data.isLuYin==false){
      that.setData({
        isLuYin: true
      });
    }else{
      that.setData({
        isLuYin: false,
        luYinText: '按住说话'
      });
    }  
  },
  //开始录音
  startRecord:function(e){ 
    var that=this;
    that.setData({
      luYinText:'录音中...', 
    }); 
    recorderManager.start(options); 
    recorderManager.onStart(() => {
      console.log('recorder start')
    })
  },
  //结束录音
  stopRecord:function(){ 
    var that = this;
    that.setData({
      luYinText: '按住说话'
    });
    recorderManager.stop();  
    recorderManager.onStop((res) => {
      console.log('recorder stop', res)
      const { tempFilePath } = res;
      that.pushChatList(1,{
        audioUrl: res.tempFilePath,
        audioDuration: (res.duration / 60000).toFixed(2),//录音时长,转为分,向后取两位,
      })
      that.setData({
        audioUrl: res.tempFilePath,
        audioDuration: (res.duration / 60000).toFixed(2),//录音时长,转为分,向后取两位,
      })
    })
    //关闭弹窗
    that.closeModelUp();
    that.pageScrollToBottom();
  },
  //录音、停止播放
  playRecord:function(e){  
    console.log(e);
    var that=this;  
    innerAudioContext.autoplay = true;
    innerAudioContext.src = that.data.audioUrl
    //innerAudioContext.src = 'http://ws.stream.qqmusic.qq.com/M500001VfvsJ21xFqb.mp3?guid=ffffffff82def4af4b12b3cd9337d5e7&uin=346897220&vkey=6292F51E1E384E061FF02C31F716658E5C81F5594D561F2E88B854E81CAAB7806D5E4F103E55D33C16F3FAC506D1AB172DE8600B37E43FAD&fromtag=46';//测试音频文件
    if (!e.currentTarget.dataset.isshowluyin){//开始播放 
      //innerAudioContext.play();//兼容起见用它
      innerAudioContext.onPlay(() => {
        console.log('开始播放');
        that.setData({ 
          isShowLuYin: true
        }); 
        return;
      }); 
    }else{//暂停播放 
      innerAudioContext.pause();
      console.log("暂停");
      that.setData({
        isShowLuYin: false
      });
      return; 
    } 
  },
  //输入框点击完成按钮时触发
  btnConfirm:function(e){
    var that = this;
    if (typeof (e) == 'undefined' || e.detail.value == ''){
      return false;
    }else {  
      var value = e.detail.value;
      that.pushChatList(1,{
        text: value
      });
      that.setData({
        inputValue:''//清空输入框
      })
      //发送数据
      wx.sendSocketMessage({
        data: value
      })
      //关闭弹窗
      that.closeModelUp();
      that.pageScrollToBottom();
    }
  },
  //页面隐藏/切入后台时触发
  onHide:function(){
    wx.onSocketClose(function (res) {
      console.log('WebSocket已关闭！') 
    })
  },
  //页面卸载时触发
  onUnload:function(){
    wx.onSocketClose(function (res) {
      console.log('WebSocket已关闭！')
    })
  },
  //pushchatList
  //enu:0 是客服发送的消息
  //enu:1 是我发送的消息
  pushChatList:function(enu,options){
    var that = this;
    var defaults = {
      userImage: '',
      text: '',
      isAdmin: false,
    }
    options = util.extendObj(defaults,options);
    options.time = util.formatDateTime(util.getNowFormatDate());
    console.log(options); 
    if(enu == 0){
      options.userImage = '../images/admin.png';
      options.isAdmin = false;  
    }else if(enu==1){
      options.userImage = app.globalData.wxUserInfo.avatarUrl;
      options.isAdmin = true;
    }
    var t = that.data.chatList;
    t.push(options)
    that.setData({
      chatList: t
    });
  }
})