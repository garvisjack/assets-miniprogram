// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  traceUser: true,
  env: 'prod-hlfc5'
})
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  // 机柜信息表
  let rackInfo =  await db.collection('rack_list').where({
    number: event.number
  }).get()

  // 若other组件存在设备，对其中编号查询 获取中文名称
  for(let item of rackInfo.data) {
    if(item.other.length) {
      item.otherName = []
      for(let val of item.other) {
        const deviceName = await db.collection('device_list').where({number: val}).get()
        item.otherName.push(deviceName.data[0].name)
      }
    }
  }

  return {
    rackInfo
  }
}