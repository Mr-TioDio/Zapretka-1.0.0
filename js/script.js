document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const authSection = document.getElementById('auth-section');
    const appMainSection = document.getElementById('app-main-section');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginBtn = document.querySelector('.toggle-btn[data-toggle="login"]');
    const registerBtn = document.querySelector('.toggle-btn[data-toggle="register"]');
    const skipAuthBtn = document.getElementById('skip-auth-btn');

    const chatList = document.getElementById('chat-list');
    // menuBtn (три линии) удален из JS, так как кнопка удалена из HTML
    const chatSearchBar = document.getElementById('chat-search-bar');
    const addFriendBtn = document.getElementById('add-friend-btn'); // Кнопка добавления друга

    const currentUserAvatar = document.getElementById('current-user-avatar');
    const currentUserDisplayName = document.getElementById('current-user-display-name');
    const profileSettingsBtn = document.getElementById('profile-settings-btn');

    const profileModal = document.getElementById('profile-modal');
    const closeModalBtnProfile = profileModal.querySelector('.close-modal-btn');
    const modalAvatar = document.getElementById('modal-avatar');
    const avatarUploadInput = document.getElementById('avatar-upload');
    const modalDisplayNameInput = document.getElementById('modal-display-name');
    const modalUsernameSpan = document.getElementById('modal-username');
    const saveProfileBtn = document.getElementById('save-profile-btn');

    const chatHeaderAvatar = document.getElementById('chat-header-avatar');
    const chatHeaderName = document.getElementById('chat-header-name'); // Здесь будет имя пользователя
    const chatHeaderStatus = document.getElementById('chat-header-status');
    const chatOptionsBtn = document.querySelector('.chat-options-btn'); // Три точки

    const messageArea = document.getElementById('message-area');
    const messageFileContainer = document.getElementById('message-file-upload');
    const messageFileLabel = document.querySelector('.attach-file-label');

    // Модальное окно добавления друга
    const addFriendModal = document.getElementById('add-friend-modal');
    const closeModalBtnAddFriend = addFriendModal.querySelector('.close-modal-btn');
    const friendNicknameInput = document.getElementById('friend-nickname');
    const friendStatusMessage = document.getElementById('friend-status-message');
    const addFriendSubmitBtn = document.getElementById('add-friend-submit-btn');
    const pendingFriendsList = document.getElementById('pending-friends-list'); // Список заявок

    // Контекстное меню для кнопки "три точки"
    const chatOptionsMenu = document.getElementById('chat-options-menu');
    const deleteFriendOption = document.getElementById('delete-friend-option');

    // --- Имитация данных ---
    let currentUser = {
        username: '',
        displayName: 'Пользователь Zapretka',
        avatarUrl: null,
        avatarColor: 'purple'
    };
    let currentChat = null; // Информация о текущем активном чате

    // --- Звуки (по умолчанию) ---
    let messageSendSound = new Audio('assets/sounds/send1.ogg');
    let messageNotificationSound = new Audio('assets/sounds/message1.ogg');

    // --- Функции ---

    // Переключение между секциями (авторизация/приложение)
    function showSection(sectionToShow) {
        if (sectionToShow === 'auth') {
            appMainSection.classList.add('hidden');
            authSection.classList.remove('hidden');
        } else if (sectionToShow === 'app') {
            authSection.classList.add('hidden');
            appMainSection.classList.remove('hidden');
            updateCurrentUserUI();
            activateFirstChatItem();
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

    // Обновление UI для текущего пользователя
    function updateCurrentUserUI() {
        currentUserAvatar.textContent = currentUser.displayName.charAt(0).toUpperCase();
        currentUserAvatar.className = `avatar user-profile-avatar ${currentUser.avatarColor}`;
        currentUserDisplayName.textContent = currentUser.displayName;

        if (currentUser.avatarUrl) {
            currentUserAvatar.style.backgroundImage = `url(${currentUser.avatarUrl})`;
            currentUserAvatar.style.backgroundColor = 'transparent';
        } else {
            currentUserAvatar.style.backgroundImage = 'none';
            currentUserAvatar.style.backgroundColor = `var(--primary-purple)`; // Цвет по умолчанию
        }
    }

    // Получение случайного цвета для аватара
    function getRandomAvatarColor() {
        const colors = ['purple', 'orange', 'yellow', 'green', 'teal'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Открытие/закрытие модального окна профиля
    function toggleProfileModal() {
        profileModal.classList.toggle('hidden');
    }

    // Открытие/закрытие модального окна добавления друга
    function toggleAddFriendModal() {
        addFriendModal.classList.toggle('hidden');
    }

    // Открытие/закрытие контекстного меню "три точки"
    function toggleOptionsMenu(event) {
        event.stopPropagation(); // Предотвращаем закрытие при клике на саму кнопку
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

    // Обработка входа
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;

        if (username && password) {
            currentUser.username = username;
            currentUser.displayName = username;
            currentUser.avatarColor = getRandomAvatarColor();
            showSection('app');
        } else {
            alert('Пожалуйста, введите никнейм и пароль.');
        }
    });

    // Обработка регистрации
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('register-username').value.trim();
        const displayName = document.getElementById('register-display-name').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (username.length < 3) { alert('Никнейм должен быть минимум 3 символа.'); return; }
        if (password.length < 6) { alert('Пароль должен быть минимум 6 символов.'); return; }
        if (password !== confirmPassword) { alert('Пароли не совпадают.'); return; }

        currentUser.username = username;
        currentUser.displayName = displayName || username; // Если имя не введено, используем ник
        currentUser.avatarColor = getRandomAvatarColor();
        showSection('app');
    });

    // Пропуск авторизации
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
        // Имитация загрузки аватара, если он есть
        if (currentUser.avatarUrl) {
            modalAvatar.style.backgroundImage = `url(${currentUser.avatarUrl})`;
            modalAvatar.style.backgroundColor = 'transparent';
        } else {
            modalAvatar.textContent = currentUser.displayName.charAt(0).toUpperCase();
            modalAvatar.className = `avatar large-avatar ${currentUser.avatarColor}`; // Устанавливаем цвет по умолчанию, если нет URL
        }
        toggleProfileModal();
    });

    // Закрытие модального окна профиля
    closeModalBtnProfile.addEventListener('click', toggleProfileModal);
    profileModal.addEventListener('click', (event) => {
        if (event.target === profileModal) {
            toggleProfileModal();
        }
    });

    // Сохранение изменений в профиле
    saveProfileBtn.addEventListener('click', () => {
        currentUser.displayName = modalDisplayNameInput.value.trim() || currentUser.displayName;
        // Здесь можно добавить логику для сохранения изменений, например, отправку на сервер
        updateCurrentUserUI(); // Обновляем UI в сайдбаре
        alert('Профиль обновлен!');
        toggleProfileModal();
    });

    // Кнопка "Добавить друга"
    addFriendBtn.addEventListener('click', toggleAddFriendModal);

    // Закрытие модального окна добавления друга
    closeModalBtnAddFriend.addEventListener('click', toggleAddFriendModal);
    addFriendModal.addEventListener('click', (event) => {
        if (event.target === addFriendModal) {
            toggleAddFriendModal();
        }
    });

    // Отправка заявки на добавление друга
    addFriendSubmitBtn.addEventListener('click', () => {
        const nickname = friendNicknameInput.value.trim();
        if (!nickname) {
            friendStatusMessage.textContent = 'Введите никнейм друга.';
            friendStatusMessage.className = 'status-message error';
            return;
        }
        // Имитация отправки заявки
        friendStatusMessage.textContent = `Заявка на добавление ${nickname} отправлена!`;
        friendStatusMessage.className = 'status-message success';
        friendNicknameInput.value = ''; // Очищаем поле ввода
        setTimeout(toggleAddFriendModal, 1500); // Закрываем модальное окно через 1.5 сек
    });

    // Кнопка "три точки" в чате
    chatOptionsBtn.addEventListener('click', toggleOptionsMenu);
    // Закрытие контекстного меню при клике вне его
    document.addEventListener('click', closeOptionsMenuOnClickOutside);

    // Опция "Удалить друга" в контекстном меню
    deleteFriendOption.addEventListener('click', () => {
        if (currentChat) {
            // Имитация удаления друга
            alert(`Друг ${chatHeaderName.textContent} будет удален.`);
            chatOptionsMenu.classList.add('hidden'); // Закрыть контекстное меню
        }
    });

    // Обработка отправки сообщения
    const messageInput = document.querySelector('.message-input');
    const sendBtn = document.querySelector('.send-btn');

    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    // Обработка загрузки файла
    messageFileLabel.addEventListener('click', () => {
        messageFileContainer.click();
    });

    messageFileContainer.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    displayImageMessage(e.target.result, 'sent');
                };
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('audio/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Здесь можно добавить отображение аудио сообщения, пока имитируем
                    const audioBlob = new Blob([e.target.result], { type: file.type });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    displayAudioMessage(audioUrl, 'sent');
                };
                reader.readAsArrayBuffer(file);
            } else {
                alert('Неподдерживаемый тип файла. Можно отправлять только изображения и аудио.');
            }
        }
    });

    // --- Добавление чатов (имитация) ---
    function addChatItem(chat) {
        const chatItem = document.createElement('div');
        chatItem.classList.add('chat-item');
        chatItem.dataset.chatId = chat.id;
        chatItem.innerHTML = `
            <div class="avatar ${chat.avatarClass}">${chat.initial}</div>
            <div class="chat-info">
                <div class="chat-name">${chat.name}</div>
                <div class="chat-message">
                    <i class="${chat.iconClass}"></i>
                    <span>${chat.lastMessage}</span>
                </div>
            </div>
            <div class="chat-time">${chat.time}</div>
            ${chat.messageCount > 0 ? `<div class="message-count">${chat.messageCount}</div>` : ''}
        `;
        chatList.appendChild(chatItem);

        chatItem.addEventListener('click', () => {
            document.querySelectorAll('.chat-item').forEach(chat => chat.classList.remove('active'));
            chatItem.classList.add('active');
            updateChatHeader(chatItem);
            currentChat = { id: chat.id, name: chat.name };
            loadMessagesForChat(currentChat.id);
        });
    }

    // --- Имитация начальных чатов (должно быть пустым по требованию) ---
    // addChatItem({ id: 'chat1', name: 'Иван Петров', avatarClass: 'orange', initial: 'И', iconClass: 'fas fa-camera', lastMessage: 'Привет!', time: '10:30', messageCount: 2 });
    // addChatItem({ id: 'chat2', name: 'Мария Сидорова', avatarClass: 'yellow', initial: 'М', iconClass: 'fas fa-link', lastMessage: 'Как дела?', time: '11:00', messageCount: 0 });
    // addChatItem({ id: 'chat3', name: 'Алексей Иванов', avatarClass: 'green', initial: 'А', iconClass: 'fas fa-microphone-alt', lastMessage: 'Скоро буду', time: '11:15', messageCount: 1 });

    // --- Открытие/Закрытие модального окна добавления друга ---
    // (Уже добавлено выше)

    // --- Обработка загрузки аватара пользователя ---
    avatarUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                currentUser.avatarUrl = e.target.result;
                modalAvatar.style.backgroundImage = `url(${e.target.result})`;
                modalAvatar.style.backgroundColor = 'transparent';
                modalAvatar.textContent = ''; // Очищаем текст, если он был
                modalAvatar.className = 'avatar large-avatar'; // Сбрасываем класс цвета
                updateCurrentUserUI(); // Обновляем аватар в сайдбаре
            };
            reader.readAsDataURL(file);
        }
    });

    // --- Переключение между формами входа и регистрации ---
    // (Уже добавлено выше)

    // --- Инициализация ---
    showSection('auth'); // Показываем секцию авторизации при загрузке

    // Добавление обработчика для кнопки "Пропустить"
    skipAuthBtn.addEventListener('click', () => {
        currentUser.username = 'Guest';
        currentUser.displayName = 'Гость';
        currentUser.avatarColor = getRandomAvatarColor();
        showSection('app');
    });

    // --- Дополнительные функции для UI ---
    // (например, для имитации сообщений, статусов и т.д.)
});


// --- Helper functions (для удобства) ---
function updateChatHeader(chatItem) {
    const avatarElement = chatItem.querySelector('.avatar');
    if (avatarElement) {
        const avatarClass = avatarElement.classList.contains('purple') ? 'purple' :
                            avatarElement.classList.contains('orange') ? 'orange' :
                            avatarElement.classList.contains('yellow') ? 'yellow' :
                            avatarElement.classList.contains('green') ? 'green' :
                            avatarElement.classList.contains('teal') ? 'teal' : 'purple'; // По умолчанию purple
        chatHeaderAvatar.className = `avatar-large ${avatarClass}`;
    } else {
        chatHeaderAvatar.className = 'avatar-large purple'; // Цвет по умолчанию, если аватар не найден
    }
    chatHeaderName.textContent = chatItem.querySelector('.chat-name').textContent;
    chatHeaderStatus.textContent = "online"; // Имитация статуса
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
    messageArea.innerHTML = '';
    const placeholderMessage = document.createElement('p');
    placeholderMessage.textContent = `Загрузка сообщений для чата ${chatId}...`;
    placeholderMessage.style.textAlign = 'center';
    placeholderMessage.style.marginTop = '50px';
    messageArea.appendChild(placeholderMessage);

    setTimeout(() => {
        messageArea.innerHTML = '<p style="text-align: center; margin-top: 50px;">Здесь будут сообщения чата.</p>';
    }, 500);
}

function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText && currentChat) {
        const newMessage = document.createElement('div');
        newMessage.classList.add('message', 'sent');

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.innerHTML = `<p>${messageText.replace(/\n/g, '<br>')}</p>`;

        const messageTime = document.createElement('div');
        messageTime.classList.add('message-time');
        const now = new Date();
        messageTime.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        const messageCheck = document.createElement('div');
        messageCheck.classList.add('message-check');
        messageCheck.innerHTML = '<i class="fas fa-check"></i>';

        newMessage.appendChild(messageContent);
        newMessage.appendChild(messageTime);
        newMessage.appendChild(messageCheck);

        messageArea.appendChild(newMessage);
        messageArea.scrollTop = messageArea.scrollHeight;
        messageInput.value = '';

        messageSendSound.play();
    } else if (!currentChat) {
        alert('Выберите чат для отправки сообщения.');
    }
}

function displayImageMessage(imageUrl, type = 'received') {
    const newMessage = document.createElement('div');
    newMessage.classList.add('message', type);

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    messageContent.innerHTML = `<img src="" alt="Image">`;

    const messageTime = document.createElement('div');
    messageTime.classList.add('message-time');
    const now = new Date();
    messageTime.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    newMessage.appendChild(messageContent);
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

function displayAudioMessage(audioUrl, type = 'received') {
    const newMessage = document.createElement('div');
    newMessage.classList.add('message', type);

    const messageAudio = document.createElement('div');
    messageAudio.classList.add('message-audio');
    messageAudio.innerHTML = `
        <button class="play-pause-btn"><i class="fas fa-play"></i></button>
        <div class="audio-wave"><svg width="120" height="20" viewBox="0 0 120 20"><path d="M0 10 C20 0, 40 20, 60 10 C80 0, 100 20, 120 10" stroke="#888" stroke-width="2" fill="none"/></svg></div>
        <div class="audio-duration">0:00</div>
    `;

    const messageTime = document.createElement('div');
    messageTime.classList.add('message-time');
    const now = new Date();
    messageTime.textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    newMessage.appendChild(messageAudio);
    newMessage.appendChild(messageTime);
    if (type === 'sent') {
        const messageCheck = document.createElement('div');
        messageCheck.classList.add('message-check');
        messageCheck.innerHTML = '<i class="fas fa-check"></i>';
        newMessage.appendChild(messageCheck);
    }

    messageArea.appendChild(newMessage);
    messageArea.scrollTop = messageArea.scrollHeight;

    // Имитация работы плеера
    const playPauseBtn = messageAudio.querySelector('.play-pause-btn');
    const audioDuration = messageAudio.querySelector('.audio-duration');
    const audio = new Audio(audioUrl);

    audio.addEventListener('timeupdate', () => {
        const currentTime = audio.currentTime;
        const duration = audio.duration;
        if (!isNaN(duration)) {
            const minutes = Math.floor(currentTime / 60);
            const seconds = Math.floor(currentTime % 60);
            audioDuration.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
        }
    });

    playPauseBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();~
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        } else {
            audio.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    });
}

// --- Добавление чатов (имитация) ---
function addChatItem(chat) {
    const chatItem = document.createElement('div');
    chatItem.classList.add('chat-item');
    chatItem.dataset.chatId = chat.id;
    chatItem.innerHTML = `
        <div class="avatar ${chat.avatarClass}">${chat.initial}</div>
        <div class="chat-info">
            <div class="chat-name">${chat.name}</div>
            <div class="chat-message">
                <i class="${chat.iconClass}"></i>
                <span>${chat.lastMessage}</span>
            </div>
        </div>
        <div class="chat-time">${chat.time}</div>
        ${chat.messageCount > 0 ? `<div class="message-count">${chat.messageCount}</div>` : ''}
    `;
    chatList.appendChild(chatItem);

    chatItem.addEventListener('click', () => {
        document.querySelectorAll('.chat-item').forEach(chat => chat.classList.remove('active'));
        chatItem.classList.add('active');
        updateChatHeader(chatItem);
        currentChat = { id: chat.id, name: chat.name };
        loadMessagesForChat(currentChat.id);
    });
}

// --- Имитация начальных чатов (должно быть пустым по требованию) ---
// addChatItem({ id: 'chat1', name: 'Иван Петров', avatarClass: 'orange', initial: 'И', iconClass: 'fas fa-camera', lastMessage: 'Привет!', time: '10:30', messageCount: 2 });
// addChatItem({ id: 'chat2', name: 'Мария Сидорова', avatarClass: 'yellow', initial: 'М', iconClass: 'fas fa-link', lastMessage: 'Как дела?', time: '11:00', messageCount: 0 });
// addChatItem({ id: 'chat3', name: 'Алексей Иванов', avatarClass: 'green', initial: 'А', iconClass: 'fas fa-microphone-alt', lastMessage: 'Скоро буду', time: '11:15', messageCount: 1 });

// --- Открытие/Закрытие модального окна добавления друга ---
// (Уже добавлено выше)

// --- Обработка загрузки аватара пользователя ---
avatarUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentUser.avatarUrl = e.target.result;
            modalAvatar.style.backgroundImage = `url(${e.target.result})`;
            modalAvatar.style.backgroundColor = 'transparent';
            modalAvatar.textContent = ''; // Очищаем текст, если он был
            modalAvatar.className = 'avatar large-avatar'; // Сбрасываем класс цвета
            updateCurrentUserUI(); // Обновляем UI в сайдбаре
        };
        reader.readAsDataURL(file);
    }
});

// --- Переключение между формами входа и регистрации ---
// (Уже добавлено выше)

// --- Инициализация ---
showSection('auth'); // Показываем секцию авторизации при загрузке

// Добавление обработчика для кнопки "Пропустить"
skipAuthBtn.addEventListener('click', () => {
    currentUser.username = 'Guest';
    currentUser.displayName = 'Гость';
    currentUser.avatarColor = getRandomAvatarColor();
    showSection('app');
});

// --- Дополнительные функции для UI ---
// (например, для имитации сообщений, статусов и т.д.)