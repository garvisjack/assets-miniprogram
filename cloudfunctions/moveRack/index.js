// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  // 检查是否该位置被人占用了
  let hasRack =  await db.collection('rack_position').where({
    room: event.room,
    position: event.position
  }).get()

  // 添加借用信息
  if(hasRack.data.length > 0 && hasRack.data[0].rack_number != '') {
    return 'exist'
  }else{
    // 更新机柜位置表中的机柜编号
    let moveRack =  await db.collection('rack_position').where({
      room: event.room,
      position: event.position
    }).update({
      data: {
        rack_number: event.number
      }
    })
    // 向机柜位置变更表中添加数据
    let addRackChange =  await db.collection('rack_position_change').add({
      data: {
        rack_number: event.number,
        change_time: event.dateTime,
        user_name: event.username,
        room: event.room,
        position: event.position
      }
    })
    
    return {
      moveRack,
      addRackChange
    }
  }
}