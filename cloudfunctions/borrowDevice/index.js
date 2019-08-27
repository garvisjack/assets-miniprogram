// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  // 检查是否已经借用
  let hasDevice =  await db.collection('device_send').where({
    device_number: event.number
  }).get()

  // 添加借用信息
  if(hasDevice.data.length > 0) {
    return 'exist'
  }else{
    let sendDevice =  await db.collection('device_send').add({
      data: {
        device_number: event.number,
        expect_return_time: event.dateTime,
        status: 1,
        send_time: event.sendTime,
        user_name: event.username
      }
    })
    return {
      sendDevice
    }
  }
}