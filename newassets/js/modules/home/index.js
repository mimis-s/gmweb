/**
 * 主页面模块
 */
import { eventBus, Events } from '../../core/eventBus.js';
import { showToast } from '../../components/toast.js';
import { loadHtml } from '../../api/client.js';
import { projectStore } from '../project/index.js';
import { gmOrderStore } from '../gmOrder/index.js';
import { userStore } from '../user/index.js';
import { permissionStore } from '../permission/index.js';
import { logStore } from '../log/index.js';

/**
 * 页面渲染器
 */
const PageRenderer = {
    /**
     * 渲染用户列表
     * @param {HTMLElement} container 
     */
    renderUserList(container) {
        const users = userStore.getUsers();
        const tableBody = container.querySelector('#usersTableBody');
        const noUsersMsg = container.querySelector('#noUsersMessage');
        console.debug("用户管理界面")

        if (!tableBody) return;
        console.debug("用户管理界面")

        if (users.length === 0) {
            tableBody.innerHTML = '';
            if (noUsersMsg) noUsersMsg.style.display = 'block';
            return;
        }
        
        if (noUsersMsg) noUsersMsg.style.display = 'none';
        
        tableBody.innerHTML = users.map(user => `
            <tr>
                <td>${user.userid || '-'}</td>
                <td>
                    <div class="user-avatar">${(user.name || 'U').charAt(0).toUpperCase()}</div>
                </td>
                <td class="user-name">${user.name || '-'}</td>
                <td class="user-password">
                    <span class="password-mask">******</span>
                </td>
                <td class="action-cell">
                    <button class="action-btn action-btn-edit" onclick="editUser(${user.userid})">编辑</button>
                    <button class="action-btn action-btn-delete" onclick="deleteUser(${user.userid})">删除</button>
                </td>
            </tr>
        `).join('');
    },
    
    /**
     * 渲染项目列表
     * @param {HTMLElement} container 
     */
    renderProjectList(container) {
        const projects = projectStore.getProjects();
        // 项目列表渲染逻辑...
    },
};

/**
 * 页面加载管理器
 */
export const PageLoader = {
    /**
     * 加载 GM 命令模块
     * @param {HTMLElement} container 容器
     * @param {number} projectId 项目 ID
     */
    async loadGmOrderModule(container, projectId) {
        try {
            // 加载 GM 命令数据
            await gmOrderStore.fetchOrders(projectId);
            
            // 渲染 GM 命令列表
            this.renderGmOrderList(container);
            
            // 触发事件
            eventBus.emit(Events.NAVIGATE, { page: 'gmOrder', projectId });
            
            showToast('加载完成', 'success');
        } catch (error) {
            showToast(error.message || '加载失败', 'error');
            throw error;
        }
    },
    
    /**
     * 渲染 GM 命令列表
     */
    renderGmOrderList(container) {
        const orders = gmOrderStore.getOrders();
        // 渲染逻辑...
    },
    
    /**
     * 加载项目管理模块
     * @param {HTMLElement} container 容器
     */
    async loadProjectModule(container) {
        try {
            await projectStore.fetchProjects();
            eventBus.emit(Events.NAVIGATE, { page: 'project' });
        } catch (error) {
            showToast(error.message || '加载失败', 'error');
            throw error;
        }
    },
    
    /**
     * 加载用户管理模块
     * @param {HTMLElement} container 容器
     */
    async loadUserModule(container) {
        try {
            // 1. 动态加载 HTML 页面
            const html = await loadHtml.gmUserManagement();
            container.innerHTML = html;
            
            // 保存容器引用，用于事件监听
            this._userContainer = container;
            
            // 监听数据加载事件，确保数据返回后立即渲染
            const dataLoadedHandler = (eventData) => {
                if (eventData.type === 'user') {
                    PageRenderer.renderUserList(this._userContainer);
                }
            };
            
            // 绑定一次性事件监听器
            eventBus.once(Events.DATA_LOADED, dataLoadedHandler);
            
            // 2. 获取用户数据
            await userStore.fetchUsers();
            
            // 3. 绑定用户管理页面的事件
            this.bindUserManagementEvents(container);
            
            eventBus.emit(Events.NAVIGATE, { page: 'user' });
        } catch (error) {
            showToast(error.message || '加载失败', 'error');
            throw error;
        }
    },
    
    /**
     * 绑定用户管理页面事件
     */
    bindUserManagementEvents(container) {
        // 搜索功能
        const searchInput = container.querySelector('#searchInput');
        if (searchInput) {
            searchInput.onkeyup = (e) => this.handleUserSearch(e.target.value);
        }
        
        // 新增用户按钮
        const addBtn = container.querySelector('button[onclick="openAddUserModal()"]');
        if (addBtn) {
            addBtn.onclick = () => this.openAddUserModal();
        }
        
        // 模态框关闭按钮
        const closeModalBtn = container.querySelector('#userModal .close-btn');
        if (closeModalBtn) {
            closeModalBtn.onclick = () => this.closeModal();
        }
        
        // 取消按钮
        const cancelBtn = container.querySelector('#userModal .btn[onclick="closeModal()"]');
        if (cancelBtn) {
            cancelBtn.onclick = () => this.closeModal();
        }
        
        // 保存用户按钮
        const saveBtn = container.querySelector('#userModal .btn-primary');
        if (saveBtn) {
            saveBtn.onclick = () => this.saveUser();
        }
        
        // 提示弹窗关闭按钮
        const alertCloseBtn = container.querySelector('#alertModal .btn-primary');
        if (alertCloseBtn) {
            alertCloseBtn.onclick = () => this.closeAlertModal();
        }
    },
    
    /**
     * 处理用户搜索
     */
    handleUserSearch(keyword) {
        const users = userStore.searchUsers(keyword);
        const container = document.querySelector('#dynamicContent');
        if (container) {
            // 临时替换用户列表并渲染过滤结果
            const originalUsers = userStore.getUsers();
            // 这里可以优化为在渲染时过滤
            this.renderFilteredUsers(container, users);
        }
    },
    
    /**
     * 渲染过滤后的用户列表
     */
    renderFilteredUsers(container, users) {
        const tableBody = container.querySelector('#usersTableBody');
        const noUsersMsg = container.querySelector('#noUsersMessage');
        
        if (!tableBody) return;
        
        if (users.length === 0) {
            tableBody.innerHTML = '';
            if (noUsersMsg) noUsersMsg.style.display = 'block';
            return;
        }
        
        if (noUsersMsg) noUsersMsg.style.display = 'none';
        
        tableBody.innerHTML = users.map(user => `
            <tr>
                <td>${user.userid || '-'}</td>
                <td>
                    <div class="user-avatar">${(user.name || 'U').charAt(0).toUpperCase()}</div>
                </td>
                <td class="user-name">${user.name || '-'}</td>
                <td class="user-password">
                    <span class="password-mask">******</span>
                </td>
                <td class="action-cell">
                    <button class="action-btn action-btn-edit" onclick="editUser(${user.userid})">编辑</button>
                    <button class="action-btn action-btn-delete" onclick="deleteUser(${user.userid})">删除</button>
                </td>
            </tr>
        `).join('');
    },
    
    /**
     * 打新增用户模态框
     */
    openAddUserModal() {
        const modal = document.getElementById('userModal');
        const modalTitle = document.getElementById('modalTitle');
        const userIdInput = document.getElementById('userId');
        const userNameInput = document.getElementById('userName');
        const userPasswordInput = document.getElementById('userPassword');
        
        if (modal) {
            modalTitle.textContent = '新增用户';
            userIdInput.value = '';
            userNameInput.value = '';
            userPasswordInput.value = '';
            modal.classList.add('active');
        }
    },
    
    /**
     * 编辑用户
     */
    editUser(userId) {
        const user = userStore.findUser(userId);
        if (!user) return;
        
        const modal = document.getElementById('userModal');
        const modalTitle = document.getElementById('modalTitle');
        const userIdInput = document.getElementById('userId');
        const userNameInput = document.getElementById('userName');
        const userPasswordInput = document.getElementById('userPassword');
        
        if (modal) {
            modalTitle.textContent = '编辑用户';
            userIdInput.value = user.userid;
            userNameInput.value = user.name || '';
            userPasswordInput.value = user.password || '';
            modal.classList.add('active');
        }
    },
    
    /**
     * 删除用户
     */
    async deleteUser(userId) {
        try {
            await userStore.deleteUser(userId);
            // 重新渲染列表
            const container = document.querySelector('#dynamicContent');
            if (container) {
                PageRenderer.renderUserList(container);
            }
            this.showAlert('删除成功', '用户已成功删除', 'success');
        } catch (error) {
            // 错误已在 store 中处理
        }
    },
    
    /**
     * 关闭用户模态框
     */
    closeModal() {
        const modal = document.getElementById('userModal');
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    /**
     * 保存用户
     */
    async saveUser() {
        const userId = document.getElementById('userId').value;
        const userName = document.getElementById('userName').value.trim();
        const userPassword = document.getElementById('userPassword').value.trim();
        
        if (!userName || !userPassword) {
            showToast('请填写完整信息', 'warning');
            return;
        }
        
        try {
            if (userId) {
                // 编辑模式
                await userStore.modifyUser({
                    userid: parseInt(userId),
                    name: userName,
                    password: userPassword,
                });
            } else {
                // 新增模式
                await userStore.addUser({
                    name: userName,
                    password: userPassword,
                });
            }
            
            this.closeModal();
            
            // 重新渲染列表
            const container = document.querySelector('#dynamicContent');
            if (container) {
                PageRenderer.renderUserList(container);
            }
            
            this.showAlert(userId ? '修改成功' : '添加成功', `用户 "${userName}" 已${userId ? '修改' : '添加'}成功`, 'success');
        } catch (error) {
            // 错误已在 store 中处理
        }
    },
    
    /**
     * 显示提示弹窗
     */
    showAlert(title, message, type = 'info') {
        const alertModal = document.getElementById('alertModal');
        const alertTitle = document.getElementById('alertMessage');
        const alertDetail = document.getElementById('alertDetail');
        const alertIcon = document.getElementById('alertIcon');
        
        if (alertModal) {
            alertTitle.textContent = title;
            alertDetail.textContent = message;
            
            const colors = {
                success: '#10b981',
                error: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6',
            };
            
            alertIcon.innerHTML = type === 'success' ? '<span>✓</span>' : 
                                  type === 'error' ? '<span>✕</span>' : '<span>ℹ</span>';
            alertIcon.style.background = `${colors[type] || colors.info}20`;
            alertIcon.style.color = colors[type] || colors.info;
            
            alertModal.classList.add('active');
        }
    },
    
    /**
     * 关闭提示弹窗
     */
    closeAlertModal() {
        const alertModal = document.getElementById('alertModal');
        if (alertModal) {
            alertModal.classList.remove('active');
        }
    },
    
    /**
     * 加载权限管理模块
     * @param {HTMLElement} container 容器
     */
    async loadPermissionModule(container) {
        try {
            await permissionStore.fetchPermissions();
            eventBus.emit(Events.NAVIGATE, { page: 'permission' });
        } catch (error) {
            showToast(error.message || '加载失败', 'error');
            throw error;
        }
    },
    
    /**
     * 加载日志模块
     * @param {HTMLElement} container 容器
     */
    async loadLogModule(container) {
        try {
            await logStore.fetchLogs();
            eventBus.emit(Events.NAVIGATE, { page: 'log' });
        } catch (error) {
            showToast(error.message || '加载失败', 'error');
            throw error;
        }
    },
    
    /**
     * 加载用户可用的项目列表
     * @param {HTMLElement} container 容器
     */
    async loadUserProjects(container) {
        try {
            await projectStore.fetchUserProjects();
            eventBus.emit(Events.DATA_LOADED, { type: 'userProjects', data: projectStore.getProjects() });
        } catch (error) {
            showToast(error.message || '加载失败', 'error');
            throw error;
        }
    },
};

/**
 * 导航管理器
 */
export const NavigationManager = {
    // 当前导航状态
    state: {
        currentPage: null,
        previousPage: null,
        history: [],
    },
    
    // 事件绑定是否已初始化
    _eventsBound: false,
    
    /**
     * 初始化导航
     * @param {HTMLElement} navContainer 导航容器
     * @param {HTMLElement} contentContainer 内容容器
     */
    init(navContainer, contentContainer) {
        this.navContainer = navContainer;
        this.contentContainer = contentContainer;
        this.bindEvents();
    },
    
    /**
     * 绑定导航事件 - 使用事件委托
     */
    bindEvents() {
        if (this._eventsBound) return;
        
        // 使用事件委托，在父容器上绑定事件
        const navContent = document.querySelector('.nav-content') || document.querySelector('.nav-menu');
        if (!navContent) {
            console.warn('导航容器未找到，延迟重试...');
            setTimeout(() => this.bindEvents(), 100);
            return;
        }
        
        // 使用事件委托绑定所有导航链接的点击事件
        navContent.addEventListener('click', (e) => {
            const link = e.target.closest('.nav-link[id]');
            if (!link) return;
            
            const id = link.id;
            
            switch (id) {
                case 'navLinkGmOperation':
                    this.handleGmOperationClick(e);
                    break;
                case 'navLinkGmProject':
                    this.navigate('project');
                    break;
                case 'navLinkUsers':
                    this.navigate('user');
                    break;
                case 'navLinkPermission':
                    this.navigate('permission');
                    break;
                case 'navLinkLog':
                    this.navigate('log');
                    break;
            }
        });
        
        this._eventsBound = true;
        console.log('导航事件绑定完成');
    },
    
    /**
     * 处理 GM 操作点击
     */
    async handleGmOperationClick(e) {
        e.preventDefault();
        const parentItem = e.target.closest('.has-submenu');
        if (parentItem && !parentItem.classList.contains('open')) {
            parentItem.classList.add('open');
            const submenu = parentItem.querySelector('.submenu');
            if (submenu) {
                await PageLoader.loadUserProjects(submenu);
            }
            return;
        }
        // 如果已经展开，导航到 GM 操作页面
        this.navigate('gmOperation');
    },
    
    /**
     * 导航到页面
     * @param {string} page 页面名
     * @param {Object} params 参数
     */
    async navigate(page, params = {}) {
        this.state.previousPage = this.state.currentPage;
        this.state.currentPage = page;
        this.state.history.push(page);
        
        // 隐藏默认内容，显示动态内容
        const defaultContent = document.querySelector('.default-content');
        const dynamicContent = document.getElementById('dynamicContent');
        
        if (defaultContent) defaultContent.style.display = 'none';
        if (dynamicContent) dynamicContent.style.display = 'block';
        
        // 根据页面加载内容
        switch (page) {
            case 'project':
                await PageLoader.loadProjectModule(dynamicContent);
                break;
            case 'user':
                await PageLoader.loadUserModule(dynamicContent);
                break;
            case 'permission':
                await PageLoader.loadPermissionModule(dynamicContent);
                break;
            case 'log':
                await PageLoader.loadLogModule(dynamicContent);
                break;
            case 'gmOrder':
                await PageLoader.loadGmOrderModule(dynamicContent, params.projectId);
                break;
        }
        
        eventBus.emit(Events.NAVIGATE, { page, params });
    },
    
    /**
     * 返回上一页
     */
    back() {
        if (this.state.history.length > 1) {
            this.state.history.pop();
            const previousPage = this.state.history[this.state.history.length - 1];
            this.navigate(previousPage);
        }
    },
    
    /**
     * 重置导航
     */
    reset() {
        this.state.currentPage = null;
        this.state.previousPage = null;
        this.state.history = [];
        
        const defaultContent = document.querySelector('.default-content');
        const dynamicContent = document.getElementById('dynamicContent');
        
        if (defaultContent) defaultContent.style.display = 'block';
        if (dynamicContent) dynamicContent.style.display = 'none';
    },
};

/**
 * 初始化应用
 */
export function initApp() {
    console.log('initApp 被调用');
    
    // 查找导航容器
    const navContainer = document.querySelector('.nav-menu') || document.querySelector('.nav-content');
    const contentContainer = document.getElementById('contentDisplay');
    
    console.log('导航容器:', navContainer);
    console.log('内容容器:', contentContainer);
    
    if (navContainer && contentContainer) {
        NavigationManager.init(navContainer, contentContainer);
    } else {
        // 如果元素还未渲染，延迟初始化
        console.warn('元素未找到，延迟初始化...');
        setTimeout(() => initApp(), 200);
        return;
    }
    
    // 显示就绪提示
    showToast('应用已就绪', 'success', 1500);
    
    // 触发应用就绪事件
    eventBus.emit(Events.APP_READY);
}
