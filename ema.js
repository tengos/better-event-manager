function isString(type) {
	return typeof type === 'string'
}

function isFunc(fn) {
	return typeof fn === 'function'
}

let singleton = (() => {
	// 命名空间管理容器
	let nameSpaceCache = {}
	return (name) => {
		let namespace = name || 'default'
		let eventManagerInstance = namespace
			? nameSpaceCache[namespace]
				? nameSpaceCache[namespace]
				: (nameSpaceCache[namespace] = new EventManager(namespace))
			: new EventManager(namespace)

		eventManagerInstance.localEvents = []
		return eventManagerInstance
	}
})()

class EventManager {
	namespace = 'default'
	// 总事件(当前命名空间)管理容器
	events = {}
	// 事件(当前页)管理容器
	localEvents = []
	// 一次性事件管理容器
	onceEvents = []
	// 离线事件
	offlineEvents = []

	constructor(namespace) {
		this.namespace = namespace
	}

	// 支持数组事件绑定
	on(event, cb) {
		if (Array.isArray(event)) {
			event.forEach((i) => {
				this.on(i, cb)
			})
		} else {
			if (!isString(event)) {
				throw new Error('event name must be string')
			}

			if (!isFunc(cb)) {
				throw new Error('callback must be function')
			}

			let handler = this.events[event]
			if (!handler) {
				this.events[event] = handler = []
			}

			let haveLocalEvent = handler.some((h) => h.toString() == cb.toString())
			if (!haveLocalEvent) {
				this.localEvents.push([event, cb])
			}
			handler.push(cb)

			const removeIndexFromOfflineEvents = []

			if (this.offlineEvents != null) {
				this.offlineEvents.forEach((eventObj, index) => {
					if (event == eventObj.name) {
						eventObj.fn()
						removeIndexFromOfflineEvents.push(index)
					}
				})
			}

			if (removeIndexFromOfflineEvents.length) {
				for (var i = removeIndexFromOfflineEvents.length - 1; i >= 0; i--) {
					this.offlineEvents.splice(removeIndexFromOfflineEvents[i], 1)
				}
			}

			if (this.offlineEvents == null) {
				return
			}

			if (!this.offlineEvents.length) {
				this.offlineEvents = null
			}
		}
	}

	// 单个事件一次性绑定
	once(event, cb) {
		this.onceEvents.push([event, cb])
		this.on(event, cb)
	}

	_fire(eventArr, ...rest) {
		let removeEvent = []
		eventArr = Array.isArray(eventArr) ? eventArr : [eventArr]
		eventArr.forEach((event) => {
			let handler = this.events[event]

			let handlerArr = Array.isArray(handler) ? handler : [handler]
			for (let handler of handlerArr) {
				if (handler) {
					handler.apply(this, rest)
					// 解除一次性事件绑定
					for (let [
						index,
						[onceEventName, onceEventCb],
					] of this.onceEvents.entries()) {
						removeEvent.push([onceEventName, onceEventCb])
						this.onceEvents.splice(index, 1)
					}
				}
			}
		})
		// 解除全局事件中的一次性事件
		removeEvent.forEach(([event, cb]) => {
			this.remove(event, cb)
		})
	}

	// 支持数组事件
	fire(event, ...rest) {
		let eventArr = Array.isArray(event) ? event : [event]
		const pushToOfflineEvents = this.offlineEvents != null

		const currentEvents = Object.keys(this.events)
		const notInCurrentEvents = eventArr.filter((event) => {
			return !currentEvents.includes(event)
		})

		const pushToOfflineEventsFn = (eventArr) => {
			eventArr.forEach((event) => {
				this.offlineEvents.push({
					name: event,
					fn: () => {
						this._fire(event, ...rest)
					},
				})
			})
		}

		if (pushToOfflineEvents || notInCurrentEvents.length) {
			pushToOfflineEvents && pushToOfflineEventsFn(eventArr)
			if (notInCurrentEvents.length) {
				this.offlineEvents = []
				pushToOfflineEventsFn(notInCurrentEvents)
			}

			return
		}

		this._fire(eventArr, ...rest)
	}

	// 单个事件解绑
	remove(event, cb) {
		if (!event) {
			throw new Error('no event name')
		}

		let handler = this.events[event]
		if (!handler) {
			return
		}

		if (!cb) {
			handler = this.events[event] = []
		} else {
			handler.forEach((h, i) => {
				if (h == cb) {
					handler.splice(i, 1)
				}
			})

			handler.length == 0 && delete this.events[event]
		}
	}

	// 释放当前页绑定的事件, 如果改事件在其他页也声明过, 则不作处理
	free() {
		this.localEvents.forEach((localEvent) => {
			let [event, cb] = localEvent
			this.remove(event, cb)
		})

		this.localEvents = []
	}

	// 解绑所有 local once events
	clear() {
		this.events = {}
		this.localEvents = []
		this.onceEvents = []
	}
}

export default singleton
