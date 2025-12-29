/**
 * 事件总线
 * 使用发布/订阅模式实现组件间通信
 */
class EventBus {
    constructor() {
        this._events = new Map();
        this._onceEvents = new Map();
        this._maxListeners = 100;
    }

    /**
     * 绑定事件
     * @param {string} event 事件名
     * @param {Function} callback 回调函数
     * @param {Object} options 选项
     * @returns {Function} 取消绑定函数
     */
    on(event, callback, options = {}) {
        const { once = false, priority = 0 } = options;
        
        if (typeof callback !== 'function') {
            throw new TypeError('Callback must be a function');
        }
        
        const listener = {
            callback,
            priority,
            once,
            id: this._generateId(),
        };
        
        if (!this._events.has(event)) {
            this._events.set(event, []);
        }
        
        const listeners = this._events.get(event);
        listeners.push(listener);
        
        // 按优先级排序
        listeners.sort((a, b) => b.priority - a.priority);
        
        // 限制监听器数量
        if (listeners.length > this._maxListeners) {
            console.warn(`EventBus: Maximum listeners (${this._maxListeners}) exceeded for event "${event}"`);
        }
        
        // 如果是一次性事件，添加到单独的 map
        if (once) {
            if (!this._onceEvents.has(event)) {
                this._onceEvents.set(event, []);
            }
            this._onceEvents.get(event).push(listener);
        }
        
        // 返回取消订阅函数
        return () => this.off(event, callback);
    }

    /**
     * 绑定一次性事件
     * @param {string} event 事件名
     * @param {Function} callback 回调函数
     * @returns {Function} 取消绑定函数
     */
    once(event, callback) {
        return this.on(event, callback, { once: true });
    }

    /**
     * 解绑事件
     * @param {string} event 事件名
     * @param {Function} callback 回调函数
     */
    off(event, callback) {
        if (!this._events.has(event)) return;
        
        const listeners = this._events.get(event);
        const index = listeners.findIndex(l => l.callback === callback || l.id === callback);
        
        if (index !== -1) {
            listeners.splice(index, 1);
        }
        
        // 清理空事件
        if (listeners.length === 0) {
            this._events.delete(event);
        }
    }

    /**
     * 解绑所有事件
     * @param {string} event 事件名（可选）
     */
    offAll(event = null) {
        if (event) {
            this._events.delete(event);
            this._onceEvents.delete(event);
        } else {
            this._events.clear();
            this._onceEvents.clear();
        }
    }

    /**
     * 触发事件
     * @param {string} event 事件名
     * @param {*} data 事件数据
     * @returns {Array} 回调函数返回值数组
     */
    emit(event, data = null) {
        const results = [];
        
        // 触发普通事件
        const listeners = this._events.get(event) || [];
        for (const listener of listeners) {
            try {
                const result = listener.callback(data);
                results.push(result);
                
                if (listener.once) {
                    this.off(event, listener.callback);
                }
            } catch (error) {
                console.error(`EventBus: Error in event listener for "${event}"`, error);
            }
        }
        
        // 触发一次性事件
        const onceListeners = this._onceEvents.get(event) || [];
        for (const listener of onceListeners) {
            try {
                const result = listener.callback(data);
                results.push(result);
            } catch (error) {
                console.error(`EventBus: Error in once event listener for "${event}"`, error);
            }
        }
        this._onceEvents.delete(event);
        
        return results;
    }

    /**
     * 异步触发事件
     * @param {string} event 事件名
     * @param {*} data 事件数据
     * @returns {Promise}
     */
    async emitAsync(event, data = null) {
        const listeners = this._events.get(event) || [];
        const promises = [];
        
        for (const listener of listeners) {
            promises.push(Promise.resolve(listener.callback(data)));
        }
        
        return Promise.all(promises);
    }

    /**
     * 触发带错误处理的事件
     * @param {string} event 事件名
     * @param {*} data 事件数据
     * @returns {Array}
     */
    emitSafe(event, data = null) {
        const results = [];
        
        try {
            return this.emit(event, data);
        } catch (error) {
            console.error(`EventBus: Error emitting event "${event}"`, error);
            return results;
        }
    }

    /**
     * 获取事件监听器数量
     * @param {string} event 事件名
     * @returns {number}
     */
    listenerCount(event) {
        const listeners = this._events.get(event) || [];
        return listeners.length;
    }

    /**
     * 获取所有事件名
     * @returns {Array}
     */
    eventNames() {
        return Array.from(this._events.keys());
    }

    /**
     * 生成唯一 ID
     * @returns {string}
     */
    _generateId() {
        return 'listener_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    /**
     * 设置最大监听器数量
     * @param {number} max 
     */
    setMaxListeners(max) {
        this._maxListeners = max;
    }
}

// 创建默认 EventBus 实例
export const eventBus = new EventBus();

// 事件名称常量
export const Events = {
    // 应用事件
    APP_READY: 'app:ready',
    APP_DESTROY: 'app:destroy',
    
    // 导航事件
    NAVIGATE: 'navigate',
    NAVIGATE_BACK: 'navigate:back',
    
    // 用户事件
    USER_LOGIN: 'user:login',
    USER_LOGOUT: 'user:logout',
    USER_UPDATE: 'user:update',
    
    // 数据事件
    DATA_LOADED: 'data:loaded',
    DATA_UPDATED: 'data:updated',
    DATA_DELETED: 'data:deleted',
    DATA_ERROR: 'data:error',

    // 详细数据事件
    GetUsersRsp: 'getUsersRsp',       // 获取所有用户数据
    GetPermissionsRsp: 'getPermissionsRsp', // 获取权限管理数据

    // 通知事件
    TOAST: 'toast',
    ALERT: 'alert',
    CONFIRM: 'confirm',
    
    // 模态框事件
    MODAL_OPEN: 'modal:open',
    MODAL_CLOSE: 'modal:close',
};

// 事件总线工厂函数
export function createEventBus() {
    return new EventBus();
}
