import date from "../../utils/date"
import request from "../../utils/request"
import changeTime from "../../utils/dateType"

const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    dateString: "", //当前选中的日期
    defaultDate: "", //默认选中的时间
    spot: [], //底部需要展示小圆点的日期数组
    dataList: [], //所有数据
    list: [], //当前展示数据
    show3: false, //删除 移动框是否显示
    listId: '', //要删除的选项
  },

  /**
   * 选中的日期变化时触发
   * @param {*} 
   */
  dateChange(e) {
    let list = this.data.dataList.filter(item => {
      return item.date.split(" ")[0] === e.detail.dateString
    })
    this.setData({
      dateString: e.detail.dateString,
      list: list
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //设置初始时间
    let defaultDate = date.initYear + '-' + date.initMonth + '-' + date.initDay
    this.setData({
      defaultDate: defaultDate
    })
    //获取四象限所有数据
    this.getFourQuadrent()

  },

  //底部需要展示小圆点的日期数组
  show_polkaDot(arr) {
    let set = new Set()
    arr.forEach(item => {
      if (!set.has(item.date.split(" ")[0])) {
        set.add(item.date.split(" ")[0])
      }
    })
    return Array.from(set)
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

    //排序
    dataList = dataList.sort((a, b) => +a.listId - +b.listId)

    let list = dataList.filter(item => {
      // console.log('item:', item.date.split(" ")[0])
      return item.date.split(" ")[0] === this.data.dateString
    })
    this.setData({
      dataList: dataList,
      list: list
    })
    // this.split_dataList()
  },

  //获取四象限数据
  async getFourQuadrent() {
    let result = await request('/users/index')
    //将dataList时间格式转换标准
    let dataList = this.changeTimeType(result.data.data)
    // console.log('当前时间:', this.data.dateString)
    let list = dataList.filter(item => {
      // console.log('item:', item.date.split(" ")[0])
      return item.date.split(" ")[0] === this.data.dateString
    })
    //底部需要展示小圆点的日期数组
    let spot = this.show_polkaDot(dataList)
    // console.log('list:', list)
    this.setData({
      dataList: dataList,
      list: list,
      spot: spot
    })
    // console.log('四象限所有数据:', this.data.dataList)
  },

  //获取ModalInput传来的值
  getModalInputVal(e) {
    // console.log('获取ModalInput传来的值：', e.detail.data)
    let dataList = this.data.dataList
    dataList.push(e.detail.data)
    let list = dataList.filter(item => {
      // console.log('item:', item.date.split(" ")[0])
      return item.date.split(" ")[0] === this.data.dateString
    })
    //底部需要展示小圆点的日期数组
    let spot = this.show_polkaDot(dataList)
    // console.log('list:', list)
    this.setData({
      dataList: dataList,
      list: list,
      spot: spot
    })

    if (e.detail.code === 1) { //代表四象限计划存入数据库成功
      this.getFourQuadrent()
    }
  },

  //将dataList时间格式转换正确
  changeTimeType(arr) {
    return arr.map(item => {
      item.date = changeTime.dateType(item.date)
      return item
    })
  },

  //删除重新编辑等功能
  //长按事件执行
  more_fun(e) {
    // console.log('eee:', e)
    // console.log('myListId:', e.currentTarget.id)
    this.setData({
      show3: true,
      listId: e.currentTarget.id
    })
  },

  //取消选中状态
  cancelShow3() {
    // console.log('取消选中:', app)
    this.setData({
      show3: false,
      listId: ''
    })
  },

  //删除计划
  async deletePlan() {
    let result = await request('/users/deleteFourQuadrants', {
      listId: this.data.listId
    }, 'POST')
    let dataList = this.data.dataList.filter(item => item.listId !== this.data.listId)
    let list = dataList.filter(item => {
      return item.date.split(" ")[0] === this.data.dateString
    })
    let spot = this.show_polkaDot(dataList)
    this.setData({
      dataList: dataList,
      list: list,
      spot: spot
    })
    this.split_dataList()
    this.cancelShow3()
    this.setData({
      listId: ''
    })
  },

  //重新编辑计划
  async changePlan() {
    // console.log('changePlan:', this.data.listId)
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

  }
})