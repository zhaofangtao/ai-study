// pages/history/history.js
const app = getApp();

Page({
  data: {
    cacheList: [],
    historyList: []
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  // 加载数据
  loadData() {
    this.loadCacheList();
    this.loadHistoryList();
  },

  // 加载缓存列表
  loadCacheList() {
    const cache = wx.getStorageSync('learning_cache') || {};
    
    const cacheList = Object.entries(cache).map(([topic, data]) => ({
      topic,
      questionCount: data.questions?.length || 0,
      answeredCount: data.questions?.filter(q => q.answer).length || 0,
      lastUpdated: this.formatDate(data.lastUpdated)
    }));
    
    this.setData({ cacheList });
  },

  // 加载历史列表
  loadHistoryList() {
    const history = wx.getStorageSync('qa_history') || [];
    
    const historyList = history.slice().reverse().map((item, index) => ({
      ...item,
      showAnswer: false,
      formattedAnswer: this.formatAnswer(item.answer),
      formattedTime: this.formatDate(item.timestamp)
    }));
    
    this.setData({ historyList });
  },

  // 格式化日期
  formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // 小于1小时
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes < 1 ? '刚刚' : `${minutes}分钟前`;
    }
    
    // 小于1天
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}小时前`;
    }
    
    // 小于7天
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}天前`;
    }
    
    // 超过7天显示具体日期
    return date.toLocaleDateString();
  },

  // 格式化答案
  formatAnswer(answer) {
    if (!answer) return '';
    
    return answer
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  },

  // 切换历史答案显示
  toggleHistoryAnswer(e) {
    const index = e.currentTarget.dataset.index;
    const historyList = [...this.data.historyList];
    
    if (historyList[index]) {
      historyList[index].showAnswer = !historyList[index].showAnswer;
      this.setData({ historyList });
    }
  },

  // 加载缓存主题
  loadCachedTopic(e) {
    const topic = e.currentTarget.dataset.topic;
    const cache = wx.getStorageSync('learning_cache') || {};
    const data = cache[topic];
    
    if (!data) {
      wx.showToast({ title: '缓存数据不存在', icon: 'error' });
      return;
    }
    
    // 设置全局数据
    app.globalData.currentTopic = topic;
    app.globalData.currentQuestions = data.questions || [];
    app.globalData.loadFromHistory = true;
    
    // 跳转到首页
    wx.navigateTo({
      url: '/pages/index/index'
    });
    
    // 静默加载，不显示提示
  },

  // 删除缓存主题
  deleteCachedTopic(e) {
    const topic = e.currentTarget.dataset.topic;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除"${topic}"的学习记录吗？`,
      success: (res) => {
        if (res.confirm) {
          const cache = wx.getStorageSync('learning_cache') || {};
          delete cache[topic];
          wx.setStorageSync('learning_cache', cache);
          
          this.loadCacheList();
          wx.showToast({ title: `已删除"${topic}"的学习记录`, icon: 'success' });
        }
      }
    });
  },

  // 显示随机主题
  showRandomTopic() {
    const topics = Object.values(app.globalData.industryTopics).flat();
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    
    wx.showModal({
      title: '随机主题',
      content: `为您推荐学习主题：${randomTopic}`,
      confirmText: '开始学习',
      cancelText: '重新随机',
      success: (res) => {
        if (res.confirm) {
          // 跳转到首页并设置主题
          wx.switchTab({
            url: '/pages/index/index',
            success: () => {
              // 通过全局数据传递主题
              app.globalData.pendingTopic = randomTopic;
            }
          });
        } else {
          // 重新随机
          this.showRandomTopic();
        }
      }
    });
  },

  // 导出学习数据
  exportLearningData() {
    const cache = wx.getStorageSync('learning_cache') || {};
    const history = wx.getStorageSync('qa_history') || [];
    
    const exportData = {
      learningCache: cache,
      qaHistory: history,
      userTopics: app.globalData.userTopics,
      usedTopics: app.globalData.usedTopics,
      exportTime: new Date().toISOString(),
      version: '1.0'
    };
    
    wx.setClipboardData({
      data: JSON.stringify(exportData, null, 2),
      success: () => {
        wx.showToast({ 
          title: '学习数据已复制到剪贴板', 
          icon: 'success',
          duration: 3000
        });
      }
    });
  },

  // 清空所有数据
  clearAllData() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有学习数据吗？此操作不可恢复！',
      confirmText: '确认清空',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          // 清空所有存储数据
          wx.removeStorageSync('learning_cache');
          wx.removeStorageSync('qa_history');
          wx.removeStorageSync('used_orders');
          wx.removeStorageSync('payment_history');
          
          // 重置全局数据
          app.globalData.learningCache = {};
          app.globalData.qaHistory = [];
          app.globalData.currentQuestions = [];
          app.globalData.currentTopic = '';
          
          // 刷新页面数据
          this.setData({
            cacheList: [],
            historyList: []
          });
          
          wx.showToast({ 
            title: '所有学习数据已清空', 
            icon: 'success' 
          });
        }
      }
    });
  }
});