// 初始数据
const commands = [
    { id: 1, name: "/teleport", level: 1 },
    { id: 2, name: "/give", level: 3 },
    { id: 3, name: "/kick", level: 2 },
    { id: 4, name: "/ban", level: 4 },
    { id: 5, name: "/time", level: 1 },
    { id: 6, name: "/gamemode", level: 2 }
];

// 存储数据
let permissions = JSON.parse(localStorage.getItem('permissions')) || [];
let permissionGroups = JSON.parse(localStorage.getItem('permissionGroups')) || [];
let assignments = JSON.parse(localStorage.getItem('assignments')) || [];

// DOM元素
const commandCheckboxes = document.getElementById('commandCheckboxes');
const permissionsTableBody = document.getElementById('permissionsTableBody');
const emptyPermissions = document.getElementById('emptyPermissions');
const permissionCheckboxes = document.getElementById('permissionCheckboxes');
const groupsTableBody = document.getElementById('groupsTableBody');
const emptyGroups = document.getElementById('emptyGroups');
const groupSelect = document.getElementById('groupSelect');
const assignmentsTableBody = document.getElementById('assignmentsTableBody');
const emptyAssignments = document.getElementById('emptyAssignments');

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 初始化命令复选框
    initializeCommandCheckboxes();
    
    // 初始化权限列表
    updatePermissionsTable();
    
    // 初始化权限组选择
    updatePermissionGroups();
    
    // 初始化分配列表
    updateAssignmentsTable();
    
    // 事件监听
    document.getElementById('addPermissionBtn').addEventListener('click', addPermission);
    document.getElementById('addGroupBtn').addEventListener('click', addPermissionGroup);
    document.getElementById('assignPermissionBtn').addEventListener('click', assignPermission);
});

// 初始化命令复选框
function initializeCommandCheckboxes() {
    commandCheckboxes.innerHTML = '';
    
    commands.forEach(command => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';
        checkboxItem.innerHTML = `
            <input type="checkbox" id="cmd_${command.id}" value="${command.id}" data-level="${command.level}">
            <label for="cmd_${command.id}">${command.name} (等级 ${command.level})</label>
        `;
        commandCheckboxes.appendChild(checkboxItem);
    });
}

// 添加权限
function addPermission() {
    const permissionName = document.getElementById('permissionName').value.trim();
    const permissionLevel = document.getElementById('permissionLevel').value;
    
    if (!permissionName) {
        alert('请输入权限名称');
        return;
    }
    
    // 获取选中的命令
    const selectedCommands = [];
    const selectedCheckboxes = commandCheckboxes.querySelectorAll('input[type="checkbox"]:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert('请至少选择一个命令');
        return;
    }
    
    selectedCheckboxes.forEach(checkbox => {
        const commandId = parseInt(checkbox.value);
        const command = commands.find(cmd => cmd.id === commandId);
        if (command) {
            selectedCommands.push(command);
        }
    });
    
    // 根据等级筛选选中的命令
    let filteredCommands = selectedCommands;
    if (permissionLevel) {
        filteredCommands = selectedCommands.filter(cmd => cmd.level == permissionLevel);
    }
    
    // 创建权限
    const newPermission = {
        id: Date.now(),
        name: permissionName,
        levelFilter: permissionLevel || '全部',
        commands: filteredCommands,
        status: 'active'
    };
    
    permissions.push(newPermission);
    saveToLocalStorage('permissions', permissions);
    updatePermissionsTable();
    updatePermissionGroups();
    
    // 清空表单
    document.getElementById('permissionName').value = '';
    document.getElementById('permissionLevel').value = '';
    commandCheckboxes.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    alert('权限添加成功！');
}

// 更新权限表格
function updatePermissionsTable() {
    permissionsTableBody.innerHTML = '';
    
    if (permissions.length === 0) {
        emptyPermissions.style.display = 'block';
        return;
    }
    
    emptyPermissions.style.display = 'none';
    
    permissions.forEach(permission => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${permission.name}</td>
            <td>${permission.levelFilter === '全部' ? '所有等级' : `等级 ${permission.levelFilter}`}</td>
            <td>${permission.commands.length}</td>
            <td class="${permission.status === 'active' ? 'status-active' : 'status-inactive'}">
                ${permission.status === 'active' ? '启用' : '禁用'}
            </td>
            <td>
                <button class="btn btn-small btn-primary" onclick="togglePermissionStatus(${permission.id})">
                    ${permission.status === 'active' ? '禁用' : '启用'}
                </button>
                <button class="btn btn-small btn-secondary" onclick="editPermission(${permission.id})">编辑</button>
                <button class="btn btn-small btn-warning" onclick="deletePermission(${permission.id})">删除</button>
            </td>
        `;
        permissionsTableBody.appendChild(row);
    });
}

// 切换权限状态
function togglePermissionStatus(id) {
    const permission = permissions.find(p => p.id === id);
    if (permission) {
        permission.status = permission.status === 'active' ? 'inactive' : 'active';
        saveToLocalStorage('permissions', permissions);
        updatePermissionsTable();
        updatePermissionGroups();
    }
}

// 编辑权限
function editPermission(id) {
    const permission = permissions.find(p => p.id === id);
    if (permission) {
        document.getElementById('permissionName').value = permission.name;
        document.getElementById('permissionLevel').value = permission.levelFilter === '全部' ? '' : permission.levelFilter;
        
        // 选中对应的命令
        commandCheckboxes.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            const commandId = parseInt(cb.value);
            const isSelected = permission.commands.some(cmd => cmd.id === commandId);
            cb.checked = isSelected;
        });
        
        // 删除原权限
        permissions = permissions.filter(p => p.id !== id);
        saveToLocalStorage('permissions', permissions);
        updatePermissionsTable();
        
        alert('权限已加载到编辑表单，请修改后重新添加');
    }
}

// 删除权限
function deletePermission(id) {
    if (confirm('确定要删除这个权限吗？')) {
        permissions = permissions.filter(p => p.id !== id);
        saveToLocalStorage('permissions', permissions);
        updatePermissionsTable();
        updatePermissionGroups();
        alert('权限删除成功！');
    }
}

// 添加权限组
function addPermissionGroup() {
    const groupName = document.getElementById('groupName').value.trim();
    const groupDescription = document.getElementById('groupDescription').value.trim();
    
    if (!groupName) {
        alert('请输入权限组名称');
        return;
    }
    
    // 获取选中的权限
    const selectedPermissions = [];
    const selectedCheckboxes = permissionCheckboxes.querySelectorAll('input[type="checkbox"]:checked');
    
    if (selectedCheckboxes.length === 0) {
        alert('请至少选择一个权限');
        return;
    }
    
    selectedCheckboxes.forEach(checkbox => {
        const permissionId = parseInt(checkbox.value);
        const permission = permissions.find(p => p.id === permissionId && p.status === 'active');
        if (permission) {
            selectedPermissions.push(permission);
        }
    });
    
    // 创建权限组
    const newGroup = {
        id: Date.now(),
        name: groupName,
        description: groupDescription,
        permissions: selectedPermissions,
        status: 'active'
    };
    
    permissionGroups.push(newGroup);
    saveToLocalStorage('permissionGroups', permissionGroups);
    updateGroupsTable();
    updateGroupSelect();
    
    // 清空表单
    document.getElementById('groupName').value = '';
    document.getElementById('groupDescription').value = '';
    permissionCheckboxes.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    alert('权限组添加成功！');
}

// 更新权限组表格
function updateGroupsTable() {
    groupsTableBody.innerHTML = '';
    
    if (permissionGroups.length === 0) {
        emptyGroups.style.display = 'block';
        return;
    }
    
    emptyGroups.style.display = 'none';
    
    permissionGroups.forEach(group => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${group.name}</td>
            <td>${group.description || '-'}</td>
            <td>${group.permissions.length}</td>
            <td class="${group.status === 'active' ? 'status-active' : 'status-inactive'}">
                ${group.status === 'active' ? '启用' : '禁用'}
            </td>
            <td>
                <button class="btn btn-small btn-primary" onclick="toggleGroupStatus(${group.id})">
                    ${group.status === 'active' ? '禁用' : '启用'}
                </button>
                <button class="btn btn-small btn-warning" onclick="deleteGroup(${group.id})">删除</button>
            </td>
        `;
        groupsTableBody.appendChild(row);
    });
}

// 更新权限组选择（用于分配）
function updateGroupSelect() {
    groupSelect.innerHTML = '<option value="">选择权限组</option>';
    
    permissionGroups
        .filter(group => group.status === 'active')
        .forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = `${group.name} (${group.permissions.length}个权限)`;
            groupSelect.appendChild(option);
        });
}

// 更新权限复选框
function updatePermissionGroups() {
    permissionCheckboxes.innerHTML = '';
    
    const activePermissions = permissions.filter(p => p.status === 'active');
    
    if (activePermissions.length === 0) {
        permissionCheckboxes.innerHTML = '<p style="color:#777;font-style:italic;">暂无可用权限，请先在权限模块创建权限</p>';
        return;
    }
    
    activePermissions.forEach(permission => {
        const checkboxItem = document.createElement('div');
        checkboxItem.className = 'checkbox-item';
        checkboxItem.innerHTML = `
            <input type="checkbox" id="perm_${permission.id}" value="${permission.id}">
            <label for="perm_${permission.id}">${permission.name} (${permission.commands.length}个命令)</label>
        `;
        permissionCheckboxes.appendChild(checkboxItem);
    });
}

// 切换权限组状态
function toggleGroupStatus(id) {
    const group = permissionGroups.find(g => g.id === id);
    if (group) {
        group.status = group.status === 'active' ? 'inactive' : 'active';
        saveToLocalStorage('permissionGroups', permissionGroups);
        updateGroupsTable();
        updateGroupSelect();
    }
}

// 删除权限组
function deleteGroup(id) {
    if (confirm('确定要删除这个权限组吗？')) {
        permissionGroups = permissionGroups.filter(g => g.id !== id);
        saveToLocalStorage('permissionGroups', permissionGroups);
        updateGroupsTable();
        updateGroupSelect();
        alert('权限组删除成功！');
    }
}

// 分配权限
function assignPermission() {
    const playerId = document.getElementById('playerId').value.trim();
    const groupId = document.getElementById('groupSelect').value;
    
    if (!playerId) {
        alert('请输入玩家ID');
        return;
    }
    
    if (!groupId) {
        alert('请选择权限组');
        return;
    }
    
    // 查找权限组
    const group = permissionGroups.find(g => g.id == groupId && g.status === 'active');
    
    if (!group) {
        alert('选择的权限组不存在或已禁用');
        return;
    }
    
    // 检查是否已经分配过
    const existingAssignment = assignments.find(a => a.playerId === playerId && a.groupId == groupId);
    
    if (existingAssignment) {
        alert('该玩家已经分配了这个权限组');
        return;
    }
    
    // 创建分配记录
    const newAssignment = {
        id: Date.now(),
        playerId: playerId,
        groupId: groupId,
        groupName: group.name,
        assignmentTime: new Date().toLocaleString(),
        status: 'active'
    };
    
    assignments.push(newAssignment);
    saveToLocalStorage('assignments', assignments);
    updateAssignmentsTable();
    
    // 清空表单
    document.getElementById('playerId').value = '';
    document.getElementById('groupSelect').value = '';
    
    alert(`权限组 "${group.name}" 已成功分配给玩家 ${playerId}`);
}

// 更新分配表格
function updateAssignmentsTable() {
    assignmentsTableBody.innerHTML = '';
    
    if (assignments.length === 0) {
        emptyAssignments.style.display = 'block';
        return;
    }
    
    emptyAssignments.style.display = 'none';
    
    assignments.forEach(assignment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${assignment.playerId}</td>
            <td>${assignment.groupName}</td>
            <td>${assignment.assignmentTime}</td>
            <td class="${assignment.status === 'active' ? 'status-active' : 'status-inactive'}">
                ${assignment.status === 'active' ? '有效' : '失效'}
            </td>
            <td>
                <button class="btn btn-small btn-primary" onclick="toggleAssignmentStatus(${assignment.id})">
                    ${assignment.status === 'active' ? '失效' : '激活'}
                </button>
                <button class="btn btn-small btn-warning" onclick="deleteAssignment(${assignment.id})">删除</button>
            </td>
        `;
        assignmentsTableBody.appendChild(row);
    });
}

// 切换分配状态
function toggleAssignmentStatus(id) {
    const assignment = assignments.find(a => a.id === id);
    if (assignment) {
        assignment.status = assignment.status === 'active' ? 'inactive' : 'active';
        saveToLocalStorage('assignments', assignments);
        updateAssignmentsTable();
    }
}

// 删除分配记录
function deleteAssignment(id) {
    if (confirm('确定要删除这个分配记录吗？')) {
        assignments = assignments.filter(a => a.id !== id);
        saveToLocalStorage('assignments', assignments);
        updateAssignmentsTable();
        alert('分配记录删除成功！');
    }
}

// 保存到本地存储
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}