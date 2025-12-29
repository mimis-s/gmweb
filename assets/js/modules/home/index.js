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

        if (!tableBody) return;

        if (users.length === 0) {
            tableBody.innerHTML = '';
            if (noUsersMsg) noUsersMsg.style.display = 'block';
            return;
        }

        if (noUsersMsg) noUsersMsg.style.display = 'none';

        tableBody.innerHTML = users.map(user => `
            <tr data-user-id="${user.userid}">
                <td>${user.userid || '-'}</td>
                <td>
                    <div class="user-avatar">${(user.name || 'U').charAt(0).toUpperCase()}</div>
                </td>
                <td class="user-name">${user.name || '-'}</td>
                <td>
                    <span class="password-mask" data-field="password">******</span>
                    <button class="btn-toggle-password" data-action="toggle-password" data-user-id="${user.userid}" style="margin-left: 10px; padding: 4px 8px; font-size: 0.8rem; background: #f1f1f1; border: none; border-radius: 4px; cursor: pointer;">
                        显示密码
                    </button>
                </td>
                <td class="action-cell">
                    <button class="action-btn action-btn-edit" data-action="edit-user" data-user-id="${user.userid}">编辑</button>
                    <button class="action-btn action-btn-delete" data-action="delete-user" data-user-id="${user.userid}">删除</button>
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
            const html = await loadHtml.gmOrderCard();
            container.innerHTML = html

            await gmOrderStore.fetchOrders(projectId);
            
            // 渲染 GM 命令列表
            this.renderGmOrderList(container);
            
            // 触发事件
            // eventBus.emit(Events.NAVIGATE, { page: 'gmOrder', projectId });
            
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
            const html = await loadHtml.gmProjectBox();
            container.innerHTML = html
            await projectStore.fetchProjects();
            // eventBus.emit(Events.NAVIGATE, { page: 'project' });
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
        const html = await loadHtml.gmUserManagement();
        container.innerHTML = html;

        // 保存容器引用，用于事件监听
        this._userContainer = container;
        
        // 2. 监听数据加载事件，确保数据返回后立即渲染
        const dataLoadedHandler = (eventData) => {
            PageRenderer.renderUserList(this._userContainer);
        };
        
        // 绑定一次性事件监听器
        eventBus.on(Events.GetUsersRsp, dataLoadedHandler);
        
        // 3. 获取用户数据
        await userStore.fetchUsers();
        
        // 4. 绑定用户管理页面的事件
        this.bindUserManagementEvents(container);
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

        // 使用事件委托统一处理表格中的按钮点击
        const tableBody = container.querySelector('#usersTableBody');
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;

                const action = btn.dataset.action;
                const userId = parseInt(btn.dataset.userId);

                switch (action) {
                    case 'toggle-password':
                        this.handleTogglePassword(btn);
                        break;
                    case 'edit-user':
                        this.editUser(userId);
                        break;
                    case 'delete-user':
                        this.deleteUser(userId);
                        break;
                }
            });
        }
    },

    /**
     * 处理密码显示/隐藏切换
     * @param {HTMLElement} btn 按钮元素
     */
    handleTogglePassword(btn) {
        const row = btn.closest('tr');
        const passwordSpan = row.querySelector('[data-field="password"]');
        if (!passwordSpan || !row) return;

        const userId = parseInt(row.dataset.userId);
        const user = userStore.findUser(userId);

        if (passwordSpan.dataset.revealed === 'true') {
            // 隐藏密码
            passwordSpan.textContent = '******';
            passwordSpan.dataset.revealed = 'false';
            btn.textContent = '显示密码';
        } else {
            // 显示密码
            passwordSpan.textContent = user?.password || '******';
            passwordSpan.dataset.revealed = 'true';
            btn.textContent = '隐藏密码';
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
            <tr data-user-id="${user.userid}">
                <td>${user.userid || '-'}</td>
                <td>
                    <div class="user-avatar">${(user.name || 'U').charAt(0).toUpperCase()}</div>
                </td>
                <td class="user-name">${user.name || '-'}</td>
                <td class="user-password">
                    <span class="password-mask" data-field="password">******</span>
                    <button class="btn-toggle-password" data-action="toggle-password" data-user-id="${user.userid}" style="margin-left: 10px; padding: 4px 8px; font-size: 0.8rem; background: #f1f1f1; border: none; border-radius: 4px; cursor: pointer;">
                        显示密码
                    </button>
                </td>
                <td class="action-cell">
                    <button class="action-btn action-btn-edit" data-action="edit-user" data-user-id="${user.userid}">编辑</button>
                    <button class="action-btn action-btn-delete" data-action="delete-user" data-user-id="${user.userid}">删除</button>
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
                console.debug("删除",userId )
                PageRenderer.renderUserList(container);
            }
        } catch (error) {
            // 错误已在 store 中处理
            console.debug("删除失败",userId )
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
        const html = await loadHtml.gmPermission();
        container.innerHTML = html;

        // 保存容器引用
        this._permissionContainer = container;

        // 监听数据加载事件，确保数据返回后立即渲染
        const dataLoadedHandler = () => {
            this.renderPermissions(this._permissionContainer);
            this.renderPermissionGroups(this._permissionContainer);
            this.renderAssignments(this._permissionContainer);
            // 更新下拉框和复选框
            this.updatePermissionDropdowns(this._permissionContainer);
            this.updatePermissionCheckboxes(this._permissionContainer);
        };

        // 绑定一次性事件监听器
        eventBus.once(Events.GetPermissionsRsp, dataLoadedHandler);

        // 获取权限数据
        await permissionStore.fetchPermissions();

        // 如果事件已经触发，手动渲染
        if (permissionStore.getState().permissions.length > 0) {
            dataLoadedHandler();
        }

        // 绑定页面事件
        this.bindPermissionEvents(container);
    },

    /**
     * 更新权限相关下拉框
     */
    updatePermissionDropdowns(container) {
        const state = permissionStore.getState();

        // 更新项目下拉框
        const projectSelect = container.querySelector('#permissionProjectSelect');
        if (projectSelect) {
            projectSelect.innerHTML = '<option value="">所有项目</option>';
            state.allProjects.forEach(p => {
                const option = document.createElement('option');
                option.value = p.projectid;
                option.textContent = `${p.projectid}-${p.name}`;
                projectSelect.appendChild(option);
            });
        }

        // 更新等级下拉框
        const levelSelect = container.querySelector('#permissionLevelSelect');
        if (levelSelect) {
            levelSelect.innerHTML = '<option value="">所有等级</option>';
            state.allLevels.forEach(level => {
                const option = document.createElement('option');
                option.value = level;
                option.textContent = `等级 (${level})`;
                levelSelect.appendChild(option);
            });
        }

        // 更新权限组下拉框(用于分配)
        const groupSelect = container.querySelector('#groupSelect');
        if (groupSelect) {
            groupSelect.innerHTML = '<option value="">选择权限组</option>';
            state.permissionGroups
                .filter(g => g.enable === true)
                .forEach(g => {
                    const option = document.createElement('option');
                    option.value = g.id;
                    option.textContent = `${g.id} (${g.name})`;
                    groupSelect.appendChild(option);
                });
        }

        // 更新用户下拉框(用于分配)
        const userSelect = container.querySelector('#playerIdSelect');
        if (userSelect) {
            userSelect.innerHTML = '<option value="">选择用户</option>';
            state.allUsers.forEach(u => {
                const option = document.createElement('option');
                option.value = u.userid;
                option.textContent = `${u.userid} (${u.username || u.name})`;
                userSelect.appendChild(option);
            });
        }
    },

    /**
     * 更新权限复选框(用于创建权限组)
     */
    updatePermissionCheckboxes(container) {
        const state = permissionStore.getState();
        const checkboxContainer = container.querySelector('#permissionCheckboxes');

        if (!checkboxContainer) return;

        const activePermissions = state.permissions.filter(p => p.enable === true);

        if (activePermissions.length === 0) {
            checkboxContainer.innerHTML = '<p style="color:#777;font-style:italic;">暂无可用权限，请先在权限模块创建权限</p>';
            return;
        }

        checkboxContainer.innerHTML = activePermissions.map(p => `
            <div class="checkbox-item">
                <input type="checkbox" id="perm_${p.id}" value="${p.id}">
                <label for="perm_${p.id}">${p.name}</label>
            </div>
        `).join('');
    },

    /**
     * 渲染权限列表
     */
    renderPermissions(container) {
        const permissions = permissionStore.getState().permissions;
        const tableBody = container.querySelector('#permissionsTableBody');
        const emptyMsg = container.querySelector('#emptyPermissions');

        if (!tableBody) return;

        if (permissions.length === 0) {
            tableBody.innerHTML = '';
            if (emptyMsg) emptyMsg.style.display = 'block';
            return;
        }

        if (emptyMsg) emptyMsg.style.display = 'none';

        tableBody.innerHTML = permissions.map(p => {
            const isEnabled = p.enable === true || p.enable === 1 || p.enable === 'true';
            return `
            <tr>
                <td>${p.id || '-'}</td>
                <td>${p.name || '-'}</td>
                <td>${p.project_name || (p.projectid === 0 ? '所有项目' : p.projectid)}</td>
                <td>${p.level === 0 ? '所有等级' : p.level}</td>
                <td>${p.ordername_match || '-'}</td>
                <td class="${isEnabled ? 'status-active' : 'status-inactive'}">
                    ${isEnabled ? '启用' : '禁用'}
                </td>
                <td>
                    <button class="action-btn action-btn-toggle" data-action="toggle-permission" data-id="${p.id}" data-enabled="${isEnabled}">
                        ${isEnabled ? '禁用' : '启用'}
                    </button>
                    <button class="action-btn action-btn-delete" data-action="delete-permission" data-id="${p.id}">删除</button>
                </td>
            </tr>
        `}).join('');
    },

    /**
     * 渲染权限组列表
     */
    renderPermissionGroups(container) {
        const groups = permissionStore.getState().permissionGroups;
        const tableBody = container.querySelector('#groupsTableBody');
        const emptyMsg = container.querySelector('#emptyGroups');

        if (!tableBody) return;

        if (groups.length === 0) {
            tableBody.innerHTML = '';
            if (emptyMsg) emptyMsg.style.display = 'block';
            return;
        }

        if (emptyMsg) emptyMsg.style.display = 'none';

        tableBody.innerHTML = groups.map(g => {
            const isEnabled = g.enable === true || g.enable === 1 || g.enable === 'true';
            return `
            <tr>
                <td>${g.id || '-'}</td>
                <td>${g.name || '-'}</td>
                <td>${g.powerids?.length || 0}</td>
                <td class="${isEnabled ? 'status-active' : 'status-inactive'}">
                    ${isEnabled ? '启用' : '禁用'}
                </td>
                <td>
                    <button class="action-btn action-btn-toggle" data-action="toggle-group" data-id="${g.id}" data-enabled="${isEnabled}">
                        ${isEnabled ? '禁用' : '启用'}
                    </button>
                    <button class="action-btn action-btn-delete" data-action="delete-group" data-id="${g.id}">删除</button>
                </td>
            </tr>
        `}).join('');
    },

    /**
     * 渲染权限分配列表
     */
    renderAssignments(container) {
        const assignments = permissionStore.getState().assignments;
        const tableBody = container.querySelector('#assignmentsTableBody');
        const emptyMsg = container.querySelector('#emptyAssignments');

        if (!tableBody) return;

        if (assignments.length === 0) {
            tableBody.innerHTML = '';
            if (emptyMsg) emptyMsg.style.display = 'block';
            return;
        }

        if (emptyMsg) emptyMsg.style.display = 'none';

        tableBody.innerHTML = assignments.map(a => `
            <tr>
                <td>${a.userid || '-'}</td>
                <td>${a.username || '-'}</td>
                <td>${a.groupid || '-'}</td>
                <td>${a.groupname || '-'}</td>
                <td>
                    <button class="action-btn action-btn-delete" data-action="delete-assignment" data-id="${a.id}">删除</button>
                </td>
            </tr>
        `).join('');
    },

    /**
     * 绑定权限管理页面事件
     */
    bindPermissionEvents(container) {
        // 使用事件委托绑定表格操作按钮
        const tables = container.querySelectorAll('table');
        tables.forEach(table => {
            table.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-action]');
                if (!btn) return;

                const action = btn.dataset.action;
                const id = parseInt(btn.dataset.id);

                switch (action) {
                    case 'toggle-permission':
                        this.handleTogglePermission(id, btn.dataset.enabled === 'true');
                        break;
                    case 'delete-permission':
                        this.handleDeletePermission(id);
                        break;
                    case 'toggle-group':
                        this.handleTogglePermissionGroup(id, btn.dataset.enabled === 'true');
                        break;
                    case 'delete-group':
                        this.handleDeletePermissionGroup(id);
                        break;
                    case 'delete-assignment':
                        this.handleRemoveAssignment(id);
                        break;
                }
            });
        });

        // 添加权限按钮
        const addPermissionBtn = container.querySelector('#addPermissionBtn');
        if (addPermissionBtn) {
            addPermissionBtn.onclick = () => this.handleAddPermission();
        }

        // 添加权限组按钮
        const addGroupBtn = container.querySelector('#addGroupBtn');
        if (addGroupBtn) {
            addGroupBtn.onclick = () => this.handleAddPermissionGroup();
        }

        // 分配权限按钮
        const assignBtn = container.querySelector('#assignPermissionBtn');
        if (assignBtn) {
            assignBtn.onclick = () => this.handleAssignPermission();
        }
    },

    /**
     * 处理添加权限
     */
    async handleAddPermission() {
        const nameInput = document.getElementById('permissionName');
        const projectSelect = document.getElementById('permissionProjectSelect');
        const levelSelect = document.getElementById('permissionLevelSelect');
        const orderMatchInput = document.getElementById('permissionOrderNameMatch');

        const name = nameInput?.value.trim();
        const projectId = projectSelect?.value;
        const levelId = levelSelect?.value;
        const orderMatch = orderMatchInput?.value.trim();

        if (!name) {
            showToast('请输入权限名称', 'warning');
            return;
        }

        // 获取项目名称
        let projectname = '';
        if (projectSelect && projectSelect.selectedIndex >= 0) {
            const text = projectSelect.options[projectSelect.selectedIndex].text;
            const parts = text.split('-');
            if (parts.length >= 2) {
                projectname = parts[1].trim();
            }
        }

        try {
            // 传递参数与旧版一致
            const addPermissionReq = {
                name: name,
                enable: true,
                projectid: Number(projectId),
                projectname: projectname,
                level: Number(levelId),
                ordernamematch: orderMatch,
            };

            await permissionStore.addPermission(addPermissionReq);

            // 清空表单
            if (nameInput) nameInput.value = '';
            if (levelSelect) levelSelect.value = '';
            if (projectSelect) projectSelect.selectedIndex = 0;
            if (orderMatchInput) orderMatchInput.value = '';

            // 重新渲染并刷新关联数据
            if (this._permissionContainer) {
                this.renderPermissions(this._permissionContainer);
                // 刷新权限组相关的下拉框和复选框
                this.updatePermissionDropdowns(this._permissionContainer);
                this.updatePermissionCheckboxes(this._permissionContainer);
            }
        } catch (error) {
            // 错误已在 store 中处理
        }
    },

    /**
     * 处理删除权限
     */
    async handleDeletePermission(id) {
        try {
            await permissionStore.deletePermission(id);

            // 重新渲染并刷新关联数据
            if (this._permissionContainer) {
                this.renderPermissions(this._permissionContainer);
                // 刷新权限组相关的复选框
                this.updatePermissionCheckboxes(this._permissionContainer);
            }
        } catch (error) {
            // 错误已在 store 中处理
        }
    },

    /**
     * 处理添加权限组
     */
    async handleAddPermissionGroup() {
        const groupNameInput = document.getElementById('groupName');
        const permissionCheckboxes = document.getElementById('permissionCheckboxes');
        
        const name = groupNameInput?.value.trim();

        if (!name) {
            showToast('请输入权限组名称', 'warning');
            return;
        }

        // 获取选中的权限
        const selectedPermissionIds = [];
        const selectedCheckboxes = permissionCheckboxes?.querySelectorAll('input[type="checkbox"]:checked');
        
        if (selectedCheckboxes && selectedCheckboxes.length > 0) {
            selectedCheckboxes.forEach(checkbox => {
                selectedPermissionIds.push(parseInt(checkbox.value));
            });
        }

        try {
            await permissionStore.addPermissionGroup({
                name,
                enable: true,
                powerids: selectedPermissionIds,
            });

            // 清空表单
            if (groupNameInput) groupNameInput.value = '';
            if (permissionCheckboxes) {
                permissionCheckboxes.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            }

            // 重新渲染并刷新关联数据
            if (this._permissionContainer) {
                this.renderPermissionGroups(this._permissionContainer);
                // 刷新分配下拉框
                this.updatePermissionDropdowns(this._permissionContainer);
            }
        } catch (error) {
            // 错误已在 store 中处理
        }
    },

    /**
     * 处理删除权限组
     */
    async handleDeletePermissionGroup(id) {
        try {
            await permissionStore.deletePermissionGroup(id);

            // 重新渲染并刷新关联数据
            if (this._permissionContainer) {
                this.renderPermissionGroups(this._permissionContainer);
                // 刷新分配下拉框
                this.updatePermissionDropdowns(this._permissionContainer);
            }
        } catch (error) {
            // 错误已在 store 中处理
        }
    },

    /**
     * 处理分配权限
     */
    async handleAssignPermission() {
        const playerIdSelect = document.getElementById('playerIdSelect');
        const groupSelect = document.getElementById('groupSelect');
        
        const userId = playerIdSelect?.value;
        const groupId = groupSelect?.value;

        if (!userId) {
            showToast('请选择一个有效用户', 'warning');
            return;
        }

        if (!groupId) {
            showToast('请选择权限组', 'warning');
            return;
        }

        // 检查是否已经分配过
        const state = permissionStore.getState();
        const existingAssignment = state.assignments.find(
            a => a.userid === parseInt(userId) && a.groupid === parseInt(groupId)
        );
        if (existingAssignment) {
            showToast('该玩家已经分配了这个权限组', 'warning');
            return;
        }

        try {
            await permissionStore.assignPermission(
                parseInt(userId),
                parseInt(groupId)
            );

            // 清空表单
            if (playerIdSelect) playerIdSelect.value = '';
            if (groupSelect) groupSelect.value = '';

            // 重新渲染
            if (this._permissionContainer) {
                this.renderAssignments(this._permissionContainer);
            }
        } catch (error) {
            // 错误已在 store 中处理
        }
    },

    /**
     * 处理取消权限分配
     */
    async handleRemoveAssignment(id) {
        try {
            await permissionStore.removeAssignment(id);

            // 重新渲染
            if (this._permissionContainer) {
                this.renderAssignments(this._permissionContainer);
            }
        } catch (error) {
            // 错误已在 store 中处理
        }
    },

    /**
     * 处理切换权限状态
     */
    async handleTogglePermission(id, currentEnabled) {
        try {
            await permissionStore.togglePermission(id, !currentEnabled);

            // 重新渲染并刷新关联数据
            if (this._permissionContainer) {
                this.renderPermissions(this._permissionContainer);
                // 刷新权限组相关的复选框（禁用的权限不应该出现在创建组的选项中）
                this.updatePermissionCheckboxes(this._permissionContainer);
            }
        } catch (error) {
            // 错误已在 store 中处理
        }
    },

    /**
     * 处理切换权限组状态
     */
    async handleTogglePermissionGroup(id, currentEnabled) {
        try {
            await permissionStore.togglePermissionGroup(id, !currentEnabled);

            // 重新渲染并刷新关联数据
            if (this._permissionContainer) {
                this.renderPermissionGroups(this._permissionContainer);
                // 刷新分配下拉框（禁用的权限组不应该出现在分配选项中）
                this.updatePermissionDropdowns(this._permissionContainer);
            }
        } catch (error) {
            // 错误已在 store 中处理
        }
    },

    /**
     * 加载日志模块
     * @param {HTMLElement} container 容器
     */
    async loadLogModule(container) {
        try {
            const html = await loadHtml.gmLog();
            container.innerHTML = html;

            // 保存容器引用
            this._logContainer = container;

            // 初始化日期范围
            this.initLogDates(container);

            // 绑定事件
            this.bindLogEvents(container);

            // 获取日志
            await logStore.fetchLogs();

            // 渲染日志
            this.renderLogs(container);
            this.updateLogPagination(container);
        } catch (error) {
            showToast(error.message || '加载失败', 'error');
            throw error;
        }
    },

    /**
     * 初始化日志日期
     */
    initLogDates(container) {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        const startDateInput = container.querySelector('#startDate');
        const endDateInput = container.querySelector('#endDate');

        if (startDateInput) startDateInput.value = yesterdayStr;
        if (endDateInput) endDateInput.value = today;

        // 设置 store 中的日期
        logStore.setFilter({ startDate: yesterdayStr, endDate: today });
    },

    /**
     * 绑定日志页面事件
     */
    bindLogEvents(container) {
        // 查询表单
        const queryForm = container.querySelector('#queryForm');
        if (queryForm) {
            queryForm.addEventListener('submit', (e) => this.handleLogQuery(e, container));
        }

        // 重置按钮
        const resetBtn = container.querySelector('#resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetLogQuery(container));
        }

        // 表格视图按钮
        const tableViewBtn = container.querySelector('#tableViewBtn');
        if (tableViewBtn) {
            tableViewBtn.addEventListener('click', () => this.switchLogView('table', container));
        }

        // 上一页
        const prevPageBtn = container.querySelector('#prevPage');
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => this.logPrevPage(container));
        }

        // 下一页
        const nextPageBtn = container.querySelector('#nextPage');
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => this.logNextPage(container));
        }

        // 排序事件
        container.querySelectorAll('.sortable').forEach(th => {
            th.addEventListener('click', () => {
                const field = th.getAttribute('data-sort');
                this.sortLogs(field, container);
            });
        });

        // 切换视图按钮状态
        const tableView = container.querySelector('#tableViewBtn');
        if (tableView) {
            tableView.classList.add('active');
        }
    },

    /**
     * 处理日志查询
     */
    handleLogQuery(e, container) {
        e.preventDefault();

        const username = container.querySelector('#username')?.value.trim() || '';
        const ip = container.querySelector('#ip')?.value.trim() || '';
        const level = container.querySelector('#level')?.value || 0;
        const startDate = container.querySelector('#startDate')?.value || '';
        const endDate = container.querySelector('#endDate')?.value || '';
        const message = container.querySelector('#message')?.value.trim() || '';

        logStore.setFilter({
            username,
            ip,
            level: Number(level),
            startDate,
            endDate,
            message
        });

        logStore.setPage(1);

        this.loadLogsAndRender(container);
    },

    /**
     * 重置日志查询
     */
    resetLogQuery(container) {
        // 清空表单
        const usernameInput = container.querySelector('#username');
        const ipInput = container.querySelector('#ip');
        const levelSelect = container.querySelector('#level');
        const messageInput = container.querySelector('#message');

        if (usernameInput) usernameInput.value = '';
        if (ipInput) ipInput.value = '';
        if (levelSelect) levelSelect.value = 0;
        if (messageInput) messageInput.value = '';

        // 重置日期
        this.initLogDates(container);

        // 重置 store
        logStore.resetFilter();

        // 重新加载
        this.loadLogsAndRender(container);
    },

    /**
     * 加载日志并渲染
     */
    async loadLogsAndRender(container) {
        console.debug('loadLogsAndRender 被调用');
        try {
            const logs = await logStore.fetchLogs();
            console.debug('fetchLogs 返回:', logs.length, '条日志');
            this.renderLogs(container);
            this.updateLogPagination(container);
        } catch (error) {
            console.error('loadLogsAndRender 错误:', error);
            // 错误已在 store 中处理
        }
    },

    /**
     * 切换日志视图
     */
    switchLogView(view, container) {
        logStore.switchView(view);

        const tableViewBtn = container.querySelector('#tableViewBtn');
        const tableView = container.querySelector('#tableView');

        if (tableViewBtn) {
            tableViewBtn.classList.toggle('active', view === 'table');
        }
        if (tableView) {
            tableView.classList.toggle('hidden', view !== 'table');
        }

        this.renderLogs(container);
    },

    /**
     * 排序日志
     */
    sortLogs(field, container) {
        logStore.sortLogs(field);

        // 更新排序指示器
        this.updateSortIndicators(container);

        this.renderLogs(container);
    },

    /**
     * 更新排序指示器
     */
    updateSortIndicators(container) {
        const state = logStore.getState();

        container.querySelectorAll('.sortable i').forEach(icon => {
            icon.className = 'fas fa-sort';
        });

        const currentTh = container.querySelector(`th[data-sort="${state.sortField}"] i`);
        if (currentTh) {
            currentTh.className = state.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
        }
    },

    /**
     * 渲染日志
     */
    renderLogs(container) {
        const pageLogs = logStore.getPageLogs();
        const state = logStore.getState();

        // 确保 filteredLogs 存在
        if (!state.filteredLogs) {
            state.filteredLogs = [];
        }

        console.debug('renderLogs: pageLogs.length =', pageLogs.length, ', filteredLogs.length =', state.filteredLogs.length);

        // 更新统计信息
        const filteredLogsSpan = container.querySelector('#filteredLogs');
        if (filteredLogsSpan) {
            filteredLogsSpan.textContent = state.filteredLogs.length;
        }

        // 清空现有内容
        const tableBody = container.querySelector('#logTableBody');
        const cardView = container.querySelector('#cardView');
        const noLogsTable = container.querySelector('#noLogsTable');

        console.debug('DOM 元素: tableBody =', !!tableBody, ', noLogsTable =', !!noLogsTable);

        if (tableBody) tableBody.innerHTML = '';
        if (cardView) cardView.innerHTML = '';

        if (pageLogs.length === 0) {
            console.debug('没有日志数据，显示空状态');
            if (noLogsTable) noLogsTable.style.display = 'block';
            return;
        }

        if (noLogsTable) noLogsTable.style.display = 'none';

        // 渲染表格视图
        pageLogs.forEach(log => {
            if (!tableBody) return;

            const row = document.createElement('tr');
            const levelMap = { 0: 'UNDEFINE', 1: 'DEBUG', 2: 'ERROR', 3: 'INFO', 4: 'WARNING' };
            const levelLabel = levelMap[log.level] || 'UNDEFINE';

            if (levelLabel === 'ERROR') row.classList.add('error-row');
            if (levelLabel === 'WARNING') row.classList.add('warning-row');

            const timeStr = new Date(log.time).toLocaleString('zh-CN');
            const levelClassName = levelLabel.toLowerCase();

            row.innerHTML = `
                <td><strong>${log.username}</strong></td>
                <td>${log.ip}</td>
                <td><span class="log-level level-${levelClassName}">${levelLabel}</span></td>
                <td>${timeStr}</td>
                <td>${log.message}</td>
            `;

            tableBody.appendChild(row);
        });
    },

    /**
     * 更新日志分页
     */
    updateLogPagination(container) {
        const state = logStore.getState();

        // 确保 filteredLogs 存在
        if (!state.filteredLogs) {
            state.filteredLogs = [];
        }

        const totalPages = Math.ceil(state.filteredLogs.length / state.pageSize);

        // 更新页面信息
        const currentPageSpan = container.querySelector('#currentPage');
        const totalPagesSpan = container.querySelector('#totalPages');

        if (currentPageSpan) currentPageSpan.textContent = state.currentPage;
        if (totalPagesSpan) totalPagesSpan.textContent = totalPages;

        // 更新按钮状态
        const prevPageBtn = container.querySelector('#prevPage');
        const nextPageBtn = container.querySelector('#nextPage');

        if (prevPageBtn) prevPageBtn.disabled = state.currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = state.currentPage === totalPages || totalPages === 0;

        // 生成页码按钮
        const pageNumbersContainer = container.querySelector('#pageNumbers');
        if (!pageNumbersContainer) return;

        pageNumbersContainer.innerHTML = '';

        let startPage = Math.max(1, state.currentPage - 2);
        let endPage = Math.min(totalPages, state.currentPage + 2);

        if (endPage - startPage < 4) {
            if (startPage === 1) {
                endPage = Math.min(totalPages, startPage + 4);
            } else if (endPage === totalPages) {
                startPage = Math.max(1, endPage - 4);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-number ${i === state.currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => {
                logStore.setPage(i);
                this.renderLogs(container);
                this.updateLogPagination(container);
            });
            pageNumbersContainer.appendChild(pageBtn);
        }
    },

    /**
     * 日志上一页
     */
    logPrevPage(container) {
        const state = logStore.getState();
        if (state.currentPage > 1) {
            logStore.setPage(state.currentPage - 1);
            this.renderLogs(container);
            this.updateLogPagination(container);
        }
    },

    /**
     * 日志下一页
     */
    logNextPage(container) {
        const state = logStore.getState();

        // 确保 filteredLogs 存在
        if (!state.filteredLogs) {
            state.filteredLogs = [];
        }

        const totalPages = Math.ceil(state.filteredLogs.length / state.pageSize);
        if (state.currentPage < totalPages) {
            logStore.setPage(state.currentPage + 1);
            this.renderLogs(container);
            this.updateLogPagination(container);
        }
    },
    
    /**
     * 加载用户可用的项目列表
     * @param {HTMLElement} container 容器
     */
    async loadUserProjects(container) {
        try {
            const html = await loadHtml.gmProjectBox();
            container.innerHTML = html;
            await projectStore.fetchUserProjects();
            // eventBus.emit(Events.DATA_LOADED, { type: 'userProjects', data: projectStore.getProjects() });
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
        
        // eventBus.emit(Events.NAVIGATE, { page, params });
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
    // eventBus.emit(Events.APP_READY);
}
