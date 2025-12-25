/**
 * 认证模块
 */
import { apiClient } from '../../api/client.js';
import { store } from '../../core/store.js';
import { eventBus, Events } from '../../core/eventBus.js';
import { showToast } from '../../components/toast.js';

/**
 * 认证状态常量
 */
export const AuthState = {
    UNKNOWN: 'unknown',
    AUTHENTICATED: 'authenticated',
    UNAUTHENTICATED: 'unauthenticated',
};

/**
 * 认证 Store 工厂
 * @returns {Object}
 */
export function createAuthStore() {
    const authStore = {
        state: {
            user: null,
            isAuthenticated: AuthState.UNKNOWN,
            loading: false,
            error: null,
        },
        
        /**
         * 初始化认证状态
         */
        init() {
            this.state.isAuthenticated = AuthState.UNKNOWN;
        },
        
        /**
         * 登录
         * @param {string} username 
         * @param {string} password 
         * @param {string} remember 
         */
        async login(username, password, remember = '') {
            this.state.loading = true;
            this.state.error = null;
            
            try {
                const response = await apiClient.login({
                    username,
                    password,
                    remember,
                });
                
                this.state.user = response;
                this.state.isAuthenticated = AuthState.AUTHENTICATED;
                
                // 保存到 Store
                store.set('auth.user', response);
                store.set('auth.isAuthenticated', true);
                
                // 触发事件
                eventBus.emit(Events.USER_LOGIN, response);
                
                showToast('登录成功', 'success');
                return response;
            } catch (error) {
                this.state.error = error.message;
                this.state.isAuthenticated = AuthState.UNAUTHENTICATED;
                showToast(error.message || '登录失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },
        
        /**
         * 登出
         */
        logout() {
            this.state.user = null;
            this.state.isAuthenticated = AuthState.UNAUTHENTICATED;
            
            // 清除 Store
            store.set('auth.user', null);
            store.set('auth.isAuthenticated', false);
            
            // 触发事件
            eventBus.emit(Events.USER_LOGOUT);
            
            showToast('已退出登录', 'info');
        },
        
        /**
         * 检查认证状态
         * @returns {boolean}
         */
        checkAuth() {
            const isAuthenticated = store.get('auth.isAuthenticated');
            this.state.isAuthenticated = isAuthenticated ? AuthState.AUTHENTICATED : AuthState.UNAUTHENTICATED;
            return isAuthenticated;
        },
        
        /**
         * 获取当前用户
         * @returns {Object|null}
         */
        getCurrentUser() {
            return store.get('auth.user');
        },
    };
    
    return authStore;
}

// 导出默认认证 Store 实例
export const authStore = createAuthStore();
