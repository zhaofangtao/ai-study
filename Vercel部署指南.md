# Vercel 部署智能学习助手指南

## 🚀 快速部署

### 方法一：通过 Vercel CLI 部署

1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

2. **登录 Vercel**
```bash
vercel login
```

3. **部署项目**
```bash
vercel --prod
```

### 方法二：通过 GitHub 自动部署

1. **推送代码到 GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/smart-learning-assistant.git
git push -u origin main
```

2. **在 Vercel 中导入项目**
- 访问 [vercel.com](https://vercel.com)
- 点击 "New Project"
- 选择你的 GitHub 仓库
- 点击 "Deploy"

## 📁 项目结构

```
smart-learning-assistant/
├── public/
│   ├── index.html              # 入口页面
│   └── 智能学习助手.html        # 主应用
├── api/
│   └── proxy.js               # API 代理函数
├── vercel.json                # Vercel 配置
├── package.json               # 项目配置
└── README.md                  # 说明文档
```

## ⚙️ 配置说明

### vercel.json 配置
- **API 代理**：解决 CORS 跨域问题
- **静态文件服务**：直接访问 HTML 文件
- **自定义头部**：设置安全和缓存策略

### API 代理功能
- 代理 AI API 请求
- 自动处理 CORS 头
- 支持所有 HTTP 方法
- 错误处理和日志记录

## 🌐 访问方式

部署成功后，你可以通过以下方式访问：

1. **主域名**：`https://your-project.vercel.app`
2. **直接访问**：`https://your-project.vercel.app/智能学习助手.html`

## 🔧 本地开发

1. **安装依赖**
```bash
npm install
```

2. **启动开发服务器**
```bash
npm run dev
```

3. **访问应用**
```
http://localhost:3000
```

## 📱 功能特性

### ✅ 已支持功能
- 🎯 AI 问题生成
- 💬 智能问答
- 📚 学习历史记录
- 🔄 流式输出
- 📊 学习统计
- 🎨 响应式设计
- 🔐 API 密钥配置

### 🌟 Vercel 优化
- ⚡ 全球 CDN 加速
- 🔒 HTTPS 自动配置
- 🚀 零配置部署
- 📈 实时分析
- 🔄 自动更新

## 🛠️ 自定义配置

### 环境变量
在 Vercel 控制台中设置环境变量：

```
DEEPSEEK_API_KEY=your_deepseek_key
OPENAI_API_KEY=your_openai_key
```

### 域名配置
1. 在 Vercel 项目设置中添加自定义域名
2. 配置 DNS 记录指向 Vercel
3. 自动获得 SSL 证书

## 🔍 故障排除

### 常见问题

1. **CORS 错误**
   - 确保使用 `/api/proxy` 端点
   - 检查 `vercel.json` 配置

2. **API 调用失败**
   - 验证 API 密钥是否正确
   - 检查网络连接

3. **页面无法访问**
   - 确认文件在 `public/` 目录下
   - 检查文件名是否正确

### 调试方法

1. **查看部署日志**
```bash
vercel logs
```

2. **本地测试**
```bash
vercel dev
```

3. **检查函数日志**
在 Vercel 控制台查看 Functions 日志

## 📊 性能优化

### 建议配置
- 启用 Gzip 压缩
- 设置适当的缓存策略
- 优化图片和资源
- 使用 CDN 加速

### 监控指标
- 页面加载时间
- API 响应时间
- 错误率统计
- 用户访问量

## 🔐 安全考虑

1. **API 密钥保护**
   - 使用环境变量存储
   - 不要在前端暴露密钥

2. **CORS 配置**
   - 限制允许的域名
   - 设置适当的请求头

3. **内容安全**
   - 设置 CSP 头部
   - 防止 XSS 攻击

## 📈 扩展功能

### 可添加功能
- 用户认证系统
- 数据库集成
- 实时通知
- 多语言支持
- 主题定制

### 集成服务
- Vercel Analytics
- Vercel Speed Insights
- 第三方监控服务

## 🎯 最佳实践

1. **代码组织**
   - 保持文件结构清晰
   - 使用语义化命名
   - 添加适当注释

2. **部署流程**
   - 使用 Git 版本控制
   - 设置自动部署
   - 定期备份数据

3. **用户体验**
   - 优化加载速度
   - 提供错误提示
   - 支持移动设备

## 📞 技术支持

如果遇到问题，可以：
1. 查看 Vercel 官方文档
2. 检查项目配置文件
3. 查看部署日志
4. 联系技术支持

---

🎉 **恭喜！你的智能学习助手现在可以在 Vercel 上运行了！**