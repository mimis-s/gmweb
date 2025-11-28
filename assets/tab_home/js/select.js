(function() {
	var menuEl = document.getElementById('ml-menu'),
		mlmenu = new MLMenu(menuEl, {
			backCtrl : false,
			onItemClick: loadDummyData
		});
	// mobile menu toggle
	var openMenuCtrl = document.querySelector('.action--open'),
		closeMenuCtrl = document.querySelector('.action--close');
	openMenuCtrl.addEventListener('click', openMenu);
	closeMenuCtrl.addEventListener('click', closeMenu);
	function openMenu() {
		classie.add(menuEl, 'menu--open');
	}
	function closeMenu() {
		classie.remove(menuEl, 'menu--open');
	}
	// simulate grid content loading
	var gridWrapper = document.querySelector('.content');
	function loadDummyData(ev, itemName) {
        ev.preventDefault();
        closeMenu();
        gridWrapper.innerHTML = `<p class="info" id="gridWrapper">GM管理平台欢迎你</p>`;
        // classie.add(gridWrapper, 'content--loading');
		if (itemName == "相当重要😨")
		{
			loadGmOrderModule(ev, gridWrapper, classie)
		}
		if (itemName == "项目管理")
		{
			loadGmProjectModule(ev, gridWrapper, classie)
		}
	}
})();

function loadGmOrderModule(ev, gridWrapper, classie){
    setTimeout(function() {
        fetch('gm_order_box.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.text();
        })
        .then(html => {
    		classie.remove(gridWrapper, 'content--loading');
    		// const newBox = document.createElement('div');
    		// newBox.innerHTML = html;
        	gridWrapper.innerHTML = html;
    		loadGmOrderBoxEvent(gridWrapper.querySelector('#gmOrderBox')); // box里面所有order的数据		
        })
        .catch(error => {
            console.error('加载 header.html 时出现问题:', error);
        });
    }, 100);
}

function loadGmProjectModule(ev, gridWrapper, classie){
    setTimeout(function() {
        fetch('gm_project_box.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('网络响应不正常');
            }
            return response.text();
        })
        .then(html => {
    		classie.remove(gridWrapper, 'content--loading');
    		// const newBox = document.createElement('div');
    		// newBox.innerHTML = html;
        	gridWrapper.innerHTML = html;
			gridWrapper.id = 'projectGridWrapper';
    		loadGmProjectBoxEvent(gridWrapper.querySelector('#gmProjectBox')); // box里面所有order的数据		
        })
        .catch(error => {
            console.error('加载 header.html 时出现问题:', error);
        });
    }, 100);
}
