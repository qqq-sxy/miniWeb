var express = require("express");
var router = express.Router();

const router_hander = require("../router_handle/users")

  
//注册获取用户唯一标识openID
router.get("/getOpenId", router_hander.getAppid)

//将用户信息存入数据库
router.post('/putUserInfo', router_hander.add_userInfo)

//四象限添加计划
router.post("/addFourQuadrants",router_hander.add_FourQuadrants)

//获取四象限所有数据
router.get("/index", router_hander.get_FourQuadrants)

//改变选框状态
router.post("/changeStatus", router_hander.change_Status)

//删除四象限计划
router.post("/deleteFourQuadrants",router_hander.delete_FourQuadrants)

//重新编辑四象限计划
router.post("/changeFourQuadrants", router_hander.change_FourQuadrants)

//添加专注时间计划
router.post("/add_timingData", router_hander.add_timingData)

//请求所有专注时间计划
router.get("/get_timingData", router_hander.get_timingData)

//删除对应的专注时间计划
router.post("/change_timingData", router_hander.change_timingData)



module.exports = router;
