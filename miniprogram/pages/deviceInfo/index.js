// miniprogram/pages/deviceInfo/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 设备编号
    number: '',
    // 设备列表信息
    deviceInfo: '',
    // 借用设备人
    deviceUserName: '',
    // 借用机柜
    rackNumber: '',
    noData: true,
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.number) {
      this.setData({
        number: options.number
      })
      this.getDeviceInfo()
    }
  },

  // 获取设备信息
  getDeviceInfo: function() {
    wx.showLoading()
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'getDeviceInfo',
      // 传递给云函数的event参数
      data: {
        number: this.data.number
      }
    }).then(res => {
      // 基础信息
      if(res.result.deviceInfo.data[0]) {
        this.setData({
          deviceInfo: res.result.deviceInfo.data[0],
          noData: false
        })
      }
      // 借用人
      if(res.result.deviceUserName.data[0]) {
        this.setData({
          deviceUserName: res.result.deviceUserName.data[0].user_name
        })
      }
      // 借用的机柜
      if(res.result.hasDeviceRack.data[0]) {
        this.setData({
          rackNumber: res.result.hasDeviceRack.data[0].number
        })
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