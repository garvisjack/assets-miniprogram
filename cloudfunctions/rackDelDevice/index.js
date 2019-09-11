// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  if(event.part == 'com') {
    const delDevice =  await db.collection('rack_list').doc(event.id).update({
      data: {
        com: event.content
      }
    })
  }
  if(event.part == 'power') {
    const delDevice =  await db.collection('rack_list').doc(event.id).update({
      data: {
        power: event.content
      }
    })
  }
  if(event.part == '34970') {
    const delDevice =  await db.collection('rack_list').doc(event.id).update({
      data: {
        '34970': event.content
      }
    })
  }
  if(event.part == '34901') {
    const delDevice =  await db.collection('rack_list').doc(event.id).update({
      data: {
        '34901': event.content
      }
    })
  }
  if(event.part == 'other') {
    const delDevice =  await db.collection('rack_list').doc(event.id).update({
      data: {
        other: event.content
      }
    })
  }

  // 移除记录插入变更表
  let addDelRecord =  await db.collection('rack_change').add({
    data: {
      rack_number: event.number,
      device_number: event.deviceNumber,
      change_time: event.dateTime,
      user_name: event.username,
      user_id: event.userId,
      status: 0,
      status_name: '移除'
    }
  })

  return {
    delDevice
  }
}