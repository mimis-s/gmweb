// 读取card页面
function loadGmOrderCard(gridWrapper, gmOrderData){
  fetch('gm_order_card.html')
    .then(response => {
        if (!response.ok) {
            throw new Error('网络响应不正常');
        }
        return response.text();
    }).then(html => {
        const orderList = gmOrderData.datas;
        for (let i = 0; i < orderList.length; i++) {
            const order = orderList[i].gmorderdata;
            const lastrunargs = orderList[i].lastrunargs;
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
            gmOrderCardEvent(order,lastrunargs, newBox); // 卡片事件
        }
    }).catch(error => {
        console.error('加载 gm_order_box.html 时出现问题:', error);
    });
}

function gmOrderCardEvent(order,lastrunargs, newBox) {


    // 获取DOM元素
    const triggerBtn = newBox.querySelector('#triggerBtn');
    const modalOverlay = newBox.querySelector('#modalOverlay');
    const modalOverlayTip = newBox.querySelector('#modalOverlayTip');
    const closeBtn = newBox.querySelector('#closeBtn');
    const closeBtnTip = newBox.querySelector('#closeBtnTip');

    const sendBtn = newBox.querySelector('#sendBtn');
    const modalJsonArgs = newBox.querySelector('#modalJsonArgs');
    const lastrunargsObj = JSON.parse(lastrunargs);
    renderJSONForm(modalJsonArgs, lastrunargsObj);
    
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
        const sendData =  getFormData(modalJsonArgs)
        sendGmOrder(order.orderid, sendData, modalOverlayTip)
    });
}

// 发送gm命令给服务器
function sendGmOrder(orderid, sendData, modalOverlayTip){
  var sendGmOrderReq = {
    OrderId: Number(orderid),
    Msg: JSON.stringify(sendData)
  }
  fetch('/api/gm_order_send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendGmOrderReq)
    })
    .then(response => {
      return response.json().then(data => {
        return data;
      });
    })
    .then((data) => {
      if (data.success == true)
      {
          modalOverlayTip.classList.add('active');
          const retTitle = modalOverlayTip.querySelector('#modalOverlayTipTitle');
          retTitle.textContent = "发送成功💯 🥳"
      }else{
          const retTitle = modalOverlayTip.querySelector('#modalOverlayTipTitle');
          retTitle.textContent = "操作失败🤡 💩"
      }
      const retMsg = modalOverlayTip.querySelector('#modalOverlayTipShow');
      retMsg.textContent = JSON.stringify(data);
    })
    .catch((error) => {
      const retTitle = modalOverlayTip.querySelector('#modalOverlayTipTitle');
      retTitle.textContent = "操作失败🤡 💩"
      const retMsg = modalOverlayTip.querySelector('#modalOverlayTipShow');
      retMsg.textContent = error;
      console.error('错误:', error);
    });
}