//index.js
const app = getApp()

Page({
  data: {
    // 搜索内容
    searchValue: '',
    imgUrls: [
      'https://images.unsplash.com/photo-1551334787-21e6bd3ab135?w=640',
      'https://images.unsplash.com/photo-1551214012-84f95e060dee?w=640',
      'https://images.unsplash.com/photo-1551446591-142875a901a1?w=640'
    ],
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
   
  },

  // 开始搜索
  onSearch: function(e) {
    this.setData({
      searchValue: e.detail.value
    })
    console.log(this.data.searchValue)
  },

  onCancel: function() {
    this.setData({
      searchValue: ''
    })
  }
  
})
