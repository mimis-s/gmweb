// 用户数据存储
let users = [];
let currentUserId = null;
let isEditing = false;

// 初始化一些示例用户
function loadUsersBoxEvent(gridWrapper) {
    var getAllUsersReq = {}
    fetch('/api/gm_user_mangement', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(getAllUsersReq)
    })
    .then(response => {
      return response.json().then(data => {
        return data;
      });
    })
    .then((data) => {
      console.log('成功获取用户列表:', data);
      initUserMangement(gridWrapper, data.message);
      return;
    })
    .catch((error) => {
      console.error('错误:', error);
    });
}

function initUserMangement(gridWrapper, data){   
    // 从本地存储加载用户数据，如果没有则使用示例数据
    users = data.datas;
    renderUsersTable();
}

// 保存用户数据到服务器
function saveUsersToEvent(userIndex, userName, userPassword) {
    const modifyUserReq = {
        UserId: users[userIndex].userid,
	    Name: userName,
	    Password: userPassword,
    }

  fetch('/api/gm_user_mangement/modify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(modifyUserReq)
  })
  .then(response => {
    return response.json().then(data => {
      return data;
    });
  })
  .then((data) => {
    const now = new Date();
    const formattedTime = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    console.log('修改用户数据成功:', data);
    const oldName = users[userIndex].name;
    users[userIndex].name = userName;
    users[userIndex].password = userPassword;
    renderUsersTable();
    showAlert('success', '修改成功', `用户 "${oldName}" 已修改为 "${userName}"`, `密码已更新，操作时间: ${formattedTime}`);
    return;
  })
  .catch((error) => {
      console.error('错误:', error);
      alert('修改失败');
  });
}

// 删除用户数据
function delUsersToEvent(userId) {
    const delUserReq = {
        UserId: userId,
    }

  fetch('/api/gm_user_mangement/del', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(delUserReq)
  })
  .then(response => {
    return response.json().then(data => {
      return data;
    });
  })
  .then((data) => {
    const user = users.find(u => u.userid === userId);
    const now = new Date();
    const formattedTime = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    console.log('删除用户数据成功:', data);
    users = users.filter(u => u.userid !== userId);
    renderUsersTable();
    showAlert('warning', '删除成功', `用户 "${user.name}" 已删除`, `操作时间: ${formattedTime}`);
    return;
  })
  .catch((error) => {
      console.error('错误:', error);
      alert('修改失败');
  });
}

// 新增用户数据
function addUsersToEvent(userName, userPassword) {
  const addUserReq = {
      Name: userName,
      Password: userPassword,
  }

  fetch('/api/gm_user_mangement/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(addUserReq)
  })
  .then(response => {
    return response.json().then(data => {
      return data;
    });
  })
  .then((data) => {
    console.log("新增用户:", data)
    const now = new Date();
    const formattedTime = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const newUser = {
        userid: data.message.data.userid,
        name: data.message.data.name,
        password: data.message.data.password,
    };
    
    users.push(newUser);
    renderUsersTable();
    showAlert('success', '新增成功', `用户 "${newUser.name}" 已添加`, `密码: ${newUser.password}，操作时间: ${formattedTime}`);
    return;
  })
  .catch((error) => {
      console.error('错误:', error);
      alert('增加失败');
  });
}


// 渲染用户表格
function renderUsersTable(filteredUsers = null) {
    const usersTableBody = document.getElementById('usersTableBody');
    const noUsersMessage = document.getElementById('noUsersMessage');
    
    const usersToRender = filteredUsers || users;
    
    if (usersToRender.length === 0) {
        usersTableBody.innerHTML = '';
        noUsersMessage.style.display = 'block';
        return;
    }
    
    noUsersMessage.style.display = 'none';
    
    let tableHTML = '';
    usersToRender.forEach((user, index) => {
        const passwordMask = '*'.repeat(user.password.length);
        const firstChar = user.name.charAt(0).toUpperCase();
        
        tableHTML += `
            <tr>
                <td>${user.userid}</td>
                <td>
                    <div class="user-avatar" style="background: linear-gradient(135deg, #${getColorFromName(user.name)});">
                        ${firstChar}
                    </div>
                </td>
                <td>
                    <div class="user-name">${user.name}</div>
                </td>
                <td>
                    <span class="password-mask" id="password-${user.userid}">${passwordMask}</span>
                    <button id="password-${user.userid}-btn" onclick="togglePassword(${user.userid})" style="margin-left: 10px; padding: 4px 8px; font-size: 0.8rem; background: #f1f1f1; border: none; border-radius: 4px; cursor: pointer;">
                        显示密码
                    </button>
                </td>
                <td class="action-cell">
                    <button class="action-btn action-btn-edit" onclick="editUser(${user.userid})">
                        编辑
                    </button>
                    <button class="action-btn action-btn-delete" onclick="deleteUser(${user.userid})">
                        删除
                    </button>
                </td>
            </tr>
        `;
    });
    
    usersTableBody.innerHTML = tableHTML;
}

// 根据用户名生成颜色
function getColorFromName(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // 生成6位十六进制颜色代码
    let color = '';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF;
        color += ('00' + value.toString(16)).substr(-2);
    }
    
    // 确保颜色不会太暗或太亮
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    
    // 调整颜色使其更适合作为背景
    const adjustedR = Math.min(r + 40, 255);
    const adjustedG = Math.min(g + 40, 255);
    const adjustedB = Math.min(b + 40, 255);
    
    return adjustedR.toString(16) + adjustedG.toString(16) + adjustedB.toString(16);
}

// 切换密码显示/隐藏
function togglePassword(userId) {
    const user = users.find(u => u.userid === userId);
    const passwordElement = document.getElementById(`password-${userId}`);
    const passwordBtn = document.getElementById(`password-${userId}-btn`);

    if (!user) return;

    if (passwordElement.textContent.includes('*')) {
        passwordElement.textContent = user.password;
        passwordBtn.textContent = '隐藏密码';
    } else {
        passwordElement.textContent = '*'.repeat(user.password.length);
        passwordBtn.textContent = '显示密码';
    }
}

// 打开新增用户弹窗
function openAddUserModal() {
    isEditing = false;
    currentUserId = null;
    document.getElementById('modalTitle').textContent = '新增用户';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    openModal('userModal');
}

// 打开编辑用户弹窗
function editUser(userId) {
    const user = users.find(u => u.userid === userId);
    if (!user) return;
    
    isEditing = true;
    currentUserId = userId;
    document.getElementById('modalTitle').textContent = '编辑用户';
    document.getElementById('userId').value = user.userid;
    document.getElementById('userName').value = user.name;
    document.getElementById('userPassword').value = user.password;
    openModal('userModal');
}

// 保存用户（新增或编辑）
function saveUser() {
    const userName = document.getElementById('userName').value.trim();
    const userPassword = document.getElementById('userPassword').value.trim();
    
    if (!userName || !userPassword) {
        showAlert('warning', '操作失败', '请填写完整的用户信息', '用户名和密码都不能为空');
        return;
    }
    
    if (isEditing) {
        // 编辑现有用户
        const userIndex = users.findIndex(u => u.userid === currentUserId);
        if (userIndex !== -1) {
            saveUsersToEvent(userIndex, userName, userPassword);
        }
    } else {
        // 新增用户
        
        addUsersToEvent(userName, userPassword);
    }
    
    closeModal();
}

// 删除用户
function deleteUser(userId) {
    const user = users.find(u => u.userid === userId);
    if (!user) return;
    
    if (confirm(`确定要删除用户 "${user.name}" 吗？`)) {
        delUsersToEvent(user.userid);
    }
}

// 搜索用户
function searchUsers() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!searchTerm) {
        renderUsersTable();
        return;
    }
    
    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchTerm)
    );
    
    renderUsersTable(filteredUsers);
}

// 显示操作提示弹窗
function showAlert(type, title, message, detail) {
    const alertIcon = document.getElementById('alertIcon');
    const alertMessage = document.getElementById('alertMessage');
    const alertUser = document.getElementById('alertUser');
    const alertDetail = document.getElementById('alertDetail');
    
    // 设置弹窗类型
    alertIcon.className = 'alert-icon';
    if (type === 'success') {
        alertIcon.classList.add('success');
        alertIcon.innerHTML = '<span>✓</span>';
    } else if (type === 'warning') {
        alertIcon.classList.add('warning');
        alertIcon.innerHTML = '<span>!</span>';
    } else if (type === 'info') {
        alertIcon.classList.add('info');
        alertIcon.innerHTML = '<span>i</span>';
    }
    
    alertMessage.textContent = title;
    alertUser.textContent = message;
    alertDetail.textContent = detail;
    
    openModal('alertModal');
}

// 打开弹窗
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// 关闭弹窗
function closeModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = 'auto';
}

// 关闭提示弹窗
function closeAlertModal() {
    closeModal();
}

