// miniprogram/pages/borrowDevice/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    searchValue: '',
    number: '',
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
    loading: true,
    // 树形结构树准备
    mainActiveIndex: 0,
    activeId: null,
    mainHeight: 0,
    //用于判断是否有机柜占用位置时
    hasRack: false,
    // 移除的设备
    delRackList: [],
    newNumber: [],
    newDelNumber: [],
    delRack: '',
    delPosition: '',
    showPicker: false,
    // 右侧滚动条高度
    positionScroll: '500',
    toView: null
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
    this.setMainHeight()
  },

  // 左侧选择
  onClickNav(event) {
    this.setData({
      mainActiveIndex: event.currentTarget.dataset.index,
      room: event.currentTarget.dataset.item,
      positionList: []
    })
    this.getPositionList()
  },

  // 选择位置，可切换
  onSelectItem(event) {
    this.setData({ activeId: detail.id })
  },

  moveRack: function(event) {
    if(this.data.searchValue == '' || this.data.searchValue == null) {
      wx.showToast({
        title: '机柜编号不能为空',
        icon: 'none',
        duration: 2000
      })
      return
    }

    this.setData({
      position: event.currentTarget.dataset.position,
      newNumber: event.currentTarget.dataset.number
    })
    wx.showModal({
      title: '提示',
      showCancel: true,
      content: `将${this.data.searchValue}移动到该位置？`,
      cancelText: '取消',
      confirmText: '确认',
      confirmColor: '#074195',
      success: res => {
        if (res.confirm) {
          this.moveRackToPosition()
        } else if (res.cancel) {
          
        }
      }
    })

  },

  // 移动机柜到新位置
  moveRackToPosition: function(flag = true) {
    let nowDate = new Date().getTime()
    let dateTime = this.formatTime(nowDate, 'Y/M/D h:m:s')

    // 移除操作
    let options
    if(!flag) {
      options = {
        username: this.data.userInfo.name,
        userId: this.data.userInfo._id,
        number: this.data.delRack,
        newNumber: this.data.newDelNumber,
        room: this.data.room,
        position: this.data.position,
        dateTime: dateTime,
        status: 0,
        statusName: '移除'
      }
    // 新增操作
    }else{
      this.data.newNumber.push(this.data.searchValue)
      options = {
        username: this.data.userInfo.name,
        userId: this.data.userInfo._id,
        number: this.data.searchValue,
        newNumber: this.data.newNumber,
        room: this.data.room,
        position: this.data.position,
        dateTime: dateTime,
        status: 1,
        statusName: '增加'
      }
    }

    wx.showLoading()
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'moveRack',
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
      if(res.result == 'exist') {
        wx.showToast({
          title: '操作失败，机柜使用中',
          icon: 'none',
          duration: 2000
        })
        return
      }
      if(res.result.moveRack.stats.updated == 1) {
        this.getRackPosition()
        wx.showToast({
          title: '操作成功',
          icon: 'none',
          duration: 2000
        })
      }else{
        wx.showToast({
          title: '操作失败，请重试',
          icon: 'none',
          duration: 2000
        })
      }
      this.setData({
        showPicker: false
      })
      wx.hideLoading()
     
    }).catch(err => {
      wx.hideLoading()
      wx.showToast({
        title: '操作失败，请重试',
        icon: 'none',
        duration: 2000
      })
    })
  },

  setMainHeight: function() {
    this.setData({
      mainHeight: wx.getSystemInfoSync().windowHeight - 108
    });
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
      hasRack: false
    })
    // 匹配搜索
    this.getRackPosition()
 
  },

  onChangeSearch: function(e) {
    this.setData({
      searchValue: e.detail
    })
  },

  onCancel: function() {
    this.setData({
      searchValue: ''
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
    // 若没有搜索内容，则展示位置列表默认第一个
    if(this.data.searchValue == '') {
      this.setData({
        room: this.data.roomList[0],
        mainActiveIndex: 0,
        hasRack: false
      })
    }else{
      // 若有搜索内容，判断有无搜索结果
      for(let items of allPositionList) {
        if(items.rack_number.indexOf(this.data.searchValue) > -1) {
          for(let i =0;i < this.data.roomList.length;i++) {
            if(items.room == this.data.roomList[i]) {
              this.setData({
                room: items.room,
                position: items.position,
                mainActiveIndex: i
              })
              this.chooseView(items._id)
            }
          }
          this.setData({
            hasRack: true
          })
        }
      }

      if(!this.data.hasRack) {
        wx.showToast({
          title: '未找到相应机柜',
          icon: 'none',
          duration: 2000
        })
      }
    }
    this.getPositionList()

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
          positionList.push(item)
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

  delRack: function(event) {
    this.setData({
      delRackList: event.currentTarget.dataset.number,
      delPosition: event.currentTarget.dataset.position,
      position: event.currentTarget.dataset.position,
      number: event.currentTarget.dataset.number,
      showPicker: true
    })
  },

  onConfirmDel(event) {
    const { picker, value, index } = event.detail;
    this.setData({
      delRack: value
    })

    let delResult = this.data.delRackList
    delResult.splice(index, 1)

    this.setData({
      newDelNumber: delResult
    })
    wx.showModal({
      title: '提示',
      showCancel: true,
      content: `将${this.data.delRack}从该位置移除？`,
      cancelText: '取消',
      confirmText: '确认',
      confirmColor: '#074195',
      success: res => {
        if (res.confirm) {
          this.moveRackToPosition(false)
        } else if (res.cancel) {
          
        }
      }
    })
  },

  onCancelDel() {
    this.setData({
      delRackList: [],
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
          searchValue: res.result
        })
        
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
  
  chooseView: function(id) {
    this.setData({
      toView: id
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