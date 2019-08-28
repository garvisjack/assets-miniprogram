// miniprogram/pages/borrowDevice/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    number: '',
    dateTime: '',
    userInfo: '',
    dateText: '预计归还时间',
    minHour: 10,
    maxHour: 20,
    minDate: new Date().getTime(),
    currentDate: new Date().getTime(),
    formatter(type, value) {
      if (type === 'year') {
        return `${value}年`;
      } else if (type === 'month') {
        return `${value}月`;
      }else if (type === 'day') {
        return `${value}日`;
      }
      return value;
    },
    showPop: false
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
  },

  bindNumber: function(e) {
    this.setData({
      number: e.detail.value
    })
  },

  onInput(event) {
    this.setData({
      currentDate: event.detail
    });
  },

  timeConfirm: function(event){
    let dateTime = this.formatTime(event.detail)
    this.setData({
      dateTime: dateTime,
      dateText: dateTime
    });
    this.setData({ showPop: false });
    console.log(this.data.dateTime)
  },

  timeCancel: function() {
    this.setData({ showPop: false });
  },

  chooseDate: function() {
    this.setData({ showPop: true });
  },

  goConfirm: function () {
    if(this.data.number == '') {
      wx.showToast({
        title: '设备编号不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(this.data.dateTime == ''){
      wx.showToast({
        title: '预计归还时间不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    let nowDate = new Date().getTime()
    let sendTime = this.formatTime(nowDate)
    let options = {
      username: this.data.userInfo.name,
      userId: this.data.userInfo._id,
      number: this.data.number,
      dateTime: this.data.dateTime,
      sendTime: sendTime
    }
    wx.showLoading({
      title: '借用中..',
    })
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'borrowDevice',
      // 传递给云函数的event参数
      data: options
    }).then(res => {
      if(res.result == 'exist') {
        wx.showToast({
          title: '借用失败，设备已借用',
          icon: 'none',
          duration: 2000
        })
        return
      }
      if(res.result.sendDevice._id) {
        wx.showModal({
          title: '提示',
          showCancel: true,
          content: '借用成功！',
          cancelText: '继续',
          confirmText: '查看设备',
          confirmColor: '#074195',
          success (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/deviceSend/index'
              })
            } else if (res.cancel) {
              
            }
          }
        })
      }else{
        wx.showToast({
          title: '借用失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
      wx.hideLoading()
     
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '借用失败，请重试',
        icon: 'none',
        duration: 2000
      })
    })
  },

  goScan: function() {
    wx.showLoading()
    wx.scanCode({
      onlyFromCamera: true,
      success: res => { 
        this.setData({ number: res.result });
      },
      fail: err => {

      },
      complete: res => {
        wx.hideLoading()
      }
    })
  },

  formatTime: function(date) {
    var date = new Date();
    var year = date.getFullYear()
    var month = date.getMonth() + 1
    var day = date.getDate()

    var hour = date.getHours()
    var minute = date.getMinutes()
    var second = date.getSeconds()
    function formatNumber(n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    }
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})