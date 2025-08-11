// API调试工具
export class APIDebugger {
  static async diagnoseConnection(config) {
    const { provider, apiKey, baseUrl, model } = config;
    const diagnosis = {
      provider,
      baseUrl,
      model,
      issues: [],
      suggestions: []
    };

    // 检查基本配置
    if (!apiKey || apiKey.trim().length === 0) {
      diagnosis.issues.push('API密钥为空');
      diagnosis.suggestions.push('请输入有效的API密钥');
    }

    if (!baseUrl || baseUrl.trim().length === 0) {
      diagnosis.issues.push('基础URL为空');
      diagnosis.suggestions.push('请输入正确的API基础URL');
    }

    if (!model || model.trim().length === 0) {
      diagnosis.issues.push('模型名称为空');
      diagnosis.suggestions.push('请输入正确的模型名称');
    }

    // 检查DeepSeek-R1特定配置
    if (provider === 'deepseek-nvidia') {
      if (!baseUrl.includes('integrate.api.nvidia.com')) {
        diagnosis.issues.push('DeepSeek R1应使用NVIDIA API端点');
        diagnosis.suggestions.push('基础URL应为: https://integrate.api.nvidia.com/v1');
      }

      if (model !== 'deepseek-ai/deepseek-r1') {
        diagnosis.issues.push('DeepSeek R1模型名称不正确');
        diagnosis.suggestions.push('模型名称应为: deepseek-ai/deepseek-r1');
      }

      // 检查API密钥格式
      if (apiKey && !apiKey.startsWith('nvapi-')) {
        diagnosis.issues.push('DeepSeek R1 API密钥格式可能不正确');
        diagnosis.suggestions.push('NVIDIA API密钥通常以"nvapi-"开头');
      }
    }

    // 网络连接测试
    try {
      const testUrl = new URL(baseUrl);
      diagnosis.urlValid = true;
    } catch (error) {
      diagnosis.issues.push('基础URL格式无效');
      diagnosis.suggestions.push('请检查URL格式，应包含协议(http/https)');
      diagnosis.urlValid = false;
    }

    return diagnosis;
  }

  static async testBasicConnectivity(baseUrl) {
    try {
      const url = new URL(baseUrl);
      const testResponse = await fetch(url.origin, {
        method: 'HEAD',
        mode: 'no-cors'
      });
      return true;
    } catch (error) {
      console.error('基础连接测试失败:', error);
      return false;
    }
  }

  static formatErrorMessage(error, provider) {
    const errorMessage = error.message || error.toString();
    
    // 常见错误的友好提示
    const errorMappings = {
      'fetch': '网络连接失败，请检查网络连接',
      '401': 'API密钥无效或已过期',
      '403': 'API访问被拒绝，请检查密钥权限',
      '404': 'API端点不存在，请检查URL和模型名称',
      '429': 'API请求频率超限，请稍后重试',
      '500': 'API服务器内部错误，请稍后重试',
      'CORS': '跨域请求被阻止，可能需要使用代理'
    };

    for (const [key, message] of Object.entries(errorMappings)) {
      if (errorMessage.includes(key)) {
        return message;
      }
    }

    // DeepSeek R1特定错误
    if (provider === 'deepseek-nvidia') {
      if (errorMessage.includes('model')) {
        return 'DeepSeek R1模型访问失败，请检查模型名称和API权限';
      }
      if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
        return 'API配额不足或达到使用限制';
      }
    }

    return errorMessage;
  }

  static getProviderSpecificTips(provider) {
    const tips = {
      'deepseek-nvidia': [
        '确保使用NVIDIA API密钥 (以nvapi-开头)',
        '模型名称必须是: deepseek-ai/deepseek-r1',
        '基础URL必须是: https://integrate.api.nvidia.com/v1',
        '检查NVIDIA账户是否有DeepSeek R1的访问权限',
        '确保API密钥未过期且有足够配额'
      ],
      'deepseek': [
        '使用DeepSeek官方API密钥',
        '基础URL: https://api.deepseek.com/v1',
        '模型名称: deepseek-chat'
      ],
      'openai': [
        '使用OpenAI API密钥 (以sk-开头)',
        '基础URL: https://api.openai.com/v1',
        '检查API密钥权限和余额'
      ]
    };

    return tips[provider] || [];
  }
}