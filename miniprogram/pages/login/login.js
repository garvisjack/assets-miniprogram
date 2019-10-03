// miniprogram/pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: '',
    password: '',
    loginStatus: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  bindUserNameInput: function(e) {
    this.setData({
      username: e.detail.value
    })
  },

  bindPassWordInput: function(e) {
    this.setData({
      password: e.detail.value
    })
  },

  // 提交表单
  toLogin: function () {
    // 先校验用户名，存在再校验密码
    let that = this
    if(this.data.username == '') {
      wx.showToast({
        title: '用户名不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(this.data.password == ''){
      wx.showToast({
        title: '密码不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    wx.showLoading({
      title: '正在登录中..',
    })
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'login',
      // 传递给云函数的event参数
      data: {
        username: that.data.username,
        password: that.data.password,
      }
    }).then(res => {
      console.log(res)
      wx.hideLoading()
      if(res.result.msg == 'success') {
        // 存用户名到缓存
        wx.setStorageSync('userInfo', JSON.stringify(res.result.userInfo.data[0]))
        wx.switchTab({
          url: '/pages/index/index'
        })
      }else{
        wx.showToast({
          title: res.result,
          icon: 'none',
          duration: 2000
        })
      }
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none',
        duration: 2000
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