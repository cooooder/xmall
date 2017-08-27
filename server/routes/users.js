var express = require('express');
var router = express.Router();
require('./../util/util');
//涉及数据库操作，先把数据模型引入进来
var User = require('./../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.post('/login',(req,res,next) => {
	//先拿到前端发送的查询参数，保存下来
	let param = {
		userName:req.body.userName,
		userPwd:req.body.userPwd
	};
	User.findOne(param,(err,doc) => {
		if(err){
			res.json({
				status:'1',
				msg:err.message
			});
		}else{
			if (doc) {
				//查询成功了，说明可以登录了，创建一个cookie
				res.cookie('userId',doc.userId,{
					path:'/',
					maxAge:1000*60*60
				});
				res.cookie('userName',doc.userName,{
					path:'/',
					maxAge:1000*60*60
				});
				//req.session.user = doc;
				res.json({
					status:'0',
					msg:'',
					result:{
						userName:doc.userName
					}
				})
			}
		}
	})
});
//登出操作
router.post('/logout',(req,res,next) =>{
	res.cookie('userId','',{
		path:'/',
		maxAge:-1 //-1表示让cookie失效
	});
	res.json({
		status:'0',
		msg:'',
		result:''
	})
});
//查询购物车数量
router.get('/getCartCount',(req,res,next) => {
	if (req.cookies && req.cookies.userId) {
		let userId = req.cookies.userId;
		User.findOne({userId:userId},(err,doc) => {
			if (err) {
				res.json({
					status:'1',
					msg:err.message,
					result:''
				});				
			}else{
				let cartList = doc.cartList;
				let cartCount = 0;
				//购物车数量通过遍历累加productNum获得
				cartList.map(item => {
					cartCount += parseInt(item.productNum);
				});
				res.json({
					status:'0',
					msg:'',
					result:cartCount
				});
			}
		})
	}
	
})
//登录状态校验
router.get('/checkLogin',(req,res,next) => {
	if (req.cookies.userId) {
		res.json({
			status:'0',
			msg:'',
			result:{userName:req.cookies.userName}
		});
	}else{
		res.json({
			status:'1',
			msg:'未登录',
			result:''
		})
		
	}
})

//购物车列表
router.get('/cart',(req,res,next) => {
	let userId = req.cookies.userId;
	User.findOne({userId:userId},(err,doc) => {
		if(err){
			res.json({
				status:'1',
				msg:err.message,
				result:''
			});
		}else{
			if(doc){
				res.json({
					status:'0',
					msg:'',
					result:doc.cartList
				});
			}
		}
	})
})
//购物车删除
router.post('/cartDel',(req,res,next) => {
	let userId = req.cookies.userId,productId = req.body.productId;
	User.update({userId:userId},{$pull:{'cartList':{'productId':productId}}},(err,doc) => {
		if (err) {
			res.json({
				status:'1',
				msg:err.message,
				result:''
			});
		}else{
			res.json({
				status:'0',
				msg:'',
				result:'success'
			});
		}
	})
})
//购物车编辑产品数量
router.post('/cartEdit',(req,res,next) => {
	let userId = req.cookies.userId,
	productId = req.body.productId,
	checked = req.body.checked,
	productNum = req.body.productNum	;
	User.update({'userId':userId,'cartList.productId':productId},{
		'cartList.$.productNum':productNum,
		'cartList.$.checked':checked
	},(err,doc) => {
		if (err) {
			res.json({
				status:'1',
				msg:err.message,
				result:''
			});
		}else{
			res.json({
				status:'0',
				msg:'',
				result:'success'
			});
		}
	})
	
})
//全选状态保存
router.post('/editCheckAll',(req,res,next) => {
	let userId = req.cookies.userId,
	checkAll = req.body.checkAll ? '1' :'0';
	User.findOne({userId:userId},(err,doc) =>{
		if (err) {
			res.json({
				status:'1',
				msg:err.message,
				result:''
			});
		}else{
			if (doc) {
				doc.cartList.forEach(item => {
					item.checked = checkAll;
				});
				doc.save((err1,doc1) =>{
					if (err1) {
						res.json({
							status:'1',
							msg:err1.message,
							result:''
						});
					}else{
						res.json({
							status:'0',
							msg:'',
							result:'success'
						})
					}
				})
			}			
		}
	})
})
//收货地址查询
router.get('/addressList',(req,res,next) => {
	let userId = req.cookies.userId;
	User.findOne({userId:userId},(err,doc) => {
		if (err) {
			res.json({
				status:'1',
				msg:err.message,
				result:'failed'
			});
		}else{
			res.json({
				status:'0',
				msg:'',
				result:doc.addressList
			})
		}
	})
	
})
//设置默认地址
router.post('/setDefault',(req,res,next) => {
	let userId = req.cookies.userId,
	addressId = req.body.addressId;
	if(!addressId){
		res.json({
				status:'1003',
				msg:'addressId is null',
				result:''
			});
	}else{
			User.findOne({userId:userId},(err,doc) => {
			if (err) {
				res.json({
					status:'1',
					msg:err.message,
					result:'failed'
				});
			}else{
				let addressList = doc.addressList;
				addressList.forEach(item =>{
					if (item.addressId == addressId) {
						item.isDefault = true;
					}else{
						item.isDefault = false;
					}
				});
				doc.save((err1,doc1) => {
					if (err1) {
						res.json({
						status:'1',
						msg:err1.message,
						result:''
						});
					}else{
						res.json({
							status:'0',
							msg:'',
							result:''
						});
					}
				})
				
			}
		})
	}
})
//删除地址接口
router.post('/delAddress',(req,res,next) => {
	let userId = req.cookies.userId,
	addressId = req.body.addressId;
	if(!addressId){
		res.json({
				status:'1003',
				msg:'addressId is null',
				result:''
			});
	}else{
			User.update({userId:userId},{$pull:{'addressList':{'addressId':addressId}}},(err,doc) => {
			if (err) {
				res.json({
					status:'1',
					msg:err.message,
					result:'failed'
				});
			}else{
				res.json({
					status:'0',
					msg:'',
					result:'success'
				});
			}
		});
	}
});
//创建订单
router.post('/payment',(req,res,next) => {
	let userId = req.cookies.userId,
	addressId = req.body.addressId,
	 orderTotal = req.body.orderTotal;
	User.findOne({userId:userId},(err,doc) => {
		if (err) {
			res.json({
				status:'1',
				msg:err.message,
				result:''
			});
		}else{
			let address = '',goodsList =  [];
			//获取当前用户的地址信息
			doc.addressList.forEach(item => {
				if (addressId == item.addressId) {
					address = item;
				}
			});
			//获取用户购物车的商品
			doc.cartList.filter(item => {
				if(item.checked == '1'){
					goodsList.push(item);
				}
				
			});
			let platform = '588';//代表当前系统架构平台码
			let rm1 = Math.floor(Math.random()*10);
			let rm2 = Math.floor(Math.random()*10);
			let sysDate = new Date().Format('yyyyMMddhhmmss');
			let createDate = new Date().Format('yyyy-MM-dd hh:mm:ss');
			//订单编号的生成，每家公司都不一样。
			//平台码+随机数+格式化日期+随机数
			let orderId = platform+rm1+sysDate+rm2;
			let order = {
				orderId:orderId,
				orderTotal:orderTotal,
				addressInfo:address,
				goodsList:goodsList,
				orderStatus:'1',
				createDate:createDate
			};
			doc.orderList.push(order);
			doc.save((err1,doc1) => {
				if (err1) {
					res.json({
					status:'1',
					msg:err1.message,
					result:''
						});
				}else{
					res.json({
						status:'0',
						msg:'',
						result:{
							orderId:order.orderId,
							orderTotal:order.orderTotal
							}
					});
				}
			})
			
		}
	})
})
//订单成功
router.get('/orderSuccess',(req,res,next) => {
	let userId = req.cookies.userId,
	orderId = req.query.orderId;	
	console.log(orderId);
	
	User.findOne({userId:userId},(err,doc) => {
		if (err) {
			res.json({
				status:'1',
				msg:err.message,
				result:''
			});
		}else{
			if (doc.orderList.length > 0) {
				res.json({
				status:'0',
				msg:'',
				result:doc.orderList	,
				info:orderId,
				log:'1111'
				});
			}else{
				res.json({
				status:'12001',
				msg:'无此订单信息！',
				result:''
				});
			}
						
		}
	})
})

module.exports = router;
