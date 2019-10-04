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
  // 做分页功能
  let pageIndex = event.pageIndex ? event.pageIndex : 1;
  let pageSize = event.pageSize ? event.pageSize : 20;
  let filter = event.filter ? event.filter : null;
  const countResult = await db.collection('device_send').where(filter).count()
  const total = countResult.total
  const totalPage = Math.ceil(total / pageSize)

  // 查询设备借用列表
  let allDeviceChange = []
  if(totalPage > 0) {
    for(let i = 0;i<totalPage;i++) {
      let deviceSend =  await db.collection('device_send').where(filter).skip((pageIndex - 1) * pageSize).limit(pageSize).orderBy('send_time', 'desc').get()
      allDeviceChange.push(deviceSend)
      pageIndex++
    }
  }

  //查询借用中的机柜
  let pageIndex2 = event.pageIndex ? event.pageIndex : 1;
  const countResult2 = await db.collection('rack_change').where(filter).count()
  const rackTotal = countResult2.total
  const totalPage2 = Math.ceil(rackTotal / pageSize)

  let allRackChange = []
  if(totalPage2 > 0) {
    for(let i = 0;i<totalPage2;i++) {
      let rackSend =  await db.collection('rack_change').where(filter).skip((pageIndex2 - 1) * pageSize).limit(pageSize).orderBy('change_time', 'desc').get()
      allRackChange.push(rackSend)
      pageIndex2++
    }
  }
  
  return {
    allDeviceChange,
    allRackChange
  }
}