# 智能学习助手 - uni-app版本

这是一个基于uni-app框架开发的智能学习助手应用，可以编译为Android APK、iOS APP、H5网页等多个平台。

## 🚀 功能特性

- **AI驱动学习**: 智能生成学习问题和答案
- **多主题支持**: 编程、AI、商业、设计等多个学习领域
- **学习统计**: 详细的学习进度和成果统计
- **响应式设计**: 完美适配手机、平板等设备
- **平板优化**: 专门针对平板电脑的布局优化
- **离线支持**: 核心功能支持离线使用
- **跨平台**: 支持Android、iOS、H5等多个平台

## 📱 支持平台

- ✅ Android APP (APK) - 手机和平板
- ✅ iOS APP - iPhone和iPad
- ✅ H5 网页版 - 响应式设计
- ✅ 微信小程序
- ✅ 支付宝小程序

## 📐 设备适配

### 手机设备 (< 768px)
- 紧凑型布局，优化触控体验
- 2x2统计卡片网格
- 单列主题选择

### 平板设备 (768px - 1024px)  
- 中等宽度布局，居中显示
- 4列统计卡片，垂直布局
- 2列主题网格

### 大屏平板 (> 1024px)
- 宽屏布局，最大化利用空间
- 大尺寸卡片和图标
- 3列主题网格

## 🛠️ 开发环境要求

- **HBuilderX**: 3.6.0 或更高版本
- **Node.js**: 14.0 或更高版本
- **Vue.js**: 3.x
- **uni-app**: 3.x

## 📦 安装和使用

### 方法一：使用HBuilderX（推荐）

1. **下载HBuilderX**
   - 访问 [HBuilderX官网](https://www.dcloud.io/hbuilderx.html)
   - 下载并安装HBuilderX

2. **导入项目**
   - 打开HBuilderX
   - 点击 `文件` -> `导入` -> `从本地目录导入`
   - 选择 `smart-learning-assistant-uniapp` 文件夹

3. **运行项目**
   - 在HBuilderX中右键点击项目根目录
   - 选择 `运行` -> `运行到手机或模拟器` -> `运行到Android App基座`

4. **打包APK**
   - 右键点击项目根目录
   - 选择 `发行` -> `原生App-云打包`
   - 选择Android平台，点击打包

### 方法二：命令行方式

```bash
# 1. 安装依赖
npm install

# 2. 开发模式运行
npm run dev:app

# 3. 构建生产版本
npm run build:app

# 4. H5版本开发
npm run dev:h5

# 5. H5版本构建
npm run build:h5
```

## 📁 项目结构

```
smart-learning-assistant-uniapp/
├── pages/                           # 页面文件
│   └── index/
│       └── index.vue               # 主页面
├── static/                         # 静态资源
│   └── smart-learning-assistant.html  # 核心HTML应用
├── App.vue                         # 应用入口组件
├── main.js                        # 应用入口文件
├── manifest.json                  # 应用配置文件
├── pages.json                     # 页面路由配置
├── uni.scss                       # 全局样式变量
└── package.json                   # 项目依赖配置
```

## 🔧 配置说明

### 1. 应用基本信息配置

在 `manifest.json` 中可以配置：
- 应用名称、版本号
- 应用图标、启动图
- 权限配置
- 平台特定配置

### 2. 页面路由配置

在 `pages.json` 中配置：
- 页面路径和样式
- 导航栏设置
- 全局样式

### 3. WebView内容

核心的HTML应用位于 `static/smart-learning-assistant.html`，包含：
- 完整的学习助手功能
- 响应式设计
- 与uni-app的通信接口

## 📱 打包APK详细步骤

### 使用HBuilderX云打包（推荐）

1. **配置应用信息**
   - 在 `manifest.json` 中设置应用名称、版本号、图标等
   - 配置Android权限和特性

2. **选择打包方式**
   - 右键项目 -> `发行` -> `原生App-云打包`
   - 选择Android平台
   - 选择打包类型（测试包或正式包）

3. **配置签名**
   - 测试包：可以使用默认签名
   - 正式包：需要配置自己的签名证书

4. **开始打包**
   - 点击打包按钮
   - 等待云端打包完成
   - 下载生成的APK文件

## 🌐 H5版本部署

1. **构建H5版本**
   ```bash
   npm run build:h5
   ```

2. **部署到服务器**
   - 将 `dist/build/h5` 目录下的文件上传到Web服务器
   - 配置服务器支持HTML5 History模式（可选）

## 🔗 与原HTML应用的关系

这个uni-app项目是原HTML应用的容器版本：
- 核心功能仍然在HTML文件中实现
- uni-app提供了原生APP的外壳和能力
- 通过WebView组件加载HTML应用
- 支持HTML与原生功能的双向通信

## 🐛 常见问题

### 1. WebView加载失败
- 检查 `static/smart-learning-assistant.html` 文件是否存在
- 确认文件路径配置正确
- 检查网络连接（如果使用在线URL）

### 2. 打包失败
- 检查HBuilderX版本是否最新
- 确认manifest.json配置正确
- 查看控制台错误信息
- **重要**: 确保所有文件名都是英文，不包含中文字符

### 3. 功能异常
- 检查HTML文件中的JavaScript是否有错误
- 确认uni-app与WebView的通信是否正常
- 查看浏览器开发者工具的控制台

## ⚠️ 重要提醒

### 文件命名规范
- **所有文件和文件夹名称必须使用英文**
- 不能包含中文字符或全角字符
- 推荐使用小写字母和连字符

### 打包注意事项
- APP打包时会检查文件名，中文文件名会导致打包失败
- 建议在开发阶段就使用英文文件名
- 如果遇到文件名问题，请重命名后重新打包

## 📞 技术支持

如果在使用过程中遇到问题，可以：
1. 查看HBuilderX官方文档
2. 访问uni-app社区论坛
3. 检查项目的GitHub Issues

## 📄 许可证

本项目采用 MIT 许可证，详见 LICENSE 文件。

---

**注意**: 这个项目将原有的HTML智能学习助手应用封装为uni-app，可以方便地打包为各种平台的应用程序。核心功能和用户界面保持不变，同时获得了原生应用的能力和更好的用户体验。所有文件名都已改为英文，确保打包过程顺利进行。