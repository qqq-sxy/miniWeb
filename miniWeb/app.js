// app.js
import eventBus from './utils/eventBus'

App({
  globalData: {
    userInfo: null,
    eventBus: eventBus, //发布订阅工具
  },

  onShow: function () {
    // console.log(this.globalData.eventBus);
  }
})