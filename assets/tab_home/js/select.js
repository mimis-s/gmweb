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
		classie.add(gridWrapper, 'content--loading');
		setTimeout(function() {
		    fetch('base_box.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应不正常');
                }
                return response.text();
            })
            .then(html => {
				classie.remove(gridWrapper, 'content--loading');
				const newBox = document.createElement('div');
				newBox.innerHTML = html;
		    	gridWrapper.appendChild(newBox);
				gmOrderCardEvent(); // 卡片事件
            })
            .catch(error => {
                console.error('加载 header.html 时出现问题:', error);
            });
		}, 100);
	}
})();