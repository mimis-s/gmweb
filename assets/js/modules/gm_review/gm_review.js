// 读取数据

// import {apiClient} from "../../api/client.js";
// import {showToast} from "../../components/toast.js";
// import {loadHtml} from "../../api/client.js";
// import {gmOrderCardClass} from "../gm_order_table/table.js";
// import {createTabHomeSelectClass} from "../gm_tab_home/select";

import {apiClient, loadHtml} from "../../api/client.js";
import {showToast} from "../../components/toast.js";
// import {gmLogClass} from "../gm_log/log";

export function createGmReviewClass() {
    return {
        state: {
            stepDefinitions: [],
            approverDefinitions: [],
            messages: [],
            filter: {
                projectId: 0,
                startDate: '',
                endDate: ''
            },
        },

        async getReviewContainerBody() {
            return document.getElementById('gmReviewContainer');
        },

        // 创建步骤审批流程HTML
        async createStepsHTML(message) {
            let stepsHTML = '<div class="approval-process">';
            stepsHTML += '<div class="process-title">审批流程</div>';
            stepsHTML += '<div class="steps-container">';
            // 步骤 -> 0: 发起gm命令 1: 审核 2: 完成
            let stepIds = [0, 1, 2];
            let stepIdName = ["GM请求", "审核", "执行"];
            stepIds.forEach((stepId, index) => {
                const step = message.resultdata.find(s => s.stepid === stepId);
                let stepClass = "step";
                let stepStatusClass = "pending";
                if (step) {
                    if (step.status === 0) { // 成功
                        stepClass = "step completed";
                        stepStatusClass = "success"
                    } else if (step.status === 1) { // pending
                        stepClass = "step current";
                        stepStatusClass = "pending"
                    } else if (step.status === 2) { // 失败
                        stepClass = "step rejected";
                        stepStatusClass = "fail"
                    }
                }

                stepsHTML += `
                    <div class="${stepClass}" data-step-index="${stepId}" data-message-id="${message.id}">
                        <div class="step-dot">
                            ${stepId + 1}
                        </div>
                        <div class="step-number">${stepStatusClass}</div>
                        <div class="step-content">${stepIdName[index]}</div>
                    </div>
                `;
            });

            stepsHTML += '</div></div>';
            return stepsHTML;
        },

        // 创建气泡框HTML
        createBubbleHTML(step, stepIndex, messageId) {
            let stepDef = {
                name: "待审核",
                description: "",
                username: "",
                userid: 0,
                reviewtime: 0,
            }

            let statusText = "进行中";
            let statusClass = "pending";
            if (step) {
                stepDef.description = step.desc;
                stepDef.username = step.username;
                stepDef.userid = step.userid;
                stepDef.reviewtime = step.reviewtime;
                switch (step.stepid){
                    case 0:
                        stepDef.name = "发起GM命令";
                        stepDef.description = `${step.desc}`;
                        break;
                    case 1:
                        stepDef.name = "审核结果";
                        stepDef.description = `${step.desc}`;
                        break;
                    case 2:
                        stepDef.name = "执行结果";
                        stepDef.description = `${step.desc}`;
                        break;
                }
                switch (step.status) {
                    case 0: // 成功
                        statusText = "成功";
                        statusClass = "completed";
                        break;
                    case 1: // pending
                        statusText = "进行中";
                        statusClass = "pending";
                        break;
                    case 2: // 失败
                        statusText = "已完成";
                        statusClass = "rejected";
                        break;
                }
            }


            let bubbleHTML = `
                <div class="bubble-tooltip" id="bubble-${messageId}-${stepIndex}">
                    <div class="bubble-title">${stepDef ? stepDef.name : "未知步骤"}</div>
                    <div class="bubble-desc">${stepDef ? stepDef.description : ""}</div>
            `;

            if (stepDef.username) {
                bubbleHTML += `
                    <div><strong>审批人:</strong> ${stepDef.username} (${stepDef.userid})</div>
                `;
            } else {
                bubbleHTML += `
                    <div><strong>审批人:</strong> 待分配</div>
                `;
            }

            if (stepDef.reviewtime !== 0) {
                const reviewtime = new Date(Number(stepDef.reviewtime));
                const timeStr = new Date(reviewtime).toLocaleString('zh-CN');
                bubbleHTML += `
                    <div><strong>审批时间:</strong> ${timeStr}</div>
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

            let stepIds = [0, 1, 2];
            let stepIdName = ["GM请求", "审核", "执行"];
            stepIds.forEach((stepId, index) => {
                const step = message.resultdata.find(s => s.stepid === stepId);
                const stepEl = stepElements[index]
                // 创建气泡框
                const bubbleHTML =  this.createBubbleHTML(step, index, message.id);
                stepEl.insertAdjacentHTML('beforeend', bubbleHTML);

                const bubble = stepEl.querySelector('.bubble-tooltip');

                // 鼠标进入事件

                const stepDot = stepEl.querySelector('.step-dot')
                stepDot.addEventListener('mouseenter', () => {
                    bubble.classList.add('show');
                });

                // 鼠标离开事件
                stepDot.addEventListener('mouseleave', () => {
                    bubble.classList.remove('show');
                });
            });
        },

        // 创建消息元素
        async createMessageElement(message, messageElement) {
            // const messageElement = document.createElement('div');
            messageElement.className = `message ${message.nextstep !== 3 ? 'processed' : ''}`;
            messageElement.dataset.id = message.id;

            const messageStatus = message.resultdata.find(item => item.stepid === 1)

            // 根据状态创建不同的内容
            let actionContent = `
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
            if (messageStatus && messageStatus.desc === '同意') {
                actionContent = `
                    <div class="status-label approved">
                        <i class="fas fa-check-circle"></i>
                        已同意
                    </div>
                `;
            } else if (messageStatus && messageStatus.desc === '拒绝') {
                actionContent = `
                    <div class="status-label rejected">
                        <i class="fas fa-times-circle"></i>
                        已拒绝
                    </div>
                `;
            }

            // 创建步骤审批HTML
            const stepsHTML = await this.createStepsHTML(message);
            const startDate = new Date(Number(message.startdate));
            const startTimeStr = new Date(startDate).toLocaleString('zh-CN');
            messageElement.innerHTML = `
                <div class="message-header">
                    <div class="message-content">
                        <div class="message-text">${message.orderdesc}-${message.ordername}(${message.projectname})</div>
                        <div class="message-time">${startTimeStr}</div>
                    </div>
                    ${actionContent}
                </div>
                ${stepsHTML}
            `;

            // 为步骤圆点添加鼠标悬停事件
            await this.addStepHoverEvents(messageElement, message);

            // 如果是待处理消息，添加按钮事件监听器
            if (message.nextstep === 1) {
                const approveBtn = messageElement.querySelector('.btn-approve');
                const rejectBtn = messageElement.querySelector('.btn-reject');

                approveBtn.addEventListener('click', () => {this.handleAction(message.id, 'approve')});
                rejectBtn.addEventListener('click', () => {this.handleAction(message.id, 'reject')});
            }

            return messageElement;
        },

        // 渲染消息列表
        async renderMessages() {
            const reviewContainer = await this.getReviewContainerBody()
            const messagesContainer = reviewContainer.querySelector('#gmReviewMessagesContainer');
            messagesContainer.innerHTML = '';
            let startTimestamp = new Date(this.state.filter.startDate).getTime().toString();
            let endTimestamp = new Date(this.state.filter.endDate).getTime().toString();
            try {
                const getReviewAllReq = {
                    ProjectId: Number(this.state.filter.projectId),
                    StartTime: startTimestamp,    // 日期范围过滤
                    EndTime: endTimestamp,      // 日期范围过滤
                }
                console.debug("开始获取审核数据",getReviewAllReq)
                const response = await apiClient.getReviewAll(getReviewAllReq);
                this.state.messages = response.message.datas;

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
                    const messageElement = document.createElement('div');
                    this.createMessageElement(message,messageElement);
                    messagesContainer.appendChild(messageElement);
                });
            } catch (error) {
                this.state.error = error.message;
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
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

            let stepIds = [0, 1, 2];
            let stepIdName = ["GM请求", "审核", "执行"];
            stepIds.forEach((stepId, index) => {
                const step = message.resultdata.find(s => s.stepid === stepId);
                const stepEl = stepElements[index]
            // stepElements.forEach((stepEl, index) => {
            //     const step = message.steps[index];
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
            const reviewContainer = await this.getReviewContainerBody()
            const messagesContainer = reviewContainer.querySelector('#gmReviewMessagesContainer');
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
            const html = await loadHtml.gmLReview();
            const defaultContent = document.querySelector('.default-content');
            const dynamicContent = document.getElementById('dynamicContent');

            defaultContent.style.display = 'none';
            dynamicContent.style.display = 'block';
            dynamicContent.innerHTML = html;

            // 设置日期范围默认值
            const today = new Date().toISOString().split('T')[0];
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 1);
            const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

            dynamicContent.querySelector('#startDate').value = oneWeekAgoStr;
            dynamicContent.querySelector('#endDate').value = today;

            this.state.filter.startDate = oneWeekAgoStr;
            this.state.filter.endDate = today;

            await this.renderMessages();

            dynamicContent.querySelector('#queryForm').addEventListener('submit',(e) => {this.handleQuery(e)});

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
            // 添加进入动画
            dynamicContent.style.animation = 'fadeInUp 0.5s ease';
        },
        // 处理查询
        async handleQuery(e) {
            e.preventDefault();
            const reviewContainer = await this.getReviewContainerBody();
            const gmReviewQueryPanel = reviewContainer.querySelector('#gmReviewQueryPanel')

            // 获取查询条件
            this.state.filter.startDate = gmReviewQueryPanel.querySelector('#startDate').value;
            this.state.filter.endDate = gmReviewQueryPanel.querySelector('#endDate').value;
            this.state.filter.projectId = gmReviewQueryPanel.querySelector('#projectSelect').value;

            // 过滤和渲染
            await this.renderMessages();
        },

    };
}

export const gmReviewClass = createGmReviewClass();
