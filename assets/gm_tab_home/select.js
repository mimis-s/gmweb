// (function() {
// 	var menuEl = document.getElementById('ml-menu'),
// 		mlmenu = new MLMenu(menuEl, {
// 			backCtrl : false,
// 			onItemClick: loadDummyData
// 		});
// 	// mobile menu toggle
// 	var openMenuCtrl = document.querySelector('.action--open'),
// 		closeMenuCtrl = document.querySelector('.action--close');
// 	openMenuCtrl.addEventListener('click', openMenu);
// 	closeMenuCtrl.addEventListener('click', closeMenu);
// 	function openMenu() {
// 		classie.add(menuEl, 'menu--open');
// 	}
// 	function closeMenu() {
// 		classie.remove(menuEl, 'menu--open');
// 	}

//     const projectBriefBox = ev.querySelector('#submenu2');
//     projectBriefBox.addEventListener('click', openMenu2);
//     function openMenu2() {
//         console.log("打开按钮", menuEl);

// 	}
// 	// simulate grid content loading
// 	var gridWrapper = document.querySelector('.content');
// 	function loadDummyData(ev, itemName) {
//         console.log("点击按钮", itemName);
//         ev.preventDefault();
//         closeMenu();
//         gridWrapper.innerHTML = `<p class="info" id="gridWrapper">GM管理平台欢迎你</p>`;
//         // classie.add(gridWrapper, 'content--loading');
// 		if (itemName == "GM操作")
// 		{
//             //动态添加项目
// 			loadGmOrderProjectBriefModule(ev, gridWrapper, classie)
// 		}
// 		if (itemName == "项目管理")
// 		{
// 			loadGmProjectModule(ev, gridWrapper, classie)
// 		}
// 		if (itemName == "用户管理")
// 		{
// 			loadUserMangementModule(ev, gridWrapper, classie)
// 		}
// 		if (itemName == "权限管理")
// 		{
// 			loadPermissionModule(ev, gridWrapper, classie)
// 		}
// 	}
// })();

function loadGmOrderProjectBriefModule(tabProject){
    console.log("点击gm操作")
    var getGmProjectBriefInfoReq = {}
    fetch('/api/gm_projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(getGmProjectBriefInfoReq)
    })
    .then(response => {
      return response.json().then(data => {
        return data;
      });
    })
    .then((data) => {
      console.log('成功获取所有项目:', data);
      data.message.datas.forEach(briefData => {
        const projectBriefBox = document.createElement("li");
        projectBriefBox.className = "submenu-item";
        projectBriefBox.innerHTML = `<a class="nav-link" data-content="sales" onclick="loadGmOrderModule(${briefData.projectid})">
        <span class="nav-text">${briefData.name}</span>`
        
        tabProject.appendChild(projectBriefBox);
        tabProject.classList.toggle('show');
      });

      return;
    })
    .catch((error) => {
      console.error('错误:', error);
    });
}

function loadGmOrderModule(projectId){
    setTimeout(function() {
        fetch('gm_order_box.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
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
        });
    }, 100);
}

function loadGmProjectModule(){
    setTimeout(function() {
        fetch('gm_project_box.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
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
        });
    }, 100);
}

