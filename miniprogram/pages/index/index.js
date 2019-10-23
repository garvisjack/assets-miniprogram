//index.js
const app = getApp()

wx.cloud.init({
  traceUser: true,
  env: 'prod-hlfc5'
})
const db = wx.cloud.database()
const _ = db.command

Page({
  data: {
    // 搜索内容
    searchValue: '',
    imgUrls: [],
    indicatorDots: true,
    autoplay: true,
    interval: 4000,
    indicatorActiveColor: '#074195',
    duration: 1000,
    // 机柜和设备信息
    userInfo: '',
    deviceSend: [],
    rackSend: [],
    rackNum: 0,
    rackExpiredNum: 0,
    deviceNum: 0,
    deviceExpiredNum: 0,
    curPage: 1,
    pageSize: 10
  },

  onLoad: function() {
  
  },

  onShow: function () {
    if(wx.getStorageSync('userInfo')) {
      let userInfo = JSON.parse(wx.getStorageSync('userInfo'));
      this.setData({
        userInfo: userInfo
      })
    }
    this.getBannerList()
    this.getHomeData()
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
    wx.navigateTo({
      url: '/pages/deviceInfo/index?number=' + e.detail
    })
  },

  onCancel: function() {
    this.setData({
      searchValue: ''
    })
  },

  // 获取轮播图数据
  getBannerList:  function() {
    db.collection('home_banner').get({
      success: res => {
        this.setData({
          imgUrls: res.data
        })
      }
    })
  },

  // 首页设备和机柜数量展示
  getHomeData: function() {
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'getHomeData',
      // 传递给云函数的event参数
      data: {
        pageIndex: this.data.curPage,
        pageSize: this.data.pageSize,
        filter: {user_id: this.data.userInfo._id,send_status: 1}
      }
    }).then(res => {
      // 基础信息
      console.log(res.result)
      if(res.result.allDeviceSend.length) {
        this.setData({
          deviceSend: res.result.allDeviceSend[0].data,
          deviceNum: res.result.total
        })
        // 找出借用中，超过归还时间的过期设备
        let num = 0
        for(let item of this.data.deviceSend) {
          if(this.checkDate(item.expect_return_time)) {

          }else{
            num++
          }
        }
        this.setData({
          deviceExpiredNum: num
        })
      }else{
        this.setData({
          deviceSend: []
        })
      }
      this.setData({
        deviceNum: res.result.total
      })
      // 机柜借用数量
      if(res.result.allRackSend.length) {
        this.setData({
          rackSend: res.result.allRackSend[0].data
        })
        // 找出借用中，超过归还时间的过期设备
        let rackNum = 0
        for(let val of this.data.rackSend) {
          if(this.checkDate(val.expect_return_time)) {

          }else{
            rackNum++
          }
        }
        this.setData({
          rackExpiredNum: rackNum
        })
      }else{
        this.setData({
          rackSend: []
        })
      }
      this.setData({
        rackNum: res.result.rackTotal
      })
      wx.hideLoading()

    }).catch(err => {
      wx.hideLoading()
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

  // 扫码编号
  scanCode: function() {
    wx.showLoading()
    wx.scanCode({
      onlyFromCamera: true,
      success: res => { 
        wx.navigateTo({
          url: '/pages/deviceInfo/index?number=' + res.result
        })
      },
      fail: err => {

      },
      complete: res => {
        wx.hideLoading()
      }
    })
  },

  
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showLoading()
    this.getBannerList()
    this.getHomeData()
    wx.stopPullDownRefresh()
  }
  
})
