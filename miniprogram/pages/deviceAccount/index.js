// miniprogram/pages/deviceSend/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    deviceList: [],
    userInfo: '',
    noData: true,
    curPage: 1,
    pageSize: 50,
    loading: true,
    loadMore: false,
    tabActive: 0,
    isTab: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(wx.getStorageSync('userInfo')) {
      let userInfo = JSON.parse(wx.getStorageSync('userInfo'));
      this.setData({
        userInfo: userInfo
      })
    }
    this.getDeviceAccount()
  },

  resetPage: function() {
    this.setData({
      deviceList: [],
      curPage: 1
    })
  },

  getDeviceAccount: function() {
    let sendStatus = 1
    if(this.data.tabActive == 2) {
      sendStatus = 0
    }
    wx.showLoading()
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'getDeviceAccount',
      // 传递给云函数的event参数
      data: {
        pageIndex: this.data.curPage,
        pageSize: this.data.pageSize,
        filter: {send_status: sendStatus}
      }
    }).then(res => {
      // 获取设备借用表中数据
      if(res.result.deviceAccount.data.length) {
        // 重构过期的列表
        let accountResult = []
        // 过期
        if(this.data.tabActive == 0) {
          for(let item of res.result.deviceAccount.data) {
            if(this.checkDate(item.expect_return_time) != true) {
              item.subTime = this.checkDate(item.expect_return_time)
              accountResult.push(item)
            }
          }
          accountResult.sort(this.objectArraySort('subTime', true))
        }
        // 借用中 正常
        if(this.data.tabActive == 1) {
          for(let item of res.result.deviceAccount.data) {
            if(this.checkDate(item.expect_return_time) == true) {
              accountResult.push(item)
            }
          }
        }
        // 已归还的
        if(this.data.tabActive == 2) {
          for(let item of res.result.deviceAccount.data) {
            item.returnTime = new Date(item.real_return_time).getTime()
            accountResult.push(item)
          }
          accountResult.sort(this.objectArraySort('returnTime', true))
        }

        this.setData({
          deviceList: this.data.deviceList.concat(accountResult),
          noData: false
        })
        console.log(this.data.deviceList)
        if(this.data.deviceList.length == 0) {
          this.setData({
            noData: true
          })
        }
        if(accountResult.length == this.data.pageSize) {
          this.setData({
            loadMore: true
          })
        }else{
          this.setData({
            loadMore: false
          })
        }
      }else{
        if(this.data.deviceList.length == 0) {
          this.setData({
            noData: true
          })
        }
        
      }
      this.setData({
        loading: false,
        isTab: false
      })
      wx.hideLoading()
    
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '获取数据失败，请重试',
        icon: 'none',
        duration: 2000
      })
      this.setData({
        loading: false
      })
    })
  },

  objectArraySort: function(keyName, flag) {
    return function (objectN, objectM) {
      var valueN = objectN[keyName]
      var valueM = objectM[keyName]
      if(flag) {
        if (valueN < valueM) return 1
        else if (valueN > valueM) return -1
        else return 0
      }else{
        if (valueN > valueM) return 1
        else if (valueN < valueM) return -1
        else return 0
      }
     }
  },

  formatTime: function(number, format) {
    function formatNumber(n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    }
    var formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
    var returnArr = [];

    var date = new Date(number);
    returnArr.push(date.getFullYear());
    returnArr.push(formatNumber(date.getMonth() + 1));
    returnArr.push(formatNumber(date.getDate()));

    returnArr.push(formatNumber(date.getHours()));
    returnArr.push(formatNumber(date.getMinutes()));
    returnArr.push(formatNumber(date.getSeconds()));

    for (var i in returnArr) {
        format = format.replace(formateArr[i], returnArr[i]);
    }
    return format;
  },

  onChangeTab(event) {
    // 防止加载完成前多次点击
    if(this.data.isTab) {
      return
    }

    // 重新根据条件渲染列表，从第一页开始
    this.setData({
      tabActive: event.detail.index,
      curPage: 1,
      deviceList: [],
      loadMore: false,
      loading: true,
      noData: true,
      isTab: true
    })

    this.getDeviceAccount()
  },

  checkDate: function(date2) {
    let oDate1 = new Date();
    let oDate2 = new Date(date2);
    if (oDate1.getTime() >= oDate2.getTime()) {
      let sub = oDate1.getTime() - oDate2.getTime()
      return sub;
    } else {
      return true;
    }
  },

  goDeviceInfo: function(event) {
    let number = event.currentTarget.dataset.number;
    wx.navigateTo({
      url: `/pages/deviceInfo/index?number=${number}`
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    // this.data.curPage = 1
    // this.getDeviceAccount()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.data.curPage++
    this.getDeviceAccount()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})