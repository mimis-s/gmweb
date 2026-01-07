// 读取数据

import {apiClient} from "../../api/client.js";
import {showToast} from "../../components/toast.js";
// 导入业务模块
import {loadHtml} from "../../api/client.js";
import {gmOrderBoxClass} from "../gm_order_box/box.js";
import {permissionClass} from "../gm_permission/permission.js";
import {gmLogClass} from "../gm_log/log.js";
import {userMangeClass} from "../gm_user_mangement/mangement.js";
import {gmProjectBoxClass} from "../gm_project_box/box.js";
export function createTabHomeSelectClass() {
    return {
        async loadGmOrderProjectBriefModule(tabProject) {
            try {
                const response = await apiClient.getUserProjects();
                while (tabProject.firstChild) {
                    tabProject.removeChild(tabProject.firstChild);
                }
                response.message.datas.forEach(briefData => {
                    const projectBriefBox = document.createElement("li");
                    projectBriefBox.className = "submenu-item";
                    projectBriefBox.innerHTML = `<a class="nav-link" data-content="sales" id="projectBriefBoxBtn"><span class="nav-text">${briefData.name}</span></a>`
                    const projectBriefBoxBtn = projectBriefBox.querySelector('#projectBriefBoxBtn')
                    projectBriefBoxBtn.addEventListener('click', () => {
                        this.loadGmOrderModule(briefData.projectid);
                    });
                    tabProject.appendChild(projectBriefBox);
                });

                tabProject.classList.toggle('show');
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
        },

        async loadGmOrderModule(projectId) {
            try {
                const html = await loadHtml.gmOrderBox();
                const defaultContent = document.querySelector('.default-content');
                const dynamicContent = document.getElementById('dynamicContent');

                defaultContent.style.display = 'none';
                dynamicContent.style.display = 'block';
                dynamicContent.innerHTML = html;
                await gmOrderBoxClass.loadGmOrderBoxEvent(dynamicContent, projectId); // box里面所有order的数据

                // 添加进入动画
                dynamicContent.style.animation = 'fadeInUp 0.5s ease';

            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
        },

        async loadGmProjectModule() {
            try {
                const html = await loadHtml.gmProjectBox();
                const defaultContent = document.querySelector('.default-content');
                const dynamicContent = document.getElementById('dynamicContent');

                defaultContent.style.display = 'none';
                dynamicContent.style.display = 'block';            // newBox.innerHTML = html;
                dynamicContent.innerHTML = html;
                await gmProjectBoxClass.loadGmProjectBoxEvent(dynamicContent);
                // 添加进入动画
                dynamicContent.style.animation = 'fadeInUp 0.5s ease';
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
        },

        async loadUserMangementModule() {
            try {
                const html = await loadHtml.gmUserManagement();
                const defaultContent = document.querySelector('.default-content');
                const dynamicContent = document.getElementById('dynamicContent');

                defaultContent.style.display = 'none';
                dynamicContent.style.display = 'block';            // newBox.innerHTML = html;
                dynamicContent.innerHTML = html;
               await userMangeClass.loadUsersBoxEvent(dynamicContent); // box里面所有order的数据
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
        },


        async loadPermissionModule() {
            try {
                const html = await loadHtml.gmPermission();
                const defaultContent = document.querySelector('.default-content');
                const dynamicContent = document.getElementById('dynamicContent');

                defaultContent.style.display = 'none';
                dynamicContent.style.display = 'block';            // newBox.innerHTML = html;

                dynamicContent.innerHTML = html;
                await permissionClass.initPermissionBox(dynamicContent);
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
        },

        async loadGmLogModule() {
            try {
                const html = await loadHtml.gmLog();
                const defaultContent = document.querySelector('.default-content');
                const dynamicContent = document.getElementById('dynamicContent');

                defaultContent.style.display = 'none';
                dynamicContent.style.display = 'block';
                dynamicContent.innerHTML = html;
                await gmLogClass.initLogBox()
                // 添加进入动画
                dynamicContent.style.animation = 'fadeInUp 0.5s ease';
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
        },
    };
}

export const tabHomeSelectClass = createTabHomeSelectClass();
