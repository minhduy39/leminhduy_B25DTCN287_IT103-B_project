(function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        window.location.replace('../pages/dashboard.html');
    }
})();
document.getElementById('registerForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const fullname = document.getElementById('fullname');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const passError = document.getElementById('passError');
    const confirmError = document.getElementById('confirmError');

    let isValid = true;

    [fullname, email, password, confirmPassword].forEach(input => {
        input.classList.remove('input-error');
    });
    [nameError, emailError, passError, confirmError].forEach(span => {
        span.innerText = '';
    });

    if (fullname.value.trim() === '') {
        nameError.innerText = 'Họ và tên không được để trống';
        fullname.classList.add('input-error');
        isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value.trim() === '') {
        emailError.innerText = 'Email không được để trống';
        email.classList.add('input-error');
        isValid = false;
    } else if (!emailRegex.test(email.value)) {
        emailError.innerText = 'Email phải đúng định dạng';
        email.classList.add('input-error');
        isValid = false;
    }

    if (password.value === '') {
        passError.innerText = 'Mật khẩu không được để trống';
        password.classList.add('input-error');
        isValid = false;
    } else if (password.value.length < 8) {
        passError.innerText = 'Mật khẩu phải có tối thiểu 8 ký tự';
        password.classList.add('input-error');
        isValid = false;
    }

    if (confirmPassword.value === '') {
        confirmError.innerText = 'Vui lòng xác nhận mật khẩu';
        confirmPassword.classList.add('input-error');
        isValid = false;
    } else if (confirmPassword.value !== password.value) {
        confirmError.innerText = 'Mật khẩu xác nhận phải trùng với mật khẩu';
        confirmPassword.classList.add('input-error');
        isValid = false;
    }

    if (isValid) {
        const users = JSON.parse(localStorage.getItem('users')) || [];

        if (users.find(u => u.email === email.value.trim())) {
            email.classList.add('input-error');
            document.getElementById('emailError').innerText = 'Email này đã được đăng ký';
            return;
        }

        const newUser = {
            id: users.length !== 0 ? users[users.length - 1].id + 1 : 1,
            fullname: fullname.value.trim(),
            email: email.value.trim(),
            password: password.value
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        localStorage.setItem('currentUser', JSON.stringify(newUser));

        alert('Đăng ký thành công!');

        window.location.replace('../pages/dashboard.html');
    }
});
// if (localStorage.getItem("currentUser")) {
//     window.location.href = "../pages/dashboard.html";
// }
function clearError(inputElement, errorElementId) {
    inputElement.classList.remove('input-error');
    const errorSpan = document.getElementById(errorElementId);
    if (errorSpan) {
        errorSpan.innerText = '';
    }
}

document.getElementById('fullname').addEventListener('input', function () {
    clearError(this, 'nameError');
});

document.getElementById('email').addEventListener('input', function () {
    clearError(this, 'emailError');
});

document.getElementById('password').addEventListener('input', function () {
    clearError(this, 'passError');
});

document.getElementById('confirmPassword').addEventListener('input', function () {
    clearError(this, 'confirmError');
});