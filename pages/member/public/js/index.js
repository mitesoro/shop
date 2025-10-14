export default {
	data() {
		return {
			token: '',
			memberInfo: {
				balance: 0,
				balance_money: 0,
				point: 0
			},
			couponNum: {
				'platform_num' : 0,
				'coupon_num' : 0
			},
			orderNum: {
				waitPay: 0, //待付款
				readyDelivery: 0, //待发货
				waitDelivery: 0, //待收货
				waitEvaluate: 0, // 待评价
				refunding: 0 // 退款中
			},
			isVerification: true,
			copyrightLoad: 0,
			bottom_info: {},
			authInfo: {
				is_verifier: false
			},
			perMessageCount: '',//信息数量
			shopTop: false,
			scrollTop: 0,
			shopConfig: null,
			promoterInfo: null,
			withdrawConfig: null,
			fenxiaoBasicsConfig: null,
			defaultInfo: {
				topStyle: 'default',
				bgColor: '#ff454f',
				textColor: '#fff',
				bgImg: '',
				menuList: [],
				insertGap: '0',
				menuStyle: 'palace',
				level: 1
			},
			signState: 1, // 签到是否开启
			evaluateConfig: {
				evaluate_audit: 1,
				evaluate_show: 0,
				evaluate_status: 1
			},
			avatarUrl: '', // 头像预览
			headImg: '', // 头像保存
			nickName: '',
			isDisabled:false
		};
	},
	onLoad(data) {
		uni.hideTabBar();
		if (this.addonIsExit.memberwithdraw) {
			this.getWithdrawConfig();
		}
		if (this.addonIsExit.fenxiao) {
			this.getFenxiaoBasicsConfig();
		}
		this.getEvaluateConfig();
		
		if (data.code) {
			this.$api.sendRequest({
				url: '/wechat/api/wechat/authcodetoopenid',
				data: {
					code: data.code
				},
				success: res => {
					if (res.code >= 0) {
						if (res.data.userinfo.nickName) this.modifyNickname(res.data.userinfo.nickName);
						if (res.data.userinfo.avatarUrl) this.modifyHeadimg(res.data.userinfo.avatarUrl);
					}
				}
			});
		}
	},
	computed: {
		storeToken() {
			return this.$store.state.token;
		},
		defaultBgColor() {
			var val = '';
			if (this.defaultInfo.topStyle != 'default') {
				val = 'background:' + this.defaultInfo.bgColor;
			}
			return val;
		},
		defaultBgImg() {
			var defaultImg = '';
			if (this.defaultInfo.topStyle != 'default') {
				defaultImg = this.defaultInfo.bgImg ? this.$util.img(this.defaultInfo.bgImg) : '';
			} else {
				defaultImg = this.$util.img('upload/uniapp/member/index/member_bg.png');
			}
			return defaultImg;
		},
		defaultTextColor() {
			var textColor = '';
			if (this.defaultInfo.topStyle != 'default') {
				textColor = 'color:' + this.defaultInfo.textColor + ' !important';
			}
			return textColor;
		}
	},
	watch: {
		storeToken: async function(nVal, oVal) {
			if (this.addonIsExit.membersignin) {
				await this.getSignState();
			}
			await this.getMemberInfo();
			this.getOrderNum();
			this.getCouponNum();
			
			this.checkIsVerifier();
		}
	},
	async onReady() {
		if (this.addonIsExit.membersignin) {
			await this.getSignState();
		}
		await this.getDefaultInfo();
		if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
	},
	async onShow() {
		// 刷新多语言
		this.$langConfig.refresh();
		this.$store.dispatch('getAddonIsexit').then(data => {
			if (!data.sitemessage) {
				// this.$util.showToast({
				// 	title: '站内信未开启',
				// 	mask: true
				// });
				// setTimeout(() => {
				// 	this.$util.redirectTo('/pages/index/index/index', {}, 'redirectTo');
				// }, 1000);
			}
		});
		this.token = uni.getStorageSync('token');
	
		if (uni.getStorageSync('userInfo')) {
			this.memberInfo = uni.getStorageSync('userInfo');
		}
	
		if (uni.getStorageSync('authInfo')) {
			this.authInfo = uni.getStorageSync('authInfo');
		}
	
		if (this.token) {
			if (this.addonIsExit.membersignin) {
				await this.getSignState();
			}
			await this.getMemberInfo();
			this.getOrderNum();
			this.getCouponNum();
			this.checkIsVerifier();
			if(this.addonIsExit.sitemessage) {
				this.getPerMessageCount();
			}
			// if (this.addonIsExit.memberwithdraw) {
			// 	this.getWithdrawConfig();
			// }
			// if (this.addonIsExit.fenxiao) {
			// 	this.getFenxiaoBasicsConfig();
			// }
		} else {
			this.initInfo();
		}
		this.$forceUpdate();
	},
	methods: {
		// 签到是否开启
		async getSignState() {
			var res = await this.$api.sendRequest({
				url: '/api/membersignin/getSignStatus',
				async: false
			});
			if (res.code == 0) {
				this.signState = res.data.is_use;
			}
		},
		async getDefaultInfo() {
			var res = await this.$api.sendRequest({
				url: '/api/diyview/memberindex',
				async: false
			});
			if (res.code == 0) {
				this.defaultInfo.topStyle = res.data.topStyle;
				this.defaultInfo.bgColor = res.data.bgColor;
				this.defaultInfo.textColor = res.data.textColor;
				this.defaultInfo.bgImg = res.data.bgImg;
				this.defaultInfo.menuStyle = res.data.menuStyle;
				this.defaultInfo.menuList = res.data.menuList;
				this.defaultInfo.insertGap = res.data.insertGap;
				this.defaultInfo.level = res.data.level || 1;
			}
		},
		redirectToLink(url) {
			if (!uni.getStorageSync('token')) {
				this.$refs.login.open(url);
			} else {
				this.$util.redirectTo(url);
			}
		},
		initInfo() {
			this.token = '';
			this.memberInfo = {
				balance: '0.00',
				balance_money: '0.00',
				point: 0
			};
			// this.couponNum = 0;
			this.orderNum = {
				waitPay: 0, //待付款
				readyDelivery: 0, //待发货
				waitDelivery: 0, //待收货
				waitEvaluate: 0, // 待评价
				refunding: 0 // 退款中
			};
			this.authInfo = {
				is_verifier: false
			};
			uni.stopPullDownRefresh();
		},
		// 获取会员基础信息
		async getMemberInfo() {
			let res = await this.$api.sendRequest({
				url: '/api/member/info',
				async: false
			});
			if (res.code >= 0 && res.data) {
				this.token = uni.getStorageSync('token');
				this.memberInfo = res.data;
				this.headImg = this.memberInfo.headimg;
				this.nickName = this.memberInfo.nickname;
				this.avatarUrl = this.headImg ? this.$util.img(this.headImg) : this.$util.getDefaultImage().default_headimg;
				uni.setStorageSync('userInfo', this.memberInfo);
			} else {
				this.token = '';
				this.initInfo();
				uni.removeStorageSync('token');
				uni.removeStorageSync('userInfo');
			}
			uni.stopPullDownRefresh();
		},
		// 下拉刷新
		onPullDownRefresh() {
			if (uni.getStorageSync('token')) this.getMemberInfo();
			else this.initInfo();
		},
		// 信息数量
		getPerMessageCount() {
			this.$api.sendRequest({
				url: '/sitemessage/api/sitemessage/getpermessagecount',
				data: {
					// site_id:
					// sub_type:
				},
				success: res => {
					if (res.code == 0) {
					this.perMessageCount = res.data.count
					}
				}
			});
		},
		// 订单数量
		getOrderNum() {
			this.$api.sendRequest({
				url: '/api/order/num',
				data: {
					order_status: 'waitpay,waitsend,waitconfirm,waitrate,refunding'
				},
				success: res => {
					if (res.code == 0) {
						this.orderNum.waitPay = res.data.waitpay;
						this.orderNum.readyDelivery = res.data.waitsend;
						this.orderNum.waitDelivery = res.data.waitconfirm;
						this.orderNum.waitEvaluate = res.data.waitrate;
						this.orderNum.refunding = res.data.refunding;
					}
					if (this.$refs.loadingCover) this.$refs.loadingCover.hide();
				}
			});
		},
		// 优惠券数量
		getCouponNum() {
			this.$api.sendRequest({
				url: '/api/member/couponnum',
				success: res => {
					if (res.code == 0) {
						this.couponNum = res.data;
					}
				}
			});
		},
		checkIsVerifier() {
			this.$api.sendRequest({
				url: '/api/verify/checkisverifier',
				success: res => {
					this.authInfo.is_verifier = res.code == 0;
					uni.setStorageSync('authInfo', this.authInfo);
					this.$forceUpdate();
				}
			});
		},
		jumpLevel() {
			if (uni.getStorageSync('token')) {
				this.$util.redirectTo('/otherpages/member/level/level');
			} else {
				this.$refs.login.open('/pages/member/index/index');
			}
		},
		/**
		 * 获取余额提现配置
		 */
		getWithdrawConfig() {
			this.$api.sendRequest({
				url: '/api/memberwithdraw/config',
				success: res => {
					if (res.code >= 0 && res.data) {
						this.withdrawConfig = res.data;
						this.$forceUpdate();
					}
				}
			});
		},
		/**
		 * 获取分销基本配置
		 */
		getFenxiaoBasicsConfig() {
			this.$api.sendRequest({
				url: '/fenxiao/api/config/basics',
				success: res => {
					if (res.code >= 0) {
						this.fenxiaoBasicsConfig = res.data;
						this.$forceUpdate();
					}
				}
			});
		},
		getEvaluateConfig() {
			this.$api.sendRequest({
				url: '/api/goodsevaluate/config',
				success: res => {
					if (res.code == 0) {
						var data = res.data;
						this.evaluateConfig = data;
					}
				}
			});
		},
		menuIsShow(data) {
			switch (data.tag) {
				case 'fenxiao':
					return this.addonIsExit.fenxiao == 1 && this.fenxiaoBasicsConfig && this.fenxiaoBasicsConfig.level > 0 && this.fenxiaoBasicsConfig.is_apply;
					break;
				case 'memberwithdraw':
					return this.withdrawConfig && this.withdrawConfig.is_use == 1;
					break;
				case 'membersignin':
					return this.signState == 1;
					break;
				case 'verifier':
					return this.authInfo.is_verifier;
					break;
				default:
					return true;
			}
		},
		getWxAuth(){
			// #ifdef MP-WEIXIN
			this.openCompleteInfoPop();
			// #endif
			
			// #ifdef H5
			if (this.$util.isWeiXin()) {
				this.$api.sendRequest({
					url: '/wechat/api/wechat/authcode',
					data: {
						scopes: 'snsapi_userinfo',
						redirect_url: this.$config.h5Domain + '/pages/member/index/index'
					},
					success: res => {
						if (res.code >= 0) {
							location.href = res.data;
						}
					}
				});
			}
			// #endif
		},
		/**
		 * 修改昵称
		 * @param {Object} nickName
		 */
		modifyNickname(nickName) {
			this.$api.sendRequest({
				url: '/api/member/modifynickname',
				data: {
					nickname: nickName
				},
				success: res => {
					if (res.code == 0) this.memberInfo.nickname = nickName;
				}
			});
		},
		/**
		 * 修改头像
		 */
		modifyHeadimg(headimg) {
			this.$api.sendRequest({
				url: '/api/member/modifyheadimg',
				data: {
					headimg: headimg
				},
				success: res => {
					if (res.code == 0) this.memberInfo.headimg = headimg;
				}
			});
		},
		openCompleteInfoPop() {
			this.$refs.completeInfoPopup.open();
		},
		saveCompleteInfo() {
			if (this.nickName.length == 0) {
				this.$util.showToast({
					title: '请输入昵称'
				});
				return;
			}
		
			this.modifyNickname(this.nickName);
			this.modifyHeadimg(this.headImg);
			this.$refs.completeInfoPopup.close();
		},
		cancelCompleteInfo() {
			this.$refs.completeInfoPopup.close();
		},
		blurNickName(e) {
			if (e.detail.value) this.nickName = e.detail.value;
		},
		onChooseAvatar(e) {
			this.avatarUrl = e.detail.avatarUrl;
			uni.getFileSystemManager().readFile({
				filePath: this.avatarUrl, //选择图片返回的相对路径
				encoding: 'base64', //编码格式
				success: res => {
					let base64 = 'data:image/jpeg;base64,' + res.data; //不加上这串字符，在页面无法显示的哦
					this.myUpload(base64);
				}
			});
		},
		//上传返回图片
		myUpload(base64) {
			let app_type = 'h5';
			let app_type_name = 'H5';
		
			// #ifdef MP
			app_type = 'weapp';
			app_type_name = 'weapp';
			// #endif
			uni.request({
				url: this.$config.baseUrl + '/api/upload/headimgBase64',
				method: 'POST',
				data: {
					app_type: app_type,
					app_type_name: app_type_name,
					images: base64
				},
				header: {
					'content-type': 'application/x-www-form-urlencoded;application/json'
				},
				dataType: 'json',
				responseType: 'text',
				success: res => {
					if (res.data.code == 0) {
						this.headImg = res.data.data.pic_path;
					} else {
						this.$util.showToast({
							title: res.message
						});
					}
				},
				fail: () => {
					this.$util.showToast({
						title: '上传失败'
					});
				}
			});
		}
	}
}