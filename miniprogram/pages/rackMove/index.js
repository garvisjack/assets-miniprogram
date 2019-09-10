// miniprogram/pages/borrowDevice/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    number: 'TE0020',
    room: '',
    position: '',
    roomList: [],
    positionList: [],
    allPositionList: [],
    dateTime: '',
    userInfo: '',
    showRoom: false,
    showPosition: false,
    roomText: '请选择试验室',
    positionText: '请选择位置',
    allPosition: [],
    // 分页数据
    noData: true,
    curPage: 1,
    pageSize: 50,
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
    this.getRackPosition()
  },

  bindNumber: function(e) {
    this.setData({
      number: e.detail.value
    })
  },

  // 得到机柜位置列表的数据
  getRackPosition: function() {
    wx.showLoading()
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'getRackPosition',
      // 传递给云函数的event参数
      data: {
        pageIndex: this.data.curPage,
        pageSize: this.data.pageSize
      }
    }).then(res => {
      console.log(res.result.allPosition)
      if(res.result.allPosition.length) {
        this.setData({
          allPosition: res.result.allPosition,
          noData: false
        })
        this.getRoomList(res.result.allPosition)
      }else{
        if(this.data.allPosition.length == 0) {
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
      this.setData({
        loading: false
      })
    })
  },

  // 过滤位置
  getRoomList: function(arr) {
    let roomList = []
    let allPositionList = []
    // 遍历去重取room试验室
    for(let item of arr) {
      for(let value of item.data) {
        roomList.push(value.room)
        allPositionList.push(value)
      }
    }
 
    this.setData({
      roomList: this.unique(roomList),
      allPositionList: allPositionList
    })
  },

  unique: function(arr) {
    var hash=[];
    for (var i = 0; i < arr.length; i++) {
       if(hash.indexOf(arr[i])==-1){
        hash.push(arr[i]);
       }
    }
    return hash;
  },

  // 得到位置列表
  getPositionList: function() {
    let positionList = []
    if(this.data.room != '') {
      for(let item of this.data.allPositionList) {
        if(item.room == this.data.room) {
          positionList.push(item.position)
        }
      }
    }
    this.setData({
      positionList: positionList
    })
  },

  onConfirmRoom(event) {
    const { picker, value, index } = event.detail;
    this.setData({
      room: value,
      roomText: value,
      showRoom: false
    })
    this.getPositionList()
  },

  onConfirmPosition(event) {
    const { picker, value, index } = event.detail;
    this.setData({
      position: value,
      positionText: value,
      showPosition: false
    })
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
    if(this.data.room == ''){
      wx.showToast({
        title: '试验室不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    if(this.data.position == ''){
      wx.showToast({
        title: '位置不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }

    let nowDate = new Date().getTime()
    let dateTime = this.formatTime(nowDate, 'Y/M/D h:m:s')

    let options = {
      username: this.data.userInfo.name,
      userId: this.data.userInfo._id,
      number: this.data.number,
      room: this.data.room,
      position: this.data.position,
      dateTime: dateTime,
      status: 1
    }
    wx.showLoading({
      title: '移动中..',
    })
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'moveRack',
      // 传递给云函数的event参数
      data: options
    }).then(res => {
      if(res.result == 'exist') {
        wx.showToast({
          title: '移动失败，位置已被占用',
          icon: 'none',
          duration: 2000
        })
        return
      }
      if(res.result.moveRack.stats.updated == 1) {
        wx.showModal({
          title: '提示',
          showCancel: true,
          content: '移动成功！',
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
          title: '移动失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
      wx.hideLoading()
     
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '移动失败，请重试',
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

  chooseRoom: function() {
    this.setData({
      showRoom: true
    })
  },

  choosePosition: function() {
    if(this.data.room == '') {
      wx.showToast({
        title: '请先选择试验室',
        icon: 'none',
        duration: 2000
      })
      return
    }
    this.setData({
      showPosition: true
    })
  },

  onCloseRoom: function() {
    this.setData({
      showRoom: false
    })
  },

  onClosePosition: function() {
    this.setData({
      showPosition: false
    })
  },

  onCancelPicker: function() {
    this.setData({
      showPosition: false,
      showRoom: false
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