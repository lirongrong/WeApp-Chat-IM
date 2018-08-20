
var app = getApp();
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
//获取当前时间 2019-02-12 12:00:00
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
    + " " + date.getHours() + seperator2 + date.getMinutes()
    + seperator2 + date.getSeconds();
  return currentdate;
}
// function formatDateTime(dateStr) {
//   dateStr = dateStr.replace(/\-/g, "/");
//   var date = new Date(dateStr);
//   var month = date.getMonth() + 1
//   var day = date.getDate()

//   var hour = date.getHours()
//   var minute = date.getMinutes()

//   return [month, day].map(formatNumber).join('-') + ' ' + [hour, minute].map(formatNumber).join(':')
// }

// //yyyy-MM-dd
// function formatDateTime(dateStr) {
//   dateStr = dateStr.replace(/\-/g, "/");
//   var date = new Date(dateStr);
//   var year = date.getFullYear()
//   var month = date.getMonth() + 1
//   var day = date.getDate()

//   var hour = date.getHours()
//   var minute = date.getMinutes()
//   var second = date.getSeconds()

//   return [year, month, day].map(formatNumber).join('-')
// }

//今天以前yyyy-MM-dd  今天 hh:mm
function formatDateTime(dateStr) {
  dateStr = dateStr.replace(/\-/g, "/");
  var date = new Date(dateStr);
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()

  var currentDate = new Date();
 //当前年
  var currentYear = currentDate.getFullYear()
   //当前月
  var currentMonth = currentDate.getMonth() + 1
   //当前日
  var currentDay = currentDate.getDate()

  //需要格式化的时间，就是当天
  if (year == currentYear && month == currentMonth && day == currentDay)
  {
    return  [hour, minute].map(formatNumber).join(':')
  }
  else
  {
    return [year, month, day].map(formatNumber).join('-')
  }
}

function getDate(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  return [year, month, day].map(formatNumber).join('-')
}
function getTime(date) {
  var hour = date.getHours()
  var minute = date.getMinutes()
  return [hour, minute].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//错误消息提示
function errorMsg(that,msg)
{
  that.setData({
    errMsg: msg,
    showTopTips: true
  });
  setTimeout(function () {
    that.setData({
      errMsg: "",
      showTopTips: false
    });
  }, 1500);
}

//Get请求
function getApi(url, data, successCallback, errCallback,completeCallback) {
  if (data == null) {
    data = {};
  }
  wx.request({
    url: app.globalData.apiHost + url,
    data: data,
    method: 'GET',
    header: {
      Authorization: app.globalData.accessToken
    },
    success: function (res) {
      if (res.statusCode == 250 || res.statusCode == 500) {
        if (typeof (errCallback) == "function") {
          errCallback(res);
        }
        else {
          wx.showToast({
            title: res.data,
            duration: 2000
          })
        }
      }
      else {
        if (typeof (successCallback) == "function") {
          successCallback(res);
        }
      }
    },
    fail:function(res){
      if (typeof (errCallback) == "function") {
        errCallback(res);
      }
      else {
        wx.showToast({
          title: '接口调用失败！',
          duration: 2000
        })
      }
    },
    complete: function (res) {
      if (typeof (completeCallback) == "function") {
        completeCallback(res);
      }
    }
  })
}

//Post请求
function postApi(url, data, successCallback, errCallback, completeCallback) {
  wx.request({
    url: app.globalData.apiHost + url,
    data: data,
    method: 'POST',
    header: {
      Authorization: app.globalData.accessToken
    },
    success: function (res) {
      if (res.statusCode == 250 || res.statusCode == 500)
      {
        if (typeof (errCallback) == "function")
        {
          errCallback(res);
        }
        else
        {
          wx.showToast({
            title: res.data,
            duration: 2000
          })
        }
      }
      else
      {
        if (typeof (successCallback) == "function") {
          successCallback(res);
        }
      }
    },
    fail: function (res) {
       if (typeof (errCallback) == "function")
        {
          errCallback(res);
        }
        else
        {
          wx.showToast({
            title: '接口调用失败！',
            duration: 2000
          })
        }
    }, 
    complete:function(res){
      if (typeof (completeCallback) == "function") {
        completeCallback(res);
      }
    }
  })
}

//Put请求
function putApi(url, data, successCallback, errCallback, completeCallback) {
  wx.request({
    url: app.globalData.apiHost + url,
    data: data,
    method: 'PUT',
    header: {
      Authorization: app.globalData.accessToken
    },
    success: function (res) {
      if (res.statusCode == 250 || res.statusCode == 500) {
        if (typeof (errCallback) == "function") {
          errCallback(res);
        }
        else {
          wx.showToast({
            title: res.data,
            duration: 2000
          })
        }
      }
      else {
        if (typeof (successCallback) == "function") {
          successCallback(res);
        }
      }
    },
    fail: function (res) {
      if (typeof (errCallback) == "function") {
        errCallback(res);
      }
      else {
        wx.showToast({
          title: '接口调用失败！',
          duration: 2000
        })
      }
    },
    complete: function (res) {
      if (typeof (completeCallback) == "function") {
        completeCallback(res);
      }
    }
  })
}

//添加缓存数据
function setStorage(key,data){
  wx.setStorage({
    key: key,
    data: data
  })
}

//获取缓存数据
function getStorage(key, callback){
  wx.getStorage({
    key: key,
    success: function (res) {
      callback(res.data);
    }, fail: function (res) {
      callback(null);
    }
  })
}
//删除缓存数据
function removeStorage(key)
{
  wx.removeStorage({
    key: key,
    success: function (res) {
    }
  })
}

//清空缓存
function clearStorage(){
  wx.clearStorage();
}

//写日志
function logInfo(str){
  getApi(
    "up/Supplier/LogText",
    {data:str},
    function (res) {
    }
  ) 
}
//克隆
function cloneObj(oldObj) { //复制对象方法
  if (typeof (oldObj) != 'object') return oldObj;
  if (oldObj == null) return oldObj;
  var newObj = new Object();
  for (var i in oldObj)
    newObj[i] = cloneObj(oldObj[i]);
  return newObj;
};
function extendObj() { //扩展对象
  var args = arguments;
  if (args.length < 2) return;
  var temp = cloneObj(args[0]); //调用复制对象方法
  for (var n = 1; n < args.length; n++) {
    for (var i in args[n]) {
      temp[i] = args[n][i];
    }
  }
  return temp;
} 

//注册方法
module.exports = {
  formatTime: formatTime,
  getNowFormatDate: getNowFormatDate,
  formatDateTime: formatDateTime,
  getDate: getDate,
  getTime: getTime,
  errorMsg: errorMsg,
  getApi: getApi,
  postApi: postApi,
  putApi: putApi,
  setStorage: setStorage,
  getStorage: getStorage,
  removeStorage: removeStorage,
  clearStorage: clearStorage,
   logInfo: logInfo,
  extendObj: extendObj,
}
