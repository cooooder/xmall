// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import {currency} from './util/currency'
import infiniteScroll from 'vue-infinite-scroll'
import VueLazyLoad from 'vue-lazyload'
import Vuex from 'vuex'
import axios from 'axios'
Vue.config.productionTip = false;
Vue.filter('currency',currency);
Vue.use(VueLazyLoad,{
	loading:'static/loading-svg/loading-bars.svg'
});
Vue.use(infiniteScroll);
Vue.use(Vuex);
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
		initCartCount(state,cartCount){
			state.cartCount = cartCount;
		}
	}
});
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
  store,
  template: '<App/>',
  components: { App }
})

