// 读取card页面
function loadGmProjectCard(gridWrapper, gmOrderData){
    fetch('gm_project_card.html')
      .then(response => {
          if (!response.ok) {
              throw new Error('网络响应不正常');
          }
          return response.text();
      }).then(html => {
              const newBox = document.createElement('div');
              // newBox.className = "gm_card_layout"
              newBox.innerHTML = html;
              gridWrapper.appendChild(newBox);
              gmProjectCardEvent(gmOrderData, newBox); // 卡片事件
      }).catch(error => {
          console.error('加载 gm_project_card.html 时出现问题:', error);
      });
  }

function gmProjectCardEvent(gmOrderData, newBox){
  const projectCardBtn = newBox.querySelector('#projectCardBtn');
  const modalOverlay = newBox.querySelector('#modalOverlay');
  const closeBtn = newBox.querySelector('#closeBtn');
  const modalJsonArgs = newBox.querySelector('#modalJsonArgs'); // 表格存放区域

  // 打开模态框
  projectCardBtn.addEventListener('click', () => {
    modalOverlay.classList.add('active');
    console.debug("打开模态框");
    loadGmOrderTable(modalJsonArgs, gmOrderData);
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
}
  