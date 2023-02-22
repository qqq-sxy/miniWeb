// components/ModalInput/ModalInput.js
import date from '../../utils/date'
import request from '../../utils/request'

let app = getApp()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    url: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    hiddenModal: true, //初始化隐藏modal框
    inputVal: '', //输入框内容
    modalVal: { //日期选择器值
      type: 0,
      year: date.initYear[0],
      month: date.initMonth[0],
      day: date.initDay[0],
      hour: date.initHour[0],
      minute: date.initMinute[0],
    },
    listId: '', //重新编辑计划中的listId
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //获取MixPicker传来的值
    getMixPickerVal(e) { //这个方法会被传递给子组件供子组件调用
      // console.log("子组件的值：", e.detail)
      this.setData({
        modalVal: e.detail
      })

      // //获取allPlan传来的  是否打开ModalInput值
      // app.globalData.eventBus.on('show_ModalInput', (data) => {
      //   console.log('show_ModalInput:', data)
      //   this.controlShow('false')
      //   // console.log(this.data.hiddenModal)
      // })
    },
    //控制是否显示按钮 true为不显示 false为显示 且初始化数据
    controlShow(val) {
      val = val === "true" ? true : false
      this.setData({
        hiddenModal: val
      })
    },
    // 获取输入框内容
    commentInput: function (event) {
      this.setData({
        inputVal: event.detail.value
      })
      // console.log(event.detail.value)
    },
    //点击取消按钮事件
    cancelBut() {
      // console.log('取消按钮')
      this.controlShow('true')
    },
    //点击添加按钮事件
    confirmBut() {
      if (this.data.inputVal.length === 0) {
        wx.showToast({
          title: '输入不能为空',
          icon: 'error',
          duration: 2000
        })
      } else {
        this.controlShow('true')
        this.reqAddData()
      }
      // console.log("传过来的值：", this.data.modalVal)
      // console.log("input的值：", this.data.inputVal)
      // console.log('添加按钮')
    },
    //请求添加数据
    async reqAddData() {
      let url = this.properties.url
      var timestamp = ''

      //重新编辑的url
      if (url === '/users/changeFourQuadrants') {
        timestamp = this.data.listId
      } else if (url === '/users/addFourQuadrants') {
        //获取当前时间+内容
        timestamp = new Date().getTime() + ''
      }
      //获取当前时间+内容
      // var timestamp = new Date().getTime() + ''; //1610075969354

      let data = {
        listId: timestamp,
        type: this.data.modalVal.type,
        content: this.data.inputVal,
        status: 0,
        date: `${this.data.modalVal.year}-${this.data.modalVal.month}-${this.data.modalVal.day} ${this.data.modalVal.hour}:${this.data.modalVal.minute}`
      }
      // console.log(data)
      let result = await request(url, data, 'POST')
      // console.log('四象限添加数据后返回值：', result.data)
      if (result.data.code === 1) { //代表四象限计划存入数据库成功
        //向四象限页面传值
        this.triggerEvent('getModalInputVal', {
          code: result.data.code,
          data: data
        })
      }
    }

  },
  lifetimes: {
    created: function () {
      // 在组件实例进入页面节点树时执行
      app.globalData.eventBus.on('changePlan_listId', (data) => {
        console.log('changeFourQuadrants：', data)
        this.setData({
          listId: data
        })
      })
    },

  },

})