/**
 * 日志管理模块
 */
import { apiClient } from '../../api/client.js';
import { store } from '../../core/store.js';
// import { eventBus, Events } from '../../core/eventBus.js';
import { showToast } from '../../components/toast.js';

/**
 * 日志等级映射
 */
export const LogLevel = {
    UNDEFINE: { value: 0, label: 'UNDEFINE' },
    DEBUG: { value: 1, label: 'DEBUG' },
    ERROR: { value: 2, label: 'ERROR' },
    INFO: { value: 3, label: 'INFO' },
    WARNING: { value: 4, label: 'WARNING' },
};

export const LogLevelMap = {
    0: 'UNDEFINE',
    1: 'DEBUG',
    2: 'ERROR',
    3: 'INFO',
    4: 'WARNING',
};

/**
 * 日志 Store
 */
export function createLogStore() {
    const logStore = {
        state: {
            logs: [],
            filter: {
                username: '',
                ip: '',
                level: 0,
                startTime: null,
                endTime: null,
                message: '',
            },
            pagination: {
                currentPage: 1,
                pageSize: 25,
                total: 0,
            },
            sort: {
                field: 'logtime',
                direction: 'desc',
            },
            loading: false,
            error: null,
        },
        
        /**
         * 获取日志
         * @param {Object} options 选项
         */
        async fetchLogs(options = {}) {
            const { page = 1, pageSize = 25 } = options;
            
            this.state.loading = true;
            this.state.error = null;
            
            const { filter, sort } = this.state;
            
            const params = {
                username: filter.username,
                ip: filter.ip,
                level: Number(filter.level),
                starttime: filter.startTime ? new Date(filter.startTime).getTime() : 0,
                endtime: filter.endTime ? new Date(filter.endTime).getTime() : 0,
                msg: filter.message,
            };
            
            try {
                const response = await apiClient.getLogs(params);
                const data = response.message;
                
                if (!data || !data.datas) {
                    this.state.logs = [];
                    this.state.pagination.total = 0;
                    return [];
                }
                
                // 格式化日志数据
                this.state.logs = data.datas.map(log => ({
                    id: log.userid,
                    userId: log.userid,
                    userName: log.username,
                    ip: log.ip,
                    level: log.level,
                    levelLabel: LogLevelMap[log.level] || 'UNDEFINE',
                    time: new Date(log.logtime),
                    logTime: log.logtime,
                    message: log.msg,
                }));
                
                // 排序
                this.sortLogs(sort.field, sort.direction, false);
                
                this.state.pagination.total = this.state.logs.length;
                store.set('log.logs', this.state.logs);
                store.set('log.filter', this.state.filter);
                
                // eventBus.emit(Events.DATA_LOADED, { type: 'log', data: this.state.logs });
                
                return this.state.logs;
            } catch (error) {
                this.state.error = error.message;
                showToast(error.message || '获取日志失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },
        
        /**
         * 设置筛选条件
         * @param {Object} filter 
         */
        setFilter(filter) {
            this.state.filter = { ...this.state.filter, ...filter };
            store.set('log.filter', this.state.filter);
        },
        
        /**
         * 重置筛选条件
         */
        resetFilter() {
            this.state.filter = {
                username: '',
                ip: '',
                level: 0,
                startTime: null,
                endTime: null,
                message: '',
            };
            store.set('log.filter', this.state.filter);
        },
        
        /**
         * 排序
         * @param {string} field 排序字段
         * @param {string} direction 排序方向
         * @param {boolean} updateUI 是否更新 UI
         */
        sortLogs(field, direction = 'desc', updateUI = true) {
            this.state.sort = { field, direction };
            
            this.state.logs.sort((a, b) => {
                let aVal = a[field];
                let bVal = b[field];
                
                // 时间字段特殊处理
                if (field === 'time') {
                    aVal = aVal.getTime();
                    bVal = bVal.getTime();
                }
                
                if (aVal < bVal) return direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return direction === 'asc' ? 1 : -1;
                return 0;
            });
            
            store.set('log.logs', this.state.logs);
            store.set('log.sort', this.state.sort);
        },
        
        /**
         * 获取分页日志
         */
        getPageLogs() {
            const { currentPage, pageSize } = this.state.pagination;
            const start = (currentPage - 1) * pageSize;
            return this.state.logs.slice(start, start + pageSize);
        },
        
        /**
         * 设置页码
         * @param {number} page 
         */
        setPage(page) {
            this.state.pagination.currentPage = page;
            store.set('log.pagination', this.state.pagination);
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
            this.state.logs = [];
            this.state.filter = {
                username: '',
                ip: '',
                level: 0,
                startTime: null,
                endTime: null,
                message: '',
            };
            this.state.pagination.currentPage = 1;
            store.set('log', {});
        },
    };
    
    return logStore;
}

// 导出默认实例
export const logStore = createLogStore();
