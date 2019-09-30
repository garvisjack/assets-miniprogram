// miniprogram/pages/deviceSend/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    rackList: [],
    userInfo: '',
    noData: true,
    curPage: 1,
    pageSize: 50,
    loading: true,
    loadMore: false,
    tabActive: 0,
    tabTitle: 'CDV1'
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
    this.getRackAccount()
  },

  resetPage: function() {
    this.setData({
      rackList: [],
      curPage: 1
    })
  },

  getRackAccount: function() {
    wx.showLoading()
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'getRackAccount',
      // 传递给云函数的event参数
      data: {
        pageIndex: this.data.curPage,
        pageSize: this.data.pageSize,
        filter: {send_status: 1, type: this.data.tabTitle}
      }
    }).then(res => {
      // 获取机柜借用表中数据
      if(res.result.rackAccount.data.length) {
        this.setData({
          rackList: this.data.rackList.concat(res.result.rackAccount.data),
          noData: false
        })
        if(this.data.rackList.length == 0) {
          this.setData({
            noData: true
          })
        }
        if(res.result.rackAccount.data.length == this.data.pageSize) {
          this.setData({
            loadMore: true
          })
        }else{
          this.setData({
            loadMore: false
          })
        }
      }else{
        if(this.data.rackList.length == 0) {
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

  onChangeTab(event) {
    // 重新根据条件渲染列表，从第一页开始
    this.setData({
      tabActive: event.detail.index,
      tabTitle: event.detail.title,
      curPage: 1,
      rackList: [],
      loadMore: false,
      loading: true,
      noData: true
    })
    this.getRackAccount()
  },

  goRackInfo: function(event) {
    let number = event.currentTarget.dataset.number;
    wx.navigateTo({
      url: `/pages/rackInfo/index?number=${number}`
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
    // this.data.curPage = 1
    // this.getRackAccount()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.data.curPage++
    this.getRackAccount()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})