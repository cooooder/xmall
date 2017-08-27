<template>
	<div>
	<nav-header></nav-header>
	<bread><span>Order Success</span></bread>
  <div class="container">
    <div class="page-title-normal">
      <h2 class="page-title-h2"><span>check out</span></h2>
    </div>
    <!-- 进度条 -->
    <div class="check-step">
      <ul>
        <li class="cur"><span>Confirm</span> address</li>
        <li class="cur"><span>View your</span> order</li>
        <li class="cur"><span>Make</span> payment</li>
        <li class="cur"><span>Order</span> confirmation</li>
      </ul>
    </div>

    <div class="order-create">
      <div class="order-create-pic"><img :src="'/static/'+'ok-2.png'" alt=""></div>
      <div class="order-create-main">
        <h3>Congratulations! <br>Your order is under processing!</h3>
        <p>
          <span>Order ID：{{orderList.orderId}}</span>
          <span>Order total：{{orderList.orderTotal | currency('￥')}}</span>
        </p>
        <div class="order-create-btn-wrap">
          <div class="btn-l-wrap">
            <router-link class="btn btn--m" to="/cart">Cart List</router-link>
          </div>
          <div class="btn-r-wrap">
            <router-link class="btn btn--m" to="/">Goods List</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
  <nav-footer></nav-footer>
</div>
</template>

<script>
	import NavHeader from '@/components/Header'
	import NavFooter from '@/components/Footer'
	import Bread from '@/components/Bread'
	import Modal from '@/components/Modal'
	import axios from 'axios'	
	export default {
		data(){
			return {
				orderList:[]
			}
		},
		mounted(){
			this.init();
		},
		components:{
			NavHeader,
			NavFooter,
			Bread,
			Modal
		},
		methods:{
			init(){
				let orderId = this.$route.query.orderId;
				//防止篡改，如果没有orderId，不让提交
				if (!orderId) {
					return;
				}
				axios.get('/users/orderSuccess',{params:{orderId:orderId}}).then(response => {
					let res = response.data;
					if (res.status == '0') {
						res.result.forEach( item =>{
							if (orderId == item.orderId) {
								this.orderList = item;
							}
						})
					}
				});

			}
		}
	}
</script>
