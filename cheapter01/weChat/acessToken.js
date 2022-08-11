/**
 * 获取access_token：
 * 是什么？ 微信调用接口全局唯一凭据
 * 
 * 特点
 *  1、唯一的
 *  2、有效期为2小时，提前5分钟请求
 *  3、接口权限 每天2000次
 * 
 * https请求方式: GET https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET
 * 
 * 
 * 设计思路：
 *  1、首次本地没有，发送请求获取access_token，保存下来（本地文件）
 *  2、第二次或以后：
 *    -先去本地读取文件，判断它是否过期
 *      -过期了
 *       -重新请求获取access_token，保存下来覆盖之前的文件（保证文件是唯一的）
 *      -没有过期
 *       -直接使用
 * 
 * 整理思路：
 *  读取本地文件
 *      -本地有文件（readAccessToken）
 *      -判断它是否过期 （isValidAccessToken）
 *       -过期了
 *          -重新请求获取access_token（getAccessToken），保存下来覆盖之前的文件（保证文件是唯一的）（saveAccessToken）
 *       -没有过期
 *          -直接使用
 *      -本地没有文件
 *       -发送请求获取access_token（getAccessToken），保存下来（本地文件）（saveAccessToken）
 *      
 */

//只需要引入request-promise-native
const rp = require('request-promise-native')

//引入fs模块
const { writeFile, readFile} = require('fs')

// 引入config模块
const {appID, appsecret} = require('../config')



// 定义类，获取access_token
class Wechat{
    constructor () {
       
    }

   /**
    * 用来获取access_token
    */
      getAccessToken() {
        // 定义请求的地址
        const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`

        /**
         * request
         *  request-promise-native 返回值是一个promise对象
         */
       return new Promise((resolve, reject) => {
        rp({method: 'GET', url, json:true })
        .then(res =>{
          console.log(res);
          // {
          //     access_token: '59_lMOS0KeAnsuVHt_hEbo1B53JoHZLidbrw_0szo9paINnzNmLKGdkpqUutOBlVgSIWZGjWXhlH1uoCcC--fG6umkeZhvECmf4L8m3kilnGFWJToxzJpfEIOT4J0rWVxVu6LkLKYh4ZbchHlD_ZWGbAIAMJT',
          //     expires_in: 7200
          //   }
          // 设置过期时间
          res.expires_in = Date.now() + (res.expires_in -300) * 1000;
          // 将Promise对象状态改成成功的状态
          resolve(res)
        })
        .catch(error =>{
          console.log(error);
          reject('getAccessToken出了问题：'+ error)
        })

       }) 
       
    }

    /**
     * 用来保存access_token
     * @param access_token 要保存的凭据
     */
     saveAccessToken(acessToken) {
        //将对象转换成json字符串
        //将access_token保存一个文件
        // writeFile异步写入文件
        acessToken = JSON.stringify(acessToken)
        return new Promise((resolve, reject) =>{
            writeFile('./accessToken.txt', acessToken, err =>{
                if(!err){
                    console.log('文件保存成功')
                    resolve()
                }else{
                    reject('saveAccessToken方法出了问题' + err)
                }
            })
        })
     }

   /**
     * 用来读取access_token
     * 
     */
      readAccessToken() {
        // 读取本地文件中的access_token
        return new Promise((resolve, reject) =>{
            readFile('./accessToken.txt', acessToken, (err, data) =>{
                if(!err){
                    console.log('文件读取成功')
                    data = JSON.parse(data)
                    resolve(data)
                }else{
                    reject('readAccessToken方法出了问题' + err)
                }
            })
        })
     }

   /**
     * 用来检测access_token是否有效的
     * @param data 要保存的凭据
     */
     isValidAccessToken(data) {
        //检测传入的参数是否是有效的
        if(!data && !data.access_token && !data.expires_in) {
            // 代表access_token无效
            return false
        }

        // //检测
        // if(data.expires_in < Date.now()) {
        //     // 过期
        //     return false
        // }else{
        //     return true
        // }
        return  data.expires_in > Date.now()
     }

     /**
      * 用来获取没有过期的access_token
      * @return {Promise<any>} access_token
      */
     fetchAccessToken () {
        // 优化
        if(this.access_token && this.expires_in && this.isValidAccessToken(this)){
            // 说明之前保存过access_token，并且它是有效的，直接使用
            return Promise.resolve({
                access_token:this.access_token,
                expires_in:this.expires_in
            })
        }

        //是fetchAccessToken函数的返回值
        return this.readAccessToken()
        .then(async res =>{
            //本地有文件
            //判断它是否过期
            if(this.isValidAccessToken(res)){
                //有效的
                // resolve(res)
                return Promise.resolve(res)
            }else{
                //过期了
                //发送请求获取access_token(getAccessToken)
               const res = await this.getAccessToken()
               // 保存下来（本地文件）（saveAccessToken），直接使用
               await this.saveAccessToken(res)
               //将请求回来的access_token返回出去
            //    resolve(res)
            return Promise.resolve(res)
            }
        })
        .catch(async err =>{
            //本地没有文件
              const res = await this.getAccessToken()
              // 保存下来（本地文件）（saveAccessToken），直接使用
              await this.saveAccessToken(res)
              //将请求回来的access_token返回出去
            //   resolve(res)
            return Promise.resolve(res)
        })
        .then(res =>{
            //将access_token挂载到this上
            this.access_token = res.access_token
            this.expires_in = res.expires_in
            // 返回res包装了一层promise对象（此对象为成功的状态）
            // 是this.readAceessToken()最终的返回值
            return Promise.resolve(res)
        })
     }


}


// 模拟
const w = new Wechat();
// w.getAccessToken()

//  整理思路：
//   读取本地文件
//       -本地有文件（readAccessToken）
//       -判断它是否过期 （isValidAccessToken）
//        -过期了
//           -重新请求获取access_token（getAccessToken），保存下来覆盖之前的文件（保证文件是唯一的）（saveAccessToken）
//        -没有过期
//           -直接使用
//       -本地没有文件
//        -发送请求获取access_token（getAccessToken），保存下来（本地文件）（saveAccessToken）
// new Promise((resolve,reject) =>{
//     w.readAccessToken()
//     .then(res =>{
//         //本地有文件
//         //判断它是否过期
//         if(w.isValidAccessToken(res)){
//             //有效的
//             resolve(res)
//         }else{
//             //过期了
//             //发送请求获取access_token(getAccessToken)
//             w.getAccessToken()
//             .then(res =>{
//                 // 保存下来（本地文件）（saveAccessToken），直接使用
//                 w.saveAccessToken(res)
//                  .then(() =>{
//                     resolve(res)
//                  })
//             })
//         }
//     })
//     .catch(err =>{
//         //本地没有文件
//         w.getAccessToken()
//         .then(res =>{
//             // 保存下来（本地文件）（saveAccessToken），直接使用
//             w.saveAccessToken(res)
//              .then(() =>{
//                 resolve(res)
//              })
//         })
//     })
// })
//   .then(res =>{
//     console.log(res);
//   })
w.fetchAccessToken ()
.then(res =>{
    console.log(res);
    console.log(1111);
})