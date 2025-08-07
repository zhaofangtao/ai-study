// app.js
App({
  globalData: {
    userTopics: 0,
    usedTopics: [],
    apiConfig: null,
    isTestMode: false,
    currentQuestions: [],
    currentTopic: '',
    
    // 学习统计数据
    learningStats: {
      totalStudyTime: 0,
      totalQuestionsAnswered: 0,
      totalTopicsCompleted: 0,
      streakDays: 0,
      lastStudyDate: null,
      achievements: []
    },
    industryTopics: {
      '💻 编程技术': ['Python编程基础', 'JavaScript前端开发', 'Java后端开发', 'C++系统编程', 'React框架开发', 'Vue.js应用开发', 'Node.js服务端', 'MySQL数据库', '算法与数据结构', 'Git版本控制', 'Linux系统管理', 'Docker容器技术', 'TypeScript开发', 'Go语言编程', 'Rust系统编程', 'PHP Web开发', 'Swift iOS开发', 'Kotlin Android开发', '微服务架构', 'Redis缓存技术', 'MongoDB数据库', 'GraphQL API设计'],
      '🤖 人工智能': ['机器学习入门', '深度学习基础', 'TensorFlow框架', 'PyTorch深度学习', '自然语言处理', '计算机视觉', '强化学习', 'ChatGPT应用开发', '数据挖掘技术', '神经网络原理', 'AI伦理与安全', '大模型微调', 'OpenAI API开发', 'Stable Diffusion', '语音识别技术', '推荐系统算法', 'AutoML自动机器学习', 'MLOps机器学习运维', '知识图谱构建', '智能对话系统'],
      '📊 数据分析': ['Excel数据分析', 'Python数据分析', 'R语言统计', 'SQL数据查询', 'Tableau可视化', 'Power BI报表', '统计学基础', '数据清洗技术', '商业智能分析', 'A/B测试方法', '用户行为分析', '预测模型建立', 'Pandas数据处理', 'NumPy科学计算', '数据可视化设计', '时间序列分析', '市场调研方法', '客户细分分析', '风险评估模型', '数据仓库设计'],
      '🎨 设计创意': ['UI/UX设计', 'Photoshop图像处理', 'Illustrator矢量设计', 'Figma界面设计', '品牌视觉设计', '网页设计原理', '移动端设计', '用户体验设计', '平面设计基础', '色彩搭配理论', '字体设计应用', '设计思维方法', 'Sketch设计工具', '原型设计制作', '交互动效设计', '设计系统构建', '包装设计创意', '海报设计技巧', '插画绘制技法', '3D建模渲染'],
      '💼 商业管理': ['项目管理PMP', '产品经理技能', '市场营销策略', '财务管理基础', '人力资源管理', '供应链管理', '战略规划制定', '团队领导力', '商业模式设计', '创业指导', '投资理财规划', '风险管理控制', '敏捷项目管理', '数字化转型', '客户关系管理', '品牌营销策略', '电商运营管理', '跨境贸易实务', '企业文化建设', '绩效考核体系'],
      '🏥 医疗健康': ['营养学基础', '运动健身科学', '心理健康管理', '中医养生理论', '急救知识技能', '药理学基础', '医学影像诊断', '康复治疗技术', '公共卫生管理', '临床医学基础', '护理学专业', '健康数据分析', '瑜伽冥想练习', '健康饮食搭配', '睡眠质量改善', '压力释放技巧', '慢性病管理', '儿童健康护理', '老年人保健', '运动损伤预防'],
      '🍳 生活技能': ['烹饪技巧大全', '家居装修设计', '园艺种植技术', '摄影技术提升', '理财投资入门', '时间管理方法', '沟通表达技巧', '育儿教育方法', '汽车维修保养', '法律常识普及', '急救自救技能', '手工制作工艺', '家庭收纳整理', '宠物饲养护理', '旅行规划攻略', '美妆护肤技巧', '服装搭配艺术', '家电使用维护', '节能环保生活', '社交礼仪规范'],
      '🎓 学科教育': ['数学思维训练', '物理实验探究', '化学反应原理', '生物科学研究', '历史文化研究', '地理环境科学', '语言学习方法', '文学作品赏析', '哲学思辨训练', '心理学应用', '社会学理论', '经济学原理', '英语口语提升', '古诗词鉴赏', '科学实验设计', '逻辑推理训练', '创新思维培养', '批判性阅读', '学习策略优化', '考试技巧掌握'],
      '🎭 艺术文化': ['音乐理论基础', '绘画技法学习', '书法艺术练习', '舞蹈基础训练', '戏剧表演技巧', '电影制作技术', '文学创作方法', '诗歌鉴赏写作', '传统文化研究', '艺术史学习', '美学理论探讨', '创意写作训练', '乐器演奏技巧', '声乐发声方法', '摄影构图美学', '雕塑造型艺术', '陶艺制作工艺', '民族文化传承', '现代艺术欣赏', '文化创意产业'],
      '🌱 个人成长': ['自我认知提升', '情绪管理技巧', '习惯养成方法', '目标设定实现', '压力管理缓解', '人际关系处理', '演讲表达能力', '批判性思维', '创新思维训练', '学习方法优化', '职业规划发展', '生活平衡艺术', '自信心建立', '专注力训练', '决策能力提升', '领导力培养', '团队协作技巧', '冲突解决方法', '创业思维培养', '终身学习理念'],
      '🌐 语言学习': ['英语口语交流', '日语基础入门', '韩语学习指南', '法语浪漫之旅', '德语严谨学习', '西班牙语热情', '意大利语优雅', '俄语文化探索', '阿拉伯语神秘', '葡萄牙语活力', '泰语旅游实用', '越南语商务', '印地语文化', '土耳其语历史', '希腊语古典', '荷兰语现代'],
      '🎮 游戏娱乐': ['游戏设计原理', 'Unity游戏开发', '手机游戏制作', '电竞技巧提升', '游戏策划思维', '3D游戏建模', '游戏音效制作', '游戏测试方法', '独立游戏开发', 'VR游戏体验', '游戏心理学', '游戏商业模式', '游戏直播技巧', '游戏社区运营', '桌游设计创作', '密室逃脱设计']
    }
  },

  onLaunch() {
    // 初始化数据
    this.loadUserData();
    this.loadApiConfig();
  },

  // 加载用户数据
  loadUserData() {
    try {
      const userTopics = wx.getStorageSync('user_topics') || 0;
      const usedTopics = wx.getStorageSync('used_topics') || [];
      const isTestMode = wx.getStorageSync('is_test_mode') || false;
      const learningStats = wx.getStorageSync('learning_stats') || {
        totalStudyTime: 0,
        totalQuestionsAnswered: 0,
        totalTopicsCompleted: 0,
        streakDays: 0,
        lastStudyDate: null,
        achievements: []
      };

      this.globalData.userTopics = parseInt(userTopics);
      this.globalData.usedTopics = usedTopics;
      this.globalData.isTestMode = isTestMode;
      this.globalData.learningStats = learningStats;
    } catch (e) {
      console.error('加载用户数据失败:', e);
    }
  },

  // 加载API配置
  loadApiConfig() {
    try {
      const apiConfig = wx.getStorageSync('api_config');
      if (apiConfig) {
        this.globalData.apiConfig = apiConfig;
      }
    } catch (e) {
      console.error('加载API配置失败:', e);
    }
  },

  // 保存用户数据
  saveUserData() {
    try {
      wx.setStorageSync('user_topics', this.globalData.userTopics);
      wx.setStorageSync('used_topics', this.globalData.usedTopics);
      wx.setStorageSync('is_test_mode', this.globalData.isTestMode);
      wx.setStorageSync('learning_stats', this.globalData.learningStats);
    } catch (e) {
      console.error('保存用户数据失败:', e);
    }
  },

  // 保存API配置
  saveApiConfig(config) {
    try {
      wx.setStorageSync('api_config', config);
      this.globalData.apiConfig = config;
    } catch (e) {
      console.error('保存API配置失败:', e);
    }
  },

  // 检查是否有API密钥
  hasApiKey() {
    if (this.globalData.isTestMode) return false;
    return this.globalData.apiConfig && this.globalData.apiConfig.apiKey && this.globalData.apiConfig.apiKey.trim().length > 0;
  },

  // 检查主题是否可以免费使用
  canUseTopicForFree(topic) {
    if (this.hasApiKey()) {
      return true; // 有API密钥的用户所有主题免费
    }

    const userTopics = this.globalData.userTopics;
    if (userTopics === -1) {
      return true; // 无限套餐
    }

    const usedTopics = this.globalData.usedTopics;

    // 如果这个主题已经被使用过，可以继续使用
    if (usedTopics.includes(topic)) {
      return true;
    }

    // 如果还有剩余主题额度，可以使用新主题
    return usedTopics.length < userTopics;
  },

  // 标记主题为已使用
  markTopicAsUsed(topic) {
    if (!this.globalData.usedTopics.includes(topic)) {
      this.globalData.usedTopics.push(topic);
      this.saveUserData();
    }
  },

  // 更新学习统计
  updateLearningStats(type, value = 1) {
    const stats = this.globalData.learningStats;
    const today = new Date().toDateString();
    
    switch (type) {
      case 'question_answered':
        stats.totalQuestionsAnswered += value;
        this.updateStreak(today);
        break;
      case 'topic_completed':
        stats.totalTopicsCompleted += value;
        break;
      case 'study_time':
        stats.totalStudyTime += value;
        break;
    }
    
    this.checkAchievements();
    this.saveUserData();
  },

  // 更新连续学习天数
  updateStreak(today) {
    const stats = this.globalData.learningStats;
    const lastStudyDate = stats.lastStudyDate;
    
    if (!lastStudyDate) {
      stats.streakDays = 1;
    } else {
      const lastDate = new Date(lastStudyDate);
      const todayDate = new Date(today);
      const diffTime = todayDate - lastDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        stats.streakDays += 1;
      } else if (diffDays > 1) {
        stats.streakDays = 1;
      }
    }
    
    stats.lastStudyDate = today;
  },

  // 检查成就
  checkAchievements() {
    const stats = this.globalData.learningStats;
    const achievements = [
      { id: 'first_question', name: '初学者', desc: '回答第一个问题', condition: () => stats.totalQuestionsAnswered >= 1, icon: '🌱' },
      { id: 'ten_questions', name: '勤学者', desc: '回答10个问题', condition: () => stats.totalQuestionsAnswered >= 10, icon: '📚' },
      { id: 'fifty_questions', name: '学霸', desc: '回答50个问题', condition: () => stats.totalQuestionsAnswered >= 50, icon: '🎓' },
      { id: 'hundred_questions', name: '知识达人', desc: '回答100个问题', condition: () => stats.totalQuestionsAnswered >= 100, icon: '🏆' },
      { id: 'first_topic', name: '探索者', desc: '完成第一个主题', condition: () => stats.totalTopicsCompleted >= 1, icon: '🔍' },
      { id: 'five_topics', name: '多面手', desc: '完成5个主题', condition: () => stats.totalTopicsCompleted >= 5, icon: '🎯' },
      { id: 'streak_3', name: '坚持者', desc: '连续学习3天', condition: () => stats.streakDays >= 3, icon: '🔥' },
      { id: 'streak_7', name: '毅力者', desc: '连续学习7天', condition: () => stats.streakDays >= 7, icon: '💪' },
      { id: 'streak_30', name: '习惯大师', desc: '连续学习30天', condition: () => stats.streakDays >= 30, icon: '👑' }
    ];
    
    achievements.forEach(achievement => {
      if (achievement.condition() && !stats.achievements.includes(achievement.id)) {
        stats.achievements.push(achievement.id);
        this.showAchievement(achievement);
      }
    });
  },

  // 显示成就通知
  showAchievement(achievement) {
    wx.showModal({
      title: '🎉 获得成就',
      content: `${achievement.icon} ${achievement.name}\n${achievement.desc}`,
      showCancel: false,
      confirmText: '太棒了！'
    });
  },

  // 获取成就列表
  getAchievements() {
    const stats = this.globalData.learningStats;
    return [
      { id: 'first_question', name: '初学者', desc: '回答第一个问题', condition: () => stats.totalQuestionsAnswered >= 1, icon: '🌱' },
      { id: 'ten_questions', name: '勤学者', desc: '回答10个问题', condition: () => stats.totalQuestionsAnswered >= 10, icon: '📚' },
      { id: 'fifty_questions', name: '学霸', desc: '回答50个问题', condition: () => stats.totalQuestionsAnswered >= 50, icon: '🎓' },
      { id: 'hundred_questions', name: '知识达人', desc: '回答100个问题', condition: () => stats.totalQuestionsAnswered >= 100, icon: '🏆' },
      { id: 'first_topic', name: '探索者', desc: '完成第一个主题', condition: () => stats.totalTopicsCompleted >= 1, icon: '🔍' },
      { id: 'five_topics', name: '多面手', desc: '完成5个主题', condition: () => stats.totalTopicsCompleted >= 5, icon: '🎯' },
      { id: 'streak_3', name: '坚持者', desc: '连续学习3天', condition: () => stats.streakDays >= 3, icon: '🔥' },
      { id: 'streak_7', name: '毅力者', desc: '连续学习7天', condition: () => stats.streakDays >= 7, icon: '💪' },
      { id: 'streak_30', name: '习惯大师', desc: '连续学习30天', condition: () => stats.streakDays >= 30, icon: '👑' }
    ].map(achievement => ({
      ...achievement,
      unlocked: stats.achievements.includes(achievement.id),
      progress: this.getAchievementProgress(achievement, stats)
    }));
  },

  // 获取成就进度
  getAchievementProgress(achievement, stats) {
    switch (achievement.id) {
      case 'first_question':
        return Math.min(stats.totalQuestionsAnswered, 1);
      case 'ten_questions':
        return Math.min(stats.totalQuestionsAnswered, 10);
      case 'fifty_questions':
        return Math.min(stats.totalQuestionsAnswered, 50);
      case 'hundred_questions':
        return Math.min(stats.totalQuestionsAnswered, 100);
      case 'first_topic':
        return Math.min(stats.totalTopicsCompleted, 1);
      case 'five_topics':
        return Math.min(stats.totalTopicsCompleted, 5);
      case 'streak_3':
        return Math.min(stats.streakDays, 3);
      case 'streak_7':
        return Math.min(stats.streakDays, 7);
      case 'streak_30':
        return Math.min(stats.streakDays, 30);
      default:
        return 0;
    }
  },

  // 智能主题推荐
  getRecommendedTopics(currentTopic = '', limit = 5) {
    try {
      const cache = wx.getStorageSync('learning_cache') || {};
      const studiedTopics = Object.keys(cache);
      const allTopics = Object.values(this.globalData.industryTopics).flat();
      
      // 如果没有学习历史，返回热门主题
      if (studiedTopics.length === 0) {
        const popularTopics = [
          'Python编程基础', 'JavaScript前端开发', '机器学习入门', 
          'UI/UX设计', '项目管理PMP', '英语口语交流'
        ];
        return popularTopics.slice(0, limit);
      }
      
      // 基于已学习主题推荐相关主题
      const recommendations = [];
      
      // 找到当前主题所属分类
      let currentCategory = '';
      for (const [category, topics] of Object.entries(this.globalData.industryTopics)) {
        if (topics.includes(currentTopic)) {
          currentCategory = category;
          break;
        }
      }
      
      // 优先推荐同分类的主题
      if (currentCategory && this.globalData.industryTopics[currentCategory]) {
        const categoryTopics = this.globalData.industryTopics[currentCategory]
          .filter(topic => topic !== currentTopic && !studiedTopics.includes(topic));
        recommendations.push(...categoryTopics.slice(0, 3));
      }
      
      // 推荐相关分类的主题
      const relatedCategories = this.getRelatedCategories(currentCategory);
      if (relatedCategories && relatedCategories.length > 0) {
        relatedCategories.forEach(category => {
          if (this.globalData.industryTopics[category]) {
            const categoryTopics = this.globalData.industryTopics[category]
              .filter(topic => !studiedTopics.includes(topic) && !recommendations.includes(topic));
            recommendations.push(...categoryTopics.slice(0, 1));
          }
        });
      }
      
      // 如果推荐不够，添加热门主题
      if (recommendations.length < limit) {
        const remainingTopics = allTopics
          .filter(topic => !studiedTopics.includes(topic) && !recommendations.includes(topic))
          .sort(() => Math.random() - 0.5);
        recommendations.push(...remainingTopics.slice(0, limit - recommendations.length));
      }
      
      return recommendations.slice(0, limit);
    } catch (error) {
      console.error('获取推荐主题失败:', error);
      // 返回默认推荐
      return [
        'Python编程基础', 'JavaScript前端开发', '机器学习入门', 
        'UI/UX设计', '项目管理PMP'
      ].slice(0, limit);
    }
  },

  // 获取相关分类
  getRelatedCategories(category) {
    const relations = {
      '💻 编程技术': ['🤖 人工智能', '📊 数据分析'],
      '🤖 人工智能': ['💻 编程技术', '📊 数据分析'],
      '📊 数据分析': ['💻 编程技术', '🤖 人工智能'],
      '🎨 设计创意': ['💼 商业管理', '🎭 艺术文化'],
      '💼 商业管理': ['🎨 设计创意', '🌱 个人成长'],
      '🌱 个人成长': ['💼 商业管理', '🎓 学科教育'],
      '🎓 学科教育': ['🌱 个人成长', '🌐 语言学习'],
      '🌐 语言学习': ['🎓 学科教育', '🎭 艺术文化']
    };
    return relations[category] || [];
  },

  // 显示消息提示
  showMessage(message, type = 'none') {
    const iconMap = {
      success: 'success',
      error: 'error',
      loading: 'loading',
      none: 'none'
    };

    wx.showToast({
      title: message,
      icon: iconMap[type] || 'none',
      duration: type === 'loading' ? 10000 : 2000
    });
  }
});