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
    this.getDeviceSend()
  },

  returnDevice: function() {

  },

  getDeviceSend: function() {
    wx.showLoading()
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'getDeviceSend',
      // 传递给云函数的event参数
      data: {
        pageIndex: this.data.curPage,
        pageSize: this.data.pageSize,
        filter: {user_id: this.data.userInfo._id}
      }
    }).then(res => {
      // 获取设备借用表中数据
      if(res.result.deviceSend.data.length) {
        this.setData({
          deviceList: this.data.deviceList.concat(res.result.deviceSend.data),
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
    this.getDeviceSend()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.data.curPage++
    this.getDeviceSend()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})