<template>
	<view class="container">
		<!-- 加载提示 -->
		<view v-if="loading" class="loading-container">
			<view class="loading-spinner"></view>
			<text class="loading-text">正在加载智能学习助手...</text>
		</view>
		
		<!-- WebView容器 -->
		<web-view 
			:src="webviewUrl" 
			@message="handleMessage"
			@error="handleError"
			@load="handleLoad"
			class="webview"
			:style="{opacity: loading ? 0 : 1}">
		</web-view>
		
		<!-- 底部工具栏 -->
		<view class="toolbar" v-if="!loading">
			<view class="toolbar-item" @click="refreshWebView">
				<text class="toolbar-icon">🔄</text>
				<text class="toolbar-text">刷新</text>
			</view>
			<view class="toolbar-item" @click="goHome">
				<text class="toolbar-icon">🏠</text>
				<text class="toolbar-text">首页</text>
			</view>
			<view class="toolbar-item" @click="showAbout">
				<text class="toolbar-icon">ℹ️</text>
				<text class="toolbar-text">关于</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				statusBarHeight: 0,
				webviewUrl: '',
				loading: true,
				isTablet: false,
				screenWidth: 0
			}
		},
		onLoad() {
			// 获取系统信息
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight || 0;
			this.screenWidth = systemInfo.screenWidth;
			
			// 判断是否为平板设备
			this.isTablet = this.checkIsTablet(systemInfo);
			
			// 设置WebView URL
			this.setupWebView();
			
			// 设置标题
			uni.setNavigationBarTitle({
				title: '智学宝'
			});
			
			console.log('设备信息:', {
				screenWidth: this.screenWidth,
				isTablet: this.isTablet,
				platform: systemInfo.platform
			});
		},
		onShow() {
			// 页面显示时的处理
			console.log('页面显示');
		},
		methods: {
			setupWebView() {
				// 根据平台设置不同的URL
				// #ifdef APP-PLUS
				// APP中使用本地文件
				this.webviewUrl = '/static/smart-learning-assistant.html';
				// #endif
				
				// #ifdef H5
				// H5中使用相对路径
				this.webviewUrl = '/static/smart-learning-assistant.html';
				// #endif
				
				// #ifdef MP-WEIXIN
				// 小程序中需要配置业务域名，这里使用示例域名
				this.webviewUrl = 'https://your-domain.com/smart-learning-assistant.html';
				// #endif
				
				console.log('WebView URL:', this.webviewUrl);
			},
			
			handleMessage(event) {
				console.log('收到WebView消息:', event.detail.data);
				const data = event.detail.data[0];
				
				// 根据消息类型处理不同的操作
				if (data.type === 'toast') {
					uni.showToast({
						title: data.message,
						icon: data.icon || 'none'
					});
				} else if (data.type === 'share') {
					this.shareContent(data.content);
				} else if (data.type === 'storage') {
					// 处理存储相关操作
					this.handleStorage(data);
				}
			},
			
			handleError(event) {
				console.error('WebView加载错误:', event);
				this.loading = false;
				uni.showModal({
					title: '加载失败',
					content: '页面加载失败，请检查网络连接后重试',
					confirmText: '重试',
					success: (res) => {
						if (res.confirm) {
							this.refreshWebView();
						}
					}
				});
			},
			
			handleLoad(event) {
				console.log('WebView加载完成:', event);
				this.loading = false;
				
				// 向WebView发送初始化消息
				this.sendMessageToWebView({
					type: 'init',
					platform: this.getPlatform(),
					statusBarHeight: this.statusBarHeight
				});
			},
			
			refreshWebView() {
				this.loading = true;
				// 重新设置URL来刷新WebView
				const currentUrl = this.webviewUrl;
				this.webviewUrl = '';
				this.$nextTick(() => {
					this.webviewUrl = currentUrl + '?t=' + Date.now();
				});
			},
			
			goHome() {
				// 发送消息让WebView回到首页
				this.sendMessageToWebView({
					type: 'navigate',
					action: 'home'
				});
			},
			
			showAbout() {
				uni.showModal({
					title: '关于应用',
					content: '智学宝 v1.0.0\n\nAI驱动的智能学习平台，帮助您高效学习各种知识。\n\n© 2024 智学宝团队',
					confirmText: '确定',
					showCancel: false
				});
			},
			
			sendMessageToWebView(data) {
				// 向WebView发送消息的方法
				// 注意：实际发送需要WebView加载完成后才能进行
				console.log('向WebView发送消息:', data);
			},
			
			shareContent(content) {
				// #ifdef APP-PLUS
				// APP中的分享功能
				uni.share({
					provider: 'weixin',
					scene: 'WXSceneSession',
					type: 0,
					href: content.url || '',
					title: content.title || '智学宝',
					summary: content.description || '来自智学宝的分享',
					imageUrl: content.image || '',
					success: function(res) {
						console.log('分享成功');
					},
					fail: function(err) {
						console.log('分享失败:', err);
					}
				});
				// #endif
				
				// #ifdef H5
				// H5中的分享功能
				if (navigator.share) {
					navigator.share({
						title: content.title || '智学宝',
						text: content.description || '来自智学宝的分享',
						url: content.url || window.location.href
					});
				} else {
					// 降级处理：复制到剪贴板
					uni.setClipboardData({
						data: content.url || window.location.href,
						success: function() {
							uni.showToast({
								title: '链接已复制',
								icon: 'success'
							});
						}
					});
				}
				// #endif
			},
			
			handleStorage(data) {
				// 处理存储相关操作
				if (data.action === 'set') {
					uni.setStorageSync(data.key, data.value);
				} else if (data.action === 'get') {
					const value = uni.getStorageSync(data.key);
					this.sendMessageToWebView({
						type: 'storage_result',
						key: data.key,
						value: value
					});
				} else if (data.action === 'remove') {
					uni.removeStorageSync(data.key);
				}
			},
			
			getPlatform() {
				// #ifdef APP-PLUS
				return 'app';
				// #endif
				// #ifdef H5
				return 'h5';
				// #endif
				// #ifdef MP-WEIXIN
				return 'mp-weixin';
				// #endif
				return 'unknown';
			},
			
			checkIsTablet(systemInfo) {
				// 判断是否为平板设备的逻辑
				const { screenWidth, screenHeight, pixelRatio } = systemInfo;
				const minSize = Math.min(screenWidth, screenHeight);
				const maxSize = Math.max(screenWidth, screenHeight);
				
				// 基于屏幕尺寸判断（考虑像素密度）
				const physicalWidth = screenWidth / pixelRatio;
				const physicalHeight = screenHeight / pixelRatio;
				const diagonalInches = Math.sqrt(physicalWidth * physicalWidth + physicalHeight * physicalHeight) / 160;
				
				// 7英寸以上认为是平板
				return diagonalInches >= 7 || screenWidth >= 768;
			}
		},
		
		// 页面生命周期
		onUnload() {
			console.log('页面卸载');
		},
		
		onHide() {
			console.log('页面隐藏');
		}
	}
</script>

<style scoped>
	.container {
		width: 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f8fafc;
	}
	

	.loading-container {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		z-index: 1000;
	}
	
	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #e2e8f0;
		border-top: 4px solid #3b82f6;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 16px;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	.loading-text {
		color: #6b7280;
		font-size: 14px;
	}
	
	.webview {
		flex: 1;
		width: 100%;
		transition: opacity 0.3s ease;
	}
	
	.toolbar {
		display: flex;
		background-color: #ffffff;
		border-top: 1px solid #e5e7eb;
		padding: 8px 0;
		flex-shrink: 0;
	}
	
	.toolbar-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 8px;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}
	
	.toolbar-item:active {
		background-color: #f3f4f6;
	}
	
	.toolbar-icon {
		font-size: 20px;
		margin-bottom: 4px;
	}
	
	.toolbar-text {
		font-size: 12px;
		color: #6b7280;
	}
	
	/* 平板电脑适配 */
	@media (min-width: 768px) {
		.container {
			max-width: 1200px;
			margin: 0 auto;
			box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
		}
		
		.loading-spinner {
			width: 60px;
			height: 60px;
			border-width: 6px;
		}
		
		.loading-text {
			font-size: 16px;
		}
		
		.toolbar {
			padding: 12px 0;
			justify-content: center;
			gap: 40px;
		}
		
		.toolbar-item {
			flex: none;
			min-width: 80px;
			padding: 12px 20px;
			border-radius: 8px;
			transition: all 0.2s ease;
		}
		
		.toolbar-item:hover {
			background-color: #f3f4f6;
			transform: translateY(-2px);
		}
		
		.toolbar-icon {
			font-size: 24px;
			margin-bottom: 6px;
		}
		
		.toolbar-text {
			font-size: 14px;
		}
	}
	
	/* 大屏平板适配 */
	@media (min-width: 1024px) {
		.container {
			max-width: 1400px;
		}
		
		.toolbar {
			padding: 16px 0;
			gap: 60px;
		}
		
		.toolbar-item {
			min-width: 100px;
			padding: 16px 24px;
		}
		
		.toolbar-icon {
			font-size: 28px;
		}
		
		.toolbar-text {
			font-size: 16px;
		}
	}
</style>