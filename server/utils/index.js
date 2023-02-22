//导入全局配置文件
const config = require('../config/index')
// 导入生成 Token 的包
const jwt = require('jsonwebtoken')

//加密token
exports.tokenSign = (payload) => {
    return jwt.sign(payload, config.tokenSecret.jwtSecretKey, {expiresIn: 2*24*60*60})
}

//解密token
exports.tokenVerify = (token) => {
    return jwt.verify(token, config.tokenSecret.jwtSecretKey, (error, decoded) => {
        if(error) {
            console.log('token解密错误：', error.message)
            return
        }
        return decoded
    })
}