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

                this.state.permissions = data.permissiondatas || [];
                this.state.permissionGroups = data.permissiongroupdatas || [];
                this.state.allUsers = data.allusers || [];
                this.state.allProjects = data.allprojects || [];
                this.state.allLevels = data.alllevels || [];
                this.state.assignments = data.assignment || [];

                console.debug('解析后的数据:');
                console.debug('  permissions:', this.state.permissions);
                console.debug('  permissionGroups:', this.state.permissionGroups);
                console.debug('  allUsers:', this.state.allUsers);
                console.debug('  allProjects:', this.state.allProjects);
                console.debug('  assignments:', this.state.assignments);

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
         * 分配权限组给用户
         * @param {number} userId
         * @param {number} groupId
         */
        async assignPermission(userId, groupId) {
            this.state.loading = true;

            try {
                const response = await apiClient.addPermissionAssignment(userId, groupId);
                const newAssignment = response.message.data;

                this.state.assignments.push(newAssignment);

                showToast('分配成功', 'success');

                return newAssignment;
            } catch (error) {
                showToast(error.message || '分配失败', 'error');
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
                store.set('permission.assignments', this.state.assignments);

                // eventBus.emit(Events.DATA_DELETED, { type: 'assignment', id: assignmentId });
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
            store.set('permission', {});
        },
    };
    
    return permissionStore;
}

// 导出默认实例
export const permissionStore = createPermissionStore();
