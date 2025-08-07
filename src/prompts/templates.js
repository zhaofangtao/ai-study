// 提示词模板系统

// 基础提示词模板
export const BASE_PROMPT_TEMPLATE = `你是一个专业的学习顾问，用户想要学习"{学习主题}"。请根据以下要求生成问题：

1. 生成10-15个递进式问题
2. 问题应涵盖：基础概念、实践应用、进阶技能、行业洞察
3. 问题要具体、可操作，避免过于宽泛
4. 按学习难度从易到难排序
5. 每个问题都应该能够引导深入学习

请以JSON格式输出，格式如下：
{
  "topic": "学习主题",
  "questions": [
    {
      "id": 1,
      "category": "basic|practice|advanced|industry",
      "question": "具体问题内容",
      "difficulty": "初级|中级|高级",
      "tags": ["标签1", "标签2"]
    }
  ]
}`;

// 领域特定提示词模板
export const DOMAIN_PROMPTS = {
  // 技术类
  technology: `你是一个资深技术专家，用户想要学习"{学习主题}"。请生成技术学习问题：

重点关注：
- 基础概念和原理理解
- 实际编程和项目实践
- 最佳实践和设计模式
- 行业应用和发展趋势
- 常见问题和解决方案

生成10-15个问题，包含代码示例需求和项目实践建议。`,

  // 艺术类
  art: `你是一个艺术教育专家，用户想要学习"{学习主题}"。请生成艺术学习问题：

重点关注：
- 基础技法和理论知识
- 创作过程和实践练习
- 美学原理和风格分析
- 艺术史和大师作品研究
- 个人风格发展和创新

生成10-15个问题，注重创作实践和美学理解。`,

  // 商业类
  business: `你是一个商业顾问专家，用户想要学习"{学习主题}"。请生成商业学习问题：

重点关注：
- 基础概念和商业模式
- 实际案例分析和应用
- 市场分析和竞争策略
- 行业趋势和未来发展
- 实操技能和工具使用

生成10-15个问题，包含案例分析和实践应用。`,

  // 科学类
  science: `你是一个科学研究专家，用户想要学习"{学习主题}"。请生成科学学习问题：

重点关注：
- 基础理论和科学原理
- 实验方法和研究技巧
- 数据分析和结果解读
- 前沿研究和发展方向
- 实际应用和社会影响

生成10-15个问题，注重理论理解和实验实践。`,

  // 生活技能类
  lifestyle: `你是一个生活技能专家，用户想要学习"{学习主题}"。请生成生活技能学习问题：

重点关注：
- 基础知识和入门技巧
- 实际操作和练习方法
- 进阶技能和专业提升
- 常见问题和解决方案
- 个人发展和持续改进

生成10-15个问题，注重实用性和可操作性。`
};

// 根据学习主题智能选择提示词模板
export function selectPromptTemplate(topic) {
  const topicLower = topic.toLowerCase();
  
  // 技术关键词
  const techKeywords = ['编程', 'python', 'javascript', 'java', 'react', '开发', '算法', '数据库', 'ai', '机器学习', '深度学习'];
  // 艺术关键词  
  const artKeywords = ['绘画', '插花', '摄影', '设计', '音乐', '舞蹈', '书法', '雕塑', '手工'];
  // 商业关键词
  const businessKeywords = ['营销', '管理', '创业', '投资', '金融', '电商', '运营', '销售'];
  // 科学关键词
  const scienceKeywords = ['物理', '化学', '生物', '数学', '医学', '心理学', '营养学'];
  
  if (techKeywords.some(keyword => topicLower.includes(keyword))) {
    return DOMAIN_PROMPTS.technology;
  } else if (artKeywords.some(keyword => topicLower.includes(keyword))) {
    return DOMAIN_PROMPTS.art;
  } else if (businessKeywords.some(keyword => topicLower.includes(keyword))) {
    return DOMAIN_PROMPTS.business;
  } else if (scienceKeywords.some(keyword => topicLower.includes(keyword))) {
    return DOMAIN_PROMPTS.science;
  } else {
    return DOMAIN_PROMPTS.lifestyle;
  }
}

// 生成最终提示词
export function generatePrompt(topic, customTemplate = null) {
  const template = customTemplate || selectPromptTemplate(topic);
  return template.replace(/\{学习主题\}/g, topic);
}