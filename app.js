//app.js
App({
    //初始化事件
    onLaunch: function () {
        var that = this;
        console.log("appjs-onLaunch");       
    },

    //获取微信用户信息
    getWxUserInfo: function (callback) {
        var that = this;
        //获取微信用户信息
        wx.getUserInfo({
            success: function (res) {
                var data = JSON.parse(res.rawData);
                data.iv = res.iv;
                data.encryptedData = res.encryptedData;
                that.setwxUserInfo(data);
                console.log(that.globalData.wxUserInfo);
                if (typeof (callback) == "function") {
                    callback(res);
                }
            }
        })
    },

    //退出当前登陆
    onHide: function () {
        // this.logOut();
    },

    //页面第一次加载执行
    onLoad: function () {
        var that = this;
    },

    //页面每次打开
    onShow: function () {
        var that = this;
        //登陆授权 
        that.checkAuthorization(that.onLogin);
    },
 

    //验证授权
    checkAuthorization: function (callback) {
        var that = this;
        //登陆过后则不需要再登陆
        if (that.globalData.isLoginErp) callback();
        //查看是否授权
        else if (wx.getSetting({
          success: function (res) {
            if (res.authSetting['scope.userInfo']) {
              console.log('用户已经授权,登陆ERP获取unioid');
              console.log('iv:' + that.globalData.wxUserInfo.iv);
              console.log("data:" + that.globalData.wxUserInfo.encryptedData);         
              that.loginErp(callback);
            }
            else {
              console.log('用户未授权,转至授权页面');
              wx.reLaunch({
                url: '/pages/home/temp'
              })
            }
          }
        }));
    },

    //登陆ERP
    loginErp: function (callback) {
        var that = this;
        wx.login({
            success: function (res) {
                var code = res.code;
                console.log('loginErpCode:' + code);
                that.getWxUserInfo(function () {
                    wx.request({
                        url: that.globalData.apiHost + 'up/Supplier/Login?code=' + code + '&iv=' + that.globalData.wxUserInfo.iv + '&encryptedData=' + that.globalData.wxUserInfo.encryptedData,
                        method: 'GET',
                        success: function (res) {
                            //业务异常处理
                            if (res.statusCode == 250) {
                                wx.showToast({
                                    title: res.data,
                                    duration: 2000
                                })
                            }
                            else {
                                console.log("登录成功,返回数据：" + res.data);
                                that.setcurrentUserInfo(res.data.supplier);
                                that.globalData.accessToken = res.data.accessToken;
                                that.globalData.unionId = res.data.unionid;
                                that.globalData.isLoginErp = true;
                                
                                if (typeof (callback) == "function") {
                                    callback(res);
                                }
                            }
                        },
                        fail: function (res) {
                            console.log('fail:' + res.errMsg);
                        },
                        complete: function (res) {
                            console.log('complete:' + res.errMsg);
                        }
                    })
                })
            }
        })
    },

    /*获取当前页url*/
    getCurrentPageUrl: function () {
        var pages = getCurrentPages()    //获取加载的页面
        var url = '';
        if (pages.length > 0) {
            var currentPage = pages[pages.length - 1]    //获取当前页面的对象
            url = currentPage.route    //当前页面url
        }
        return url
    },
    //退出登录
    logOut: function () {
        var that = this;
        that.globalData.id = 0;
        that.globalData.phone = "";
        that.globalData.name = "";
        that.globalData.status = null;
        that.globalData.publicOpenId = "";
        that.globalData.accessToken = null;
        that.globalData.unionId = null;
        that.globalData.isLoginErp=false;
        that.globalData.wxUserInfo = [];
        console.log('清除登陆信息！');
    }, 

    //全局数据--测试
    globalData: {
        id: 0,   //用户编号
        phone: "",   //用户手机 
        name: "", //用户名称
        status: null,  //用户状态 
        publicOpenId: "",  //用户服务号OpenId
        accessToken: null,  //应用签名
        unionId: null,  //登录标识 
        socketHost: "ws://localhost:60000",
        socketConnected: false,
        isLoginErp:false,
        wxUserInfo: [],   //微信用户信息 
        wsUrl: 'ws://localhost:8001',//websocket地址
    },

 

    //保存用户信息
    setcurrentUserInfo: function (user) {
        var that = this;
        that.globalData.id = user.id;
        that.globalData.phone = user.phone;
        that.globalData.status = user.status;
        that.globalData.publicOpenId = user.publicOpenId;
        that.globalData.name = user.name;
    },

    //保存微信用户信息
    setwxUserInfo: function (user) {
        var that = this;
        that.globalData.wxUserInfo.avatarUrl = user.avatarUrl;  //头像
        that.globalData.wxUserInfo.city = user.city;  //城市
        that.globalData.wxUserInfo.country = user.country;  //国家
        that.globalData.wxUserInfo.gender = user.gender;  //性别 int类型
        that.globalData.wxUserInfo.language = user.language;  //语言
        that.globalData.wxUserInfo.nickName = user.nickName;  //昵称
        that.globalData.wxUserInfo.province = user.province;  //省
        that.globalData.wxUserInfo.encryptedData = user.encryptedData;  //使用 sha1( rawData + sessionkey ) 得到字符串，用于校验用户信息
        that.globalData.wxUserInfo.iv = user.iv;  // 加密算法的初始向量
    },
})