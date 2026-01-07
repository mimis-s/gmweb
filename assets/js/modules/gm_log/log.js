// 读取数据

import {apiClient} from "../../api/client.js";
import {showToast} from "../../components/toast.js";
export function createGmLogClass() {
    return {
        levelMap: {
            0: 'UNDEFINE',
            1: 'DEBUG',
            3: 'INFO',
            4: 'WARNING',
            2: 'ERROR',
        },

        // 应用状态
        state: {
            currentView: 'table',
            currentPage: 1,
            pageSize: 25,
            sortField: 'time',
            sortDirection: 'desc',
            filter: {
                username: '',
                ip: '',
                level: 0,
                startDate: '',
                endDate: '',
                message: ''
            },
            filteredLogs: []
        },

        // 初始化函数
        async initLogBox() {
            // 设置日期范围默认值
            const today = new Date().toISOString().split('T')[0];
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 1);
            const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

            const projectLogContainer = document.getElementById('projectLogContainer');

            projectLogContainer.querySelector('#startDate').value = oneWeekAgoStr;
            projectLogContainer.querySelector('#endDate').value = today;

            this.state.filter.startDate = oneWeekAgoStr;
            this.state.filter.endDate = today;

            // 绑定事件
            projectLogContainer.querySelector('#queryForm').addEventListener('submit',(e) => {this.handleQuery(e)});
            projectLogContainer.querySelector('#resetBtn').addEventListener('click',() => {this.resetQuery()});
            projectLogContainer.querySelector('#tableViewBtn').addEventListener('click', () => {this.switchView('table')});
            projectLogContainer.querySelector('#prevPage').addEventListener('click',() => {this.prevPage()});
            projectLogContainer.querySelector('#nextPage').addEventListener('click',() => {this.nextPage()});

            // 绑定排序事件
            projectLogContainer.querySelectorAll('.sortable').forEach(th => {
                th.addEventListener('click', () => {
                    const field = th.getAttribute('data-sort');
                    this.sortLogs(field);
                });
            });

            // 初始渲染
            await this.filterAndSortLogs();
        },

        // 处理查询
        async handleQuery(e) {
            e.preventDefault();
            const projectLogContainer = document.getElementById('projectLogContainer');

            // 获取查询条件
            this.state.filter.username = projectLogContainer.querySelector('#username').value.trim();
            this.state.filter.ip = projectLogContainer.querySelector('#ip').value.trim();
            this.state.filter.level = projectLogContainer.querySelector('#level').value;
            this.state.filter.startDate = projectLogContainer.querySelector('#startDate').value;
            this.state.filter.endDate = projectLogContainer.querySelector('#endDate').value;
            this.state.filter.message = projectLogContainer.querySelector('#message').value.trim();

            // 重置到第一页
            this.state.currentPage = 1;

            // 过滤和渲染
            await this.filterAndSortLogs();
        },

        // 重置查询
        async resetQuery() {
            const projectLogContainer = document.getElementById('projectLogContainer');

            // 清空查询条件
            projectLogContainer.querySelector('#username').value = '';
            projectLogContainer.querySelector('#ip').value = '';
            projectLogContainer.querySelector('#level').value = 0;
            projectLogContainer.querySelector('#message').value = '';

            // 设置默认日期范围
            const today = new Date().toISOString().split('T')[0];
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

            projectLogContainer.querySelector('#startDate').value = oneWeekAgoStr;
            projectLogContainer.querySelector('#endDate').value = today;

            // 更新状态
            this.state.filter.username = '';
            this.state.filter.ip = '';
            this.state.filter.level = 0;
            this.state.filter.startDate = oneWeekAgoStr;
            this.state.filter.endDate = today;
            this.state.filter.message = '';
            this.state.currentPage = 1;

            // 重新过滤和渲染
           await this.filterAndSortLogs();
        },

        // 过滤和排序日志
        async filterAndSortLogs() {
            let startTimestamp = new Date(this.state.filter.startDate).getTime()
            let endTimestamp = new Date(this.state.filter.endDate).getTime()
            const getGmLogReq = {
                UserName: this.state.filter.username,   // 用户名过滤(为空就是所有用户)
                Ip: this.state.filter.ip,          // IP地址过滤(模糊匹配)
                Level: Number(this.state.filter.level),       // 日志等级过滤(为0是所有等级)
                StartTime: Number(startTimestamp),    // 日期范围过滤
                EndTime: Number(endTimestamp),      // 日期范围过滤
                Msg: this.state.filter.message,    // 消息内容过滤(模糊匹配)
            }

            try {
                const response = await apiClient.getLogs(getGmLogReq);
                if (response.message == null || response.message.datas == null) {
                    return;
                }
                const logs = [];
                for (let i = 0; i < response.message.datas.length; i++) {
                    const log = response.message.datas[i];
                    const logDate = new Date(log.logtime);
                    logs.push({
                        id: log.userid,
                        username: log.username,
                        ip: log.ip,
                        level: log.level,
                        time: logDate.toISOString(),
                        message: log.msg,
                    })
                }
                this.state.filteredLogs = logs;
                // 应用排序
                await this.sortLogs(this.state.sortField, false);
                await this.renderLogs();
                await this.updatePagination();
                return this.state.orders;
            } catch (error) {
                this.state.error = error.message;
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
        },

        // 排序日志
        async sortLogs(field, updateUI = true) {
            // 如果点击的是当前排序字段，则切换排序方向
            if (field === this.state.sortField) {
                this.state.sortDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.state.sortField = field;
                this.state.sortDirection = 'desc'; // 默认降序
            }

            // 执行排序
            this.state.filteredLogs.sort((a, b) => {
                let aVal = a[field];
                let bVal = b[field];

                // 特殊处理时间字段
                if (field === 'time') {
                    aVal = new Date(aVal).getTime();
                    bVal = new Date(bVal).getTime();
                }

                // 处理字符串比较
                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }

                if (aVal < bVal) {
                    return this.state.sortDirection === 'asc' ? -1 : 1;
                }
                if (aVal > bVal) {
                    return this.state.sortDirection === 'asc' ? 1 : -1;
                }
                return 0;
            });

            // 更新UI
            if (updateUI) {
              await this.renderLogs();
              await this.updateSortIndicators();
            }
        },

        // 更新排序指示器
        async updateSortIndicators() {
            // 清除所有排序指示器
            const projectLogContainer = document.getElementById('projectLogContainer');

            projectLogContainer.querySelectorAll('.sortable i').forEach(icon => {
                icon.className = 'fas fa-sort';
            });

            // 为当前排序字段添加指示器
            const currentTh = projectLogContainer.querySelector(`th[data-sort="${this.state.sortField}"] i`);
            if (currentTh) {
                currentTh.className = this.state.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
            }
        },

        // 切换视图
        async switchView(view) {
            this.state.currentView = view;
            const projectLogContainer = document.getElementById('projectLogContainer');

            // 更新按钮状态
            projectLogContainer.querySelector('#tableViewBtn').classList.toggle('active', view === 'table');

            // 显示/隐藏视图
            projectLogContainer.querySelector('#tableView').classList.toggle('hidden', view !== 'table');

            // 重新渲染
            await this.renderLogs();
        },

        // 渲染日志
        async renderLogs() {
            // 计算分页
            const startIndex = (this.state.currentPage - 1) * this.state.pageSize;
            const endIndex = startIndex + this.state.pageSize;
            const pageLogs = this.state.filteredLogs.slice(startIndex, endIndex);
            const projectLogContainer = document.getElementById('projectLogContainer');

            // 更新统计信息
            projectLogContainer.querySelector('#filteredLogs').textContent = this.state.filteredLogs.length;

            // 清空现有内容
            projectLogContainer.querySelector('#logTableBody').innerHTML = '';
            projectLogContainer.querySelector('#cardView').innerHTML = '';

            // 如果没有日志，显示空状态
            if (pageLogs.length === 0) {
                projectLogContainer.querySelector('#noLogsTable').style.display = 'block';
                return;
            }

            // 隐藏空状态
            projectLogContainer.querySelector('#noLogsTable').style.display = 'none';

            if (this.state.currentView === 'table') {
                // 渲染表格视图
                pageLogs.forEach(log => {
                    const row = document.createElement('tr');
                    // 根据日志等级添加类名
                    if (this.levelMap[log.level] === 'ERROR') row.classList.add('error-row');
                    if (this.levelMap[log.level] === 'WARNING') row.classList.add('warning-row');

                    const timeStr = new Date(log.time).toLocaleString('zh-CN');
                    const levelClassName = this.levelMap[log.level].toLowerCase();
                    console.debug("日志:", levelClassName)
                    row.innerHTML = `
                                        <td><strong>${log.username}</strong></td>
                                        <td>${log.ip}</td>
                                        <td><span class="log-level level-${levelClassName}">${this.levelMap[log.level]}</span></td>
                                        <td>${timeStr}</td>
                                        <td>${log.message}</td>
                                    `;

                    projectLogContainer.querySelector('#logTableBody').appendChild(row);
                });
            }
        },

        // 更新分页
        async updatePagination() {
            const totalPages = Math.ceil(this.state.filteredLogs.length / this.state.pageSize);
            const projectLogContainer = document.getElementById('projectLogContainer');

            // 更新页面信息
            projectLogContainer.querySelector('#currentPage').textContent = this.state.currentPage;
            projectLogContainer.querySelector('#totalPages').textContent = totalPages;

            // 更新按钮状态
            projectLogContainer.querySelector('#prevPage').disabled = this.state.currentPage === 1;
            projectLogContainer.querySelector('#nextPage').disabled = this.state.currentPage === totalPages;

            // 生成页码按钮
            const pageNumbersContainer = projectLogContainer.querySelector('#pageNumbers');
            pageNumbersContainer.innerHTML = '';

            // 计算显示的页码范围
            let startPage = Math.max(1, this.state.currentPage - 2);
            let endPage = Math.min(totalPages, this.state.currentPage + 2);

            // 确保显示5个页码
            if (endPage - startPage < 4) {
                if (startPage === 1) {
                    endPage = Math.min(totalPages, startPage + 4);
                } else if (endPage === totalPages) {
                    startPage = Math.max(1, endPage - 4);
                }
            }

            // 添加页码按钮
            for (let i = startPage; i <= endPage; i++) {
                const pageBtn = document.createElement('button');
                pageBtn.className = `page-number ${i === this.state.currentPage ? 'active' : ''}`;
                pageBtn.textContent = i;
                pageBtn.addEventListener('click', () => {
                    this.state.currentPage = i;
                    this.renderLogs();
                    this.updatePagination();
                });
                pageNumbersContainer.appendChild(pageBtn);
            }
        },

        // 上一页
        async prevPage() {
            if (this.state.currentPage > 1) {
                this.state.currentPage--;
               await this.renderLogs();
               await this.updatePagination();
            }
        },

        // 下一页
        async nextPage() {
            const totalPages = Math.ceil(this.state.filteredLogs.length / this.state.pageSize);
            if (this.state.currentPage < totalPages) {
                this.state.currentPage++;
                await this.renderLogs();
                await this.updatePagination();
            }
        },
    };
}

// 导出默认实例
export const gmLogClass = createGmLogClass();
