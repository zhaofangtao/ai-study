<template>
  <view></view>
</template>

<script>
export default {
  globalData: {
    userTopics: 0,
    usedTopics: [],
    apiConfig: null,
    isTestMode: false,
    currentQuestions: [],
    currentTopic: '',
    industryTopics: {
      '💻 编程技术': ['Python编程基础', 'JavaScript前端开发', 'Java后端开发', 'C++系统编程', 'React框架开发', 'Vue.js应用开发', 'Node.js服务端', 'MySQL数据库', '算法与数据结构', 'Git版本控制', 'Linux系统管理', 'Docker容器技术'],
      '🤖 人工智能': ['机器学习入门', '深度学习基础', 'TensorFlow框架', 'PyTorch深度学习', '自然语言处理', '计算机视觉', '强化学习', 'ChatGPT应用开发', '数据挖掘技术', '神经网络原理', 'AI伦理与安全', '大模型微调'],
      '📊 数据分析': ['Excel数据分析', 'Python数据分析', 'R语言统计', 'SQL数据查询', 'Tableau可视化', 'Power BI报表', '统计学基础', '数据清洗技术', '商业智能分析', 'A/B测试方法', '用户行为分析', '预测模型建立'],
      '🎨 设计创意': ['UI/UX设计', 'Photoshop图像处理', 'Illustrator矢量设计', 'Figma界面设计', '品牌视觉设计', '网页设计原理', '移动端设计', '用户体验设计', '平面设计基础', '色彩搭配理论', '字体设计应用', '设计思维方法'],
      '💼 商业管理': ['项目管理PMP', '产品经理技能', '市场营销策略', '财务管理基础', '人力资源管理', '供应链管理', '战略规划制定', '团队领导力', '商业模式设计', '创业指导', '投资理财规划', '风险管理控制'],
      '🏥 医疗健康': ['营养学基础', '运动健身科学', '心理健康管理', '中医养生理论', '急救知识技能', '药理学基础', '医学影像诊断', '康复治疗技术', '公共卫生管理', '临床医学基础', '护理学专业', '健康数据分析'],
      '🍳 生活技能': ['烹饪技巧大全', '家居装修设计', '园艺种植技术', '摄影技术提升', '理财投资入门', '时间管理方法', '沟通表达技巧', '育儿教育方法', '汽车维修保养', '法律常识普及', '急救自救技能', '手工制作工艺'],
      '🎓 学科教育': ['数学思维训练', '物理实验探究', '化学反应原理', '生物科学研究', '历史文化研究', '地理环境科学', '语言学习方法', '文学作品赏析', '哲学思辨训练', '心理学应用', '社会学理论', '经济学原理'],
      '🎭 艺术文化': ['音乐理论基础', '绘画技法学习', '书法艺术练习', '舞蹈基础训练', '戏剧表演技巧', '电影制作技术', '文学创作方法', '诗歌鉴赏写作', '传统文化研究', '艺术史学习', '美学理论探讨', '创意写作训练'],
      '🌱 个人成长': ['自我认知提升', '情绪管理技巧', '习惯养成方法', '目标设定实现', '压力管理缓解', '人际关系处理', '演讲表达能力', '批判性思维', '创新思维训练', '学习方法优化', '职业规划发展', '生活平衡艺术']
    }
  },

  onLaunch() {
    // 初始化数据
    this.loadUserData();
    this.loadApiConfig();
  },

  methods: {
    // 加载用户数据
    loadUserData() {
      try {
        const userTopics = uni.getStorageSync('user_topics') || 0;
        const usedTopics = uni.getStorageSync('used_topics') || [];
        const isTestMode = uni.getStorageSync('is_test_mode') || false;
        
        this.globalData.userTopics = parseInt(userTopics);
        this.globalData.usedTopics = usedTopics;
        this.globalData.isTestMode = isTestMode;
      } catch (e) {
        console.error('加载用户数据失败:', e);
      }
    },

    // 加载API配置
    loadApiConfig() {
      try {
        const apiConfig = uni.getStorageSync('api_config');
        if (apiConfig) {
          this.globalData.apiConfig = apiConfig;
        }
      } catch (e) {
        console.error('加载API配置失败:', e);
      }
    }
  }
}
</script>

<style>
/* 全局样式 */
page {
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
</style>