@echo off
echo ================================
echo 智能学习助手 - 微信小程序编译脚本
echo ================================

echo.
echo 正在检查环境...

:: 检查Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

echo [✓] Node.js 环境正常

:: 检查是否存在package.json
if not exist package.json (
    echo [错误] 未找到package.json文件
    pause
    exit /b 1
)

echo [✓] 项目配置文件存在

:: 安装依赖
echo.
echo 正在安装项目依赖...
npm install

if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)

echo [✓] 依赖安装完成

:: 编译小程序
echo.
echo 正在编译微信小程序...
npm run build:mp-weixin

if %errorlevel% neq 0 (
    echo [错误] 编译失败
    pause
    exit /b 1
)

echo.
echo ================================
echo [✓] 编译完成！
echo ================================
echo.
echo 接下来的步骤：
echo 1. 打开微信开发者工具
echo 2. 导入项目目录：%cd%
echo 3. 设置小程序AppID
echo 4. 开始调试和预览
echo.
pause