#!/bin/bash

# 智能学习助手 Vercel 部署脚本

echo "🚀 开始部署智能学习助手到 Vercel..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI 未安装，正在安装..."
    npm install -g vercel
fi

# 检查是否已登录 Vercel
echo "🔐 检查 Vercel 登录状态..."
if ! vercel whoami &> /dev/null; then
    echo "📝 请登录 Vercel..."
    vercel login
fi

# 复制主文件到 public 目录
echo "📁 准备部署文件..."
mkdir -p public
cp "智能学习助手.html" "public/智能学习助手.html"

# 部署到 Vercel
echo "🌐 部署到 Vercel..."
vercel --prod

echo "✅ 部署完成！"
echo ""
echo "🎉 你的智能学习助手现在可以在线访问了！"
echo "📱 访问地址将在上方显示"
echo ""
echo "💡 提示："
echo "   - 首次部署可能需要几分钟时间"
echo "   - 可以在 Vercel 控制台查看部署状态"
echo "   - 支持自定义域名绑定"
echo ""
echo "🔧 如需本地开发，运行："
echo "   npm run dev"