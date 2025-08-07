// Vercel API 代理函数，解决 CORS 问题
module.exports = async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, anthropic-version');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { url, method = 'POST', headers = {}, body } = req.body || {};

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // 动态导入 node-fetch（如果需要）
    let fetch;
    try {
      fetch = globalThis.fetch || require('node-fetch');
    } catch (e) {
      // 使用内置 fetch（Node.js 18+）
      fetch = globalThis.fetch;
    }

    // 发起代理请求
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: method !== 'GET' ? JSON.stringify(body) : undefined
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy request failed',
      message: error.message 
    });
  }
};