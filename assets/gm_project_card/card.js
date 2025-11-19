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
            //   newBox.className = "gm_card_layout"
              newBox.innerHTML = html;
              gridWrapper.appendChild(newBox);
            //   gmOrderCardEvent(order, newBox); // 卡片事件
      }).catch(error => {
          console.error('加载 gm_project_card.html 时出现问题:', error);
      });
  }
  