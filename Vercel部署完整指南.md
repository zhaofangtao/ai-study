# 🚀 Vercel 部署智能学习助手完整指南

## 📋 目录
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [部署方法](#部署方法)
- [配置说明](#配置说明)
- [功能特性](#功能特性)
- [故障排除](#故障排除)
- [性能优化](#性能优化)
- [安全配置](#安全配置)

## 🚀 快速开始

### 一键部署按钮
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/smart-learning-assistant)

### 本地部署步骤

#### Windows 用户
```batch
# 运行部署脚本
deploy-windows.bat
```

#### Mac/Linux 用户
```bash
# 给脚本执行权限
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

#### 手动部署
```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署项目
vercel --prod
```

## 📁 项目结构

```
smart-learning-assistant/
├── 📁 public/                     # 静态文件目录
│   ├── 📄 index.html              # 入口页面
│   ├── 📄 智能学习助手.html        # 主应用文件
│   ├── 📄 manifest.json           # PWA 配置
│   ├── 📄 robots.txt              # 搜索引擎配置
│   └── 📄 sitemap.xml             # 站点地图
├── 📁 api/                        # Vercel API 函数
│   ├── 📄 proxy.js                # 标准 API 代理
│   └── 📄 stream-proxy.js         # 流式 API 代理
├── 📄 vercel.json                 # Vercel 配置文件
├── 📄 package.json                # 项目配置
├── 📄 .gitignore                  # Git 忽略文件
├── 📄 deploy.sh                   # Linux/Mac 部署脚本
├── 📄 deploy-windows.bat          # Windows 部署脚本
└── 📄 README.md                   # 项目说明
```

## 🌐 部署方法

### 方法一：GitHub 自动部署（推荐）

1. **推送代码到 GitHub**
```bash
git init
git add .
git commit -m "Initial commit: Smart Learning Assistant"
git branch -M main
git remote add origin https://github.com/yourusername/smart-learning-assistant.git
git push -u origin main
```

2. **在 Vercel 中导入**
- 访问 [vercel.com](https://vercel.com)
- 点击 "New Project"
- 选择 GitHub 仓库
- 点击 "Deploy"

### 方法二：Vercel CLI 部署

```bash
# 克隆或下载项目
git clone https://github.com/yourusername/smart-learning-assistant.git
cd smart-learning-assistant

# 安装并登录 Vercel CLI
npm install -g vercel
vercel login

# 部署到生产环境
vercel --prod
```

### 方法三：拖拽部署

1. 将项目文件夹压缩为 ZIP
2. 访问 [vercel.com](https://vercel.com)
3. 拖拽 ZIP 文件到页面
4. 等待自动部署完成

## ⚙️ 配置说明

### vercel.json 配置详解

```json
{
  "functions": {
    "api/proxy.js": {
      "runtime": "nodejs18.x"        // Node.js 运行时版本
    },
    "api/stream-proxy.js": {
      "runtime": "nodejs18.x"        // 流式代理函数
    }
  },
  "rewrites": [
    {
      "source": "/api/proxy",        // API 代理路径
      "destination": "/api/proxy.js"
    },
    {
      "source": "/api/stream-proxy", // 流式代理路径
      "destination": "/api/stream-proxy.js"
    },
    {
      "source": "/",                 // 根路径重定向
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"               // 允许跨域访问
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"         // 安全头部
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"            // 防止点击劫持
        }
      ]
    }
  ]
}
```

### 环境变量配置

在 Vercel 控制台设置以下环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | `sk-xxx...` |
| `OPENAI_API_KEY` | OpenAI API 密钥 | `sk-xxx...` |
| `CUSTOM_API_URL` | 自定义 API 地址 | `https://api.example.com` |

## 🎯 功能特性

### ✅ 已支持功能

- 🤖 **多 AI 模型支持**
  - DeepSeek-V3
  - DeepSeek-R1 NVIDIA
  - OpenAI GPT 系列
  - 自定义 API 端点

- 🎯 **智能学习功能**
  - AI 问题生成
  - 智能问答
  - 学习进度追踪
  - 历史记录管理

- 🔄 **实时交互**
  - 流式输出支持
  - 实时生成进度
  - 响应式界面

- 📱 **跨平台支持**
  - 桌面端优化
  - 移动端适配
  - PWA 支持

### 🌟 Vercel 特性

- ⚡ **性能优化**
  - 全球 CDN 加速
  - 自动压缩
  - 智能缓存

- 🔒 **安全保障**
  - HTTPS 强制
  - 安全头部
  - CORS 控制

- 🚀 **部署优势**
  - 零配置部署
  - 自动更新
  - 实时日志

## 🔍 故障排除

### 常见问题及解决方案

#### 1. CORS 跨域错误
**问题**：前端调用 API 时出现跨域错误
**解决**：
```javascript
// 使用代理 API 而不是直接调用
const response = await fetch('/api/proxy', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://api.deepseek.com/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    body: requestData
  })
});
```

#### 2. API 函数超时
**问题**：API 请求超时
**解决**：
- 检查 API 密钥是否正确
- 确认网络连接正常
- 查看 Vercel 函数日志

#### 3. 静态文件无法访问
**问题**：HTML 文件返回 404
**解决**：
- 确认文件在 `public/` 目录下
- 检查文件名是否正确
- 验证 `vercel.json` 配置

#### 4. 部署失败
**问题**：部署过程中出错
**解决**：
```bash
# 查看详细错误信息
vercel logs

# 重新部署
vercel --prod --force
```

### 调试方法

#### 本地调试
```bash
# 启动本地开发服务器
vercel dev

# 访问本地应用
open http://localhost:3000
```

#### 查看日志
```bash
# 实时查看日志
vercel logs --follow

# 查看特定函数日志
vercel logs --function=api/proxy
```

#### 测试 API 函数
```bash
# 测试代理函数
curl -X POST http://localhost:3000/api/proxy \
  -H "Content-Type: application/json" \
  -d '{"url":"https://api.deepseek.com/v1/models","method":"GET"}'
```

## 📊 性能优化

### 自动优化功能

- **全球 CDN**：Vercel 自动提供全球内容分发
- **智能压缩**：自动 Gzip/Brotli 压缩
- **图片优化**：自动图片格式转换和压缩
- **缓存策略**：智能缓存配置

### 手动优化建议

#### 1. 资源优化
```html
<!-- 预加载关键资源 -->
<link rel="preload" href="/智能学习助手.html" as="document">

<!-- 延迟加载非关键资源 -->
<script defer src="analytics.js"></script>
```

#### 2. 缓存配置
```json
{
  "headers": [
    {
      "source": "/智能学习助手.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ]
}
```

#### 3. 代码分割
- 将大型 JavaScript 文件分割
- 按需加载功能模块
- 使用动态导入

### 性能监控

#### Vercel Analytics
```javascript
// 添加到 HTML 文件中
import { Analytics } from '@vercel/analytics/react';

function MyApp() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  );
}
```

#### 性能指标
- **FCP**：首次内容绘制
- **LCP**：最大内容绘制
- **FID**：首次输入延迟
- **CLS**：累积布局偏移

## 🔐 安全配置

### 安全头部设置

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"
        }
      ]
    }
  ]
}
```

### API 密钥保护

1. **环境变量存储**
```javascript
// 在 Vercel 函数中使用
const apiKey = process.env.DEEPSEEK_API_KEY;
```

2. **请求验证**
```javascript
// 验证请求来源
const origin = req.headers.origin;
const allowedOrigins = ['https://yourdomain.vercel.app'];

if (!allowedOrigins.includes(origin)) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

3. **速率限制**
```javascript
// 简单的速率限制
const rateLimiter = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const requests = rateLimiter.get(ip) || [];
  const recentRequests = requests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= 10) {
    return false;
  }
  
  recentRequests.push(now);
  rateLimiter.set(ip, recentRequests);
  return true;
}
```

## 🎯 高级配置

### 自定义域名

1. **添加域名**
- 在 Vercel 项目设置中添加域名
- 配置 DNS 记录指向 Vercel

2. **SSL 证书**
- Vercel 自动提供 SSL 证书
- 支持通配符证书

### 多环境部署

```json
{
  "builds": [
    {
      "src": "public/**",
      "use": "@vercel/static"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  }
}
```

### 边缘函数

```javascript
// api/edge-function.js
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  return new Response('Hello from Edge!', {
    status: 200,
    headers: {
      'content-type': 'text/plain',
    },
  });
}
```

## 📈 监控和分析

### Vercel Analytics
- 页面访问统计
- 用户行为分析
- 性能指标监控

### 自定义监控
```javascript
// 添加自定义事件追踪
function trackEvent(eventName, properties) {
  if (typeof window !== 'undefined' && window.va) {
    window.va('track', eventName, properties);
  }
}

// 使用示例
trackEvent('question_generated', {
  topic: 'JavaScript',
  difficulty: 'medium'
});
```

## 🤝 贡献指南

### 开发流程

1. **Fork 项目**
2. **创建功能分支**
```bash
git checkout -b feature/new-feature
```

3. **提交更改**
```bash
git commit -m "Add new feature"
```

4. **推送分支**
```bash
git push origin feature/new-feature
```

5. **创建 Pull Request**

### 代码规范

- 使用 ESLint 进行代码检查
- 遵循 Prettier 格式化规则
- 添加适当的注释和文档

## 📞 技术支持

### 获取帮助

- 📖 [Vercel 官方文档](https://vercel.com/docs)
- 💬 [GitHub Issues](https://github.com/yourusername/smart-learning-assistant/issues)
- 📧 技术支持邮箱

### 常用链接

- [Vercel 控制台](https://vercel.com/dashboard)
- [部署日志](https://vercel.com/dashboard/deployments)
- [域名管理](https://vercel.com/dashboard/domains)
- [环境变量](https://vercel.com/dashboard/settings/environment-variables)

---

🎉 **恭喜！你现在已经掌握了在 Vercel 上部署智能学习助手的完整流程！**

如果遇到任何问题，请查看故障排除部分或提交 Issue 获取帮助。