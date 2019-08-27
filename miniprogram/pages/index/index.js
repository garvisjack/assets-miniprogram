//index.js
const app = getApp()

wx.cloud.init()
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
    rackNum: 20,
    rackExpiredNum: 2,
    deviceNum: 20,
    deviceExpiredNum: 2,
  },

  onLoad: function() {
    this.getBannerList()
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
  }
  
})
