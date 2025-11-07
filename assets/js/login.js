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
    var payload = {
        UserID: Number(userID.value),
        Password: password.value
    }
    console.log("登录成功:" + String(JSON.stringify(payload)))

    // 登陆之后将页面改成home
    // window.parent.frames[0].location = "tab_home";
    // window.location.href = "/tab_home";
    // 要发送的数据
    const data = {
      key1: 'value1',
      key2: 'value2'
    };
    
    fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
      console.log('成功:', data);
      const redirectUrl = response.headers.get('url');
      window.location.href = redirectUrl;
    })
    .catch((error) => {
      console.error('错误:', error);
    });

    // sendMessage(String(MESSAGE_ID.Login.req), JSON.stringify(payload))

    return false
}