/**
 * 权限管理模块
 */
import { apiClient } from '../../api/client.js';
import { showToast, confirm } from '../../components/toast.js';

/**
 * 权限 Store
 */
export function createPermissionStore() {
    const permissionStore = {
        state: {
            permissions: [],
            permissionGroups: [],
            allUsers: [],
            allProjects: [],
            allLevels: [],
            assignments: [],
            loading: false,
            error: null,
        },
        
        /**
         * 获取权限数据
         */
        async fetchPermissions() {
            console.debug('fetchPermissions 开始执行');
            this.state.loading = true;
            this.state.error = null;

            try {
                const response = await apiClient.getPermissions();
                console.debug('getPermissions 返回:', response);
                const data = response.message;
                console.debug('权限数据:', data);

                // 规范化 enable 值为布尔值
                this.state.permissions = (data.permissiondatas || []).map(p => ({
                    ...p,
                    enable: p.enable === 1 || p.enable === true || p.enable === 'true',
                }));
                this.state.permissionGroups = (data.permissiongroupdatas || []).map(g => ({
                    ...g,
                    enable: g.enable === 1 || g.enable === true || g.enable === 'true',
                }));
                this.state.allUsers = data.allusers || [];
                this.state.allProjects = data.allprojects || [];
                this.state.allLevels = data.alllevels || [];
                this.state.assignments = data.assignment || [];

                return this.state;
            } catch (error) {
                this.state.error = error.message;
                showToast(error.message || '获取权限数据失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },

        /**
         * 添加权限
         * @param {Object} permissionData
         */
        async addPermission(permissionData) {
            this.state.loading = true;

            try {
                const response = await apiClient.addPermission(permissionData);
                const newPermission = response.message.data;

                // 规范化 enable 值为布尔值
                newPermission.enable = newPermission.enable === 1 || newPermission.enable === true || newPermission.enable === 'true';

                this.state.permissions.push(newPermission);

                showToast('添加成功', 'success');

                return newPermission;
            } catch (error) {
                showToast(error.message || '添加失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },

        /**
         * 修改权限
         * @param {Object} permissionData
         */
        async modifyPermission(permissionData) {
            this.state.loading = true;

            try {
                const response = await apiClient.modifyPermission({ data: permissionData });
                const updatedPermission = response.message.data;

                const index = this.state.permissions.findIndex(p => p.id === updatedPermission.id);
                if (index !== -1) {
                    this.state.permissions[index] = updatedPermission;
                }

                showToast('修改成功', 'success');

                return updatedPermission;
            } catch (error) {
                showToast(error.message || '修改失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },

        /**
         * 切换权限启用状态
         * @param {number} id
         * @param {boolean} enable
         */
        async togglePermission(id, enable) {
            const permission = this.state.permissions.find(p => p.id === id);
            if (!permission) {
                showToast('权限不存在', 'error');
                throw new Error('权限不存在');
            }

            // 切换本地状态
            permission.enable = !permission.enable;

            this.state.loading = true;

            try {
                // 传递整个 permission 对象
                const response = await apiClient.modifyPermission({
                    data: permission,
                });
                const updatedPermission = response.message.data;

                // 规范化 enable 值为布尔值
                updatedPermission.enable = updatedPermission.enable === 1 || updatedPermission.enable === true;

                const index = this.state.permissions.findIndex(p => p.id === updatedPermission.id);
                if (index !== -1) {
                    this.state.permissions[index] = updatedPermission;
                }

                showToast('成功修改权限', 'success');

                return updatedPermission;
            } catch (error) {
                // 恢复本地状态
                permission.enable = !permission.enable;
                showToast(error.message || '操作失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },

        /**
         * 删除权限
         * @param {number} id
         */
        async deletePermission(id) {
            const confirmed = await confirm({
                title: '确认删除',
                message: '确定要删除此权限吗？',
                type: 'danger',
            });

            if (!confirmed) return;

            this.state.loading = true;

            try {
                await apiClient.delPermission(id);

                this.state.permissions = this.state.permissions.filter(p => p.id !== id);

                showToast('删除成功', 'success');
            } catch (error) {
                showToast(error.message || '删除失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },

        /**
         * 添加权限组
         * @param {Object} groupData
         */
        async addPermissionGroup(groupData) {
            this.state.loading = true;

            try {
                const response = await apiClient.addPermissionGroup(groupData);
                const newGroup = response.message.data;

                // 规范化 enable 值为布尔值
                newGroup.enable = newGroup.enable === 1 || newGroup.enable === true || newGroup.enable === 'true';

                this.state.permissionGroups.push(newGroup);

                showToast('添加成功', 'success');

                return newGroup;
            } catch (error) {
                showToast(error.message || '添加失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },

        /**
         * 删除权限组
         * @param {number} id
         */
        async deletePermissionGroup(id) {
            const confirmed = await confirm({
                title: '确认删除',
                message: '确定要删除此权限组吗？',
                type: 'danger',
            });

            if (!confirmed) return;

            this.state.loading = true;

            try {
                await apiClient.delPermissionGroup(id);

                this.state.permissionGroups = this.state.permissionGroups.filter(g => g.id !== id);

                showToast('删除成功', 'success');
            } catch (error) {
                showToast(error.message || '删除失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },

        /**
         * 切换权限组启用状态
         * @param {number} id
         * @param {boolean} enable
         */
        async togglePermissionGroup(id, enable) {
            const group = this.state.permissionGroups.find(g => g.id === id);
            if (!group) {
                showToast('权限组不存在', 'error');
                throw new Error('权限组不存在');
            }

            // 切换本地状态
            group.enable = !group.enable;

            this.state.loading = true;

            try {
                // 传递整个 group 对象
                const response = await apiClient.modifyPermissionGroup({
                    data: group,
                });
                const updatedGroup = response.message.data;

                // 规范化 enable 值为布尔值
                updatedGroup.enable = updatedGroup.enable === 1 || updatedGroup.enable === true;

                const index = this.state.permissionGroups.findIndex(g => g.id === updatedGroup.id);
                if (index !== -1) {
                    this.state.permissionGroups[index] = updatedGroup;
                }

                showToast('成功修改权限组', 'success');

                return updatedGroup;
            } catch (error) {
                // 恢复本地状态
                group.enable = !group.enable;
                showToast(error.message || '操作失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },

        /**
         * 分配权限组给用户
         * @param {number} userId
         * @param {number} groupId
         */
        async assignPermission(userId, groupId) {
            // 检查权限组是否存在且已启用
            const group = this.state.permissionGroups.find(g => g.id === groupId);
            if (!group) {
                showToast('选择的权限组不存在', 'error');
                throw new Error('权限组不存在');
            }
            if (group.enable !== true) {
                showToast('选择的权限组已禁用', 'error');
                throw new Error('权限组已禁用');
            }

            // 检查是否已经分配过
            const existingAssignment = this.state.assignments.find(
                a => a.userid === userId && a.groupid === groupId
            );
            if (existingAssignment) {
                showToast('该玩家已经分配了这个权限组', 'warning');
                throw new Error('已分配');
            }

            this.state.loading = true;

            try {
                const response = await apiClient.addPermissionAssignment(userId, groupId);
                const newAssignment = response.message.data;

                this.state.assignments.push(newAssignment);

                showToast('分配成功', 'success');

                return newAssignment;
            } catch (error) {
                if (error.message !== '已分配' && error.message !== '权限组不存在' && error.message !== '权限组已禁用') {
                    showToast(error.message || '分配失败', 'error');
                }
                throw error;
            } finally {
                this.state.loading = false;
            }
        },

        /**
         * 取消权限分配
         * @param {number} assignmentId
         */
        async removeAssignment(assignmentId) {
            const confirmed = await confirm({
                title: '确认取消',
                message: '确定要取消此权限分配吗？',
                type: 'warning',
            });

            if (!confirmed) return;

            this.state.loading = true;

            try {
                await apiClient.delPermissionAssignment(assignmentId);

                this.state.assignments = this.state.assignments.filter(a => a.id !== assignmentId);

                showToast('已取消分配', 'success');
            } catch (error) {
                showToast(error.message || '取消失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },

        /**
         * 获取状态
         */
        getState() {
            return this.state;
        },

        /**
         * 清空状态
         */
        clear() {
            this.state = {
                permissions: [],
                permissionGroups: [],
                allUsers: [],
                allProjects: [],
                allLevels: [],
                assignments: [],
                loading: false,
                error: null,
            };
        },
    };
    
    return permissionStore;
}

// 导出默认实例
export const permissionStore = createPermissionStore();
