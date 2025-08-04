// Vercel 部署测试脚本
const https = require('https');
const http = require('http');

class DeploymentTester {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // 移除末尾斜杠
    this.results = [];
  }

  async runAllTests() {
    console.log('🧪 开始测试 Vercel 部署...\n');
    
    const tests = [
      { name: '主页访问', test: () => this.testMainPage() },
      { name: '智能学习助手页面', test: () => this.testLearningPage() },
      { name: 'API 代理功能', test: () => this.testApiProxy() },
      { name: '流式代理功能', test: () => this.testStreamProxy() },
      { name: '静态资源', test: () => this.testStaticResources() },
      { name: 'CORS 头部', test: () => this.testCorsHeaders() },
      { name: '安全头部', test: () => this.testSecurityHeaders() },
      { name: 'PWA 配置', test: () => this.testPwaConfig() }
    ];

    for (const { name, test } of tests) {
      try {
        console.log(`🔍 测试: ${name}`);
        const result = await test();
        this.results.push({ name, status: 'PASS', result });
        console.log(`✅ ${name}: 通过\n`);
      } catch (error) {
        this.results.push({ name, status: 'FAIL', error: error.message });
        console.log(`❌ ${name}: 失败 - ${error.message}\n`);
      }
    }

    this.printSummary();
  }

  async testMainPage() {
    const response = await this.makeRequest('/');
    if (response.statusCode !== 200) {
      throw new Error(`状态码: ${response.statusCode}`);
    }
    return '主页可正常访问';
  }

  async testLearningPage() {
    const response = await this.makeRequest('/智能学习助手.html');
    if (response.statusCode !== 200) {
      throw new Error(`状态码: ${response.statusCode}`);
    }
    if (!response.body.includes('智学宝')) {
      throw new Error('页面内容不正确');
    }
    return '学习助手页面加载正常';
  }

  async testApiProxy() {
    const testData = {
      url: 'https://httpbin.org/json',
      method: 'GET'
    };

    const response = await this.makeRequest('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    if (response.statusCode !== 200) {
      throw new Error(`API 代理失败: ${response.statusCode}`);
    }

    return 'API 代理功能正常';
  }

  async testStreamProxy() {
    // 测试流式代理是否存在
    const response = await this.makeRequest('/api/stream-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://httpbin.org/json', method: 'GET' })
    });

    // 流式代理可能返回不同的状态码，只要不是 404 就算通过
    if (response.statusCode === 404) {
      throw new Error('流式代理端点不存在');
    }

    return '流式代理端点存在';
  }

  async testStaticResources() {
    const resources = ['/manifest.json', '/robots.txt', '/sitemap.xml'];
    const results = [];

    for (const resource of resources) {
      try {
        const response = await this.makeRequest(resource);
        results.push(`${resource}: ${response.statusCode === 200 ? '✓' : '✗'}`);
      } catch (error) {
        results.push(`${resource}: ✗`);
      }
    }

    return results.join(', ');
  }

  async testCorsHeaders() {
    const response = await this.makeRequest('/', {
      method: 'OPTIONS',
      headers: { 'Origin': 'https://example.com' }
    });

    const corsHeader = response.headers['access-control-allow-origin'];
    if (!corsHeader) {
      throw new Error('缺少 CORS 头部');
    }

    return `CORS 配置正确: ${corsHeader}`;
  }

  async testSecurityHeaders() {
    const response = await this.makeRequest('/');
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ];

    const missing = securityHeaders.filter(header => !response.headers[header]);
    if (missing.length > 0) {
      throw new Error(`缺少安全头部: ${missing.join(', ')}`);
    }

    return '安全头部配置正确';
  }

  async testPwaConfig() {
    const response = await this.makeRequest('/manifest.json');
    if (response.statusCode !== 200) {
      throw new Error('PWA manifest 不存在');
    }

    try {
      const manifest = JSON.parse(response.body);
      if (!manifest.name || !manifest.start_url) {
        throw new Error('PWA manifest 配置不完整');
      }
    } catch (error) {
      throw new Error('PWA manifest 格式错误');
    }

    return 'PWA 配置正确';
  }

  makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = `${this.baseUrl}${path}`;
      const isHttps = url.startsWith('https:');
      const client = isHttps ? https : http;

      const requestOptions = {
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: 10000
      };

      const req = client.request(url, requestOptions, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('请求超时')));

      if (options.body) {
        req.write(options.body);
      }

      req.end();
    });
  }

  printSummary() {
    console.log('📊 测试结果汇总:');
    console.log('='.repeat(50));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;

    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      if (result.status === 'FAIL') {
        console.log(`   错误: ${result.error}`);
      }
    });

    console.log('='.repeat(50));
    console.log(`总计: ${this.results.length} 项测试`);
    console.log(`通过: ${passed} 项`);
    console.log(`失败: ${failed} 项`);
    console.log(`成功率: ${Math.round((passed / this.results.length) * 100)}%`);

    if (failed === 0) {
      console.log('\n🎉 所有测试通过！部署成功！');
    } else {
      console.log('\n⚠️  部分测试失败，请检查配置');
    }
  }
}

// 使用方法
if (require.main === module) {
  const baseUrl = process.argv[2];
  
  if (!baseUrl) {
    console.log('使用方法: node test-deployment.js <部署URL>');
    console.log('示例: node test-deployment.js https://your-project.vercel.app');
    process.exit(1);
  }

  const tester = new DeploymentTester(baseUrl);
  tester.runAllTests().catch(console.error);
}

module.exports = DeploymentTester;