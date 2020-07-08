# better-event-manager 是什么

better-event-manager 以下简称bem, 通常在spa应用中数据驱动是主流，但是往往在有些应用场面，在做一些工具型的应用，事件驱动和管理就能解决数据驱动往往需要通过复杂的数据管理方式整理逻辑显的有点乏力。bem类似于vue的中央事件(bus)，bem是一个总的事件管理厂，在每个页面或每个组件孵化出每个小的管事件管理厂，无论是每个小事件管理还是最外层的大事件总线都能通知到每一个订阅的事件

无论在vue， react, angular中都可以用此方法，去处理一些通过数据驱动过于复杂的应用，有时往往在进行老项目的时候，再减小维护成本的情况下，可以用bem去代替vux等一系列的数据模式，对于后者维护来说，也是很明了，通过基于spa应用的事件管理器，只需要自己维护好自己组件的数据，在一些第三方大应用的组件层，无法用共享数据层去管理，则可以用bem的事件通信代替成为一个小共享数据层，称为顶层事件通信层

bem支持命名空间, 各自命名空间可以有相同的事件名称, 彼此不会冲突, 有利于模块化开发

总而言之, bem 就是一个功能全面的发布订阅模式的实现

# 安装使用

```shell
npm i better-event-manager -S
```

使用
```js
const Bem = require('better-event-manager') // 在node 等cjs中引入

// 或者
import Bem from 'better-event-manager'   // 在vue, react等支持esm中引入
 

const BemIns = new Bem('xxx')  // xxx 代表命名空间  不填默认default


// 或者直接在script中引入
const BemIns = new BetterEventManager('xxx')
```

## API
### 事件绑定
on(event, callback)

* { Array|String } event
* { Function } callback

Example
```js
BemIns.on('click', () => console.log('clicked'))
//or
BemIns.on(['click', 'dbClick'], () => console.log('clicked'))

```


### 一次性绑定
once(event, callback)

* { String } event
* { Function } callback

Example
```js
BemIns.once('click', () => console.log('i am destoryed after fired'))
```

### 事件触发
fire(event, arguments?)

* { Array|String } event
* { any? } arguments

Example
```js
BemIns.fire('click')
// or
BemIns.fire('click', arg1, arg2, ...)
// or
BemIns.fire(['click', 'dbClick'], arguments?)
```


### 解绑事件
remove(event, callback?)

Example
```js
BemIns.remove('click', () => {})
or
BemIns.remove('click')
// 有无回调函数的区别在于, 有回调将会将该事件从总线中移除, 没有回调函数仍保留该事件, 只是回调函数情空
```

* { String } event
* { Function? } callback


### free() 
解绑当页所有事件, 一般用于vue, react中

Example
```js
BemIns.free()
```


### clear()
解绑所有事件

Example
```js
BemIns.clear()
```