//导入数据库操作模块
const db = require('../DB/index')
//导入全局配置文件
const config = require('../config/index')
//导入token加密解密模块
const tokenFun = require('../utils/index')
// 导入生成 Token 的包
const jwt = require('jsonwebtoken')
//导入fly
const Fly = require("flyio/src/node");
const fly = new Fly;
//引入哈希加密
const crypto = require('crypto');

//获取用户appid处理函数
exports.getAppid = async (req, res) => {
  let code = req.query.code;
  let appId = config.appConfig.appId
  let secret = config.appConfig.appSecret
  //发请求给微信服务器获取oppenId
  let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
  let result = await fly.get(url)
  let {session_key, openid}= JSON.parse(result.data)
  // console.log('openid:',result.data)
  //token数据
  const payload = {
    data: openid
  }
  
  //生成token
  let token = tokenFun.tokenSign(payload)
  res.send(token);
}


//用户信息存入数据库
exports.add_userInfo = (req, res) => {
  let data = req.body //请求数据
  let header = req.headers.authorization //获取token
  let webToken = header.split(" ")[1]
  if(webToken.length === 0) {
    res.send({
      code: 2,
      msg: 'token不存在'
    })
    return
  }
  let appid = tokenFun.tokenVerify(webToken).data
  const userId = crypto.createHmac("sha1", config.tokenSecret.jwtSecretKey).update(appid).digest("hex");
  
  //定义查询语句
  let findSql = "SELECT * FROM userinfo WHERE userId = '"+userId+"'"
  //定义插入sql语句
  let sql = 'INSERT INTO userinfo (userId, nickName, avatarUrl, city, country, gender, language, province) VALUES (?,?,?,?,?,?,?,?)' 
  //定义插入数据
  let inserInfo = [userId, data.nickName, data.avatarUrl, data.city, data.country, data.gender, data.language, data.province];
  db.query(findSql, (err, result) => {
    if(err) {
      console.log('添加用户信息时查询失败')
      res.send({
        code: 0,
        msg: '添加用户信息时查询失败'
      })
      return
    }
    if(result.length) { //数据库中已经有当前用户
      res.send({
        code: 1,
        msg:'数据库中已经存在该用户信息'
      })
    } else {
       db.query(sql, inserInfo, (err, result) => {
        if(err) {
          console.log('用户信息存入数据库错误:', err)
          res.send({
            code: 0,
            msg:'用户信息存入数据库错误'
          })
          return
        }
        console.log('------------start----------------');
        console.log('用户信息存入数据成功');
        console.log(result);
        console.log('--------------end-----------------');
        res.send({
          code: 1,
          msg: '用户信息存入数据成功'
        })
      })
    }
  })


 
}

//四象限添加计划处理函数
exports.add_FourQuadrants = (req,res) => {
  
  let data = req.body //获取请求数据
  let header = req.headers.authorization //获取token
  // console.log('手腕的花纹偶分',data.listId)

  let webToken = header.split(' ')[1]
  if(webToken.length === 0) {
    res.send({
      code: 2,
      msg: 'token不存在'
    })
    return
  }
  let appid = tokenFun.tokenVerify(webToken).data
  const userId = crypto.createHmac("sha1", config.tokenSecret.jwtSecretKey).update(appid).digest("hex");
  //定义插入sql语句
  let sql = 'INSERT INTO four_quadrants (userId, listId, content, type, status, date) VALUES (?,?,?,?,?,?)' 
  //定义插入数据
  let inserInfo = [userId, data.listId, data.content, data.type, data.status, data.date];
  db.query(sql, inserInfo, (err, result) => {
        if(err) {
          console.log('四象限计划存入数据库错误:', err)
          res.send({
            code: 0,
            msg:'四象限计划存入数据库错误'
          })
          return
        }
        console.log('------------start----------------');
        console.log('四象限计划存入数据库成功');
        console.log(result);
        console.log('--------------end-----------------');
        res.send({
          code: 1,
          msg: '四象限计划存入数据库成功'
        })
  })

}


//获取四象限所有数据
exports.get_FourQuadrants = (req, res) => {
  let header = req.headers.authorization //获取token
  console.log('四象限：', header)
  let webToken = header.split(" ")[1]
  if(webToken === null) {
    res.send({
      code: 2,
      msg: 'token不存在'
    })
    return
  }
  if(webToken.length === 0) {
    res.send({
      code: 2,
      msg: 'token不存在'
    })
    return
  }
  let appid = tokenFun.tokenVerify(webToken).data
  const userId = crypto.createHmac("sha1", config.tokenSecret.jwtSecretKey).update(appid).digest("hex");
  
  //定义查询语句
  let findSql = "SELECT * FROM four_quadrants WHERE userId = '"+userId+"'"
  db.query(findSql, (err, result) => {
    if(err) {
      console.log('获取四象限所有数据查询错误：', err)
      res.send({
        code: 0,
        msg:'获取四象限所有数据查询错误'
      })
    }

    console.log(result)

    if(result.length !== 0) {
      console.log('获取四象限所有数据查询成功')
      res.send({
        code: 1,
        msg:'获取四象限所有数据查询成功',
        data: result
      })
    } else {
      console.log('获取四象限所有数据查询为空')
      res.send({
        code: 2,
        msg:'获取四象限所有数据查询为空',
        data: result
      })
    }
  })
}

//改变选中状态
exports.change_Status = (req, res) => {
  let data = req.body
  let header = req.headers.authorization //获取token
  // console.log('四象限：', header)
  let webToken = header.split(" ")[1]
  if(webToken.length === 0) {
    res.send({
      code: 2,
      msg: 'token不存在'
    })
    return
  }
  let appid = tokenFun.tokenVerify(webToken).data
  const userId = crypto.createHmac("sha1", config.tokenSecret.jwtSecretKey).update(appid).digest("hex");
  
  const sql = "UPDATE four_quadrants set status = '"+ data.status +"' WHERE userId = '"+ userId+"' and listId = '"+ data.listId+"'"

  db.query(sql, (err, result) => {
    if(err) {
      console.log('更新status失败', err)
      res.send({
        code: 0,
        msg: '更新status失败'
      })
      return 
    }
    console.log('------------start----------------');
    console.log('更新status成功');
    console.log(result);
    console.log('--------------end-----------------');
    res.send({
      code: 1,
      msg:'更新status成功'
    })
  })
}


//删除四象限数据
exports.delete_FourQuadrants = (req, res) => {
  let data = req.body //获取请求数据
  let header = req.headers.authorization //获取token
  // console.log('手腕的花纹偶分',data.listId)

  let webToken = header.split(' ')[1]
  if(webToken.length === 0) {
    res.send({
      code: 2,
      msg: 'token不存在'
    })
    return
  }
  let appid = tokenFun.tokenVerify(webToken).data
  const userId = crypto.createHmac("sha1", config.tokenSecret.jwtSecretKey).update(appid).digest("hex");
  
  let sql = "DELETE FROM four_quadrants WHERE  userId = '"+ userId +"' and  listId = '"+ data.listId+"' "
  console.log("listId:", data)

  db.query(sql, (err, result) => {
    if(err) {
      console.log('删除计划失败', err)
      res.send({
        code: 0,
        msg: '删除计划失败'
      })
      return 
    }
    console.log('------------start----------------');
    console.log('删除计划成功');
    console.log(result);
    console.log('--------------end-----------------');
    res.send({
      code: 1,
      msg:'删除计划成功'
    })
  })
}


//重新编辑四象限计划
exports.change_FourQuadrants = (req,res) => {
  let data = req.body
  // console.log("重新编辑四象限计划:")
  let header = req.headers.authorization //获取token
  // console.log('四象限：', header)
  let webToken = header.split(" ")[1]
  if(webToken.length === 0) {
    res.send({
      code: 2,
      msg: 'token不存在'
    })
    return
  }
  let appid = tokenFun.tokenVerify(webToken).data
  const userId = crypto.createHmac("sha1", config.tokenSecret.jwtSecretKey).update(appid).digest("hex");
  
  const sql = "UPDATE four_quadrants set type = '"+ data.type +"', content = '"+ data.content +"', date = '"+ data.date +"' WHERE userId = '"+ userId+"' and listId = '"+ data.listId+"'"

  db.query(sql, (err, result) => {
    if(err) {
      console.log('重新编辑计划失败', err)
      res.send({
        code: 0,
        msg: '重新编辑计划失败'
      })
      return 
    }
    console.log('------------start----------------');
    console.log('重新编辑计划成功');
    console.log(result);
    console.log('--------------end-----------------');
    res.send({
      code: 1,
      msg:'重新编辑计划成功'
    })
  })
}


//添加专注任务
exports.add_timingData = (req, res) => {
  let data = req.body
  // console.log("重新编辑四象限计划:")
  let header = req.headers.authorization //获取token
  // console.log('四象限：', header)
  let webToken = header.split(" ")[1]
  if(webToken.length === 0) {
    res.send({
      code: 2,
      msg: 'token不存在'
    })
    return
  }
  let appid = tokenFun.tokenVerify(webToken).data
  const userId = crypto.createHmac("sha1", config.tokenSecret.jwtSecretKey).update(appid).digest("hex");
  
  const sql = "INSERT timing_data (type, uuid, content, userId, status, times) VALUES (?,?,?,?,?,?)"
  const timing_dataInfo = [data.type, data.uuid, data.content, userId, data.status, data.times]

  db.query(sql, timing_dataInfo, (err, result) => {
    if(err) {
      console.log('添加专注任务失败', err)
      res.send({
        code: 0,
        msg: '添加专注任务失败'
      })
      return 
    }
    console.log('------------start----------------');
    console.log('添加专注任务成功');
    console.log(result);
    console.log('--------------end-----------------');
    res.send({
      code: 1,
      msg:'添加专注任务成功'
    })
  })
}

//请求所有的专注任务
exports.get_timingData = (req, res) => {
  let header = req.headers.authorization //获取token
  // console.log('四象限：', header)
  let webToken = header.split(" ")[1]
  if(webToken.length === 0) {
    res.send({
      code: 2,
      msg: 'token不存在'
    })
    return
  }
  let appid = tokenFun.tokenVerify(webToken).data
  const userId = crypto.createHmac("sha1", config.tokenSecret.jwtSecretKey).update(appid).digest("hex");
  
  //定义查询语句
  let findSql = "SELECT * FROM  timing_data WHERE userId = '"+userId+"'"
  db.query(findSql, (err, result) => {
    if(err) {
      console.log('获取专注任务所有数据查询错误：', err)
      res.send({
        code: 0,
        msg:'获取专注任务所有数据查询错误'
      })
    }

    console.log(result)

    if(result.length !== 0) {
      console.log('获取专注任务所有数据查询成功')
      res.send({
        code: 1,
        msg:'获取专注任务所有数据查询成功',
        data: result
      })
    } else {
      console.log('获取专注任务所有数据查询为空')
      res.send({
        code: 2,
        msg:'获取专注任务所有数据查询为空',
        data: result
      })
    }
  })
}

//完成对应的专注时间计划
exports.change_timingData = (req, res) => {
  let data = req.body //获取请求数据
  let header = req.headers.authorization //获取token
  // console.log('手腕的花纹偶分',req.body)

  let webToken = header.split(' ')[1]
  if(webToken.length === 0) {
    res.send({
      code: 2,
      msg: 'token不存在'
    })
    return
  }
  let appid = tokenFun.tokenVerify(webToken).data
  const userId = crypto.createHmac("sha1", config.tokenSecret.jwtSecretKey).update(appid).digest("hex");
  
  const sql = "UPDATE timing_data set status = '"+ data.status +"' WHERE userId = '"+ userId+"' and uuid = '"+ data.uuid +"' "
  
  // let sql = "DELETE FROM timing_data WHERE  userId = '"+ userId +"' and  uuid = '"+ data.uuid +"' "
  // console.log("listId:", data)

  db.query(sql, (err, result) => {
    if(err) {
      console.log('完成专注计划失败', err)
      res.send({
        code: 0,
        msg: '完成专注计划失败'
      })
      return 
    }
    console.log('------------start----------------');
    console.log('完成专注计划成功');
    console.log(result);
    console.log('--------------end-----------------');
    res.send({
      code: 1,
      msg:'完成专注计划成功'
    })
  })
}