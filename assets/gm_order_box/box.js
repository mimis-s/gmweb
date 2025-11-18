// 读取数据
function loadGmOrderBoxEvent(gridWrapper) {
    var gmOrderBoxReq = {
        ProjectId: Number(1),
    }
    fetch('/api/gm_order_box', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gmOrderBoxReq)
    })
    .then(response => {
      return response.json().then(data => {
        return data;
      });
    })
    .then((data) => {
      console.log('成功:', data);
      loadGmOrderCard(gridWrapper, data.message);    // 初始化所有卡片
      return;
    })
    .catch((error) => {
      console.error('错误:', error);
    });
}
