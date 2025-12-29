/**
 * 日志管理模块
 */
import { apiClient } from '../../api/client.js';
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
    // 应用状态
    const state = {
        currentView: 'table',
        currentPage: 1,
        pageSize: 25,
        sortField: 'logtime',
        sortDirection: 'desc',
        filter: {
            username: '',
            ip: '',
            level: 0,
            startDate: '',
            endDate: '',
            message: ''
        },
        filteredLogs: [],
        loading: false,
        error: null,
    };

    const logStore = {
        state,

        /**
         * 获取日志
         */
        async fetchLogs() {
            // 确保 filteredLogs 存在
            if (!state.filteredLogs) {
                state.filteredLogs = [];
            }

            state.loading = true;
            state.error = null;

            try {
                let startTimestamp = new Date(state.filter.startDate).getTime();
                let endTimestamp = new Date(state.filter.endDate).getTime();

                // 参数名与旧版一致
                const params = {
                    UserName: state.filter.username,
                    Ip: state.filter.ip,
                    Level: Number(state.filter.level),
                    StartTime: Number(startTimestamp),
                    EndTime: Number(endTimestamp),
                    Msg: state.filter.message,
                };

                const response = await apiClient.getLogs(params);
                const data = response.message;

                console.debug('API 返回数据:', data);

                if (!data || !data.datas) {
                    state.filteredLogs = [];
                    return [];
                }

                console.debug('日志数据条数:', data.datas.length);

                // 格式化日志数据
                state.filteredLogs = data.datas.map(log => ({
                    id: log.userid,
                    username: log.username,
                    ip: log.ip,
                    level: log.level,
                    time: log.logtime,
                    message: log.msg,
                }));

                // 应用排序
                this.sortLogs(state.sortField, false);

                return state.filteredLogs;
            } catch (error) {
                state.error = error.message;
                showToast(error.message || '获取日志失败', 'error');
                throw error;
            } finally {
                state.loading = false;
            }
        },

        /**
         * 设置筛选条件
         */
        setFilter(filter) {
            state.filter = { ...state.filter, ...filter };
        },

        /**
         * 重置筛选条件
         */
        resetFilter() {
            // 设置默认日期范围（当天到前一天）
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            state.filter = {
                username: '',
                ip: '',
                level: 0,
                startDate: yesterdayStr,
                endDate: today,
                message: ''
            };
            state.currentPage = 1;
        },

        /**
         * 排序日志
         */
        sortLogs(field, updateUI = true) {
            if (field === state.sortField) {
                state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                state.sortField = field;
                state.sortDirection = 'desc';
            }

            state.filteredLogs.sort((a, b) => {
                let aVal = a[field];
                let bVal = b[field];

                if (field === 'time') {
                    aVal = new Date(aVal).getTime();
                    bVal = new Date(bVal).getTime();
                }

                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }

                if (aVal < bVal) return state.sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return state.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        },

        /**
         * 获取分页日志
         */
        getPageLogs() {
            if (!state.filteredLogs) {
                state.filteredLogs = [];
            }
            const start = (state.currentPage - 1) * state.pageSize;
            return state.filteredLogs.slice(start, start + state.pageSize);
        },

        /**
         * 设置页码
         */
        setPage(page) {
            state.currentPage = page;
        },

        /**
         * 切换视图
         */
        switchView(view) {
            state.currentView = view;
        },

        /**
         * 获取状态
         */
        getState() {
            // 确保 filteredLogs 始终存在
            if (!state.filteredLogs) {
                state.filteredLogs = [];
            }
            return state;
        },

        /**
         * 清空状态
         */
        clear() {
            state.filteredLogs = [];
            state.filter = {
                username: '',
                ip: '',
                level: 0,
                startDate: '',
                endDate: '',
                message: ''
            };
            state.currentPage = 1;
        },
    };

    return logStore;
}

// 导出默认实例
export const logStore = createLogStore();
