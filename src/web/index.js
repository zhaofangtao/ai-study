// Web版本入口文件
import { createElement } from './react-web.js';
import App from '../App.js';

// 启动应用
function startApp() {
    const root = document.getElementById('root');
    if (root) {
        root.innerHTML = '';
        const appElement = createElement(App);
        root.appendChild(appElement);
    }
}

// 等待DOM加载完成
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

// 错误处理
window.addEventListener('error', (event) => {
    console.error('应用错误:', event.error);
    const root = document.getElementById('root');
    if (root) {
        root.innerHTML = `
            <div class="error">
                <h3>应用启动失败</h3>
                <p>错误信息: ${event.error?.message || '未知错误'}</p>
                <p>请检查控制台获取详细信息，或刷新页面重试。</p>
            </div>
        `;
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
});