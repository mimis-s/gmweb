/**
 * GM 命令模块
 */
import { apiClient } from '../../api/client.js';
import { store } from '../../core/store.js';
import { eventBus, Events } from '../../core/eventBus.js';
import { showToast, modal } from '../../components/toast.js';

/**
 * GM 命令 Store
 */
export function createGmOrderStore() {
    const gmOrderStore = {
        state: {
            orders: [],
            currentProjectId: null,
            loading: false,
            error: null,
        },
        
        /**
         * 获取 GM 命令列表
         * @param {number} projectId 
         */
        async fetchOrders(projectId) {
            this.state.loading = true;
            this.state.error = null;
            
            try {
                const response = await apiClient.getGmOrders(projectId);
                this.state.orders = response.message.datas || [];
                this.state.currentProjectId = projectId;
                
                store.set('gmOrder.orders', this.state.orders);
                store.set('gmOrder.currentProjectId', projectId);
                
                eventBus.emit(Events.DATA_LOADED, { type: 'gmOrder', data: this.state.orders });
                
                return this.state.orders;
            } catch (error) {
                this.state.error = error.message;
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },
        
        /**
         * 添加 GM 命令
         * @param {Object} orderData 
         */
        async addOrder(orderData) {
            this.state.loading = true;
            
            try {
                const response = await apiClient.addGmOrder(orderData);
                const newOrder = response.message.data;
                
                this.state.orders.push(newOrder);
                store.set('gmOrder.orders', this.state.orders);
                
                eventBus.emit(Events.DATA_UPDATED, { type: 'gmOrder', action: 'add', data: newOrder });
                showToast('添加成功', 'success');
                
                return newOrder;
            } catch (error) {
                showToast(error.message || '添加失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },
        
        /**
         * 修改 GM 命令
         * @param {Object} orderData 
         */
        async modifyOrder(orderData) {
            this.state.loading = true;
            
            try {
                const response = await apiClient.modifyGmOrder(orderData);
                const updatedOrder = response.message.data;
                
                const index = this.state.orders.findIndex(o => o.orderid === updatedOrder.orderid);
                if (index !== -1) {
                    this.state.orders[index] = updatedOrder;
                }
                
                store.set('gmOrder.orders', this.state.orders);
                
                eventBus.emit(Events.DATA_UPDATED, { type: 'gmOrder', action: 'modify', data: updatedOrder });
                showToast('修改成功', 'success');
                
                return updatedOrder;
            } catch (error) {
                showToast(error.message || '修改失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },
        
        /**
         * 删除 GM 命令
         * @param {number} projectId 
         * @param {number} orderId 
         */
        async deleteOrder(projectId, orderId) {
            this.state.loading = true;
            
            try {
                await apiClient.delGmOrder(projectId, orderId);
                
                this.state.orders = this.state.orders.filter(o => o.orderid !== orderId);
                store.set('gmOrder.orders', this.state.orders);
                
                eventBus.emit(Events.DATA_DELETED, { type: 'gmOrder', id: orderId });
                showToast('删除成功', 'success');
            } catch (error) {
                showToast(error.message || '删除失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },
        
        /**
         * 发送 GM 命令
         * @param {number} orderId 
         * @param {Object} args 
         */
        async sendOrder(orderId, args) {
            this.state.loading = true;
            
            try {
                const response = await apiClient.sendGmOrder(orderId, JSON.stringify(args));
                
                eventBus.emit(Events.DATA_UPDATED, { type: 'gmOrder', action: 'send', orderId, response });
                showToast('命令已发送', 'success');
                
                return response;
            } catch (error) {
                showToast(error.message || '发送失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },
        
        /**
         * 获取命令列表
         * @returns {Array}
         */
        getOrders() {
            return this.state.orders;
        },
        
        /**
         * 清空状态
         */
        clear() {
            this.state.orders = [];
            this.state.currentProjectId = null;
            store.set('gmOrder.orders', []);
            store.set('gmOrder.currentProjectId', null);
        },
    };
    
    return gmOrderStore;
}

// 导出默认实例
export const gmOrderStore = createGmOrderStore();
