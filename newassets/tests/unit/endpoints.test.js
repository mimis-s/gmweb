/**
 * API 端点测试
 */
import { describe, it, expect } from 'vitest';
import { Endpoints } from '../js/api/endpoints.js';

describe('API Endpoints', () => {
    describe('认证接口', () => {
        it('应该包含登录端点', () => {
            expect(Endpoints.LOGIN).toBe('/api/login');
        });
        
        it('应该包含注册端点', () => {
            expect(Endpoints.REGISTER).toBe('/api/register');
        });
    });
    
    describe('GM 命令接口', () => {
        it('应该包含 GM 命令列表端点', () => {
            expect(Endpoints.GM_ORDER_BOX).toBe('/api/gm_order_box');
        });
        
        it('应该包含添加 GM 命令端点', () => {
            expect(Endpoints.GM_ORDER_ADD).toBe('/api/gm_order_add');
        });
        
        it('应该包含删除 GM 命令端点', () => {
            expect(Endpoints.GM_ORDER_DEL).toBe('/api/gm_order_del');
        });
        
        it('应该包含修改 GM 命令端点', () => {
            expect(Endpoints.GM_ORDER_MODIFY).toBe('/api/gm_order_modify');
        });
        
        it('应该包含发送 GM 命令端点', () => {
            expect(Endpoints.GM_ORDER_SEND).toBe('/api/gm_order_send');
        });
    });
    
    describe('项目管理接口', () => {
        it('应该包含项目列表端点', () => {
            expect(Endpoints.GM_PROJECT_BOX).toBe('/api/gm_project_box');
        });
        
        it('应该包含添加项目端点', () => {
            expect(Endpoints.GM_PROJECT_ADD).toBe('/api/gm_project_add');
        });
        
        it('应该包含删除项目端点', () => {
            expect(Endpoints.GM_PROJECT_DEL).toBe('/api/gm_project_del');
        });
        
        it('应该包含用户项目端点', () => {
            expect(Endpoints.GM_PROJECTS).toBe('/api/gm_projects');
        });
    });
    
    describe('用户管理接口', () => {
        it('应该包含用户列表端点', () => {
            expect(Endpoints.GM_USER_MANAGEMENT).toBe('/api/gm_user_mangement');
        });
        
        it('应该包含添加用户端点', () => {
            expect(Endpoints.GM_USER_ADD).toBe('/api/gm_user_mangement/add');
        });
        
        it('应该包含删除用户端点', () => {
            expect(Endpoints.GM_USER_DEL).toBe('/api/gm_user_mangement/del');
        });
        
        it('应该包含修改用户端点', () => {
            expect(Endpoints.GM_USER_MODIFY).toBe('/api/gm_user_mangement/modify');
        });
    });
    
    describe('权限管理接口', () => {
        it('应该包含权限端点', () => {
            expect(Endpoints.GM_PERMISSION).toBe('/api/gm_permission');
        });
        
        it('应该包含权限组端点', () => {
            expect(Endpoints.GM_PERMISSION_GROUP_ADD).toBe('/api/gm_permission/group/add');
        });
        
        it('应该包含权限分配端点', () => {
            expect(Endpoints.GM_PERMISSION_ASSIGN_ADD).toBe('/api/gm_permission/assign/add');
        });
    });
    
    describe('日志接口', () => {
        it('应该包含日志端点', () => {
            expect(Endpoints.GM_LOG).toBe('/api/gm_log');
        });
    });
});
