// 工具函数
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return '今天';
  } else if (diffDays === 2) {
    return '昨天';
  } else if (diffDays <= 7) {
    return `${diffDays - 1}天前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
};

export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const validateApiKey = (apiKey, provider) => {
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, message: 'API密钥不能为空' };
  }

  // 基本格式验证
  switch (provider) {
    case 'openai':
      if (!apiKey.startsWith('sk-')) {
        return { valid: false, message: 'OpenAI API密钥格式错误，应以sk-开头' };
      }
      break;
    case 'deepseek':
      if (!apiKey.startsWith('sk-')) {
        return { valid: false, message: 'DeepSeek API密钥格式错误，应以sk-开头' };
      }
      break;
    case 'claude':
      if (!apiKey.startsWith('sk-ant-')) {
        return { valid: false, message: 'Claude API密钥格式错误，应以sk-ant-开头' };
      }
      break;
  }

  return { valid: true, message: '' };
};

export const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const calculateProgress = (questions) => {
  if (!questions || questions.length === 0) return 0;
  const answeredCount = questions.filter(q => q.answered).length;
  return Math.round((answeredCount / questions.length) * 100);
};

export const groupQuestionsByCategory = (questions) => {
  const grouped = {};
  questions.forEach(question => {
    const category = question.category || 'basic';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(question);
  });
  return grouped;
};

export const getQuestionStats = (questions) => {
  const total = questions.length;
  const answered = questions.filter(q => q.answered).length;
  const favorites = questions.filter(q => q.favorite).length;
  
  const byCategory = {};
  questions.forEach(q => {
    const cat = q.category || 'basic';
    if (!byCategory[cat]) {
      byCategory[cat] = { total: 0, answered: 0 };
    }
    byCategory[cat].total++;
    if (q.answered) byCategory[cat].answered++;
  });

  return {
    total,
    answered,
    favorites,
    progress: total > 0 ? Math.round((answered / total) * 100) : 0,
    byCategory
  };
};

export const exportToJson = (data, filename = 'learning_data') => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  
  // Web环境下载
  if (typeof document !== 'undefined') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  return jsonString;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, '');
};

export const getRandomTips = () => {
  const tips = [
    '💡 尝试从不同角度思考问题，会有意想不到的收获',
    '🎯 专注于理解概念的本质，而不仅仅是记忆',
    '🔄 定期回顾之前学过的内容，巩固记忆',
    '❓ 不要害怕提问，好奇心是最好的老师',
    '📝 记录学习过程中的思考和感悟',
    '🤝 与他人分享你的学习心得，教学相长',
    '⏰ 保持规律的学习节奏，持续进步',
    '🎨 尝试用不同的方式表达你学到的知识'
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
};