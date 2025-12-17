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
              newBox.className = "gm_card_layout"
              newBox.innerHTML = html;
              gridWrapper.appendChild(newBox);
              gmProjectCardEvent(gridWrapper, gmOrderData, newBox); // 卡片事件
      }).catch(error => {
          console.error('加载 gm_project_card.html 时出现问题:', error);
      });
}

function gmProjectCardEvent(gridWrapper, gmOrderData, newBox){
  const projectCard = newBox.querySelector('#projectCard');
  const projectTitle = newBox.querySelector('#projectTitle');
  const projectCardImage = newBox.querySelector('#projectCardImage');
  projectTitle.textContent = gmOrderData.name;
  projectCardImage.textContent = `${gmOrderData.name.substring(0, 2)}`;

  projectCard.value = gmOrderData.projectid;

  const projectCardBtn = newBox.querySelector('#projectCardBtn');
  const modalOverlay = newBox.querySelector('#modalOverlay');
  const closeBtn = newBox.querySelector('#closeBtn');
  const modalJsonArgs = newBox.querySelector('#modalJsonArgs'); // 表格存放区域

  const projectCardCloseBtn = newBox.querySelector('#projectCardCloseBtn'); 

  const projectEditModal = newBox.querySelector('#projectEditModal');
  const projectCardEditBtn = newBox.querySelector('#projectCardEditBtn');
  const projectEditModalCloseBtn = newBox.querySelector('#projectEditModalCloseBtn');
  const projectEditModalSaveBtn = newBox.querySelector('#projectEditModalSaveBtn');

  // 详情模态框
  projectCardBtn.addEventListener('click', () => {
    modalOverlay.classList.add('active');
    console.debug("命令详情模态框", gmOrderData);
    loadGmOrderTable(modalJsonArgs, gmOrderData);
  });
  closeBtn.addEventListener('click', () => {
      modalOverlay.classList.remove('active');
  });
  modalOverlay.addEventListener('click', (e) => {// 点击模态框外部关闭
      if (e.target === modalOverlay) {
          modalOverlay.classList.remove('active');
      }
  });

  // 修改模态框
  projectCardEditBtn.addEventListener('click', () => {
    console.debug("修改模态框", gmOrderData);
    projectEditModal.style.display = 'flex';
    projectEditModal.querySelector('#editName').value = gmOrderData.name;
    projectEditModal.querySelector('#editDesc').value = gmOrderData.desc;
    projectEditModal.querySelector('#editIPPath').value = gmOrderData.gmaddr;
  });
  // 保存数据
  projectEditModalSaveBtn.addEventListener('click', () => {
    saveEditProjectModal(gmOrderData)
  });
  // 关闭模态框
  projectEditModalCloseBtn.addEventListener('click', () => {
    projectEditModal.style.display = 'none';
  });
  
  // 点击模态框外部关闭
  projectEditModal.addEventListener('click', (e) => {
      if (e.target === projectEditModal) {
          projectEditModal.style.display = 'none';
      }
  });
  // 删除card/项目(包括项目里面的所有数据)
  projectCardCloseBtn.addEventListener('click', () => {
    // gridWrapper.removeChild(newBox);
    const delProjectDataReq = {
        ProjectId: Number(projectCard.value),
    }
    delEditProjectModal(delProjectDataReq, newBox, gridWrapper)
  });
}

function saveEditProjectModal(gmOrderData){
  const projectEditModal = document.getElementById('projectEditModal');
  const editProjectDataReq = {
      ProjectId: Number(gmOrderData.projectid),
      Name: projectEditModal.querySelector('#editName').value,
      Desc: projectEditModal.querySelector('#editDesc').value,
      GmAddr: projectEditModal.querySelector('#editIPPath').value,
  }
  fetch('/api/gm_project_modify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(editProjectDataReq)
  })
  .then(response => {
    return response.json().then(data => {
      return data;
    });
  })
  .then((data) => {
    console.log('修改项目成功:', data);
    const projectCard = document.getElementById('projectCard');
    const projectTitle = projectCard.querySelector('#projectTitle');
    const projectCardImage = projectCard.querySelector('#projectCardImage');
    projectTitle.textContent = data.message.name;
    projectCardImage.textContent = data.message.name.substring(0, 2);

    gmOrderData.name = data.message.name;
    gmOrderData.desc = data.message.desc;
    gmOrderData.gmaddr = data.message.gmaddr;
    projectEditModal.style.display = 'none';
    return;
  })
  .catch((error) => {
      console.error('错误:', error);
      alert('修改失败');
  });
}

function delEditProjectModal(delProjectDataReq, newBox, gridWrapper){
  fetch('/api/gm_project_del', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(delProjectDataReq)
  })
  .then(response => {
    return response.json().then(data => {
      return data;
    });
  })
  .then((data) => {
    console.log('删除项目成功:', data);
    gridWrapper.removeChild(newBox);
    return;
  })
  .catch((error) => {
      console.error('错误:', error);
      alert('修改失败');
  });
}