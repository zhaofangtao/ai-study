// pages/settings/settings.js
const app = getApp();

Page({
  data: {
    currentProvider: 'deepseek',
    apiKey: '',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    
    providers: [
      { key: 'deepseek', name: 'DeepSeek (推荐)', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
      { key: 'deepseek-nvidia', name: '🚀 DeepSeek NVIDIA', baseUrl: 'https://integrate.api.nvidia.com/v1', model: 'deepseek-ai/deepseek-r1' },
      { key: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-3.5-turbo' },
      { key: 'kimi', name: 'Kimi', baseUrl: 'https://api.moonshot.cn/v1', model: 'moonshot-v1-8k' },
      { key: 'qwen', name: 'Qwen', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-turbo' }
    ],
    
    // 用户数据
    userTopics: 0,
    usedTopicsCount: 0,
    remainingTopics: 0,
    isTestMode: false,
    
    // 统计数据
    totalCachedTopics: 0,
    totalQuestions: 0,
    totalAnswered: 0,
    totalHistoryRecords: 0
  },

  onLoad() {
    this.loadConfig();
    this.loadUserData();
    this.loadStatistics();
  },

  onShow() {
    this.loadUserData();
    this.loadStatistics();
  },

  // 加载配置
  loadConfig() {
    const config = app.globalData.apiConfig;
    if (config) {
      this.setData({
        currentProvider: config.provider || 'deepseek',
        apiKey: config.apiKey || '',
        baseUrl: config.baseUrl || 'https://api.deepseek.com/v1',
        model: config.model || 'deepseek-chat'
      });
    }
  },

  // 加载用户数据
  loadUserData() {
    const userTopics = app.globalData.userTopics || 0;
    const usedTopics = app.globalData.usedTopics || [];
    const isTestMode = app.globalData.isTestMode || false;
    
    this.setData({
      userTopics: userTopics,
      usedTopicsCount: usedTopics.length,
      remainingTopics: userTopics === -1 ? '无限' : Math.max(0, userTopics - usedTopics.length),
      isTestMode: isTestMode
    });
  },

  // 加载统计数据
  loadStatistics() {
    const cache = wx.getStorageSync('learning_cache') || {};
    const history = wx.getStorageSync('qa_history') || [];
    
    let totalQuestions = 0;
    let totalAnswered = 0;
    
    Object.values(cache).forEach(data => {
      if (data.questions) {
        totalQuestions += data.questions.length;
        totalAnswered += data.questions.filter(q => q.answer).length;
      }
    });
    
    this.setData({
      totalCachedTopics: Object.keys(cache).length,
      totalQuestions,
      totalAnswered,
      totalHistoryRecords: history.length
    });
  },

  // 选择提供商
  selectProvider(e) {
    const provider = e.currentTarget.dataset.provider;
    const providerConfig = this.data.providers.find(p => p.key === provider);
    
    this.setData({
      currentProvider: provider,
      baseUrl: providerConfig.baseUrl,
      model: providerConfig.model
    });
  },

  // 输入API密钥
  onApiKeyInput(e) {
    this.setData({
      apiKey: e.detail.value
    });
  },

  // 输入基础URL
  onBaseUrlInput(e) {
    this.setData({
      baseUrl: e.detail.value
    });
  },

  // 输入模型名称
  onModelInput(e) {
    this.setData({
      model: e.detail.value
    });
  },

  // 测试API
  async testAPI() {
    const { apiKey, baseUrl, model, currentProvider } = this.data;
    
    if (!apiKey.trim()) {
      wx.showToast({ title: '请先输入API密钥', icon: 'error' });
      return;
    }
    
    wx.showLoading({ title: '正在测试API连接...' });
    
    try {
      const headers = { 'Content-Type': 'application/json' };
      
      if (currentProvider === 'openai' || currentProvider === 'deepseek') {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      const requestBody = {
        model: model,
        messages: [{ role: 'user', content: '你好，请回复"连接成功"' }],
        temperature: 0.7,
        max_tokens: 100
      };
      
      const result = await this.makeRequest(`${baseUrl}/chat/completions`, {
        method: 'POST',
        header: headers,
        data: requestBody
      });
      
      if (result.statusCode === 200) {
        let response = result.data.choices[0]?.message?.content || '';
        
        if (response.length > 0) {
          wx.hideLoading();
          wx.showModal({
            title: '测试成功',
            content: `🎉 ${currentProvider.toUpperCase()} API连接测试成功！\n\n响应内容：${response}`,
            showCancel: false,
            confirmText: '确定'
          });
        } else {
          throw new Error('API响应为空');
        }
      } else {
        throw new Error(`HTTP ${result.statusCode}: ${result.data.error?.message || '请求失败'}`);
      }
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ 
        title: `API连接失败: ${error.message}`, 
        icon: 'error',
        duration: 3000
      });
    }
  },

  // 保存配置
  saveConfig() {
    const { currentProvider, apiKey, baseUrl, model } = this.data;
    
    if (!apiKey.trim()) {
      wx.showToast({ title: '请输入API密钥', icon: 'error' });
      return;
    }
    
    const config = {
      provider: currentProvider,
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
      model: model.trim()
    };
    
    app.saveApiConfig(config);
    wx.showToast({ title: '配置保存成功！', icon: 'success' });
  },

  // 切换测试模式
  toggleTestMode() {
    app.globalData.isTestMode = !app.globalData.isTestMode;
    
    if (app.globalData.isTestMode) {
      // 切换到测试模式时，重置测试数据
      app.globalData.userTopics = 0;
      app.globalData.usedTopics = [];
      app.saveUserData();
      
      wx.showToast({ title: '已切换到测试付费模式，测试数据已重置', icon: 'success' });
    } else {
      wx.showToast({ title: '已切换回正常模式', icon: 'success' });
    }
    
    this.loadUserData();
  },

  // 重置用户数据
  resetUserData() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置用户数据吗？这将清空您的主题额度和使用记录。',
      confirmText: '确认重置',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          app.globalData.userTopics = 0;
          app.globalData.usedTopics = [];
          app.saveUserData();
          
          this.loadUserData();
          wx.showToast({ title: '用户数据已重置', icon: 'success' });
        }
      }
    });
  },

  // 清空学习缓存
  clearLearningCache() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有学习缓存吗？这将删除所有保存的学习主题和问题。',
      confirmText: '确认清空',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('learning_cache');
          app.globalData.learningCache = {};
          
          this.loadStatistics();
          wx.showToast({ title: '学习缓存已清空', icon: 'success' });
        }
      }
    });
  },

  // 清空问答历史
  clearQAHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有问答历史吗？这将删除所有保存的问答记录。',
      confirmText: '确认清空',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('qa_history');
          app.globalData.qaHistory = [];
          
          this.loadStatistics();
          wx.showToast({ title: '问答历史已清空', icon: 'success' });
        }
      }
    });
  },

  // 导出所有数据
  exportAllData() {
    const cache = wx.getStorageSync('learning_cache') || {};
    const history = wx.getStorageSync('qa_history') || [];
    const usedOrders = wx.getStorageSync('used_orders') || [];
    const paymentHistory = wx.getStorageSync('payment_history') || [];
    
    const exportData = {
      version: '1.0',
      exportTime: new Date().toISOString(),
      apiConfig: app.globalData.apiConfig,
      userTopics: app.globalData.userTopics,
      usedTopics: app.globalData.usedTopics,
      isTestMode: app.globalData.isTestMode,
      learningCache: cache,
      qaHistory: history,
      usedOrders: usedOrders,
      paymentHistory: paymentHistory
    };
    
    wx.setClipboardData({
      data: JSON.stringify(exportData, null, 2),
      success: () => {
        wx.showToast({ 
          title: '所有数据已复制到剪贴板', 
          icon: 'success',
          duration: 3000
        });
      }
    });
  },

  // 导入数据
  importData() {
    wx.showModal({
      title: '导入数据',
      content: '请先将导出的数据复制到剪贴板，然后点击确认导入。',
      success: (res) => {
        if (res.confirm) {
          wx.getClipboardData({
            success: (clipRes) => {
              try {
                const importData = JSON.parse(clipRes.data);
                
                // 验证数据格式
                if (!importData.version || !importData.exportTime) {
                  throw new Error('数据格式不正确');
                }
                
                // 导入数据
                if (importData.apiConfig) {
                  app.saveApiConfig(importData.apiConfig);
                }
                
                if (importData.userTopics !== undefined) {
                  app.globalData.userTopics = importData.userTopics;
                }
                
                if (importData.usedTopics) {
                  app.globalData.usedTopics = importData.usedTopics;
                }
                
                if (importData.isTestMode !== undefined) {
                  app.globalData.isTestMode = importData.isTestMode;
                }
                
                if (importData.learningCache) {
                  wx.setStorageSync('learning_cache', importData.learningCache);
                  app.globalData.learningCache = importData.learningCache;
                }
                
                if (importData.qaHistory) {
                  wx.setStorageSync('qa_history', importData.qaHistory);
                  app.globalData.qaHistory = importData.qaHistory;
                }
                
                if (importData.usedOrders) {
                  wx.setStorageSync('used_orders', importData.usedOrders);
                }
                
                if (importData.paymentHistory) {
                  wx.setStorageSync('payment_history', importData.paymentHistory);
                }
                
                app.saveUserData();
                
                // 刷新页面数据
                this.loadConfig();
                this.loadUserData();
                this.loadStatistics();
                
                wx.showToast({ 
                  title: '数据导入成功！', 
                  icon: 'success',
                  duration: 3000
                });
                
              } catch (error) {
                wx.showToast({ 
                  title: '数据导入失败：' + error.message, 
                  icon: 'error',
                  duration: 3000
                });
              }
            },
            fail: () => {
              wx.showToast({ title: '获取剪贴板数据失败', icon: 'error' });
            }
          });
        }
      }
    });
  },

  // 发起网络请求
  makeRequest(url, options) {
    return new Promise((resolve, reject) => {
      wx.request({
        url,
        ...options,
        success: resolve,
        fail: reject
      });
    });
  }
});