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
    gmOrderTableMap.set(data.ordername, data);

    const listItem = document.createElement('div');
    listItem.className = 'project-table-list-item';
    listItem.id = 'projectTableListItem';
    listItem.innerHTML = `
        <div class="project-table-item-content">
            <div>
                <strong id="orderName">${data.ordername}</strong> - <strong>${data.orderdesc}</strong> - <strong id="orderStruct">${data.orderstruct}</strong>
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
        console.debug('点击按钮:',data.ordername)
        projectTableEditModal.querySelector('#editName').value = data.ordername;
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
        }
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

function parseGmJson(){
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
    const outputArea = projectTableEditModal.querySelector('#editDescription')

    const listContainer = document.getElementById('projectTableDataList');
    listContainer.querySelectorAll("#projectTableListItem").forEach((child) => {
        console.log('保存数据...', child.querySelector('#orderName').textContent, editName.value);
        if (child.querySelector('#orderName').textContent == editName.value)
        {
            child.querySelector('#orderStruct').textContent = outputArea.value;
            gmOrderTableMap.get(editName.value).orderstruct = outputArea.value;
        }
    });
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
