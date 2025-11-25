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
}

function createTableItem(newBox, data){
    const listContainer = newBox.querySelector('#projectTableDataList');
    const index = listContainer.querySelectorAll("#projectTableListItem").length;
    // gmOrderTableMap.set(index, data);

    const listItem = document.createElement('div');
    listItem.className = 'project-table-list-item';
    listItem.id = 'projectTableListItem';
    listItem.innerHTML = `
        <div class="project-table-item-content">
            <div>
                <strong>${data.ordername}</strong> - ${data.orderdesc} - ${data.lastrunargs}
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
        const projectTableEditModal =  document.getElementById('projectTableEditModal');
        projectTableEditModal.style.display = 'flex';
        projectTableEditModal.querySelector('#editName').value = data.ordername;
        projectTableEditModal.querySelector('#editDescription').value = data.orderstruct;
    });

    // 删除事件
    const delButton = listItem.querySelector('#projectTableBtnDelete-'+String(index))
    delButton.addEventListener('click', function(e) {
        console.log(`按钮在第 ${index + 1} 行`);
        listItem.remove();
        postDelGmOrder(data.projectid, data.orderid);
    });
    listContainer.appendChild(listItem);
}

// // 打开编辑模态框
// function openEditItemModal() {

//     // 找到当前打开的是第几行的数据
//     const listContainer = document.getElementById('projectTableDataList');
//     buttons = Array.from(document.querySelectorAll('#projectTableListItem'));

//     // 示例数据
//     const projectTableEditModal =  document.getElementById('projectTableEditModal');
//     projectTableEditModal.style.display = 'flex';
//     const itemData = gmOrderTableMap.get(index);
//     console.log(gmOrderTableMap.get(0))
//     console.log(gmOrderTableMap)
//     projectTableEditModal.querySelector('#editName').value = itemData.ordername;
//     projectTableEditModal.querySelector('#editDescription').value = itemData.orderdesc;
// }

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
    alert('数据修改成功！', editName.value);
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
