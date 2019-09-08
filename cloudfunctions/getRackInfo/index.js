// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  // 机柜信息表
  let rackInfo =  await db.collection('rack_list').where({
    number: event.number
  }).get()

  return {
    rackInfo
  }
}