// pages/index/index.js
import request from "../../utils/request"
import changeTime from "../../utils/dateType"
import storageTime from "../../utils/storageTime"

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [], //所有数据
    dataList1: [], //类型1数据 且长度为8
    dataList2: [], //类型2数据
    dataList3: [], //类型3数据
    dataList4: [], //类型4数据
    modalDate: "", //弹窗日期值
    modalInput: "", //弹窗input框值
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // console.log(storageTime.getStorage('token'))
    if (storageTime.getStorage('token')) {
      this.getFourQuadrent()
    }
  },

  //获取ModalInput传来的值
  getModalInputVal(e) {
    console.log('获取ModalInput传来的值：', e.detail)
    if (e.detail.code === 1) { //代表四象限计划存入数据库成功
      this.getFourQuadrent()
    }
  },


  //获取四象限数据
  async getFourQuadrent() {
    let result = await request('/users/index')
    //将dataList按照倒序排序
    let dataList = this.sort_dataList(result.data.data)
    //将dataList时间格式转换标准
    dataList = this.changeTimeType(dataList)
    this.setData({
      dataList: dataList
    })
    this.split_dataList()
  },

  //将dataList按照倒序时间排序
  sort_dataList(arr) {
    return arr.sort((a, b) => {
      return +b.listId - +a.listId
    })
  },

  //将dataList时间格式转换正确
  changeTimeType(arr) {
    return arr.map(item => {
      item.date = changeTime.dateType(item.date)
      return item
    })
  },

  //将dataList分类
  split_dataList() {
    let dataList1 = [] //类型1数据
    let dataList2 = [] //类型2数据
    let dataList3 = [] //类型3数据
    let dataList4 = [] //类型4数据
    this.data.dataList.map(item => {
      if (item.type === 0 && dataList1.length < 4) {
        dataList1.push(item)
      } else if (item.type === 1 && dataList2.length < 4) {
        dataList2.push(item)
      } else if (item.type === 2 && dataList3.length < 4) {
        dataList3.push(item)
      } else if (item.type === 3 && dataList4.length < 4) {
        dataList4.push(item)
      }
    })
    this.setData({
      dataList1: dataList1,
      dataList2: dataList2,
      dataList3: dataList3,
      dataList4: dataList4,
    })
  },

  //改变选中状态
  async changeStatus(e) {
    // console.log('选中状态：', e.target.id)
    let status = e.target.dataset.status ^ 1 //异或反转0和1
    let listId = e.target.id
    // let type = e.target.dataset.type
    this.change_dataList(status, listId)
    let data = {
      status: status,
      listId: listId
    }
    let result = request("/users/changeStatus", data, 'POST')
  },

  //改动状态时本地修改对应的dataList
  change_dataList(status, listId) {
    let dataList = this.data.dataList.map(item => {
      item.status = item.listId === listId ? status : item.status
      return item
    })
    this.setData({
      dataList: dataList
    })
    this.split_dataList()
  },

  //跳转至allPlan页面
  to_allPlan(e) {
    let dataList = this.data.dataList
    let type = +e.target.dataset.type
    // console.log('to_allPlan:', e)

    let that = this //保存this

    wx.navigateTo({
      url: '../allPlan/allPlan',
      events: {
        //为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
        acceptDataOpenedPage: function (data) {
          console.log('获取被打开页面传送到当前页面的数据:', data)
        }
      },
      success: function (res) {
        //通过eventChannel向被打开页面传送数据
        res.eventChannel.emit('acceptDataOpenedPage', {
          data: dataList,
          type: type
        })

        //获取allPlan传来的数据
        app.globalData.eventBus.on('toIndex_data', (data) => {
          //将dataList按照倒序排序
          let dataList = that.sort_dataList(data)
          that.split_dataList()
          that.setData({
            dataList: dataList
          })

        })


      }
    })
  },

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