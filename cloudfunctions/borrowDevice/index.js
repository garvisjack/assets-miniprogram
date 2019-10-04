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
  // 检查是否已经被人借用
  const hasDevice =  await db.collection('device_send').where({
    device_number: event.number,
    send_status: 1
  }).get()

  // 查询机柜是否借用设备
  const hasDeviceRack =  await db.collection('rack_list').where(_.or([
    { com: event.number },
    { power: event.number },
    { '34970': event.number },
    { '34910': event.number },
    { other: event.number }
  ])).get()

  // 检查该设备是否在设备列表中
  const isDevice =  await db.collection('device_list').where({
    number: event.number
  }).get()

  //检查设备编号是否为机柜的编号
  const isRack =  await db.collection('device_list').where({
    number: event.number,
    rack: 1
  }).get()

  // 添加借用信息
  if(isDevice.data.length == 0) {
    return 'notdevice'
  }
  if(isRack.data.length > 0) {
    return 'israck'
  }

  if(hasDevice.data.length > 0 || hasDeviceRack.data.length > 0) {
    return 'exist'
  }else{
    const sendDevice =  await db.collection('device_send').add({
      data: {
        device_number: event.number,
        expect_return_time: event.dateTime,
        real_return_time: event.realReturnTime,
        send_status: 1,
        status_name: '借用',
        send_time: event.sendTime,
        user_name: event.username,
        user_id: event.userId
      }
    })
    return {
      sendDevice
    }
  }
}