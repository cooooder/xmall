var mongoose = require('mongoose');
//定义表模型
var Schema = mongoose.Schema;

//定义模型
var productSchema = new Schema({
	productId:String,
	productName:String,
	salePrice:Number,
	productImage:String,
	productUrl:String,
	checked:String,
	productNum:String
});

module.exports = mongoose.model('Good',productSchema,'Goods');
