<template>
	<view class="body">
		<view class="shop-nav">
			<view class="nav-item" v-for="(item, index) in value.list" :key="index" @click="navSwitch(item.type)">
				<image :src="$util.img(item.type == type ? item.select_path : item.path)" mode="w"></image>
				<text class="text" :style="{ color: item.type == type ? value.color : ''}">{{item.text}}</text>
				<view class="line" v-if="item.type == type" :style="{ background: item.type == type ? value.color : ''}"></view>
			</view>
		</view>
		<scroll-view scroll-y="true" class="scroll-view" >
			<view class="shop-ranking" v-if="type == 1">
				<view class="text">本店榜单</view>
				<view class="switch-btn">
					<view :style="{color:rankingType==1 ? '#ffffff' : '', background:rankingType==1 ? value.color : ''}" @click="rankSwitch(1)">收藏排行</view>
					<view :style="{color:rankingType==2 ? '#ffffff' : '', background:rankingType==2 ? value.color : ''}" @click="rankSwitch(2)">销量排行</view>
				</view>
				<view class="ranking-list">
					<view class="ranking-goods-item" v-for="(item, index) in rankGoodsList" :key="index" @click="toDetail(item)">
						<view class="goods-img">
							<image :src="goodsImg(item.goods_image)" mode="widthFix" @error="imgError(index)"></image>
							<image v-if="index < 4" :src="$util.img('upload/uniapp/shop/ranking_'+(index+1)+'.png')" mode="widthFix" class="icon"></image>
						</view>
						
						<view class="info-wrap">
							<view class="name-wrap">
								<view class="goods-name">{{ item.goods_name }}</view>
							</view>
							<view>
								<view class="pro-info">
									<view class="price" :style="{ color:value.color}">
										<text class="unit">{{ $lang('common.currencySymbol') }}</text>
										{{ parseFloat(showPrice(item)).toFixed(2).split(".")[0] }}.
										<text class="unit">{{ parseFloat(showPrice(item)).toFixed(2).split(".")[1] }}</text>
									</view>
									<view class="sale  color-tip">已售{{ item.sale_num }}{{ item.unit ? item.unit : '件' }}</view>
								</view>
								<view class="goods-label">
									<view v-if="item.is_free_shipping == 1" :style="{color:value.color, borderColor: value.color}">包邮</view>
									<block v-if="goodsService.length > 0">
										<view v-for="(service_item, service_index) in goodsService" :key="service_index" v-if="(item.is_free_shipping == 0 &&  service_index < 3) || service_index < 2" >{{service_item.service_name}}</view>
									</block>
								</view>
							</view>
							 
						</view>
						
					</view>
					<view class="empty-box" v-if="rankGoodsList.length == 0 && !isLoading"><ns-empty :isIndex="false" :fixed="false" text="暂无商品"></ns-empty></view>
				</view>
				
			</view>
			<view v-if="type == 2 || type == 3" class="goods-list-box">
				
				<view class="shop-sort" v-if="type == 2">
					<view class="sort-item" :class="order == 'sort' ? 'active' : ''" @click="sortSwitch('sort', 'desc')">综合</view>
					<view class="sort-item" :class="order == 'sale_num' ? 'active' : ''" @click="sortSwitch('sale_num', 'desc')">销量</view>
					<view class="sort-item" :class="order == 'create_time' ? 'active' : ''" @click="sortSwitch('create_time', 'desc')">最新</view>
					<view class="sort-item price"  @click="sortSwitch('discount_price', sort == 'desc' ? 'asc' : 'desc')">
						<view :class="order == 'discount_price' ? 'active' : ''">价格</view>
						<view class="icon">
							<view class="iconfont iconshangsanjiao-copy" :class="order == 'discount_price' && sort == 'asc' ? 'active' : ''"></view>
							<view class="iconfont iconsanjiao" :class="order == 'discount_price' && sort == 'desc' ? 'active' : ''"></view>
						</view>
					</view>
				</view>
				<view class="goods-list double-column">
					<view class="goods-item margin-bottom" v-for="(item, index) in goodsList" :key="index" @click="toDetail(item)">
						<view class="goods-img">
							<image :src="goodsImg(item.goods_image)" mode="widthFix" @error="imgGoodsError(index)"></image>
							<view class="color-base-bg goods-tag" v-if="goodsTag(item) != ''">{{ goodsTag(item) }}</view>
						</view>
						<view class="info-wrap">
							<view class="name-wrap">
								<view class="goods-name">{{ item.goods_name }}</view>
							</view>
							<view class="pro-info">
								<view class="discount-price " :style="{ color:value.color}">
									<text class="unit">{{ $lang('common.currencySymbol') }}</text>
									{{ parseFloat(showPrice(item)).toFixed(2).split(".")[0] }}.
									<text class="unit">{{ parseFloat(showPrice(item)).toFixed(2).split(".")[1] }}</text>
								</view>
								<view class="sale  color-tip">已售{{ item.sale_num }}{{ item.unit ? item.unit : '件' }}</view>
							</view>
							 
						</view>
					</view>
					<view style="" class="empty-box" v-if="goodsList.length == 0 && !isLoading"><ns-empty :isIndex="false" :fixed="false" text="暂无商品"></ns-empty></view>
				</view>
			</view>
			<view v-if="type == 4" class="">
				<view class="shop-promotion">
					<view class="text">领优惠券</view>
					<view class="coupon-list">
						<view class="coupon-item" v-for="(item, index) in couponList" :key="index">
							<view class="item-base" v-if="item.type == 'discount'">
								{{ parseFloat(item.discount) }}<text>折</text>
							</view>
							<view class="item-base" v-else>
								<text>￥</text>{{ parseFloat(item.money) }}
							</view>
							<view class="line"></view>
							<view class="coupon-content">
								<view class="item-info">
									<view class="name">{{item.coupon_name}}</view>
									<view class="desc" v-if="item.at_least > 0" >
										满{{ item.at_least }}元可用
									</view>
									<view class="desc" v-else >无门槛优惠券</view>
									<view class="time" v-if="item.validity_type">领取之日起{{ item.fixed_term }}日内有效</view>
									<view class="time" v-else>有效期：{{ $util.timeStampTurnTime(item.end_time) }}</view>
								</view>
								 
								<view class="item-btn" v-if="item.useState == 0" @click.stop="receiveCoupon(item, index)">立即领取</view>
								<view class="item-btn" v-if="item.useState == 1" @click.stop="toGoodsList(item, index)">去使用</view>
								<view class="item-btn" v-if="item.useState == 2" :class="{ disabled: item.useState == 2 }">已抢光</view>
							</view>
						</view>
						<view style="" class="coupon-empty-box" v-if="couponList.length == 0">
							<view class="empty" >
								<view class="empty_img"><image :src="$util.img('upload/uniapp/coupon_empty.png')" mode="aspectFit"></image></view>
								<view class="color-tip margin-top margin-bottom">本店暂无活动哦！</view>
							</view>
							
						</view>
						
					</view>
				</view>
				
			</view>
			
			<!-- <view class="mescroll-upwarp" v-show="isLoading"><ns-loading></ns-loading></view> -->
		</scroll-view>
		<!-- 加载中 -->
		
	</view>
</template>

<script>
import nsLoading from '@/components/ns-loading/ns-loading.vue';
export default {
	name: 'diy-shop-store',
	components: {
		nsLoading
	},
	props: {
		value: {
			type: Object,
			default: () => {
				return {};
			}
		},
		siteId: {
			type: [Number, String],
			default: 0
		}
	},
	data() {
		return {
			isNetwork: 1, //是否可以继续请求
			isLoading: false,
			type:1,
			rankingType:1,
			goodsList:[],
			shopInfo:null,
			goodsService:[],
			
			rankGoodsList:[],
			num:1,
			pageCount:0,
			order:'sort',
			sort:'desc',
			flag:false,
			couponPage:1,
			couponList:[],
			back:'',
			couponBtnSwitch:false
		};
	},
	created() {
		this.getShopInfo();
		// this.getGoodsList();
		this.getRankList();
		this.back = '/otherpages/shop/index/index?site_id='+this.siteId
		this.getCounponList();
	},
	 mounted() {
		var that=this;
		uni.$on('onReachBottom', function(data) {
			 if(that.type == 2 || that.type == 3) {
				that.getGoodsList();
			 }
		});
	},
	methods: {
		navSwitch(type){
			this.type = type;
			if(type == 2 || type == 3) {
				this.num = 1;
				this.goodsList = [];
				this.getGoodsList();
			}
			 
		},
		sortSwitch(order, sort){
			this.order = order;
			this.sort = sort;
			this.num = 1;
			this.goodsList = [];
			this.getGoodsList()
		},
		rankSwitch(type){
			this.rankingType = type;
			this.getRankList();
		},
		imgError(index) {
			this.rankGoodsList[index].goods_image = this.$util.getDefaultImage().default_goods_img;
		},
		imgGoodsError(index){
			this.goodsList[index].goods_image = this.$util.getDefaultImage().default_goods_img;
		},
		goodsImg(imgStr) {
			let imgs = imgStr.split(',');
			return imgs[0] ? this.$util.img(imgs[0], { size: 'mid' }) : this.$util.getDefaultImage().default_goods_img;
		},
		toDetail(item) {
			this.$util.redirectTo('/pages/goods/detail/detail', {
				sku_id: item.sku_id
			});
		},
		showPrice(data) {
			let price = data.discount_price;
			if (data.member_price && parseFloat(data.member_price) < parseFloat(price)) price = data.member_price;
			return price;
		},
		toBottom(){
			
			
		},
		goodsTag(data) {
			switch (data.recommend_way) {
				case 1:
					return '新品';
					break;
				case 2:
					return '精品';
					break;
				case 3:
					return '推荐';
					break;
				default:
					return '';
			}
		},
		getGoodsList() {
			var data = {
				page: this.num,
				order:'create_time',
				sort: 'desc',
				site_id: this.siteId
			};
			
			if(this.type == '2'){
				data.order = this.order;
				data.sort = this.sort;
			}
			if(this.pageCount > 0 && this.pageCount < this.num) return false;
			if(this.num == 1) this.isLoading = true;
			if(this.flag) return false;
			this.flag = true;
			this.$api.sendRequest({
				url: '/api/goodssku/page',
				data: data,
				success: res => {
					this.isLoading = false;
					if (res.code == 0 && res.data) {
						this.pageCount = res.data.page_count;
						this.flag = false;
						let data = res.data;
						if (this.num == 1) {
							this.goodsList = [];
						}
						
						if(res.data.list.length){
							this.goodsList = this.goodsList.concat(res.data.list);
						}
						this.num += 1;
					}
				}
			});
		},
		getRankList() {
			
			let order = this.rankingType == 1 ? 'collect' : 'sale_num';
			var data = {
				page: 1,
				page_size: 6,
				sort : 'desc',
				order,
				site_id:this.siteId
			};
			this.isLoading = true;
		 
			this.$api.sendRequest({
				url: '/api/goodssku/page',
				data: data,
				success: res => {
					this.isLoading = false;
					if (res.code == 0 && res.data) {
						let data = res.data;
						this.rankGoodsList = data.list;
					}
				}
			});
		},
		//获取店铺详情
		getShopInfo() {
			this.$api.sendRequest({
				url: '/api/shop/info',
				data: {
					site_id: this.siteId
				},
				success: res => {
					if (res.code == 0) {
						this.shopInfo = res.data;
						
						this.goodsService = [];
						if (this.shopInfo.shop_baozh == 1) {
							this.goodsService.push({
								service_name: '保证服务',
								desc: '保证服务'
							});
						}
						
						if (this.shopInfo.shop_qtian == 1) {
							this.goodsService.push({
								service_name: '7天退换',
								desc: '满足7天无理由退换货申请的前提下，包邮商品需要买家承担退货邮费，非包邮商品需要买家承担发货和退货邮费'
							});
						}
						
						if (this.shopInfo.shop_zhping == 1) {
							this.goodsService.push({
								service_name: '正品保障',
								desc: '商品支持正品保障服务'
							});
						}
						
						if (this.shopInfo.shop_erxiaoshi == 1) {
							this.goodsService.push({
								service_name: '两小时发货',
								desc: '付款后2小时内发货'
							});
						}
						
						if (this.shopInfo.shop_tuihuo == 1) {
							this.goodsService.push({
								service_name: '退货承诺',
								desc: '退货承诺'
							});
						}
						
						if (this.shopInfo.shop_shiyong == 1) {
							this.goodsService.push({
								service_name: '试用中心',
								desc: '试用中心'
							});
						}
						
						if (this.shopInfo.shop_shiti == 1) {
							this.goodsService.push({
								service_name: '实体验证',
								desc: '实体验证'
							});
						}
						
						if (this.shopInfo.shop_xiaoxie == 1) {
							this.goodsService.push({
								service_name: '消协保证',
								desc: '如有商品质量问题、描述不符或未收到货等，您有权申请退款或退货，来回邮费由卖家承担'
							});
						}
						
					}
				}
			});
		},
		
		getCounponList() {
			 
			this.$api.sendRequest({
				url: '/coupon/api/coupon/typepagelists',
				data: {
					page: this.couponPage,
					page_size: 0,
					site_id: this.siteId
				},
				success: res => {
					let newArr = [];
					let msg = res.message;
					if (res.code == 0 && res.data) {
						newArr = res.data.list;
					} else {
						this.$util.showToast({
							title: msg
						});
					}
					if (newArr.length) {
						newArr.forEach(v => {
							v.useState = 0;
						});
					}
					
					if (newArr.length) {
						newArr.forEach(v => {
							if(v.is_limitcount == 1 ){
								v.useState = 0
							}else {
								if (v.count == v.lead_count) v.useState = 2;
								else v.useState = 0;
							}
						});
					}
					//设置列表数据
					if (this.couponPage == 1) this.couponList = []; //如果是第一页需手动制空列表
					this.couponList = this.couponList.concat(newArr); //追加新数据
					
					
				},
				fail() {
					
				}
			});
		},
		
		//去使用优惠券
		toGoodsList(item) {
			if (item.goods_type != 1) {
				this.$util.redirectTo('/otherpages/shop/list/list', {
					couponId: item.coupon_type_id,
					site_id: item.site_id
				});
			} else {
				this.$util.redirectTo('/otherpages/shop/list/list', {
					site_id: item.site_id
				});
			}
		},
		
		//领取优惠券
		receiveCoupon(item, index) {
			if (this.couponBtnSwitch) return;
			this.couponBtnSwitch = true;
			let token = uni.getStorageSync('token');
			if (token != '') {
				var url,
					data = {
						site_id: item.site_id,
						get_type: 2 //获取方式:1订单2.直接领取3.活动领取
					};
				url = '/coupon/api/coupon/receive';
				data.coupon_type_id = item.coupon_type_id;
				 
				this.$api.sendRequest({
					url,
					data,
					success: res => {
						var data = res.data;
						let msg = res.message;
						if (res.code == 0) {
							msg = '领取成功';
						}
						let list = this.couponList;
						if (res.data.is_exist == 1) {
							for (let i = 0; i < list.length; i++) {
								if (list[i].coupon_type_id == item.coupon_type_id) {
									list[i].useState = 1;
								}
							}
						} else {
							for (let i = 0; i < list.length; i++) {
								if (list[i].coupon_type_id == item.coupon_type_id) {
									list[i].useState = 2;
								}
							}
						}
						 
						this.$util.showToast({
							title: msg
						});
						this.couponBtnSwitch = false;
					},
					fail: res => {
						this.couponBtnSwitch = false;
					}
				});
			} else {
				this.bindgetuserinfo();
			}
		},
		bindgetuserinfo() {
			if (this.$util.isWeiXin()) {
				let redirect_url = '';
				if (this.back) redirect_url = Config.h5Domain + '/pages/login/login/login?back=' + encodeURIComponent(this.back);
				else redirect_url = Config.h5Domain + '/pages/login/login/login';
		
				this.$api.sendRequest({
					url: '/wechat/api/wechat/authcode',
					data: {
						redirect_url
					},
					success: res => {
						if (res.code >= 0) {
							location.href = res.data;
						}
					}
				});
			} else {
				if (this.back)
					this.$util.redirectTo('/pages/login/login/login', {
						back: this.back
					});
				else this.$util.redirectTo('/pages/login/login/login');
			}
			this.couponBtnSwitch = false;
		},
		
	},

};
</script>

<style lang="scss">
.body{
	
}
.shop-nav{
	display: flex;
	justify-content: space-around;
	background-color: #fff;
	padding: 6rpx 20rpx 0;
	border-top: 2rpx solid #eeeeee;
	.nav-item{
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		position: relative;
		height: 50px;
		box-sizing: border-box;
		padding-bottom: 8rpx;
		image{
			width: 40rpx;
			height: 40rpx;
		}
		.text{
			color: #666666;
			margin-top: 8rpx;
			line-height: 1;
			font-size: 24rpx;
		}
		.line{
			position: absolute;
			bottom:0;
			height: 4rpx;
			width: 50rpx;
		}
	}
}

.shop-ranking{
	margin: 20rpx;
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 10rpx 0;
	.text{
		font-size: 32rpx;
		font-weight: 600;
		color: #222222;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10rpx 0;
		&::after{
			content: ' ';
			width: 36rpx;
			height: 2rpx;
			background: linear-gradient(270deg, rgba(34,34,34,0) 0%, #222222 100%);
			display: inline-block;
			margin-left: 10rpx;
		}
		&::before{
			content: ' ';
			width: 36rpx;
			height: 2rpx;
			background: linear-gradient(270deg, #222222 0%, rgba(34,34,34,0) 100%);
			display: inline-block;
			margin-right: 10rpx;
		}
	}
	.switch-btn{
		margin: 0 auto;
		background-color: #F6F6F8;
		display: flex;
		width: fit-content;
		border-radius: 100rpx;
		overflow: hidden;
		margin-top: 10rpx;
		view{
			padding: 10rpx 60rpx;
			border-radius: 100rpx;
		}
	}
	
}

.scroll-view{
	// max-height: 95vh;
	min-height: 350rpx;
}

.ranking-list{
	display: flex;
	flex-direction: column;
	margin-top: 10rpx;
	padding: 0 20rpx;
	.ranking-goods-item{
		display: flex;
		padding: 16rpx 0;
		.goods-img{
			width: 200rpx;
			height: 200rpx;
			padding: 20rpx;
			position: relative;
			image{
				width: 100%;
				height: 100%;
			}
			.icon{
				width: 60rpx;
				position: absolute;
				top: 0;
				left:0;
			}
		}
		.info-wrap{
			padding: 24rpx 20rpx 24rpx 0;
			box-sizing: border-box;
			width: calc(100% - 240rpx);
			flex: 1;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			.name-wrap{
				height: 90rpx;
				.goods-name{
					font-size: 26rpx;
					color: #333333;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
				}
			}
			.pro-info{
				display: flex;
				align-items: baseline;
				.sale{
					font-size: 24rpx;
				}
				.price{
					margin-right: 30rpx;
					font-size: 32rpx;
					font-weight: bold;
					
					.unit{
						font-size: 24rpx;
					}
				}
			}
			.goods-label{
				display: flex;
				>view{
					margin-right: 6rpx;
					line-height: 1;
					font-size: 22rpx;
					color: #888888;
					border: 1px solid #C7C7CA;
					padding: 4rpx 8rpx;
					border-radius: 5rpx;

				}
			}
		}
	}
}

.goods-list-box{
	display: flex;
	flex-wrap: wrap;
	.shop-sort{
		display: flex;
		align-items: center;
		justify-content: space-around;
		width: 100%;
		margin-top: 20rpx;
		color: #666666;
		
		.price{
			display: flex;
			align-items: center;
			
			view{
				color: #666666;
			}
			.icon{
				display: flex;
				flex-direction: column;
				margin-left: 6rpx;
				view{
					font-size: 24rpx;
					color: #999999;
					&:last-child{
						margin-top: -12rpx;
					}
					&:first-child{
						margin-bottom: -12rpx;
					}
				}
				
			}
		}
		.sort-item{
			color: #666666;
			&.active{
				color: #333333;
				font-weight: bold;
			}
			.active{
				color: #333333!important;
				font-weight: bold;
			}
		}
	}
}
.goods-list.double-column {
	display: flex;
	flex-wrap: wrap;
	margin: 0 20rpx;
	margin-top: 20rpx;
	width: 100%;
	
	.goods-item {
		flex: 1;
		position: relative;
		background-color: #fff;
		flex-basis: 48%;
		width: calc((100% - 20rpx) / 2);
		max-width: calc((100% - 20rpx) / 2);
		margin-right: 20rpx;
		margin-bottom: $margin-updown;
		border-radius: $border-radius;
		display: inline-block;
		&:nth-child(2n) {
			margin-right: 0;
		}

		.goods-img {
			position: relative;
			overflow: hidden;
			padding-top: 100%;
			border-top-left-radius: $border-radius;
			border-top-right-radius: $border-radius;

			image {
				width: 100%;
				position: absolute;
				top: 50%;
				left: 0;
				transform: translateY(-50%);
			}
		}

		.goods-tag {
			color: #fff;
			line-height: 1;
			padding: 8rpx 16rpx;
			position: absolute;
			border-bottom-right-radius: $border-radius;
			top: 0;
			left: 0;
			font-size: $font-size-goods-tag;
		}

		.goods-tag-img {
			position: absolute;
			border-top-left-radius: $border-radius;
			width: 80rpx;
			height: 80rpx;
			top: 0;
			left: 0;
			z-index: 5;
			overflow: hidden;

			image {
				width: 100%;
				height: 100%;
			}
		}

		.info-wrap {
			padding: 0 26rpx 26rpx 26rpx;
		}

		.goods-name {
			font-size: $font-size-base;
			line-height: 1.3;
			overflow: hidden;
			text-overflow: ellipsis;
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			margin-top: 20rpx;
			height: 68rpx;
		}

		.discount-price {
			display: inline-block;
			font-weight: bold;
			line-height: 1;
			font-size: 16px;
			font-weight: bold;
			.unit {
				margin-right: 6rpx;
				font-size: 12px;
			}
		}

		.pro-info {
			display: flex;
			margin-top: 16rpx;
			justify-content: space-between;
			align-items: center;
			.sale{
				font-size: 24rpx;
			}
			& > view {
				line-height: 1;
				
				&:nth-child(2) {
					text-align: right;
				}
			}
		}

		.member-price-tag {
			display: inline-block;
			width: 60rpx;
			line-height: 1;
			margin-left: 6rpx;

			image {
				width: 100%;
			}
		}
	}
}

.shop-promotion{
	margin: 20rpx;
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 10rpx 0;
	.text{
		font-size: 32rpx;
		font-weight: 600;
		color: #222222;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 10rpx 0;
		&::after{
			content: ' ';
			width: 36rpx;
			height: 2rpx;
			background: linear-gradient(270deg, rgba(34,34,34,0) 0%, #222222 100%);
			display: inline-block;
			margin-left: 10rpx;
		}
		&::before{
			content: ' ';
			width: 36rpx;
			height: 2rpx;
			background: linear-gradient(270deg, #222222 0%, rgba(34,34,34,0) 100%);
			display: inline-block;
			margin-right: 10rpx;
		}
	}
	
	.coupon-list{
		display: flex;
		flex-direction: column;
		padding: 20rpx;
	
		
		.coupon-item{
			border: 2rpx solid #F7C4D6;
			border-radius: 6rpx;
			display: flex;
			margin-bottom: 20rpx;
			background-color: #FCF6F8;
			.item-base{
				width: 170rpx;
				display: flex;
				align-items: baseline;
				justify-content: center;
				color: #FC3D33;
				font-weight: bold;
				font-size: 44rpx;
				padding: 36rpx 0;
				flex-shrink:0;
				text{
					font-size: 24rpx;
				}
			}
			.line{
				border-left: 2rpx dashed #F7C4D6;
				position: relative;
				&::before{
					content: ' ';
					position: absolute;
					left: -14rpx;
					top: -2rpx;
					width: 24rpx;
					height: 12rpx;
					border-radius: 12rpx 12rpx 0 0;
					z-index: 1;
					border-left: 2rpx solid #F7C4D6;
					-webkit-transform: rotate(-45deg);
					transform: rotate(-180deg);
					background: #FFF;
					border-right: 2rpx solid #F7C4D6;
					border-top: 2rpx solid #F7C4D6;
				}
				&::after{
					content: ' ';
					position: absolute;
					left: -16rpx;
					bottom: -2rpx;
					width: 24rpx;
					height: 12rpx;
					border-radius: 12rpx 12rpx 0 0;
					z-index: 1;
					border-left: 2rpx solid #F7C4D6;
					background: #FFF;
					border-right: 2rpx solid #F7C4D6;
					border-top: 2rpx solid #F7C4D6;
				}
			}
			.coupon-content{
				display: flex;
				width: calc(100% - 206rpx);
				padding: 30rpx 16rpx;
				justify-content: space-between;
				align-items: center;
				.item-info{
					width: calc(100% - 125rpx);
					.name{
						font-size: 26rpx;
						font-weight: 600;
						color: #FC3D33;
						line-height: 1;
						 overflow:hidden;
						  white-space: nowrap;
						  text-overflow: ellipsis;
					}
					.desc{
						font-size: 22rpx;
						font-weight: 500;
						color: #FC3D33;
						margin-top: 18rpx;
						line-height: 1;
						 overflow:hidden;
						  white-space: nowrap;
						  text-overflow: ellipsis;
					}
					.time{
						font-size: 22rpx;
						font-weight: 500;
						color: #AFAFAF;
						line-height: 1;
						margin-top: 10rpx;
						 overflow:hidden;
						  white-space: nowrap;
						  text-overflow: ellipsis;
					}
				}
				.item-btn{
					background: #FF213D;
					border-radius: 13px;
					color: #ffffff;
					font-size: 24rpx;
					line-height: 1;
					padding: 15rpx 14rpx;
				}
			}
		}

	}
	
}
.empty-box {
	margin-top: 100rpx;
	margin-bottom: 200rpx;
	width: 100%;
}
.coupon-empty-box{
	margin-top: 100rpx;
	margin-bottom: 200rpx;
	width: 100%;
	.empty {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: $padding;
		box-sizing: border-box;
		justify-content: center;
		.empty_img {
			width: 63%;
			height: 300rpx;
	
			image {
				width: 100%;
				height: 100%;
				padding-bottom: $padding;
			}
		}
	}
}
</style>
