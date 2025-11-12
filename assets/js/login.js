var worker;

// 跳转到注册界面
function TrunRegister() {
    window.parent.frames[0].location = "register";
}

function Login() {
    var userID = document.getElementById("input-username")
    var password = document.getElementById("input-password")
    if (userID.value == "") {
        return false;
    }
    var loginReq = {
        UserID: Number(userID.value),
        Password: password.value,
        remember: "on"
    }
    console.log("登录成功:" + String(JSON.stringify(loginReq)))

    // 登陆之后将页面改成home
    // window.parent.frames[0].location = "tab_home";
    // window.location.href = "/tab_home";
    // 要发送的数据
    
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

    // sendMessage(String(MESSAGE_ID.Login.req), JSON.stringify(payload))

    return false
}