// backend/server.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Загрузка переменных окружения из .env файла
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // Используем порт из .env или 3000 по умолчанию

// --- Middleware ---
// Разрешаем кросс-доменные запросы (важно для взаимодействия фронтенда и бэкенда)
app.use(cors());

// Парсим JSON тела запросов
app.use(express.json());

// --- Маршруты API ---
// Здесь будут ваши API-эндпоинты (регистрация, вход, друзья, сообщения и т.д.)

// Пример приветственного маршрута
app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Пример маршрута для регистрации (для демонстрации)
app.post('/api/register', (req, res) => {
    const { username, displayName, password } = req.body;
    console.log(`Received registration data: username=${username}, displayName=${displayName}`);
    // TODO: Реализовать логику регистрации (сохранение в БД, хеширование пароля и т.д.)
    res.status(201).json({ message: 'User registration simulated successfully!' });
});

// Пример маршрута для входа (для демонстрации)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Received login data: username=${username}`);
    // TODO: Реализовать логику входа (проверка данных в БД, генерация токена)
    res.json({ message: 'User login simulated successfully!', token: 'dummy_token_123' });
});

// --- Запуск сервера ---
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});