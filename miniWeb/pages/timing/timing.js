import clock from '../../utils/clock'
import request from '../../utils/request'

Page({
  remindTime: 0, //提醒时间
  clockShow: false, //是否显示时钟
  clockHeight: 0, //时钟高度
  mTime: 10000,
  timeStr: '01:00', //时钟中央显示的时间
  rate: '',
  timer: null,
  audio: null,
  data: {
    time: 0, //专注的时间
    cateArr: [{ //任务分类
        icon: 'icon-gongzuobao',
        text: '工作'
      },
      {
        icon: 'icon-xuexi',
        text: "学习",
      },
      {
        icon: 'icon-idea',
        text: '思考'
      },
      {
        icon: 'icon-xiezuo',
        text: '写作'
      },
      {
        icon: 'icon-lanqiu',
        text: '运动'
      },
      {
        icon: 'icon-cangpeitubiao_kejianyuedurenshu',
        text: "阅读"
      }
    ],
    cateActive: '0', //获取点击的那个索引
    val: '', //input中的值
    task_list_data: [],
    okShow: false, //控制时钟上的返回按钮显示隐藏
    pauseShow: true, //控制时钟上的暂停按钮显示隐藏
    continueCancleShow: false, //控制时钟上的继续 放弃按钮的显示隐藏
    typeArr: ['icon-gongzuobao', 'icon-xuexi', 'icon-idea', 'icon-xiezuo', 'icon-lanqiu', 'icon-cangpeitubiao_kejianyuedurenshu'],
    titleItem: '', //执行的任务标题
  },

  onLoad() {
    let res = wx.getSystemInfoSync(); //获取系统信息
    var rate = 750 / res.windowWidth; //1px为多少rpx
    this.setData({
      rate: rate,
      clockHeight: rate * res.windowWidth //时钟的高度，单位为rpx
    })

    //请求所有专注任务并显示
    this.getData()
  },

  //获取所有的专注任务数据
  async getData() {
    let result = await request('/users/get_timingData')
    // console.log('result:', result.data.data)
    let task_list_data = result.data.data.filter(item => item.status === 0)
    // console.log('task_list_data:', task_list_data)
    this.setData({
      task_list_data: task_list_data
    })
  },

  //滑块滑动停止后，定格的时间
  slideChange(e) {
    // console.log('你说：', e)
    this.setData({
      time: e.detail.value
    })
  },

  //获取点击的那个任务的索引
  clickCate(e) {
    // console.log('e.currentTarget.dataset.index:', e.currentTarget)
    this.setData({
      cateActive: e.currentTarget.dataset.index
    })
    // console.log('e.currentTarget.dataset.index:', typeof this.data.cateActive)

  },


  //获取input框中的值
  getVal(e) {
    this.setData({
      val: e.detail.value
    })
    console.log('val:', this.data.val)
  },

  //add添加按钮的值
  async add() {
    var data1 = this.data.task_list_data;
    if (this.data.val == '') {
      this.message("不能添加空任务")
      return
    }
    if (this.data.cateActive === '0') {
      this.message("请选择任务类型")
      return
    }

    if (this.data.time === 0) {
      this.message("请设置专注时间")
      return
    }
    let uuid = new Date().getTime() + ''
    let data = {
      uuid: uuid,
      content: this.data.val,
      type: this.data.cateActive,
      status: 0,
      times: this.data.time
    }

    data1.push(data)
    this.setData({
      task_list_data: data1,
    })

    let result = await request('/users/add_timingData', data, 'POST')
    this.setData({
      val: ''
    })
  },

  //开始专注按钮
  start() {
    if (this.data.time === 0) {
      this.message('请设置专注时间')
      return
    }
    this.setData({
      clockShow: true, //展示时钟
      mTime: this.data.time * 60 * 1000, //将当前时间换成毫秒
      remindTime: this.data.time * 60 * 1000, //同样将当前时间换成毫秒，还不知道干啥的
      timeStr: parseInt(this.data.time) > 10 ? this.data.time + ":00" : '0' + this.data.time + ":00" //规定时钟中央显示时间的格式化
    })

    this.drawBg(); //画圆
    var that = this;
    var n = 5;
    if (this.data.time <= 25) { //时间超过25分钟后，会要求5分钟不能返回
      that.drawActive(); //画进度条
    } else {
      that.drawActive();
      setTimeout(function () {
        that.pause(); //暂停按钮
        that.drawActiveBreak25(n) //休息25分钟
        setTimeout(function () {
          that.continue(); //继续按钮
        }, n * 60 * 1000)
      }, 25 * 60 * 1000)
    }
  },

  drawBg() {
    var lineWidth = 6 / this.data.rate; //计算线条宽度，将rpx换算为px
    var ctx = wx.createCanvasContext('progress_bg') //创建canvas的绘图上下文CanvasContext
    ctx.setLineWidth(lineWidth) //设置线条的宽度，单位为px
    ctx.setStrokeStyle('#181818') //设置描边颜色
    ctx.setLineCap('butt'); //设置端点的样式
    ctx.beginPath(); //开始创建一个路径
    /**
     * arc参数：
     * number x: 圆心的x坐标
     * number y: 圆心的y坐标
     * number r: 圆的半径
     * number sAngle: 起始弧度，单位弧度(在3点钟方向)
     * number eAngle: 终止弧度
     * boolean counterclockwise: 弧度的方向是否为逆时针
     */
    ctx.arc(400 / this.data.rate / 2, 400 / this.data.rate / 2, 400 / this.data.rate / 2 - 2 * lineWidth, 0, 2 * Math.PI, false)
    ctx.stroke() //画出当前路径的边框
    ctx.draw() //将上述条件的图形画出来
  },

  drawActive() {
    var _this = this
    var timer = setInterval(function () {
      var angle = 1.5 + 2 * (_this.data.time * 60 * 1000 - _this.data.mTime) / (_this.data.time * 60 * 1000) //计算当前弧度，是动态的，一直变化的
      var currentTime = _this.data.mTime - 100 //当前剩余时间
      _this.setData({ //更新mTime
        mTime: currentTime
      })
      if (angle < 3.5) { //代表专注时间还未结束
        if (currentTime % 1000 == 0) {
          var timeStr1 = currentTime / 1000; //s
          var timeStr2 = parseInt(timeStr1 / 60) //m
          var timeStr3 = (timeStr1 - timeStr2 * 60) >= 10 ? (timeStr1 - timeStr2 * 60) : '0' + (timeStr1 - timeStr2 * 60);
          timeStr2 = timeStr2 >= 10 ? timeStr2 : '0' + timeStr2
          _this.setData({ //更新表盘中间的显示时间
            timeStr: timeStr2 + ':' + timeStr3
          })
        }
        var lineWidth = 6 / _this.data.rate
        var ctx = wx.createCanvasContext('progress_active'); //创建canvas的绘图上下文
        ctx.setLineWidth(lineWidth) //设置线条的宽度
        ctx.setStrokeStyle('#ff7d03');
        ctx.setLineCap('round')
        ctx.beginPath()
        ctx.arc(400 / _this.data.rate / 2, 400 / _this.data.rate / 2, 400 / _this.data.rate / 2 - 2 * lineWidth, 1.5 * Math.PI, angle * Math.PI, false)
        ctx.stroke()
        ctx.draw()
      } else { //专注时间已经结束
        // var logs = wx.getStorageSync('log') || []
        // if (_this.data.time != undefined && _this.data.time > 0) {
        //   logs.unshift({
        //     date: clock.formatTime(new Date),
        //     cate: _this.data.cateActive,
        //     time: _this.data.time
        //   })
        // }
        // wx.setStorageSync('logs', logs)
        _this.setData({
          timeStr: '00:00',
          okShow: true,
          pauseShow: false,
          continueCancleShow: false
        })
        clearInterval(timer)
        _this.playAudioHun(_this)
      }
    }, 100)
    _this.setData({ //讲此定时器保存
      timer: timer
    })
  },

  //暂停按钮
  pause() {
    clearInterval(this.data.timer)
    this.setData({
      pauseShow: false,
      continueCancleShow: true,
      okShow: false
    })
  },

  //继续按钮
  continue () {
    this.drawActive()
    this.setData({
      pauseShow: true,
      continueCancleShow: false,
      okShow: false
    })
  },

  //取消按钮
  cancle() {
    clearInterval(this.data.timer)
    this.message('不要轻言放弃！！！')
    this.setData({
      pauseShow: true,
      continueCancleShow: false,
      okShow: false,
      clockShow: false,
      time: 0
    })
  },

  //返回按钮
  ok() {
    clearInterval(this.data.timer)
    this.setData({
        pauseShow: true,
        continueCancleShow: false,
        okShow: false,
        clockShow: false
      }),
      this.data.audio.stop() //音乐停止
    if (parseInt(this.data.remindTime) >= 40 * 60 * 1000) {
      this.message('请及时注意休息')
    } else {
      this.message('按时完成了任务，继续加油!')
    }
  },

  //完成
  async del(e) {
    var uuid = e.target.dataset.uuid;
    // console.log('uuid:', uuid)
    var data2 = this.data.task_list_data.filter(item => item.uuid !== uuid)
    let result = await request('/users/change_timingData', {
      uuid: uuid,
      status: 1
    }, 'POST')
    this.setData({
      task_list_data: data2
    })
  },

  //计时按钮
  start_task(e) {
    // console.log('e:', e)
    const uuid = e.currentTarget.dataset.uuid

    this.start();
    //显示当前执行的任务标题
    let titleItem_Obj = this.data.task_list_data.filter(item => item.uuid === uuid)

    // console.log('uuid:', titleItem_Obj[0].content)
    this.setData({
      titleItem: titleItem_Obj[0].content
    })


  },

  //播放音乐
  playAudioHun() {
    const audioP = wx.createInnerAudioContext();
    audioP.src = '/audio/稻香.mp3';
    audioP.play()
    this.setData({
      audio: audioP
    })
  },


  //发送提示信息
  message(info) {
    wx.showToast({
      title: info,
      icon: 'none',
      duration: 1500
    })
  },

  drawActiveBreak25(n) { //休息25分钟
    var _this = this;
    var breakTime = parseInt(n)
    var mbreakTime = breakTime * 60 * 1000
    var currentTime = mbreakTime
    var timer = setInterval(function () {
      var angle = 1.5 + 2 * (breakTime * 60 * 1000 - mbreakTime) / (breakTime * 60 * 1000);
      currentTime = mbreakTime - 100
      mbreakTime = currentTime
      if (angle < 3.5) {
        if (currentTime % 1000 == 0) {
          var timeStr1 = currentTime / 1000; // s
          var timeStr2 = parseInt(timeStr1 / 60) // m
          var timeStr3 = (timeStr1 - timeStr2 * 60) >= 10 ? (timeStr1 - timeStr2 * 60) : '0' + (timeStr1 - timeStr2 * 60);
          var timeStr2 = timeStr2 >= 10 ? timeStr2 : '0' + timeStr2;
          _this.setData({
            timeStr: timeStr2 + ':' + timeStr3
          })
        }
        var lineWidth = 6 / _this.data.rate; // px
        var ctx = wx.createCanvasContext('progress_active');
        ctx.setLineWidth(lineWidth);
        ctx.setStrokeStyle('#ff7d03');
        ctx.setLineCap('round');
        ctx.beginPath();
        ctx.arc(400 / _this.data.rate / 2, 400 / _this.data.rate / 2, 400 / _this.data.rate / 2 - 2 * lineWidth, 1.5 * Math.PI, angle * Math.PI, false);
        ctx.stroke();
        ctx.draw();
      } else {
        clearInterval(timer);
      }
    }, 100)
    _this.setData({
      continueCancleShow: false,
    })
  }







})