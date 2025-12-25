/**
 * API 端点定义
 */
export const Endpoints = {
    // 认证
    LOGIN: '/api/login',
    REGISTER: '/api/register',
    
    // GM 命令
    GM_ORDER_BOX: '/api/gm_order_box',
    GM_ORDER_ADD: '/api/gm_order_add',
    GM_ORDER_DEL: '/api/gm_order_del',
    GM_ORDER_MODIFY: '/api/gm_order_modify',
    GM_ORDER_SEND: '/api/gm_order_send',
    
    // 项目管理
    GM_PROJECT_BOX: '/api/gm_project_box',
    GM_PROJECT_ADD: '/api/gm_project_add',
    GM_PROJECT_DEL: '/api/gm_project_del',
    GM_PROJECT_MODIFY: '/api/gm_project_modify',
    GM_PROJECTS: '/api/gm_projects',
    
    // 用户管理
    GM_USER_MANAGEMENT: '/api/gm_user_mangement',
    GM_USER_ADD: '/api/gm_user_mangement/add',
    GM_USER_DEL: '/api/gm_user_mangement/del',
    GM_USER_MODIFY: '/api/gm_user_mangement/modify',
    
    // 权限管理
    GM_PERMISSION: '/api/gm_permission',
    GM_PERMISSION_ADD: '/api/gm_permission/add',
    GM_PERMISSION_MODIFY: '/api/gm_permission/modify',
    GM_PERMISSION_DEL: '/api/gm_permission/del',
    GM_PERMISSION_GROUP_ADD: '/api/gm_permission/group/add',
    GM_PERMISSION_GROUP_MODIFY: '/api/gm_permission/group/modify',
    GM_PERMISSION_GROUP_DEL: '/api/gm_permission/group/del',
    GM_PERMISSION_ASSIGN_ADD: '/api/gm_permission/assign/add',
    GM_PERMISSION_ASSIGN_DEL: '/api/gm_permission/assign/del',
    
    // 日志
    GM_LOG: '/api/gm_log',
};
