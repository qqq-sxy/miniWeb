// pages/login/login.js
import request from "../../utils/request"
import storageTime from "../../utils/storageTime"

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // userInfo: {}, //用户信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  //获取oppid
  getAppid() {
    // 登录
    wx.login({
      success: async (res) => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        let code = res.code
        let result = await request('/users/getOpenId', {
          code
        })
        let token = result.data
        //本地缓存
        storageTime.putStorage('token', token, 2 * 24 * 60 * 60)
        //将用户信息存入数据库
        let result2 = await request('/users/putUserInfo', res.userInfo, 'POST')
        //代表用户信息输入数据库成功或数据库中已有该用户
        if (result2.data.code === 1 || result2.data.code === 2) {
          console.log(11111111)
          wx.switchTab({
            url: '../index/index'
          })
        } else if (result2.data.code === 0) {
          wx.showToast({
            title: result2.data.msg,
            icon: 'err',
            duration: 2000
          })
        }

      }
    })
  },

  getUserProfile(e) {
    // 推荐使用 wx.getUserProfile 获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于获取用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: async (res) => {
        this.getAppid()
        storageTime.putStorage('userInfo', res.userInfo, 2 * 24 * 60 * 60)
        //将用户信息存入数据库
        // let result = this.putUserInfo(res.userInfo)
        // let result = await request('/users/putUserInfo', res.userInfo, 'POST')

        // //代表用户信息输入数据库成功或数据库中已有该用户
        // if (result.data.code === 1 || result.data.code === 2) {
        //   console.log(11111111)
        //   wx.switchTab({
        //     url: '../index/index'
        //   })
        // } else if (result.data.code === 0) {
        //   wx.showToast({
        //     title: result.data.msg,
        //     icon: 'err',
        //     duration: 2000
        //   })
        // }

      },
      fail: (err) => {
        wx.showToast({
          title: '获取授权失败',
          icon: 'err',
          duration: 2000
        })
      }
    })
  },

  // //将用户信息存入数据库
  // async putUserInfo(userInfo) {
  //   // const token = storageTime.getStorage('token')
  //   let result = await request('/users/putUserInfo', userInfo, 'POST')
  //   console.log('result:', result)
  //   return result
  // },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})