Page({
  remindTime: 0, //提醒时间
  clockShow: false, //是否显示时钟
  clockHeight: 0,
  mTime: 10000,
  timeStr: '01:00',
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
    okShow: false,
    pauseShow: true,
    continueCancleShow: false
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
  add() {
    var data1 = this.data.task_list_data;
    if (this.data.val == '') {
      this.message("不能添加空任务")
      return
    }
    data1.push(this.data.val)
    this.setData({
      task_list_data: data1,
      val: ''
    })
  },

  //开始专注按钮
  start() {
    this.setData({
      clockShow: true,
      mTime: this.data.time * 60 * 1000,
      remindTime: this.data.time * 60 * 1000,
      timeStr: parseInt(this.data.time) >= 10 ? this.data.time + ':00' : '0' + this.data.time + ':00'
    })
    this.drawBg();
    var that = this;
    var n = 5;
    if (this.data.time <= 25) {
      that.drawActive();
    } else {
      that.drawActive();
      setTimeout(function () {
        that.pause();
        that.drawActiveBreak25(n);
        setTimeout(function () {
          that.continue();
        }, n * 60 * 1000);
      }, 25 * 60 * 1000);

    }
  },

  drawBg() {
    var lineWidth = 6 / this.data.rate; // px
    var ctx = wx.createCanvasContext('progress_bg');
    ctx.setLineWidth(lineWidth);
    ctx.setStrokeStyle('#000000');
    ctx.setLineCap('round');
    ctx.beginPath();
    ctx.arc(400 / this.data.rate / 2, 400 / this.data.rate / 2, 400 / this.data.rate / 2 - 2 * lineWidth, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.draw();
  },
  drawActive() {
    var _this = this;
    var timer = setInterval(function () {
      var angle = 1.5 + 2 * (_this.data.time * 60 * 1000 - _this.data.mTime) / (_this.data.time * 60 * 1000);
      var currentTime = _this.data.mTime - 100
      _this.setData({
        mTime: currentTime
      });
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
        ctx.setStrokeStyle('#ffffff');
        ctx.setLineCap('round');
        ctx.beginPath();
        ctx.arc(400 / _this.data.rate / 2, 400 / _this.data.rate / 2, 400 / _this.data.rate / 2 - 2 * lineWidth, 1.5 * Math.PI, angle * Math.PI, false);
        ctx.stroke();
        ctx.draw();
      } else {
        var logs = wx.getStorageSync('logs') || [];
        if (_this.data.time != undefined && _this.data.time > 0) {
          logs.unshift({
            date: util.formatTime(new Date),
            cate: _this.data.cateActive,
            time: _this.data.time
          });
        }
        wx.setStorageSync('logs', logs);
        _this.setData({
          timeStr: '00:00',
          okShow: true,
          pauseShow: false,
          continueCancleShow: false
        })
        clearInterval(timer);
        _this.playAudioHun(_this);
      }
    }, 100);
    _this.setData({
      timer: timer
    })
  },
  pause() {
    clearInterval(this.data.timer);
    this.setData({
      pauseShow: false,
      continueCancleShow: true,
      okShow: false
    })
  },
  continue () {
    this.drawActive();
    this.setData({
      pauseShow: true,
      continueCancleShow: false,
      okShow: false
    })
  },
  cancle() {
    clearInterval(this.data.timer);
    this.message('不要轻言放弃哦~');
    this.setData({
      pauseShow: true,
      continueCancleShow: false,
      okShow: false,
      clockShow: false
    })
  },
  ok() {
    clearInterval(this.data.timer);
    this.setData({
        pauseShow: true,
        continueCancleShow: false,
        okShow: false,
        clockShow: false
      }),
      this.data.audio.stop();
    if (parseInt(this.data.remindTime) >= 40 * 60 * 1000) {
      this.message('请及时注意休息哦')
    } else {
      this.message('按时完成了任务，继续加油！')
    }
  },
  playAudioHun: function (obj) {
    const audioP = wx.createInnerAudioContext();
    audioP.src = '/audio/audio.mp3';
    audioP.play();
    obj.setData({
      audio: audioP
    })
  },
  message: function (info) {
    wx.showToast({
      title: info,
      icon: 'none',
      duration: 1500
    })
  },


})