// AI服务 - 处理与AI API的交互
import { API_PROVIDERS } from '../config/constants.js';
import { generatePrompt } from '../prompts/templates.js';
import { StorageService } from './storageService.js';

export class AIService {
  constructor() {
    this.config = null;
    this.loadConfig();
  }

  // 加载API配置
  async loadConfig() {
    this.config = await StorageService.getApiConfig();
  }

  // 设置API配置
  async setConfig(config) {
    this.config = config;
    await StorageService.setApiConfig(config);
  }

  // 生成学习问题
  async generateQuestions(topic, customPrompt = null) {
    if (!this.config || !this.config.apiKey) {
      throw new Error('请先配置AI API密钥');
    }

    const prompt = customPrompt || generatePrompt(topic);
    
    try {
      const response = await this.callAI(prompt);
      return this.parseQuestionsResponse(response, topic);
    } catch (error) {
      console.error('生成问题失败:', error);
      throw new Error('生成问题失败，请检查网络连接和API配置');
    }
  }

  // 回答问题
  async answerQuestion(question, context = '') {
    if (!this.config || !this.config.apiKey) {
      throw new Error('请先配置AI API密钥');
    }

    const prompt = this.buildAnswerPrompt(question, context);
    
    try {
      const response = await this.callAI(prompt);
      return response;
    } catch (error) {
      console.error('回答问题失败:', error);
      throw new Error('回答问题失败，请检查网络连接和API配置');
    }
  }

  // 流式回答问题
  async answerQuestionStream(question, context = '', onChunk) {
    if (!this.config || !this.config.apiKey) {
      throw new Error('请先配置AI API密钥');
    }

    const prompt = this.buildAnswerPrompt(question, context);
    
    try {
      const response = await this.callAIStream(prompt, onChunk);
      return response;
    } catch (error) {
      console.error('流式回答问题失败:', error);
      throw new Error('回答问题失败，请检查网络连接和API配置');
    }
  }

  // 调用AI API (非流式)
  async callAI(prompt) {
    const { provider, apiKey, baseUrl, model } = this.config;
    
    const headers = {
      'Content-Type': 'application/json',
    };

    // 根据不同提供商设置认证头
    if (provider === 'openai' || provider === 'deepseek' || provider === 'deepseek-nvidia') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider === 'claude') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    }

    const requestBody = this.buildRequestBody(prompt, provider, model);
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API请求失败: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return this.extractResponse(data, provider);
  }

  // 流式调用AI API
  async callAIStream(prompt, onChunk) {
    const { provider, apiKey, baseUrl, model } = this.config;
    
    const headers = {
      'Content-Type': 'application/json',
    };

    // 根据不同提供商设置认证头
    if (provider === 'openai' || provider === 'deepseek' || provider === 'deepseek-nvidia') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (provider === 'claude') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    }

    const requestBody = this.buildRequestBody(prompt, provider, model, true);
    
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API请求失败: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                // 实时过滤思考过程
                const filteredContent = this.filterThinkingProcess(fullContent, this.config.provider);
                onChunk(content, filteredContent);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return fullContent;
  }

  // 构建请求体
  buildRequestBody(prompt, provider, model, stream = false) {
    const baseBody = {
      model,
      temperature: 0.7,
      max_tokens: 2000,
      stream
    };

    if (provider === 'claude') {
      return {
        ...baseBody,
        messages: [{ role: 'user', content: prompt }]
      };
    } else if (provider === 'deepseek-nvidia') {
      // 为DeepSeek NVIDIA添加特殊处理
      return {
        ...baseBody,
        messages: [
          { 
            role: 'system', 
            content: '你是一个专业的学习顾问助手。请直接回答问题，不要显示思考过程。' 
          },
          { role: 'user', content: prompt }
        ]
      };
    } else {
      return {
        ...baseBody,
        messages: [
          { role: 'system', content: '你是一个专业的学习顾问助手。' },
          { role: 'user', content: prompt }
        ]
      };
    }
  }

  // 提取响应内容
  extractResponse(data, provider) {
    let content = '';
    if (provider === 'claude') {
      content = data.content[0]?.text || '';
    } else {
      content = data.choices[0]?.message?.content || '';
    }
    
    // 过滤思考过程
    return this.filterThinkingProcess(content, provider);
  }

  // 过滤思考过程
  filterThinkingProcess(content, provider) {
    if (provider === 'deepseek-nvidia') {
      // 移除 <|beginning of thinking|> ... <|end of thinking|> 块
      content = content.replace(/<\|beginning of thinking\|>[\s\S]*?<\|end of thinking\|>/g, '');
      
      // 移除 <think> ... </think> 块
      content = content.replace(/<think>[\s\S]*?<\/think>/g, '');
      
      // 清理多余的空行
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
    }
    
    return content;
  }

  // 解析问题生成响应
  parseQuestionsResponse(response, topic) {
    try {
      // 尝试解析JSON响应
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          return {
            topic: parsed.topic || topic,
            questions: parsed.questions.map((q, index) => ({
              id: q.id || index + 1,
              category: q.category || 'basic',
              question: q.question,
              difficulty: q.difficulty || '初级',
              tags: q.tags || [],
              answered: false,
              favorite: false
            }))
          };
        }
      }

      // 如果JSON解析失败，尝试文本解析
      return this.parseTextResponse(response, topic);
    } catch (error) {
      console.error('解析响应失败:', error);
      return this.parseTextResponse(response, topic);
    }
  }

  // 解析文本格式响应
  parseTextResponse(response, topic) {
    const lines = response.split('\n').filter(line => line.trim());
    const questions = [];
    let currentCategory = 'basic';

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      
      // 检测分类标题
      if (trimmed.includes('基础') || trimmed.includes('入门')) {
        currentCategory = 'basic';
      } else if (trimmed.includes('实践') || trimmed.includes('操作')) {
        currentCategory = 'practice';
      } else if (trimmed.includes('进阶') || trimmed.includes('高级')) {
        currentCategory = 'advanced';
      } else if (trimmed.includes('行业') || trimmed.includes('前沿')) {
        currentCategory = 'industry';
      }

      // 提取问题（以数字开头或包含问号）
      if (/^\d+[.\s]/.test(trimmed) || trimmed.includes('？') || trimmed.includes('?')) {
        const question = trimmed.replace(/^\d+[.\s]*/, '').trim();
        if (question.length > 5) {
          questions.push({
            id: questions.length + 1,
            category: currentCategory,
            question,
            difficulty: this.inferDifficulty(currentCategory),
            tags: [],
            answered: false,
            favorite: false
          });
        }
      }
    });

    return {
      topic,
      questions: questions.slice(0, 15) // 限制最多15个问题
    };
  }

  // 推断问题难度
  inferDifficulty(category) {
    const difficultyMap = {
      basic: '初级',
      practice: '中级', 
      advanced: '高级',
      industry: '高级'
    };
    return difficultyMap[category] || '初级';
  }

  // 构建回答问题的提示词
  buildAnswerPrompt(question, context) {
    let prompt = `请详细回答以下问题：\n\n${question}\n\n`;
    
    if (context) {
      prompt += `相关背景信息：\n${context}\n\n`;
    }
    
    prompt += `请提供：
1. 清晰准确的答案
2. 具体的例子或案例
3. 实用的建议或步骤
4. 相关的延伸知识点

回答要专业但易懂，适合学习者理解。`;

    return prompt;
  }
}