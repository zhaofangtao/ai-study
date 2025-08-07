// 应用常量配置
export const APP_CONFIG = {
  name: '智能学习问题生成器',
  version: '1.0.0',
  colors: {
    primary: '#1E3A8A',      // 深蓝色 - 专业、可靠
    secondary: '#DBEAFE',    // 淡蓝色 - 清新、友好
    accent: '#F59E0B',       // 橙色 - 活力、重点
    neutral: '#6B7280',      // 灰色 - 平衡
    background: '#F9FAFB',   // 浅灰背景
    white: '#FFFFFF',
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
      light: '#9CA3AF'
    }
  }
};

// 问题分类配置
export const QUESTION_CATEGORIES = {
  BASIC: {
    key: 'basic',
    name: '基础入门',
    percentage: 30,
    color: '#10B981',
    icon: '📚'
  },
  PRACTICE: {
    key: 'practice', 
    name: '实践操作',
    percentage: 40,
    color: '#3B82F6',
    icon: '🛠️'
  },
  ADVANCED: {
    key: 'advanced',
    name: '进阶提升', 
    percentage: 20,
    color: '#8B5CF6',
    icon: '🚀'
  },
  INDUSTRY: {
    key: 'industry',
    name: '行业前沿',
    percentage: 10,
    color: '#F59E0B',
    icon: '💡'
  }
};

// API配置
export const API_PROVIDERS = {
  DEEPSEEK: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat'
  },
  DEEPSEEK_NVIDIA: {
    name: 'DeepSeek NVIDIA',
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    model: 'deepseek-ai/deepseek-r1'
  },
  OPENAI: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo'
  },
  CLAUDE: {
    name: 'Claude',
    baseUrl: 'https://api.anthropic.com/v1',
    model: 'claude-3-haiku-20240307'
  }
};

// 本地存储键名
export const STORAGE_KEYS = {
  API_CONFIG: 'api_config',
  LEARNING_HISTORY: 'learning_history',
  FAVORITES: 'favorites',
  CURRENT_SESSION: 'current_session',
  USER_PREFERENCES: 'user_preferences'
};