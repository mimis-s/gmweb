/**
 * DOM 操作工具函数
 */

/**
 * 创建元素
 * @param {string} tag 标签名
 * @param {Object} attributes 属性
 * @param {string|Array} children 子元素
 * @returns {HTMLElement}
 */
export function createElement(tag, attributes = {}, children = null) {
    const element = document.createElement(tag);
    
    // 设置属性
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else if (key.startsWith('on') && typeof value === 'function') {
            const eventName = key.slice(2).toLowerCase();
            element.addEventListener(eventName, value);
        } else if (key === 'dataset' && typeof value === 'object') {
            for (const [dataKey, dataValue] of Object.entries(value)) {
                element.dataset[dataKey] = dataValue;
            }
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else {
            element.setAttribute(key, value);
        }
    }
    
    // 添加子元素
    if (children) {
        if (typeof children === 'string') {
            element.textContent = children;
        } else if (Array.isArray(children)) {
            children.forEach(child => {
                if (child instanceof Node) {
                    element.appendChild(child);
                } else if (typeof child === 'string') {
                    element.appendChild(document.createTextNode(child));
                }
            });
        } else if (children instanceof Node) {
            element.appendChild(children);
        }
    }
    
    return element;
}

/**
 * 查找元素
 * @param {string|HTMLElement} selector 选择器或元素
 * @param {HTMLElement} parent 父元素
 * @returns {HTMLElement|null}
 */
export function find(selector, parent = document) {
    if (typeof selector === 'string') {
        return parent.querySelector(selector);
    }
    return selector;
}

/**
 * 查找所有元素
 * @param {string} selector 选择器
 * @param {HTMLElement} parent 父元素
 * @returns {NodeList}
 */
export function findAll(selector, parent = document) {
    return parent.querySelectorAll(selector);
}

/**
 * 添加类名
 * @param {HTMLElement} element 
 * @param {string|string[]} classes 
 */
export function addClass(element, classes) {
    const classList = element.classList;
    const toAdd = Array.isArray(classes) ? classes : classes.split(' ');
    classList.add(...toAdd);
}

/**
 * 移除类名
 * @param {HTMLElement} element 
 * @param {string|string[]} classes 
 */
export function removeClass(element, classes) {
    const classList = element.classList;
    const toRemove = Array.isArray(classes) ? classes : classes.split(' ');
    classList.remove(...toRemove);
}

/**
 * 切换类名
 * @param {HTMLElement} element 
 * @param {string} className 
 * @param {boolean} force 强制添加或移除
 * @returns {boolean}
 */
export function toggleClass(element, className, force) {
    if (typeof force === 'boolean') {
        return element.classList.toggle(className, force);
    }
    return element.classList.toggle(className);
}

/**
 * 检查是否包含类名
 * @param {HTMLElement} element 
 * @param {string} className 
 * @returns {boolean}
 */
export function hasClass(element, className) {
    return element.classList.contains(className);
}

/**
 * 设置样式
 * @param {HTMLElement} element 
 * @param {Object} styles 
 */
export function setStyles(element, styles) {
    Object.assign(element.style, styles);
}

/**
 * 获取或设置数据属性
 * @param {HTMLElement} element 
 * @param {string} key 
 * @param {*} value 
 * @returns {*}
 */
export function data(element, key, value) {
    if (value === undefined) {
        return element.dataset[key];
    }
    element.dataset[key] = value;
    return element;
}

/**
 * 事件委托
 * @param {HTMLElement} parent 父元素
 * @param {string} selector 选择器
 * @param {string} eventType 事件类型
 * @param {Function} handler 处理函数
 * @returns {Function} 取消监听函数
 */
export function delegate(parent, selector, eventType, handler) {
    const listener = (event) => {
        const target = event.target.closest(selector);
        if (target) {
            handler(event, target);
        }
    };
    
    parent.addEventListener(eventType, listener);
    
    return () => parent.removeEventListener(eventType, listener);
}

/**
 * 防抖函数
 * @param {Function} fn 
 * @param {number} delay 延迟时间
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
    let timeoutId = null;
    
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * 节流函数
 * @param {Function} fn 
 * @param {number} threshold 时间间隔
 * @returns {Function}
 */
export function throttle(fn, threshold = 300) {
    let lastTime = 0;
    
    return function (...args) {
        const now = Date.now();
        if (now - lastTime >= threshold) {
            lastTime = now;
            fn.apply(this, args);
        }
    };
}

/**
 * 等待下一个动画帧
 * @returns {Promise}
 */
export function nextFrame() {
    return new Promise(resolve => requestAnimationFrame(resolve));
}

/**
 * 格式化日期
 * @param {Date|number|string} date 
 * @param {string} format 格式
 * @returns {string}
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}
