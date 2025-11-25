// 删除gm命令
function postDelGmOrder(projectId, orderId) {
    var delGmOrderReq = {
        ProjectId: Number(projectId),
        OrderId: Number(orderId),
    }
    fetch('/api/gm_order_del', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(delGmOrderReq)
    })
    .then(response => {
      return response.json().then(data => {
        return data;
      });
    })
    .then((data) => {
      console.log('成功:', data);
      alert('命令删除成功');
      return;
    })
    .catch((error) => {
      console.error('错误:', error);
      alert('执行错误:', error);
    });
}
