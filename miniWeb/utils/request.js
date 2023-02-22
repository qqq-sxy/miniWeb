import config from './config'
import storageTime from '../utils/storageTime'



export default (url, data = {}, method = 'GET') => {
  // console.log('请求的数据：', url, data, method, token)
  return new Promise((resolve, reject) => {
    const token = storageTime.getStorage('token')
    wx.request({
      url: config.host + url,
      // url: config.mockHost + url,
      data,
      method,
      header: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        console.log('请求成功', res)
        resolve(res)
      },
      fail: (err) => {
        console.log('请求失败', err)
        reject(err)
      }
    })
  })
}