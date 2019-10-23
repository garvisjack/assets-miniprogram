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

  resetPage: function() {
    this.setData({
      deviceList: [],
      curPage: 1
    })
  },

  goBorrowDevice: function(event) {
    let number = event.currentTarget.dataset.number;
    wx.navigateTo({
      url: `/pages/borrowDevice/index?number=${number}`
    })
  },

  goDeviceInfo: function(event) {
    let number = event.currentTarget.dataset.number;
    wx.navigateTo({
      url: `/pages/deviceInfo/index?number=${number}`
    })
  },

  returnDevice: function(event) {
    let _id = event.currentTarget.dataset.id;
    let that = this;
    let nowDate = new Date().getTime()
    wx.showModal({
      title: '提示',
      content: '是否确认归还？',
      confirmColor: '#074195',
      success (res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            // 要调用的云函数名称
            name: 'returnDevice',
            // 传递给云函数的event参数
            data: {
              id: _id,
              realReturnTime: that.formatTime(nowDate, 'Y/M/D h:m:s')
            }
          }).then(res => {
            console.log(res)
            if(res.result.returnDevice.stats.updated == 1) {
              that.resetPage();
              that.onLoad();
              wx.showToast({
                title: '归还成功',
                icon: 'none',
                duration: 3000
              })
            }
            that.setData({
              loading: false
            })
            wx.hideLoading()
          
          }).catch(err => {
            wx.hideLoading()
            wx.showToast({
              title: '操作失败，请重试',
              icon: 'none',
              duration: 2000
            })
            that.setData({
              loading: false
            })
          })
        } else if (res.cancel) {
          
        }
      }
    })
  },  

  getAllDevice: function(number) {
    
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
        // 连表查询设备名称，只查询借用的
        const result = []
        for(let item of res.result.deviceSend.data) {
          if(item.send_status == 1) {
            result.push(item)
          }
        }
        for(let val of result) {
          if(this.checkDate(val.expect_return_time)) {
            val.expired = 0
          }else{
            val.expired = 1
          }
        }
        this.setData({
          deviceList: this.data.deviceList.concat(result)
        })
        if(this.data.deviceList.length == 0) {
          this.setData({
            noData: true
          })
        }else{
          this.setData({
            noData: false
          })
        }
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
      console.error(err)
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

  
  checkDate: function(date2) {
    let oDate1 = new Date();
    let oDate2 = new Date(date2);
    if (oDate1.getTime() >= oDate2.getTime()) {
        return false;
    } else {
        return true;
    }
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