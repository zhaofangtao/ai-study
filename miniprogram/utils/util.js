// utils/util.js - 通用工具函数

/**
 * 格式化时间
 */
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 格式化相对时间
 */
const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚';
  }
  
  // 小于1小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}分钟前`;
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
}

/**
 * 格式化Markdown文本为富文本
 */
const formatMarkdown = (text) => {
  if (!text) return '';
  
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br/>');
}

/**
 * 防抖函数
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 */
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

/**
 * 深拷贝对象
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * 生成随机ID
 */
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 验证邮箱格式
 */
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * 验证手机号格式
 */
const validatePhone = (phone) => {
  const re = /^1[3-9]\d{9}$/;
  return re.test(phone);
}

/**
 * 格式化文件大小
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 获取URL参数
 */
const getUrlParams = (url) => {
  const params = {};
  const urlSearchParams = new URLSearchParams(url.split('?')[1]);
  for (const [key, value] of urlSearchParams) {
    params[key] = value;
  }
  return params;
}

/**
 * 安全的JSON解析
 */
const safeJsonParse = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn('JSON解析失败:', e);
    return defaultValue;
  }
}

/**
 * 安全的本地存储操作
 */
const safeStorage = {
  get: (key, defaultValue = null) => {
    try {
      const value = wx.getStorageSync(key);
      return value !== '' ? value : defaultValue;
    } catch (e) {
      console.warn('读取存储失败:', e);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      wx.setStorageSync(key, value);
      return true;
    } catch (e) {
      console.warn('写入存储失败:', e);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      wx.removeStorageSync(key);
      return true;
    } catch (e) {
      console.warn('删除存储失败:', e);
      return false;
    }
  }
}

/**
 * 显示消息提示
 */
const showMessage = (title, type = 'none', duration = 2000) => {
  const iconMap = {
    success: 'success',
    error: 'error',
    loading: 'loading',
    none: 'none'
  };
  
  wx.showToast({
    title,
    icon: iconMap[type] || 'none',
    duration: type === 'loading' ? 10000 : duration
  });
}

/**
 * 显示确认对话框
 */
const showConfirm = (title, content, options = {}) => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
      confirmColor: options.confirmColor || '#3B82F6',
      success: (res) => {
        resolve(res.confirm);
      },
      fail: () => {
        resolve(false);
      }
    });
  });
}

/**
 * 复制到剪贴板
 */
const copyToClipboard = (text, successMsg = '已复制到剪贴板') => {
  return new Promise((resolve, reject) => {
    wx.setClipboardData({
      data: text,
      success: () => {
        showMessage(successMsg, 'success');
        resolve(true);
      },
      fail: (error) => {
        showMessage('复制失败', 'error');
        reject(error);
      }
    });
  });
}

/**
 * 从剪贴板获取数据
 */
const getFromClipboard = () => {
  return new Promise((resolve, reject) => {
    wx.getClipboardData({
      success: (res) => {
        resolve(res.data);
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
}

module.exports = {
  formatTime,
  formatRelativeTime,
  formatMarkdown,
  debounce,
  throttle,
  deepClone,
  generateId,
  validateEmail,
  validatePhone,
  formatFileSize,
  getUrlParams,
  safeJsonParse,
  safeStorage,
  showMessage,
  showConfirm,
  copyToClipboard,
  getFromClipboard
}