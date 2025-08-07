// pages/index/index.js
const app = getApp();

Page({
  data: {
    // 仪表板数据
    totalTopics: 0,
    totalQuestions: 0,
    totalAnswered: 0,
    userCredits: 0,
    apiStatus: { text: '未配置API', color: '#EF4444' },

    // 学习统计
    learningStats: {
      totalQuestionsAnswered: 0,
      totalTopicsCompleted: 0,
      streakDays: 0,
      achievements: []
    },

    // 学习相关
    topicInput: '',
    currentTopic: '',
    currentQuestions: [],
    showQuestions: false,
    isGenerating: false,
    answeredCount: 0,
    progressPercent: 0,
    questionCounter: 0,

    // 按钮文本
    startButtonText: '🚀 开始生成学习问题',
    loadMoreButtonText: '📖 加载更多问题 (+3)',
    testModeText: '切换到测试模式',

    // 付费相关
    showPaymentModal: false,
    currentPaymentPackage: 'basic',
    currentPaymentMethod: 'wechat',
    paymentOrderId: '',
    paymentVerification: '',
    currentQrCode: '',
    currentPaymentAmount: '1.9',

    paymentPackages: [
      { key: 'basic', name: '基础套餐', topics: 1, price: 1.9 },
      { key: 'value', name: '实惠套餐', topics: 3, price: 2.9 },
      { key: 'premium', name: '超值套餐', topics: 10, price: 4.9 },
      { key: 'unlimited', name: '无限套餐', topics: -1, price: 9.9 }
    ],

    // 统计数据
    usedTopicsCount: 0,
    remainingTopics: 0,
    isTestMode: false,

    // 智能推荐
    recommendedTopics: [],
    showRecommendations: false
  },

  onLoad() {
    this.initData();
    this.updateDashboard();
  },

  onShow() {
    try {
      this.updateDashboard();
      this.initData();
      this.updateLearningStats();

      // 延迟加载推荐，避免阻塞页面渲染
      setTimeout(() => {
        this.loadRecommendations();
      }, 500);

      // 检查是否从历史记录加载
      if (app.globalData.loadFromHistory) {
        this.loadFromHistoryData();
        app.globalData.loadFromHistory = false;
      }
    } catch (error) {
      console.error('页面显示错误:', error);
    }
  },

  // 从历史记录加载数据
  loadFromHistoryData() {
    if (app.globalData.currentTopic && app.globalData.currentQuestions.length > 0) {
      this.setData({
        currentTopic: app.globalData.currentTopic,
        currentQuestions: app.globalData.currentQuestions,
        showQuestions: true,
        topicInput: app.globalData.currentTopic
      });
      this.updateProgress();
    }
  },

  // 初始化数据
  initData() {
    try {
      const userTopics = app.globalData.userTopics || 0;
      const usedTopics = app.globalData.usedTopics || [];
      const apiConfig = app.globalData.apiConfig;
      const isTestMode = app.globalData.isTestMode || false;

      this.setData({
        userCredits: userTopics === -1 ? '无限' : userTopics,
        usedTopicsCount: usedTopics.length,
        remainingTopics: userTopics === -1 ? '无限' : Math.max(0, userTopics - usedTopics.length),
        testModeText: isTestMode ? '测试付费模式' : '切换到测试模式',
        isTestMode: isTestMode
      });

      // 更新API状态
      if (apiConfig && apiConfig.apiKey) {
        // 显示友好的提供商名称
        const providerNames = {
          'deepseek': 'DeepSeek-V3',
          'deepseek-nvidia': 'DeepSeek-R1 NVIDIA',
          'openai': 'OpenAI'
        };
        const displayName = providerNames[apiConfig.provider] || apiConfig.provider.toUpperCase();
        this.setData({
          apiStatus: { text: `已配置 ${displayName}`, color: '#10B981' }
        });
      }
    } catch (error) {
      console.error('初始化数据失败:', error);
    }
  },

  // 更新仪表板
  updateDashboard() {
    const cache = wx.getStorageSync('learning_cache') || {};
    const qaHistory = wx.getStorageSync('qa_history') || [];

    let totalQuestions = 0;
    let totalAnswered = 0;

    Object.values(cache).forEach(data => {
      if (data.questions) {
        totalQuestions += data.questions.length;
        totalAnswered += data.questions.filter(q => q.answer).length;
      }
    });

    this.setData({
      totalTopics: Object.keys(cache).length,
      totalQuestions,
      totalAnswered
    });
  },

  // 更新学习统计
  updateLearningStats() {
    const stats = app.globalData.learningStats || {
      totalQuestionsAnswered: 0,
      totalTopicsCompleted: 0,
      streakDays: 0,
      achievements: []
    };

    this.setData({
      learningStats: stats
    });
  },

  // 加载智能推荐
  loadRecommendations() {
    try {
      const currentTopic = this.data.currentTopic || this.data.topicInput;
      const recommendations = app.getRecommendedTopics(currentTopic, 3); // 只显示3个推荐

      if (recommendations && recommendations.length > 0) {
        // 如果输入框为空，默认填入第一个推荐主题
        if (!this.data.topicInput.trim()) {
          this.setData({
            topicInput: recommendations[0],
            recommendedTopics: recommendations,
            showRecommendations: true
          });
        } else {
          this.setData({
            recommendedTopics: recommendations,
            showRecommendations: true
          });
        }
      } else {
        this.setData({
          recommendedTopics: [],
          showRecommendations: false
        });
      }
    } catch (error) {
      console.error('加载推荐失败:', error);
      this.setData({
        recommendedTopics: [],
        showRecommendations: false
      });
    }
  },

  // 选择推荐主题
  selectRecommendedTopic(e) {
    const topic = e.currentTarget.dataset.topic;
    this.setData({
      topicInput: topic,
      showRecommendations: false
    });
    // 静默选择，不显示提示
  },

  // 通过点击卡片切换答案显示
  toggleAnswerByCard(e) {
    const questionId = parseInt(e.currentTarget.dataset.id);
    const questions = [...this.data.currentQuestions];
    const questionIndex = questions.findIndex(q => q.id === questionId);

    if (questionIndex === -1) return;

    const question = questions[questionIndex];

    // 已有答案或正在生成中的问题才能通过点击卡片切换
    if (question.answer || question.isGenerating) {
      if (question.showAnswer) {
        // 收起答案
        question.isCollapsing = true;
        this.setData({ currentQuestions: questions });

        setTimeout(() => {
          const updatedQuestions = [...this.data.currentQuestions];
          const updatedQuestion = updatedQuestions.find(q => q.id === questionId);
          if (updatedQuestion) {
            updatedQuestion.showAnswer = false;
            updatedQuestion.isCollapsing = false;
            this.setData({ currentQuestions: updatedQuestions });
          }
        }, 300);
      } else {
        // 展开答案
        question.showAnswer = true;
        question.isCollapsing = false;
        this.setData({ currentQuestions: questions });
      }
    }
  },

  // 切换笔记输入框
  toggleNoteInput(e) {
    const questionId = parseInt(e.currentTarget.dataset.id);
    const questions = [...this.data.currentQuestions];
    const questionIndex = questions.findIndex(q => q.id === questionId);

    if (questionIndex !== -1) {
      questions[questionIndex].showNoteInput = !questions[questionIndex].showNoteInput;
      this.setData({ currentQuestions: questions });
    }
  },

  // 输入笔记
  onNoteInput(e) {
    const questionId = parseInt(e.currentTarget.dataset.id);
    const noteText = e.detail.value;
    const questions = [...this.data.currentQuestions];
    const questionIndex = questions.findIndex(q => q.id === questionId);

    if (questionIndex !== -1) {
      questions[questionIndex].note = noteText;
      this.setData({ currentQuestions: questions });

      // 自动保存笔记
      this.saveTopicCache(this.data.currentTopic, { questions: questions });
    }
  },

  // 保存笔记
  saveNote(e) {
    const questionId = parseInt(e.currentTarget.dataset.id);
    const questions = [...this.data.currentQuestions];
    const questionIndex = questions.findIndex(q => q.id === questionId);

    if (questionIndex !== -1) {
      questions[questionIndex].showNoteInput = false;
      this.setData({ currentQuestions: questions });

      // 保存到缓存
      this.saveTopicCache(this.data.currentTopic, { questions: questions });

      wx.showToast({
        title: '笔记已保存',
        icon: 'success'
      });
    }
  },

  // 输入主题
  onTopicInput(e) {
    this.setData({
      topicInput: e.detail.value
    });
  },

  // 输入框获得焦点时清空内容
  onTopicFocus(e) {
    if (this.data.topicInput && this.data.recommendedTopics.includes(this.data.topicInput)) {
      this.setData({
        topicInput: ''
      });
    }
  },

  // 输入框失去焦点时恢复推荐内容
  onTopicBlur(e) {
    if (!this.data.topicInput.trim() && this.data.recommendedTopics.length > 0) {
      this.setData({
        topicInput: this.data.recommendedTopics[0]
      });
    }
  },

  // 开始学习
  async startLearning() {
    const topic = this.data.topicInput.trim();

    if (!topic) {
      wx.showToast({ title: '请输入学习主题', icon: 'error' });
      return;
    }

    // 检查API配置
    if (!app.globalData.apiConfig || !app.globalData.apiConfig.apiKey) {
      wx.showModal({
        title: '提示',
        content: '请先在设置中配置API',
        confirmText: '去设置',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/settings/settings' });
          }
        }
      });
      return;
    }

    // 检查主题权限
    if (!app.hasApiKey()) {
      const canUseTopic = app.canUseTopicForFree(topic);
      if (!canUseTopic) {
        wx.showModal({
          title: '主题权限不足',
          content: '请购买主题套餐或配置API密钥',
          confirmText: '购买套餐',
          success: (res) => {
            if (res.confirm) {
              this.showPaymentModal();
            }
          }
        });
        return;
      }

      // 标记主题为已使用
      if (!app.globalData.usedTopics.includes(topic)) {
        app.markTopicAsUsed(topic);
        const remainingTopics = app.globalData.userTopics;
        const usedCount = app.globalData.usedTopics.length;
        if (remainingTopics !== -1) {
          wx.showToast({
            title: `开始学习新主题，剩余 ${remainingTopics - usedCount} 个主题`,
            icon: 'success'
          });
        }
      }
    }

    this.setData({
      currentTopic: topic,
      currentQuestions: [],
      questionCounter: 0,
      isGenerating: true,
      startButtonText: '🔄 正在生成问题...'
    });

    wx.showToast({ title: 'AI正在为你生成个性化学习问题...', icon: 'loading', duration: 10000 });

    try {
      await this.generateQuestions(15, true);
    } catch (error) {
      wx.showToast({ title: '生成问题失败: ' + error.message, icon: 'error' });
    } finally {
      wx.hideToast();
      this.setData({
        isGenerating: false,
        startButtonText: '🚀 开始生成学习问题'
      });
    }
  },

  // 生成问题
  async generateQuestions(count, isInitial = false) {
    const config = app.globalData.apiConfig;
    const prompt = this.generatePrompt(this.data.currentTopic, this.data.questionCounter, count, isInitial);

    try {
      const response = await this.callAI(prompt, config);
      const newQuestions = this.parseQuestions(response, this.data.currentTopic, this.data.questionCounter);

      if (newQuestions.length === 0) {
        throw new Error('未能生成有效的学习问题');
      }

      const allQuestions = [...this.data.currentQuestions, ...newQuestions];

      // 添加动画延迟
      newQuestions.forEach((question, index) => {
        question.animationDelay = index * 100; // 每个问题延迟100ms
      });

      this.setData({
        currentQuestions: allQuestions,
        showQuestions: true,
        questionCounter: this.data.questionCounter + newQuestions.length
      });

      this.updateProgress();
      this.saveTopicCache(this.data.currentTopic, { questions: allQuestions });

      wx.showToast({
        title: isInitial ? `🎉 成功生成 ${newQuestions.length} 个学习问题！` : `📖 已添加 ${newQuestions.length} 个新问题`,
        icon: 'success'
      });

    } catch (error) {
      throw error;
    }
  },

  // 生成提示词
  generatePrompt(topic, startIndex, count, isInitial) {
    const contextPrompt = isInitial ?
      `你是一个专业的学习顾问，用户想要深入学习"${topic}"。` :
      `用户正在学习"${topic}"，已经有${startIndex}个问题，现在需要${count}个更深入的问题。`;

    const difficultyPrompt = isInitial ?
      '问题应该从基础概念开始，逐步深入到实践应用、进阶技能和行业洞察。' :
      `基于前面${startIndex}个问题的基础，生成更高级、更深入的问题。`;

    return `${contextPrompt}

请根据以下要求生成${count}个高质量的学习问题：

1. ${difficultyPrompt}
2. 问题必须体现${topic}领域的核心知识点和精髓
3. 每个问题都要具体、可操作，能引导深度思考
4. 问题之间要有逻辑递进关系
5. 涵盖理论基础、实践应用、技能提升、行业洞察等维度

请直接输出问题列表，每个问题一行，格式如下：
${startIndex + 1}. 问题内容
${startIndex + 2}. 问题内容
...

不要添加其他说明文字，只输出编号和问题内容。`;
  },

  // 调用AI（支持流式输出和重试机制）
  async callAI(prompt, config, isStream = false, onStream = null, retryCount = 0) {
    const maxRetries = 3;
    const retryDelay = 1000 * (retryCount + 1); // 递增延迟

    const headers = { 'Content-Type': 'application/json' };

    if (config.provider === 'openai' || config.provider === 'deepseek' || config.provider === 'deepseek-nvidia') {
      headers['Authorization'] = `Bearer ${config.apiKey}`;
    }

    const requestBody = {
      model: config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
      stream: isStream
    };

    if (isStream && onStream) {
      // 流式输出模拟（小程序不支持真正的流式，用定时器模拟）
      return this.simulateStreamResponse(prompt, config, onStream);
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${config.baseUrl}/chat/completions`,
        method: 'POST',
        header: headers,
        data: requestBody,
        timeout: 60000, // 60秒超时，给AI更多响应时间
        success: (res) => {
          if (res.statusCode === 200) {
            let content = res.data.choices[0]?.message?.content || '';
            
            // 对于 DeepSeek NVIDIA 版，过滤思考过程
            if (config.provider === 'deepseek-nvidia') {
              content = this.filterThinkingProcess(content);
            }
            
            resolve(content);
          } else if (res.statusCode >= 500 && retryCount < maxRetries) {
            // 服务器错误，进行重试
            console.log(`API调用失败，${retryDelay}ms后进行第${retryCount + 1}次重试`);
            setTimeout(() => {
              this.callAI(prompt, config, isStream, onStream, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, retryDelay);
          } else {
            reject(new Error(`${res.statusCode} ${res.data.error?.message || '请求失败'}`));
          }
        },
        fail: (error) => {
          console.error('网络请求详细错误:', error);
          if (retryCount < maxRetries) {
            console.log(`网络请求失败，${retryDelay}ms后进行第${retryCount + 1}次重试`);
            // 显示重试提示给用户
            if (retryCount === 0) {
              wx.showToast({
                title: '网络不稳定，正在重试...',
                icon: 'loading',
                duration: 2000
              });
            }
            setTimeout(() => {
              this.callAI(prompt, config, isStream, onStream, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, retryDelay);
          } else {
            // 提供详细的错误信息和解决建议
            const errorMsg = this.getNetworkErrorMessage(error, config);
            reject(new Error(errorMsg));
          }
        }
      });
    });
  },

  // 过滤 DeepSeek NVIDIA 版的思考过程
  filterThinkingProcess(content) {
    if (!content) return content;
    
    // 移除 <think> 标签及其内容
    content = content.replace(/<think>[\s\S]*?<\/think>/g, '');
    
    // 移除其他可能的思考过程标记
    content = content.replace(/<\|beginning of thinking\|>[\s\S]*?<\|end of thinking\|>/g, '');
    
    // 清理多余的空行
    content = content.replace(/^\s*\n+/g, '').trim();
    
    return content;
  },

  // 获取网络错误信息和解决建议
  getNetworkErrorMessage(error, config) {
    console.log('分析网络错误:', error, config);

    // 检查常见问题
    if (!config || !config.baseUrl) {
      return '❌ API配置错误：请在设置中配置正确的API地址';
    }

    if (!config.apiKey) {
      return '❌ API密钥未配置：请在设置中输入有效的API密钥';
    }

    // 检查具体错误类型
    if (error && error.errMsg) {
      if (error.errMsg.includes('timeout')) {
        return `⏰ 请求超时 (60秒)
        
可能原因：
• AI服务器响应较慢
• 网络连接不稳定
• 问题过于复杂需要更长处理时间

解决方案：
1. 🔄 稍等片刻，系统会自动重试
2. 📶 检查网络信号强度
3. 🔀 尝试切换WiFi/4G网络
4. ✂️ 简化问题内容，减少复杂度
5. 🕐 选择网络较好的时段使用`;
      }

      if (error.errMsg.includes('fail')) {
        return `🌐 网络连接失败
        
可能原因：
• 网络连接中断
• API服务器不可达
• 防火墙或代理阻拦

解决方案：
1. 📶 检查网络连接状态
2. 🔄 尝试刷新网络连接
3. 🔀 切换到其他网络环境
4. ⚙️ 使用"网络诊断"功能检查配置`;
      }
    }

    // 提供通用解决方案
    return `🔧 网络请求失败
    
建议尝试：
1. 检查网络连接是否正常
2. 确认API地址和密钥配置正确
3. 尝试切换网络环境（WiFi/4G）
4. 使用"网络诊断"功能检查问题
5. 稍后重试或联系技术支持`;
  },

  // 模拟流式响应 - 微信小程序版本
  async simulateStreamResponse(prompt, config, onStream) {
    let thinkingInterval = null;

    try {
      // 显示动态思考状态
      let dots = 0;
      thinkingInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        const thinkingText = 'AI正在思考中' + '.'.repeat(dots);
        onStream(thinkingText);
      }, 500);

      // 调用API获取完整响应
      const fullResponse = await this.callAI(prompt, config, false);

      // 清除思考状态
      if (thinkingInterval) {
        clearInterval(thinkingInterval);
        thinkingInterval = null;
      }

      // 如果API调用成功，开始模拟流式输出
      if (fullResponse && fullResponse.length > 0) {
        let currentText = '';
        const chars = fullResponse.split('');

        // 逐字符输出
        for (let i = 0; i < chars.length; i++) {
          currentText += chars[i];
          onStream(currentText);

          // 根据字符调整延迟
          const char = chars[i];
          let delay = 30;

          if (char === '。' || char === '！' || char === '？') {
            delay = 200;
          } else if (char === '，' || char === '；') {
            delay = 100;
          } else if (char === '\n') {
            delay = 150;
          } else if (/[a-zA-Z0-9]/.test(char)) {
            delay = 20;
          }

          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } else {
        // 如果没有响应内容，显示错误
        onStream('抱歉，AI没有返回有效内容，请重试。');
      }

      return fullResponse;
    } catch (error) {
      // 清除思考状态
      if (thinkingInterval) {
        clearInterval(thinkingInterval);
        thinkingInterval = null;
      }

      console.error('流式输出错误:', error);

      // 显示错误信息而不是抛出异常
      const errorMessage = this.getNetworkErrorMessage(error, config);
      onStream(`❌ 请求失败\n\n${errorMessage}`);

      // 仍然抛出错误，让上层处理
      throw error;
    }
  },

  // 解析问题
  parseQuestions(response, topic, startIndex) {
    const lines = response.split('\n').filter(line => line.trim());
    const questions = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (/^\d+[.\s]/.test(trimmed)) {
        const question = trimmed.replace(/^\d+[.\s]*/, '').trim();
        if (question.length > 5) {
          const questionObj = {
            id: startIndex + questions.length + 1,
            question: question,
            topic: topic,
            answered: false,
            answer: null,
            category: this.getQuestionCategory(startIndex + questions.length, startIndex + 15),
            showAnswer: false,
            isGenerating: false,
            isLocked: false,
            isCollapsing: false,
            streamingAnswer: '',
            note: '', // 用户笔记
            showNoteInput: false // 是否显示笔记输入框
          };

          // 设置状态
          this.setQuestionStatus(questionObj);
          questions.push(questionObj);
        }
      }
    });

    return questions;
  },

  // 获取问题分类
  getQuestionCategory(index, total) {
    const ratio = index / total;
    if (ratio < 0.3) return '基础入门';
    if (ratio < 0.7) return '实践应用';
    if (ratio < 0.9) return '进阶技能';
    return '行业洞察';
  },

  // 设置问题状态
  setQuestionStatus(question) {
    const hasApiKey = app.hasApiKey();
    const isFreeQuestion = question.id <= 3;
    const canUseTopic = app.canUseTopicForFree(question.topic);

    if (question.answer) {
      question.statusClass = 'answered-icon';
      question.statusIcon = '✓';
      question.statusText = '已回答';
    } else if (hasApiKey) {
      question.statusClass = 'free-icon';
      question.statusIcon = '免';
      question.statusText = '免费';
    } else if (isFreeQuestion) {
      question.statusClass = 'free-icon';
      question.statusIcon = '免';
      question.statusText = '免费';
    } else if (canUseTopic) {
      question.statusClass = 'free-icon';
      question.statusIcon = '免';
      question.statusText = '已解锁';
    } else {
      question.statusClass = 'paid-icon';
      question.statusIcon = '💎';
      question.statusText = '付费';
      question.isLocked = true;
    }
  },

  // 切换答案显示（只处理展开收起）
  toggleAnswer(e) {
    const questionId = parseInt(e.currentTarget.dataset.id);
    const questions = [...this.data.currentQuestions];
    const questionIndex = questions.findIndex(q => q.id === questionId);

    if (questionIndex === -1) return;

    const question = questions[questionIndex];

    // 如果没有答案且没有在生成中，先生成答案
    if (!question.answer && !question.isGenerating) {
      this.generateAnswer(questionId);
      return;
    }

    // 如果有答案，直接切换显示状态
    if (question.answer) {
      question.showAnswer = !question.showAnswer;
      this.setData({ currentQuestions: questions });
    }
  },

  // 生成答案
  async generateAnswer(questionId) {
    const questions = [...this.data.currentQuestions];
    const questionIndex = questions.findIndex(q => q.id === questionId);

    if (questionIndex === -1) return;

    const question = questions[questionIndex];

    // 检查权限
    if (question.isLocked) {
      question.showAnswer = true;
      this.setData({ currentQuestions: questions });
      return;
    }

    // 检查是否有API密钥或主题权限
    if (!app.hasApiKey()) {
      const isFreeQuestion = question.id <= 3;
      const canUseTopic = app.canUseTopicForFree(question.topic);

      if (!isFreeQuestion && !canUseTopic) {
        question.showAnswer = true;
        question.isLocked = true;
        this.setData({ currentQuestions: questions });
        return;
      }

      // 处理主题使用逻辑
      if (isFreeQuestion) {
        wx.showToast({ title: `免费问题 ${question.id}/3，开始生成答案`, icon: 'success' });
      } else {
        const userTopics = app.globalData.userTopics;
        const usedTopics = app.globalData.usedTopics;
        const remainingTopics = userTopics === -1 ? '无限' : Math.max(0, userTopics - usedTopics.length);
        wx.showToast({ title: `使用主题权限生成答案，剩余 ${remainingTopics} 个主题`, icon: 'success' });
      }
    }

    // 设置友好的加载提示
    const loadingMessage = this.createFriendlyLoadingMessage();
    question.isGenerating = true;
    question.showAnswer = true;
    question.streamingAnswer = '';
    question.loadingIcon = loadingMessage.icon;
    question.loadingText = loadingMessage.text;
    question.loadingSubtitle = loadingMessage.subtitle;
    this.setData({ currentQuestions: questions });

    // 设置定时器来更新长时间等待的提示
    const startTime = Date.now();
    const loadingUpdateTimer = setInterval(() => {
      const duration = Date.now() - startTime;
      this.updateLoadingMessage(questionId, duration);
    }, 5000);

    try {
      const config = app.globalData.apiConfig;
      const prompt = `请详细回答以下关于"${question.topic}"的问题：

${question.question}

请提供专业、详细、实用的回答，包含：
1. 核心概念解释
2. 具体的例子和案例
3. 实践建议和操作步骤
4. 相关的注意事项
5. 进一步学习的方向

回答要结构清晰，内容丰富，对学习者有实际帮助。`;

      // 使用流式输出
      console.log('开始流式输出，问题ID:', questionId);
      const answer = await this.callAI(prompt, config, true, (streamText) => {
        const currentQuestions = [...this.data.currentQuestions];
        const streamQuestion = currentQuestions.find(q => q.id === questionId);
        if (streamQuestion) {
          streamQuestion.streamingAnswer = streamText;
          streamQuestion.formattedAnswer = this.formatAnswer(streamText);
          this.setData({ currentQuestions: currentQuestions });
        }
      });

      // 完成生成
      const finalQuestions = [...this.data.currentQuestions];
      const finalQuestion = finalQuestions.find(q => q.id === questionId);
      if (finalQuestion) {
        finalQuestion.answer = answer;
        finalQuestion.answered = true;
        finalQuestion.isGenerating = false;
        finalQuestion.streamingAnswer = '';
        finalQuestion.formattedAnswer = this.formatAnswer(answer);

        // 更新状态
        this.setQuestionStatus(finalQuestion);

        // 保存到历史记录
        this.saveToHistory(finalQuestion.question, answer, finalQuestion.topic);

        // 更新学习统计
        app.updateLearningStats('question_answered');
        this.updateLearningStats();

        this.setData({ currentQuestions: finalQuestions });
        this.updateProgress();

        // 保存缓存
        this.saveTopicCache(this.data.currentTopic, { questions: finalQuestions });
      }

    } catch (error) {
      console.error('生成答案失败:', error);
      
      // 清除加载提示定时器
      if (loadingUpdateTimer) {
        clearInterval(loadingUpdateTimer);
      }

      const errorQuestions = [...this.data.currentQuestions];
      const errorQuestion = errorQuestions.find(q => q.id === questionId);
      if (errorQuestion) {
        errorQuestion.isGenerating = false;
        errorQuestion.streamingAnswer = '';
        errorQuestion.showAnswer = true; // 显示错误信息

        // 错误信息已经通过流式输出显示了，这里只需要清理状态
        // 如果流式输出没有显示错误信息，则显示默认错误
        if (!errorQuestion.formattedAnswer || errorQuestion.formattedAnswer.includes('正在思考')) {
          const errorMsg = this.getNetworkErrorMessage(error, config);
          errorQuestion.formattedAnswer = `<div style="color: #EF4444; padding: 20rpx; background: #FEF2F2; border-radius: 8rpx; border-left: 4rpx solid #EF4444;">
            <div style="font-weight: bold; margin-bottom: 10rpx;">❌ 生成答案失败</div>
            <div style="font-size: 24rpx; white-space: pre-line;">${errorMsg}</div>
          </div>`;
        }

        this.setData({ currentQuestions: errorQuestions });
      }

      // 显示简短的错误提示
      wx.showToast({
        title: '生成失败，请重试',
        icon: 'error',
        duration: 2000
      });
    }
  },

  // 格式化答案（完整Markdown支持）
  formatAnswer(answer) {
    if (!answer) return '';

    return answer
      // 先处理代码块（避免内部内容被其他规则影响）
      .replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
        const cleanCode = code.trim();
        return `<div style="background: #F8F9FA; padding: 20rpx; border-radius: 8rpx; margin: 16rpx 0; font-family: 'Courier New', monospace; font-size: 24rpx; color: #374151; border-left: 4rpx solid #3B82F6; white-space: pre-wrap; overflow-x: auto;">${cleanCode}</div>`;
      })
      .replace(/`([^`\n]+)`/g, '<code style="background: #F1F5F9; padding: 2rpx 6rpx; border-radius: 4rpx; font-family: \'Courier New\', monospace; font-size: 24rpx; color: #DC2626; border: 1rpx solid #E2E8F0;">$1</code>')

      // 标题（按级别从高到低处理）
      .replace(/^#### (.*$)/gm, '<h4 style="color: #1E3A8A; font-weight: bold; margin: 16rpx 0 8rpx 0; font-size: 28rpx; border-bottom: 1rpx solid #E5E7EB; padding-bottom: 8rpx;">$1</h4>')
      .replace(/^### (.*$)/gm, '<h3 style="color: #1E3A8A; font-weight: bold; margin: 20rpx 0 10rpx 0; font-size: 32rpx; border-bottom: 2rpx solid #E5E7EB; padding-bottom: 10rpx;">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 style="color: #1E3A8A; font-weight: bold; margin: 24rpx 0 12rpx 0; font-size: 36rpx; border-bottom: 3rpx solid #3B82F6; padding-bottom: 12rpx;">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 style="color: #1E3A8A; font-weight: bold; margin: 28rpx 0 14rpx 0; font-size: 40rpx; border-bottom: 4rpx solid #1E3A8A; padding-bottom: 14rpx;">$1</h1>')

      // 粗体和斜体（支持多种格式）
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong style="color: #1F2937; font-weight: bold; font-style: italic;">$1</strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #1F2937; font-weight: bold;">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em style="color: #4B5563; font-style: italic;">$1</em>')
      .replace(/__(.*?)__/g, '<strong style="color: #1F2937; font-weight: bold;">$1</strong>')
      .replace(/_(.*?)_/g, '<em style="color: #4B5563; font-style: italic;">$1</em>')

      // 删除线
      .replace(/~~(.*?)~~/g, '<del style="color: #9CA3AF; text-decoration: line-through;">$1</del>')

      // 有序列表
      .replace(/^\d+\.\s+(.*)$/gm, '<div style="margin: 6rpx 0; padding-left: 24rpx; position: relative;"><span style="position: absolute; left: 0; color: #3B82F6; font-weight: bold;">•</span>$1</div>')

      // 无序列表
      .replace(/^[-*+]\s+(.*)$/gm, '<div style="margin: 6rpx 0; padding-left: 24rpx; position: relative;"><span style="position: absolute; left: 0; color: #10B981;">•</span>$1</div>')

      // 引用块
      .replace(/^>\s+(.*)$/gm, '<div style="margin: 12rpx 0; padding: 12rpx 16rpx; background: #F8FAFC; border-left: 4rpx solid #64748B; color: #475569; font-style: italic;">$1</div>')

      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<span style="color: #3B82F6; text-decoration: underline; font-weight: 500;">$1</span>')

      // 水平分割线
      .replace(/^---+$/gm, '<hr style="border: none; border-top: 2rpx solid #E5E7EB; margin: 24rpx 0;" />')

      // 表格（简单支持）
      .replace(/\|(.+)\|/g, (match, content) => {
        const cells = content.split('|').map(cell => cell.trim()).filter(cell => cell);
        const cellsHtml = cells.map(cell => `<span style="padding: 8rpx 12rpx; border: 1rpx solid #E5E7EB; display: inline-block; background: #F9FAFB;">${cell}</span>`).join('');
        return `<div style="margin: 8rpx 0; font-size: 24rpx;">${cellsHtml}</div>`;
      })

      // 换行处理
      .replace(/\n\n+/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  },

  // 收起答案
  collapseAnswer(e) {
    const questionId = parseInt(e.currentTarget.dataset.id);
    const questions = [...this.data.currentQuestions];
    const questionIndex = questions.findIndex(q => q.id === questionId);

    if (questionIndex !== -1) {
      // 添加收起动画
      questions[questionIndex].isCollapsing = true;
      this.setData({ currentQuestions: questions });

      // 延迟隐藏答案容器
      setTimeout(() => {
        const updatedQuestions = [...this.data.currentQuestions];
        const updatedQuestion = updatedQuestions.find(q => q.id === questionId);
        if (updatedQuestion) {
          updatedQuestion.showAnswer = false;
          updatedQuestion.isCollapsing = false;
          this.setData({ currentQuestions: updatedQuestions });

          // 滚动到对应的问题卡片
          setTimeout(() => {
            wx.pageScrollTo({
              selector: `.question-card:nth-child(${questionIndex + 1})`,
              duration: 300
            });
          }, 100);
        }
      }, 300);
    }
  },

  // 更新进度
  updateProgress() {
    const total = this.data.currentQuestions.length;
    const answered = this.data.currentQuestions.filter(q => q.answer).length;
    const percent = total > 0 ? Math.round((answered / total) * 100) : 0;

    this.setData({
      answeredCount: answered,
      progressPercent: percent
    });
  },

  // 保存主题缓存
  saveTopicCache(topic, data) {
    try {
      const cache = wx.getStorageSync('learning_cache') || {};
      cache[topic] = {
        ...data,
        lastUpdated: new Date().toISOString()
      };
      wx.setStorageSync('learning_cache', cache);
      app.globalData.learningCache = cache;
    } catch (error) {
      console.error('保存缓存失败:', error);
    }
  },

  // 保存到历史记录
  saveToHistory(question, answer, topic) {
    try {
      const history = wx.getStorageSync('qa_history') || [];
      history.push({
        question,
        answer,
        topic,
        timestamp: new Date().toISOString()
      });

      // 保持最近100条记录
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }

      wx.setStorageSync('qa_history', history);
      app.globalData.qaHistory = history;
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  },

  // 加载更多问题
  async loadMoreQuestions() {
    if (this.data.isGenerating) return;

    this.setData({
      isGenerating: true,
      loadMoreButtonText: '🔄 生成中...'
    });

    try {
      await this.generateQuestions(3, false);

      // 滚动到新问题位置
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 999999,
          duration: 300
        });
      }, 300);

    } catch (error) {
      wx.showToast({ title: '生成更多问题失败: ' + error.message, icon: 'error' });
    } finally {
      this.setData({
        isGenerating: false,
        loadMoreButtonText: '📖 加载更多问题 (+3)'
      });
    }
  },

  // 滚动到顶部
  scrollToTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 300
    });
  },

  // 显示随机主题
  showRandomTopic() {
    const topics = Object.values(app.globalData.industryTopics).flat();
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    this.setData({ topicInput: randomTopic });
    wx.showToast({ title: `随机选择：${randomTopic}`, icon: 'success' });
  },

  // 导出学习数据
  exportLearningData() {
    const cache = wx.getStorageSync('learning_cache') || {};
    const history = wx.getStorageSync('qa_history') || [];

    const exportData = {
      learningCache: cache,
      qaHistory: history,
      exportTime: new Date().toISOString(),
      userTopics: app.globalData.userTopics,
      usedTopics: app.globalData.usedTopics
    };

    // 在小程序中，可以将数据复制到剪贴板
    wx.setClipboardData({
      data: JSON.stringify(exportData, null, 2),
      success: () => {
        wx.showToast({ title: '学习数据已复制到剪贴板', icon: 'success' });
      }
    });
  },

  // 切换测试模式
  toggleTestMode() {
    app.globalData.isTestMode = !app.globalData.isTestMode;

    if (app.globalData.isTestMode) {
      // 切换到测试模式时，重置测试数据
      app.globalData.userTopics = 0;
      app.globalData.usedTopics = [];
      app.saveUserData();

      this.setData({
        testModeText: '测试付费模式',
        userCredits: 0,
        usedTopicsCount: 0,
        remainingTopics: 0,
        isTestMode: true
      });

      wx.showToast({ title: '已切换到测试付费模式，测试数据已重置', icon: 'success' });
    } else {
      this.setData({
        testModeText: '切换到测试模式',
        isTestMode: false
      });
      wx.showToast({ title: '已切换回正常模式', icon: 'success' });
    }

    // 重新渲染问题列表以更新图标和状态
    if (this.data.currentQuestions.length > 0) {
      const questions = [...this.data.currentQuestions];
      questions.forEach(q => {
        // 重新设置问题状态
        this.setQuestionStatus(q);
        // 强制收起所有展开的解锁界面
        if (q.showAnswer && q.isLocked) {
          q.showAnswer = false;
          q.isLocked = false; // 重置锁定状态
        }
      });

      // 强制更新数据
      this.setData({
        currentQuestions: questions
      });

      // 延迟再次更新，确保状态正确
      setTimeout(() => {
        const updatedQuestions = [...this.data.currentQuestions];
        updatedQuestions.forEach(q => this.setQuestionStatus(q));
        this.setData({ currentQuestions: updatedQuestions });
      }, 100);
    }
  },

  // 显示付费模态框
  showPaymentModal() {
    this.setData({ showPaymentModal: true });
    this.updatePaymentDisplay();
  },

  // 关闭付费模态框
  closePaymentModal() {
    this.setData({ showPaymentModal: false });
  },

  // 选择付费套餐
  selectPaymentOption(e) {
    const packageKey = e.currentTarget.dataset.package;
    this.setData({ currentPaymentPackage: packageKey });
    this.updatePaymentDisplay();
  },

  // 选择支付方式
  selectPaymentMethod(e) {
    const method = e.currentTarget.dataset.method;
    this.setData({ currentPaymentMethod: method });
    this.updatePaymentDisplay();
  },

  // 更新付费显示
  updatePaymentDisplay() {
    const packageInfo = this.data.paymentPackages.find(p => p.key === this.data.currentPaymentPackage);
    const qrCodeUrl = `/images/qr-${this.data.currentPaymentMethod}-${this.data.currentPaymentPackage}.png`;

    this.setData({
      currentPaymentAmount: packageInfo.price.toString(),
      currentQrCode: qrCodeUrl
    });
  },

  // 输入订单号
  onPaymentOrderIdInput(e) {
    this.setData({ paymentOrderId: e.detail.value });
  },

  // 输入验证金额
  onPaymentVerificationInput(e) {
    this.setData({ paymentVerification: e.detail.value });
  },

  // 验证付款
  async verifyPayment() {
    const orderId = this.data.paymentOrderId.trim();
    const inputAmount = parseFloat(this.data.paymentVerification);
    const expectedAmount = parseFloat(this.data.currentPaymentAmount);

    if (!orderId) {
      wx.showToast({ title: '请输入支付订单号', icon: 'error' });
      return;
    }

    if (!inputAmount || Math.abs(inputAmount - expectedAmount) > 0.01) {
      wx.showToast({ title: '请输入正确的付款金额', icon: 'error' });
      return;
    }

    // 检查订单号格式
    if (orderId.length < 10 || orderId.length > 50) {
      wx.showToast({ title: '订单号长度应在10-50位之间，请检查后重新输入', icon: 'error' });
      return;
    }

    if (!/^[a-zA-Z0-9\-_]+$/.test(orderId)) {
      wx.showToast({ title: '订单号只能包含数字、字母、短横线和下划线', icon: 'error' });
      return;
    }

    // 检查订单号是否已经使用过
    const usedOrders = wx.getStorageSync('used_orders') || [];
    if (usedOrders.includes(orderId)) {
      wx.showToast({ title: '此订单号已经使用过，请勿重复验证', icon: 'error' });
      return;
    }

    // 确认支付
    const confirmResult = await this.showConfirm(
      '确认支付验证',
      `订单号：${orderId}\n付款金额：¥${expectedAmount}\n\n请确认以上信息正确且您已完成支付？`
    );

    if (!confirmResult) {
      wx.showToast({ title: '请确认支付信息后再进行验证', icon: 'error' });
      return;
    }

    wx.showLoading({ title: '正在验证付款...' });

    // 模拟验证延时
    setTimeout(() => {
      wx.hideLoading();

      // 在实际应用中，这里应该是真实的API调用结果
      const paymentVerified = true;

      if (paymentVerified) {
        // 记录已使用的订单号
        usedOrders.push(orderId);
        wx.setStorageSync('used_orders', usedOrders);

        // 记录支付记录
        const paymentRecord = {
          orderId: orderId,
          amount: expectedAmount,
          package: this.data.currentPaymentPackage,
          method: this.data.currentPaymentMethod,
          timestamp: new Date().toISOString()
        };

        const paymentHistory = wx.getStorageSync('payment_history') || [];
        paymentHistory.push(paymentRecord);
        wx.setStorageSync('payment_history', paymentHistory);

        // 充值主题
        const packageInfo = this.data.paymentPackages.find(p => p.key === this.data.currentPaymentPackage);
        const currentTopics = app.globalData.userTopics;
        const newTopics = packageInfo.topics === -1 ? -1 : (currentTopics === -1 ? -1 : currentTopics + packageInfo.topics);

        app.globalData.userTopics = newTopics;
        app.saveUserData();

        this.setData({
          userCredits: newTopics === -1 ? '无限' : newTopics,
          remainingTopics: newTopics === -1 ? '无限' : Math.max(0, newTopics - app.globalData.usedTopics.length),
          showPaymentModal: false,
          paymentOrderId: '',
          paymentVerification: ''
        });

        wx.showToast({
          title: `🎉 充值成功！获得${packageInfo.topics === -1 ? '无限' : packageInfo.topics}个主题`,
          icon: 'success',
          duration: 3000
        });

        // 更新问题状态
        if (this.data.currentQuestions.length > 0) {
          const questions = [...this.data.currentQuestions];
          questions.forEach(q => this.setQuestionStatus(q));
          this.setData({ currentQuestions: questions });
        }

      } else {
        wx.showToast({ title: '付款验证失败，请检查订单号和金额', icon: 'error' });
      }
    }, 2000);
  },

  // 显示确认对话框
  showConfirm(title, content) {
    return new Promise((resolve) => {
      wx.showModal({
        title,
        content,
        success: (res) => {
          resolve(res.confirm);
        }
      });
    });
  },

  // 网络诊断
  async diagnoseNetwork() {
    wx.showLoading({ title: '正在诊断网络...' });

    try {
      // 检查基本网络连接
      const networkInfo = await new Promise((resolve) => {
        wx.getNetworkType({
          success: resolve,
          fail: () => resolve({ networkType: 'unknown' })
        });
      });

      // 检查API配置
      const config = app.globalData.apiConfig;
      let diagnosisResult = `📊 网络诊断结果\n\n`;

      // 网络类型
      diagnosisResult += `🌐 网络类型: ${networkInfo.networkType}\n`;

      // API配置检查
      if (!config) {
        diagnosisResult += `❌ API未配置\n`;
      } else {
        diagnosisResult += `✅ API已配置 (${config.provider})\n`;
        diagnosisResult += `📍 API地址: ${config.baseUrl}\n`;
        diagnosisResult += `🔑 密钥状态: ${config.apiKey ? '已设置' : '未设置'}\n`;
      }

      // 连接测试
      if (config && config.apiKey) {
        try {
          const testResult = await wx.request({
            url: `${config.baseUrl}/models`,
            method: 'GET',
            header: {
              'Authorization': `Bearer ${config.apiKey}`
            },
            timeout: 5000
          });
          diagnosisResult += `✅ API连接测试: 成功\n`;
        } catch (testError) {
          diagnosisResult += `❌ API连接测试: 失败\n`;
        }
      }

      wx.hideLoading();
      wx.showModal({
        title: '网络诊断',
        content: diagnosisResult,
        showCancel: false,
        confirmText: '知道了'
      });

    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: '诊断失败', icon: 'error' });
    }
  },

  // 跳转到设置页面
  goToSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' });
  },

  // 跳转到主题库
  goToTopics() {
    wx.navigateTo({ url: '/pages/topics/topics' });
  },

  // 跳转到学习成就
  goToAchievements() {
    wx.navigateTo({ url: '/pages/achievements/achievements' });
  },

  // 跳转到WebView版本
  goToWebView() {
    wx.showModal({
      title: '切换到Web版本',
      content: 'Web版本支持真正的流式输出，体验更佳。是否切换？',
      confirmText: '切换',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/webview/webview?page=index'
          });
        }
      }
    });
  },

  // 跳转到学习历史
  goToHistory() {
    wx.navigateTo({ url: '/pages/history/history' });
  },

  // 从主题库设置主题（不触发生成）
  setTopicFromSelection(topic) {
    this.setData({
      topicInput: topic,
      currentTopic: topic
    });
    wx.showToast({
      title: `已填入主题：${topic}`,
      icon: 'success'
    });
  },

  // 加载缓存数据
  loadCachedData(topic, data) {
    this.setData({
      currentTopic: topic,
      topicInput: topic,
      currentQuestions: data.questions || [],
      showQuestions: true,
      questionCounter: data.questions?.length || 0
    });
    this.updateProgress();
  },

  // 创建友好的加载提示消息
  createFriendlyLoadingMessage() {
    const loadingMessages = [
      {
        icon: '🤔',
        text: 'AI正在深度思考中',
        subtitle: '正在分析问题并整理最佳答案...'
      },
      {
        icon: '📚',
        text: '知识库检索中',
        subtitle: '正在查找相关资料为您提供准确答案...'
      },
      {
        icon: '✨',
        text: '智能分析进行中',
        subtitle: '正在运用AI算法生成个性化回答...'
      },
      {
        icon: '🧠',
        text: '大脑风暴中',
        subtitle: '正在从多个角度思考这个问题...'
      },
      {
        icon: '🔍',
        text: '深度解析中',
        subtitle: '正在为您准备详细而实用的解答...'
      },
      {
        icon: '💡',
        text: '灵感整理中',
        subtitle: '正在将复杂概念转化为易懂的内容...'
      }
    ];

    const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
    return randomMessage;
  },

  // 更新加载提示（用于长时间等待）
  updateLoadingMessage(questionId, duration) {
    const encouragingMessages = [
      '正在精心准备答案，请稍等片刻...',
      '好的内容需要时间，马上就好...',
      '正在为您量身定制最佳回答...',
      'AI正在努力思考，感谢您的耐心...',
      '复杂问题需要深度思考，请稍候...',
      '正在整合多方面知识为您服务...'
    ];

    if (duration > 5000) { // 5秒后显示鼓励消息
      const messageIndex = Math.floor((duration - 5000) / 3000) % encouragingMessages.length;
      const questions = [...this.data.currentQuestions];
      const question = questions.find(q => q.id === questionId);
      
      if (question && question.isGenerating) {
        question.loadingSubtitle = encouragingMessages[messageIndex];
        this.setData({ currentQuestions: questions });
      }
    }
  }
});