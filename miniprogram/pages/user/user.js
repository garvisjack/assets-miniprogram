// miniprogram/pages/user/user.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    loginStatus: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      // 全局登录状态
      if(wx.getStorageSync('userInfo')) {
        let userInfo = JSON.parse(wx.getStorageSync('userInfo'));
        this.setData({
          username: userInfo.name
        })
      }else{
        setTimeout(function() {
          wx.redirectTo({
            url: '/pages/login/login'
          })
        }, 300)
      }
  },

  saveAdvice: function() {
    wx.showModal({
      title: '意见反馈',
      showCancel: false,
      content: '联系陈先生：13588888888',
      confirmText: '知道了',
      confirmColor: '#074195',
      success (res) {
        if (res.confirm) {
          
        } else if (res.cancel) {
          
        }
      }
    })
  },

  updateContent: function() {
    wx.navigateTo({
      url: `/pages/versionHistory/index`
    })
  },

  aboutVersion: function() {
    wx.showModal({
      title: '关于',
      showCancel: false,
      content: '该小程序版权归公司所有',
      confirmText: '知道了',
      confirmColor: '#074195',
      success (res) {
        if (res.confirm) {
          
        } else if (res.cancel) {
          
        }
      }
    })
  },

  outLogin: function() {
    wx.showModal({
      title: '提示',
      content: '确认退出登录？',
      confirmColor: '#074195',
      success (res) {
        if (res.confirm) {
          wx.removeStorage({
            key: 'userInfo',
            success (res) {
              wx.redirectTo({
                url: '/pages/login/login'
              })
            }
          })
        } else if (res.cancel) {
          
        }
      }
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