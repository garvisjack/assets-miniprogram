// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  // 检查是否已经被人借用
  let hasDevice =  await db.collection('device_send').where({
    device_number: event.deviceNumber,
    send_status: 1
  }).get()

  // 查询机柜是否借用设备
  let hasDeviceRack =  await db.collection('rack_list').where(_.or([
    { com: event.deviceNumber },
    { power: event.deviceNumber },
    { '34970': event.deviceNumber },
    { '34910': event.deviceNumber },
    { other: event.deviceNumber }
  ])).get()

  // 移除记录插入变更表 先判断设备是否可增加
  if(hasDevice.data.length > 0 || hasDeviceRack.data.length > 0) {
    return 'exist'
  }else{
    // 增加来源
    if(event.part == 'com') {
      const addDevice =  await db.collection('rack_list').doc(event.id).update({
        data: {
          com: event.content
        }
      })
    }
    if(event.part == 'power') {
      const addDevice =  await db.collection('rack_list').doc(event.id).update({
        data: {
          power: event.content
        }
      })
    }
    if(event.part == '34970') {
      const addDevice =  await db.collection('rack_list').doc(event.id).update({
        data: {
          '34970': event.content
        }
      })
    }
    if(event.part == '34901') {
      const addDevice =  await db.collection('rack_list').doc(event.id).update({
        data: {
          '34901': event.content
        }
      })
    }
    if(event.part == 'other') {
      const addDevice =  await db.collection('rack_list').doc(event.id).update({
        data: {
          other: event.content
        }
      })
    }
    let addDeviceChange =  await db.collection('rack_change').add({
      data: {
        rack_number: event.number,
        device_number: event.deviceNumber,
        change_time: event.dateTime,
        user_name: event.username,
        user_id: event.userId,
        status: 1
      }
    })
    return {
      addDeviceChange
    }
  }
}