// Vercel 部署修复测试脚本
const https = require('https');
const http = require('http');

async function testVercelDeployment(baseUrl) {
  console.log('🔧 测试 Vercel 部署修复...\n');
  
  const tests = [
    {
      name: '基本连接测试',
      test: async () => {
        const response = await makeRequest(baseUrl + '/');
        if (response.statusCode !== 200) {
          throw new Error(`状态码: ${response.statusCode}`);
        }
        return '✅ 基本连接正常';
      }
    },
    {
      name: 'API 代理测试',
      test: async () => {
        try {
          const response = await makeRequest(baseUrl + '/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: 'https://httpbin.org/json',
              method: 'GET'
            })
          });
          
          if (response.statusCode === 200) {
            return '✅ API 代理正常工作';
          } else {
            return `⚠️ API 代理返回状态码: ${response.statusCode}`;
          }
        } catch (error) {
          return `❌ API 代理错误: ${error.message}`;
        }
      }
    },
    {
      name: '智能学习助手页面',
      test: async () => {
        const response = await makeRequest(baseUrl + '/智能学习助手.html');
        if (response.statusCode !== 200) {
          throw new Error(`页面无法访问: ${response.statusCode}`);
        }
        if (!response.body.includes('智学宝')) {
          throw new Error('页面内容不正确');
        }
        return '✅ 主页面加载正常';
      }
    },
    {
      name: 'CORS 头部检查',
      test: async () => {
        const response = await makeRequest(baseUrl + '/', {
          method: 'OPTIONS',
          headers: { 'Origin': 'https://example.com' }
        });
        
        const corsHeader = response.headers['access-control-allow-origin'];
        if (corsHeader) {
          return `✅ CORS 配置正确: ${corsHeader}`;
        } else {
          return '⚠️ CORS 头部可能缺失';
        }
      }
    }
  ];

  console.log(`🌐 测试目标: ${baseUrl}\n`);

  for (const { name, test } of tests) {
    try {
      console.log(`🔍 ${name}...`);
      const result = await test();
      console.log(`   ${result}\n`);
    } catch (error) {
      console.log(`   ❌ ${name} 失败: ${error.message}\n`);
    }
  }

  console.log('🎯 测试完成！');
  console.log('\n💡 如果所有测试通过，说明部署修复成功！');
  console.log('📝 如果仍有问题，请检查 Vercel 控制台的函数日志。');
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;

    const requestOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: 15000
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

// 使用方法
if (require.main === module) {
  const baseUrl = process.argv[2];
  
  if (!baseUrl) {
    console.log('使用方法: node vercel-fix-test.js <部署URL>');
    console.log('示例: node vercel-fix-test.js https://your-project.vercel.app');
    process.exit(1);
  }

  testVercelDeployment(baseUrl).catch(console.error);
}

module.exports = testVercelDeployment;