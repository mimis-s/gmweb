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
            const order = orderList[i];
            const newBox = document.createElement('div');
            newBox.className = "gm_order_card_layout"
		    newBox.innerHTML = html;
            const gmName = newBox.querySelector("#cardName");
            gmName.textContent = order.ordername;
            const gmModelName = newBox.querySelector("#modalOverlayName");
            gmModelName.textContent = order.ordername;
            const gmModelDesc = newBox.querySelector("#modalOverlayDesc");
            gmModelDesc.textContent = order.orderdesc;
            

            gridWrapper.appendChild(newBox);
            gmOrderCardEvent(newBox); // 卡片事件
        }
    }).catch(error => {
        console.error('加载 gm_order_box.html 时出现问题:', error);
    });
}

function gmOrderCardEvent(newBox) {
    // 获取DOM元素
    const triggerBtn = newBox.querySelector('#triggerBtn');
    const modalOverlay = newBox.querySelector('#modalOverlay');
    const closeBtn = newBox.querySelector('#closeBtn');
    const likeBtn = newBox.querySelector('#likeBtn');
    const dislikeBtn = newBox.querySelector('#dislikeBtn');
    const favoriteBtn = newBox.querySelector('#favoriteBtn');
    
    const likeCount = newBox.querySelector('#likeCount');
    const dislikeCount = newBox.querySelector('#dislikeCount');
    const favoriteCount = newBox.querySelector('#favoriteCount');
    
    // 初始化计数器
    let likeCounter = 0;
    let dislikeCounter = 0;
    let favoriteCounter = 0;
    
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
    
    // 点赞功能
    likeBtn.addEventListener('click', () => {
        likeBtn.classList.toggle('active');
        if (likeBtn.classList.contains('active')) {
            likeCounter++;
        } else {
            likeCounter--;
        }
        likeCount.textContent = likeCounter;
    });
    
    // 喝倒彩功能
    dislikeBtn.addEventListener('click', () => {
        dislikeBtn.classList.toggle('active');
        if (dislikeBtn.classList.contains('active')) {
            dislikeCounter++;
        } else {
            dislikeCounter--;
        }
        dislikeCount.textContent = dislikeCounter;
    });
    
    // 收藏功能
    favoriteBtn.addEventListener('click', () => {
        favoriteBtn.classList.toggle('active');
        if (favoriteBtn.classList.contains('active')) {
            favoriteCounter++;
        } else {
            favoriteCounter--;
        }
        favoriteCount.textContent = favoriteCounter;
    });
}