<template>
	<div>
		<nav-header></nav-header>
		<bread><span>Goods</span></bread>
		<div class="accessory-result-page accessory-page">
		  <div class="container">
		    <div class="filter-nav">
		      <span class="sortby">Sort by:</span>
		      <a href="javascript:void(0)" class="default cur">Default</a>
		      <a @click="sortGoods" href="javascript:void(0)" >Price <svg class="icon-arrow-short" :class="{'sort-up':!sortFlag}"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-arrow-short"></use></svg></a>
		      <a href="javascript:void(0)" class="filterby stopPop" @click="showFilter">Filter by</a>
		    </div>
		    <div class="accessory-result">
		      <!-- filter -->
		      <div class="filter stopPop" id="filter" :class="classShowFilter&&'filterby-show'">
		        <dl class="filter-price">
		          <dt>Price:</dt>
		          <dd><a href="javascript:void(0)" :class="{'cur':classActive=='all'}" @click="setPriceFilter('all')">All</a></dd>
		          <dd v-for="(item,index) in priceFilter">
		            <a href="javascript:void(0)" :class="{'cur':classActive==index}" @click="setPriceFilter(index)">{{item.minPrice}} - {{item.maxPrice}}</a>
		          </dd>		      
		        </dl>
		      </div>
		
		      <!-- search result accessories list -->
		      <div class="accessory-list-wrap">
		        <div class="accessory-list col-4">
		          <ul>
		            <li v-for="item in goodsList">
		              <div class="pic">
		                <a href="javascript:;"><img v-lazy="'static/'+item.productImage" alt=""></a>
		              </div>
		              <div class="main">
		                <div class="name">{{item.productName}}</div>
		                <div class="price">{{item.salePrice}}</div>
		                <div class="btn-area">
		                  <a href="javascript:;" class="btn btn--m" @click="addCart(item.productId)">加入购物车</a>
		                </div>
		              </div>
		            </li>                     
		          </ul>
		          <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy" infinite-scroll-distance="30" class="load-more">
  <img src="./../assets/svg/loading-spinning-bubbles.svg" v-show="infiniteShow"/>
</div>
		        </div>
		      </div>
		    </div>
		  </div>
		</div>
		<div class="md-overlay" v-show="classFilterMask" @click="hideMask"></div>
		<nav-footer></nav-footer>
		<modal :mdshow="mdshow" @close="closeModal">
			<p slot="message">
				请先登录，才能使用购物车O(∩_∩)O~
			</p>
			<div slot="btnGroup">
				<a href="javascript:;" class="btn btn--m" @click="mdshow=false">关闭</a>
			</div>
		</modal>
		<modal :mdshow="mdshowCart" @close="closeModal">
			<p slot="message">
				<svg class="icon-status-ok">
              <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-status-ok"></use>
            </svg>
            <span>加入购物车成功！</span>
			</p>
			<div slot="btnGroup">
				<a href="javascript:;" class="btn btn--m" @click="mdshowCart=false">继续购物</a>
				<router-link href="javascript:;" class="btn btn--m" to="/cart">查看购物车</router-link>
			</div>
		</modal>
	</div>
</template>
<style>
.load-more{
	height: 100px;
	line-height: 100px;
	text-align: center;
}
.sort-up{
	transform: rotate(180deg);
	transition: all .3s ease-out;
}
.btn:hover{
	background-color: #ffe5e6;
	transition: all .3s ease-out;
}	
</style>
<script>
	import './../assets/css/base.css';
	import './../assets/css/login.css';
	import './../assets/css/product.css';
	import NavHeader from '@/components/Header'
	import NavFooter from '@/components/Footer'
	import Bread from '@/components/Bread'
	import Modal from '@/components/Modal'
	import axios from 'axios'
	export default {
		data(){
			return {
				//定义价格区间数据
				priceFilter:[
				//此处数字不转换为字符串的话，前端会自动转换为整数
					{minPrice:'0.00',maxPrice:'100.00'},
					{minPrice:'100.00',maxPrice:'500.00'},
					{minPrice:'500.00',maxPrice:'1000.00'},
					{minPrice:'1000.00',maxPrice:'5000.00'},
				],
				//设置当前样式
				classActive:'all',
				//设置响应式 弹出价格筛选框
				classShowFilter:false,
				//设置响应式 弹出透明遮罩
				classFilterMask:false,
				//后端数据接口
				goodsList:[],
				//前端参数
				sortFlag:true,//控制升序or降序
				page:1,
				pageSize:8,
				//设置infiniteScroll
				busy:true,
				infiniteShow:true,
				mdshow:false,
				mdshowCart:false
			}
		},
		mounted(){
			this.getGoodsList();
		},
		components:{
			NavHeader,
			NavFooter,
			Bread,
			Modal
		},
		methods:{
			//控制价格筛选框和透明遮罩的显示/隐藏
			showFilter(){
				this.classShowFilter = true;
				this.classFilterMask = true;
			},
			hideMask(){
				this.classShowFilter = false;
				this.classFilterMask = false;
			},
			//控制价格筛选框的选择状态
			setPriceFilter(index){
				this.classActive = index;
				this.hideMask();
				this.page = 1;
				this.getGoodsList();
			},
			getGoodsList(flag){
				let param = {
					page:this.page,
					pageSize:this.pageSize,
					updown:this.sortFlag ? 1 : -1,
					//价格过滤
					priceLevel:this.classActive
				};
				//axios get api 需要在data参数中添加params才可以。
				axios.get('/goods',{params:param}).then(response => {
					let res = response.data;
					//关闭loading图标
					this.infiniteShow = false;
					if(res.status == '0'){
						//如果flag为true表示流式分页，数组需要累加
						if(flag){
							this.goodsList = [...this.goodsList,...res.result.list];
							//this.goodsList = this.goodsList.concat(res.result.list);
							//当数据少于一页时，停止流式分页
							this.busy = res.result.count < this.pageSize ? true : false;
						}else{
							//默认不累加，只有滚动加载时累加。
							this.goodsList = res.result.list;
							//打开滚动加载
							this.busy = false;
						}
						
					}else{
						this.goodsList = [];
					}
				})
			},
			sortGoods(){
				this.sortFlag = !this.sortFlag;
				this.page = 1;
				this.getGoodsList();
			},
			loadMore(){
				this.busy = true;
				//发起请求前，开启loading图标
				this.infiniteShow = true;
				//处理滚动产生的频繁请求
				 setTimeout(() => {
			        this.page++;
			        this.getGoodsList(true);
			      },500);
			},
			addCart(productId){
				axios.post('/goods/addCart',{productId:productId}).then((response) => {
					let res = response.data;
					if(res.status == 0){
						this.mdshowCart = true;
						this.$store.commit('updateCartCount',1)
					}else{
						this.mdshow = true;
					}
				})
			},
			closeModal(){
				this.mdshow = false;
				this.mdshowCart = false;
			}
		}
	}
</script>