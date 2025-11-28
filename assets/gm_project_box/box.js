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
      gmProjectBoxEvent(gridWrapper, data.message);    // 初始化所有卡片
      return;
    })
    .catch((error) => {
      console.error('错误:', error);
    });
}

function addGmProject() {

}

function closeAddProjectModal(){
  document.getElementById('projectAddModal').style.display = 'none';
}

function saveAddProjectModal(){
  const projectAddModal = document.getElementById('projectAddModal');
  const addName = projectAddModal.querySelector('#addName')
  const addDesc = projectAddModal.querySelector('#addDesc')
  const editIPPath = projectAddModal.querySelector('#editIPPath')

  const addGmProjectReq = {
    Name: addName.value,
    Desc: addDesc.value,
    GmAddr: editIPPath.value,
  }

  fetch('/api/gm_project_add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(addGmProjectReq)
  })
  .then(response => {
    return response.json().then(data => {
      return data;
    });
  })
  .then((data) => {
      console.log('成功添加项目:', data);
      document.getElementById('projectAddModal').style.display = 'none';
      const gridWrapper = document.getElementById('projectGridWrapper');
      const gmProjectBox = gridWrapper.querySelector('#gmProjectBox');
      loadGmProjectCard(gmProjectBox, data.message);
      alert('新增成功');
    return;
  })
  .catch((error) => {
      console.error('错误:', error);
      alert('修改失败');
  });
}

function gmProjectBoxEvent(newBox, data){
  loadGmProjectCard(newBox, data);    // 初始化所有卡片
  const projectAddModal = document.getElementById('projectAddModal');
  const gmProjectBoxAddBtn = newBox.querySelector('#gmProjectBoxAddBtn');

  // 打开模态框
  gmProjectBoxAddBtn.addEventListener('click', () => {
    projectAddModal.style.display = 'flex';
    console.debug("打开模态框");
  });
  
  // 点击模态框外部关闭
  projectAddModal.addEventListener('click', (e) => {
      if (e.target === projectAddModal) {
          projectAddModal.style.display = 'none';
      }
  });
}