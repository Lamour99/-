// 引入express模块
const express =  require('express')

//引用auth模块
const auth = require('./weChat/auth')

//创建app用用对象
const app = express()



// 接受处理所有消息
app.use(auth())

//监听端口号
app.listen(3000, ()  => console.log('服务器启动成功'))
