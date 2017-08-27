var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');

//连接mongodb数据库
mongoose.connect('mongodb://root:666@localhost/vuemall');
//数据库连接成功
mongoose.connection.on('connected',() => {
	console.log('MongoDB connected success.')
});
//数据库连接失败
mongoose.connection.on('error',() => {
	console.log('MongoDB connected fail.')
});
//数据库连接断开
mongoose.connection.on('disconnected',() => {
	console.log('MongoDB connected disconnected.')
});
//查询商品列表路由
router.get('/',(req,res,next) => {
	//express api req.param()接收前端页面参数,官网不推荐使用了。
	//接收分页参数
	let page = parseInt(req.query.page);
	//接收每页显示数据条数参数
	let pageSize = parseInt(req.query.pageSize);
	//接收升降序参数
	let updown = req.query.updown;
	//接收价格过滤参数
	let priceLevel = req.query.priceLevel;
	let priceMin,priceMax;		
	let params = {};
	if(priceLevel != 'all'){
		switch(priceLevel){
			case '0' :
			priceMin = 0;
			priceMax = 100;
			break;
			case '1' :
			priceMin = 100;
			priceMax = 500;
			break;
			case '2' :
			priceMin = 500;
			priceMax = 1000;
			break;
			case '3' :
			priceMin = 1000;
			priceMax = 5000;
			break;			
		}
		params = {
			salePrice:{
				$gt:priceMin,
				$lte:priceMax
			}
		}
	}
	//分页公式
	let skip = (page-1)*pageSize;

	//分页计算及价格过滤查询
	let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
	//通过mongoose api sort（）方法对价格字段实现排序
	goodsModel.sort({'salePrice':updown});
	//通过上面的排序等处理后，再进行查询
	goodsModel.exec((err,docs) => {
		if (err) {
			res.json({
				status:'1',
				msg:err.message
			})
		}else{
			res.json({
				status:'0',
				result:{
					count:docs.length,
					list:docs
				}
			})
		}
	})
	
});
//加入购物车路由,提交数据用post
router.post('/addCart',(req,res,next) => {
	let userId = '100000077', productId = req.body.productId;
	let User = require('../models/user');
	User.findOne({userId:userId},(err,userDoc) => {
		if(err){
			res.json({
				status:'1',
				msg:err.message
			})
		}else{
			if(userDoc){
				let goodsItem = '';
				userDoc.cartList.forEach(item => {
					if(item.productId == productId){
						goodsItem = item;
						item.productNum++;
					}
				});
				if (goodsItem) {
					userDoc.save((err1,doc1) => {
									if(err1){
										res.json({
											status:'1',
											msg:err1.message
										})
									}else{
										res.json({
											status:'0',
											msg:'',
											result:'suc'
											
										})
									}
								})
				}else{
						Goods.findOne({productId:productId},(err,doc) => {
					if(err){
							res.json({
								status:'1',
								msg:err.message
							})
						}else{
							if(doc){
								//此处出过问题。由于goods模型中没有声明productNum和checked字段
								//所以此处赋值无效。必须先在schema中声明的字段，才可以赋值。
								doc.productNum = '1';
								doc.checked = '1';
								userDoc.cartList.push(doc);
								userDoc.save((err2,doc2) => {
									if(err2){
										res.json({
											status:'1',
											msg:err2.message
										})
									}else{
										res.json({
											status:'0',
											msg:'',
											result:'suc'
											
										})
									}
								})
							}
						}
				})
				}
				
				
			}
		}
	})
});
//导出路由，否则app.js拿不到
module.exports = router;