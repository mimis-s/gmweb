// 读取数据

import {apiClient} from "../../api/client.js";
import {showToast} from "../../components/toast.js";

export function createUserMangeClass() {
    return {
        state: {
            users: [],
            currentUserId: null,
            isEditing: false,
        },

// 初始化一些示例用户
        async loadUsersBoxEvent(gridWrapper) {
            try {
                const response = await apiClient.getUsers();
                await this.initUserMangement(gridWrapper, response.message);
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
            
            const usersTableBody = gridWrapper.querySelector('#usersTableBody');
            // 事件委托：统一处理表格中的按钮点击
            usersTableBody.addEventListener('click', (e) => {
                const btn = e.target.closest('button');
                if (!btn) return;

                const action = btn.dataset.action;
                const userId = parseInt(btn.dataset.userId);

                switch (action) {
                    case 'toggle-password':
                        this.togglePassword(userId);
                        break;
                    case 'edit-user':
                        this.editUser(userId);
                        break;
                    case 'delete-user':
                        this.deleteUser(userId);
                        break;
                }
            });

            const searchInput = gridWrapper.querySelector('#searchInput')
            searchInput.addEventListener('keyup', () => {
                this.searchUsers();
            });
            const userMangeAddBtn = gridWrapper.querySelector('#userMangeAddBtn')
            userMangeAddBtn.addEventListener('click', () => {
                this.openAddUserModal();
            });
            const userMangeCloseBtn = gridWrapper.querySelector('#userMangeCloseBtn')
            userMangeCloseBtn.addEventListener('click', () => {
                this.closeModal();
            });
            const userMangeCloseBtn2 = gridWrapper.querySelector('#userMangeCloseBtn2')
            userMangeCloseBtn2.addEventListener('click', () => {
                this.closeModal();
            });

            const userMangeSaveBtn = gridWrapper.querySelector('#userMangeSaveBtn')
            userMangeSaveBtn.addEventListener('click', () => {
                this.saveUser();
            });
            const userMangeAlertCloseBtn = gridWrapper.querySelector('#userMangeAlertCloseBtn')
            userMangeAlertCloseBtn.addEventListener('click', () => {
                this.closeAlertModal();
            });
        },

        async initUserMangement(gridWrapper, data) {
            // 从本地存储加载用户数据，如果没有则使用示例数据
            this.state.users = data.datas;
            await this.renderUsersTable();
        },

// 保存用户数据到服务器
        async saveUsersToEvent(userIndex, userName, userPassword) {
            const modifyUserReq = {
                UserId: this.state.users[userIndex].userid,
                Name: userName,
                Password: userPassword,
            }
            try {
                const response = await apiClient.modifyUser(modifyUserReq);
                const now = new Date();
                const formattedTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                const oldName = this.state.users[userIndex].name;
                this.state.users[userIndex].name = userName;
                this.state.users[userIndex].password = userPassword;
                await this.renderUsersTable();
                await this.showAlert('success', '修改成功', `用户 "${oldName}" 已修改为 "${userName}"`, `密码已更新，操作时间: ${formattedTime}`);
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
        },

// 删除用户数据
        async delUsersToEvent(userId) {
            try {
                const response = await apiClient.delUser(Number(userId));
                const user = this.state.users.find(u => u.userid === userId);
                const now = new Date();
                const formattedTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                this.state.users = this.state.users.filter(u => u.userid !== userId);
                await this.renderUsersTable();
                await this.showAlert('warning', '删除成功', `用户 "${user.name}" 已删除`, `操作时间: ${formattedTime}`);
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
        },

// 新增用户数据
        async addUsersToEvent(userName, userPassword) {
            const addUserReq = {
                Name: userName,
                Password: userPassword,
            }
            try {
                const response = await apiClient.addUser(addUserReq);
                const now = new Date();
                const formattedTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                const newUser = {
                    userid: response.message.data.userid,
                    name: response.message.data.name,
                    password: response.message.data.password,
                };

                this.state.users.push(newUser);
                await this.renderUsersTable();
                await this.showAlert('success', '新增成功', `用户 "${newUser.name}" 已添加`, `密码: ${newUser.password}，操作时间: ${formattedTime}`);
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
        },


// 渲染用户表格
        async renderUsersTable(filteredUsers = null) {
            const usersTableBody = document.getElementById('usersTableBody');
            const noUsersMessage = document.getElementById('noUsersMessage');

            const usersToRender = filteredUsers || this.state.users;

            if (usersToRender.length === 0) {
                usersTableBody.innerHTML = '';
                noUsersMessage.style.display = 'block';
                return;
            }

            noUsersMessage.style.display = 'none';

            let tableHTML = '';
            usersToRender.forEach((user, index) => {
                const passwordMask = '*'.repeat(user.password.length);
                const firstChar = user.name.charAt(0).toUpperCase();

                tableHTML += `
            <tr>
                <td>${user.userid}</td>
                <td>
                    <div class="user-avatar" style="background: linear-gradient(135deg, #${this.getColorFromName(user.name)});">
                        ${firstChar}
                    </div>
                </td>
                <td>
                    <div class="user-name">${user.name}</div>
                </td>
                <td>
                    <span class="password-mask" id="password-${user.userid}">${passwordMask}</span>
                    <button id="password-${user.userid}-btn" data-action="toggle-password" data-user-id="${user.userid}" style="margin-left: 10px; padding: 4px 8px; font-size: 0.8rem; background: #f1f1f1; border: none; border-radius: 4px; cursor: pointer;">
                        显示密码
                    </button>
                </td>
                <td class="action-cell">
                    <button class="action-btn action-btn-edit" data-action="edit-user" data-user-id="${user.userid}">
                        编辑
                    </button>
                    <button class="action-btn action-btn-delete" data-action="delete-user" data-user-id="${user.userid}">
                        删除
                    </button>
                </td>
            </tr>
        `;
            });

            usersTableBody.innerHTML = tableHTML;
        },

// 根据用户名生成颜色
        async getColorFromName(name) {
            let hash = 0;
            for (let i = 0; i < name.length; i++) {
                hash = name.charCodeAt(i) + ((hash << 5) - hash);
            }

            // 生成6位十六进制颜色代码
            let color = '';
            for (let i = 0; i < 3; i++) {
                const value = (hash >> (i * 8)) & 0xFF;
                color += ('00' + value.toString(16)).substr(-2);
            }

            // 确保颜色不会太暗或太亮
            const r = parseInt(color.substr(0, 2), 16);
            const g = parseInt(color.substr(2, 2), 16);
            const b = parseInt(color.substr(4, 2), 16);

            // 调整颜色使其更适合作为背景
            const adjustedR = Math.min(r + 40, 255);
            const adjustedG = Math.min(g + 40, 255);
            const adjustedB = Math.min(b + 40, 255);

            return adjustedR.toString(16) + adjustedG.toString(16) + adjustedB.toString(16);
        },

// 切换密码显示/隐藏
        async togglePassword(userId) {
            const user = this.state.users.find(u => u.userid === userId);
            const passwordElement = document.getElementById(`password-${userId}`);
            const passwordBtn = document.getElementById(`password-${userId}-btn`);

            if (!user) return;

            if (passwordElement.textContent.includes('*')) {
                passwordElement.textContent = user.password;
                passwordBtn.textContent = '隐藏密码';
            } else {
                passwordElement.textContent = '*'.repeat(user.password.length);
                passwordBtn.textContent = '显示密码';
            }
        },

// 打开新增用户弹窗
        async openAddUserModal() {
            this.state.isEditing = false;
            this.statecurrentUserId = null;
            document.getElementById('modalTitle').textContent = '新增用户';
            document.getElementById('userForm').reset();
            document.getElementById('userId').value = '';
            await this.openModal('userModal');
        },

// 打开编辑用户弹窗
        async editUser(userId) {
            const user = this.state.users.find(u => u.userid === userId);
            if (!user) return;

            this.state.isEditing = true;
            this.state.currentUserId = userId;
            document.getElementById('modalTitle').textContent = '编辑用户';
            document.getElementById('userId').value = user.userid;
            document.getElementById('userName').value = user.name;
            document.getElementById('userPassword').value = user.password;
            await this.openModal('userModal');
        },

// 保存用户（新增或编辑）
        async saveUser() {
            const userName = document.getElementById('userName').value.trim();
            const userPassword = document.getElementById('userPassword').value.trim();

            if (!userName || !userPassword) {
                await this.showAlert('warning', '操作失败', '请填写完整的用户信息', '用户名和密码都不能为空');
                return;
            }

            if (this.state.isEditing) {
                // 编辑现有用户
                const userIndex = this.state.users.findIndex(u => u.userid === this.state.currentUserId);
                if (userIndex !== -1) {
                    await this.saveUsersToEvent(userIndex, userName, userPassword);
                }
            } else {
                // 新增用户
                await this.addUsersToEvent(userName, userPassword);
            }

            await this.closeModal();
        },

// 删除用户
        async deleteUser(userId) {
            const user = this.state.users.find(u => u.userid === userId);
            if (!user) return;

            if (confirm(`确定要删除用户 "${user.name}" 吗？`)) {
                await this.delUsersToEvent(user.userid);
            }
        },

// 搜索用户
        async searchUsers() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();

            if (!searchTerm) {
                await this.renderUsersTable();
                return;
            }

            const filteredUsers = this.state.users.filter(user =>
                user.name.toLowerCase().includes(searchTerm)
            );

            await this.renderUsersTable(filteredUsers);
        },

// 显示操作提示弹窗
        async showAlert(type, title, message, detail) {
            const alertIcon = document.getElementById('alertIcon');
            const alertMessage = document.getElementById('alertMessage');
            const alertUser = document.getElementById('alertUser');
            const alertDetail = document.getElementById('alertDetail');

            // 设置弹窗类型
            alertIcon.className = 'alert-icon';
            if (type === 'success') {
                alertIcon.classList.add('success');
                alertIcon.innerHTML = '<span>✓</span>';
            } else if (type === 'warning') {
                alertIcon.classList.add('warning');
                alertIcon.innerHTML = '<span>!</span>';
            } else if (type === 'info') {
                alertIcon.classList.add('info');
                alertIcon.innerHTML = '<span>i</span>';
            }

            alertMessage.textContent = title;
            alertUser.textContent = message;
            alertDetail.textContent = detail;

            await this.openModal('alertModal');
        },

// 打开弹窗
        async openModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

// 关闭弹窗
        async closeModal() {
            const modals = document.querySelectorAll('.modal-overlay');
            modals.forEach(modal => {
                modal.classList.remove('active');
            });
            document.body.style.overflow = 'auto';
        },

// 关闭提示弹窗
        async closeAlertModal() {
            await this.closeModal();
        },
    };
}

export const userMangeClass = createUserMangeClass();
