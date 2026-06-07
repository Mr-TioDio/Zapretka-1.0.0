document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const authSection = document.getElementById('auth-section');
    const appMainSection = document.getElementById('app-main-section');

    // Формы авторизации
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginBtn = document.querySelector('.toggle-btn[data-toggle="login"]');
    const registerBtn = document.querySelector('.toggle-btn[data-toggle="register"]');
    const skipAuthBtn = document.getElementById('skip-auth-btn'); // Кнопка "Пропустить"

    // Sidebar
    const chatList = document.getElementById('chat-list');
    const chatSearchBar = document.getElementById('chat-search-bar');
    const addFriendBtn = document.getElementById('add-friend-btn');
    const currentUserAvatar = document.getElementById('current-user-avatar');
    const currentUserDisplayName = document.getElementById('current-user-display-name');
    const profileSettingsBtn = document.getElementById('profile-settings-btn');

    // Модальное окно профиля
    const profileModal = document.getElementById('profile-modal');
    const closeModalBtnProfile = profileModal.querySelector('.close-modal-btn');
    const modalAvatar = document.getElementById('modal-avatar');
    const avatarUploadInput = document.getElementById('avatar-upload');
    const modalDisplayNameInput = document.getElementById('modal-display-name');
    const modalUsernameSpan = document.getElementById('modal-username');
    const saveProfileBtn = document.getElementById('save-profile-btn');

    // Chat Window
    const chatHeaderAvatar = document.getElementById('chat-header-avatar');
    const chatHeaderName = document.getElementById('chat-header-name');
    const chatHeaderStatus = document.getElementById('chat-header-status');
    const chatOptionsBtn = document.querySelector('.chat-options-btn');

    const messageArea = document.getElementById('message-area');
    const messageFileContainer = document.getElementById('message-file-upload');
    const messageFileLabel = document.querySelector('.attach-file-label');
    const messageInput = document.querySelector('.message-input');
    const sendBtn = document.querySelector('.send-btn');

    // Модальное окно добавления друга
    const addFriendModal = document.getElementById('add-friend-modal');
    const closeModalBtnAddFriend = addFriendModal.querySelector('.close-modal-btn');
    const friendNicknameInput = document.getElementById('friend-nickname');
    const friendStatusMessage = document.getElementById('friend-status-message');
    const addFriendSubmitBtn = document.getElementById('add-friend-submit-btn');
    const pendingFriendsList = document.getElementById('pending-friends-list');

    // Контекстное меню для кнопки "три точки"
    const chatOptionsMenu = document.getElementById('chat-options-menu');
    const deleteFriendOption = document.getElementById('delete-friend-option');

    // --- Пользовательские данные (для имитации) ---
    let currentUser = {
        username: '',
        displayName: '',
        avatarUrl: null,
        avatarColor: 'purple',
        token: null // Для хранения JWT токена
    };
    let currentChat = null; // Информация о текущем активном чате

    // --- Звуки (пока без пользовательской загрузки) ---
    // let messageSendSound = new Audio('assets/sounds/send1.ogg');
    // let messageNotificationSound = new Audio('assets/sounds/message1.ogg');

    // --- Вспомогательные функции ---

    // Переключение между секциями (авторизация/приложение)
    function showSection(sectionToShow) {
        if (sectionToShow === 'auth') {
            appMainSection.classList.add('hidden');
            authSection.classList.remove('hidden');
        } else if (sectionToShow === 'app') {
            authSection.classList.add('hidden');
            appMainSection.classList.remove('hidden');
            updateCurrentUserUI();
            activateFirstChatItem(); // Активируем первый чат, если он есть
        }
    }

    // Переключение между формами входа и регистрации
    function toggleAuthForms(formToShow) {
        if (formToShow === 'login') {
            registerForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            registerBtn.classList.remove('active');
            loginBtn.classList.add('active');
        } else if (formToShow === 'register') {
            loginForm.classList.add('hidden');
            registerForm.classList.remove('hidden');
            loginBtn.classList.remove('active');
            registerBtn.classList.add('active');
        }
    }

    // Обновление UI для текущего пользователя (аватар, имя)
    function updateCurrentUserUI() {
        currentUserAvatar.textContent = currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : '?';
        currentUserAvatar.className = `avatar user-profile-avatar ${currentUser.avatarColor}`;
        currentUserDisplayName.textContent = currentUser.displayName || 'Неизвестно';

        if (currentUser.avatarUrl) {
            currentUserAvatar.style.backgroundImage = `url(${currentUser.avatarUrl})`;
            currentUserAvatar.style.backgroundColor = 'transparent';
        } else {
            currentUserAvatar.style.backgroundImage = 'none';
            // Устанавливаем цвет по умолчанию, если нет URL
            currentUserAvatar.style.backgroundColor = `var(--primary-purple)`;
        }
    }

    // Получение случайного цвета для аватара
    function getRandomAvatarColor() {
        const colors = ['purple', 'orange', 'yellow', 'green', 'teal'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Открытие/закрытие модального окна профиля
    function toggleProfileModal() { profileModal.classList.toggle('hidden'); }
    // Открытие/закрытие модального окна добавления друга
    function toggleAddFriendModal() { addFriendModal.classList.toggle('hidden'); }
    // Открытие/закрытие контекстного меню "три точки"
    function toggleOptionsMenu(event) {
        event.stopPropagation();
        chatOptionsMenu.classList.toggle('hidden');
    }
    // Закрытие контекстного меню при клике вне его
    function closeOptionsMenuOnClickOutside(event) {
        if (chatOptionsMenu && !chatOptionsMenu.classList.contains('hidden') && !event.target.closest('.chat-controls')) {
            chatOptionsMenu.classList.add('hidden');
        }
    }

    // --- Обработчики событий ---

    // Переключение форм входа/регистрации
    document.querySelectorAll('.toggle-btn').forEach(button => {
        button.addEventListener('click', () => {
            toggleAuthForms(button.getAttribute('data-toggle'));
        });
    });

    // Обработка регистрации
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value.trim();
        const displayName = document.getElementById('register-display-name').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (!username || !displayName || !password || !confirmPassword) {
            alert('Пожалуйста, заполните все поля.');
            return;
        }
        if (username.length < 3) { alert('Никнейм должен быть минимум 3 символа.'); return; }
        if (password.length < 6) { alert('Пароль должен быть минимум 6 символов.'); return; }
        if (password !== confirmPassword) { alert('Пароли не совпадают.'); return; }

        try {
            const response = await fetch('/api/register', { // Отправка на бэкенд
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, displayName, password })
            });
            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                toggleAuthForms('login'); // Переключаемся на форму входа
            } else {
                alert('Ошибка регистрации: ' + (data.message || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('Ошибка сети при регистрации:', error);
            alert('Не удалось соединиться с сервером. Попробуйте позже.');
        }
    });

    // Обработка входа
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        if (!username || !password) {
            alert('Пожалуйста, введите никнейм и пароль.');
            return;
        }

        try {
            const response = await fetch('/api/login', { // Отправка на бэкенд
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                currentUser.token = data.token; // Сохраняем токен
                currentUser.username = data.user.username;
                currentUser.displayName = data.user.displayName;
                currentUser.avatarUrl = data.user.avatarUrl;
                currentUser.avatarColor = data.user.avatarColor;
                showSection('app'); // Переходим в главное приложение
            } else {
                alert('Ошибка входа: ' + (data.message || 'Неверный никнейм или пароль.'));
            }
        } catch (error) {
            console.error('Ошибка сети при входе:', error);
            alert('Не удалось соединиться с сервером. Попробуйте позже.');
        }
    });

    // Пропуск авторизации (для быстрого доступа)
    skipAuthBtn.addEventListener('click', () => {
        currentUser.username = 'Guest';
        currentUser.displayName = 'Гость';
        currentUser.avatarColor = getRandomAvatarColor();
        showSection('app');
    });

    // --- Обработчики для основного интерфейса ---

    // Открытие модального окна профиля
    profileSettingsBtn.addEventListener('click', () => {
        modalUsernameSpan.textContent = currentUser.username;
        modalDisplayNameInput.value = currentUser.displayName;
        if (currentUser.avatarUrl) {
            modalAvatar.style.backgroundImage = `url(${currentUser.avatarUrl})`;
            modalAvatar.style.backgroundColor = 'transparent';
            modalAvatar.textContent = '';
        } else {
            modalAvatar.textContent = currentUser.displayName.charAt(0).toUpperCase();
            modalAvatar.className = `avatar large-avatar ${currentUser.avatarColor}`;
        }
        toggleProfileModal();
    });

    // Закрытие модального окна профиля
    closeModalBtnProfile.addEventListener('click', toggleProfileModal);
    profileModal.addEventListener('click', (event) => { if (event.target === profileModal) toggleProfileModal(); });

    // Сохранение изменений в профиле
    saveProfileBtn.addEventListener('click', () => {
        currentUser.displayName = modalDisplayNameInput.value.trim() || currentUser.displayName;
        // TODO: Реализовать отправку изменений на сервер
        updateCurrentUserUI();
        alert('Профиль обновлен!');
        toggleProfileModal();
    });

    // Кнопка "Добавить друга"
    addFriendBtn.addEventListener('click', toggleAddFriendModal);
    closeModalBtnAddFriend.addEventListener('click', toggleAddFriendModal);
    addFriendModal.addEventListener('click', (event) => { if (event.target === addFriendModal) toggleAddFriendModal(); });

    // Отправка заявки на добавление друга (имитация)
    addFriendSubmitBtn.addEventListener('click', () => {
        const nickname = friendNicknameInput.value.trim();
        if (!nickname) {
            friendStatusMessage.textContent = 'Введите никнейм друга.';
            friendStatusMessage.className = 'status-message error';
            return;
        }
        // TODO: Реализовать отправку запроса на сервер
        friendStatusMessage.textContent = `Заявка на добавление ${nickname} отправлена!`;
        friendStatusMessage.className = 'status-message success';
        friendNicknameInput.value = '';
        setTimeout(toggleAddFriendModal, 1500);
    });

    // Кнопка "три точки" в чате
    chatOptionsBtn.addEventListener('click', toggleOptionsMenu);
    document.addEventListener('click', closeOptionsMenuOnClickOutside);

    // Опция "Удалить друга"
    deleteFriendOption.addEventListener('click', () => {
        if (currentChat) {
            // TODO: Реализовать удаление друга через API
            alert(`Удалить друга ${chatHeaderName.textContent}? (Функционал в разработке)`);
            chatOptionsMenu.classList.add('hidden');
        }
    });

    // --- Отправка сообщений ---
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') sendMessage();
    });

    // --- Загрузка файлов ---
    messageFileLabel.addEventListener('click', () => document.getElementById('message-file-upload').click());

    messageFileContainer.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // TODO: Реализовать отправку файла на сервер и его отображение
        const reader = new FileReader();
        reader.onload = (e) => {
            if (file.type.startsWith('image/')) {
                displayImageMessage(e.target.result, 'sent');
            } else if (file.type.startsWith('audio/')) {
                displayAudioMessage(e.target.result, 'sent');
            } else {
                alert('Неподдерживаемый тип файла.');
            }
        };
        reader.readAsDataURL(file); // Читаем как Data URL
    });

    // --- Работа со списком чатов (имитация) ---
    // TODO: Загружать список чатов с сервера после входа

    // --- Инициализация UI ---
    showSection('auth'); // Начинаем с экрана авторизации

    // --- Обработчик для кнопки "Пропустить" ---
    skipAuthBtn.addEventListener('click', () => {
        currentUser.username = 'Guest';
        currentUser.displayName = 'Гость';
        currentUser.avatarColor = getRandomAvatarColor();
        showSection('app'); // Переходим в приложение
    });
});

// --- Вспомогательные функции UI ---
function updateChatHeader(chatItem) {
    const avatarElement = chatItem.querySelector('.avatar');
    const avatarClass = avatarElement ? Array.from(avatarElement.classList).find(cls => ['purple', 'orange', 'yellow', 'green', 'teal'].includes(cls)) || 'purple' : 'purple';
    chatHeaderAvatar.className = `avatar-large ${avatarClass}`;
    chatHeaderName.textContent = chatItem.querySelector('.chat-name').textContent;
    chatHeaderStatus.textContent = "online"; // Имитация
    chatHeaderStatus.className = 'user-status online';
}

function activateFirstChatItem() {
    const firstChatItem = chatList.querySelector('.chat-item');
    if (firstChatItem) {
        document.querySelectorAll('.chat-item').forEach(chat => chat.classList.remove('active'));
        firstChatItem.classList.add('active');
        updateChatHeader(firstChatItem);
        currentChat = { id: firstChatItem.dataset.chatId, name: firstChatItem.querySelector('.chat-name').textContent };
        loadMessagesForChat(currentChat.id);
    } else {
        chatHeaderName.textContent = '';
        chatHeaderStatus.textContent = '';
        chatHeaderAvatar.className = 'avatar-large';
        messageArea.innerHTML = '<p style="text-align: center; margin-top: 50px;">Нет активных чатов. Начните новый диалог!</p>';
    }
}

function loadMessagesForChat(chatId) {
    messageArea.innerHTML = ''; // Очищаем область сообщений
    const placeholderMessage = document.createElement('p');
    placeholderMessage.textContent = `Загрузка сообщений для чата ${chatId}...`;
    placeholderMessage.style.textAlign = 'center';
    placeholderMessage.style.marginTop = '50px';
    messageArea.appendChild(placeholderMessage);

    // Имитация загрузки сообщений
    setTimeout(() => {
        messageArea.innerHTML = ''; // Очищаем плейсхолдер
        // TODO: Загрузить реальные сообщения с сервера
        const sampleMessages = [
            { text: 'Привет! Как дела?', type: 'received', time: '10:30', sender: { displayName: currentChat.name, avatarClass: 'orange' } },
            { text: 'Привет! Все хорошо, спасибо. У тебя?', type: 'sent', time: '10:31', sender: { displayName: currentUser.displayName, avatarClass: currentUser.avatarColor } },
            { text: 'Отлично!', type: 'received', time: '10:32', sender: { displayName: currentChat.name, avatarClass: 'orange' } },
        ];

        sampleMessages.forEach(msg => displayMessage(msg));

        if (sampleMessages.length === 0) {
            const noMessages = document.createElement('p');
            noMessages.textContent = 'Пока нет сообщений в этом чате.';
            noMessages.style.textAlign = 'center';
            noMessages.style.marginTop = '50px';
            messageArea.appendChild(noMessages);
        }
    }, 500); // Имитация задержки сети
}

// Функция для отображения сообщения (полученного или отправленного)
function displayMessage(messageData) {
    const newMessage = document.createElement('div');
    newMessage.classList.add('message', messageData.type); // 'received' или 'sent'

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.innerHTML = `<p>${messageData.text.replace(/\n/g, '<br>')}</p>`; // Заменяем переносы строк на <br>

    // Добавляем аватар отправителя
    const senderAvatar = document.createElement('div');
    senderAvatar.classList.add('avatar', 'message-avatar', messageData.sender.avatarClass || 'purple');
    senderAvatar.textContent = messageData.sender.displayName ? messageData.sender.displayName.charAt(0).toUpperCase() : '?';
    newMessage.appendChild(senderAvatar);

    // Добавляем сам контент сообщения
    newMessage.appendChild(messageContent);

    const messageTime = document.createElement('div');
    messageTime.classList.add('message-time');
    messageTime.textContent = messageData.time;
    newMessage.appendChild(messageTime);

    // Добавляем галочки для отправленных сообщений
    if (messageData.type === 'sent') {
        const messageCheck = document.createElement('div');
        messageCheck.classList.add('message-check');
        messageCheck.innerHTML = '<i class="fas fa-check-double"></i>'; // Две галочки для прочитанного
        newMessage.appendChild(messageCheck);
    }

    messageArea.appendChild(newMessage);
}

// Отправка сообщения (по кнопке или Enter)
function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText && currentChat) {
        // Имитация отправки сообщения на сервер
        const newMessageData = {
            text: messageText,
            type: 'sent',
            time: `\({new Date().getHours()}:\){String(new Date().getMinutes()).padStart(2, '0')}`,
            sender: { displayName: currentUser.displayName, avatarClass: currentUser.avatarColor }
        };
        displayMessage(newMessageData);
        messageInput.value = ''; // Очищаем поле ввода
        messageInput.focus(); // Возвращаем фокус на поле ввода

        // TODO: Отправить реальное сообщение на сервер
        // fetch('/api/chats/' + currentChat.id + '/messages', { ... })
    } else if (!currentChat) {
        alert('Выберите чат для отправки сообщения.');
    }
}

function displayImageMessage(imageUrl, type = 'received') {
    const newMessage = document.createElement('div');
    newMessage.classList.add('message', type);

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.innerHTML = `<img src="" alt="Image" class="chat-message-image">`; // Добавляем класс для стилизации

    // Добавляем аватар отправителя
    const senderAvatar = document.createElement('div');
    senderAvatar.classList.add('avatar', 'message-avatar', type === 'sent' ? currentUser.avatarColor : 'orange'); // Упрощенное назначение аватара
    senderAvatar.textContent = type === 'sent' ? currentUser.displayName.charAt(0).toUpperCase() : currentChat.name.charAt(0);
    newMessage.appendChild(senderAvatar);

    newMessage.appendChild(messageContent);

    const messageTime = document.createElement('div');
    messageTime.classList.add('message-time');
    messageTime.textContent = `\({new Date().getHours()}:\){String(new Date().getMinutes()).padStart(2, '0')}`;
    newMessage.appendChild(messageTime);

    if (type === 'sent') {
        const messageCheck = document.createElement('div');
        messageCheck.classList.add('message-check');
        messageCheck.innerHTML = '<i class="fas fa-check"></i>'; // Отправлено, но не прочитано
        newMessage.appendChild(messageCheck);
    }

    messageArea.appendChild(newMessage);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function displayAudioMessage(audioBlobUrl, type = 'received') {
    const newMessage = document.createElement('div');
    newMessage.classList.add('message', type);

    const messageAudio = document.createElement('div');
    messageAudio.classList.add('message-audio');
    messageAudio.innerHTML = `
        <button class="play-pause-btn"><i class="fas fa-play"></i></button>
        <div class="audio-wave">
            <svg width="120" height="20" viewBox="0 0 120 20">
                <path d="M0 10 C20 0, 40 20, 60 10 C80 20, 100 0, 120 10"></path>
            </svg>
        </div>
        <div class="audio-duration">0:45</div>
    `;

    const senderAvatar = document.createElement('div');
    senderAvatar.classList.add('avatar', 'message-avatar', type === 'sent' ? currentUser.avatarColor : 'orange');
    senderAvatar.textContent = type === 'sent' ? currentUser.displayName.charAt(0).toUpperCase() : currentChat.name.charAt(0);
    newMessage.appendChild(senderAvatar);

    newMessage.appendChild(messageAudio);

    const messageTime = document.createElement('div');
    messageTime.classList.add('message-time');
    messageTime.textContent = `\({new Date().getHours()}:\){String(new Date().getMinutes()).padStart(2, '0')}`;
    newMessage.appendChild(messageTime);

    if (type === 'sent') {
        const messageCheck = document.createElement('div');
        messageCheck.classList.add('message-check');
        messageCheck.innerHTML = '<i class="fas fa-check"></i>';
        newMessage.appendChild(messageCheck);
    }

    messageArea.appendChild(newMessage);
    messageArea.scrollTop = messageArea.scrollHeight;
}


// --- Инициализация ---
// Пока пустой, так как вся логика в DOMContentLoaded