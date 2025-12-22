// 存储数据
let permissions = [];
let permissionGroups = [];
let permissionsAllUsers = [];
let assignments = [];
let allprojects = [];
let allLevels = [];

function getpermissionsBody(){
    return document.getElementById('premissionContainer');
}

function loadPermissionEvent(){
    const getPermissionReq ={};
    fetch('/api/gm_permission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(getPermissionReq)
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
        console.log('获取用户权限数据:', data);
        permissions = data.message.permissiondatas;
        permissionGroups = data.message.permissiongroupdatas;
        permissionsAllUsers = data.message.allusers;
        allprojects = data.message.allprojects;
        allLevels = data.message.allLevels;
        assignments = data.message.assignment;

        // 初始化权限列表
        updatePermissionsTable();
        
        // 初始化权限组选择
        updatePermissionGroups();
        updateGroupsTable();
        updateProjectSelect();
        updateLevelSelect();
        updateGroupSelect();
        updateGroupUserSelect();
        updateAssignmentsTable();
    })
    .catch((error) => {
        console.error('错误:', error);
        window.showToast(error.message, "error");
    });
}

// 初始化页面
function initPermissionBox(gridWrapper){

    loadPermissionEvent()
    
    // 事件监听
    const permissionsBody = getpermissionsBody()
    const addPermissionBtn = permissionsBody.querySelector('#addPermissionBtn');
    const addGroupBtn = permissionsBody.querySelector('#addGroupBtn');
    const assignPermissionBtn = permissionsBody.querySelector('#assignPermissionBtn');
    addPermissionBtn.addEventListener('click', addPermission);
    addGroupBtn.addEventListener('click', addPermissionGroup);
    assignPermissionBtn.addEventListener('click', assignPermission);
}

// 添加权限
function addPermission() {
    const permissionsBody = getpermissionsBody()
    const permissionName = permissionsBody.querySelector('#permissionName');
    const permissionProjectSelect = permissionsBody.querySelector('#permissionProjectSelect');
    const permissionLevelSelect = permissionsBody.querySelector('#permissionLevelSelect');
    const permissionOrderNameMatch = permissionsBody.querySelector('#permissionOrderNameMatch');

    
    const commandCheckboxes = permissionsBody.querySelector('#commandCheckboxes');

    if (!permissionName.value.trim()) {
        alert('请输入权限名称');
        return;
    }
        
    // 创建权限
    var projectname;
    if (permissionProjectSelect.textContent.split("-").count >= 2 )
    {
        projectname = permissionProjectSelect.textContent.split("-")[1];
    }
    const addPermissionReq = {
        name: permissionName.value.trim(),
        enable: true,
        projectid: Number(permissionProjectSelect.value),
        projectname: projectname,
        name: permissionName.value.trim(),
        level: Number(permissionLevelSelect.value),
        ordernamematch: permissionOrderNameMatch.value.trim(),
    };
    fetch('/api/gm_permission/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addPermissionReq)
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
        console.log('成功增加权限:', data);
          window.showToast("权限添加成功");
          permissions.push(data.message.data);
        updatePermissionsTable();
        updatePermissionGroups();
        return;
      })
      .catch((error) => {
          console.error('错误:', error);
          alert('修改失败');
          window.showToast(error.message, "error");
      });

    // 清空表单
    permissionName.value = '';
    permissionLevelSelect.value = '';
    permissionProjectSelect.value = '';
    commandCheckboxes.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
}

// 更新权限表格
function updatePermissionsTable() {

    const permissionsBody = getpermissionsBody()
    const permissionsTableBody = permissionsBody.querySelector('#permissionsTableBody');
    const emptyPermissions = permissionsBody.querySelector('#emptyPermissions');

    permissionsTableBody.innerHTML = '';
    
    if (permissions.length === 0) {
        emptyPermissions.style.display = 'block';
        return;
    }
    
    emptyPermissions.style.display = 'none';
    
    permissions.forEach(permission => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${permission.id}</td>
            <td>${permission.name}</td>
            <td>${permission.projectid === 0 ? '所有项目' : `${permission.projectname}`}</td>
            <td>${permission.level === 0 ? '所有等级' : `${permission.level}`}</td>
            <td>${permission.ordernamematch}</td>
            <td class="${permission.enable === true ? 'status-active' : 'status-inactive'}">
                ${permission.enable === true ? '启用' : '禁用'}
            </td>
            <td>
                <button class="btn btn-small btn-primary" onclick="togglePermissionStatus(${permission.id})">
                    ${permission.enable === true ? '禁用' : '启用'}
                </button>
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
        permission.enable = permission.enable === true ? false : true;
        const modifyPermissionReq = {
            data: permission,
        }
        fetch('/api/gm_permission/modify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(modifyPermissionReq)
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
            console.log('成功修改权限:', data);
              window.showToast("成功修改权限");
              permissions.forEach((permission, index) => {
                if (permission.id == data.message.data.id) {
                    permissions[index] = data.message.data;
                }
            });
            updatePermissionsTable();
            updatePermissionGroups();
            return;
          })
          .catch((error) => {
              console.error('错误:', error);
              window.showToast(error.message, "error");
          });
    }
}

// 删除权限
function deletePermission(id) {
    if (confirm('确定要删除这个权限吗？')) {
        const delPermissionReq = {
            id: id,
        }
        fetch('/api/gm_permission/del', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(delPermissionReq)
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
            console.log('成功删除权限:', data);
              window.showToast("成功删除权限");
              permissions = permissions.filter(p => p.id !== data.message.id);
            updatePermissionsTable();
            updatePermissionGroups();
            return;
          })
          .catch((error) => {
              console.error('错误:', error);
              window.showToast(error.message, "error");
        });
    }
}

// 添加权限组
function addPermissionGroup() {
    const permissionsBody = getpermissionsBody()
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
        const permission = permissions.find(p => p.id === permissionId && p.enable === true);
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

    fetch('/api/gm_permission/group/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addPermissionGroupReq)
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
      console.log('成功增加权限组:', data);
      permissionGroups.push(data.message.data);
      updateGroupsTable();
      updateGroupSelect();
        window.showToast("权限组添加成功");
        return;
    })
    .catch((error) => {
        console.error('错误:', error);
        window.showToast(error.message, "error");
    });
    
    // 清空表单
    groupName.value = '';
    permissionCheckboxes.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
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
            <td>${group.id}</td>
            <td>${group.name || '-'}</td>
            <td>${group.powerids.length}</td>
            <td class="${group.enable === true ? 'status-active' : 'status-inactive'}">
                ${group.enable === true ? '启用' : '禁用'}
            </td>
            <td>
                <button class="btn btn-small btn-primary" onclick="toggleGroupStatus(${group.id})">
                    ${group.enable === true ? '禁用' : '启用'}
                </button>
                <button class="btn btn-small btn-secondary"">编辑</button>
                <button class="btn btn-small btn-warning" onclick="deleteGroup(${group.id})">删除</button>
            </td>
        `;
        groupsTableBody.appendChild(row);
    });
}

// 更新权限组选择（用于分配）
function updateGroupSelect() {
    const permissionsBody = getpermissionsBody()
    const groupSelect = permissionsBody.querySelector('#groupSelect');
    groupSelect.innerHTML = '<option value="">选择权限组</option>';
    
    permissionGroups
        .filter(group => group.enable === true)
        .forEach(group => {
            const option = document.createElement('option');
            option.value = group.id;
            option.textContent = `${group.id} (${group.name})`;
            groupSelect.appendChild(option);
        });
}

// 更新权限用户选择（用于分配）
function updateGroupUserSelect() {
    const permissionsBody = getpermissionsBody()
    const playerIdSelect = permissionsBody.querySelector('#playerIdSelect');
    playerIdSelect.innerHTML = '<option value="">选择用户</option>';
    
    permissionsAllUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.userid;
            option.textContent = `${user.userid} (${user.username})`;
            playerIdSelect.appendChild(option);
        });
}

// 更新项目选择下拉框
function updateProjectSelect() {
    const permissionsBody = getpermissionsBody()
    const permissionProjectSelect = permissionsBody.querySelector('#permissionProjectSelect');
    permissionProjectSelect.innerHTML = '<option value="">所有项目</option>';
    
    allprojects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.projectid;
            option.textContent = `${project.projectid}-${project.name}`;
            permissionProjectSelect.appendChild(option);
        });
}

// 更新等级选择下拉框
function updateLevelSelect() {
    const permissionsBody = getpermissionsBody()
    const permissionLevelSelect = permissionsBody.querySelector('#permissionLevelSelect');
    permissionLevelSelect.innerHTML = '<option value="">所有等级</option>';
    
    allLevels.forEach(level => {
            const option = document.createElement('option');
            option.value = level;
            option.textContent = `等级 (${level})`;
            permissionLevelSelect.appendChild(option);
        });
}

// 更新权限复选框
function updatePermissionGroups() {
    const permissionsBody = getpermissionsBody()
    const permissionCheckboxes = permissionsBody.querySelector('#permissionCheckboxes');
    permissionCheckboxes.innerHTML = '';
    
    const activePermissions = permissions.filter(p => p.enable === true);
    
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
}

// 切换权限组状态
function toggleGroupStatus(id) {
    const group = permissionGroups.find(g => g.id === id);
    if (group) {
        group.enable = group.enable === true ? false : true;
        const modifyPermissionGroupReq = {
            data: group,
        }
        fetch('/api/gm_permission/group/modify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(modifyPermissionGroupReq)
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
            console.log('成功修改权限组:', data);
              window.showToast("成功修改权限组");
              permissionGroups.forEach((permissionGroup, index) => {
                if (permissionGroup.id == data.message.data.id) {
                    permissionGroups[index] = data.message.data;
                }
            });
            updateGroupsTable();
            updateGroupSelect();
            return;
          })
          .catch((error) => {
              console.error('错误:', error);
              window.showToast(error.message, "error");
        });

    }
}

// 删除权限组
function deleteGroup(id) {
    if (confirm('确定要删除这个权限组吗？')) {
        const delPermissionGroupReq = {
            id: id,
        }
        fetch('/api/gm_permission/group/del', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(delPermissionGroupReq)
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
            console.log('成功删除权限组:', data);
              window.showToast("成功删除权限组");
              permissionGroups = permissionGroups.filter(g => g.id !== id);
            updateGroupsTable();
            updateGroupSelect();
            return;
          })
          .catch((error) => {
              console.error('错误:', error);
              window.showToast(error.message, "error");
        });
    }
}

// 分配权限
function assignPermission() {
    const permissionsBody = getpermissionsBody()
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
    const user = permissionsAllUsers.find(g => g.userid == playerId.value);
    if (!user) {
        alert('选择的用户不存在');
        return;
    }

    // 查找权限组
    const group = permissionGroups.find(g => g.id == groupId.value && g.enable === true);
    if (!group) {
        alert('选择的权限组不存在或已禁用');
        return;
    }
    
    // 检查UI上是否已经分配过
    const existingAssignment = assignments.find(a => a.userid === playerId.value && a.groupid == groupId.value);
    if (existingAssignment) {
        alert('该玩家已经分配了这个权限组');
        return;
    }

    const addPermissionAssignmentReq = {
        userid: Number(playerId.value),
        groupid: Number(groupId.value),
    }
    
    // 分配权限
    fetch('/api/gm_permission/assign/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addPermissionAssignmentReq)
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
        console.log('成功添加用户到权限组:', data);
          assignments.push(data.message.data);
        updateAssignmentsTable();
        window.showToast(`权限组 "${group.name}" 已成功分配给玩家 ${playerId.value.trim()}`);
        return;
      })
      .catch((error) => {
          console.error('错误:', error);
          window.showToast(error.message, "error");
    });

    
    // 清空表单
    playerId.value = '';
    group.value = '';
}

// 更新分配表格
function updateAssignmentsTable() {
    const permissionsBody = getpermissionsBody()
    const assignmentsTableBody = permissionsBody.querySelector('#assignmentsTableBody');
    const emptyAssignments = permissionsBody.querySelector('#emptyAssignments');

    assignmentsTableBody.innerHTML = '';
    
    if (assignments.length === 0) {
        emptyAssignments.style.display = 'block';
        return;
    }
    
    emptyAssignments.style.display = 'none';
    assignments.forEach(assignment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${assignment.userid}</td>
            <td>${assignment.username}</td>
            <td>${assignment.groupid}</td>
            <td>${assignment.groupname}</td>
            <td>
                <button class="btn btn-small btn-warning" onclick="deleteAssignment(${assignment.id})">删除</button>
            </td>
        `;
        assignmentsTableBody.appendChild(row);
    });
}

// 删除分配记录
function deleteAssignment(assignmentId) {
    if (confirm('确定要删除这个分配记录吗？')) {
        const delPermissionAssignmentReq = {
            id: assignmentId,
        }
        
        // 分配权限
        fetch('/api/gm_permission/assign/del', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(delPermissionAssignmentReq)
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
            console.log('成功删除用户到权限组:', playerId, groupId, data);
            assignments = assignments.filter(p => p.id != assignmentId);
            updateAssignmentsTable();
              window.showToast(`成功删除用户到权限组${playerId}-${groupId}`);
              return;
          })
          .catch((error) => {
              console.error('错误:', error);
              window.showToast(error.message, "error");
        });
    }
}