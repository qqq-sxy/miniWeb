import storageTime from '../../utils/storageTime'
import uCharts from '../../components/u-charts/u-charts.min'
import request from '../../utils/request'
import changeTime from "../../utils/dateType"


var uChartsInstance = {};
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      avatarUrl: '', //头像
      nickName: '', //昵称
    },
    dataList: [], //所有的计划
    plan_data: { //计划表中数据
      categories: [], //x轴数据
      series: [{ //具体内容，使用默认就好
        name: "计划完成数",
        setShadow: [
          10,
          10,
          10,
          "#f87905"
        ],
        data: [], //y轴数据
      }]
    },
    length: 0, //完成计划总条数
    cWidth: 750,
    cHeight: 500,
    todayTimes: 0, //今日番茄次数
    sumTimes: 0, //累计番茄次数
    todayTime: 0, //今日专注时长
    sumTime: 0, //累计专注时长
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //从storage中获取用户信息
    this.getUserInf()

    //获取番茄计时的所有数据
    this.getData()
  },

  //从storage中获取用户信息
  getUserInf() {
    let userInfo = storageTime.getStorage('userInfo')
    this.setData({
      userInfo: userInfo
    })
    // console.log(userInfo)
    //获取四象限的数据
    this.getFourQuadrent()
  },

  //获取四象限数据
  async getFourQuadrent() {
    let result = await request('/users/index')
    //将dataList时间格式转换标准
    let dataList = this.changeTimeType(result.data.data)
    //将数据进行分类
    this.split_dateList(dataList)

    //画图表
    this.plan_statistics_data();

    this.setData({
      dataList: dataList
    })
  },

  //获取番茄计时的所有数据
  async getData() {
    let result = await request('/users/get_timingData')
    let now = new Date().toLocaleDateString() //当前日期
    let todayTimes = 0
    let sumTimes = 0
    let todayTime = 0
    let sumTime = 0

    let nowArr = result.data.data.map(item => {
      if (item.status === 1 && new Date(+item.uuid).toLocaleDateString() === now) {
        todayTime = todayTime + +item.times
        return item
      }
    })

    let sumArr = result.data.data.map(item => {
      if (item.status === 1) {
        sumTime = sumTime + +item.times
        return item
      }
    })

    this.setData({
      todayTimes: nowArr.length,
      sumTimes: sumArr.length,
      todayTime: todayTime,
      sumTime: sumTime
    })

  },

  //将dataList时间格式转换成毫秒
  changeTimeType(arr) {
    return arr.map(item => {
      item.date = changeTime.dateType(item.date)
      return item
    })
  },

  //将数据进行分类
  split_dateList(data) {
    let nowTime = new Date().toLocaleDateString().replace(/\//g, '-')
    let dateArr = this.getBefore_time(nowTime)
    let length = 0 //完成计划总条数

    let length_arr = [0, 0, 0, 0, 0]
    data.map(item => {
      let temp = item.date.split(' ')[0]
      let temp_arr = temp.split('-')
      temp_arr[1] = temp_arr[1].replace(/\b(0+)/gi, "")
      temp_arr[2] = temp_arr[2].replace(/\b(0+)/gi, "")
      temp = temp_arr[0] + '/' + temp_arr[1] + '/' + temp_arr[2]
      let index = dateArr.indexOf(temp)
      if (index >= 0) {
        length_arr[index] = length_arr[index] + 1
      }
      //完成计划总条数
      if (item.status === 1) {
        length++
      }
    })

    dateArr = dateArr.map(item => { //将x轴的年份去掉
      return item.slice(5)
    })
    let plan_data = { //计划表中数据
      categories: dateArr, //x轴数据
      series: [{ //具体内容，使用默认就好
        name: "计划完成数",
        setShadow: [
          10,
          10,
          10,
          "#f87905"
        ],
        data: length_arr, //y轴数据
      }]
    }

    this.setData({
      plan_data: plan_data,
      length: length
    })

    // console.log('data:', this.data.plan_data)
    // console.log('nowTime:', length_arr)
    // console.log('dateArr:', dateArr)
  },

  //获取当前日期下的前五日日期数组
  getBefore_time(time) {
    let res = []
    for (let i = 0; i < 5; i++) {
      time = time.replace(/\-/g, '/')
      res.unshift(time)
      let temp = new Date(time).getTime() - 24 * 60 * 60 * 1000
      time = new Date(temp).toLocaleDateString()
    }
    return res
  },

  //获取计划统计表中的数据
  plan_statistics_data() {
    let res = this.data.plan_data
    console.log('res', res)
    this.drawCharts('czhGdopuUydatsAdPiPqjallmEzoIOBC', res);
  },

  //退出登录
  signOut() {
    storageTime.deleteAllStorage()
    wx.reLaunch({
      url: '../login/login'
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    //这里的第一个 750 对应 css .charts 的 width
    const cWidth = 750 / 750 * wx.getSystemInfoSync().windowWidth;
    //这里的 500 对应 css .charts 的 height
    const cHeight = 500 / 750 * wx.getSystemInfoSync().windowWidth;
    this.setData({
      cWidth,
      cHeight
    });
    // this.plan_statistics_data();
  },

  // //获取计划统计表数据
  // getServerData() {
  //   //模拟从服务器获取数据时的延时
  //   setTimeout(() => {
  //     //模拟服务器返回数据，如果数据格式和标准格式不同，需自行按下面的格式拼接
  //     let res = {
  //       categories: ["2018", "2019", "2020", "2021", "2022", "2023"],
  //       series: [{
  //         name: "计划完成数",
  //         setShadow: [
  //           10,
  //           10,
  //           10,
  //           "#f87905"
  //         ],
  //         data: [15, 45, 15, 45, 15, 45]
  //       }]
  //     };
  //     this.drawCharts('czhGdopuUydatsAdPiPqjallmEzoIOBC', res);
  //   }, 500);
  // },
  drawCharts(id, data) {
    const ctx = wx.createCanvasContext(id, this);
    uChartsInstance[id] = new uCharts({
      type: "line",
      context: ctx,
      width: this.data.cWidth,
      height: this.data.cHeight,
      categories: data.categories,
      series: data.series,
      animation: true,
      background: "#FFFFFF",
      color: ["#f87905", "#91CB74", "#FAC858", "#EE6666", "#73C0DE", "#3CA272", "#FC8452", "#9A60B4", "#ea7ccc"],
      padding: [15, 10, 0, 15],
      dataLabel: false,
      dataPointShape: false,
      enableScroll: false,
      legend: {},
      xAxis: {
        disableGrid: true
      },
      yAxis: {
        gridType: "dash",
        dashLength: 2,
        data: [{
          min: 0,
          max: 20
        }]
      },
      extra: {
        line: {
          type: "curve",
          width: 5,
          activeType: "hollow", //激活指示点类型
          linearType: "none", //关闭渐变色
          onShadow: true,
          animation: "horizontal" //动画效果方向
        }
      }
    });
  },
  tap(e) {
    uChartsInstance[e.target.id].touchLegend(e);
    uChartsInstance[e.target.id].showToolTip(e);
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