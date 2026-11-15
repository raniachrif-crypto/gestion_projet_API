// نحملو les variables الموجودة في fichier .env
require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');

// نستوردو les routes متاع كل partie في المشروع
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

// ننشؤو application Express
const app = express();

// نسمحو للـ API باش تفهم les données اللي تجي بصيغة JSON
app.use(express.json());

// نربطو routes متاع authentification بالـ API
app.use('/api/auth', authRoutes);

// نربطو routes متاع gestion des projets
app.use('/api/projects', projectRoutes);

// نربطو routes متاع gestion des tâches
app.use('/api/tasks', taskRoutes);

// Route principale باش نتثبتو اللي الـ API تخدم
app.get('/', (req, res) => {
    res.send('API Gestion de Projets fonctionne !');
});

// نعملو connexion مع قاعدة البيانات MongoDB
connectDB();

// ناخذو رقم الـ Port من fichier .env
// كان موش موجود، نستعملو 3000
const PORT = process.env.PORT || 3000;

// نشغلو serveur Express
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
