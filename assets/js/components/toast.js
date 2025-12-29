/**
 * Toast 提示组件
 */
class ToastContainer {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        if (this.container) return;
        
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        Object.assign(this.container.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: '9999',
            maxWidth: '350px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        });
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        const toast = this.createToast(message, type);
        this.container.appendChild(toast);
        
        // 直接设置样式让 Toast 可见（不使用 CSS class）
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
        
        // 自动移除
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
        
        return toast;
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const colors = {
            success: '#52c41a',
            error: '#ff4d4f',
            warning: '#faad14',
            info: '#1890ff',
        };
        
        Object.assign(toast.style, {
            padding: '12px 16px',
            background: 'white',
            borderRadius: '6px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            borderLeft: `4px solid ${colors[type] || colors.info}`,
            transform: 'translateX(100%)',
            opacity: '0',
            transition: 'all 0.3s ease',
        });
        
        toast.textContent = message;
        
        return toast;
    }

    removeToast(toast) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

// 创建全局 Toast 实例（延迟初始化）
let toastContainer = null;

function getToastContainer() {
    if (!toastContainer) {
        toastContainer = new ToastContainer();
    }
    return toastContainer;
}

/**
 * Toast 提示函数
 * @param {string} message 消息
 * @param {string} type 类型 (success/error/warning/info)
 * @param {number} duration 持续时间
 */
export function showToast(message, type = 'info', duration = 3000) {
    if (typeof document === 'undefined' || !document.body) {
        return;
    }
    return getToastContainer().show(message, type, duration);
}

/**
 * Toast 快捷方法
 */
export const Toast = {
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration) => showToast(message, 'error', duration),
    warning: (message, duration) => showToast(message, 'warning', duration),
    info: (message, duration) => showToast(message, 'info', duration),
};

/**
 * 确保 Toast 容器已初始化
 */
export function initToast() {
    getToastContainer();
}

/**
 * 模态框类
 */
class ModalManager {
    constructor() {
        this.modals = new Map();
    }

    /**
     * 创建模态框
     * @param {Object} options 配置
     * @returns {HTMLElement}
     */
    create(options = {}) {
        const {
            id = 'modal_' + Date.now(),
            title = '',
            content = '',
            size = 'medium', // small, medium, large
            closable = true,
            onClose = null,
        } = options;
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = id;
        
        const sizes = {
            small: '400px',
            medium: '500px',
            large: '700px',
        };
        
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '10000',
            opacity: '0',
            visibility: 'hidden',
            transition: 'all 0.3s ease',
        });
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            background: white;
            border-radius: 8px;
            width: ${sizes[size] || sizes.medium};
            max-width: '90vw';
            max-height: '90vh';
            overflow: auto;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML = `
            <h3 style="margin:0;font-size:16px;">${title}</h3>
            ${closable ? '<button class="modal-close" style="border:none;background:none;cursor:pointer;font-size:20px;">×</button>' : ''}
        `;
        Object.assign(header.style, {
            padding: '16px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        });
        
        const body = document.createElement('div');
        body.className = 'modal-body';
        body.innerHTML = content;
        Object.assign(body.style, {
            padding: '16px',
        });
        
        modal.appendChild(header);
        modal.appendChild(body);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        
        // 事件绑定
        if (closable) {
            const closeBtn = header.querySelector('.modal-close');
            closeBtn.addEventListener('click', () => this.close(id));
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.close(id);
            });
        }
        
        this.modals.set(id, {
            overlay,
            modal,
            header,
            body,
            onClose,
        });
        
        return overlay;
    }

    /**
     * 显示模态框
     * @param {string} id 
     */
    show(id) {
        const modalData = this.modals.get(id);
        if (!modalData) return;
        
        modalData.overlay.style.visibility = 'visible';
        modalData.overlay.style.opacity = '1';
    }

    /**
     * 关闭模态框
     * @param {string} id 
     */
    close(id) {
        const modalData = this.modals.get(id);
        if (!modalData) return;
        
        modalData.overlay.style.opacity = '0';
        modalData.overlay.style.visibility = 'hidden';
        
        setTimeout(() => {
            modalData.overlay.parentNode.removeChild(modalData.overlay);
            this.modals.delete(id);
            if (modalData.onClose) modalData.onClose();
        }, 300);
    }

    /**
     * 更新模态框内容
     * @param {string} id 
     * @param {Object} options 
     */
    update(id, options) {
        const modalData = this.modals.get(id);
        if (!modalData) return;
        
        if (options.title) {
            modalData.header.querySelector('h3').textContent = options.title;
        }
        if (options.content) {
            modalData.body.innerHTML = options.content;
        }
    }
}

export const modal = new ModalManager();

/**
 * 确认对话框
 * @param {Object} options 配置
 * @returns {Promise<boolean>}
 */
export function confirm(options = {}) {
    console.debug('confirm 被调用', options);
    if (typeof document === 'undefined' || !document.body) {
        console.warn('Confirm: DOM not ready');
        return Promise.resolve(false);
    }

    return new Promise((resolve) => {
        const {
            title = '确认',
            message = '确定要执行此操作吗？',
            confirmText = '确定',
            cancelText = '取消',
            type = 'warning',
        } = options;
        
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10001;
            visibility: visible;
        `;
        
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white;
            border-radius: 8px;
            padding: 24px;
            width: 400px;
            max-width: 90vw;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        const icons = {
            warning: '⚠️',
            danger: '🚨',
            info: 'ℹ️',
            success: '✅',
        };
        
        dialog.innerHTML = `
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                <span style="font-size:24px;">${icons[type] || icons.info}</span>
                <h3 style="margin:0;">${title}</h3>
            </div>
            <p style="margin:0 0 20px;color:#666;">${message}</p>
            <div style="display:flex;justify-content:flex-end;gap:10px;">
                <button id="cancelBtn" style="padding:8px 16px;border:1px solid #ddd;background:white;border-radius:4px;cursor:pointer;">${cancelText}</button>
                <button id="confirmBtn" style="padding:8px 16px;border:none;background:#1890ff;color:white;border-radius:4px;cursor:pointer;">${confirmText}</button>
            </div>
        `;
        
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        // 强制设置样式确保可见
        overlay.style.visibility = 'visible';
        overlay.style.opacity = '1';
        overlay.style.display = 'flex';
        
        // 延迟检查元素状态
        setTimeout(() => {
            console.debug('overlay.getBoundingClientRect():', overlay.getBoundingClientRect());
            console.debug('dialog.getBoundingClientRect():', dialog.getBoundingClientRect());
            console.debug('body 内的子元素数量:', document.body.children.length);

            // 检查是否有其他元素在 overlay 上面
            const overlays = document.body.querySelectorAll('.modal-overlay');
            console.debug('页面中 modal-overlay 数量:', overlays.length);
        }, 100);
        
        dialog.querySelector('#confirmBtn').addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(true);
        });
        
        dialog.querySelector('#cancelBtn').addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(false);
        });
    });
}
