// miniprogram/pages/borrowDevice/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    number: '',
    project: '',
    dateTime: '',
    userInfo: '',
    dateText: '预期归还时间',
    minHour: 10,
    maxHour: 20,
    minDate: new Date().getTime() + 180000,
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
    if(options.number) {
      this.setData({
        number: options.number
      })
    }
  },

  bindNumber: function(e) {
    this.setData({
      number: e.detail.value
    })
  },

  bindProject: function(e) {
    this.setData({
      project: e.detail.value
    })
  },

  onInput(event) {
    this.setData({
      currentDate: event.detail
    });
  },

  timeConfirm: function(event){
    let dateTime = this.formatTime(event.detail,'Y/M/D h:m:s')
    this.setData({
      dateTime: dateTime,
      dateText: dateTime
    });
    this.setData({ showPop: false });

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
        title: '机柜编号不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(this.data.project == ''){
      wx.showToast({
        title: '项目名称不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(this.data.dateTime == ''){
      wx.showToast({
        title: '预期归还时间不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    let nowDate = new Date().getTime()
    let sendTime = this.formatTime(nowDate, 'Y/M/D h:m:s')
    let options = {
      username: this.data.userInfo.name,
      userId: this.data.userInfo._id,
      number: this.data.number,
      project: this.data.project,
      dateTime: this.data.dateTime,
      sendTime: sendTime
    }
    wx.showLoading({
      title: '借用中..',
    })
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'borrowRack',
      // 传递给云函数的event参数
      data: options
    }).then(res => {
      if(res.result == 'notrack') {
        wx.showToast({
          title: '机柜不存在，请重试',
          icon: 'none',
          duration: 2000
        })
        return
      }
      console.log(res.result)
      if(res.result.data) {
        const title = res.result.data[0].type
        wx.showModal({
          title: '提示',
          showCancel: true,
          content: '机柜已经被借用',
          cancelText: '继续',
          confirmText: '查看机柜',
          confirmColor: '#074195',
          success (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: `/pages/rackAccount/index?title=${title}`
              })
            } else if (res.cancel) {
              
            }
          }
        })
        wx.hideLoading()
        return
      }
      if(res.result.sendRack._id) {
        wx.showModal({
          title: '提示',
          showCancel: true,
          content: '借用成功！',
          cancelText: '继续',
          confirmText: '查看机柜',
          confirmColor: '#074195',
          success (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/rackSend/index'
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
    this.setData({
      minDate: new Date().getTime() + 180000
    })
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