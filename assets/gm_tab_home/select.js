function loadGmOrderProjectBriefModule(tabProject){
    var getGmProjectBriefInfoReq = {}
    fetch('/api/gm_projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(getGmProjectBriefInfoReq)
    })
    .then(response => {
        const nextPage = response.headers.get('next-page');
        if (nextPage != null) {
            window.location.href = nextPage;
        }
      return response.json().then(data => {
        return data;
      });
    })
    .then((data) => {
      console.log('成功获取所有项目:', data);
      data.message.datas.forEach(briefData => {
        const projectBriefBox = document.createElement("li");
        projectBriefBox.className = "submenu-item";
        projectBriefBox.innerHTML = `<a class="nav-link" data-content="sales" onclick="loadGmOrderModule(${briefData.projectid})"><span class="nav-text">${briefData.name}</span></a>`
        tabProject.appendChild(projectBriefBox);
      });
      tabProject.classList.toggle('show');
    })
    .catch((error) => {
      console.error('错误:', error);
        window.showToast(error.message, "error");
    });
}

function loadGmOrderModule(projectId){
    // setTimeout(function() {
        fetch('gm_order_box.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            const nextPage = response.headers.get('next-page');
            if (nextPage != null) {
                window.location.href = nextPage;
            }
            return response.text();
        })
        .then(html => {
            const defaultContent = document.querySelector('.default-content');
            const dynamicContent = document.getElementById('dynamicContent');

            defaultContent.style.display = 'none';
            dynamicContent.style.display = 'block';
        	dynamicContent.innerHTML = html;
    		loadGmOrderBoxEvent(dynamicContent, projectId); // box里面所有order的数据		
            
            // 添加进入动画
            dynamicContent.style.animation = 'fadeInUp 0.5s ease';
        })
        .catch(error => {
            console.error('加载 header.html 时出现问题:', error);
            window.showToast(error.message, "error");
        });
    // }, 100);
}

function loadGmProjectModule(){
    setTimeout(function() {
        fetch('gm_project_box.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            const nextPage = response.headers.get('next-page');
            if (nextPage != null) {
                window.location.href = nextPage;
            }
            return response.text();
        })
        .then(html => {
            const defaultContent = document.querySelector('.default-content');
            const dynamicContent = document.getElementById('dynamicContent');

            defaultContent.style.display = 'none';
            dynamicContent.style.display = 'block';            // newBox.innerHTML = html;
        	dynamicContent.innerHTML = html;
    		loadGmProjectBoxEvent(dynamicContent); // box里面所有order的数据		
            // 添加进入动画
            dynamicContent.style.animation = 'fadeInUp 0.5s ease';
        })
        .catch(error => {
            console.error('加载 header.html 时出现问题:', error);
            window.showToast(error.message, "error");
        });
    }, 100);
}

function loadUserMangementModule(){
    setTimeout(function() {
        fetch('gm_user_mangement.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            const nextPage = response.headers.get('next-page');
            if (nextPage != null) {
                window.location.href = nextPage;
            }
            return response.text();
        })
        .then(html => {
            const defaultContent = document.querySelector('.default-content');
            const dynamicContent = document.getElementById('dynamicContent');

            defaultContent.style.display = 'none';
            dynamicContent.style.display = 'block';            // newBox.innerHTML = html;
            dynamicContent.innerHTML = html;
    		loadUsersBoxEvent(dynamicContent); // box里面所有order的数据
        })
        .catch(error => {
            console.error('加载 header.html 时出现问题:', error);
            window.showToast(error.message, "error");
        });
    }, 100);
}


function loadPermissionModule(){
    setTimeout(function() {
        fetch('gm_permission.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            const nextPage = response.headers.get('next-page');
            if (nextPage != null) {
                window.location.href = nextPage;
            }
            return response.text();
        })
        .then(html => {
            const defaultContent = document.querySelector('.default-content');
            const dynamicContent = document.getElementById('dynamicContent');

            defaultContent.style.display = 'none';
            dynamicContent.style.display = 'block';            // newBox.innerHTML = html;

            dynamicContent.innerHTML = html;
            initPermissionBox(dynamicContent)
    		// loadUsersBoxEvent(gridWrapper); // box里面所有order的数据
        })
        .catch(error => {
            console.error('加载 header.html 时出现问题:', error);
            window.showToast(error.message, "error");
        });
    }, 100);
}

