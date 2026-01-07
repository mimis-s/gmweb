// 读取数据

import {apiClient} from "../../api/client.js";
import {showToast} from "../../components/toast.js";

// 导入业务模块
import {gmProjectCardClass} from '../gm_project_card/card.js';
export function createGmProjectBoxClass() {
    return {
        async loadGmProjectBoxEvent(gmProjectBox) {
            try {
                const response = await apiClient.getProjects();
                await this.gmProjectBoxEvent(gmProjectBox, response.message);    // 初始化所有卡片
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
            const projectAddModalCloseBtn = gmProjectBox.querySelector('#projectAddModalCloseBtn')
            projectAddModalCloseBtn.addEventListener('click', () => {
                this.closeAddProjectModal();
            });
            const projectAddModalCloseBtn2 = gmProjectBox.querySelector('#projectAddModalCloseBtn2')
            projectAddModalCloseBtn2.addEventListener('click', () => {
                this.closeAddProjectModal();
            });
            const projectAddModalSaveBtn = gmProjectBox.querySelector('#projectAddModalSaveBtn')
            projectAddModalSaveBtn.addEventListener('click', () => {
                this.saveAddProjectModal();
            });

        },

        async closeAddProjectModal() {
            document.getElementById('projectAddModal').style.display = 'none';
        },

        async saveAddProjectModal() {
            const projectAddModal = document.getElementById('projectAddModal');
            const addName = projectAddModal.querySelector('#addName')
            const addDesc = projectAddModal.querySelector('#addDesc')
            const editIPPath = projectAddModal.querySelector('#editIPPath')

            const addGmProjectReq = {
                Name: addName.value,
                Desc: addDesc.value,
                GmAddr: editIPPath.value,
            }
            try {
                const response = await apiClient.addProject(addGmProjectReq);
                document.getElementById('projectAddModal').style.display = 'none';
                const gmProjectCardContainer = document.getElementById('gmProjectCardContainer');
                await gmProjectCardClass.loadGmProjectCard(gmProjectCardContainer, response.message.data);
                window.showToast("成功添加项目");
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
        },

        async gmProjectBoxEvent(gmProjectBox, projectDatas) {
            const gmProjectCardContainer = gmProjectBox.querySelector('#gmProjectCardContainer');

            if (projectDatas.datas != null) {
                projectDatas.datas.forEach(data => {
                    gmProjectCardClass.loadGmProjectCard(gmProjectCardContainer, data);
                });
            }
            const projectAddModal = document.getElementById('projectAddModal');
            const gmProjectBoxAddBtn = gmProjectBox.querySelector('#gmProjectBoxAddBtn');

            // 打开模态框
            if (gmProjectBoxAddBtn) {
                gmProjectBoxAddBtn.addEventListener('click', () => {
                    if (projectAddModal) {
                        projectAddModal.style.display = 'flex';
                        console.debug("打开模态框");
                    }
                });
            }

            // 点击模态框外部关闭
            if (projectAddModal) {
                projectAddModal.addEventListener('click', (e) => {
                    if (e.target === projectAddModal) {
                        projectAddModal.style.display = 'none';
                    }
                });
            }
        },
    };
}

export const gmProjectBoxClass = createGmProjectBoxClass();
