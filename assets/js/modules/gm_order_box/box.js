// 读取数据

import {apiClient} from "../../api/client.js";
import {showToast} from "../../components/toast.js";
// 导入业务模块
import {gmOrderCardClass} from '../gm_order_card/card.js';
export function createGmOrderBoxClass() {
   return {
        async loadGmOrderBoxEvent(gridWrapper, projectId) {
            try {
                const response = await apiClient.getGmOrders(Number(projectId));
                console.debug("获取项目数据", projectId, response)
                await gmOrderCardClass.loadGmOrderCard(gridWrapper, response.message);    // 初始化所有卡片
            } catch (error) {
                showToast(error.message || '获取 GM 命令失败', 'error');
                throw error;
            }
        },
    };
}

// 导出默认实例
export const gmOrderBoxClass = createGmOrderBoxClass();
