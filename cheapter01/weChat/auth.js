/**
 * 验证服务器有效性的模块
 */

//引入sha1模块
const sha1 = require('sha1')
// 引入config模块
const config = require('../config')

module.exports = () => {

    return (req, res, next) => {
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
    
        // // 1.将参与微信加密签名的三个参数（timestamp，nonce，token）按照字典排序并组合在一起形成一个数组
        // const arr = [timestamp,nonce, token ]
        // const arrSoft = arr.sort()
        // console.log(arrSoft)
        // //2.将数组里所有参数拼接成一个字符串，进行sha1加密
        // const str = arr.join('')
        // console.log(str);
        // const sha1Str = sha1(str)

        const sha1Str = sha1([timestamp,nonce, token ].sort().join(''))
        console.log(sha1Str)
        //3.加密完成就生成一个signature，和微信发送过来的进行对比
        if(sha1Str === signature) {
            //如果一样，说明消息来自于微信服务器，返回echostr给微信服务器
            res.send(echostr)
        } else {
            //如果不一样，说明不是微信服务器发送的消息，返回error
            res.end('error')
        }
        console.log(req.method);

         /**
 * 微信服务器会发送两种类型的消息给开发者服务器
 *  1.GET请求
 *      -验证服务器的有效性
 *  2.POST请求
 *      -微信服务器会将用户发送的数据以POST请求的方式转发到开发者服务器上
 */
     if(req.method === 'GET'){
        if(sha1Str === signature) {
            // 如果一样，说明消息来自于微信服务器，返回echostr给微信服务器
            res.send(echostr)
        } else {
            // 如果不一样，说明不是微信服务器发送的消息，返回error
            res.end('error')
        }
    } else if(req.method === 'POST') {
        //微信服务器会将用户发送的数据以POST请求的方式转发到开发者服务器上
        //验证消息来自于微信服务器
        if(sha1Str !== signature){
            res.end('error')
        }
        console.log(req.query)
    }else {
        res.end('error')
    }



    }

}

