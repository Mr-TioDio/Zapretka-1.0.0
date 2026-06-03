const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Маршрут регистрации
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Никнейм и пароль обязательны!' });
    }
    console.log(`Регистрация пользователя: ${username}`);
    res.status(201).json({ message: `Пользователь ${username} успешно зарегистрирован!` });
});

// Маршрут входа
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Вход пользователя: ${username}`);
    res.json({ message: 'Вход успешен!', token: 'mock_token' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});