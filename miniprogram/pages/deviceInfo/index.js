// miniprogram/pages/deviceInfo/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 设备编号
    number: 'TE0001',
    // 设备列表信息
    deviceInfo: '',
    // 借用设备人
    deviceUserName: '',
    // 借用机柜
    rackNumber: '',
    noData: true,
    loading: true,
    showHistory: false,
    deviceSendHistory: [],
    rackSendHistory: [],
    historyList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.number) {
      this.setData({
        number: options.number
      })
    }
    this.getDeviceInfo()
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
      console.log(res)
      // 基础信息
      if(res.result.deviceInfo.data[0]) {
        this.setData({
          deviceInfo: res.result.deviceInfo.data[0],
          noData: false
        })
      }else{
        this.setData({
          deviceInfo: [],
          noData: true
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

  // 展示历史记录
  showHistory: function() {
    this.setData({
      showHistory: !this.data.showHistory
    })
    if(this.data.showHistory) {
      wx.showLoading()
      wx.cloud.callFunction({
        // 要调用的云函数名称
        name: 'getDeviceHistory',
        // 传递给云函数的event参数
        data: {
          filter: {device_number: this.data.number}
        }
      }).then(res => {
        console.log(res.result)
        // 设备历史
        if(res.result.allDeviceChange[0].data) {
          this.setData({
            deviceSendHistory: res.result.allDeviceChange[0].data
          })
        }
        // 设备和机柜历史
        if(res.result.allRackChange[0].data) {
          this.setData({
            rackSendHistory: res.result.allRackChange[0].data
          })
        }
        let steps = this.data.deviceSendHistory.concat(this.data.rackSendHistory)
        // 处理历史记录数组
        for(let item of steps) {
          if(item.send_time) {
            item.desc = item.send_time
            item.text = `${item.user_name} ${item.status_name ? item.status_name: ''}`
            if(item.status == 1) {
              item.text = `${item.user_name} 借用`
            }
            if(item.status == 0) {
              item.text = `${item.user_name} 归还`
            }
          }else{
            item.desc = item.change_time
            if(item.status == 1) {
              item.text = `${item.user_name}在机柜${item.rack_number}中增加`
            }
            if(item.status == 0) {
              item.text = `${item.user_name}从机柜${item.rack_number}中移除`
            }
          }
        }
        this.setData({
          historyList: steps
        })
        wx.hideLoading()
  
      }).catch(err => {
        wx.hideLoading()
        this.setData({
          loading: false
        })
      })
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