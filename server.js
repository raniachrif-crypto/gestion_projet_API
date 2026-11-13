
require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const authMiddleware = require('./middlewares/authMiddleware');
const roleMiddleware = require('./middlewares/roleMiddleware');

const app = express();

// نسمحو للـ API باش تفهم JSON
app.use(express.json());

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Route de test
app.get('/', (req, res) => {
    res.send('API Gestion de Projets fonctionne !');
});




// Route accessible aux utilisateurs connectés
app.get('/api/test-protected', authMiddleware, (req, res) => {
    res.json({
        message: 'Accès autorisé !',
        utilisateur: req.user
    });
});

// Route accessible uniquement au manager
app.get('/api/test-manager', authMiddleware, roleMiddleware('manager'), (req, res) => {
    res.json({
        message: 'Bienvenue Manager !'
    });
});




// Connexion à MongoDB
connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
