var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Goods = require('../models/goods');

mongoose.connect('mongodb://root:666@localhost/vuemall');
mongoose.connection.on('connected',() => {
	console.log('MongoDB connected success.')
});
mongoose.connection.on('error',() => {
	console.log('MongoDB connected fail.')
});
mongoose.connection.on('disconnected',() => {
	console.log('MongoDB connected disconnected.')
});
router.get('/',(req,res,next) => {
	let page = parseInt(req.query.page);
	let pageSize = parseInt(req.query.pageSize);
	let updown = req.query.updown;
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
	let skip = (page-1)*pageSize;

	let goodsModel = Goods.find(params).skip(skip).limit(pageSize);
	goodsModel.sort({'salePrice':updown});
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
module.exports = router;