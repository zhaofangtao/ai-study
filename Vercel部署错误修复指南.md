# 🔧 Vercel 部署错误修复指南

## ❌ 常见错误：Function Runtimes 版本问题

### 错误信息
```
Error: Function Runtimes must have a valid version, for example `now-php@1.0.0`.
```

### 🛠️ 解决方案

#### 1. 修复 vercel.json 配置

**问题原因：** `vercel.json` 中的 runtime 配置格式不正确

**修复前：**
```json
{
  "functions": {
    "api/proxy.js": {
      "runtime": "nodejs18.x"  // ❌ 错误格式
    }
  }
}
```

**修复后：**
```json
{
  "rewrites": [
    {
      "source": "/api/proxy",
      "destination": "/api/proxy.js"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

#### 2. 修复 API 函数语法

**问题原因：** ES 模块语法在某些 Vercel 环境中可能不兼容

**修复前：**
```javascript
export default async function handler(req, res) {
  // ...
}
```

**修复后：**
```javascript
module.exports = async function handler(req, res) {
  // ...
};
```

## 🚀 快速修复步骤

### 步骤 1：更新配置文件

1. **更新 vercel.json**
```bash
# 使用修复后的简化配置
# 移除 functions.runtime 配置
# 保留 rewrites 和 headers 配置
```

2. **更新 API 函数**
```bash
# 将 export default 改为 module.exports
# 添加 fetch 兼容性处理
```

### 步骤 2：重新部署

```bash
# 清除之前的部署
vercel --prod --force

# 或者删除 .vercel 目录重新部署
rm -rf .vercel
vercel --prod
```

### 步骤 3：测试修复结果

```bash
# 运行修复测试脚本
node vercel-fix-test.js https://your-project.vercel.app
```

## 📋 修复检查清单

### ✅ 配置文件检查
- [ ] `vercel.json` 不包含 `functions.runtime` 配置
- [ ] API 函数使用 `module.exports` 语法
- [ ] `package.json` 包含正确的依赖项

### ✅ 文件结构检查
```
project/
├── api/
│   ├── proxy.js          ✅ 使用 module.exports
│   └── stream-proxy.js   ✅ 使用 module.exports
├── public/
│   ├── index.html        ✅ 入口页面
│   └── 智能学习助手.html  ✅ 主应用
├── vercel.json           ✅ 简化配置
└── package.json          ✅ 项目配置
```

### ✅ 部署后测试
- [ ] 主页可以访问 (`/`)
- [ ] 智能学习助手页面可以访问 (`/智能学习助手.html`)
- [ ] API 代理功能正常 (`/api/proxy`)
- [ ] CORS 头部正确设置

## 🔍 其他常见问题

### 问题 1：API 函数超时
**解决方案：**
```javascript
// 在 API 函数中添加超时处理
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 25000); // 25秒超时

const response = await fetch(url, {
  signal: controller.signal,
  // ... 其他配置
});

clearTimeout(timeoutId);
```

### 问题 2：中文文件名问题
**解决方案：**
```json
// 在 vercel.json 中添加重写规则
{
  "rewrites": [
    {
      "source": "/智能学习助手.html",
      "destination": "/智能学习助手.html"
    }
  ]
}
```

### 问题 3：静态文件 404
**解决方案：**
```bash
# 确保文件在 public/ 目录下
mkdir -p public
cp 智能学习助手.html public/
```

## 🧪 测试脚本使用

### 基本测试
```bash
node vercel-fix-test.js https://your-project.vercel.app
```

### 详细测试
```bash
node test-deployment.js https://your-project.vercel.app
```

## 📊 成功部署标志

当你看到以下输出时，说明修复成功：

```
🔧 测试 Vercel 部署修复...

🌐 测试目标: https://your-project.vercel.app

🔍 基本连接测试...
   ✅ 基本连接正常

🔍 API 代理测试...
   ✅ API 代理正常工作

🔍 智能学习助手页面...
   ✅ 主页面加载正常

🔍 CORS 头部检查...
   ✅ CORS 配置正确: *

🎯 测试完成！

💡 如果所有测试通过，说明部署修复成功！
```

## 🆘 仍然有问题？

### 查看 Vercel 日志
```bash
vercel logs --follow
```

### 本地调试
```bash
vercel dev
```

### 检查函数日志
1. 访问 [Vercel 控制台](https://vercel.com/dashboard)
2. 选择你的项目
3. 进入 Functions 标签页
4. 查看函数执行日志

### 联系支持
- 📖 [Vercel 官方文档](https://vercel.com/docs)
- 💬 [Vercel 社区](https://vercel.com/community)
- 🐛 [提交 Issue](https://github.com/yourusername/smart-learning-assistant/issues)

## 📝 预防措施

### 1. 使用标准配置
- 避免使用实验性功能
- 使用 Vercel 推荐的配置格式
- 定期更新依赖项

### 2. 本地测试
```bash
# 在部署前本地测试
vercel dev
```

### 3. 渐进式部署
```bash
# 先部署到预览环境
vercel

# 确认无误后部署到生产环境
vercel --prod
```

---

🎉 **修复完成后，你的智能学习助手应该可以在 Vercel 上正常运行了！**