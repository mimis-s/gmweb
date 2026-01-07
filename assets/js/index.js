import {tabHomeSelectClass} from './modules/gm_tab_home/select.js';

// DOM元素

const leftNav = document.getElementById('leftNav');
const collapseBtn = document.getElementById('collapseBtn');
const navMenu = document.querySelector('.nav-menu');
const contentDisplay = document.getElementById('contentDisplay');
const dynamicContent = document.getElementById('dynamicContent');
const defaultContent = document.querySelector('.default-content');
const addTabBtn = document.getElementById('addTabBtn');
const removeTabBtn = document.getElementById('removeTabBtn');
const resetTabsBtn = document.getElementById('resetTabsBtn');

// 跟踪动态添加的标签
let dynamicTabs = [];
let dynamicTabCounter = 0;

// 最小化实现 - 只有核心功能
(function() {
    'use strict';

    const container = document.createElement('div');
    container.className = 'toast-container-mini';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 300px;
    `;
    document.body.appendChild(container);

    window.showToast = function(message, type = 'info', duration = 2000) {
        const toast = document.createElement('div');
        toast.className = `toast-mini ${type}`;
        toast.style.cssText = `
            background: white;
            padding: 12px 16px;
            margin-bottom: 8px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s ease;
            border-left: 4px solid ${type === 'success' ? '#52c41a' :
            type === 'error' ? '#ff4d4f' :
                type === 'warning' ? '#faad14' : '#1890ff'};
        `;
        toast.textContent = message;
        container.insertBefore(toast, container.firstChild);

        // 显示
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        }, 10);

        // 移动其他提示框
        Array.from(container.children).forEach((child, i) => {
            child.style.top = `${i * 58}px`;
        });

        // 自动移除
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    };
})();

// 初始化导航菜单
function initializeNav() {
    // 导航项的点击事件
    // gm操作点击事件
    const navLinkGmOperation = document.getElementById('navLinkGmOperation');
    navLinkGmOperation.addEventListener('click', function() {
        onGmOperationclick(navLinkGmOperation);
    });

    // 项目管理
    const navLinkGmProject = document.getElementById('navLinkGmProject');
    navLinkGmProject.addEventListener('click', function() {
        tabHomeSelectClass.loadGmProjectModule();
    });

    // 用户管理
    const navLinkUsers = document.getElementById('navLinkUsers');
    navLinkUsers.addEventListener('click', function() {
        tabHomeSelectClass.loadUserMangementModule();
    });

    // 权限管理
    const navLinkPermission = document.getElementById('navLinkPermission');
    navLinkPermission.addEventListener('click', function() {
        tabHomeSelectClass.loadPermissionModule();
    });
    // 日志管理
    const navLinkLog = document.getElementById('navLinkLog');
    navLinkLog.addEventListener('click', function() {
        tabHomeSelectClass.loadGmLogModule();
    });
    window.showToast("在线")
}

// 点击gm操作页面
function onGmOperationclick(navLinkGmOperation) {
    const navLinks = document.querySelectorAll('.nav-link');
    // e.preventDefault();
    // 处理子菜单展开/折叠
    const parentItem = navLinkGmOperation.closest('.has-submenu');
    if (parentItem) {
        // 如果点击的是有子菜单的项
        if (!navLinkGmOperation.getAttribute('data-content')) {
            parentItem.classList.toggle('open');
            const submenu = parentItem.querySelector('.submenu');
            tabHomeSelectClass.loadGmOrderProjectBriefModule(submenu);
            return;
        }
    }
    // 设置活动状态
    navLinks.forEach(l => l.classList.remove('active'));
    navLinkGmOperation.classList.add('active');

    // 显示对应内容
    const contentId = navLinkGmOperation.getAttribute('data-content');
    if (contentId) {
        showDynamicContent(contentId);
    }
}

// 显示动态内容
function showDynamicContent(contentId) {
    // 隐藏默认内容，显示动态内容
    defaultContent.style.display = 'none';
    dynamicContent.style.display = 'block';

    // 更新内容
    dynamicContent.innerHTML = `
        <div class="content-header">
            <h1 class="content-title">${data.title}</h1>
            <p class="content-subtitle">${data.subtitle}</p>
        </div>
        <div class="content-body">
            ${data.content}
        </div>
        ${data.features ? `
        <div class="features">
            ${data.features.map(feature => `
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas ${feature.icon}"></i>
                    </div>
                    <h3 class="feature-title">${feature.title}</h3>
                    <p>${feature.desc}</p>
                </div>
            `).join('')}
        </div>
        ` : ''}
    `;

    // 更新样式
    contentDisplay.style.backgroundColor = data.bgColor;
    contentDisplay.style.borderColor = data.borderColor;
    contentDisplay.style.borderStyle = 'solid';
    contentDisplay.classList.add('active');

    // 添加进入动画
    dynamicContent.style.animation = 'fadeInUp 0.5s ease';
}

// 显示默认内容
function showDefaultContent() {
    defaultContent.style.display = 'block';
    dynamicContent.style.display = 'none';

    // 重置样式
    contentDisplay.style.backgroundColor = 'var(--white)';
    contentDisplay.style.borderColor = 'var(--border-color)';
    contentDisplay.style.borderStyle = 'dashed';
    contentDisplay.classList.remove('active');
}

// 切换导航栏折叠状态
collapseBtn.addEventListener('click', function() {
    leftNav.classList.toggle('nav-collapsed');

    // 在移动设备上使用不同的切换逻辑
    if (window.innerWidth <= 1024) {
        leftNav.classList.toggle('nav-expanded');
    }

    // 更新折叠按钮图标
    const icon = this.querySelector('i');
    if (leftNav.classList.contains('nav-collapsed')) {
        icon.className = 'fas fa-chevron-right';
        // 添加旋转动画
        this.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            this.style.transform = 'rotate(0deg)';
        }, 300);
    } else {
        icon.className = 'fas fa-chevron-left';
        // 添加旋转动画
        this.style.transform = 'rotate(-180deg)';
        setTimeout(() => {
            this.style.transform = 'rotate(0deg)';
        }, 300);
    }
});

// 初始化
initializeNav();

// 添加导航栏悬停效果
leftNav.addEventListener('mouseenter', function() {
    if (window.innerWidth > 1024 && this.classList.contains('nav-collapsed')) {
        this.style.boxShadow = 'var(--shadow-lg)';
        this.style.transform = 'translateX(0) scale(1.02)';
    }
});

leftNav.addEventListener('mouseleave', function() {
    if (window.innerWidth > 1024 && this.classList.contains('nav-collapsed')) {
        this.style.boxShadow = 'var(--shadow-md)';
        this.style.transform = 'translateX(0) scale(1)';
    }
});