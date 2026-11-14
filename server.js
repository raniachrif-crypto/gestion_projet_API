
require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();

// نسمحو للـ API باش تفهم JSON
app.use(express.json());

// Routes d'authentification
app.use('/api/auth', authRoutes);

// Routes des projets
app.use('/api/projects', projectRoutes);

// Route de test
app.get('/', (req, res) => {
    res.send('API Gestion de Projets fonctionne !');
});

// Connexion à MongoDB
connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
