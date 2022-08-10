// 引入express模块
const express =  require('express')

//引入sha1模块
const sha1 = require('sha1')

//创建app用用对象
const app = express()

//验证服务器的有效性
/**
 * 1.微信服务器知道开发者服务器是哪个
 *  -测试号管理页面上填写url开发者服务区地址
 *  -使用ngrok内网穿透 将本地端口号开启的服务映射外网跨越访问一个网址
 *  -ngrok http 3000
 * -填写token
 *  -参与微信签名加密的一个参数
 * 2.开发者服务器 - 验证消息是否来自于微信服务器
 *  目的：计算得出signature微信加密签名，和微信传递过来的signature进行对比，如果一样，说明消息是来自于微信服务器，如不一样，说明不是
 *  1.将参与微信加密签名的三个参数（timestamp，nonce，token）按照字段序排序并组合在一起
 *  2.将数组里所有参数拼接成一个字符串，进行cha1加密
 *  3.加密完成就生成一个signature，和微信发送过来的进行对比
 *    -如果一样，说明消息来自于微信服务器，返回echostr给微信服务器
 *    -如果不一样，说明不是微信服务器发送的消息，返回error
 */

// 定义配置对象
const config = {
    token: 'Lamour0712',
    appID: 'wx0974c3a968b45662',
    appsecret:'88ee24186301fe0f1cea1c589e07c3a9'
}


// 接受处理所有消息
app.use((req, res, next) => {
    // 微信服务器提交的参数
    console.log(req.query)
    // {
    //     signature: '057111e856ab15557e592116b34dda3cb7a5a045', //微信的加密签名
    //     echostr: '1199283793206385378', //微信的随机字符串
    //     timestamp: '1660099106', //微信的发送请求的时间戳
    //     nonce: '486616779' //微信的随机数字
    //   } 
    const {signature, echostr, timestamp, nonce} =  req.query
    const {token} = config

    // 1.将参与微信加密签名的三个参数（timestamp，nonce，token）按照字典排序并组合在一起形成一个数组
    const arr = [timestamp,nonce, token ]
    const arrSoft = arr.sort()
    console.log(arrSoft)
    //2.将数组里所有参数拼接成一个字符串，进行sha1加密
    const str = arr.join('')
    console.log(str);
    const sha1Str = sha1(str)
    console.log(sha1Str)
    //3.加密完成就生成一个signature，和微信发送过来的进行对比
    if(sha1Str === signature) {
        //如果一样，说明消息来自于微信服务器，返回echostr给微信服务器
        res.send(echostr)
    } else {
        //如果不一样，说明不是微信服务器发送的消息，返回error
        res.end('error')
    }
})

//监听端口号
app.listen(3000, ()  => console.log('服务器启动成功'))
