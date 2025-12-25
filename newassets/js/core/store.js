/**
 * 状态管理 Store
 * 使用观察者模式实现响应式状态管理
 */
class Store {
    constructor(initialState = {}) {
        this._state = this._createProxy(initialState);
        this._listeners = new Map();
        this._history = [];
        this._maxHistory = 50;
    }

    /**
     * 创建响应式代理
     * @param {Object} target 
     * @returns {Proxy}
     */
    _createProxy(target) {
        const self = this;
        
        // 深度代理工厂函数
        function createDeepProxy(obj, path = []) {
            if (Array.isArray(obj)) {
                return new Proxy(obj, {
                    set(arr, prop, value) {
                        const oldValue = arr[prop];
                        arr[prop] = createDeepProxy(value, [...path, prop]);
                        self._emit(path.join('.'), oldValue, value);
                        return true;
                    },
                    deleteProperty(arr, prop) {
                        const oldValue = arr[prop];
                        delete arr[prop];
                        self._emit(path.join('.'), undefined, oldValue);
                        return true;
                    },
                });
            }
            
            if (typeof obj === 'object' && obj !== null) {
                return new Proxy(obj, {
                    set(target, prop, value) {
                        const oldValue = target[prop];
                        target[prop] = createDeepProxy(value, [...path, prop]);
                        self._emit([...path, prop].join('.'), oldValue, value);
                        return true;
                    },
                    deleteProperty(target, prop) {
                        const oldValue = target[prop];
                        delete target[prop];
                        self._emit([...path, prop].join('.'), undefined, oldValue);
                        return true;
                    },
                });
            }
            
            return obj;
        }
        
        return createDeepProxy(target);
    }

    /**
     * 获取状态
     * @param {string} key 状态路径，支持点号分隔
     * @returns {*}
     */
    get(key = null) {
        if (!key) return this._state;
        
        const keys = key.split('.');
        let value = this._state;
        
        for (const k of keys) {
            if (value === undefined || value === null) return undefined;
            value = value[k];
        }
        
        return value;
    }

    /**
     * 设置状态
     * @param {string} key 状态路径
     * @param {*} value 新值
     */
    set(key, value) {
        const keys = key.split('.');
        const lastKey = keys.pop();
        
        let target = this._state;
        for (const k of keys) {
            if (typeof target[k] !== 'object' || target[k] === null) {
                target[k] = {};
            }
            target = target[k];
        }
        
        target[lastKey] = value;
    }

    /**
     * 批量设置状态
     * @param {Object} obj 状态对象
     */
    patch(obj) {
        for (const [key, value] of Object.entries(obj)) {
            this.set(key, value);
        }
    }

    /**
     * 订阅状态变化
   * @param {string} key 状态路径
   * @param {Function} callback 回调函数
   * @returns {Function} 取消订阅函数
   */
    subscribe(key, callback) {
        if (!this._listeners.has(key)) {
            this._listeners.set(key, new Set());
        }
        
        this._listeners.get(key).add(callback);
        
        // 返回取消订阅函数
        return () => {
            const listeners = this._listeners.get(key);
            if (listeners) {
                listeners.delete(callback);
            }
        };
    }

    /**
     * 订阅任意状态变化
     * @param {Function} callback 回调函数
   * @returns {Function} 取消订阅函数
   */
    subscribeAny(callback) {
        return this.subscribe('*', callback);
    }

    /**
     * 触发状态变化通知
   * @param {string} key 状态路径
   * @param {*} oldValue 旧值
   * @param {*} newValue 新值
   */
    _emit(key, oldValue, newValue) {
        // 保存到历史记录
        this._saveHistory(key, oldValue, newValue);
        
        // 通知精确路径的订阅者
        const exactListeners = this._listeners.get(key);
        if (exactListeners) {
            for (const listener of exactListeners) {
                listener(newValue, oldValue, key);
            }
        }
        
        // 通知通配符订阅者
        const wildcardListeners = this._listeners.get('*');
        if (wildcardListeners) {
            for (const listener of wildcardListeners) {
                listener(key, newValue, oldValue);
            }
        }
    }

    /**
     * 保存状态历史
   * @param {string} key 
   * @param {*} oldValue 
   * @param {*} newValue 
   */
    _saveHistory(key, oldValue, newValue) {
        this._history.push({
            key,
            oldValue,
            newValue,
            timestamp: Date.now(),
        });
        
        // 限制历史长度
        if (this._history.length > this._maxHistory) {
            this._history.shift();
        }
    }

    /**
     * 撤销上一次操作
   * @returns {boolean} 是否成功撤销
   */
    undo() {
        if (this._history.length === 0) return false;
        
        const lastChange = this._history.pop();
        this._revertChange(lastChange);
        return true;
    }

    /**
     * 恢复撤销的操作
   * @returns {boolean} 是否成功恢复
   */
    redo() {
        // TODO: 实现重做功能
        return false;
    }

    /**
     * 回滚变化
   * @param {Object} change 
   */
    _revertChange(change) {
        const keys = change.key.split('.');
        const lastKey = keys.pop();
        
        let target = this._state;
        for (const k of keys) {
            target = target[k];
        }
        
        target[lastKey] = change.oldValue;
    }

    /**
     * 重置状态
   * @param {Object} initialState 
   */
    reset(initialState = {}) {
        this._state = this._createProxy(initialState);
        this._history = [];
        this._emit('*', null, initialState);
    }

    /**
     * 获取状态历史
   * @returns {Array}
     */
    getHistory() {
        return [...this._history];
    }
}

// 创建默认 Store 实例
export const store = new Store();

// 预定义的 Store 创建工厂
export function createStore(initialState = {}) {
    return new Store(initialState);
}
