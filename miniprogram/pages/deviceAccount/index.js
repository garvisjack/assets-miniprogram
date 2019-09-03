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
    pageSize: 10,
    loading: true
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
    wx.showLoading()
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'getDeviceAccount',
      // 传递给云函数的event参数
      data: {
        pageIndex: this.data.curPage,
        pageSize: this.data.pageSize,
        filter: {send_status: 1}
      }
    }).then(res => {
      // 获取设备借用表中数据
      if(res.result.deviceAccount.data.length) {
        this.setData({
          deviceList: this.data.deviceList.concat(res.result.deviceAccount.data),
          noData: false
        })
        console.log(this.data.deviceList)
      }else{
        if(this.data.deviceList.length == 0) {
          this.setData({
            noData: true
          })
        }
      }
      this.setData({
        loading: false
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
    this.data.curPage = 1
    this.getDeviceAccount()
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