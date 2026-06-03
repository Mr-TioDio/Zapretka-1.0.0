document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginBtn = document.querySelector('.toggle-btn[data-toggle="login"]');
    const registerBtn = document.querySelector('.toggle-btn[data-toggle="register"]');

    function toggleAuthForms(formToShow) {
        if (formToShow === 'login') {
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            registerBtn.classList.remove('active');
            loginBtn.classList.add('active');
        } else {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            loginBtn.classList.remove('active');
            registerBtn.classList.add('active');
        }
    }

    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => toggleAuthForms(btn.dataset.toggle));
    });

    // Обработка регистрации
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm-password').value;

        if (password !== confirm) return alert('Пароли не совпадают!');

        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        alert(data.message);
        if (res.ok) toggleAuthForms('login');
    });

    // Обработка входа
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        alert(data.message);
        if (res.ok) window.location.reload(); // Перезагрузка для перехода в приложение
    });
});