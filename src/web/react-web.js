// 简化的React Web适配层
let currentComponent = null;
let currentProps = {};
let hooks = [];
let hookIndex = 0;

// 模拟React的useState
export function useState(initialValue) {
    const index = hookIndex++;
    if (hooks[index] === undefined) {
        hooks[index] = initialValue;
    }
    
    const setState = (newValue) => {
        if (typeof newValue === 'function') {
            hooks[index] = newValue(hooks[index]);
        } else {
            hooks[index] = newValue;
        }
        // 重新渲染组件
        if (currentComponent) {
            rerender();
        }
    };
    
    return [hooks[index], setState];
}

// 模拟React的useEffect
export function useEffect(callback, deps) {
    const index = hookIndex++;
    const prevDeps = hooks[index];
    
    let hasChanged = true;
    if (prevDeps && deps) {
        hasChanged = deps.some((dep, i) => dep !== prevDeps[i]);
    }
    
    if (hasChanged) {
        hooks[index] = deps;
        setTimeout(callback, 0);
    }
}

// 创建DOM元素
export function createElement(component, props = {}) {
    currentComponent = component;
    currentProps = props;
    hookIndex = 0;
    
    try {
        const result = component(props);
        return renderElement(result);
    } catch (error) {
        console.error('组件渲染错误:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.innerHTML = `
            <h3>组件渲染失败</h3>
            <p>错误: ${error.message}</p>
        `;
        return errorDiv;
    }
}

// 渲染元素
function renderElement(element) {
    if (!element) return document.createTextNode('');
    
    if (typeof element === 'string' || typeof element === 'number') {
        return document.createTextNode(String(element));
    }
    
    if (element.type === 'View') {
        const div = document.createElement('div');
        applyStyles(div, element.props?.style);
        if (element.props?.children) {
            appendChildren(div, element.props.children);
        }
        return div;
    }
    
    if (element.type === 'Text') {
        const span = document.createElement('span');
        applyStyles(span, element.props?.style);
        if (element.props?.children) {
            span.textContent = String(element.props.children);
        }
        return span;
    }
    
    if (element.type === 'TextInput') {
        const input = element.props?.multiline ? 
            document.createElement('textarea') : 
            document.createElement('input');
        
        if (!element.props?.multiline) {
            input.type = element.props?.secureTextEntry ? 'password' : 'text';
        }
        
        input.placeholder = element.props?.placeholder || '';
        input.value = element.props?.value || '';
        input.maxLength = element.props?.maxLength || '';
        
        if (element.props?.onChangeText) {
            input.addEventListener('input', (e) => {
                element.props.onChangeText(e.target.value);
            });
        }
        
        applyStyles(input, element.props?.style);
        return input;
    }
    
    if (element.type === 'TouchableOpacity') {
        const button = document.createElement('button');
        button.style.border = 'none';
        button.style.background = 'transparent';
        button.style.cursor = 'pointer';
        
        if (element.props?.onPress) {
            button.addEventListener('click', element.props.onPress);
        }
        
        if (element.props?.disabled) {
            button.disabled = true;
            button.style.cursor = 'not-allowed';
            button.style.opacity = '0.6';
        }
        
        applyStyles(button, element.props?.style);
        if (element.props?.children) {
            appendChildren(button, element.props.children);
        }
        return button;
    }
    
    if (element.type === 'ScrollView') {
        const div = document.createElement('div');
        div.style.overflow = 'auto';
        applyStyles(div, element.props?.style);
        if (element.props?.children) {
            appendChildren(div, element.props.children);
        }
        return div;
    }
    
    // 默认处理
    const div = document.createElement('div');
    if (element.props?.children) {
        appendChildren(div, element.props.children);
    }
    return div;
}

// 应用样式
function applyStyles(element, styles) {
    if (!styles) return;
    
    Object.keys(styles).forEach(key => {
        const value = styles[key];
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        
        if (key === 'backgroundColor') {
            element.style.backgroundColor = value;
        } else if (key === 'color') {
            element.style.color = value;
        } else if (key === 'fontSize') {
            element.style.fontSize = typeof value === 'number' ? `${value}px` : value;
        } else if (key === 'fontWeight') {
            element.style.fontWeight = value;
        } else if (key === 'padding') {
            element.style.padding = typeof value === 'number' ? `${value}px` : value;
        } else if (key === 'margin') {
            element.style.margin = typeof value === 'number' ? `${value}px` : value;
        } else if (key === 'borderRadius') {
            element.style.borderRadius = typeof value === 'number' ? `${value}px` : value;
        } else if (key === 'borderWidth') {
            element.style.borderWidth = typeof value === 'number' ? `${value}px` : value;
        } else if (key === 'borderColor') {
            element.style.borderColor = value;
        } else if (key === 'flex') {
            element.style.flex = value;
        } else if (key === 'flexDirection') {
            element.style.flexDirection = value;
            element.style.display = 'flex';
        } else if (key === 'alignItems') {
            element.style.alignItems = value;
            element.style.display = 'flex';
        } else if (key === 'justifyContent') {
            element.style.justifyContent = value;
            element.style.display = 'flex';
        } else if (key === 'textAlign') {
            element.style.textAlign = value;
        } else if (key === 'minHeight') {
            element.style.minHeight = typeof value === 'number' ? `${value}px` : value;
        } else if (key === 'maxWidth') {
            element.style.maxWidth = typeof value === 'number' ? `${value}px` : value;
        } else if (key === 'width') {
            element.style.width = typeof value === 'number' ? `${value}px` : value;
        } else if (key === 'height') {
            element.style.height = typeof value === 'number' ? `${value}px` : value;
        } else {
            element.style[cssKey] = typeof value === 'number' ? `${value}px` : value;
        }
    });
}

// 添加子元素
function appendChildren(parent, children) {
    if (!children) return;
    
    if (Array.isArray(children)) {
        children.forEach(child => {
            if (child) {
                const childElement = renderElement(child);
                parent.appendChild(childElement);
            }
        });
    } else {
        const childElement = renderElement(children);
        parent.appendChild(childElement);
    }
}

// 重新渲染
function rerender() {
    if (currentComponent) {
        const root = document.getElementById('root');
        if (root) {
            hookIndex = 0;
            const newElement = createElement(currentComponent, currentProps);
            root.innerHTML = '';
            root.appendChild(newElement);
        }
    }
}

// 导出React兼容的API
export const React = {
    useState,
    useEffect,
    createElement: (type, props, ...children) => ({
        type,
        props: { ...props, children: children.length === 1 ? children[0] : children }
    })
};

// 全局React对象
window.React = React;

// 模拟React Native组件
window.View = (props) => React.createElement('View', props);
window.Text = (props) => React.createElement('Text', props);
window.TextInput = (props) => React.createElement('TextInput', props);
window.TouchableOpacity = (props) => React.createElement('TouchableOpacity', props);
window.ScrollView = (props) => React.createElement('ScrollView', props);
window.StyleSheet = {
    create: (styles) => styles
};

// 模拟Alert
window.Alert = {
    alert: (title, message, buttons) => {
        if (buttons && buttons.length > 1) {
            const result = confirm(`${title}\n\n${message || ''}`);
            const button = result ? buttons.find(b => b.style !== 'cancel') : buttons.find(b => b.style === 'cancel');
            if (button && button.onPress) {
                button.onPress();
            }
        } else {
            alert(`${title}\n\n${message || ''}`);
        }
    }
};

window.alert = window.Alert.alert;