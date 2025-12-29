/**
 * 用户管理模块
 */
import { apiClient } from '../../api/client.js';
import { store } from '../../core/store.js';
import { eventBus, Events } from '../../core/eventBus.js';
import { showToast, confirm } from '../../components/toast.js';

/**
 * 用户 Store
 */
export function createUserStore() {
    const userStore = {
        state: {
            users: [],
            currentUser: null,
            loading: false,
            error: null,
        },
        
        /**
         * 获取所有用户
         */
        async fetchUsers() {
            this.state.loading = true;
            this.state.error = null;
            
            try {
                const response = await apiClient.getUsers();
                this.state.users = response.message.datas || [];
                
                store.set('user.users', this.state.users);
                
                // 触发数据加载完成事件，通知监听器渲染UI
                eventBus.emit(Events.GetUsersRsp, {
                    type: 'user', 
                    data: this.state.users,
                    source: 'userStore.fetchUsers' 
                });
                
                return this.state.users;
            } catch (error) {
                this.state.error = error.message;
                showToast(error.message || '获取用户列表失败', 'error');
                
                // 触发错误事件
                eventBus.emit(Events.DATA_ERROR, { 
                    type: 'user', 
                    error: error.message 
                });
                
                throw error;
            } finally {
                this.state.loading = false;
            }
        },
        
        /**
         * 添加用户
         * @param {Object} userData 
         */
        async addUser(userData) {
            this.state.loading = true;
            
            try {
                const response = await apiClient.addUser(userData);
                const newUser = response.message.data;
                
                this.state.users.push(newUser);
                store.set('user.users', this.state.users);
                
                eventBus.emit(Events.DATA_UPDATED, { type: 'user', action: 'add', data: newUser });
                showToast('添加成功', 'success');
                
                return newUser;
            } catch (error) {
                showToast(error.message || '添加失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },
        
        /**
         * 修改用户
         * @param {Object} userData 
         */
        async modifyUser(userData) {
            this.state.loading = true;
            
            try {
                const response = await apiClient.modifyUser(userData);
                const updatedUser = response.message.data;
                
                const index = this.state.users.findIndex(u => u.userid === updatedUser.userid);
                if (index !== -1) {
                    this.state.users[index] = updatedUser;
                }
                
                store.set('user.users', this.state.users);
                
                eventBus.emit(Events.DATA_UPDATED, { type: 'user', action: 'modify', data: updatedUser });
                showToast('修改成功', 'success');
                
                return updatedUser;
            } catch (error) {
                showToast(error.message || '修改失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },
        
        /**
         * 删除用户
         * @param {number} userId 
         */
        async deleteUser(userId) {
            const confirmed = await confirm({
                title: '确认删除',
                message: '确定要删除此用户吗？此操作不可撤销。',
                confirmText: '删除',
                type: 'danger',
            });

            if (!confirmed) {
                console.debug('用户取消删除');
                return;
            }
            console.debug('用户确认删除');
            
            this.state.loading = true;
            
            try {
                await apiClient.delUser(userId);
                
                const user = this.state.users.find(u => u.userid === userId);
                this.state.users = this.state.users.filter(u => u.userid !== userId);
                store.set('user.users', this.state.users);
                
                eventBus.emit(Events.DATA_DELETED, { type: 'user', id: userId, data: user });
                showToast('删除成功', 'success');
            } catch (error) {
                showToast(error.message || '删除失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },
        
        /**
         * 获取用户列表
         */
        getUsers() {
            return this.state.users;
        },
        
        /**
         * 根据 ID 查找用户
         * @param {number} userId 
         */
        findUser(userId) {
            return this.state.users.find(u => u.userid === userId);
        },
        
        /**
         * 搜索用户
         * @param {string} keyword 
         */
        searchUsers(keyword) {
            const lowerKeyword = keyword.toLowerCase();
            return this.state.users.filter(u => 
                u.name.toLowerCase().includes(lowerKeyword)
            );
        },
        
        /**
         * 清空状态
         */
        clear() {
            this.state.users = [];
            this.state.currentUser = null;
            store.set('user.users', []);
            store.set('user.currentUser', null);
        },
    };
    
    return userStore;
}

// 导出默认实例
export const userStore = createUserStore();
