// 读取数据
function loadGmProjectBoxEvent(gridWrapper) {
    var gmProjectBoxReq = {}
    fetch('/api/gm_project_box', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(gmProjectBoxReq)
    })
    .then(response => {
      return response.json().then(data => {
        return data;
      });
    })
    .then((data) => {
      console.log('成功拿到所有命令:', data);
      loadGmProjectCard(gridWrapper, data.message);    // 初始化所有卡片
      return;
    })
    .catch((error) => {
      console.error('错误:', error);
    });
}
