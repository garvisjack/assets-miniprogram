// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  traceUser: true,
  env: 'prod-hlfc5'
})
const db = cloud.database()
const _ = db.command
/**
 * 这个示例将经自动鉴权过的小程序用户 openid 返回给小程序端
 * 
 * event 参数包含小程序端调用传入的 data
 * 
 */
exports.main = async (event, context) => {
  let userName =  await db.collection('user').where({
    username: event.username
  }).get()
  // 判断账户是否正确
  if(userName.data.length > 0) {
    // 判断账户和密码是否正确
    let userInfo =  await db.collection('user').where({
      username: event.username,
      password: event.password
    }).get()
    if(userInfo.data.length > 0) {
      return {msg: 'success', userInfo}
    }else{
      return '密码错误，请重试'
    }
  }else{
    return '用户名错误，请重试'
  }
  
}
