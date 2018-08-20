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

    //登陆ERP之后的跳转逻辑
    onLogin: function () {
        var that = this;
        var url = that.getCurrentPageUrl();
        //排除要跳转的页面，否则页面会被刷新（特别是表单页面）
        if (url != "pages/account/mobile" && url != "pages/account/auth") {
            if (that.globalData.status == -1 || that.globalData.id == 0) {
                //新用户跳转到广告页
                wx.reLaunch({
                    url: '/pages/help/about'
                })
            }
            //手机认证页面（未手机认证）
            else if (that.globalData.phone == null || that.globalData.phone.length == 0) {
                //跳转手机认证页面
                wx.reLaunch({
                    url: '/pages/account/mobile'
                })
            }
            //实名认证页面（未实名认证，或者实名认证失败）
            else if (that.globalData.status == 0) {
                wx.reLaunch({
                    url: '/pages/account/auth'
                })
            }
            //广告页面（实名认证中...）
            else if (that.globalData.status == 3) {
                wx.reLaunch({
                    url: '/pages/account/result?auditStatus=3'
                })
            }
            else if (that.globalData.status == 5) {
                wx.reLaunch({
                    url: '/pages/account/result?auditStatus=5'
                })
            }
            //发行汇总页面（实名认证成功）
            else if (that.globalData.status == 10) {
                console.log("用户已认证跳转至首页");
                //小程序进来的，默认跳转页面
                if (url.length == 0 || url == "pages/home/temp") {
                    //发行汇总页面
                    wx.reLaunch({
                        url: '/pages/home/default'
                    })
                }
                //审核通过及时刷新页面
                else if (url == "pages/account/result") {
                    //发行汇总页面
                    wx.reLaunch({
                        url: '/pages/home/default'
                    })
                }
            }
        }
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

    //全局数据--本地
    // globalData: {
    //    id: 0,   //用户编号
    //    name: "", //用户名称
    //    phone: "",   //用户手机 
    //    status: null,  //用户状态 
    //    publicOpenId: "",  //用户服务号OpenId
    //    accessToken: null,  //应用签名
    //    unionId: null,  //登录标识
    //    apiHost: 'http://localhost:5630/api/',
    //    erpHost: "http://localhost:5670/",
    //    imgHost: "http://test.img.1caifu.com/",
    //    expressHost: "http://express.xiaohu.in/sf/route",//快递物流轨迹查询地址
    //    socketHost: "ws://localhost:60000",
    //    socketConnected: false,
    //    isLoginErp: false,
    //    wxUserInfo: [] ,  //微信用户信息
    //    wsHost:'http://localhost:8082',//websocket地址
    // },

    //全局数据--测试
    globalData: {
        id: 0,   //用户编号
        phone: "",   //用户手机 
        name: "", //用户名称
        status: null,  //用户状态 
        publicOpenId: "",  //用户服务号OpenId
        accessToken: null,  //应用签名
        unionId: null,  //登录标识
        apiHost: 'https://test-api.xiaohu.in/api/',  //api地址
        erpHost: "http://test-erp.xiaohu.in/",  //erp地址
        imgHost: "http://test.img.1caifu.com/", //文件服务地址
        expressHost: "http://express.xiaohu.in/sf/route",//快递物流轨迹查询地址
        socketHost: "ws://localhost:60000",
        socketConnected: false,
        isLoginErp:false,
        wxUserInfo: [],   //微信用户信息
        wsUrl: 'ws://192.168.20.115:8001',//websocket地址
    },


    //全局数据--正网
    // globalData: {
    //   id: 0,   //用户编号
    //   phone: "",   //用户手机 
    //   name: "", //用户名称
    //   status: null,  //用户状态 
    //   publicOpenId: "",  //用户服务号OpenId
    //   accessToken: null,  //应用签名
    //   unionId: null,  //登录标识
    //   apiHost: 'https://api.xiaohu.in/api/',  //api地址
    //   erpHost: "https://erp.xiaohu.in/",  //erp地址
    //   imgHost: "https://img.1caifu.com/", //文件服务地址
    //   expressHost: "http://express.xiaohu.in/sf/route",//快递物流轨迹查询地址
    //   wxUserInfo: []   //微信用户信息
    // },

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