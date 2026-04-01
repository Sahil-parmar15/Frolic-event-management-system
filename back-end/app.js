require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const instituteRoutes = require('./routes/instituteRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const eventRoutes = require('./routes/eventRoutes');
const groupRoutes = require('./routes/groupRoutes');
const participantRoutes = require('./routes/participantRoutes');
const winnerRoutes = require('./routes/winnerRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/institutes', instituteRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/winners', winnerRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running'
    });
});

app.use(errorHandler);

module.exports = app;
