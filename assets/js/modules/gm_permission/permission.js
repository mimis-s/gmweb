// 读取数据

import {apiClient} from "../../api/client.js";
import {showToast} from "../../components/toast.js";


export function createPermissionClass() {
    return {
// 存储数据
        // 应用状态
        state: {
            permissions: [],
            permissionGroups: [],
            permissionsAllUsers: [],
            assignments: [],
            allProjects: [],
            allLevels: [],
            filteredLogs: []
        },

        async getpermissionsBody() {
            return document.getElementById('premissionContainer');
        },

        async loadPermissionEvent() {
            try {
                const response = await apiClient.getPermissions();
                this.state.permissions = response.message.permissiondatas;
                this.state.permissionGroups = response.message.permissiongroupdatas;
                this.state.permissionsAllUsers = response.message.allusers;
                this.state.allProjects = response.message.allprojects;
                this.state.allLevels = response.message.allLevels;
                this.state.assignments = response.message.assignment;

                // 初始化权限列表
                await this.updatePermissionsTable();

                // 初始化权限组选择
                await this.updatePermissionGroups();
                await this.updateGroupsTable();
                await this.updateProjectSelect();
                await this.updateLevelSelect();
                await this.updateGroupSelect();
                await this.updateGroupUserSelect();
                await this.updateAssignmentsTable();
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
        },

// 初始化页面
        async initPermissionBox(gridWrapper) {
            await this.loadPermissionEvent()

            // 事件监听
            const permissionsBody = await await this.getpermissionsBody()
            const addPermissionBtn = permissionsBody.querySelector('#addPermissionBtn');
            const addGroupBtn = permissionsBody.querySelector('#addGroupBtn');
            const assignPermissionBtn = permissionsBody.querySelector('#assignPermissionBtn');
            addPermissionBtn.addEventListener('click',() => {this.addPermission()});
            addGroupBtn.addEventListener('click', () => {this.addPermissionGroup()});
            assignPermissionBtn.addEventListener('click', () => {this.assignPermission()});
        },

// 添加权限
        async addPermission() {
            const permissionsBody = await this.getpermissionsBody()
            const permissionName = permissionsBody.querySelector('#permissionName');
            const permissionProjectSelect = permissionsBody.querySelector('#permissionProjectSelect');
            const permissionLevelSelect = permissionsBody.querySelector('#permissionLevelSelect');
            const permissionOrderNameMatch = permissionsBody.querySelector('#permissionOrderNameMatch');

            if (!permissionName.value.trim()) {
                alert('请输入权限名称');
                return;
            }

            // 创建权限
            let projectName;
            if (permissionProjectSelect.textContent.split("-").count >= 2) {
                projectName = permissionProjectSelect.textContent.split("-")[1];
            }
            const addPermissionReq = {
                name: permissionName.value.trim(),
                enable: true,
                projectid: Number(permissionProjectSelect.value),
                projectname: projectName,
                level: Number(permissionLevelSelect.value),
                ordernamematch: permissionOrderNameMatch.value.trim(),
            };
            try {
                const response = await apiClient.addPermission(addPermissionReq);
                this.state.permissions.push(response.message.data);
                await this.updatePermissionsTable();
                await this.updatePermissionGroups();
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }

            // 清空表单
            permissionName.value = '';
            permissionLevelSelect.value = '';
            permissionProjectSelect.value = '';
        },

// 更新权限表格
        async updatePermissionsTable() {
            const permissionsBody = await this.getpermissionsBody();
            const permissionsTableBody = permissionsBody.querySelector('#permissionsTableBody');
            const emptyPermissions = permissionsBody.querySelector('#emptyPermissions');

            permissionsTableBody.innerHTML = '';

            if (this.state.permissions.length === 0) {
                emptyPermissions.style.display = 'block';
                return;
            }

            emptyPermissions.style.display = 'none';

            this.state.permissions.forEach(permission => {
                const row = document.createElement('tr');
                row.innerHTML = `
            <td>${permission.id}</td>
            <td>${permission.name}</td>
            <td>${permission.projectid === 0 ? '所有项目' : `${permission.projectname}`}</td>
            <td>${permission.level === 0 ? '所有等级' : `${permission.level}`}</td>
            <td>
            <input type="checkbox" id="permissionRunCheckBox" style="width: 15px">执行
            <input type="checkbox" id="permissionReviewCheckBox" style="width: 15px">审核
            </td>
<!--            permission.orderreviews-->
            <td>${permission.ordernamematch}</td>
            <td class="${permission.enable === true ? 'status-active' : 'status-inactive'}">
                ${permission.enable === true ? '启用' : '禁用'}
            </td>
            <td>
                <button class="btn btn-small btn-primary" id="permissionStatusBtn">
                    ${permission.enable === true ? '禁用' : '启用'}
                </button>
                <button class="btn btn-small btn-warning" id="delPermissionBtn">删除</button>
            </td>
        `;

                const permissionRunCheckBox = row.querySelector('#permissionRunCheckBox')
                if (permission.orderreviews.includes(1)) {
                    permissionRunCheckBox.checked = true;
                }
                permissionRunCheckBox.addEventListener('change', () => {
                    let orderreviews = permission.orderreviews;
                    if (permissionRunCheckBox.checked) {
                        // 添加权限
                        if (!orderreviews.includes(1)) {
                            orderreviews.push(1);
                        }
                    } else {
                        // 删除权限
                        if (orderreviews.includes(1)) {
                            orderreviews = orderreviews.filter(item => item !== 1);
                        }
                    }
                    this.togglePermissionStatus(permission.id, permission.enable, orderreviews);
                });
                const permissionReviewCheckBox = row.querySelector('#permissionReviewCheckBox')
                if (permission.orderreviews.includes(2)) {
                    permissionReviewCheckBox.checked = true;
                }
                permissionReviewCheckBox.addEventListener('change', () => {
                    let orderreviews = permission.orderreviews;
                    if (permissionReviewCheckBox.checked) {
                        // 添加权限
                        if (!orderreviews.includes(2)) {
                            orderreviews.push(2);
                        }
                    } else {
                        // 删除权限
                        if (orderreviews.includes(2)) {
                            orderreviews = orderreviews.filter(item => item !== 2);
                        }
                    }
                    this.togglePermissionStatus(permission.id, permission.enable, orderreviews);
                });
                const permissionStatusBtn = row.querySelector('#permissionStatusBtn')
                permissionStatusBtn.addEventListener('click', () => {
                    this.togglePermissionStatus(permission.id, !permission.enable, permission.orderreviews);
                });
                const delPermissionBtn = row.querySelector('#delPermissionBtn')
                delPermissionBtn.addEventListener('click', () => {
                    this.deletePermission(permission.id);
                });
                permissionsTableBody.appendChild(row);
            });
        },

// 切换权限状态
        async togglePermissionStatus(id,enable, orderreviews) {
            const permission = this.state.permissions.find(p => p.id === id);
            if (permission) {
                permission.enable = enable;
                permission.orderreviews = orderreviews;
                const modifyPermissionReq = {
                    data: permission,
                }
                try {
                    const response = await apiClient.modifyPermission(modifyPermissionReq);
                    console.debug("返回:", response)
                    this.state.permissions.forEach((permission, index) => {
                        if (permission.id === response.message.data.id) {
                            this.state.permissions[index] = response.message.data;
                        }
                    });
                    await this.updatePermissionsTable();
                    await this.updatePermissionGroups();
                } catch (error) {
                    showToast(error.message || '获取 GM 命令失败', 'error');
                    throw error;
                }
            }
        },

// 删除权限
        async deletePermission(id) {
            if (confirm('确定要删除这个权限吗？')) {
                try {
                    const response = await apiClient.delPermission(Number(id));
                    this.state.permissions = this.state.permissions.filter(p => p.id !== response.message.id);
                    await this.updatePermissionsTable();
                    await this.updatePermissionGroups();
                } catch (error) {
                    showToast(error.message || '获取 GM 命令失败', 'error');
                    throw error;
                }
            }
        },

// 添加权限组
        async addPermissionGroup() {
            const permissionsBody = await this.getpermissionsBody()
            const groupName = permissionsBody.querySelector('#groupName');
            const groupDescription = permissionsBody.querySelector('#groupDescription');
            const permissionCheckboxes = permissionsBody.querySelector('#permissionCheckboxes');

            if (!groupName.value.trim()) {
                alert('请输入权限组名称');
                return;
            }

            // 获取选中的权限
            const selectedPermissionIds = [];
            const selectedCheckboxes = permissionCheckboxes.querySelectorAll('input[type="checkbox"]:checked');

            if (selectedCheckboxes.length === 0) {
                alert('请至少选择一个权限');
                return;
            }

            selectedCheckboxes.forEach(checkbox => {
                const permissionId = parseInt(checkbox.value);
                const permission = this.state.permissions.find(p => p.id === permissionId && p.enable === true);
                if (permission) {
                    selectedPermissionIds.push(permission.id);
                }
            });

            // 创建权限组
            const addPermissionGroupReq = {
                name: groupName.value.trim(),
                enable: true,
                powerids: selectedPermissionIds,
            };

            try {
                const response = await apiClient.addPermissionGroup(addPermissionGroupReq);
                this.state.permissionGroups.push(response.message.data);
                await this.updateGroupsTable();
                await this.updateGroupSelect();
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }

            // 清空表单
            groupName.value = '';
            permissionCheckboxes.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        },

// 更新权限组表格
        async updateGroupsTable() {
            const permissionsBody = await this.getpermissionsBody();
            const groupsTableBody = permissionsBody.querySelector('#groupsTableBody');
            const emptyGroups = permissionsBody.querySelector('#emptyGroups');
            groupsTableBody.innerHTML = '';

            if (this.state.permissionGroups.length === 0) {
                emptyGroups.style.display = 'block';
                return;
            }

            emptyGroups.style.display = 'none';

            this.state.permissionGroups.forEach(group => {
                const row = document.createElement('tr');
                row.innerHTML = `
            <td>${group.id}</td>
            <td>${group.name || '-'}</td>
            <td>${group.powerids.length}</td>
            <td class="${group.enable === true ? 'status-active' : 'status-inactive'}">
                ${group.enable === true ? '启用' : '禁用'}
            </td>
            <td>
                <button class="btn btn-small btn-primary" id="permissionGroupStatusBtn">
                    ${group.enable === true ? '禁用' : '启用'}
                </button>
                <button class="btn btn-small btn-secondary"">编辑</button>
                <button class="btn btn-small btn-warning" id="delPermissionGroupBtn">删除</button>
            </td>
        `;
                const permissionGroupStatusBtn = row.querySelector('#permissionGroupStatusBtn')
                permissionGroupStatusBtn.addEventListener('click', () => {
                    this.toggleGroupStatus(group.id);
                });
                const delPermissionGroupBtn = row.querySelector('#delPermissionGroupBtn')
                delPermissionGroupBtn.addEventListener('click', () => {
                    this.deleteGroup(group.id);
                });
                groupsTableBody.appendChild(row);
            });
        },

// 更新权限组选择（用于分配）
        async updateGroupSelect() {
            const permissionsBody = await this.getpermissionsBody()
            const groupSelect = permissionsBody.querySelector('#groupSelect');
            groupSelect.innerHTML = '<option value="">选择权限组</option>';

            this.state.permissionGroups
                .filter(group => group.enable === true)
                .forEach(group => {
                    const option = document.createElement('option');
                    option.value = group.id;
                    option.textContent = `${group.id} (${group.name})`;
                    groupSelect.appendChild(option);
                });
        },

// 更新权限用户选择（用于分配）
        async updateGroupUserSelect() {
            const permissionsBody = await this.getpermissionsBody()
            const playerIdSelect = permissionsBody.querySelector('#playerIdSelect');
            playerIdSelect.innerHTML = '<option value="">选择用户</option>';

            this.state.permissionsAllUsers.forEach(user => {
                const option = document.createElement('option');
                option.value = user.userid;
                option.textContent = `${user.userid} (${user.username})`;
                playerIdSelect.appendChild(option);
            });
        },

// 更新项目选择下拉框
        async updateProjectSelect() {
            const permissionsBody = await this.getpermissionsBody()
            const permissionProjectSelect = permissionsBody.querySelector('#permissionProjectSelect');
            permissionProjectSelect.innerHTML = '<option value="">所有项目</option>';

            this.state.allProjects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.projectid;
                option.textContent = `${project.projectid}-${project.name}`;
                permissionProjectSelect.appendChild(option);
            });
        },

// 更新等级选择下拉框
        async updateLevelSelect() {
            const permissionsBody = await this.getpermissionsBody()
            const permissionLevelSelect = permissionsBody.querySelector('#permissionLevelSelect');
            permissionLevelSelect.innerHTML = '<option value="">所有等级</option>';

            this.state.allLevels.forEach(level => {
                const option = document.createElement('option');
                option.value = level;
                option.textContent = `等级 (${level})`;
                permissionLevelSelect.appendChild(option);
            });
        },

// 更新权限复选框
        async updatePermissionGroups() {
            const permissionsBody = await this.getpermissionsBody()
            const permissionCheckboxes = permissionsBody.querySelector('#permissionCheckboxes');
            permissionCheckboxes.innerHTML = '';

            const activePermissions =  this.state.permissions.filter(p => p.enable === true);

            if (activePermissions.length === 0) {
                permissionCheckboxes.innerHTML = '<p style="color:#777;font-style:italic;">暂无可用权限，请先在权限模块创建权限</p>';
                return;
            }

            activePermissions.forEach(permission => {
                const checkboxItem = document.createElement('div');
                checkboxItem.className = 'checkbox-item';
                checkboxItem.innerHTML = `
            <input type="checkbox" id="perm_${permission.id}" value="${permission.id}">
            <label for="perm_${permission.id}">${permission.name}</label>
        `;
                permissionCheckboxes.appendChild(checkboxItem);
            });
        },

// 切换权限组状态
        async toggleGroupStatus(id) {
            const group =  this.state.permissionGroups.find(g => g.id === id);
            if (group) {
                group.enable = !group.enable;
                const modifyPermissionGroupReq = {
                    data: group,
                }
                try {
                    const response = await apiClient.modifyPermissionGroup(modifyPermissionGroupReq);
                    this.state.permissionGroups.forEach((permissionGroup, index) => {
                        if (permissionGroup.id === response.message.data.id) {
                            this.state.permissionGroups[index] = response.message.data;
                        }
                    });
                    await this.updateGroupsTable();
                    await this.updateGroupSelect();
                } catch (error) {
                    showToast(error.message || '获取 GM 命令失败', 'error');
                    throw error;
                }
            }
        },

// 删除权限组
        async deleteGroup(id) {
            if (confirm('确定要删除这个权限组吗？')) {
                try {
                    const response = await apiClient.delPermissionGroup(id);
                    this.state.permissionGroups = this.state.permissionGroups.filter(g => g.id !== id);
                    await this.updateGroupsTable();
                    await this.updateGroupSelect();
                } catch (error) {
                    showToast(error.message || '获取 GM 命令失败', 'error');
                    throw error;
                }
            }
        },

// 分配权限
        async assignPermission() {
            const permissionsBody = await this.getpermissionsBody()
            const playerId = permissionsBody.querySelector('#playerIdSelect');
            const groupId = permissionsBody.querySelector('#groupSelect');

            if (!playerId.value) {
                alert('请选择一个有效用户');
                return;
            }

            if (!groupId.value) {
                alert('请选择权限组');
                return;
            }

            // 查找用户
            const user = this.state.permissionsAllUsers.find(g => g.userid === Number(playerId.value));
            if (!user) {
                alert('选择的用户不存在');
                return;
            }

            // 查找权限组
            const group = this.state.permissionGroups.find(g => g.id === Number(groupId.value) && g.enable === true);
            if (!group) {
                alert('选择的权限组不存在或已禁用');
                return;
            }

            // 检查UI上是否已经分配过
            const existingAssignment = this.state.assignments.find(a => a.userid === Number(playerId.value) && a.groupid === Number(groupId.value));
            if (existingAssignment) {
                alert('该玩家已经分配了这个权限组');
                return;
            }

            // 分配权限
            try {
                const response = await apiClient.addPermissionAssignment(Number(playerId.value),Number(groupId.value));
                this.state.assignments.push(response.message.data);
                await this.updateAssignmentsTable();
                window.showToast(`权限组 "${group.name}" 已成功分配给玩家 ${playerId.value.trim()}`);
            } catch (error) {
                window.showToast(error.message, "error");
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }

            // 清空表单
            playerId.value = '';
            group.value = '';
        },

// 更新分配表格
        async updateAssignmentsTable() {
            const permissionsBody = await this.getpermissionsBody()
            const assignmentsTableBody = permissionsBody.querySelector('#assignmentsTableBody');
            const emptyAssignments = permissionsBody.querySelector('#emptyAssignments');

            assignmentsTableBody.innerHTML = '';

            if (this.state.assignments.length === 0) {
                emptyAssignments.style.display = 'block';
                return;
            }

            emptyAssignments.style.display = 'none';
            this.state.assignments.forEach(assignment => {
                const row = document.createElement('tr');
                row.innerHTML = `
            <td>${assignment.userid}</td>
            <td>${assignment.username}</td>
            <td>${assignment.groupid}</td>
            <td>${assignment.groupname}</td>
            <td>
                <button class="btn btn-small btn-warning" id="deleteAssignmentBtn">删除</button>
            </td>
        `;
                const deleteAssignmentBtn = row.querySelector('#deleteAssignmentBtn')
                deleteAssignmentBtn.addEventListener('click', () => {
                    this.deleteAssignment(assignment.id);
                });
                assignmentsTableBody.appendChild(row);
            });
        },

// 删除分配记录
        async deleteAssignment(assignmentId) {
            if (confirm('确定要删除这个分配记录吗？')) {
                try {
                    const response = await apiClient.delPermissionAssignment(assignmentId);
                    this.state.assignments = this.state.assignments.filter(p => p.id !== assignmentId);
                    await this.updateAssignmentsTable();
                } catch (error) {
                    window.showToast(error.message, "error");
                    showToast(error.message || '获取 GM 命令失败', 'error');
                    throw error;
                }
            }
        },
    };
}

export const permissionClass = createPermissionClass();
