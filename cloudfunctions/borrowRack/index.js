// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  // 检查是否已经被人借用
  let hasRack =  await db.collection('rack_send').where({
   rack_number: event.number,
   send_status: 1
  }).get()

  // 添加借用信息
  if(hasRack.data.length > 0) {
    return 'exist'
  }else{
    let sendRack =  await db.collection('rack_send').add({
      data: {
        rack_number: event.number,
        expect_return_time: event.dateTime,
        real_return_time: '',
        send_status: 1,
        project: event.project,
        send_time: event.sendTime,
        user_name: event.username,
        user_id: event.userId
      }
    })
    return {
      sendRack
    }
  }
}