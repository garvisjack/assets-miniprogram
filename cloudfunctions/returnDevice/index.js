// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const returnDevice =  await db.collection('device_send').doc(event.id).update({
    data: {
      send_status: 0,
      real_return_time: event.realReturnTime
    }
  })

  return {
    returnDevice
  }
}