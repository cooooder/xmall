// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
//导入全局过滤器文件
import {currency} from './util/currency'
//流式分页加载插件
import infiniteScroll from 'vue-infinite-scroll'
//引入图片懒加载插件
import VueLazyLoad from 'vue-lazyload'
//导入vuex插件
import Vuex from 'vuex'
import axios from 'axios'
Vue.config.productionTip = false;
//使用全局过滤器
Vue.filter('currency',currency);
//配置图片懒加载插件
Vue.use(VueLazyLoad,{
	loading:'static/loading-svg/loading-bars.svg'
});
//使用流式分页加载插件
Vue.use(infiniteScroll);
//使用vuex
Vue.use(Vuex);
//定义好vuex状态后，全站都可以访问、管理状态。
const store = new Vuex.Store({
	state:{
		nickName:'',
		cartCount:0
	},
	mutations:{
		updateUserInfo(state,nickName){
			state.niceName = nickName;
		},
		updateCartCount(state,cartCount){
			state.cartCount += cartCount;
		},
		//页面加载时，初始化购物车，不累加
		initCartCount(state,cartCount){
			state.cartCount = cartCount;
		}
	}
});
//查询购物车数量,注册为全局公用方法。
Vue.prototype.getCartCount = function(){
				axios.get('/users/getCartCount').then(response => {
					let res = response.data;
					if (res.status == '0') {
						this.$store.commit('initCartCount',res.result);
					}
				})
			}
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,//注册进来，所有的子组件就可以访问store
  template: '<App/>',
  components: { App }
})

