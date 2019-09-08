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
  const countResult = await db.collection('rack_position').where(filter).count()
  const total = countResult.total
  const totalPage = Math.ceil(total / pageSize)

  let allPosition = []
  if(totalPage > 0) {
    for(let i = 0;i<totalPage;i++) {
      let position =  await db.collection('rack_position').where(filter).skip((pageIndex - 1) * pageSize).limit(pageSize).get()
      allPosition.push(position)
      pageIndex++
    }
  }
  
  return {
    allPosition
  }
}