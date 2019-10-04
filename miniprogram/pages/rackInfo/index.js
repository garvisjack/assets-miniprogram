// miniprogram/pages/rackInfo/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchValue: '',
    // 机柜信息
    rackInfo: '',
    // 移除的设备
    delDeviceList: [],
    delDevice: '',
    delId: '',
    noData: true,
    loading: true,
    showPicker: false,
    userInfo: '',
    // 增加的设备
    addDeviceNumber: '',
    addDevicelist: [],
    showHistory: false,
    rackSendHistory: [],
    historyList: [],
    // 分类机柜
    curPage: 1,
    pageSize: 100,
    tabActive: 10,
    titleList: ['CDV1','CDV2','CIC1','CIC2','CCC','Other'],
    tabTitle: 'CDV1',
    rackList: [],
    showTab: true
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
        searchValue: options.number
      })
      this.getRackInfo()
    }
  },

  showRackInfo: function(event) {
    this.setData({
      searchValue: event.currentTarget.dataset.number
    })
    this.getRackInfo()
  },

  // 获取机柜信息
  getRackInfo: function() {
    this.setData({
      showTab: false
    })
    wx.showLoading()
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'getRackInfo',
      // 传递给云函数的event参数
      data: {
        number: this.data.searchValue
      }
    }).then(res => {
      console.log(res.result.rackInfo.data[0])
      // 基础信息
      if(res.result.rackInfo.data[0]) {
        this.setData({
          rackInfo: res.result.rackInfo.data[0],
          noData: false,
          showTab: false,
          rackList: []
        })
      }else{
        this.setData({
          rackInfo: [],
          noData: true,
          showTab: true,
          tabActive: 10,
          rackList: []
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
      searchValue: e.detail,
      historyList: [],
      rackSendHistory: []
    })
    this.getRackInfo()
  },

  onChangeSearch: function(e) {
    this.setData({
      searchValue: e.detail,
      historyList: [],
      rackSendHistory: []
    })
  },

  onCancel: function() {
    this.setData({
      searchValue: '',
      historyList: [],
      rackSendHistory: []
    })
  },

  delDevice: function(event) {
    this.setData({
      delDeviceList: event.currentTarget.dataset.list,
      delPart: event.currentTarget.dataset.part,
      delId: event.currentTarget.dataset.id,
      showPicker: true
    })

  },

  onConfirmDel(event) {
    const { picker, value, index } = event.detail;
    this.setData({
      delDevice: value
    })

    let delResult = this.data.delDeviceList
    delResult.splice(index, 1)
    this.goDelDevice(this.data.delPart, delResult)
  },

  onCancelDel() {
    this.setData({
      delDeviceList: [],
      showPicker: false
    })
  },

  goDelDevice: function(part, delResult) {
    let dateTime = this.formatTime(new Date().getTime(),'Y/M/D h:m:s')
    let options 
    options = {
      id: this.data.delId,
      content: delResult,
      part: part,
      dateTime: dateTime,
      deviceNumber: this.data.delDevice,
      number: this.data.rackInfo.number,
      username: this.data.userInfo.name,
      userId: this.data.userInfo._id
    }
    wx.showLoading()
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'rackDelDevice',
      // 传递给云函数的event参数
      data: options
    }).then(res => {
      wx.hideLoading()
      this.setData({
        loading: false,
        showPicker: false,
        showHistory: false
      })
      this.getRackInfo()
      wx.showToast({
        title: '移除成功',
        icon: 'none',
        duration: 2000
      })
    }).catch(err => {
      wx.hideLoading()
      this.setData({
        loading: false,
        delDeviceList: [],
        showPicker: false,
        showHistory: false
      })
      this.getRackInfo()
      wx.showToast({
        title: '移除成功',
        icon: 'none',
        duration: 2000
      })
    })
  },

  bindNumber: function(e) {
    this.setData({
      addDeviceNumber: e.detail.value
    })
  },

  // 增加设备
  addDevice: function(event) {
    this.setData({
      addDevicelist: event.currentTarget.dataset.list,
      delPart: event.currentTarget.dataset.part,
      delId: event.currentTarget.dataset.id,
      showAddDevice: true,
      addDeviceNumber: ''
    })
  },

  // 扫码编号
  scanCode: function() {
    wx.showLoading()
    wx.scanCode({
      onlyFromCamera: true,
      success: res => { 
        this.setData({
          searchValue: res.result
        })
        this.getRackInfo()
      },
      fail: err => {

      },
      complete: res => {
        wx.hideLoading()
      }
    })
  },

  closeAddDevice: function() {
    this.setData({
      showAddDevice: false
    })
  },

  confirmAddDevice: function() {
    if(this.data.addDeviceNumber == '') {
      wx.showToast({
        title: '设备编号不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }
    wx.showLoading()
    let dateTime = this.formatTime(new Date().getTime(),'Y/M/D h:m:s')
    let addList = this.data.addDevicelist
    let addResult = []
    if(addList.length > 0) {
      addList.push(this.data.addDeviceNumber)
    }else{
      addResult.push(this.data.addDeviceNumber)
    }

    let addContent;
    if(addResult.length > 0) {
      addContent = addResult
    }else{
      addContent = addList
    }

    let options = {
      id: this.data.delId,
      content: addContent,
      part: this.data.delPart,
      dateTime: dateTime,
      deviceNumber: this.data.addDeviceNumber,
      number: this.data.rackInfo.number,
      username: this.data.userInfo.name,
      userId: this.data.userInfo._id
    }
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'rackAddDevice',
      // 传递给云函数的event参数
      data: options
    }).then(res => {
      wx.hideLoading()
      this.setData({
        loading: false,
        showAddDevice: false,
        showHistory: false
      })

      if(res.result == 'notdevice') {
        wx.showToast({
          title: '设备不存在，请重试',
          icon: 'none',
          duration: 2000
        })
        return
      }

      if(res.result == 'exist') {
        wx.showToast({
          title: '操作失败，设备已借用',
          icon: 'none',
          duration: 2000
        })
        return
      }

      this.getRackInfo()
      wx.showToast({
        title: '增加成功',
        icon: 'none',
        duration: 2000
      })
    }).catch(err => {
      wx.hideLoading()
      this.setData({
        loading: false,
        delDeviceList: [],
        showAddDevice: false,
        showHistory: false
      })
      this.getRackInfo()
    })
  },

  // 扫码设备
  goScan: function() {
    wx.showLoading()
    wx.scanCode({
      onlyFromCamera: true,
      success: res => { 
        this.setData({ addDeviceNumber: res.result });
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

  // 展示历史记录
  showHistory: function() {
    this.setData({
      showHistory: !this.data.showHistory
    })

    if(this.data.showHistory) {
      wx.showLoading()
      wx.cloud.callFunction({
        // 要调用的云函数名称
        name: 'getRackHistory',
        // 传递给云函数的event参数
        data: {
          filter: {rack_number: this.data.searchValue}
        }
      }).then(res => {
        // 机柜历史
        if(res.result.allRackChange.length) {
          this.setData({
            rackSendHistory: res.result.allRackChange[0].data
          })
        }
  
        let steps = this.data.rackSendHistory
 
        // 处理历史记录数组
        for(let item of steps) {
          item.desc = item.change_time
          if(item.status == 1) {
            item.text = `${item.user_name}在机柜中增加${item.device_number}`
          }
          if(item.status == 0) {
            item.text = `${item.user_name}从机柜中移除${item.device_number}`
          }
        }
        wx.hideLoading()
        if(steps.length) {
          this.setData({
            historyList: steps
          })
        }else{
          wx.showToast({
            title: '暂无历史信息',
            icon: 'none',
            duration: 2000
          })
        }
  
      }).catch(err => {
        wx.hideLoading()
        this.setData({
          loading: false
        })
      })
    }
  },

  onChangeTab(event) {
    // 重新根据条件渲染列表，从第一页开始
    this.setData({
      tabActive: event.detail.index,
      tabTitle: event.detail.title,
      curPage: 1,
      rackList: []
    })
    this.getTypeRack()
  },

  getTypeRack: function() {
    wx.showLoading()
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'getTypeRack',
      // 传递给云函数的event参数
      data: {
        pageIndex: this.data.curPage,
        pageSize: this.data.pageSize,
        filter: {type: this.data.tabTitle}
      }
    }).then(res => {
      console.log(res.result.typeRack.data)
      if(res.result.typeRack.data.length) {
        this.setData({
          rackList: this.data.rackList.concat(res.result.typeRack.data)
        })
      }
      wx.hideLoading()
    
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '获取数据失败，请重试',
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