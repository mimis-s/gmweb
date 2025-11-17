
function loadGmOrderBoxEvent() {
    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginReq)
    })
    .then(response => {
      const nextPage = response.headers.get('next-page');
      return response.json().then(data => {
        return { data, nextPage, response };
      });
    })
    .then(({ data, nextPage, response }) => {
      console.log('成功:', data);
      window.location.href = nextPage;
    })
    .catch((error) => {
      console.error('错误:', error);
    });
}
