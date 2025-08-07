// pages/webview/webview.js
Page({
  data: {
    webUrl: ''
  },

  onLoad(options) {
    console.log('WebView页面加载，参数:', options);
    
    // 安全处理options参数，防止undefined错误
    const safeOptions = options || {};
    const page = safeOptions.page || 'index';
    
    // 本地开发时使用本地服务器（需要启动本地服务）
    // 生产环境需要部署到HTTPS域名
    const isDev = true; // 开发时设置为true
    const baseUrl = isDev ? 'http://localhost:8080' : 'https://your-domain.com'; // 替换为你的域名
    
    // 测试模式：先加载简单测试页面
    const isTest = true; // 设为false加载完整功能页面
    
    let webUrl = '';
    let pageTitle = '智能学习助手';
    
    if (isTest) {
      // 测试模式：加载简单测试页面
      webUrl = `${baseUrl}/test.html`;
      pageTitle = 'WebView测试';
    } else {
      // 正常模式：加载完整功能页面
      switch (page) {
        case 'index':
          webUrl = `${baseUrl}/web/智能学习助手-小程序版.html`;
          pageTitle = '智能学习助手 - Web版';
          break;
        case 'special':
          webUrl = `${baseUrl}/智能学习助手-特殊版.html`;
          pageTitle = '智能学习助手 - 特殊版';
          break;
        default:
          webUrl = `${baseUrl}/web/智能学习助手-小程序版.html`;
          pageTitle = '智能学习助手 - Web版';
      }
    }
    
    console.log('WebView URL:', webUrl);
    
    this.setData({
      webUrl: webUrl
    });
    
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: pageTitle
    });
    
    // 显示加载提示
    wx.showLoading({
      title: '正在加载Web版本...',
      mask: true
    });
  },

  onReady() {
    console.log('WebView页面准备完成');
  },

  onWebViewLoad(e) {
    console.log('WebView加载完成:', e);
    wx.hideLoading();
    wx.showToast({
      title: 'Web版本加载成功！',
      icon: 'success',
      duration: 2000
    });
  },

  onError(e) {
    console.error('WebView加载错误:', e);
    wx.hideLoading();
    
    wx.showModal({
      title: 'Web版本加载失败',
      content: `加载失败，可能的原因：
1. 网络连接问题
2. 域名未配置或无法访问
3. HTML文件未部署

请检查网络连接或联系技术支持。`,
      confirmText: '重试',
      cancelText: '返回',
      success: (res) => {
        if (res.confirm) {
          // 重新加载
          this.onLoad({ page: 'index' });
        } else {
          // 返回上一页
          wx.navigateBack();
        }
      }
    });
  },

  onMessage(e) {
    console.log('收到WebView消息:', e.detail.data);
    // 可以处理来自HTML页面的消息
  },

  onShareAppMessage() {
    return {
      title: '智能学习助手',
      path: '/pages/webview/webview'
    };
  }
});