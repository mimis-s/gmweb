// 读取数据

import {apiClient} from "../../api/client.js";
import {showToast} from "../../components/toast.js";
import {loadHtml} from "../../api/client.js";
import {gmOrderCardClass} from "../gm_order_table/table.js";

export function createGmProjectCardClass() {
    return {
// 读取card页面
        async loadGmProjectCard(gridWrapper, gmOrderData) {
            try {
                const html = await loadHtml.gmProjectCard();
                const newBox = document.createElement('div');
                newBox.className = "gm_card_layout"
                newBox.innerHTML = html;
                gridWrapper.appendChild(newBox);
                await this.gmProjectCardEvent(gridWrapper, gmOrderData, newBox); // 卡片事件
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
        },

        async gmProjectCardEvent(gridWrapper, gmOrderData, newBox) {
            const projectCard = newBox.querySelector('#projectCard');
            const projectTitle = newBox.querySelector('#projectTitle');
            const projectCardImage = newBox.querySelector('#projectCardImage');
            projectTitle.textContent = gmOrderData.name;
            projectCardImage.textContent = gmOrderData.name.substring(0, 2);

            projectCard.value = gmOrderData.projectid;

            const projectCardBtn = newBox.querySelector('#projectCardBtn');
            const modalOverlay = newBox.querySelector('#modalOverlay');
            const closeBtn = newBox.querySelector('#closeBtn');
            const modalJsonArgs = newBox.querySelector('#modalJsonArgs'); // 表格存放区域

            const projectCardCloseBtn = newBox.querySelector('#projectCardCloseBtn');

            const projectEditModal = newBox.querySelector('#projectEditModal');
            const projectCardEditBtn = newBox.querySelector('#projectCardEditBtn');
            const projectEditModalCloseBtn = newBox.querySelector('#projectEditModalCloseBtn');
            const projectEditModalCloseBtn2 = newBox.querySelector('#projectEditModalCloseBtn2');
            const projectEditModalSaveBtn = newBox.querySelector('#projectEditModalSaveBtn');

            // 详情模态框
            projectCardBtn.addEventListener('click', () => {
                modalOverlay.classList.add('active');
                console.debug("命令详情模态框", gmOrderData);
                gmOrderCardClass.loadGmOrderTable(modalJsonArgs, gmOrderData);
            });
            closeBtn.addEventListener('click', () => {
                modalOverlay.classList.remove('active');
            });
            modalOverlay.addEventListener('click', (e) => {// 点击模态框外部关闭
                if (e.target === modalOverlay) {
                    modalOverlay.classList.remove('active');
                }
            });

            // 修改模态框
            projectCardEditBtn.addEventListener('click', () => {
                console.debug("修改模态框", gmOrderData);
                projectEditModal.style.display = 'flex';
                projectEditModal.querySelector('#editName').value = gmOrderData.name;
                projectEditModal.querySelector('#editDesc').value = gmOrderData.desc;
                projectEditModal.querySelector('#editIPPath').value = gmOrderData.gmaddr;
            });
            // 保存数据
            projectEditModalSaveBtn.addEventListener('click', () => {
                this.saveEditProjectModal(gmOrderData, projectEditModal, newBox)
            });
            // 关闭模态框
            projectEditModalCloseBtn.addEventListener('click', () => {
                projectEditModal.style.display = 'none';
            });
            // 关闭模态框
            projectEditModalCloseBtn2.addEventListener('click', () => {
                projectEditModal.style.display = 'none';
            });

            // 点击模态框外部关闭
            projectEditModal.addEventListener('click', (e) => {
                if (e.target === projectEditModal) {
                    projectEditModal.style.display = 'none';
                }
            });
            // 删除card/项目(包括项目里面的所有数据)
            projectCardCloseBtn.addEventListener('click', () => {
                this.delEditProjectModal(Number(projectCard.value), newBox, gridWrapper)
            });
        },

        async saveEditProjectModal(gmOrderData, projectEditModal, newBox) {
            const editProjectDataReq = {
                ProjectId: Number(gmOrderData.projectid),
                Name: projectEditModal.querySelector('#editName').value,
                Desc: projectEditModal.querySelector('#editDesc').value,
                GmAddr: projectEditModal.querySelector('#editIPPath').value,
            }
            try {
                const response = await apiClient.modifyProject(editProjectDataReq);
                const projectTitle = newBox.querySelector('#projectTitle');
                const projectCardImage = newBox.querySelector('#projectCardImage');
                projectTitle.textContent = response.message.name;
                projectCardImage.textContent = response.message.name.substring(0, 2);

                gmOrderData.name = response.message.name;
                gmOrderData.desc = response.message.desc;
                gmOrderData.gmaddr = response.message.gmaddr;
                projectEditModal.style.display = 'none';
                window.showToast("修改项目成功");
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
        },

        async delEditProjectModal(projectId, newBox, gridWrapper) {
            try {
                const response = await apiClient.delProject(projectId);
                gridWrapper.removeChild(newBox);
                window.showToast("删除项目成功");
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
        },
    };
}

export const gmProjectCardClass = createGmProjectCardClass();
