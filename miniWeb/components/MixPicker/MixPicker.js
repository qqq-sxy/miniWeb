// components/MixPicker/MixPicker.js
import date from '../../utils/date'
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    multiArray: [
      ['重要且紧急', '重要不紧急', '不重要但紧急', '不重要不紧急'], //分类
      date.initYear,
      date.initMonth,
      date.initDay,
      date.initHour,
      date.initMinute,
    ],
    multiIndex: [0, 0, 0, 0, 0, 0],
    color: ['#fc606b', '#fab001', '#5673d0', '#0ecb9d'], //字体颜色
    colorVal: '#fc606b', //字体颜色值
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //value改变时触发该事件
    bindMultiPickerChange: function (e) {
      // console.log('picker发送选择改变，携带值为', e.detail.value)
      this.setData({
        multiIndex: e.detail.value
      })
      let multiArray = this.data.multiArray
      let multiIndex = this.data.multiIndex
      this.triggerEvent('getMixPickerVal', {
        type: multiIndex[0],
        year: multiArray[1][multiIndex[1]],
        month: multiArray[2][multiIndex[2]],
        day: multiArray[3][multiIndex[3]],
        hour: multiArray[4][multiIndex[4]],
        minute: multiArray[5][multiIndex[5]],
      })

    },

    //列改变时触发
    bindMultiPickerColumnChange: function (e) {
      // console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
      let data = {
        multiArray: this.data.multiArray,
        multiIndex: this.data.multiIndex
      }
      data.multiIndex[e.detail.column] = e.detail.value
      switch (e.detail.column) {
        case 0: {
          //修改字体颜色
          this.setData({
            colorVal: this.data.color[e.detail.value]
          })
        }
        case 1: {
          let temp = data.multiArray[1][e.detail.value] //获取当前的年份
          let monthT = data.multiIndex[2] //获取当前的月份的索引
          if ((temp % 4 === 0 && temp % 100 !== 0) || temp % 400 === 0) { //为闰年
            if (monthT === 1) {
              data.multiArray[3] = date.day3
            }
          } else {
            if (monthT === 1) {
              data.multiArray[3] = date.day4
            }
          }
          break;
        }
        case 2: {
          switch (data.multiIndex[2]) {
            case 1: {
              console.log('当前是' + (data.multiIndex[2] + 1) + '月份')
              let temp = data.multiArray[1][data.multiIndex[1]] //获取年份
              if ((temp % 4 === 0 && temp % 100 !== 0) || temp % 400 === 0) { //为闰年
                data.multiArray[3] = date.day3
              } else {
                data.multiArray[3] = date.day4
              }
              break;
            }
            case 0:
            case 2:
            case 4:
            case 6:
            case 7:
            case 9:
            case 11:
              data.multiArray[3] = date.day1
              break;
            case 3:
            case 5:
            case 8:
            case 10:
              data.multiArray[3] = date.day2
              break;
          }
          break;
        }
      }
      this.setData({
        multiArray: data.multiArray,
        multiIndex: data.multiIndex
      })
    },
  }
})