(function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        window.location.replace('../pages/dashboard.html');
    }
})();
document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const loginError = document.getElementById('loginError');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid = true;

    email.classList.remove('input-error');
    password.classList.remove('input-error');
    loginError.innerText = '';

    if (!emailRegex.test(email.value.trim())) {
        email.classList.add('input-error');
        loginError.innerText = 'Email không hợp lệ';
        isValid = false;
    }
    if (!password.value.trim()) {
        password.classList.add('input-error');
        if (isValid) loginError.innerText = 'Vui lòng nhập mật khẩu';
        isValid = false;
    }

    if (!isValid) return;

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const userFound = users.find(u => u.email === email.value.trim() && u.password === password.value);

    if (userFound) {
        localStorage.setItem('currentUser', JSON.stringify(userFound));

        alert(`Đăng nhập thành công`);
        window.location.replace ('../pages/dashboard.html') ;
    } else {
        email.classList.add('input-error');
        password.classList.add('input-error');
        loginError.innerText = 'Email hoặc mật khẩu không chính xác';
    }
});
// if (localStorage.getItem("currentUser")) {
//     window.location.href = "../pages/dashboard.html";
// }
const emailInput = document.getElementById('email');
const passInput = document.getElementById('password');
const loginErrorMsg = document.getElementById('loginError');

function resetLoginStatus() {
    emailInput.classList.remove('input-error');
    passInput.classList.remove('input-error');
    loginErrorMsg.innerText = '';
}

emailInput.addEventListener('input', resetLoginStatus);
passInput.addEventListener('input', resetLoginStatus);