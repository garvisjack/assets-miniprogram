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
  // 更改设备总表设备状态
  let updateDevice =  await db.collection('device_list').where({
    number: event.number
  }).update({
    data: {
      status: event.status,
      status_name: event.statusName
    }
  })

  // 设备信息变更表add
  let changeDevice =  await db.collection('device_change').add({
    data: {
      change_time: event.changeTime,
      device_number: event.number,
      user_name: event.username,
      status: event.status,
      status_name: event.statusName,
      reason: event.reason
    }
  })
  return {
    updateDevice,
    changeDevice
  }
}