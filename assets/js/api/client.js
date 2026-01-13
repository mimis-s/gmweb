import { Endpoints } from './endpoints.js';
import { ApiError, ErrorCodes, createApiError } from './errors.js';

/**
 * HTTP 请求方法
 */
const HTTP_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH',
};

/**
 * HTML 加载器
 * 用于获取页面模板 HTML 文件
 */
const HtmlLoader = {
    /**
     * 获取 HTML 文件
     * @param {string} path HTML 文件路径 (相对于 templates 目录)
     * @returns {Promise<string>} HTML 内容
     */
    async load(path) {
        const url = `/${path}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw createApiError(
                    `Failed to load HTML: ${path}`,
                    response.status,
                    null
                );
            }
            return await response.text();
        } catch (error) {
            console.error(`Failed to load HTML: ${path}`, error);
            throw error;
        }
    },

    /**
     * 加载页面模板
     * @param {string} page 页面名称
     * @returns {Promise<string>} HTML 内容
     */
    loadPage(page) {
        console.debug("加载用户管理页面")
        return this.load(`${page}.html`);
    },

    /**
     * 加载模板片段
     * @param {string} name 模板名称
     * @returns {Promise<string>} HTML 内容
     */
    loadTemplate(name) {
        return this.load(`templates/${name}_tpl.html`);
    },
};

/**
 * API 客户端类
 * 统一处理所有 HTTP 请求
 */
class ApiClient {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || '';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        this.interceptors = {
            request: [],
            response: [],
        };
        this.authToken = null;
    }

    /**
     * 设置认证 token
     * @param {string|null} token 
     */
    setAuthToken(token) {
        this.authToken = token;
        if (token) {
            this.defaultHeaders['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.defaultHeaders['Authorization'];
        }
    }

    /**
     * 添加请求拦截器
     * @param {Function} interceptor 
     */
    addRequestInterceptor(interceptor) {
        this.interceptors.request.push(interceptor);
    }

    /**
     * 添加响应拦截器
     * @param {Function} interceptor 
     */
    addResponseInterceptor(interceptor) {
        this.interceptors.response.push(interceptor);
    }

    /**
     * 执行请求
     * @param {string} method HTTP 方法
     * @param {string} endpoint 端点
     * @param {Object} data 请求数据
     * @param {Object} options 额外选项
     * @returns {Promise<Object>}
     */
    async request(method, endpoint, data = null, options = {}) {
        const url = this.baseUrl + endpoint;
        const headers = { ...this.defaultHeaders, ...options.headers };
        
        // 构建请求配置
        const config = {
            method,
            headers,
            body: data ? JSON.stringify(data) : null,
        };

        // 请求拦截器处理
        let processedConfig = config;
        for (const interceptor of this.interceptors.request) {
            processedConfig = await interceptor(processedConfig);
        }

        try {
            const response = await fetch(url, processedConfig);
            
            // 处理重定向
            const nextPage = response.headers.get('next-page');
            if (nextPage) {
                window.location.href = nextPage;
                throw new Error('Redirecting...');
            }

            // 解析响应
            let responseData;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            // 响应拦截器处理
            for (const interceptor of this.interceptors.response) {
                responseData = await interceptor(responseData, response);
            }

            // 检查 HTTP 状态
            if (!response.ok) {
                throw createApiError(
                    responseData.message || 'Request failed',
                    response.status,
                    responseData
                );
            }

            return responseData;
        } catch (error) {
            // 网络错误处理
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                throw createApiError(
                    '网络连接失败，请检查网络设置',
                    ErrorCodes.NETWORK_ERROR,
                    null
                );
            }
            
            // 重新抛出已知的 API 错误
            if (error instanceof ApiError) {
                throw error;
            }
            
            // 其他错误
            throw createApiError(
                error.message || '未知错误',
                ErrorCodes.UNKNOWN,
                null
            );
        }
    }

    /**
     * GET 请求
     * @param {string} endpoint 
     * @param {Object} params 查询参数
     * @param {Object} options 
     * @returns {Promise<Object>}
     */
    get(endpoint, params = null, options = {}) {
        let url = endpoint;
        if (params) {
            const queryString = new URLSearchParams(params).toString();
            url += `?${queryString}`;
        }
        return this.request(HTTP_METHODS.GET, url, null, options);
    }

    /**
     * POST 请求
     * @param {string} endpoint 
     * @param {Object} data 请求数据
     * @param {Object} options 
     * @returns {Promise<Object>}
     */
    post(endpoint, data, options = {}) {
        return this.request(HTTP_METHODS.POST, endpoint, data, options);
    }

    /**
     * PUT 请求
     * @param {string} endpoint 
     * @param {Object} data 请求数据
     * @param {Object} options 
     * @returns {Promise<Object>}
     */
    put(endpoint, data, options = {}) {
        return this.request(HTTP_METHODS.PUT, endpoint, data, options);
    }

    /**
     * DELETE 请求
     * @param {string} endpoint 
     * @param {Object} data 请求数据
     * @param {Object} options 
     * @returns {Promise<Object>}
     */
    delete(endpoint, data = null, options = {}) {
        return this.request(HTTP_METHODS.DELETE, endpoint, data, options);
    }
}

// 创建默认 API 实例
export const api = new ApiClient();

// 便捷方法
export const apiClient = {
    login: (data) => api.post(Endpoints.LOGIN, data),
    register: (data) => api.post(Endpoints.REGISTER, data),
    
    // GM 命令
    getGmOrders: (projectId) => api.post(Endpoints.GM_ORDER_BOX, { projectid: Number(projectId) }),
    addGmOrder: (data) => api.post(Endpoints.GM_ORDER_ADD, data),
    delGmOrder: (projectId, orderId) => api.post(Endpoints.GM_ORDER_DEL, { projectid: projectId, orderid: orderId }),
    modifyGmOrder: (data) => api.post(Endpoints.GM_ORDER_MODIFY, data),
    sendGmOrder: (orderId, msg) => api.post(Endpoints.GM_ORDER_SEND, { orderid: orderId, msg }),
    
    // 项目管理
    getProjects: () => api.post(Endpoints.GM_PROJECT_BOX, {}),
    getUserProjects: () => api.post(Endpoints.GM_PROJECTS, {}),
    addProject: (data) => api.post(Endpoints.GM_PROJECT_ADD, data),
    delProject: (projectId) => api.post(Endpoints.GM_PROJECT_DEL, { projectid: projectId }),
    modifyProject: (data) => api.post(Endpoints.GM_PROJECT_MODIFY, data),
    
    // 用户管理
    getUsers: () => api.post(Endpoints.GM_USER_MANAGEMENT, {}),
    addUser: (data) => api.post(Endpoints.GM_USER_ADD, data),
    delUser: (userId) => api.post(Endpoints.GM_USER_DEL, { userid: userId }),
    modifyUser: (data) => api.post(Endpoints.GM_USER_MODIFY, data),
    
    // 权限管理
    getPermissions: () => api.post(Endpoints.GM_PERMISSION, {}),
    addPermission: (data) => api.post(Endpoints.GM_PERMISSION_ADD, data),
    modifyPermission: (data) => api.post(Endpoints.GM_PERMISSION_MODIFY, data),
    delPermission: (id) => api.post(Endpoints.GM_PERMISSION_DEL, { id }),
    addPermissionGroup: (data) => api.post(Endpoints.GM_PERMISSION_GROUP_ADD, data),
    modifyPermissionGroup: (data) => api.post(Endpoints.GM_PERMISSION_GROUP_MODIFY, data),
    delPermissionGroup: (id) => api.post(Endpoints.GM_PERMISSION_GROUP_DEL, { id }),
    addPermissionAssignment: (userId, groupId) => api.post(Endpoints.GM_PERMISSION_ASSIGN_ADD, { userid: userId, groupid: groupId }),
    delPermissionAssignment: (id) => api.post(Endpoints.GM_PERMISSION_ASSIGN_DEL, { id }),
    
    // 日志
    getLogs: (params) => api.post(Endpoints.GM_LOG, params),

    // 审核管理
    getReviewAll: (data) => api.post(Endpoints.GM_REVIEW_ALL_GET, { data }),
    getReviewOrder: (orderid) => api.post(Endpoints.GM_REVIEW_ORDER_GET, { orderid: orderid }),

};

// 导出 HTML 加载器
export const htmlLoader = HtmlLoader;

// 导出便捷方法
export const loadHtml = {
    // 页面模板
    home: () => HtmlLoader.loadPage('home'),
    login: () => HtmlLoader.loadPage('login'),
    register: () => HtmlLoader.loadPage('register'),
    index: () => HtmlLoader.loadPage('index'),
    
    // GM 页面
    gmTabHome: () => HtmlLoader.loadPage('gm_tab_home'),
    gmTabHomeUser: () => HtmlLoader.loadPage('gm_tab_home_user'),
    gmOrderBox: () => HtmlLoader.loadPage('gm_order_box'),
    gmOrderCard: () => HtmlLoader.loadPage('gm_order_card'),
    gmOrderTable: () => HtmlLoader.loadPage('gm_order_table'),
    
    // 管理页面
    gmProjectBox: () => HtmlLoader.loadPage('gm_project_box'),
    gmProjectCard: () => HtmlLoader.loadPage('gm_project_card'),
    gmUserManagement: () => HtmlLoader.loadPage('gm_user_mangement'),
    gmPermission: () => HtmlLoader.loadPage('gm_permission'),
    gmLog: () => HtmlLoader.loadPage('gm_log'),
    gmLReview: () => HtmlLoader.loadPage('gm_review'),

    // 模板片段
    loginButton: () => HtmlLoader.loadTemplate('login_button'),
    loginLineedit: () => HtmlLoader.loadTemplate('login_lineedit'),
    
    // 自定义加载
    load: (path) => HtmlLoader.load(path),
};
