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
        newBox.className = "project-table-container"
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

    // 修改数据模态框
    const projectTableEditModal = newBox.querySelector('#projectTableEditModal');
    projectTableEditModal.addEventListener('submit', function(e) { 
        const editName = projectTableEditModal.querySelector('#editName')
        alert('数据修改成功！', editName.value);
    });
}

function createTableItem(newBox, data){
    const listContainer = newBox.querySelector('#projectTableDataList');
    const index = newBox.querySelectorAll("#project-table-list-item").length;

    const listItem = document.createElement('div');
    listItem.className = 'project-table-list-item';
    listItem.innerHTML = `
        <div class="project-table-item-content">
            <div>
                <strong>${data.ordername}</strong> - ${data.orderdesc} - ${data.lastrunargs}
            </div>
        </div>
        <div class="project-table-item-actions">
            <button class="project-table-btn project-table-btn-edit" onclick="openEditItemModal(${newBox}, ${index})">修改</button>
            <button class="project-table-btn project-table-btn-delete" onclick="deleteItemModel(${newBox}, ${index})">删除</button>
        </div>
    `;
    gmOrderTableMap.set(index, data);
    listContainer.appendChild(listItem);
}

// 打开编辑模态框
function openEditItemModal(newBox, index) {
    // 示例数据
    document.getElementById('projectTableEditModal').style.display = 'flex';
    const projectTableEditModal = newBox.querySelector('#projectTableEditModal');
    projectTableEditModal.style.display = 'flex';
    const itemData = gmOrderTableMap.get(index)
    projectTableEditModal.querySelector('#editName').value = itemData.ordername;
    projectTableEditModal.querySelector('#editDescription').value = itemData.orderdesc;
}

// 关闭编辑模态框
function closeEditItemModal() {
    document.getElementById('projectTableEditModal').style.display = 'none';
}

// 打开添加模态框
function openAddModal() {
    // document.getElementById('addModal').style.display = 'flex';
}

// 关闭添加模态框
function closeAddModal() {
    // document.getElementById('addModal').style.display = 'none';
    // document.getElementById('addForm').reset();
}

// 删除项目
function deleteItem(newBox, index) {
    // 示例数据
    let dataItems = [
        { name: "用户1", role: "前端开发工程师", description: "3年经验" },
        { name: "用户2", role: "UI设计师", description: "擅长响应式设计" },
        { name: "用户3", role: "产品经理", description: "5年互联网经验" }
    ];
    if (confirm("确定要删除这条数据吗？")) {
        dataItems.splice(index, 1);
        // renderList();
    }
}