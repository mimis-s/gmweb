function gmOrderCardEvent() {
    // 获取DOM元素
    const triggerBtn = document.getElementById('triggerBtn');
    const modalOverlay = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('closeBtn');
    const likeBtn = document.getElementById('likeBtn');
    const dislikeBtn = document.getElementById('dislikeBtn');
    const favoriteBtn = document.getElementById('favoriteBtn');
    
    const likeCount = document.getElementById('likeCount');
    const dislikeCount = document.getElementById('dislikeCount');
    const favoriteCount = document.getElementById('favoriteCount');
    
    // 初始化计数器
    let likeCounter = 0;
    let dislikeCounter = 0;
    let favoriteCounter = 0;
    
    // 打开模态框
    triggerBtn.addEventListener('click', () => {
        modalOverlay.classList.add('active');
        console.debug("打开模态框");
    });
    
    // 关闭模态框
    closeBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });
    
    // 点击模态框外部关闭
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    });
    
    // 点赞功能
    likeBtn.addEventListener('click', () => {
        likeBtn.classList.toggle('active');
        if (likeBtn.classList.contains('active')) {
            likeCounter++;
        } else {
            likeCounter--;
        }
        likeCount.textContent = likeCounter;
    });
    
    // 喝倒彩功能
    dislikeBtn.addEventListener('click', () => {
        dislikeBtn.classList.toggle('active');
        if (dislikeBtn.classList.contains('active')) {
            dislikeCounter++;
        } else {
            dislikeCounter--;
        }
        dislikeCount.textContent = dislikeCounter;
    });
    
    // 收藏功能
    favoriteBtn.addEventListener('click', () => {
        favoriteBtn.classList.toggle('active');
        if (favoriteBtn.classList.contains('active')) {
            favoriteCounter++;
        } else {
            favoriteCounter--;
        }
        favoriteCount.textContent = favoriteCounter;
    });
}