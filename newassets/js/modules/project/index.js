/**
 * 项目管理模块
 */
import { apiClient } from '../../api/client.js';
import { store } from '../../core/store.js';
import { eventBus, Events } from '../../core/eventBus.js';
import { showToast, modal } from '../../components/toast.js';

/**
 * 项目 Store
 */
export function createProjectStore() {
    const projectStore = {
        state: {
            projects: [],
            currentProject: null,
            userProjects: [],
            loading: false,
            error: null,
        },
        
        /**
         * 获取所有项目（管理员）
         */
        async fetchProjects() {
            this.state.loading = true;
            this.state.error = null;
            
            try {
                const response = await apiClient.getProjects();
                this.state.projects = response.message.datas || [];
                
                store.set('project.projects', this.state.projects);
                eventBus.emit(Events.DATA_LOADED, { type: 'project', data: this.state.projects });
                
                return this.state.projects;
            } catch (error) {
                this.state.error = error.message;
                showToast(error.message || '获取项目失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },
        
        /**
         * 获取用户可用项目
         */
        async fetchUserProjects() {
            this.state.loading = true;
            
            try {
                const response = await apiClient.getUserProjects();
                this.state.userProjects = response.message.datas || [];
                
                store.set('project.userProjects', this.state.userProjects);
                eventBus.emit(Events.DATA_LOADED, { type: 'userProject', data: this.state.userProjects });
                
                return this.state.userProjects;
            } catch (error) {
                showToast(error.message || '获取项目失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },
        
        /**
         * 添加项目
         * @param {Object} projectData 
         */
        async addProject(projectData) {
            this.state.loading = true;
            
            try {
                const response = await apiClient.addProject(projectData);
                const newProject = response.message.data;
                
                this.state.projects.push(newProject);
                store.set('project.projects', this.state.projects);
                
                eventBus.emit(Events.DATA_UPDATED, { type: 'project', action: 'add', data: newProject });
                showToast('添加成功', 'success');
                
                return newProject;
            } catch (error) {
                showToast(error.message || '添加失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },
        
        /**
         * 修改项目
         * @param {Object} projectData 
         */
        async modifyProject(projectData) {
            this.state.loading = true;
            
            try {
                const response = await apiClient.modifyProject(projectData);
                const updatedProject = response;
                
                const index = this.state.projects.findIndex(p => p.projectid === updatedProject.projectid);
                if (index !== -1) {
                    this.state.projects[index] = updatedProject;
                }
                
                store.set('project.projects', this.state.projects);
                
                eventBus.emit(Events.DATA_UPDATED, { type: 'project', action: 'modify', data: updatedProject });
                showToast('修改成功', 'success');
                
                return updatedProject;
            } catch (error) {
                showToast(error.message || '修改失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },
        
        /**
         * 删除项目
         * @param {number} projectId 
         */
        async deleteProject(projectId) {
            this.state.loading = true;
            
            try {
                await apiClient.delProject(projectId);
                
                this.state.projects = this.state.projects.filter(p => p.projectid !== projectId);
                store.set('project.projects', this.state.projects);
                
                eventBus.emit(Events.DATA_DELETED, { type: 'project', id: projectId });
                showToast('删除成功', 'success');
            } catch (error) {
                showToast(error.message || '删除失败', 'error');
                throw error;
            } finally {
                this.state.loading = false;
            }
        },
        
        /**
         * 获取项目列表
         * @param {boolean} adminOnly 是否仅管理员项目
         */
        getProjects(adminOnly = false) {
            return adminOnly ? this.state.projects : (this.state.userProjects.length > 0 ? this.state.userProjects : this.state.projects);
        },
        
        /**
         * 设置当前项目
         * @param {Object} project 
         */
        setCurrentProject(project) {
            this.state.currentProject = project;
            store.set('project.currentProject', project);
        },
        
        /**
         * 清空状态
         */
        clear() {
            this.state.projects = [];
            this.state.userProjects = [];
            this.state.currentProject = null;
            store.set('project.projects', []);
            store.set('project.userProjects', []);
            store.set('project.currentProject', null);
        },
    };
    
    return projectStore;
}

// 导出默认实例
export const projectStore = createProjectStore();
