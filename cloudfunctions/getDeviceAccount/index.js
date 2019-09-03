// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  // 做分页功能
  let pageIndex = event.pageIndex ? event.pageIndex : 1;
  let pageSize = event.pageSize ? event.pageSize : 20;
  let filter = event.filter ? event.filter : null;
  const countResult = await db.collection('device_send').where(filter).count()
  const total = countResult.total
  const totalPage = Math.ceil(total / pageSize)

  const deviceAccount =  await db.collection('device_send').where(filter).skip((pageIndex - 1) * pageSize).limit(pageSize).orderBy('send_time', 'desc').get()

  for(let item of deviceAccount.data) {
    const deviceName = await db.collection('device_list').where({number: item.device_number}).get()
    item.device_name = deviceName.data[0].name
  }
  return {
    deviceAccount
  }
}