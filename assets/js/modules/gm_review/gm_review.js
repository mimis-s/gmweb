// 读取数据

import {apiClient} from "../../api/client.js";
import {showToast} from "../../components/toast.js";
import {loadHtml} from "../../api/client.js";
import {gmOrderCardClass} from "../gm_order_table/table.js";

export function createGmReviewClass() {
    return {
        state: {
            stepDefinitions: [],
            approverDefinitions: [],
            messages: []
        },


        // // 步骤定义
        // const stepDefinitions = [
        // { id: 1, name: "提交申请", description: "申请人提交申请材料，填写申请表并上传相关附件" },
        // { id: 2, name: "部门审批", description: "部门负责人审核申请内容，确认是否符合部门规定" },
        // { id: 3, name: "财务审核", description: "财务部门审核预算、费用等财务相关事项" },
        // { id: 4, name: "分管领导", description: "分管领导审批，确认是否符合公司整体规划" },
        // { id: 5, name: "最终批准", description: "最终审批人批准，完成整个审批流程" }
        // ];

        // 审批人定义
        // const approverDefinitions = [
        // { id: 1, name: "张三", role: "申请人" },
        // { id: 2, name: "李四", role: "部门经理" },
        // { id: 3, name: "王五", role: "财务主管" },
        // { id: 4, name: "赵六", role: "分管副总" },
        // { id: 5, name: "孙七", role: "总经理" }
        // ];
        //
        // // 初始消息数据
        // const initialMessages = [
        // {
        //     id: 1,
        //     text: "采购服务器申请",
        //     time: "2023-10-05 09:30",
        //     type: "purchase_request",
        //     status: "in-progress", // pending, in-progress, approved, rejected
        //     currentStep: 2, // 当前步骤索引（从0开始）
        //     steps: [
        // { status: "completed", stepId: 1, approverId: 1, approveTime: "2023-10-05 09:45" },
        // { status: "completed", stepId: 2, approverId: 2, approveTime: "2023-10-05 10:30" },
        // { status: "current", stepId: 3, approverId: null, approveTime: null },
        // { status: "pending", stepId: 4, approverId: null, approveTime: null },
        // { status: "pending", stepId: 5, approverId: null, approveTime: null }
        //     ]
        // }
        // ];

        // // 存储当前消息
        // let messages = [...initialMessages];
        // let messageIdCounter = 6;
        //
        // // 处理统计信息
        // let totalCount = 5;
        // let processedCount = 1; // 有一个已处理
        // let pendingCount = 4;   // 有四个待处理
        async getReviewMessagesContainerBody() {
            return document.getElementById('gmReviewMessagesContainer');
        },

        // DOM元素
        // const messagesContainer = document.getElementById('messages-container');

//     // 生成随机消息
//     async generateRandomMessage() {
//     const messageTypes = [
// {text: "新员工入职申请", type: "onboarding"},
// {text: "软件采购申请", type: "software_purchase"},
// {text: "出差申请", type: "business_trip"},
// {text: "培训申请", type: "training"},
// {text: "加班申请", type: "overtime"},
// {text: "报销申请", type: "expense_report"},
// {text: "权限申请", type: "permission_request"},
// {text: "项目立项申请", type: "project_initiation"}
//     ];
//
//     const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
//
//     // 生成当前时间
//     const now = new Date();
//     const timeStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
//
//     // 随机设置当前步骤
//     const currentStep = Math.floor(Math.random() * 3);
//
//     // 创建步骤状态数组
//     const steps = [];
//     for (let i = 0; i < stepDefinitions.length; i++) {
//     if (i < currentStep) {
//     // 随机选择一个审批人
//     const approverId = Math.floor(Math.random() * 5) + 1;
//     // 生成一个随机的审批时间
//     const approveTime = new Date(now.getTime() - (currentStep - i) * 3600000);
//     const approveTimeStr = `${approveTime.getFullYear()}-${(approveTime.getMonth()+1).toString().padStart(2, '0')}-${approveTime.getDate().toString().padStart(2, '0')} ${approveTime.getHours().toString().padStart(2, '0')}:${approveTime.getMinutes().toString().padStart(2, '0')}`;
//
//     steps.push({ status: "completed", stepId: i + 1, approverId: approverId, approveTime: approveTimeStr });
// } else if (i === currentStep) {
//     steps.push({ status: "current", stepId: i + 1, approverId: null, approveTime: null });
// } else {
//     steps.push({ status: "pending", stepId: i + 1, approverId: null, approveTime: null });
// }
// }
//
//     return {
//     id: messageIdCounter++,
//     text: randomType.text,
//     time: timeStr,
//     type: randomType.type,
//     status: "in-progress",
//     currentStep: currentStep,
//     steps: steps
// };
// }

        // 创建步骤审批流程HTML
        async createStepsHTML(steps, messageId) {
            let stepsHTML = '<div class="approval-process">';
            stepsHTML += '<div class="process-title">审批流程</div>';
            stepsHTML += '<div class="steps-container">';

            steps.forEach((step, index) => {
                const stepDef = this.state.stepDefinitions.find(s => s.id === step.stepId);
                let stepClass = "";

                if (step.status === "completed") {
                    stepClass = "step completed";
                } else if (step.status === "current") {
                    stepClass = "step current";
                } else if (step.status === "rejected") {
                    stepClass = "step rejected";
                } else {
                    stepClass = "step";
                }

                stepsHTML += `
                    <div class="${stepClass}" data-step-index="${index}" data-message-id="${messageId}">
                        <div class="step-dot">
                            ${index + 1}
                        </div>
                        <div class="step-number">步骤${index + 1}</div>
                        <div class="step-content">${stepDef ? stepDef.name : "未知步骤"}</div>
                    </div>
                `;
            });

            stepsHTML += '</div></div>';
            return stepsHTML;
        },

        // 创建气泡框HTML
        async createBubbleHTML(step, stepIndex, messageId) {
            const stepDef = this.state.stepDefinitions.find(s => s.id === step.stepId);
            const approver = step.approverId ? this.state.approverDefinitions.find(a => a.id === step.approverId) : null;

            let statusText = "";
            let statusClass = "";

            switch (step.status) {
                case "pending":
                    statusText = "待处理";
                    statusClass = "pending";
                    break;
                case "current":
                    statusText = "进行中";
                    statusClass = "current";
                    break;
                case "completed":
                    statusText = "已完成";
                    statusClass = "completed";
                    break;
                case "rejected":
                    statusText = "已拒绝";
                    statusClass = "rejected";
                    break;
            }

            let bubbleHTML = `
                <div class="bubble-tooltip" id="bubble-${messageId}-${stepIndex}">
                    <div class="bubble-title">${stepDef ? stepDef.name : "未知步骤"}</div>
                    <div class="bubble-desc">${stepDef ? stepDef.description : ""}</div>
            `;

            if (approver) {
                bubbleHTML += `
                    <div><strong>审批人:</strong> ${approver.name} (${approver.role})</div>
                `;
            } else {
                bubbleHTML += `
                    <div><strong>审批人:</strong> 待分配</div>
                `;
            }

            if (step.approveTime) {
                bubbleHTML += `
                    <div><strong>审批时间:</strong> ${step.approveTime}</div>
                `;
            }

            bubbleHTML += `
                    <div class="bubble-status ${statusClass}">${statusText}</div>
                </div>
            `;

            return bubbleHTML;
        },

        // 为步骤圆点添加鼠标事件
        async addStepHoverEvents(messageElement, message) {
            const stepElements = messageElement.querySelectorAll('.step');

            stepElements.forEach((stepEl, index) => {
                const step = message.steps[index];

                // 创建气泡框
                const bubbleHTML =  this.createBubbleHTML(step, index, message.id);
                stepEl.insertAdjacentHTML('beforeend', bubbleHTML);

                const bubble = stepEl.querySelector('.bubble-tooltip');

                // 鼠标进入事件
                stepEl.addEventListener('mouseenter', () => {
                    bubble.classList.add('show');
                });

                // 鼠标离开事件
                stepEl.addEventListener('mouseleave', () => {
                    bubble.classList.remove('show');
                });
            });
        },

        // 创建消息元素
        async createMessageElement(message) {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.status !== 'in-progress' ? 'processed' : ''}`;
            messageElement.dataset.id = message.id;

            // 根据状态创建不同的内容
            let actionContent = '';
            if (message.status === 'approved') {
                actionContent = `
                    <div class="status-label approved">
                        <i class="fas fa-check-circle"></i>
                        已同意
                    </div>
                `;
            } else if (message.status === 'rejected') {
                actionContent = `
                    <div class="status-label rejected">
                        <i class="fas fa-times-circle"></i>
                        已拒绝
                    </div>
                `;
            } else {
                actionContent = `
                    <div class="message-actions">
                        <button class="btn btn-approve">
                            <i class="fas fa-check-circle"></i>
                            同意
                        </button>
                        <button class="btn btn-reject">
                            <i class="fas fa-times-circle"></i>
                            拒绝
                        </button>
                    </div>
                `;
            }

            // 创建步骤审批HTML
            const stepsHTML = await this.createStepsHTML(message.steps, message.id);

            messageElement.innerHTML = `
                <div class="message-header">
                    <div class="message-content">
                        <div class="message-text">${message.text}</div>
                        <div class="message-time">${message.time}</div>
                    </div>
                    ${actionContent}
                </div>
                ${stepsHTML}
            `;

            // 为步骤圆点添加鼠标悬停事件
            await this.addStepHoverEvents(messageElement, message);

            // 如果是待处理消息，添加按钮事件监听器
            if (message.status === 'in-progress') {
                const approveBtn = messageElement.querySelector('.btn-approve');
                const rejectBtn = messageElement.querySelector('.btn-reject');

                approveBtn.addEventListener('click', () => {this.handleAction(message.id, 'approve')});
                rejectBtn.addEventListener('click', () => {this.handleAction(message.id, 'reject')});
            }

            return messageElement;
        },

        // 渲染消息列表
        async renderMessages() {
            const messagesContainer = await this.getReviewMessagesContainerBody()
            messagesContainer.innerHTML = '';

            if (this.state.messages.length === 0) {
                messagesContainer.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-inbox"></i>
                        </div>
                        <div class="empty-text">暂无待处理流程</div>
                    </div>
                `;
                return;
            }

            // 先显示已处理的消息
            const processedMessages = this.state.messages.filter(msg => msg.status !== 'in-progress');
            const pendingMessages = this.state.messages.filter(msg => msg.status === 'in-progress');

            // 先渲染待处理消息，再渲染已处理消息
            [...pendingMessages, ...processedMessages].forEach(message => {
                const messageElement = this.createMessageElement(message);
                messagesContainer.appendChild(messageElement);
            });
        },

        // 处理同意/拒绝操作
        async handleAction(messageId, action) {
            // 找到消息元素
            const messageElement = document.querySelector(`.message[data-id="${messageId}"]`);
            if (!messageElement) return;

            // 找到消息在数组中的索引
            const messageIndex = this.state.messages.findIndex(msg => msg.id === messageId);
            if (messageIndex === -1) return;

            const message = this.state.messages[messageIndex];

            if (action === 'approve') {
                // 同意操作：将当前步骤标记为已完成
                // 随机选择一个审批人
                const approverId = Math.floor(Math.random() * 5) + 1;
                // 生成当前时间作为审批时间
                const now = new Date();
                const approveTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                message.steps[message.currentStep].status = "completed";
                message.steps[message.currentStep].approverId = approverId;
                message.steps[message.currentStep].approveTime = approveTime;

                // 检查是否还有下一步
                if (message.currentStep < message.steps.length - 1) {
                    // 还有下一步，更新当前步骤
                    message.currentStep++;
                    message.steps[message.currentStep].status = "current";
                    message.status = "in-progress";

                    // 创建新的状态标签
                    const statusLabel = document.createElement('div');
                    statusLabel.className = 'status-label in-progress';
                    statusLabel.innerHTML = `
                        <i class="fas fa-spinner fa-pulse"></i>
                        进行中 (${message.currentStep + 1}/${message.steps.length})
                    `;

                    // 替换按钮容器
                    const actionsContainer = messageElement.querySelector('.message-actions');
                    actionsContainer.parentNode.replaceChild(statusLabel, actionsContainer);

                    // 更新步骤显示
                    const stepElements = messageElement.querySelectorAll('.step');
                    stepElements.forEach((stepEl, index) => {
                        stepEl.className = 'step';
                        if (index < message.currentStep) {
                            stepEl.classList.add('completed');
                        } else if (index === message.currentStep) {
                            stepEl.classList.add('current');
                        }
                    });

                    // 更新气泡框
                    await this.updateBubbleTooltips(messageElement, message);
                } else {
                    // 所有步骤已完成，整个流程通过
                    message.status = "approved";

                    // 创建已同意状态标签
                    const statusLabel = document.createElement('div');
                    statusLabel.className = 'status-label approved';
                    statusLabel.innerHTML = `
                        <i class="fas fa-check-circle"></i>
                        已同意
                    `;

                    // 替换按钮容器
                    const actionsContainer = messageElement.querySelector('.message-actions');
                    actionsContainer.parentNode.replaceChild(statusLabel, actionsContainer);

                    // 添加已处理样式
                    messageElement.classList.add('processed');

                    // 更新所有步骤显示为已完成
                    const stepElements = messageElement.querySelectorAll('.step');
                    stepElements.forEach(stepEl => {
                        stepEl.className = 'step completed';
                    });

                    // 更新气泡框
                    await this.updateBubbleTooltips(messageElement, message);
                }
            } else {
                // 拒绝操作：将当前步骤标记为已拒绝
                // 随机选择一个审批人
                const approverId = Math.floor(Math.random() * 5) + 1;
                // 生成当前时间作为审批时间
                const now = new Date();
                const approveTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

                message.steps[message.currentStep].status = "rejected";
                message.steps[message.currentStep].approverId = approverId;
                message.steps[message.currentStep].approveTime = approveTime;
                message.status = "rejected";

                // 创建已拒绝状态标签
                const statusLabel = document.createElement('div');
                statusLabel.className = 'status-label rejected';
                statusLabel.innerHTML = `
                    <i class="fas fa-times-circle"></i>
                    已拒绝
                `;

                // 替换按钮容器
                const actionsContainer = messageElement.querySelector('.message-actions');
                actionsContainer.parentNode.replaceChild(statusLabel, actionsContainer);

                // 添加已处理样式
                messageElement.classList.add('processed');

                // 更新步骤显示
                const stepElements = messageElement.querySelectorAll('.step');
                stepElements.forEach((stepEl, index) => {
                    stepEl.className = 'step';
                    if (index < message.currentStep) {
                        stepEl.classList.add('completed');
                    } else if (index === message.currentStep) {
                        stepEl.classList.add('rejected');
                    }
                });

                // 更新气泡框
                await this.updateBubbleTooltips(messageElement, message);
            }

            // 更新消息数组
            this.state.messages[messageIndex] = message;

            // 添加平滑动画效果
            messageElement.style.transition = 'all 0.5s ease';

            // 如果是已完成或已拒绝，重新排序消息
            if (message.status === 'approved' || message.status === 'rejected') {
                setTimeout(() => {
                    this.renderMessages();
                }, 500);
            }
        },

        // 更新气泡框内容
        async updateBubbleTooltips(messageElement, message) {
            const stepElements = messageElement.querySelectorAll('.step');

            stepElements.forEach((stepEl, index) => {
                const step = message.steps[index];
                const bubble = stepEl.querySelector('.bubble-tooltip');

                if (bubble) {
                    // 移除旧的气泡框
                    bubble.remove();
                }

                // 创建新的气泡框
                const bubbleHTML = this.createBubbleHTML(step, index, message.id);
                stepEl.insertAdjacentHTML('beforeend', bubbleHTML);

                const newBubble = stepEl.querySelector('.bubble-tooltip');

                // 重新绑定事件
                stepEl.addEventListener('mouseenter', () => {
                    newBubble.classList.add('show');
                });

                stepEl.addEventListener('mouseleave', () => {
                    newBubble.classList.remove('show');
                });
            });
        },

        // 添加新消息
        async addNewMessage() {
            // const newMessage = generateRandomMessage();
            // this.state.messages.push(newMessage);
            const messagesContainer = await this.getReviewMessagesContainerBody()

            // 如果当前显示空状态，先清空容器
            if (messagesContainer.querySelector('.empty-state')) {
                messagesContainer.innerHTML = '';
            }

            // 创建新消息元素并添加到容器顶部
            // const messageElement = await this.createMessageElement(newMessage);
            // messagesContainer.prepend(messageElement);
            //
            // // 添加入场动画
            // messageElement.style.opacity = '0';
            // messageElement.style.transform = 'translateY(20px)';
            //
            // setTimeout(() => {
            //     messageElement.style.transition = 'all 0.5s ease';
            //     messageElement.style.opacity = '1';
            //     messageElement.style.transform = 'translateY(0)';
            //
            //     // 动画完成后移除内联样式
            //     setTimeout(() => {
            //         messageElement.style.transition = '';
            //     }, 500);
            // }, 10);
        },

        // 初始化页面
        async loadReviewData() {
            await this.renderMessages();

            // 初始添加一些动画效果
            const messageElements = document.querySelectorAll('.message');
            messageElements.forEach((el, index) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    el.style.transition = 'all 0.5s ease';
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';

                    // 动画完成后移除内联样式
                    setTimeout(() => {
                        el.style.transition = '';
                    }, 500);
                }, index * 150);
            });
        },
    };
}
