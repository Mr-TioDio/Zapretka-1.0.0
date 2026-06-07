const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken'); // Для генерации токенов

// Загрузка переменных окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors()); // Разрешаем кросс-доменные запросы
app.use(express.json()); // Парсим JSON тела запросов
app.use(express.urlencoded({ extended: true })); // Для парсинга URL-encoded данных (если понадобится)

// --- Имитация базы данных ---
let users = []; // Массив для хранения пользователей (временное решение)
let nextUserId = 1;

// --- Конфигурация JWT ---
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'; // Секретный ключ для JWT

// --- API Маршруты ---

// Регистрация нового пользователя
app.post('/api/register', (req, res) => {
    const { username, displayName, password } = req.body;

    if (!username || !displayName || !password) {
        return res.status(400).json({ message: 'Все поля обязательны для заполнения!' });
    }

    if (username.length < 3) {
        return res.status(400).json({ message: 'Никнейм должен содержать минимум 3 символа.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ message: 'Пароль должен содержать минимум 6 символов.' });
    }

    // Проверяем, существует ли уже такой никнейм
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(409).json({ message: 'Этот никнейм уже занят.' });
    }

    // Создаем нового пользователя (в реальном приложении пароль будет хешироваться)
    const newUser = {
        id: nextUserId++,
        username,
        displayName,
        password, // ВНИМАНИЕ: Пароль хранится в открытом виде! Только для демонстрации.
        avatarUrl: null,
        avatarColor: ['purple', 'orange', 'yellow', 'green', 'teal'][Math.floor(Math.random() * 5)],
        friends: [],
        chats: []
    };
    users.push(newUser);
    console.log(`Пользователь зарегистрирован: ${username}`);
    res.status(201).json({ message: 'Регистрация прошла успешно!', user: { username: newUser.username, displayName: newUser.displayName } });
});

// Вход пользователя
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Никнейм и пароль обязательны!' });
    }

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        // Генерируем JWT токен
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '1h' } // Токен действителен 1 час
        );
        console.log(`Пользователь ${username} вошел. Токен: ${token}`);
        res.json({
            message: 'Вход выполнен успешно!',
            token,
            user: {
                username: user.username,
                displayName: user.displayName,
                avatarUrl: user.avatarUrl,
                avatarColor: user.avatarColor
            }
        });
    } else {
        res.status(401).json({ message: 'Неверный никнейм или пароль.' });
    }
});

// --- Middleware для аутентификации (для защищенных маршрутов) ---
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401); // Если токена нет

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("Ошибка верификации токена:", err.message);
            return res.sendStatus(403); // Ошибка верификации (неверный токен, истек)
        }
        req.user = user; // Добавляем информацию о пользователе в запрос
        next(); // Переходим к следующему обработчику
    });
}

// --- Защищенные маршруты (пример) ---

// Получение информации о текущем пользователе (по токену)
app.get('/api/profile', authenticateToken, (req, res) => {
    // Находим пользователя по ID из токена
    const user = users.find(u => u.id === req.user.userId);
    if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json({
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        avatarColor: user.avatarColor
    });
});

// TODO: Добавить остальные маршруты: друзья, чаты, сообщения, загрузка файлов и т.д.

// --- Статические файлы фронтенда (отдаются Nginx, не Node.js) ---
// Этот сервер отвечает только за API. Nginx настроен так, чтобы отдавать файлы из /public

// --- Запуск сервера ---
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`JWT Secret: ${JWT_SECRET}`);
});