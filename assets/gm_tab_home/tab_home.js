
// 导航数据和内容数据
const navData = [
    { id: 'dashboard', text: '仪表板', icon: 'fa-home', type: 'main' },
    { id: 'sales', text: '销售分析', icon: 'fa-chart-bar', type: 'sub', parent: '数据分析' },
    { id: 'traffic', text: '流量统计', icon: 'fa-chart-pie', type: 'sub', parent: '数据分析' },
    { id: 'revenue', text: '收入报告', icon: 'fa-dollar-sign', type: 'sub', parent: '数据分析' },
    { id: 'users', text: '用户管理', icon: 'fa-users', type: 'main' },
    { id: 'settings', text: '系统设置', icon: 'fa-cog', type: 'main' },
    { id: 'guides', text: '使用指南', icon: 'fa-book', type: 'sub', parent: '文档中心' },
    { id: 'api', text: 'API文档', icon: 'fa-code', type: 'sub', parent: '文档中心' },
    { id: 'faq', text: '常见问题', icon: 'fa-question-circle', type: 'sub', parent: '文档中心' },
    { id: 'notifications', text: '消息通知', icon: 'fa-bell', type: 'main' },
    { id: 'calendar', text: '日程管理', icon: 'fa-calendar-alt', type: 'main' }
];

// 动态内容数据
const contentData = {
    dashboard: {
        title: "系统仪表板",
        subtitle: "概览系统运行状态和关键指标",
        content: `<p>欢迎使用高级导航系统的仪表板。这里是系统的控制中心，采用现代化设计，提供直观的数据可视化。</p>
                  <div class="content-highlight">
                      <strong>系统状态：</strong> 所有服务运行正常，响应时间保持在200ms以下。过去24小时新增用户243人，处理订单876个，系统负载稳定在45%。
                  </div>
                  <p>此界面采用了白色和浅蓝色基调，搭配微妙的动画效果，提供流畅的用户体验。</p>`,
        bgColor: "#ffffff",
        borderColor: "#2c7be5",
        features: [
            { icon: "fa-chart-line", title: "实时监控", desc: "查看系统实时运行状态和性能指标" },
            { icon: "fa-bell", title: "智能通知", desc: "接收系统通知和智能告警信息" },
            { icon: "fa-history", title: "操作日志", desc: "查看用户操作和系统事件记录" }
        ]
    },
    sales: {
        title: "销售数据分析",
        subtitle: "分析销售趋势和业绩表现",
        content: `<p>销售数据分析模块提供全面的数据洞察，采用现代化的可视化图表，帮助您快速理解销售趋势。</p>
                  <div class="content-highlight">
                      <strong>本月销售亮点：</strong> 本月销售额同比增长28%，新产品线贡献了42%的收入增长，客户回购率达到47%。移动端销售额首次超过桌面端。
                  </div>
                  <p>通过深入分析销售数据，您可以发现潜在的增长机会，优化产品组合，并制定更有效的销售策略。</p>`,
        bgColor: "#ffffff",
        borderColor: "#10b981",
        features: [
            { icon: "fa-trend-up", title: "趋势分析", desc: "查看销售额和销售量的长期趋势" },
            { icon: "fa-map-marker", title: "区域分布", desc: "分析不同地区的销售表现" },
            { icon: "fa-product-hunt", title: "产品分析", desc: "评估各产品的销售贡献和增长率" }
        ]
    },
    traffic: {
        title: "流量统计分析",
        subtitle: "监控和分析用户访问数据",
        content: `<p>流量统计模块提供详细的用户访问数据可视化，包括访问量、用户行为、流量来源等关键指标。</p>
                  <div class="content-highlight">
                      <strong>本周流量概况：</strong> 本周总访问量达到38.5万次，平均停留时间提升至5分12秒，移动端访问占比达到65%。社交媒体流量同比增长34%。
                  </div>
                  <p>通过分析流量数据，您可以了解用户行为模式，优化网站体验，并提高转化率。</p>`,
        bgColor: "#ffffff",
        borderColor: "#8b5cf6",
        features: [
            { icon: "fa-users", title: "用户画像", desc: "分析访问用户的特征和行为模式" },
            { icon: "fa-mouse-pointer", title: "交互热图", desc: "查看用户在页面上的点击和浏览热点" },
            { icon: "fa-share-alt", title: "来源分析", desc: "分析流量的来源渠道和效果" }
        ]
    },
    revenue: {
        title: "收入报告系统",
        subtitle: "查看收入数据和财务指标",
        content: `<p>收入报告模块提供详细的财务数据可视化，包括收入、利润、成本等关键财务指标。</p>
                  <div class="content-highlight">
                      <strong>季度财务摘要：</strong> 本季度总收入达到$2.8M，同比增长24%，净利润率为26%，运营成本控制在预算范围内。国际业务收入增长显著，达到45%。
                  </div>
                  <p>通过分析收入数据，您可以评估业务健康状况，优化资源分配，并制定财务计划。</p>`,
        bgColor: "#ffffff",
        borderColor: "#f59e0b",
        features: [
            { icon: "fa-chart-pie", title: "收入构成", desc: "分析各产品和服务的收入贡献" },
            { icon: "fa-calendar-alt", title: "周期对比", desc: "对比不同周期的收入表现" },
            { icon: "fa-percentage", title: "利润率分析", desc: "评估各项业务的盈利能力" }
        ]
    },
    users: {
        title: "用户管理系统",
        subtitle: "管理用户账户和权限设置",
        content: `<p>用户管理模块提供完整的用户账户管理功能，包括用户注册、权限分配、账户状态监控等。</p>
                  <div class="content-highlight">
                      <strong>用户统计：</strong> 系统当前共有12,847个注册用户，本月新增用户892人，活跃用户占比达到72%。用户满意度评分为4.7/5.0。
                  </div>
                  <p>通过用户管理功能，您可以控制用户访问权限，管理用户账户状态，并确保系统安全。</p>`,
        bgColor: "#ffffff",
        borderColor: "#ef4444",
        features: [
            { icon: "fa-user-plus", title: "用户注册", desc: "管理新用户注册流程和审核" },
            { icon: "fa-user-shield", title: "权限管理", desc: "设置和管理用户的系统访问权限" },
            { icon: "fa-user-check", title: "状态监控", desc: "监控用户活跃状态和账户安全" }
        ]
    },
    settings: {
        title: "系统设置中心",
        subtitle: "配置系统参数和个性化选项",
        content: `<p>系统设置模块允许您自定义系统行为，配置各项参数，以及设置个性化选项。</p>
                  <div class="content-highlight">
                      <strong>可配置选项：</strong> 系统提供超过60个可配置参数，包括通知设置、界面主题、数据保留策略、API密钥管理等。
                  </div>
                  <p>通过系统设置，您可以优化系统性能，个性化用户体验，并确保系统符合您的业务需求。</p>`,
        bgColor: "#ffffff",
        borderColor: "#6b7280",
        features: [
            { icon: "fa-palette", title: "界面定制", desc: "自定义系统界面颜色、主题和布局" },
            { icon: "fa-bell", title: "通知设置", desc: "配置系统通知的方式和频率" },
            { icon: "fa-database", title: "数据管理", desc: "设置数据备份、导出和保留策略" }
        ]
    }
};

// 动态标签数据池
const dynamicTabsPool = [
    { id: 'reports', text: '报表中心', icon: 'fa-file-alt', type: 'main' },
    { id: 'projects', text: '项目管理', icon: 'fa-project-diagram', type: 'main' },
    { id: 'messages', text: '消息中心', icon: 'fa-comments', type: 'main' },
    { id: 'tasks', text: '任务列表', icon: 'fa-tasks', type: 'main' },
    { id: 'analytics', text: '高级分析', icon: 'fa-chart-area', type: 'main' },
    { id: 'security', text: '安全中心', icon: 'fa-shield-alt', type: 'main' },
    { id: 'backup', text: '数据备份', icon: 'fa-hdd', type: 'main' },
    { id: 'integrations', text: '系统集成', icon: 'fa-plug', type: 'main' }
];

// 动态内容数据池
const dynamicContentPool = {
    reports: {
        title: "报表中心",
        subtitle: "生成和查看各类业务报表",
        content: `<p>报表中心模块提供丰富的报表生成和查看功能，支持自定义报表格式和数据源。</p>
                  <div class="content-highlight">
                      <strong>报表类型：</strong> 系统支持销售报表、财务报告、用户统计、运营分析等15种标准报表类型，支持自定义报表模板。
                  </div>
                  <p>您可以根据需要生成定期报表，设置自动发送，或将报表数据导出为PDF、Excel、CSV等多种格式。</p>`,
        bgColor: "#ffffff",
        borderColor: "#3b82f6",
        features: [
            { icon: "fa-file-pdf", title: "PDF导出", desc: "将报表导出为高质量的PDF文档" },
            { icon: "fa-file-excel", title: "Excel导出", desc: "将报表数据导出为Excel文件进行进一步分析" },
            { icon: "fa-clock", title: "定时发送", desc: "设置报表自动生成和发送计划" }
        ]
    },
    messages: {
        title: "消息中心",
        subtitle: "管理系统通知和个人消息",
        content: `<p>消息中心集中管理系统通知、个人消息和团队沟通，确保您不会错过重要信息。</p>
                  <div class="content-highlight">
                      <strong>智能分类：</strong> 系统消息分为通知、提醒、私信和公告四类，支持按优先级、类型和发送者智能过滤和排序。
                  </div>
                  <p>通过消息中心，您可以及时接收系统更新，与团队成员沟通，并管理所有消息历史记录。</p>`,
        bgColor: "#ffffff",
        borderColor: "#8b5cf6",
        features: [
            { icon: "fa-inbox", title: "收件箱", desc: "查看和管理所有接收到的消息" },
            { icon: "fa-paper-plane", title: "消息发送", desc: "向其他用户或群组发送消息" },
            { icon: "fa-filter", title: "智能过滤", desc: "按类型和优先级过滤消息" }
        ]
    },
    calendar: {
        title: "日程管理系统",
        subtitle: "管理个人和团队日程安排",
        content: `<p>日程管理模块帮助您高效管理个人和团队日程，设置提醒，协调会议时间。</p>
                  <div class="content-highlight">
                      <strong>协作功能：</strong> 支持团队日程共享，会议邀请，时间冲突检测，跨时区时间显示，以及与外部日历系统的集成。
                  </div>
                  <p>通过日程管理功能，您可以更好地规划工作时间，协调团队活动，提高工作效率。</p>`,
        bgColor: "#ffffff",
        borderColor: "#10b981",
        features: [
            { icon: "fa-user-friends", title: "团队协作", desc: "共享日程并与团队成员协调" },
            { icon: "fa-bell", title: "智能提醒", desc: "设置多种提醒方式和时间" },
            { icon: "fa-sync", title: "日历同步", desc: "与其他日历应用同步日程安排" }
        ]
    }
};

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
        loadGmProjectModule();
    });

    // 用户管理
    const navLinkUsers = document.getElementById('navLinkUsers');
    navLinkUsers.addEventListener('click', function() {
        loadUserMangementModule();
    });

    // 权限管理
    const navLinkPermission = document.getElementById('navLinkPermission');
    navLinkPermission.addEventListener('click', function() {
        loadPermissionModule();
    });
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
            loadGmOrderProjectBriefModule(submenu);
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
    const data = contentData[contentId] || dynamicContentPool[contentId];
    
    if (!data) {
        showDefaultContent();
        return;
    }
    
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