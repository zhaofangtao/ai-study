const http = require('http');
const fs = require('fs');
const path = require('path');

// CORS代理处理函数
async function handleProxy(req, res, body) {
    try {
        const { url, method = 'POST', headers = {}, body: requestBody, stream = false } = JSON.parse(body);
        
        console.log('代理请求:', {
            url,
            method,
            stream,
            headers: { ...headers, Authorization: headers.Authorization ? headers.Authorization.substring(0, 20) + '...' : 'none' }
        });

        // 动态导入fetch
        const fetch = globalThis.fetch || (await import('node-fetch')).default;

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: method !== 'GET' ? JSON.stringify(requestBody) : undefined
        });

        console.log('API响应状态:', response.status);

        // 设置CORS头
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (!response.ok) {
            const errorData = await response.text();
            console.error('API错误响应:', errorData);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = response.status;
            res.end(errorData);
            return;
        }

        // 处理流式响应
        if (stream && requestBody.stream) {
            console.log('处理流式响应');
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    
                    if (done) {
                        console.log('流式响应结束');
                        res.write('data: [DONE]\n\n');
                        break;
                    }

                    const chunk = decoder.decode(value, { stream: true });
                    console.log('收到流式数据块:', chunk.substring(0, 100) + '...');
                    
                    // 直接转发原始数据，保持SSE格式
                    res.write(chunk);
                }
            } finally {
                reader.releaseLock();
            }

            res.end();
        } else {
            // 处理非流式响应
            const data = await response.text();
            console.log('API成功响应长度:', data.length);
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 200;
            res.end(data);
        }

    } catch (error) {
        console.error('代理错误:', error);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 500;
        res.end(JSON.stringify({ error: error.message }));
    }
}

// 获取文件MIME类型
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };
    return mimeTypes[ext] || 'text/plain';
}

// 创建HTTP服务器
const server = http.createServer(async (req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

    // 处理CORS预检请求
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.statusCode = 200;
        res.end();
        return;
    }

    // 处理API代理请求
    if ((req.url === '/api/proxy' || req.url === '/api/stream-proxy') && req.method === 'POST') {
        console.log(`🔄 处理代理请求: ${req.url}`);
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            console.log(`📦 收到请求体，长度: ${body.length}`);
            handleProxy(req, res, body);
        });
        return;
    }

    // 处理静态文件请求
    let filePath = req.url === '/' ? '/智能学习助手.html' : req.url;
    filePath = path.join(__dirname, filePath);

    try {
        if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const content = fs.readFileSync(filePath);
            const mimeType = getMimeType(filePath);
            
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.statusCode = 200;
            res.end(content);
        } else {
            res.statusCode = 404;
            res.end('File not found');
        }
    } catch (error) {
        console.error('文件读取错误:', error);
        res.statusCode = 500;
        res.end('Internal server error');
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 本地服务器启动成功！`);
    console.log(`📱 访问地址: http://localhost:${PORT}`);
    console.log(`🔧 智能学习助手: http://localhost:${PORT}/智能学习助手.html`);
    console.log(`🌊 流式代理测试: http://localhost:${PORT}/test-stream-proxy.html`);
    console.log(`🧪 简单测试: http://localhost:${PORT}/simple-test.html`);
    console.log(`🔍 调试工具: http://localhost:${PORT}/debug-deepseek-r1.html`);
    console.log(`🎬 等待动画测试: http://localhost:${PORT}/test-loading-animation.html`);
    console.log(`\n按 Ctrl+C 停止服务器`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭服务器...');
    server.close(() => {
        console.log('✅ 服务器已关闭');
        process.exit(0);
    });
});