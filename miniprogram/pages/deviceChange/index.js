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
    loading: true,
    userInfo: '',
    // 设备状态
    statusList: ['正常','维修','报废','限用'],
    showPicker: false,
    changeStatus: null,
    statusText: '选择设备状态',
    reason: ''
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

   // 开始搜索
   onSearch: function(e) {
    if(e.detail == '' || e.detail == null) {
      wx.showToast({
        title: '搜索内容不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    this.setData({
      number: e.detail
    })
    this.getDeviceInfo()
  },

  onCancel: function() {
    this.setData({
      number: ''
    })
  },

  onConfirmDel(event) {
    const { picker, value, index } = event.detail;
    this.setData({
      changeStatus: index,
      statusText: value,
      showPicker: false
    })
  },

  onReason: function(event) {
    this.setData({
      reason: event.detail
    })
  },

  // 调用更改设备状态接口
  updateDeviceStatus: function() {
    if(this.data.changeStatus == null){
      wx.showToast({
        title: '状态不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(this.data.reason == ''){
      wx.showToast({
        title: '变更原因不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    let nowDate = new Date().getTime()
    let changeTime = this.formatTime(nowDate, 'Y/M/D h:m:s')
    let options = {
      username: this.data.userInfo.name,
      userId: this.data.userInfo._id,
      number: this.data.number,
      changeTime: changeTime,
      status: this.data.changeStatus,
      statusName: this.data.statusText,
      reason: this.data.reason
    }
    console.log(options)
    wx.showModal({
      title: '提示',
      showCancel: true,
      content: `确认将状态修改为${this.data.statusText}?`,
      confirmColor: '#074195',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading()
          wx.cloud.callFunction({
            // 要调用的云函数名称
            name: 'changeDevice',
            // 传递给云函数的event参数
            data: options
          }).then(res => {
            console.log(res.result)
            if(res.result.changeDevice._id && res.result.updateDevice.stats.updated == 1) {
              this.setData({
                changeStatus: null,
                statusText: '选择设备状态',
                reason: ''
              })
              this.getDeviceInfo()
              wx.showToast({
                title: '修改成功',
                icon: 'none',
                duration: 2000
              })
            }else{
              wx.showToast({
                title: '修改失败，请重试',
                icon: 'none',
                duration: 2000
              })
            }
            wx.hideLoading()
           
          }).catch(err => {
            wx.hideLoading()
            wx.showToast({
              title: '修改失败，请重试',
              icon: 'none',
              duration: 2000
            })
          })
        } else if (res.cancel) {
          
        }
      }
    })

  },

  // 选择设备状态
  selectStatus: function() {
    this.setData({
      showPicker: true
    })
  },

  onCancelDel() {
    this.setData({
      showPicker: false
    })
  },

  // 扫码编号
  scanCode: function() {
    wx.showLoading()
    wx.scanCode({
      onlyFromCamera: true,
      success: res => { 
        this.setData({
          number: res.result
        })
        this.getDeviceInfo()
      },
      fail: err => {

      },
      complete: res => {
        wx.hideLoading()
      }
    })
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