// pages/allPlan/allPlan.js
import request from '../../utils/request'
import changeTime from "../../utils/dateType"


const app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [], //所有数据
    type: 0, //当前页面的类型
    finish_list: [], //当前页面已完成数据
    unfinish_list: [], //当前页面未完成数据
    show1: true, //未完成是否显示
    show2: false, //已完成是否显示 
    show3: false, //删除 移动框是否显示
    title: '', //标题
    date_color: ['#fc606b', '#fab001', '#5673d0', '#0ecb9d'],
    listId: '', //删除时需要的listId
    // content: '',
    // status: '',
    // date: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let dataList = []
    let finish_list = []
    let nofinish_list = []
    let type = 0
    let title = ''
    const eventChannel = this.getOpenerEventChannel()
    //向index页面传送数据
    eventChannel.emit('acceptDataOpenedPage', {
      data: this.data.type
    })
    //监听acceptDataOpenedPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('acceptDataOpenedPage', function (data) {
      // console.log('获取上一页面通过eventChannel传送到当前页面的数据:', data)
      dataList = data.data
      type = data.type
      // console.log(dataList, type)
      // console.log('c此次', type)
    })
    dataList = dataList.sort((a, b) => +a.listId - +b.listId)
    nofinish_list = dataList.filter(item => (item.type === type && item.status === 0))
    finish_list = dataList.filter(item => (item.type === type && item.status === 1))

    //动态修改标题
    switch (type) {
      case 0:
        title = '重要且紧急'
        break;
      case 1:
        title = '重要不紧急'
        break;
      case 2:
        title = '不重要但紧急'
        break;
      case 3:
        title = '不重要不紧急'
        break;
    }

    this.setData({
      dataList: dataList,
      finish_list: finish_list,
      nofinish_list: nofinish_list,
      type: type,
      title: title
    })
    // console.log(type)

    //动态修改标题title
    wx.setNavigationBarTitle({
      title: this.data.title //页面标题为路由参数
    })

    //向index页面发送数据
    console.log('全局app:', app)
  },


  //是否显示下拉列表
  isShow(e) {
    // console.log('isShow:', this.data.show1)
    if (e.target.id === 'no_finish') {
      this.setData({
        show1: !this.data.show1
      })
    } else if (e.target.id === 'finish') {
      this.setData({
        show2: !this.data.show2
      })
    }
  },

  //改变选框状态
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
    let result = await request("/users/changeStatus", data, 'POST')
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

  //将dataList分类
  split_dataList() {
    let nofinish_list = [] //未完成数据
    let finish_list = [] //已完成数据
    let dataList = this.data.dataList
    let type = this.data.type
    // console.log('再次：', dataList)
    dataList = dataList.sort((a, b) => +a.listId - +b.listId)
    nofinish_list = dataList.filter(item => (item.type === type && item.status === 0))
    finish_list = dataList.filter(item => (item.type === type && item.status === 1))
    this.setData({
      dataList: dataList,
      finish_list: finish_list,
      nofinish_list: nofinish_list,
    })
  },

  //获取ModalInput传来的值
  getModalInputVal(e) {
    // console.log('获取ModalInput传来的值：', e.detail)
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

  //长按事件执行
  more_fun(e) {
    // console.log('myListId:', e.currentTarget.id)
    this.setData({
      show3: true,
      listId: e.currentTarget.id
    })
  },

  cancelShow3() {
    this.setData({
      show3: false,
      listId: ''
    })
    console.log('cccc:', app.globalData)
  },

  //删除计划
  async deletePlan() {
    let result = await request('/users/deleteFourQuadrants', {
      listId: this.data.listId
    }, 'POST')
    let dataList = this.data.dataList.filter(item => item.listId !== this.data.listId)
    this.setData({
      dataList: dataList
    })
    this.split_dataList()
    this.cancelShow3()
    this.setData({
      listId: ''
    })
  },

  //重新编辑计划
  async changePlan() {
    // console.log('changePlan:', app.globalData)
    app.globalData.eventBus.emit('changePlan_listId',
      this.data.listId
    )
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

  },

  onUnload() { //页面销毁时执行
    // console.log('页面已经销毁:', app.globalData.eventBus)
    app.globalData.eventBus.emit('toIndex_data', this.data.dataList)
  }
})