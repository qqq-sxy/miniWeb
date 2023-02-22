//本地缓存有时效性化
var redis = "redis"

/**
 * 保存至本地缓存
 * @param {*} key 键
 * @param {*} value 值
 * @param {*} time 有效时间，且time单位为秒
 */
function putStorage(key, value, time) {
  wx.setStorageSync(key, value)
  let seconds = parseInt(time)
  if (seconds > 0) {
    let newTime = Date.parse(new Date()) / 1000 + seconds //单位为秒
    wx.setStorageSync(key + redis, newTime + "")
  } else {
    wx.removeStorageSync(key + redis)
  }
}

/**
 * 获取本地缓存值
 * @param {*} key 键
 */
function getStorage(key) {
  let deadTime = parseInt(wx.getStorageSync(key + redis))
  if (deadTime) {
    if (parseInt(deadTime) < (Date.parse(new Date()) / 1000)) {
      this.deleteStorage(key)
      wx.showToast({
        title: '登录信息已过期',
        icon: 'error',
        duration: 2000
      })
      wx.reLaunch({
        url: '/pages/login/login'
      })
      return null
    } else {
      return wx.getStorageSync(key)
    }
  } else {
    wx.showToast({
      title: '还未登录',
      icon: 'error',
      duration: 2000
    })
    console.log('还未登录')
    wx.reLaunch({
      url: '/pages/login/login'
    })
    return null
  }
}

/**
 * 删除缓存
 */
function deleteStorage(key) {
  wx.removeStorageSync(key)
  wx.removeStorageSync(key + redis)
}

/**
 * 清楚所有缓存
 */
function deleteAllStorage() {
  wx.clearStorageSync()
}

module.exports = {
  putStorage,
  getStorage,
  deleteStorage,
  deleteAllStorage
}