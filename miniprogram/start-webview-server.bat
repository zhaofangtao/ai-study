@echo off
chcp 65001 >nul
title 智能学习助手 - WebView测试服务器

echo.
echo 🚀 启动智能学习助手 WebView 测试服务器...
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未找到Python
    echo 请先安装Python 3.6或更高版本
    echo 下载地址：https://www.python.org/downloads/
    pause
    exit /b 1
)

REM 检查HTML文件是否存在
if not exist "web\智能学习助手-小程序版.html" (
    echo ❌ 错误：找不到HTML文件
    echo 期望位置：web\智能学习助手-小程序版.html
    echo 请确保HTML文件存在
    pause
    exit /b 1
)

REM 启动Python服务器
echo ✅ Python已安装，启动服务器...
python start-webview-server.py

pause