//实现一个发布订阅
export default new class EventBus {
  subscribes = new Map()

  //唯一标识
  getUUID() {
    return Date.now() + Math.random()
  }

  //订阅函数
  on(subscribe, callback) { //订阅的事件名  订阅的事件的回调函数
    const subsrcibeCallbacks = this.subscribes.get(subscribe) || new Map()
    const uuid = this.getUUID()
    subsrcibeCallbacks.set(uuid, callback)
    this.subscribes.set(subscribe, subsrcibeCallbacks)
    return uuid
  }

  //发布函数
  emit(subscribe, ...args) { //发布的事件名  发布时传递的参数
    const subsrcibeCallbacks = this.subscribes.get(subscribe) || new Map()
    for (const [uuid, callback] of subsrcibeCallbacks) {
      callback.call(this, ...args)
    }
  }

  //取消订阅  1、事件名，可以取消事件对应的所有回调函数  2、uuid  取消uuid对应的所有的回调函数
  remove(value) {
    const isSubscribe = this.subscribes.get(value)
    if (isSubscribe) {
      this.subscribes.delete(value)
    } else {
      for (const [subscribe, subscribeCallbacks] of this.subscribes) {
        for (const [uuid, callback] of subsrcibeCallbacks) {
          if (uuid === value) {
            subsrcibeCallbacks.delete(value)
          }
        }
      }
    }
  }
}