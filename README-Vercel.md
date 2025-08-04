# 🎓 智学宝 - Vercel 部署版

> 基于 AI 的智能学习助手，现已支持 Vercel 一键部署！

## ✨ 特性

- 🤖 **AI 驱动**：支持 DeepSeek、OpenAI 等多种 AI 模型
- 🎯 **智能问答**：个性化学习问题生成和解答
- 📊 **学习统计**：详细的学习进度和成果追踪
- 🔄 **实时流式**：流式输出，实时查看 AI 生成过程
- 📱 **响应式设计**：完美适配桌面和移动设备
- ⚡ **零配置部署**：一键部署到 Vercel

## 🚀 快速开始

### 方法一：一键部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/smart-learning-assistant)

### 方法二：手动部署

1. **克隆项目**
```bash
git clone https://github.com/yourusername/smart-learning-assistant.git
cd smart-learning-assistant
```

2. **安装 Vercel CLI**
```bash
npm install -g vercel
```

3. **登录并部署**
```bash
vercel login
vercel --prod
```

## 📁 项目结构

```
smart-learning-assistant/
├── public/                    # 静态文件
│   ├── index.html            # 入口页面
│   └── 智能学习助手.html      # 主应用
├── api/                      # Vercel API 函数
│   └── proxy.js             # CORS 代理
├── vercel.json              # Vercel 配置
├── package.json             # 项目配置
└── README.md               # 说明文档
```

## ⚙️ 配置

### 环境变量

在 Vercel 控制台中设置以下环境变量：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key
OPENAI_API_KEY=your_openai_api_key
```

### API 支持

- ✅ DeepSeek API
- ✅ DeepSeek-R1 NVIDIA
- ✅ OpenAI API
- ✅ 自定义 API 端点

## 🌐 在线演示

- **主站**：[https://your-project.vercel.app](https://your-project.vercel.app)
- **直接访问**：[https://your-project.vercel.app/智能学习助手.html](https://your-project.vercel.app/智能学习助手.html)

## 📱 功能截图

### 桌面端
- 🖥️ 完整的学习仪表板
- 📊 详细的统计图表
- 🎨 优雅的用户界面

### 移动端
- 📱 响应式布局
- 👆 触摸友好的交互
- ⚡ 快速加载体验

## 🛠️ 本地开发

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

## 🔧 自定义配置

### 修改 API 端点

编辑 `public/智能学习助手.html` 中的 API 配置：

```javascript
const apiConfigs = {
    deepseek: { 
        baseUrl: 'https://api.deepseek.com/v1', 
        model: 'deepseek-chat' 
    },
    'deepseek-nvidia': { 
        baseUrl: 'https://integrate.api.nvidia.com/v1', 
        model: 'deepseek-ai/deepseek-r1' 
    },
    openai: { 
        baseUrl: 'https://api.openai.com/v1', 
        model: 'gpt-3.5-turbo' 
    }
};
```

### 自定义样式

修改 HTML 文件中的 CSS 样式来定制外观。

## 🔍 故障排除

### 常见问题

1. **CORS 错误**
   - 确保使用代理 API：`/api/proxy`
   - 检查 `vercel.json` 配置

2. **API 调用失败**
   - 验证 API 密钥
   - 检查网络连接
   - 查看 Vercel 函数日志

3. **页面加载问题**
   - 确认文件在 `public/` 目录
   - 检查文件路径和名称

### 调试方法

```bash
# 查看部署日志
vercel logs

# 本地调试
vercel dev

# 查看函数日志
vercel logs --follow
```

## 📊 性能优化

- ⚡ **全球 CDN**：Vercel 自动提供全球加速
- 🗜️ **自动压缩**：Gzip/Brotli 压缩
- 📱 **移动优化**：响应式设计和触摸优化
- 🔄 **缓存策略**：智能缓存配置

## 🔐 安全特性

- 🛡️ **HTTPS 强制**：自动 SSL 证书
- 🔒 **API 密钥保护**：环境变量存储
- 🚫 **CORS 控制**：精确的跨域配置
- 🛡️ **XSS 防护**：内容安全策略

## 🎯 使用场景

- 📚 **个人学习**：AI 辅助学习和复习
- 🏫 **教育机构**：智能教学辅助工具
- 💼 **企业培训**：员工技能提升平台
- 🔬 **研究学习**：学术研究辅助工具

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Vercel](https://vercel.com) - 优秀的部署平台
- [DeepSeek](https://deepseek.com) - 强大的 AI 模型
- [OpenAI](https://openai.com) - 领先的 AI 技术

---

⭐ 如果这个项目对你有帮助，请给个 Star！

📧 有问题？[提交 Issue](https://github.com/yourusername/smart-learning-assistant/issues)