const levelMap = {
    0: 'UNDEFINE',
    1: 'DEBUG',
    3: 'INFO',
    4: 'WARNING',
    2: 'ERROR',
}

// 应用状态
const state = {
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
};

// 初始化函数
function initLogBox() {
    // 设置日期范围默认值
    const today = new Date().toISOString().split('T')[0];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 1);
    const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

    const projectLogContainer = document.getElementById('projectLogContainer');

    projectLogContainer.querySelector('#startDate').value = oneWeekAgoStr;
    projectLogContainer.querySelector('#endDate').value = today;

    state.filter.startDate = oneWeekAgoStr;
    state.filter.endDate = today;

    // 绑定事件
    projectLogContainer.querySelector('#queryForm').addEventListener('submit', handleQuery);
    projectLogContainer.querySelector('#resetBtn').addEventListener('click', resetQuery);
    projectLogContainer.querySelector('#tableViewBtn').addEventListener('click', () => switchView('table'));
    projectLogContainer.querySelector('#prevPage').addEventListener('click', prevPage);
    projectLogContainer.querySelector('#nextPage').addEventListener('click', nextPage);

    // 绑定排序事件
    projectLogContainer.querySelectorAll('.sortable').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.getAttribute('data-sort');
            sortLogs(field);
        });
    });

    // 初始渲染
    filterAndSortLogs();
}

// 处理查询
function handleQuery(e) {
    e.preventDefault();
    const projectLogContainer = document.getElementById('projectLogContainer');

    // 获取查询条件
    state.filter.username = projectLogContainer.querySelector('#username').value.trim();
    state.filter.ip = projectLogContainer.querySelector('#ip').value.trim();
    state.filter.level = projectLogContainer.querySelector('#level').value;
    state.filter.startDate = projectLogContainer.querySelector('#startDate').value;
    state.filter.endDate = projectLogContainer.querySelector('#endDate').value;
    state.filter.message = projectLogContainer.querySelector('#message').value.trim();

    // 重置到第一页
    state.currentPage = 1;

    // 过滤和渲染
    filterAndSortLogs();
}

// 重置查询
function resetQuery() {
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
    state.filter.username = '';
    state.filter.ip = '';
    state.filter.level = 0;
    state.filter.startDate = oneWeekAgoStr;
    state.filter.endDate = today;
    state.filter.message = '';
    state.currentPage = 1;

    // 重新过滤和渲染
    filterAndSortLogs();
}

// 过滤和排序日志
function filterAndSortLogs() {
    let startTimestamp = new Date(state.filter.startDate).getTime()
    let endTimestamp = new Date(state.filter.endDate).getTime()
    var getGmLogReq = {
        UserName:   state.filter.username,   // 用户名过滤(为空就是所有用户)
        Ip:        state.filter.ip,          // IP地址过滤(模糊匹配)
        Level:     Number(state.filter.level),       // 日志等级过滤(为0是所有等级)
        StartTime: Number(startTimestamp),    // 日期范围过滤
        EndTime:   Number(endTimestamp),      // 日期范围过滤
        Msg:       state.filter.message,    // 消息内容过滤(模糊匹配)
    }
    fetch('/api/gm_log', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(getGmLogReq)
    })
        .then(response => {
            const nextPage = response.headers.get('next-page');
            if (nextPage != null) {
                window.location.href = nextPage;
            }
            return response.json().then(data => {
                return data;
            });
        })
        .then((data) => {
            if (data.message == null || data.message.datas == null){
                return;
            }
            console.debug("获取日志:", data)
            const logs = [];
            for (let i = 0; i < data.message.datas.length; i++) {
                const log = data.message.datas[i];
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
            state.filteredLogs = logs;
            // 应用排序
            sortLogs(state.sortField, false);
            renderLogs();
            updatePagination();
        })
        .catch((error) => {
            window.showToast(error.message, "error");
        });
}

// 排序日志
function sortLogs(field, updateUI = true) {
    // 如果点击的是当前排序字段，则切换排序方向
    if (field === state.sortField) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        state.sortField = field;
        state.sortDirection = 'desc'; // 默认降序
    }

    // 执行排序
    state.filteredLogs.sort((a, b) => {
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
            return state.sortDirection === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
            return state.sortDirection === 'asc' ? 1 : -1;
        }
        return 0;
    });

    // 更新UI
    if (updateUI) {
        renderLogs();
        updateSortIndicators();
    }
}

// 更新排序指示器
function updateSortIndicators() {
    // 清除所有排序指示器
    const projectLogContainer = document.getElementById('projectLogContainer');

    projectLogContainer.querySelectorAll('.sortable i').forEach(icon => {
        icon.className = 'fas fa-sort';
    });

    // 为当前排序字段添加指示器
    const currentTh = projectLogContainer.querySelector(`th[data-sort="${state.sortField}"] i`);
    if (currentTh) {
        currentTh.className = state.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
}

// 切换视图
function switchView(view) {
    state.currentView = view;
    const projectLogContainer = document.getElementById('projectLogContainer');

    // 更新按钮状态
    projectLogContainer.querySelector('#tableViewBtn').classList.toggle('active', view === 'table');

    // 显示/隐藏视图
    projectLogContainer.querySelector('#tableView').classList.toggle('hidden', view !== 'table');

    // 重新渲染
    renderLogs();
}

// 渲染日志
function renderLogs() {
    // 计算分页
    const startIndex = (state.currentPage - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    const pageLogs = state.filteredLogs.slice(startIndex, endIndex);
    const projectLogContainer = document.getElementById('projectLogContainer');

    // 更新统计信息
    projectLogContainer.querySelector('#filteredLogs').textContent = state.filteredLogs.length;

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

    if (state.currentView === 'table') {
        // 渲染表格视图
        pageLogs.forEach(log => {
            const row = document.createElement('tr');
            // 根据日志等级添加类名
            if (levelMap[log.level] === 'ERROR') row.classList.add('error-row');
            if (levelMap[log.level] === 'WARNING') row.classList.add('warning-row');

            const timeStr = new Date(log.time).toLocaleString('zh-CN');
            const levelClassName = levelMap[log.level].toLowerCase();
            console.debug("日志:", levelClassName)
            row.innerHTML = `
                                <td><strong>${log.username}</strong></td>
                                <td>${log.ip}</td>
                                <td><span class="log-level level-${levelClassName}">${levelMap[log.level]}</span></td>
                                <td>${timeStr}</td>
                                <td>${log.message}</td>
                            `;

            projectLogContainer.querySelector('#logTableBody').appendChild(row);
        });
    }
}

// 更新分页
function updatePagination() {
    const totalPages = Math.ceil(state.filteredLogs.length / state.pageSize);
    const projectLogContainer = document.getElementById('projectLogContainer');

    // 更新页面信息
    projectLogContainer.querySelector('#currentPage').textContent = state.currentPage;
    projectLogContainer.querySelector('#totalPages').textContent = totalPages;

    // 更新按钮状态
    projectLogContainer.querySelector('#prevPage').disabled = state.currentPage === 1;
    projectLogContainer.querySelector('#nextPage').disabled = state.currentPage === totalPages;

    // 生成页码按钮
    const pageNumbersContainer = projectLogContainer.querySelector('#pageNumbers');
    pageNumbersContainer.innerHTML = '';

    // 计算显示的页码范围
    let startPage = Math.max(1, state.currentPage - 2);
    let endPage = Math.min(totalPages, state.currentPage + 2);

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
        pageBtn.className = `page-number ${i === state.currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            state.currentPage = i;
            renderLogs();
            updatePagination();
        });
        pageNumbersContainer.appendChild(pageBtn);
    }
}

// 上一页
function prevPage() {
    if (state.currentPage > 1) {
    state.currentPage--;
    renderLogs();
    updatePagination();
    }
}

// 下一页
function nextPage() {
    const totalPages = Math.ceil(state.filteredLogs.length / state.pageSize);
    if (state.currentPage < totalPages) {
        state.currentPage++;
        renderLogs();
        updatePagination();
    }
}
