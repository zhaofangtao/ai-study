// pages/topics/topics.js
const app = getApp();

Page({
  data: {
    industryList: []
  },

  onLoad() {
    this.initIndustryList();
  },

  onShow() {
    this.initIndustryList();
  },

  // 初始化行业列表
  initIndustryList() {
    const industryTopics = app.globalData.industryTopics;
    const cache = wx.getStorageSync('learning_cache') || {};
    
    const industryList = Object.entries(industryTopics).map(([name, topics]) => ({
      name,
      topics,
      expanded: false
    }));
    
    this.setData({ 
      industryList,
      learningCache: cache
    });
  },

  // 切换行业展开/收起
  toggleIndustry(e) {
    const industryName = e.currentTarget.dataset.industry;
    const industryList = [...this.data.industryList];
    
    const industry = industryList.find(item => item.name === industryName);
    if (industry) {
      industry.expanded = !industry.expanded;
      this.setData({ industryList });
    }
  },

  // 获取缓存状态样式
  getCachedClass(topic) {
    const cache = this.data.learningCache || {};
    return cache[topic] ? 'cached' : '';
  },

  // 选择主题
  selectTopic(e) {
    const topic = e.currentTarget.dataset.topic;
    
    // 检查是否有缓存
    const cache = wx.getStorageSync('learning_cache') || {};
    
    if (cache[topic]) {
      // 有缓存，询问是否加载
      wx.showModal({
        title: '发现学习记录',
        content: `发现"${topic}"的学习记录，是否加载已有的问题？`,
        confirmText: '加载记录',
        cancelText: '重新开始',
        success: (res) => {
          if (res.confirm) {
            this.loadCachedTopic(topic, cache[topic]);
          } else {
            this.startNewTopic(topic);
          }
        }
      });
    } else {
      // 没有缓存，直接开始新主题
      this.startNewTopic(topic);
    }
  },

  // 加载缓存的主题
  loadCachedTopic(topic, data) {
    // 设置全局数据
    app.globalData.currentTopic = topic;
    app.globalData.currentQuestions = data.questions || [];
    
    // 跳转到首页
    wx.switchTab({
      url: '/pages/index/index',
      success: () => {
        // 通过事件通知首页加载缓存数据
        const pages = getCurrentPages();
        const indexPage = pages.find(page => page.route === 'pages/index/index');
        if (indexPage && indexPage.loadCachedData) {
          indexPage.loadCachedData(topic, data);
        }
      }
    });
    
    wx.showToast({
      title: `📖 已加载"${topic}"的缓存记录`,
      icon: 'success'
    });
  },

  // 开始新主题
  startNewTopic(topic) {
    // 跳转到首页并设置主题
    wx.navigateTo({
      url: '/pages/index/index',
      success: () => {
        // 通过事件通知首页设置新主题
        const pages = getCurrentPages();
        const indexPage = pages[pages.length - 1];
        if (indexPage && indexPage.setTopicFromSelection) {
          indexPage.setTopicFromSelection(topic);
        }
      }
    });
    
    wx.showToast({
      title: `已选择主题"${topic}"`,
      icon: 'success'
    });
  }
});