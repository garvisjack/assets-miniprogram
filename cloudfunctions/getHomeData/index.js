// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {

  // 查询借用中的设备
    // 做分页功能
    let pageIndex = event.pageIndex ? event.pageIndex : 1;
    let pageSize = event.pageSize ? event.pageSize : 20;
    let filter = event.filter ? event.filter : null;
    const countResult = await db.collection('device_send').where(filter).count()
    const total = countResult.total
    const totalPage = Math.ceil(total / pageSize)
  
    let allDeviceSend = []
    if(totalPage > 0) {
      for(let i = 0;i<totalPage;i++) {
        let deviceSend =  await db.collection('device_send').where(filter).skip((pageIndex - 1) * pageSize).limit(pageSize).get()
        allDeviceSend.push(deviceSend)
        pageIndex++
      }
    }
  //查询借用中的机柜
  let pageIndex2 = event.pageIndex ? event.pageIndex : 1;
  const countResult2 = await db.collection('rack_send').where(filter).count()
  const rackTotal = countResult2.total
  const totalPage2 = Math.ceil(rackTotal / pageSize)

  let allRackSend = []
  if(totalPage2 > 0) {
    for(let i = 0;i<totalPage2;i++) {
      let rackSend =  await db.collection('rack_send').where(filter).skip((pageIndex2 - 1) * pageSize).limit(pageSize).get()
      allRackSend.push(rackSend)
      pageIndex2++
    }
  }
  
   

    return {
      allDeviceSend,
      allRackSend,
      total,
      rackTotal
    }
}