const gmOrderTableMap = new Map(); // 表行index对应数据
const editGmTableIndex = 0; // 正在编辑的gm命令表格index

// 加载gm命令表
function loadGmOrderTable(gridWrapper, gmOrderData){
    gmOrderTableMap.clear();
    fetch('gm_order_table.html')
    .then(response => {
        if (!response.ok) {
            throw new Error('网络响应不正常');
        }
        return response.text();
    }).then(html => {
        gridWrapper.innerHTML = '';
        const newBox = document.createElement('div');
        newBox.className = "project-table-container";
        newBox.id = "projectTableContainer";
        newBox.innerHTML = html;
        gridWrapper.appendChild(newBox);
        // 卡片事件
        initGmRederTableDatagmOrderData(newBox, gmOrderData);
    }).catch(error => {
        console.error('加载 gm_order_table.html 时出现问题:', error);
    });
}

// 填写数据
function initGmRederTableDatagmOrderData(newBox, gmOrderData){
    gmOrderData.datas.forEach(data => {
        createTableItem(newBox, data);
    });
}

function createTableItem(newBox, gmorderdata){
    const listContainer = newBox.querySelector('#projectTableDataList');
    const index = listContainer.querySelectorAll("#projectTableListItem").length;
    gmOrderTableMap.set(gmorderdata.ordername, gmorderdata);

    const listItem = document.createElement('div');
    listItem.className = 'project-table-list-item';
    listItem.id = 'projectTableListItem';
    listItem.innerHTML = `
        <div class="project-table-item-content">
            <div>
                <strong id="orderLevel">${gmorderdata.level}</strong> - <strong id="orderName">${gmorderdata.ordername}</strong> - <strong id="orderDesc">${gmorderdata.orderdesc}</strong>
            </div>
        </div>
        <div class="project-table-item-actions">
            <button class="project-table-btn project-table-btn-edit" id="projectTableBtnEdit-${index}">修改</button>
            <button class="project-table-btn project-table-btn-delete" id="projectTableBtnDelete-${index}">删除</button>
        </div>
    `;
   
    // 修改事件
    const editButton = listItem.querySelector('#projectTableBtnEdit-'+String(index))
    editButton.addEventListener('click', () => {
        const data = gmOrderTableMap.get(gmorderdata.ordername)
        const projectTableEditModal =  document.getElementById('projectTableEditModal');
        projectTableEditModal.style.display = 'flex';
        console.debug('点击按钮:',data.ordername);
        projectTableEditModal.querySelector('#editName').value = data.ordername;
        projectTableEditModal.querySelector('#editLevel').value = data.level;
        projectTableEditModal.querySelector('#editDesc').value = data.orderdesc;
        projectTableEditModal.querySelector('#editPath').value = data.path;
        projectTableEditModal.querySelector('#editSelectMethod').value = data.method;
        const editDescriptionWarn = projectTableEditModal.querySelector('#editDescriptionWarn')
        const outputArea = projectTableEditModal.querySelector('#editDescription')
        try {
            // 格式化JSON并显示
            const parsedJSON = JSON.parse(data.orderstruct);
            outputArea.value = JSON.stringify(parsedJSON, null, 2);
            outputArea.style.display = 'block';
            editDescriptionWarn.textContent='';
        } catch (error) {
            // 处理JSON解析错误
            editDescriptionWarn.textContent = '错误：无效的JSON格式\n' + error.message;
            outputArea.value = data.orderstruct;
        }
    });

    // 删除事件
    const delButton = listItem.querySelector('#projectTableBtnDelete-'+String(index))
    delButton.addEventListener('click', function(e) {
        console.log(`按钮在第 ${index + 1} 行`);
        const data = gmOrderTableMap.get(gmorderdata.ordername)
        listItem.remove();
        postDelGmOrder(data.projectid, data.orderid);
    });
    listContainer.appendChild(listItem);
}

// 格式化编辑页面数据
function parseGmJsonEdit(){
    const outputArea =  document.getElementById('editDescription');
    const editDescriptionWarn = document.getElementById('editDescriptionWarn')
    try {
        // 格式化JSON并显示
        const parsedJSON = JSON.parse(outputArea.value);
        outputArea.value = JSON.stringify(parsedJSON, null, 2);
        outputArea.style.display = 'block';
        editDescriptionWarn.textContent='';
    } catch (error) {
        // 处理JSON解析错误
        editDescriptionWarn.textContent = '错误：无效的JSON格式\n' + error.message;
    }
}

// 格式化新增页面数据
function parseGmJsonAdd(){
    const outputArea =  document.getElementById('addDescription');
    const addDescriptionWarn = document.getElementById('addDescriptionWarn')
    try {
        // 格式化JSON并显示
        const parsedJSON = JSON.parse(outputArea.value);
        outputArea.value = JSON.stringify(parsedJSON, null, 2);
        outputArea.style.display = 'block';
        addDescriptionWarn.textContent='';
    } catch (error) {
        // 处理JSON解析错误
        addDescriptionWarn.textContent = '错误：无效的JSON格式\n' + error.message;
    }
}

// 关闭编辑模态框
function closeEditItemModal() {
    document.getElementById('projectTableEditModal').style.display = 'none';
}

// 保存编辑框内容
function saveEditItemModal() {
    // 你的保存逻辑
    console.log('保存数据...');
    const projectTableEditModal = document.getElementById('projectTableEditModal');
    // 关闭当前模态框
    projectTableEditModal.style.display = 'none';
    const editName = projectTableEditModal.querySelector('#editName')
    const editLevel = projectTableEditModal.querySelector('#editLevel');
    const editDesc = projectTableEditModal.querySelector('#editDesc');
    const outputArea = projectTableEditModal.querySelector('#editDescription')
    const editPath = projectTableEditModal.querySelector('#editPath');
    const editMethod = projectTableEditModal.querySelector('#editSelectMethod');
    var modifyGmOrderReq = {
        ProjectId: 1, // 项目id
        "data":{
	        OrderName: editName.value, // 命令名字(不允许重名)
	        Level: Number(editLevel.value),
	        OrderDesc: editDesc.value,
	        OrderStruct: outputArea.value,
            Path: editPath.value,
            Method: editMethod.value,
        }
    }
    modifyGmOrderData(modifyGmOrderReq)
}

// 保存新增的gm命令内容
function saveAddItemModal() {
    // 你的保存逻辑
    console.log('保存数据...');
    const projectTableAddModal = document.getElementById('projectTableAddModal');
    // 关闭当前模态框
    projectTableAddModal.style.display = 'none';
    const addName = projectTableAddModal.querySelector('#addName')
    const outputArea = projectTableAddModal.querySelector('#addDescription');
    const addLevel = projectTableAddModal.querySelector('#addLevel');
    const addDesc = projectTableAddModal.querySelector('#addDesc');
    const addPath = projectTableEditModal.querySelector('#addPath');
    const addMethod = projectTableEditModal.querySelector('#addSelectMethod');
    var addGmOrderReq = {
        ProjectId: 1, // 项目id
	    OrderName: addName.value, // 命令名字(不允许重名)
	    Level: Number(addLevel.value),
	    OrderDesc: addDesc.value,
	    OrderStruct: outputArea.value,
        Path: addPath.value,
        Method: addMethod.value,
    }
    addGmOrderData(addGmOrderReq)
}

// 发送服务器gm修改命令
function modifyGmOrderData(modifyGmOrderReq) {
    fetch('/api/gm_order_modify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(modifyGmOrderReq)
    })
    .then(response => {
      return response.json().then(data => {
        return data;
      });
    })
    .then((data) => {
        console.log('成功修改gm命令:', data);
        const listContainer = document.getElementById('projectTableDataList');
        listContainer.querySelectorAll("#projectTableListItem").forEach((child) => {
            if (child.querySelector('#orderName').textContent == editName.value)
            {
                child.querySelector('#orderLevel').textContent = data.message.data.level;
                child.querySelector('#orderDesc').textContent = data.message.data.orderdesc;
                gmOrderTableMap.set(editName.value, data.message.data);
            }
        });
        alert('修改成功');
      return;
    })
    .catch((error) => {
        console.error('错误:', error);
        alert('修改失败');
    });
}

// 发送服务器添加gm命令
function addGmOrderData(addGmOrderReq) {
    fetch('/api/gm_order_add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(addGmOrderReq)
    })
    .then(response => {
      return response.json().then(data => {
        return data;
      });
    })
    .then((data) => {
      console.log('成功:', data);
      const newBox = document.getElementById('projectTableContainer');
      createTableItem(newBox, data.message.data)
      return;
    })
    .catch((error) => {
      console.error('错误:', error);
    });
}

// 打开添加模态框
function openAddModal() {
    document.getElementById('projectTableAddModal').style.display = 'flex';
}

// 关闭添加模态框
function closeAddModal() {
    document.getElementById('projectTableAddModal').style.display = 'none';
}


// 删除gm命令
function postDelGmOrder(projectId, orderId) {
    var delGmOrderReq = {
        ProjectId: Number(projectId),
        OrderId: Number(orderId),
    }
    fetch('/api/gm_order_del', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(delGmOrderReq)
    })
    .then(response => {
      return response.json().then(data => {
        return data;
      });
    })
    .then((data) => {
      console.log('成功:', data);
      alert('命令删除成功');
      return;
    })
    .catch((error) => {
      console.error('错误:', error);
      alert('执行错误:', error);
    });
}
