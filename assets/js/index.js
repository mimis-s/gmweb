import { api, apiClient, Endpoints } from './api/index.js';

// 导入组件
import { showToast, Toast, modal, confirm } from './components/index.js';

// 导入工具函数
import * as utils from './utils/index.js';

// 导入业务模块
import { 
    authStore, 
    gmOrderStore, 
    projectStore, 
    userStore, 
    permissionStore, 
    logStore,
    PageLoader,
    NavigationManager,
    initApp 
} from './modules/index.js';

/**
 * 应用配置
 */
export const AppConfig = {
    name: 'GMWeb',
    version: '2.0.0',
    apiBaseUrl: '',
};

/**
 * 全局状态
 */
export const AppState = {
    ready: false,
    currentUser: null,
    currentProject: null,
};

/**
 * 应用初始化
 */
async function bootstrap() {
    if (AppState.ready) return;
    
    try {
        // 初始化认证状态
        authStore.init();
        
        // 初始化应用状态
        AppState.ready = true;
        
        console.log(`${AppConfig.name} v${AppConfig.version} 已启动`);
        
        // // 触发就绪事件
        // eventBus.emit(Events.APP_READY);
        
    } catch (error) {
        console.error('应用初始化失败:', error);
        showToast('应用初始化失败', 'error');
    }
}

/**
 * 页面初始化
 */
function initPage() {
    console.log('initPage 被调用, pathname:', window.location.pathname);
    
    // 根据页面类型初始化
    const path = window.location.pathname;
    console.log('路径检测:', path);
    
    if (path.includes('gm_tab_home')) {
        console.log('检测到 gm_tab_home 页面，调用 initApp...');
        initApp();
    } else if (path.includes('login')) {
        console.log('检测到 login 页面，调用 initLoginPage...');
        initLoginPage();
    } else if (path.includes('register')) {
        console.log('检测到 register 页面，调用 initRegisterPage...');
        initRegisterPage();
    } else {
        console.log('未知页面类型');
    }
}

/**
 * 登录页面初始化
 */
function initLoginPage() {
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', handleLogin);
    }
}

/**
 * 处理登录
 */
async function handleLogin() {
    const username = document.getElementById('input-username')?.value;
    const password = document.getElementById('input-password')?.value;
    
    if (!username || !password) {
        showToast('请输入用户名和密码', 'warning');
        return;
    }
    
    try {
        await authStore.login(username, password);
    } catch (error) {
        // 错误已在 authStore 中处理
    }
}

/**
 * 注册页面初始化
 */
function initRegisterPage() {
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', handleRegister);
    }
}

/**
 * 处理注册
 */
async function handleRegister() {
    const username = document.getElementById('register_lineedit_username')?.value;
    const password = document.getElementById('register_lineedit_password')?.value;
    const passwordAgain = document.getElementById('register_lineedit_passwordagain')?.value;
    
    if (!username || !password) {
        showToast('请填写完整信息', 'warning');
        return;
    }
    
    if (password !== passwordAgain) {
        showToast('两次密码不一致', 'error');
        return;
    }
    
    showToast('注册功能开发中', 'info');
}

// 导出所有公共 API
export {
    // 核心
    // store,
    // eventBus,
    // Events,
    
    // API
    api,
    apiClient,
    Endpoints,
    
    // 组件
    showToast,
    Toast,
    modal,
    confirm,
    
    // 工具
    utils,
    
    // 模块
    authStore,
    gmOrderStore,
    projectStore,
    userStore,
    permissionStore,
    logStore,
    PageLoader,
    NavigationManager,
    initApp,
};

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        bootstrap();
        initPage();
    });
} else {
    bootstrap();
    initPage();
}
