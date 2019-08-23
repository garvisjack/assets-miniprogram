// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  // 总表
  let deviceInfo =  await db.collection('device_list').where({
    number: event.number
  }).get()

  // 查询借用中的设备
  let deviceUserName =  await db.collection('device_send').where({
    device_number: event.number,
    send_status: '1'
  }).get()

  return {
    deviceInfo,
    deviceUserName
  }
}