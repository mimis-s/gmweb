// 读取数据

import {apiClient} from "../../api/client.js";
import {showToast} from "../../components/toast.js";
import {loadHtml} from "../../api/client.js";

class GmOrderCardClass {
    constructor() {
        this.gmOrderTableMap = new Map();// 表行index对应数据
        this.editGmTableIndex = 0;// 正在编辑的gm命令表格index
    }

    // 加载gm命令表
    async loadGmOrderTable(gridWrapper, gmOrderData) {
        this.gmOrderTableMap.clear();
        while (gridWrapper.firstChild) {
            gridWrapper.removeChild(gridWrapper.firstChild);
        }
        try {
            const html = await loadHtml.gmOrderTable();
            const newBox = document.createElement('div');
            newBox.className = "project-table-container";
            newBox.id = "projectTableContainer";
            newBox.innerHTML = html;
            gridWrapper.appendChild(newBox);
            // 卡片事件
            await this.initGmRederTableDatagmOrderData(newBox, gmOrderData);
        } catch (error) {
            showToast(error.message || '获取 GM 命令失败', 'error');
            throw error;
        }
    }

    // 填写数据
    async initGmRederTableDatagmOrderData(newBox, gmOrderData) {
        // 将后端返回的大写字段名转换为前端期望的小写格式
        const projectData = {
            projectid: gmOrderData.projectid || gmOrderData.ProjectId,
            datas: gmOrderData.datas,
        };

        if (projectData.datas != null) {
            projectData.datas.forEach(data => {
                this.createTableItem(newBox, projectData.projectid, data);
            });
        }

        const projectTableAddModal = newBox.querySelector('#projectTableAddModal')
        // 为"添加新数据"按钮添加事件监听器
        const addButton = newBox.querySelector('#projectTableAddDataBtn');
        addButton.addEventListener('click', () => {
            this.openAddOrderTableModal(projectData.projectid, projectTableAddModal);
        });
        const projectTableDataCloseBottomBtn = newBox.querySelector('#projectTableDataCloseBottomBtn')
        projectTableDataCloseBottomBtn.addEventListener('click', () => {
            this.closeAddOrderTableModal(projectTableAddModal);
        });
        const projectTableDataCloseTopBtn = newBox.querySelector('#projectTableDataCloseTopBtn')
        projectTableDataCloseTopBtn.addEventListener('click', () => {
            this.closeAddOrderTableModal(projectTableAddModal);
        });
        const projectTableDataSaveBtn = newBox.querySelector('#projectTableDataSaveBtn')
        projectTableDataSaveBtn.addEventListener('click', () => {
            this.saveAddItemModal(newBox, projectTableAddModal);
        });

        // 编辑框
        const projectTableEditModalCloseBtn = newBox.querySelector('#projectTableEditModalCloseBtn')
        projectTableEditModalCloseBtn.addEventListener('click', () => {
            this.closeEditItemModal();
        });
        const projectTableEditModalCloseBtn2 = newBox.querySelector('#projectTableEditModalCloseBtn2')
        projectTableEditModalCloseBtn2.addEventListener('click', () => {
            this.closeEditItemModal();
        });
        const projectTableEditModalSaveBtn = newBox.querySelector('#projectTableEditModalSaveBtn')
        projectTableEditModalSaveBtn.addEventListener('click', () => {
            this.saveEditItemModal();
        });

        // 格式化按钮
        const projectTableEditModalParseGmJsonBtn = newBox.querySelector('#projectTableEditModalParseGmJsonBtn')
        projectTableEditModalParseGmJsonBtn.addEventListener('click', () => {
            this.parseGmJsonEdit();
        });
        const projectTableAddModalParseGmJsonBtn = newBox.querySelector('#projectTableAddModalParseGmJsonBtn')
        projectTableAddModalParseGmJsonBtn.addEventListener('click', () => {
            this.parseGmJsonEdit();
        });
    }

    async createTableItem(newBox, projectId, gmorderdata) {
        const listContainer = newBox.querySelector('#projectTableDataList');
        const index = listContainer.querySelectorAll("#projectTableListItem").length;
        this.gmOrderTableMap.set(gmorderdata.orderid, gmorderdata);

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
        const editButton = listItem.querySelector('#projectTableBtnEdit-' + String(index))
        editButton.addEventListener('click', () => {
            const data = this.gmOrderTableMap.get(gmorderdata.orderid)
            const projectTableEditModal = document.getElementById('projectTableEditModal');
            projectTableEditModal.style.display = 'flex';
            projectTableEditModal.value = data.orderid;
            projectTableEditModal.querySelector('#projectTableEditModalTitle').value = projectId;
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
                editDescriptionWarn.textContent = '';
            } catch (error) {
                // 处理JSON解析错误
                editDescriptionWarn.textContent = '错误：无效的JSON格式\n' + error.message;
                outputArea.value = data.orderstruct;
            }
        });

        const self = this

        // 删除事件
        const delButton = listItem.querySelector('#projectTableBtnDelete-' + String(index))
        delButton.addEventListener('click', function (e) {
            console.log(`按钮在第 ${index + 1} 行`);
            const data = self.gmOrderTableMap.get(gmorderdata.orderid);
            listItem.remove();
            self.postDelGmOrder(data.projectid, data.orderid);
        });
        listContainer.appendChild(listItem);
    }

// 格式化编辑页面数据
    async parseGmJsonEdit() {
        const outputArea = document.getElementById('editDescription');
        const editDescriptionWarn = document.getElementById('editDescriptionWarn')
        try {
            // 格式化JSON并显示
            const parsedJSON = JSON.parse(outputArea.value);
            outputArea.value = JSON.stringify(parsedJSON, null, 2);
            outputArea.style.display = 'block';
            editDescriptionWarn.textContent = '';
        } catch (error) {
            // 处理JSON解析错误
            editDescriptionWarn.textContent = '错误：无效的JSON格式\n' + error.message;
            window.showToast(editDescriptionWarn.textContent, "error");
        }
    }

// 格式化新增页面数据
    async parseGmJsonAdd() {
        const outputArea = document.getElementById('addDescription');
        const addDescriptionWarn = document.getElementById('addDescriptionWarn')
        try {
            // 格式化JSON并显示
            const parsedJSON = JSON.parse(outputArea.value);
            outputArea.value = JSON.stringify(parsedJSON, null, 2);
            outputArea.style.display = 'block';
            addDescriptionWarn.textContent = '';
        } catch (error) {
            // 处理JSON解析错误
            addDescriptionWarn.textContent = '错误：无效的JSON格式\n' + error.message;
            window.showToast(addDescriptionWarn.textContent, "error");
        }
    }

// 关闭编辑模态框
    async closeEditItemModal() {
        document.getElementById('projectTableEditModal').style.display = 'none';
    }

// 保存编辑框内容
    async saveEditItemModal() {
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
        const projectId = projectTableEditModal.querySelector('#projectTableEditModalTitle').value;

        const modifyGmOrderReq = {
            ProjectId: Number(projectId), // 项目id
            "data": {
                OrderId: projectTableEditModal.value,
                OrderName: editName.value, // 命令名字(不允许重名)
                Level: Number(editLevel.value),
                OrderDesc: editDesc.value,
                OrderStruct: outputArea.value,
                Path: editPath.value,
                Method: editMethod.value,
            }
        }
        await this.modifyGmOrderData(modifyGmOrderReq)
    }

// 保存新增的gm命令内容
    async saveAddItemModal(newBox, projectTableAddModal) {
        // 你的保存逻辑
        // 关闭当前模态框
        projectTableAddModal.style.display = 'none';
        const addName = projectTableAddModal.querySelector('#addName')
        const outputArea = projectTableAddModal.querySelector('#addDescription');
        const addLevel = projectTableAddModal.querySelector('#addLevel');
        const addDesc = projectTableAddModal.querySelector('#addDesc');
        const addPath = projectTableAddModal.querySelector('#addPath');
        const addMethod = projectTableAddModal.querySelector('#addSelectMethod');
        const projectId = projectTableAddModal.querySelector('#projectTableAddModalTitle').value;
        const addGmOrderReq = {
            ProjectId: Number(projectId), // 项目id
            OrderName: addName.value, // 命令名字(不允许重名)
            Level: Number(addLevel.value),
            OrderDesc: addDesc.value,
            OrderStruct: outputArea.value,
            Path: addPath.value,
            Method: addMethod.value,
        }
        await this.addGmOrderData(newBox, addGmOrderReq)
    }

// 发送服务器gm修改命令
    async modifyGmOrderData(modifyGmOrderReq) {
        try {
            const response = await apiClient.modifyGmOrder(modifyGmOrderReq);
            const listContainer = document.getElementById('projectTableDataList');
            listContainer.querySelectorAll("#projectTableListItem").forEach((child) => {
                if (child.querySelector('#orderName').textContent === response.message.data.ordername) {
                    child.querySelector('#orderLevel').textContent = response.message.data.level;
                    child.querySelector('#orderDesc').textContent = response.message.data.orderdesc;
                    this.gmOrderTableMap.set(response.message.data.orderid, response.message.data);
                }
            });
        } catch (error) {
            showToast(error.message || '获取 GM 命令失败', 'error');
            throw error;
        }
    }

    // 发送服务器添加gm命令
    async addGmOrderData(newBox, addGmOrderReq) {
        try {
            const response = await apiClient.addGmOrder(addGmOrderReq);
            await this.createTableItem(newBox, response.projectid, response.message.data)
        } catch (error) {
            showToast(error.message || '获取 GM 命令失败', 'error');
            throw error;
        }
    }

// 打开添加模态框
    async openAddOrderTableModal(projectId, projectTableAddModal) {
        projectTableAddModal.querySelector('#projectTableAddModalTitle').value = projectId;
        projectTableAddModal.style.display = 'flex';
    }

// 关闭添加模态框
    async closeAddOrderTableModal(projectTableAddModal) {
        projectTableAddModal.style.display = 'none';
    }


// 删除gm命令
    async postDelGmOrder(projectId, orderId) {
        try {
            const response = await apiClient.delGmOrder(Number(projectId),Number(orderId));
        } catch (error) {
            showToast(error.message || '获取 GM 命令失败', 'error');
            throw error;
        }
    }
}

export const gmOrderCardClass = new GmOrderCardClass();
