// 本地存储服务 - 处理数据持久化
import { STORAGE_KEYS, API_PROVIDERS } from '../config/constants.js';

export class StorageService {
  // 通用存储方法（适配小程序和APP）
  static async setItem(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      
      // 微信小程序环境
      if (typeof wx !== 'undefined' && wx.setStorageSync) {
        wx.setStorageSync(key, jsonValue);
        return;
      }
      
      // React Native环境
      if (typeof AsyncStorage !== 'undefined') {
        await AsyncStorage.setItem(key, jsonValue);
        return;
      }
      
      // Web环境
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, jsonValue);
        return;
      }
      
      throw new Error('不支持的存储环境');
    } catch (error) {
      console.error('存储数据失败:', error);
      throw error;
    }
  }

  static async getItem(key) {
    try {
      let jsonValue = null;
      
      // 微信小程序环境
      if (typeof wx !== 'undefined' && wx.getStorageSync) {
        jsonValue = wx.getStorageSync(key);
      }
      // React Native环境
      else if (typeof AsyncStorage !== 'undefined') {
        jsonValue = await AsyncStorage.getItem(key);
      }
      // Web环境
      else if (typeof localStorage !== 'undefined') {
        jsonValue = localStorage.getItem(key);
      }
      
      return jsonValue ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('读取数据失败:', error);
      return null;
    }
  }

  static async removeItem(key) {
    try {
      // 微信小程序环境
      if (typeof wx !== 'undefined' && wx.removeStorageSync) {
        wx.removeStorageSync(key);
        return;
      }
      
      // React Native环境
      if (typeof AsyncStorage !== 'undefined') {
        await AsyncStorage.removeItem(key);
        return;
      }
      
      // Web环境
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(key);
        return;
      }
    } catch (error) {
      console.error('删除数据失败:', error);
    }
  }

  // API配置管理
  static async getApiConfig() {
    const config = await this.getItem(STORAGE_KEYS.API_CONFIG);
    return config || {
      provider: 'deepseek-nvidia',
      apiKey: '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',
      baseUrl: API_PROVIDERS.DEEPSEEK_NVIDIA.baseUrl,
      model: API_PROVIDERS.DEEPSEEK_NVIDIA.model
    };
  }

  static async setApiConfig(config) {
    await this.setItem(STORAGE_KEYS.API_CONFIG, config);
  }

  // 学习历史管理
  static async getLearningHistory() {
    const history = await this.getItem(STORAGE_KEYS.LEARNING_HISTORY);
    return history || [];
  }

  static async addLearningHistory(session) {
    const history = await this.getLearningHistory();
    const newSession = {
      id: Date.now(),
      topic: session.topic,
      timestamp: new Date().toISOString(),
      questionsCount: session.questions?.length || 0,
      answeredCount: session.questions?.filter(q => q.answered).length || 0
    };
    
    history.unshift(newSession);
    
    // 保持最近50条记录
    if (history.length > 50) {
      history.splice(50);
    }
    
    await this.setItem(STORAGE_KEYS.LEARNING_HISTORY, history);
    return newSession;
  }

  static async removeLearningHistory(sessionId) {
    const history = await this.getLearningHistory();
    const filtered = history.filter(item => item.id !== sessionId);
    await this.setItem(STORAGE_KEYS.LEARNING_HISTORY, filtered);
  }

  static async clearLearningHistory() {
    await this.removeItem(STORAGE_KEYS.LEARNING_HISTORY);
  }

  // 收藏夹管理
  static async getFavorites() {
    const favorites = await this.getItem(STORAGE_KEYS.FAVORITES);
    return favorites || [];
  }

  static async addFavorite(question) {
    const favorites = await this.getFavorites();
    const favorite = {
      id: Date.now(),
      question: question.question,
      category: question.category,
      topic: question.topic || '',
      timestamp: new Date().toISOString(),
      answer: question.answer || ''
    };
    
    favorites.unshift(favorite);
    await this.setItem(STORAGE_KEYS.FAVORITES, favorites);
    return favorite;
  }

  static async removeFavorite(favoriteId) {
    const favorites = await this.getFavorites();
    const filtered = favorites.filter(item => item.id !== favoriteId);
    await this.setItem(STORAGE_KEYS.FAVORITES, filtered);
  }

  static async clearFavorites() {
    await this.removeItem(STORAGE_KEYS.FAVORITES);
  }

  // 当前会话管理
  static async getCurrentSession() {
    return await this.getItem(STORAGE_KEYS.CURRENT_SESSION);
  }

  static async setCurrentSession(session) {
    await this.setItem(STORAGE_KEYS.CURRENT_SESSION, session);
  }

  static async clearCurrentSession() {
    await this.removeItem(STORAGE_KEYS.CURRENT_SESSION);
  }

  // 用户偏好设置
  static async getUserPreferences() {
    const preferences = await this.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return preferences || {
      questionCount: 12,
      autoSave: true,
      theme: 'light',
      language: 'zh-CN'
    };
  }

  static async setUserPreferences(preferences) {
    await this.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  // 数据导出
  static async exportData() {
    const data = {
      apiConfig: await this.getApiConfig(),
      learningHistory: await this.getLearningHistory(),
      favorites: await this.getFavorites(),
      userPreferences: await this.getUserPreferences(),
      exportTime: new Date().toISOString()
    };
    
    // 移除敏感信息
    if (data.apiConfig) {
      data.apiConfig.apiKey = '***';
    }
    
    return data;
  }

  // 数据导入
  static async importData(data) {
    try {
      if (data.learningHistory) {
        await this.setItem(STORAGE_KEYS.LEARNING_HISTORY, data.learningHistory);
      }
      if (data.favorites) {
        await this.setItem(STORAGE_KEYS.FAVORITES, data.favorites);
      }
      if (data.userPreferences) {
        await this.setItem(STORAGE_KEYS.USER_PREFERENCES, data.userPreferences);
      }
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }
}