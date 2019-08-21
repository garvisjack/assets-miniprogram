// miniprogram/pages/loading/loading.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '登陆中..',
    })
    // 全局登录状态
    if(wx.getStorageSync('userName')) {
      console.log(wx.getStorageSync('userName') + ' is login')
      setTimeout(function() {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }, 300)
    }else{
      console.log('尚未登录')
      setTimeout(function() {
        wx.redirectTo({
          url: '/pages/login/login'
        })
      }, 300)
    }
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