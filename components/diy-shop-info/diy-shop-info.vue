<template>
	<view v-if="shopInfo" >
		<view class="shop-info">
			<view class="shop-image">
				<image v-if="shopInfo.avatar" :src="$util.img(shopInfo.avatar)" @error="shopInfo.avatar = $util.getDefaultImage().default_shop_img" mode="aspectFit" />
				<image v-else :src="$util.getDefaultImage().default_shop_img" mode="aspectFit" />
			</view>
			<view class="shop-con">
				<view class="info-top" @click="toIntroduction()">
					<view class="info-name" :style="value ? 'color:' + value.color : '#303133'">
						{{ shopInfo.site_name }}
						<text class="iconfont icongengduo"></text>
					</view>
				</view>
				<view class="info-desc" @click="toIntroduction()">
					<view class="desc-star">
						<image :src="this.$util.img('upload/uniapp/shop/shop_collect_select.png')"></image>
						<text>{{ ((parseFloat(shopInfo.shop_desccredit) + parseFloat(shopInfo.shop_servicecredit) + parseFloat(shopInfo.shop_deliverycredit)) / 3).toFixed(1) }}</text>
					</view>
					<text class="sale" >已售{{ shopInfo.shop_sales }}</text> 
					<text class="line"></text>
					<text class="fans" >粉丝 {{ shopInfo.sub_num }}</text>
				</view>
			</view>
			<button type="primary" size="mini" class="info-follow hasFollow" @click="follow()" v-if="hasFollow">
				<text>已关注</text>
			</button>
			<button type="warn" size="mini" class="info-follow" @click="follow()" v-if="!hasFollow">
				<image :src="this.$util.img('upload/uniapp/shop/shio_collect.png')"></image>
				<text>关注</text>
			</button>
		</view>
		<view class="shop-service" v-if="goodsService.length > 0" @click="toIntroduction()">
			<view class="item-wrap" v-for="(item, index) in goodsService" :key="index"
				v-if="index < 3">
				<text class="iconfont icondui color-base-text"></text>
				<text>{{ item.service_name }}</text>
			</view>
			<text v-if="serviceShow" class="iconfont iconright"></text>
		</view>
		
	</view>
</template>

<script>
export default {
	data() {
		return {
			shopInfo: {
				logo: '',
				site_name: '',
				sub_num: 0,
				shop_sales:0,
				shop_desccredit: 0,
				shop_servicecredit: 0,
				shop_deliverycredit: 0
			},
			hasFollow: false,
			goodsService: [],
			serviceShow:false,
		};
	},
	props: {
		value: {
			type: Object,
			default: null
		},
		siteId: {
			type: [Number, String],
			default: 0
		},
		type: {
			type: Number,
			default: 0 //0为店铺首页  带图的那种  为其他页面不带图的那种
		}
	},
	watch: {
		siteId() {
			this.getShopInfo();
			this.isFollow();
		}
	},
	created() {
		this.getShopInfo();
		this.isFollow();
		let routes = getCurrentPages();
		let curRoute = routes[routes.length - 1].route;
		if(curRoute != 'otherpages/shop/introduce/introduce') this.serviceShow = true;
	},
	methods: {
		//关注与取消
		follow() {
			var that = this;
			if (!uni.getStorageSync('token')) {
				this.$util.redirectTo(
					'/pages/login/login/login',
					{
						back: '/otherpages/shop/index/index?site_id=' + this.siteId
					},
					'redirectTo'
				);
				return;
			}
			if (this.hasFollow) {
				uni.showModal({
					title: '提示',
					content: '真的要取消关注嘛',
					success: function(res) {
						if (res.confirm) {
							that.$api.sendRequest({
								url: '/api/shopmember/delete',
								data: {
									site_id: that.siteId
								},
								success: res => {
									if (res.code == 0 && res.data) {
										that.hasFollow = !that.hasFollow;
										that.$util.showToast({
											title: '取消成功'
										});
									}
								that.$forceUpdate()
								}
							});
						}
					}
				});
			} else {
				this.$api.sendRequest({
					url: '/api/shopmember/add',
					data: {
						site_id: this.siteId
					},
					success: res => {
						if (res.code == -1 && res.error_code == 'TOKEN_ERROR') {
							this.$util.showToast({ title: '登录失败' });
							setTimeout(() => {
								this.$util.redirectTo(
									'/pages/login/login/login',
									{
										back: '/otherpages/shop/index/index?site_id=' + this.siteId
									},
									'redirectTo'
								);
							}, 1000);
							return;
						}
						if (res.code == 0) {
							this.hasFollow = !this.hasFollow;
							this.$util.showToast({
								title: '关注成功'
							});
						}
						this.$forceUpdate()
					}
				});
			}
			
		},
		//跳转至店铺详细信息页面
		toIntroduction() {
			if (getCurrentPages()[getCurrentPages().length - 1].route != 'otherpages/shop/introduce/introduce') {
				this.$util.redirectTo('/otherpages/shop/introduce/introduce', {
					site_id: this.siteId
				});
			}
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
								service_name: '快速发货',
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
		//是否关注
		isFollow() {
			this.$api.sendRequest({
				url: '/api/shopmember/issubscribe',
				data: {
					site_id: this.siteId
				},
				success: res => {
					if (res.code == 0) {
						this.hasFollow = res.data;
					}
				}
			});
		},
		openMerchantsServicePopup() {
			this.$refs.merchantsServicePopup.open();
		},
		closeMerchantsServicePopup() {
			this.$refs.merchantsServicePopup.close();
		},
		
	}
};
</script>

<style lang="scss">
.shop-info {
	// width: 100%;
	margin: 0 0;
	padding: $padding;
	box-sizing: border-box;
	display: flex;
	align-items: center;
	position: relative;
	box-sizing: border-box;
	background: #ffffff;
	
}
.shop-service{
	background-color: #ffffff;
	display: flex;
	padding-left: 92rpx;
	padding-bottom: 10rpx;
	width: 100%;
	box-sizing: border-box;
	position: relative;
	.item-wrap{
		margin-left: 30rpx;
		display: flex;
		align-items: baseline;
		.iconfont{
			margin-right: 4rpx;
			font-size: 26rpx;
		}
	}
	>.iconfont{
		font-size: 28rpx;
		line-height: 2;
		color: #999999;
		position: absolute;
		right: 24rpx;
		top: -1rpx;
	}
}

.shop-image {
	width: 80rpx;
	height: 80rpx;
	border-radius: 50%;
	overflow: hidden;
	margin-right: $margin-updown;
	border: 1rpx solid $color-line;

	image {
		width: 100%;
		height: 100%;
	}
}

.shop-con {
	width: calc(80% - 80rpx - 20rpx);
	color: #ffffff;
}

.info-top {
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 4rpx;

	.info-name {
		width: 60%;
		font-size: 30rpx;
		font-weight: bold;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;

		.icongengduo {
			font-size: 26rpx;
			margin-top: 2rpx;
			font-weight: normal;
			font-weight: 500;
			margin-left: 10rpx;
		}
	}
}

button[size='mini'].info-follow {
	line-height: 50rpx;
	padding: 0 $padding !important;
	height: 50rpx;
	position: absolute;
	right: $margin-both;
	top: 45rpx;
	display: flex;
	align-items: center;
	&.hasFollow{
		color: #ffffff;
		background-color: #cccccc;
	}
	.iconfont {
		margin-right: 10rpx;
		font-size: $font-size-tag;
	}
	image{
		width: 25rpx;
		height: 25rpx;
		margin-right: 8rpx;
	}

	.iconfont.active {
		margin-right: 10rpx;
		font-size: $font-size-tag;
		color: #ffffff;
	}
}

.info-desc {
	width: 100%;
	display: flex;
	align-items: center;
	.desc-star {
		display: flex;
		align-items: center;
		font-size: 20rpx;
		color: #FA6400;
		margin-right: 30rpx;
		image{
			width: 24rpx;
			height: 24rpx;
			margin-right: 5rpx;
			margin-bottom: 4rpx;
		}
	}

	.fans {
		font-size: 22rpx;
		color: #666666;
	}
	.sale{
		color: #666666;
		font-size: 22rpx;
	}
	.line{
		margin: 0 14rpx;
		background-color: #999999;
		width: 2rpx;
		height: 24rpx;
	}
}


.popup-layer {
	background: #fff;
	.head-wrap {
		font-size: $font-size-toolbar;
		line-height: 100rpx;
		height: 100rpx;
		display: block;
		text-align: center;
		.iconfont {
			position: absolute;
			float: right;
			right: 22px;
			font-size: $font-size-toolbar;
		}
	}
	.button-box {
		width: 100%;
		position: absolute;
		bottom: 0;
		z-index: 1;
		margin-bottom: 30rpx;
		button {
			height: 80rpx;
		}
	}
}

.goods-merchants-service-popup-layer {
	height: 660rpx;
	scroll-view {
		position: absolute;
		left: 0;
		right: 0;
		height: 65%;
		.item {
			padding: 0 30rpx;
			height: 120rpx;
			line-height: 100rpx;
			border-bottom: 2rpx solid $color-line;
			&:last-child {
				border-bottom: none;
			}
			.iconfont {
				display: inline-block;
				margin-right: 20rpx;
				font-size: $font-size-toolbar;
				vertical-align: top;
			}
			.info-wrap {
				display: inline-block;
				vertical-align: middle;
				width: 90%;
				.title {
					display: block;
					font-size: $font-size-base;
				}
				.describe {
					font-size: $font-size-tag;
					color: $color-tip;
					display: block;
					padding: 10rpx 0;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}
			}
			&.empty-desc {
				height: 100rpx;
				.iconfont {
					vertical-align: middle;
				}
			}
		}
	}
}

</style>
