@echo off
chcp 65001 >nul
echo 🚀 开始部署智能学习助手到 Vercel...
echo.

REM 检查是否安装了 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    echo 📥 下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查是否安装了 Vercel CLI
vercel --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Vercel CLI 未安装，正在安装...
    npm install -g vercel
    if errorlevel 1 (
        echo ❌ Vercel CLI 安装失败
        pause
        exit /b 1
    )
)

REM 检查是否已登录 Vercel
echo 🔐 检查 Vercel 登录状态...
vercel whoami >nul 2>&1
if errorlevel 1 (
    echo 📝 请登录 Vercel...
    vercel login
    if errorlevel 1 (
        echo ❌ Vercel 登录失败
        pause
        exit /b 1
    )
)

REM 创建 public 目录并复制文件
echo 📁 准备部署文件...
if not exist "public" mkdir public
copy "智能学习助手.html" "public\智能学习助手.html" >nul
if errorlevel 1 (
    echo ❌ 文件复制失败，请确保 智能学习助手.html 文件存在
    pause
    exit /b 1
)

REM 部署到 Vercel
echo 🌐 部署到 Vercel...
vercel --prod
if errorlevel 1 (
    echo ❌ 部署失败
    pause
    exit /b 1
)

echo.
echo ✅ 部署完成！
echo.
echo 🎉 你的智能学习助手现在可以在线访问了！
echo 📱 访问地址已在上方显示
echo.
echo 💡 提示：
echo    - 首次部署可能需要几分钟时间
echo    - 可以在 Vercel 控制台查看部署状态
echo    - 支持自定义域名绑定
echo.
echo 🔧 如需本地开发，运行：
echo    npm run dev
echo.
pause