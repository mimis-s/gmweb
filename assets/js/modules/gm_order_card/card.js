// 读取数据

import {apiClient} from "../../api/client.js";
import {showToast} from "../../components/toast.js";
import {loadHtml} from "../../api/client.js";

import {renderJSONForm,getFormData} from './gm_order_json_parse.js';


export function createGmOrderCardClass() {
    return {
        // 读取card页面
        async loadGmOrderCard(gridWrapper, gmOrderData) {
            try {
                const html = await loadHtml.gmOrderCard();
                for (let i = 0; i < gmOrderData.datas.length; i++) {
                    const order = gmOrderData.datas[i].gmorderdata;
                    const lastRunArgs = gmOrderData.datas[i].lastrunargs;
                    const newBox = document.createElement('div');
                    newBox.className = "gm_card_layout"
                    newBox.innerHTML = html;
                    const gmName = newBox.querySelector("#cardName");
                    gmName.textContent = order.ordername;
                    const gmModelName = newBox.querySelector("#modalOverlayName");
                    gmModelName.textContent = order.ordername;
                    const gmModelDesc = newBox.querySelector("#modalOverlayDesc");
                    gmModelDesc.textContent = order.orderdesc;
                    gridWrapper.appendChild(newBox);
                    await this.gmOrderCardEvent(order, lastRunArgs, newBox); // 卡片事件
                }
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
        },

        async gmOrderCardEvent(order, lastRunArgs, newBox) {
            // 获取DOM元素
            const triggerBtn = newBox.querySelector('#triggerBtn');
            const modalOverlay = newBox.querySelector('#modalOverlay');
            const modalOverlayTip = newBox.querySelector('#modalOverlayTip');
            const closeBtn = newBox.querySelector('#closeBtn');
            const closeBtnTip = newBox.querySelector('#closeBtnTip');

            const sendBtn = newBox.querySelector('#sendBtn');
            const modalJsonArgs = newBox.querySelector('#modalJsonArgs');
            renderJSONForm(modalJsonArgs, JSON.parse(lastRunArgs));

            // 打开模态框
            triggerBtn.addEventListener('click', () => {
                modalOverlay.classList.add('active');
                console.debug("打开模态框");
            });

            // 关闭模态框
            closeBtn.addEventListener('click', () => {
                modalOverlay.classList.remove('active');
            });

            // 点击模态框外部关闭
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    modalOverlay.classList.remove('active');
                }
            });

            // 关闭模态框
            closeBtnTip.addEventListener('click', () => {
                modalOverlayTip.classList.remove('active');
            });

            // 点击模态框外部关闭
            modalOverlayTip.addEventListener('click', (e) => {
                if (e.target === modalOverlayTip) {
                    modalOverlayTip.classList.remove('active');
                }
            });

            // 发送gm命令
            sendBtn.addEventListener('click', () => {
                const sendData = getFormData(modalJsonArgs)
                this.sendGmOrder(order.orderid, sendData, modalOverlayTip)
            });
        },

        // 发送gm命令给服务器
        async sendGmOrder(orderId, sendData, modalOverlayTip) {
            try {
                const response = await apiClient.sendGmOrder(Number(orderId), JSON.stringify(sendData));
                modalOverlayTip.classList.add('active');
                if (response.success) {
                    const retTitle = modalOverlayTip.querySelector('#modalOverlayTipTitle');
                    retTitle.textContent = "发送成功💯 🥳"
                } else {
                    const retTitle = modalOverlayTip.querySelector('#modalOverlayTipTitle');
                    retTitle.textContent = "操作失败🤡 💩"
                }
                const retMsg = modalOverlayTip.querySelector('#modalOverlayTipShow');
                retMsg.textContent = JSON.stringify(response, null, 2);
            } catch (error) {
                modalOverlayTip.classList.add('active');
                const retTitle = modalOverlayTip.querySelector('#modalOverlayTipTitle');
                retTitle.textContent = "操作失败🤡 💩"
                const retMsg = modalOverlayTip.querySelector('#modalOverlayTipShow');
                retMsg.textContent = error;
                throw error;
            }
        },
    };
}

// 导出默认实例
export const gmOrderCardClass = createGmOrderCardClass();
