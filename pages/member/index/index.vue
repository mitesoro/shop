<template>
	<view :data-theme="themeStyle">
		<view class="container">
			<view class="member-container">
				<view class="user-section ns-gradient-pages-member-index-index" :data-theme="defaultInfo.topStyle == 'default' ? themeStyle : ''"
				 :style="defaultBgColor">
					<!-- #ifdef APP-PLUS -->
					<view class="free"></view>
					<!-- #endif -->
					<view class="bg-img">
						<image :src="defaultBgImg" mode="scaleToFill"></image>
					</view>
					<view class="user-section-box">
						<view class="user-info-box" v-if="token">
							<view @click="$util.redirectTo('/pages/member/info/info')" class="user-head">
								<image :src="memberInfo.headimg ? $util.img(memberInfo.headimg) : $util.getDefaultImage().default_headimg" mode="aspectFill"
								 @error="memberInfo.headimg = $util.getDefaultImage().default_headimg"></image>
							</view>
							<view class="user-box">
								<!-- #ifdef MP-WEIXIN -->
								<block v-if="(memberInfo.nickname.indexOf('u_') != -1 && memberInfo.nickname == memberInfo.username) || memberInfo.nickname == memberInfo.mobile">
									<text class="user-title" @click="getWxAuth">点击获取微信头像</text>
								</block>
								<block v-else>
									<text class="user-title" :style="defaultTextColor" @click="getWxAuth">{{ memberInfo.nickname }}</text>
									<view v-if="memberInfo.member_level_name" @click="$util.redirectTo('/otherpages/member/level/level')" class="user-label">
										<view>
											<image :src="$util.img('upload/uniapp/member/index/vip-icon.png')"></image>
											{{ memberInfo.member_level_name }}
										</view>
									</view>
								</block>
								<!-- #endif -->
								
								<!-- #ifdef H5 -->
								<block v-if="$util.isWeiXin() && ( (memberInfo.nickname.indexOf('u_') != -1 && memberInfo.nickname == memberInfo.username) || memberInfo.nickname == memberInfo.mobile)">
									<text class="user-title" @click="getWxAuth">点击获取微信头像</text>
								</block>
								<block v-else>
									<text class="user-title" :style="defaultTextColor"  @click="getWxAuth">{{ memberInfo.nickname }}</text>
									<view v-if="memberInfo.member_level_name" @click="$util.redirectTo('/otherpages/member/level/level')" class="user-label">
										
										<text><image :src="$util.img('upload/uniapp/member/index/vip-icon.png')"></image>{{ memberInfo.member_level_name }}</text>
									</view>
								</block>
								<!-- #endif -->
							</view>
						</view>
						<view class="user-info-box no-log" v-if="!token" @click="redirectToLink('/pages/member/index/index')">
							<view class="user-head">
								<image :src="$util.getDefaultImage().default_headimg"></image>
							</view>
							<view class="user-box">
								<text class="user-title" :style="defaultTextColor">{{ $lang('login') }}</text>
								<text class="user-desc" :style="defaultTextColor">{{ $lang('loginTpis') }}</text>
							</view>
						</view>
						<view @click="redirectToLink('/pages/member/info/info')" class="user-set" v-if="token">
							<image :src="$util.img('upload/uniapp/member/index/icon_set.png')" mode="widthFix"></image>
							<!-- 站内信  v-if="token && addonIsExit.sitemessage"-->  
							<view @click.stop="redirectToLink('/otherpages/sitemessage/master/master')" style="margin-left: 10px;" v-if="token && addonIsExit.sitemessage">
								<view :style="defaultTextColor" class="message-icon" style="position: relative;">
									<image :src="$util.img('upload/uniapp/member/index/icon_message.png')" mode="widthFix"></image>
									<text v-if="perMessageCount > 0" class="message-num color-base-bg">{{perMessageCount}}</text>
									<text v-else-if="perMessageCount > 99" class="color-base-bg message-num">99+</text>
								</view>
							</view>
						</view>
						
						
						<view class="member-sction">
							<view class="sction-item" @click="redirectToLink('/otherpages/member/point/point')">
								<text class="num" :style="defaultTextColor">{{ parseInt(memberInfo.point) }}</text>
								<text class="sction-item-name" :style="defaultTextColor">{{ $lang('point') }}</text>
							</view>
							<view class="sction-item" @click="redirectToLink('/otherpages/member/coupon/coupon')">
								<text class="num" :style="defaultTextColor">{{ couponNum.coupon_num }}</text>
								<text class="sction-item-name" :style="defaultTextColor">{{ $lang('coupon') }}</text>
							</view>
							<view class="sction-item" @click="redirectToLink('/otherpages/member/balance/balance')">
								<text class="num" :style="defaultTextColor">
									{{ (parseFloat(memberInfo.balance) + parseFloat(memberInfo.balance_money)).toFixed(2).split('.')[0] }}
									<text>.{{ (parseFloat(memberInfo.balance) + parseFloat(memberInfo.balance_money)).toFixed(2).split('.')[1] }}</text>
								</text>
								<text class="sction-item-name" :style="defaultTextColor">{{ $lang('balance') }}</text>
							</view>
							
							<view class="sction-item" @click="redirectToLink('/otherpages/member/coupon/coupon')">
								<text class="num" :style="defaultTextColor">{{ couponNum.platform_num }}</text>
								<text class="sction-item-name" :style="defaultTextColor">{{ $lang('platformCoupon') }}</text>
							</view>
							
						</view>
					</view>
					
					<view v-if="defaultInfo.level == 1" class="member-level" :class="{ 'no-default-level': defaultInfo.menuStyle != 'palace' && defaultInfo.topStyle != 'default' }"
					 @click="jumpLevel()" >
						
						<view class="member-level-box" :style="'background-image:url('+$util.img('upload/uniapp/member/index/member_level_bg.png')+')'">
							<view class="img-wrap">
								<image class="img-v" :src="$util.img('upload/uniapp/member/index/level-icon.png')" mode="aspectFit"></image>
								<text class="text" v-if="token">{{ memberInfo.member_level_name }}</text>
								<text class="text" v-else>登录查看权益</text>
								<text class="desc">升级享优惠 更省钱！</text>
							</view>
							<text class="memeber-tit">
								<text class="member-title">立即查看</text>
							</text>
						</view>
					</view>
					
				</view>
				<view class="member-body">
					<!-- 订单模块 -->
					<view class="order-section">
						<!-- <view class="order-head" @click="redirectToLink('/pages/order/list/list')">
							<text class="order-tit">{{ $lang('allOrders') }}</text>
							<text class="order-tip">{{ $lang('seeAllOrders') }}</text>
							<text class="order-more iconfont iconright"></text>
						</view> -->
						<view class="order-body">
							<view class="order-item" @click="redirectToLink('/pages/order/list/list?status=waitpay')">
								<view class="order-icon">
									<text v-if="orderNum.waitPay > 99" class="order-num color-base-bg">99+</text>
									<text v-else-if="orderNum.waitPay > 0" class="order-num color-base-bg">{{ orderNum.waitPay }}</text>
									<image :src="$util.img('upload/uniapp/member/index/order/default_order_create.png')" mode="aspectFit"></image>
								</view>
								<text class="order-name">{{ $lang('waitPay') }}</text>
							</view>
							<!-- <view class="order-item" @click="redirectToLink('/pages/order/list/list?status=waitsend')">
								<view class="order-icon">
									<text v-if="orderNum.readyDelivery > 99" class="order-num color-base-bg">99+</text>
									<text v-else-if="orderNum.readyDelivery > 0" class="order-num color-base-bg">{{ orderNum.readyDelivery }}</text>
									<image :src="$util.img('upload/uniapp/member/index/order/default_order_2.png')" mode="aspectFit"></image>
								</view>
								<text class="order-name">{{ $lang('readyDelivery') }}</text>
							</view> -->
							<view class="order-item" @click="redirectToLink('/pages/order/list/list?status=waitconfirm')">
								<view class="order-icon">
									<text v-if="orderNum.waitDelivery > 99" class="order-num color-base-bg">99+</text>
									<text v-else-if="orderNum.waitDelivery > 0" class="order-num color-base-bg">{{ orderNum.waitDelivery }}</text>
									<image :src="$util.img('upload/uniapp/member/index/order/default_order_pay.png')" mode="aspectFit"></image>
								</view>
								<text class="order-name">{{ $lang('waitDelivery') }}</text>
							</view>
							<view class="order-item" @click="redirectToLink('/pages/order/list/list?status=waitrate')">
								<view class="order-icon">
									<block v-if="evaluateConfig.evaluate_status == 1">
										<text v-if="orderNum.waitEvaluate > 99" class="order-num color-base-bg">99+</text>
										<text v-else-if="orderNum.waitEvaluate > 0" class="order-num color-base-bg">{{ orderNum.waitEvaluate }}</text>
									</block>
									<image :src="$util.img('upload/uniapp/member/index/order/default_order_message.png')" mode="aspectFit"></image>
								</view>
								<text class="order-name">{{ $lang('waitEvaluate') }}</text>
							</view>
							<view class="order-item" @click="redirectToLink('/pages/order/activist/activist')">
								<view class="order-icon">
									<text v-if="orderNum.refunding > 99" class="order-num color-base-bg">99+</text>
									<text v-else-if="orderNum.refunding > 0" class="order-num color-base-bg">{{ orderNum.refunding }}</text>
									<image :src="$util.img('upload/uniapp/member/index/order/default_order_refund.png')" mode="aspectFit"></image>
								</view>
								<text class="order-name">{{ $lang('refunding') }}</text>
							</view>
							<view class="order-item" @click="redirectToLink('/pages/order/list/list')">
								<image class="line" :src="$util.img('upload/uniapp/member/index/cut_off_line.png')" mode="aspectFit"></image>
								<view class="order-icon">
									<image :src="$util.img('upload/uniapp/member/index/order/default_order_all.png')" mode="aspectFit"></image>
								</view>
								<text class="order-name">{{ $lang('allOrders') }}</text>
							</view>
						</view>
					</view>

					<!-- 常用功能模块 -->
					<view class="example-body" :style="{ background: defaultInfo.topStyle == 'default' || defaultInfo.menuStyle == 'palace' ? '#fff' : '#f7f7f7' }">
						<view class="example-body-head" :class="{ 'example-tit-palace': defaultInfo.menuStyle != 'palace' && defaultInfo.topStyle != 'default' }">
							<text class="example-tit">常用工具</text>
						</view>
						<template v-if="defaultInfo.menuStyle == 'palace'">
							<uni-grid :column="5" :show-border="false" :square="false">
								<block v-for="(item, index) in defaultInfo.menuList" :key="index">
									<view @click="redirectToLink(item.url)" v-if="menuIsShow(item)">
										<block v-if="item.tag == 'servicer'">


										</block>
										<block v-else>
											<uni-grid-item>
												<image class="image" :src="$util.img(item.img)" mode="aspectFill" />
												<text class="text">{{ item.text }}</text>
												<!-- <text class="text" v-if="item.tag=='fenxiao'">{{ fenxiaoWords.concept + '中心' }}</text> -->
											</uni-grid-item>
										</block>
									</view>
								</block>
							</uni-grid>
						</template>
						<view v-if="defaultInfo.menuStyle == 'list'" class="list-style">
							<block v-for="(item, index) in defaultInfo.menuList" :key="index">
								<view class="list-style-item" :class="defaultInfo.insertGap == 0 ? 'no-interval' : 'interval'" @click="redirectToLink(item.url)"
								 v-if="menuIsShow(item)">
									<block v-if="item.tag == 'servicer'">
										<!-- 客服 -->

									</block>
									<block v-else>
										<image class="image" :src="$util.img(item.img)" mode="aspectFill" />
										<text class="text">{{ item.text }}</text>
										<text class="iconfont iconright"></text>
										<!-- <text class="text" v-if="item.tag=='fenxiao'">{{ fenxiaoWords.concept + '中心' }}</text> -->
									</block>
								</view>
							</block>
						</view>
					</view>
				</view>
				<view class="padding-bottom">
					<ns-copyright></ns-copyright>
				</view>
				
				<!-- 完善会员资料 -->
				<view @touchmove.prevent.stop class="member-complete-info-popup">
					<uni-popup ref="completeInfoPopup" type="bottom" :maskClick="false">
						<view class="complete-info-wrap">
							<view class="head">
								<text class="title">获取您的昵称、头像</text>
								<text class="color-tip tips">获取用户头像、昵称完善个人资料，主要用于向用户提供具有辨识度的用户中心界面</text>
								<text class="iconfont iconclose color-tip" @click="cancelCompleteInfo"></text>
							</view>
							<view class="item-wrap">
								<text class="label">头像</text>
								<button open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
									<image :src="avatarUrl ? avatarUrl : $util.getDefaultImage().default_headimg" @error="avatarUrl = $util.getDefaultImage().default_headimg" mode="aspectFill"></image>
									<text class="iconfont icon-right color-tip"></text>
								</button>
							</view>
							<view class="item-wrap">
								<text class="label">昵称</text>
								<input type="nickname" placeholder="请输入昵称" v-model="nickName" @blur="blurNickName" />
							</view>
				
							<button type="default" class="save-btn" @click="saveCompleteInfo" :disabled="isDisabled">保存</button>
						</view>
					</uni-popup>
				</view>

				<ns-login ref="login"></ns-login>
				<loading-cover ref="loadingCover"></loading-cover>
				<!-- 底部tabBar -->
				<diy-bottom-nav type="shop"></diy-bottom-nav>
			</view>
		</view>
		<to-top v-if="showTop" @toTop="scrollToTopNative()"></to-top>
	</view>
</template>

<script>
	import uniGrid from '@/components/uni-grid/uni-grid.vue';
	import uniGridItem from '@/components/uni-grid-item/uni-grid-item.vue';
	import diyBottomNav from '@/components/diy-bottom-nav/diy-bottom-nav.vue';
	import toTop from '@/components/toTop/toTop.vue';
	import scroll from '@/common/js/scroll-view.js';
	import nsCopyRight from '@/components/ns-copyright/ns-copyright.vue';
	import fenxiaoWords from 'common/js/fenxiao-words.js';
	import globalConfig from '@/common/js/golbalConfig.js';
	import index from '../public/js/index.js'

	export default {
		components: {
			uniGrid,
			uniGridItem,
			diyBottomNav,
			toTop,
			nsCopyRight
		},
		mixins: [scroll, fenxiaoWords, globalConfig, index],
		
	};
</script>

<style lang="scss">
	@import '../public/css/index.scss';

	/deep/.uni-scroll-view::-webkit-scrollbar {
		/* 隐藏滚动条，但依旧具备可以滚动的功能 */
		display: none;
	}
</style>
<style scoped>
	/deep/ .reward-popup .uni-popup__wrapper-box {
		background: none !important;
		max-width: unset !important;
		max-height: unset !important;
	}
</style>
