<template>
	<view>
		<view :class="['search-box','search-box-'+value.searchType]" :style="searchBoxCss">
			<block v-if="[1,2,4].includes(value.searchType)">
				<view class="img" v-if="value.searchType == 2"><image :src="$util.img(value.searchImg)" mode="aspectFit"></image></view>
				<view class="location" @click="$util.redirectTo('/otherpages/index/city/city')" v-if="value.searchType == 3" :style="{color: value.textColor}">
					<text class="iconfont iconzuobiao"></text>
					<text>{{ city }}</text>
				</view>
				<view class="search-content" :style="{ textAlign: value.textAlign, borderRadius: borderRadius }">
					<input
						type="text"
						class="uni-input ns-font-size-base"
						maxlength="50"
						:placeholder="value.title"
						v-model="searchText"
						confirm-type="search"
						@confirm="search()"
						disabled="true"
						@click="search()"
						:placeholderStyle="placeholderStyle"
						:style="{ backgroundColor: value.bgColor }"
					/>
					<text class="iconfont iconsousuo2" @click="search()" :style="{ color: value.textColor ? value.textColor : 'rgba(0,0,0,0)' }"></text>
				</view>
			</block>
			<block v-if="value.searchType == 3"> 
				<view class="search-content" :style="{ textAlign: value.textAlign, borderRadius: borderRadius, backgroundColor: value.bgColor }" @click="search()">
					<text class="iconfont iconsousuo2 search-icon" :style="{ color: value.textColor ? value.textColor : 'rgba(0,0,0,0)' }"></text>
					<input
						type="text"
						class="uni-input ns-font-size-base"
						maxlength="50"
						:placeholder="value.title"
						v-model="searchText"
						confirm-type="search"
						@confirm="search()"
						disabled="true"
						:placeholderStyle="placeholderStyle"
					/>
					<text class="search-btn">搜索</text>
				</view>
				<text class="iconfont iconxiaoxi1 search-info" @click="$util.redirectTo('/otherpages/sitemessage/master/master')" v-if="searchInfoShow"></text>
			</block>
		</view>
		<view class="search-box-fill" :style="{'height': moduleHeight}" v-if="value.searchType == 3 && value.isPosition == 2"></view>
	</view>
</template>

<script>
// 搜索
export default {
	name: 'diy-search',
	props: {
		value: {
			type: Object,
			default: () => {
				return {};
			}
		},
		city: {
			type: String,
			value: ''
		},
		siteId: {
			type: [Number, String],
			default: 0
		},
		redirectUrl: {
			type: [String],
			default: '/otherpages/goods/search/search'
		},
		pageScrollTop:{
			type:[Number,String]
		}
	},
	data() {
		return {
			searchText: '',
			moduleHeight: 0 //组件高度
		};
	},
	created() {
		if (!this.value.searchType) {
			this.value.searchType = 1;
		}
	},
	computed: {
		borderRadius() {
			return this.value.borderType == 1 ? 10 + 'rpx' : 50 + 'rpx';
		},
		placeholderStyle() {
			let str = '';
			if (this.value.textColor) {
				str = 'color:' + this.value.textColor;
			} else {
				str = 'color: rgba(0,0,0,0)';
			}
			return str;
		},
		searchBoxCss(){
			let diyDataGlobal = this.$root.diyData.global,
				html = "";
			// 如果使用背景图片，搜索框背景透明；否则使用配置的背景色
			if (diyDataGlobal.topNavbg) {
				html += `background-color: transparent;`;
			} else if (this.pageScrollTop > 20) {
				html += `background-color: ${diyDataGlobal.topNavColor};`;
			} else {
				html += `background-color: ${this.value.backgroundColor || ''};`;
			}
			if(this.value.searchType == 3 && this.value.isPosition == 2){
				html += 'position: fixed;';
				html += `top: ${this.fixedTop};`;
			}
			return html;
		},
		// 控制fixed定位高度
		fixedTop(){
			let diyPositionObj = this.$store.state.diyIndexPositionObj,
				data = 0;
			// #ifdef H5
			if(diyPositionObj.diySearch){
				data = '0px';
			}
			// #endif
			// #ifdef MP-WEIXIN
			if(diyPositionObj.diySearch && diyPositionObj.nsNavbar){
				diyPositionObj.diySearch.currVal = diyPositionObj.nsNavbar.originalVal;
				data = diyPositionObj.diySearch.currVal + 'px';
			}
			// #endif
			return data;
		},
		searchInfoShow(){
			let bool = false,
				addonIsExit = this.$store.state.addonIsExit;
			if(uni.getStorageSync('token') && addonIsExit?.sitemessage)
				bool = true;
				
			return bool;
			
		}
	},
	mounted() {
		this.setModuleLocatinoFn();
	},
	methods: {
		search() {
			this.$util.redirectTo(this.redirectUrl);
		},
		// 向vuex中的diyIndexPositionObj增加搜索组件定位位置
		setModuleLocatinoFn(){
			if(this.value.searchType == 3 && this.value.isPosition == 2){
				const query = uni.createSelectorQuery().in(this);
				query
					.select('.search-box')
					.boundingClientRect(data => {
						let diySearch = {
							originalVal: data.height || 0, //自身高度
							currVal: 0 //定位高度
						};
						this.moduleHeight = (data.height || 0) + 'px';
						this.$store.commit('setDiyIndexPositionObj', {'diySearch': diySearch});
					})
					.exec();
			}
		}
	}
};
</script>

<style lang="scss">
.search-box {
	position: relative;
	padding: 20rpx 10rpx;
	display: flex;
	align-items: center;
	border-radius: 10rpx;
	.img {
		width: 170rpx;
		height: 60rpx;
		margin-right: 20rpx;
		image {
			width: 100%;
			height: 100%;
		}
	}
	&.search-box-3{
		left: 0;
		right: 0;
		z-index: 9;
		padding: 20rpx 24rpx;
		display: flex;
		align-items: center;
		border-radius: 0;
		.search-content{
			display: flex;
			align-items: center;
			height: 68rpx;
			.search-icon{
				position: initial;
				transform: translateX(0);
				width: auto;
				margin-left: 26rpx;
				margin-right: 14rpx;
			}
			.uni-input{
				flex: 1;
				padding-left: 0;
				height: 68rpx;
			}
			.search-btn{
				margin-right: 8rpx;
				width: 116rpx;
				height: 54rpx;
				line-height: 54rpx;
				text-align: center;
				background-color: #FE3542;
				color: #fff;
				border-radius: 30rpx;
			}
		}
		.search-info{
			font-size: 64rpx;
			margin-left: $font-size-tag;
			color: #fff;
			line-height: 1;
		}
	}
}
.search-box-fill{
	width: 100%;
}
.location {
	height: 80rpx;
	line-height: 80rpx;
	padding-right: 10rpx;
	margin-right: 16rpx;
	font-weight: 600;
}

.location .iconzuobiao {
	display: inline-block;
	margin-right: 10rpx;
	font-weight: bold;
	font-size: $font-size-toolbar;
	color: red;
}

.search-add {
	padding: 0 10rpx;
	display: flex;
	align-items: center;
	margin-right: 20rpx;
	text {
		padding: 0 5rpx;
	}
}

.search-content {
	height: 78rpx;
	border-radius: 40rpx;
	flex: 1;
}

.search-content input {
	box-sizing: border-box;
	display: block;
	height: 77rpx;
	width: 100%;
	padding: 0 20rpx 0 40rpx;
	color: #333333;
	border-radius: 40rpx;
}

.search-content .iconfont {
	position: absolute;
	top: 50%;
	right: 40rpx;
	transform: translateY(-50%);
	font-size: $font-size-toolbar;
	z-index: 10;
	color: #89899a;
	width: 80rpx;
	text-align: center;
	font-size: 30rpx;
}
</style>
