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

  // 检查是否是机柜编号
  const isRack =  await db.collection('rack_list').where({
    number: event.number
  }).get()

  if(isRack.data.length == 0) {
    return 'notrack'
  }

  // 检查机柜位置表中是否已经存在相同机柜
  if(event.status == 1) {
    const hasRack =  await db.collection('rack_position').where({
      rack_number: event.number
    }).get()
    if(hasRack.data.length > 0) {
      return 'exist'
    }
  }

  // 添加借用信息
   // 更新机柜位置表中的机柜编号
    const moveRack =  await db.collection('rack_position').where({
      room: event.room,
      position: event.position
    }).update({
      data: {
        rack_number: event.newNumber
      }
    })
    // 向机柜位置变更表中添加数据
    const addRackChange =  await db.collection('rack_position_change').add({
      data: {
        rack_number: event.number,
        change_time: event.dateTime,
        user_name: event.username,
        room: event.room,
        position: event.position,
        status: event.status,
        status_name: event.statusName
      }
    })
    
    return {
      moveRack,
      addRackChange
    }
}