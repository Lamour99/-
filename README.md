"微信公众号的开发" 

1.cheapter01
需要用ngrok把本地的地址通过内网穿透暴露出去

验证服务器的有效性
1.微信服务器知道开发者服务器是哪个
   -测试号管理页面上填写url开发者服务区地址
   -使用ngrok内网穿透 将本地端口号开启的服务映射外网跨越访问一个网址
   -ngrok http 3000
  -填写token
   -参与微信签名加密的一个参数
  2.开发者服务器 - 验证消息是否来自于微信服务器
   目的：计算得出signature微信加密签名，和微信传递过来的signature进行对比，如果一样，说明消息是来自于微信服务器，如不一样，说明不是
   1.将参与微信加密签名的三个参数（timestamp，nonce，token）按照字段序排序并组合在一起
   2.将数组里所有参数拼接成一个字符串，进行cha1加密
   3.加密完成就生成一个signature，和微信发送过来的进行对比
     -如果一样，说明消息来自于微信服务器，返回echostr给微信服务器
     -如果不一样，说明不是微信服务器发送的消息，返回error

2.cheapter02
模块化模块化验证服务器有效性

3.cheapter03
FetchAccessToken方法
/*
  获取access_token：
  是什么？ 微信调用接口全局唯一凭据
  
  特点
   1、唯一的
   2、有效期为2小时，提前5分钟请求
   3、接口权限 每天2000次
  
  https请求方式: GET https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
  
  
  设计思路：
   1、首次本地没有，发送请求获取access_token，保存下来（本地文件）
   2、第二次或以后：
      -先去本地读取文件，判断它是否过期
       -过期了
       -重新请求获取access_token，保存下来覆盖之前的文件（保证文件是唯一的）
       -没有过期
        -直接使用
  
  整理思路：
   读取本地文件
       -本地有文件（readAccessToken）
       -判断它是否过期 （isValidAccessToken）
       -过期了
          -重新请求获取access_token（getAccessToken），保存下来覆盖之前的文件（保证文件是唯一的）（saveAccessToken）
       -没有过期
          -直接使用
      -本地没有文件
       -发送请求获取access_token（getAccessToken），保存下来（本地文件）（saveAccessToken）

4.cheapter04
   接收用户发送过来的信息
 